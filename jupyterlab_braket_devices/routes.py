import json
from typing import Dict, Any

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

from braket.aws import AwsDevice


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
                device_info = self._get_device_info(device_arn)
                self.finish(json.dumps({
                    "status": "success",
                    "device": device_info
                }))
            else:
                # List all devices
                devices = self._list_devices()
                self.finish(json.dumps({
                    "status": "success",
                    "devices": devices
                }))
        except ValueError as e:
            # Malformed request
            self.set_status(400)
            self.finish(json.dumps({
                "status": "error",
                "message": str(e)
            }))
        except LookupError as e:
            # Device not found
            self.set_status(404)
            self.finish(json.dumps({
                "status": "error",
                "message": str(e)
            }))
        except Exception as e:
            # AWS service error or other unexpected error
            error_name = type(e).__name__
            self.set_status(500 if 'ServiceException' not in error_name else 503)
            self.finish(json.dumps({
                "status": "error",
                "message": f"{error_name}: {str(e)}"
            }))

    def _list_devices(self) -> list:
        """
        List all available Braket devices (excluding RETIRED devices).

        Returns:
            List of device summaries with fresh status
        """
        # Get all devices using Braket SDK, filtering for ONLINE and OFFLINE only
        devices = AwsDevice.get_devices(statuses=['ONLINE', 'OFFLINE'])

        devices_info = []
        for device in devices:
            devices_info.append({
                'deviceArn': device.arn,
                'deviceName': device.name,
                'deviceType': str(device.type),
                'deviceStatus': device.status,
                'providerName': device.provider_name
            })

        return devices_info

    def _get_device_info(self, device_arn: str) -> Dict[str, Any]:
        """
        Get detailed information for a specific device.
        Uses cache for static info, always fetches fresh status.

        Args:
            device_arn: Amazon Resource Name of the device

        Returns:
            Device information with fresh status

        Raises:
            ValueError: If device_arn is malformed
            LookupError: If device is not found
        """
        if not device_arn or not device_arn.startswith('arn:aws:braket:'):
            raise ValueError(f"Invalid device ARN format: {device_arn}")

        try:
            device = AwsDevice(device_arn)
        except Exception as e:
            raise LookupError(f"Device not found: {device_arn}")

        # Get fresh status
        current_status = device.status

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
                except Exception:
                    pass

            # Add device properties if available
            if hasattr(device, 'properties') and device.properties:
                try:
                    # Get the properties as a JSON string (already serialized)
                    device_info['properties'] = device.properties.json()
                except Exception:
                    # If JSON serialization fails, skip properties
                    pass

            # Cache static information (everything except status)
            cached_info = device_info.copy()
            self._device_cache[device_arn] = cached_info

        return device_info


def setup_route_handlers(web_app):
    """Register route handlers with the web application."""
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    devices_route_pattern = url_path_join(base_url, "jupyterlab-braket-devices", "devices")
    handlers = [(devices_route_pattern, DevicesRouteHandler)]

    web_app.add_handlers(host_pattern, handlers)
