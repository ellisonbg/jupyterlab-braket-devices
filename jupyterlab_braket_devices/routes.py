import json
import logging
from typing import Dict, Any, List

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from botocore.exceptions import ClientError, NoCredentialsError

from braket.aws import AwsDevice

# Set up logging
logger = logging.getLogger(__name__)


class DevicesRouteHandler(APIHandler):
    """
    Handler for Amazon Braket device operations.

    GET without query params: List all devices
    GET with ?deviceArn=<arn>: Get specific device details
    """

    # Class-level cache for device information (excluding status)
    _device_cache: Dict[str, Dict[str, Any]] = {}

    @tornado.web.authenticated
    def get(self):
        """
        Handle GET requests for Braket devices.

        Query params:
            deviceArn (optional): Device ARN to get specific device details
        """
        device_arn = self.get_argument('deviceArn', default=None)

        try:
            if device_arn:
                # Describe specific device
                device_info, warnings = self._get_device_info(device_arn)
                response = {
                    "status": "success",
                    "device": device_info
                }
                if warnings:
                    response["warnings"] = warnings
                self.finish(json.dumps(response))
            else:
                # List all devices
                devices, warnings = self._list_devices()
                response = {
                    "status": "success",
                    "devices": devices
                }
                if warnings:
                    response["warnings"] = warnings
                self.finish(json.dumps(response))
        except NoCredentialsError:
            # AWS credentials not configured
            logger.error("AWS credentials not configured", exc_info=True)
            self.set_status(401)
            self.finish(json.dumps({
                "status": "error",
                "type": "auth",
                "message": "AWS credentials not configured. Please configure your AWS credentials.",
                "details": "No credentials found in environment or credentials file."
            }))
        except ClientError as e:
            # AWS client errors (expired tokens, permission denied, etc.)
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            logger.error(f"AWS ClientError ({error_code}): {str(e)}", exc_info=True)

            if error_code in ['ExpiredToken', 'ExpiredTokenException']:
                self.set_status(401)
                self.finish(json.dumps({
                    "status": "error",
                    "type": "auth",
                    "message": "AWS credentials have expired. Please refresh your credentials.",
                    "details": str(e)
                }))
            elif error_code in ['AccessDenied', 'UnauthorizedOperation']:
                self.set_status(403)
                self.finish(json.dumps({
                    "status": "error",
                    "type": "permission",
                    "message": "Permission denied. Check your IAM policy for Braket access.",
                    "details": str(e)
                }))
            else:
                self.set_status(503)
                self.finish(json.dumps({
                    "status": "error",
                    "type": "server_error",
                    "message": f"AWS service error: {error_code}",
                    "details": str(e)
                }))
        except ValueError as e:
            # Malformed request
            logger.warning(f"Malformed request: {str(e)}")
            self.set_status(400)
            self.finish(json.dumps({
                "status": "error",
                "type": "validation",
                "message": str(e)
            }))
        except LookupError as e:
            # Device not found
            logger.warning(f"Device not found: {str(e)}")
            self.set_status(404)
            self.finish(json.dumps({
                "status": "error",
                "type": "not_found",
                "message": str(e)
            }))
        except Exception as e:
            # Unexpected error
            error_name = type(e).__name__
            logger.error(f"Unexpected error ({error_name}): {str(e)}", exc_info=True)
            self.set_status(500)
            self.finish(json.dumps({
                "status": "error",
                "type": "server_error",
                "message": f"An unexpected error occurred: {error_name}",
                "details": str(e)
            }))

    def _list_devices(self) -> tuple[list, List[str]]:
        """
        List all available Braket devices (excluding RETIRED devices).

        Returns:
            Tuple of (device list, warnings list)
        """
        warnings = []

        try:
            # Get all devices using Braket SDK, filtering for ONLINE and OFFLINE only
            devices = AwsDevice.get_devices(statuses=['ONLINE', 'OFFLINE'])
        except (NoCredentialsError, ClientError):
            # Re-raise auth errors to be handled at top level
            raise
        except Exception as e:
            # Log unexpected errors but don't fail completely
            error_msg = f"Error fetching device list: {type(e).__name__}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            warnings.append(error_msg)
            return [], warnings

        devices_info = []
        for device in devices:
            try:
                devices_info.append({
                    'deviceArn': device.arn,
                    'deviceName': device.name,
                    'deviceType': str(device.type),
                    'deviceStatus': device.status,
                    'providerName': device.provider_name
                })
            except Exception as e:
                # Skip this device but log warning
                warning_msg = f"Failed to process device {device.arn}: {str(e)}"
                logger.warning(warning_msg)
                warnings.append(warning_msg)

        return devices_info, warnings

    def _get_device_info(self, device_arn: str) -> tuple[Dict[str, Any], List[str]]:
        """
        Get detailed information for a specific device.
        Uses cache for static info, always fetches fresh status.

        Args:
            device_arn: Amazon Resource Name of the device

        Returns:
            Tuple of (device information, warnings list)

        Raises:
            ValueError: If device_arn is malformed
            LookupError: If device is not found
        """
        warnings = []

        if not device_arn or not device_arn.startswith('arn:aws:braket:'):
            raise ValueError(f"Invalid device ARN format: {device_arn}")

        try:
            device = AwsDevice(device_arn)
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == 'ResourceNotFoundException':
                raise LookupError(f"Device not found: {device_arn}. It may have been retired.")
            # Re-raise other client errors to be handled at top level
            raise
        except Exception as e:
            logger.error(f"Error accessing device {device_arn}: {str(e)}", exc_info=True)
            raise LookupError(f"Device not found or inaccessible: {device_arn}")

        # Get fresh status
        try:
            current_status = device.status
        except Exception as e:
            logger.warning(f"Failed to get status for device {device_arn}: {str(e)}")
            current_status = "UNKNOWN"
            warnings.append(f"Could not fetch current device status: {str(e)}")

        # Check if we have cached static info
        if device_arn in self._device_cache:
            # Use cached static info
            device_info = self._device_cache[device_arn].copy()
            # Update with fresh status
            device_info['deviceStatus'] = current_status
        else:
            # First time seeing this device - build and cache info
            device_info = {
                'deviceArn': device.arn,
                'deviceName': device.name,
                'deviceType': str(device.type),
                'deviceStatus': current_status,
                'providerName': device.provider_name
            }

            # Add queue information if available
            if hasattr(device, 'queue_depth'):
                try:
                    queue_info = device.queue_depth()
                    # Convert QueueDepthInfo to a serializable dict
                    queue_dict = {
                        'quantumTasks': {str(k): v for k, v in queue_info.quantum_tasks.items()},
                        'jobs': queue_info.jobs
                    }
                    device_info['queueDepth'] = queue_dict
                except Exception as e:
                    logger.warning(f"Failed to fetch queue depth for {device_arn}: {str(e)}")
                    warnings.append(f"Could not fetch queue depth: {str(e)}")

            # Add device properties if available
            if hasattr(device, 'properties') and device.properties:
                try:
                    # Get the properties as a JSON string (already serialized)
                    device_info['properties'] = device.properties.json()
                except Exception as e:
                    # If JSON serialization fails, skip properties
                    logger.warning(f"Failed to serialize properties for {device_arn}: {str(e)}")
                    warnings.append(f"Could not fetch device properties: {str(e)}")

            # Cache static information (everything except status)
            cached_info = device_info.copy()
            self._device_cache[device_arn] = cached_info

        return device_info, warnings


def setup_route_handlers(web_app):
    """Register route handlers with the web application."""
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    devices_route_pattern = url_path_join(base_url, "jupyterlab-braket-devices", "devices")
    handlers = [(devices_route_pattern, DevicesRouteHandler)]

    web_app.add_handlers(host_pattern, handlers)
