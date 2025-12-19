import json
import logging
from typing import Dict, Any, List

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from botocore.exceptions import ClientError, NoCredentialsError
import aioboto3

# Set up logging
logger = logging.getLogger(__name__)

# Shared aioboto3 session (reused across requests for efficiency)
_braket_session = aioboto3.Session()

# AWS regions where Braket is available
BRAKET_REGIONS = [
    'us-east-1',
    'us-west-1',
    'us-west-2',
    'eu-west-2',
    'eu-north-1',
]


class DevicesRouteHandler(APIHandler):
    """
    Handler for Amazon Braket device operations.

    GET without query params: List all devices
    GET with ?deviceArn=<arn>: Get specific device details
    """

    # Class-level cache for device information (excluding status)
    _device_cache: Dict[str, Dict[str, Any]] = {}

    @tornado.web.authenticated
    async def get(self):
        """
        Handle GET requests for Braket devices.

        Query params:
            deviceArn (optional): Device ARN to get specific device details
        """
        device_arn = self.get_argument('deviceArn', default=None)

        try:
            if device_arn:
                # Describe specific device
                device_info, warnings = await self._get_device_info(device_arn)
                response = {
                    "status": "success",
                    "device": device_info
                }
                if warnings:
                    response["warnings"] = warnings
                self.finish(json.dumps(response))
            else:
                # List all devices
                devices, warnings = await self._list_devices()
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

    async def _list_devices(self) -> tuple[list, List[str]]:
        """
        List all available Braket devices (excluding RETIRED devices).
        Searches across all Braket-enabled AWS regions.

        Returns:
            Tuple of (device list, warnings list)
        """
        warnings = []
        all_devices = []

        # Search devices across all Braket regions
        for region in BRAKET_REGIONS:
            try:
                # Get all devices using aioboto3, with pagination
                # Note: SearchDevices only supports filtering by deviceArn, so we fetch all
                # devices and filter by status in code
                async with _braket_session.client('braket', region_name=region) as client:
                    next_token = None

                    while True:
                        # Build request params - use empty filters to get all devices
                        params = {'filters': []}
                        if next_token:
                            params['nextToken'] = next_token

                        # Fetch page
                        response = await client.search_devices(**params)
                        devices = response.get('devices', [])

                        # Tag each device with the region where it was found
                        # (needed for devices with empty region in ARN, like simulators)
                        for device in devices:
                            device['_region'] = region

                        all_devices.extend(devices)

                        # Check for more pages
                        next_token = response.get('nextToken')
                        if not next_token:
                            break

            except (NoCredentialsError, ClientError):
                # Re-raise auth errors to be handled at top level
                raise
            except Exception as e:
                # Log unexpected errors but don't fail completely for this region
                error_msg = f"Error fetching devices from {region}: {type(e).__name__}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                warnings.append(error_msg)

        # Filter devices to only include ONLINE and OFFLINE (exclude RETIRED)
        # Also track which region each device was found in (for devices with empty region in ARN)
        devices_info = []
        for device in all_devices:
            try:
                status = device.get('deviceStatus')
                # Skip RETIRED devices
                if status not in ['ONLINE', 'OFFLINE']:
                    continue

                device_info = {
                    'deviceArn': device.get('deviceArn'),
                    'deviceName': device.get('deviceName'),
                    'deviceType': device.get('deviceType'),
                    'deviceStatus': status,
                    'providerName': device.get('providerName')
                }

                # Store the region where this device was found (for GetDevice calls)
                if '_region' in device:
                    device_info['_region'] = device['_region']

                devices_info.append(device_info)
            except Exception as e:
                # Skip this device but log warning
                device_arn = device.get('deviceArn', 'unknown')
                warning_msg = f"Failed to process device {device_arn}: {str(e)}"
                logger.warning(warning_msg)
                warnings.append(warning_msg)

        return devices_info, warnings

    async def _get_device_info(self, device_arn: str) -> tuple[Dict[str, Any], List[str]]:
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

        # Extract region from ARN: arn:aws:braket:REGION:...
        # For devices, the ARN format is: arn:aws:braket:REGION::device/...
        # Or for global devices: arn:aws:braket:::device/...
        arn_parts = device_arn.split(':')
        arn_region = arn_parts[3] if len(arn_parts) > 3 else ''

        response = None
        last_error = None

        # If ARN has a specific region, use that
        if arn_region:
            try:
                async with _braket_session.client('braket', region_name=arn_region) as client:
                    response = await client.get_device(deviceArn=device_arn)
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                if error_code == 'ResourceNotFoundException':
                    raise LookupError(f"Device not found: {device_arn}. It may have been retired.")
                # Re-raise other client errors to be handled at top level
                raise
            except Exception as e:
                logger.error(f"Error accessing device {device_arn}: {str(e)}", exc_info=True)
                raise LookupError(f"Device not found or inaccessible: {device_arn}")
        else:
            # ARN has no region (global device like simulators)
            # Try all Braket regions until we find it
            for region in BRAKET_REGIONS:
                try:
                    async with _braket_session.client('braket', region_name=region) as client:
                        response = await client.get_device(deviceArn=device_arn)
                        break  # Success! Exit loop
                except ClientError as e:
                    error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                    if error_code == 'ResourceNotFoundException':
                        # Try next region
                        last_error = e
                        continue
                    # Other client errors should be raised
                    raise
                except Exception as e:
                    # Try next region but track error
                    last_error = e
                    continue

            # If we didn't get a response after trying all regions
            if response is None:
                if last_error:
                    logger.error(f"Error accessing device {device_arn} in all regions: {str(last_error)}", exc_info=True)
                raise LookupError(f"Device not found in any region: {device_arn}. It may have been retired.")

        # Get fresh status from response
        current_status = response.get('deviceStatus', 'UNKNOWN')
        if current_status == 'UNKNOWN':
            logger.warning(f"GetDevice returned no deviceStatus for {device_arn}. Response keys: {list(response.keys())}")

        # Check if we have cached static info
        if device_arn in self._device_cache:
            # Use cached static info
            device_info = self._device_cache[device_arn].copy()
            # Update with fresh status
            device_info['deviceStatus'] = current_status
        else:
            # First time seeing this device - build and cache info
            device_info = {
                'deviceArn': response.get('deviceArn'),
                'deviceName': response.get('deviceName'),
                'deviceType': response.get('deviceType'),
                'deviceStatus': current_status,
                'providerName': response.get('providerName')
            }

            # Add queue information if available in response
            # deviceQueueInfo is a list of queue objects with queue, queueSize, queuePriority
            if 'deviceQueueInfo' in response:
                try:
                    queue_info_list = response['deviceQueueInfo']
                    if isinstance(queue_info_list, list):
                        # Build queue depth dict from the list
                        # Separate QUANTUM_TASKS_QUEUE and JOBS_QUEUE
                        quantum_tasks_normal = 0
                        quantum_tasks_priority = 0
                        jobs_count = 0

                        for queue_item in queue_info_list:
                            queue_type = queue_item.get('queue')
                            queue_size = queue_item.get('queueSize', 0)
                            queue_priority = queue_item.get('queuePriority')

                            if queue_type == 'QUANTUM_TASKS_QUEUE':
                                if queue_priority == 'Priority':
                                    quantum_tasks_priority = queue_size
                                else:
                                    quantum_tasks_normal = queue_size
                            elif queue_type == 'JOBS_QUEUE':
                                jobs_count = queue_size

                        device_info['queueDepth'] = {
                            'quantumTasks': {
                                'Normal': quantum_tasks_normal,
                                'Priority': quantum_tasks_priority
                            },
                            'jobs': jobs_count
                        }
                except Exception as e:
                    logger.warning(f"Failed to process queue info for {device_arn}: {str(e)}")
                    warnings.append(f"Could not process queue depth: {str(e)}")

            # Add device properties if available (deviceCapabilities is JSON string)
            if 'deviceCapabilities' in response:
                try:
                    # deviceCapabilities is already a JSON string
                    device_info['properties'] = response['deviceCapabilities']
                except Exception as e:
                    logger.warning(f"Failed to process capabilities for {device_arn}: {str(e)}")
                    warnings.append(f"Could not fetch device properties: {str(e)}")

            # Cache static information (everything except status)
            cached_info = device_info.copy()
            self._device_cache[device_arn] = cached_info

        return device_info, warnings


