#!/usr/bin/env python
"""
Script to list and describe Amazon Braket devices.

This script demonstrates the functionality of the routes.py handlers
by directly calling the Amazon Braket SDK.
"""
import json
from braket.aws import AwsDevice
from braket.device_schema import DeviceActionType


def list_devices():
    """List all available Braket devices."""
    print("=" * 80)
    print("LISTING ALL AMAZON BRAKET DEVICES")
    print("=" * 80)

    # Get all devices using Braket SDK
    # This automatically excludes RETIRED devices
    devices = AwsDevice.get_devices(statuses=['ONLINE', 'OFFLINE'])

    if not devices:
        print("\nNo devices found.")
        return []

    print(f"\nFound {len(devices)} device(s):\n")

    devices_info = []
    for idx, device in enumerate(devices, 1):
        print(f"{idx}. {device.name}")
        print(f"   ARN:      {device.arn}")
        print(f"   Type:     {device.type}")
        print(f"   Status:   {device.status}")
        print(f"   Provider: {device.provider_name}")
        print()

        devices_info.append({
            'deviceArn': device.arn,
            'deviceName': device.name,
            'deviceType': str(device.type),
            'deviceStatus': device.status,
            'providerName': device.provider_name
        })

    return devices_info


def get_device_details(device_arn):
    """Get detailed information for a specific device."""
    try:
        device = AwsDevice(device_arn)

        # Build device info dictionary
        device_info = {
            'deviceArn': device.arn,
            'deviceName': device.name,
            'deviceType': str(device.type),
            'deviceStatus': device.status,
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

        # Add device properties/capabilities if available
        if hasattr(device, 'properties') and device.properties:
            try:
                # Get the properties as a JSON-serializable dict
                device_info['properties'] = device.properties.json()
            except Exception:
                # If JSON serialization fails, try getting dict and stringify it
                try:
                    device_info['properties'] = str(device.properties.dict())
                except Exception:
                    pass

        return device_info

    except Exception as e:
        print(f"ERROR: Failed to get device details: {e}")
        return None


def display_device_details(device_info):
    """Display detailed device information in a readable format."""
    if not device_info:
        return

    print("=" * 80)
    print(f"DEVICE DETAILS: {device_info.get('deviceName', 'Unknown')}")
    print("=" * 80)

    # Basic information
    print("\nBasic Information:")
    print(f"  Name:         {device_info.get('deviceName', 'N/A')}")
    print(f"  ARN:          {device_info.get('deviceArn', 'N/A')}")
    print(f"  Type:         {device_info.get('deviceType', 'N/A')}")
    print(f"  Status:       {device_info.get('deviceStatus', 'N/A')}")
    print(f"  Provider:     {device_info.get('providerName', 'N/A')}")

    # Queue depth (if available)
    if 'queueDepth' in device_info:
        queue = device_info['queueDepth']
        print("\n  Queue Depth:")
        if 'quantumTasks' in queue:
            for queue_type, count in queue['quantumTasks'].items():
                print(f"    {queue_type}: {count}")
        if 'jobs' in queue:
            print(f"    Jobs: {queue['jobs']}")

    # Device properties (if available)
    if 'properties' in device_info and device_info['properties']:
        properties = device_info['properties']
        print("\nDevice Properties:")

        # If it's a JSON string, parse and display it
        if isinstance(properties, str):
            try:
                # Try to parse if it's JSON
                if properties.startswith('{'):
                    parsed = json.loads(properties)
                    print(json.dumps(parsed, indent=2))
                else:
                    print(f"  {properties}")
            except json.JSONDecodeError:
                print(f"  {properties}")
        elif isinstance(properties, dict):
            print(json.dumps(properties, indent=2))
        else:
            print(f"  {properties}")

    print("\n" + "=" * 80 + "\n")


def main():
    """Main function to list devices and show details for each."""
    try:
        # List all devices
        devices = list_devices()

        if not devices:
            print("No devices available to query.")
            return

        # Get details for each device
        print("\n" + "=" * 80)
        print("FETCHING DETAILED INFORMATION FOR EACH DEVICE")
        print("=" * 80 + "\n")

        for device in devices:
            device_arn = device.get('deviceArn')
            if device_arn:
                device_details = get_device_details(device_arn)
                display_device_details(device_details)
            else:
                print(f"WARNING: Device without ARN found: {device}")

        print("\nDone! All device information retrieved successfully.")

    except Exception as e:
        print(f"\nERROR: {type(e).__name__}: {e}")
        print("\nMake sure:")
        print("  1. AWS credentials are configured (check ~/.aws/credentials)")
        print("  2. You have permissions to access Amazon Braket")
        print("  3. amazon-braket-sdk is installed")


if __name__ == "__main__":
    main()