class DeviceStatusRouteHandler(APIHandler):
    """
    Handler for fetching only device status information.

    GET: Returns status for all devices (lightweight endpoint)
    """

    @tornado.web.authenticated
    async def get(self):
        """
        Handle GET requests for device status only.

        Returns:
            JSON array of { deviceArn, deviceStatus } objects
        """
        try:
            statuses = await self._get_all_device_statuses()
            self.finish(json.dumps({
                "status": "success",
                "statuses": statuses
            }))
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
            # AWS client errors
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

    async def _get_all_device_statuses(self) -> List[Dict[str, str]]:
        """
        Fetch only status for all Braket devices (excluding RETIRED devices).
        Searches across all Braket-enabled AWS regions.

        Returns:
            List of dicts with deviceArn and deviceStatus
        """
        all_devices = []

        # Search devices across all Braket regions
        for region in BRAKET_REGIONS:
            try:
                # Get all devices using aioboto3, with pagination
                # Note: SearchDevices only supports filtering by deviceArn, so we fetch all
                # devices and filter by status in code
                async with _braket_session.client('braket', region_name=region) as client:
                    next_token = None

                    while True:
                        # Build request params - use empty filters to get all devices
                        params = {'filters': []}
                        if next_token:
                            params['nextToken'] = next_token

                        # Fetch page
                        response = await client.search_devices(**params)
                        devices = response.get('devices', [])
                        all_devices.extend(devices)

                        # Check for more pages
                        next_token = response.get('nextToken')
                        if not next_token:
                            break

            except (NoCredentialsError, ClientError):
                # Re-raise auth errors to be handled at top level
                raise
            except Exception as e:
                # Log unexpected errors but continue with other regions
                error_msg = f"Error fetching device statuses from {region}: {type(e).__name__}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                # Don't raise here, try other regions

        # Filter devices to only include ONLINE and OFFLINE (exclude RETIRED)
        statuses = []
        for device in all_devices:
            try:
                status = device.get('deviceStatus')
                # Skip RETIRED devices
                if status not in ['ONLINE', 'OFFLINE']:
                    continue

                statuses.append({
                    'deviceArn': device.get('deviceArn'),
                    'deviceStatus': status
                })
            except Exception as e:
                # Skip this device but log warning
                device_arn = device.get('deviceArn', 'unknown')
                logger.warning(f"Failed to get status for device {device_arn}: {str(e)}")

        return statuses


def setup_route_handlers(web_app):
    """Register route handlers with the web application."""
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    devices_route_pattern = url_path_join(base_url, "jupyterlab-braket-devices", "devices")
    status_route_pattern = url_path_join(base_url, "jupyterlab-braket-devices", "devices", "status")

    handlers = [
        (status_route_pattern, DeviceStatusRouteHandler),
        (devices_route_pattern, DevicesRouteHandler)
    ]

    web_app.add_handlers(host_pattern, handlers)
