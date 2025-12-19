#!/usr/bin/env python
"""
Script to export static Braket device data (excluding status).

This script fetches device information from Amazon Braket and outputs
JSON data for hard-coding in the frontend. The status field is excluded
since it changes frequently and will be fetched separately.

Usage:
    python scripts/export_device_data.py > devices.json
"""
import json
import sys
from braket.aws import AwsDevice


def get_qubit_count(device):
    """
    Extract qubit count from device properties.

    Args:
        device: AwsDevice instance

    Returns:
        int or None: Number of qubits, or None if not available
    """
    try:
        if hasattr(device, 'properties') and device.properties:
            # Try to get qubit count from paradigm
            if hasattr(device.properties, 'paradigm'):
                paradigm = device.properties.paradigm
                if hasattr(paradigm, 'qubitCount'):
                    return paradigm.qubitCount
                # Some devices use 'qubit_count'
                if hasattr(paradigm, 'qubit_count'):
                    return paradigm.qubit_count
    except Exception as e:
        print(f"Warning: Could not get qubit count for {device.name}: {e}", file=sys.stderr)

    return None


def export_device_data():
    """
    Export static device data to JSON.

    Fetches all Braket devices and outputs their static information
    (deviceArn, deviceName, deviceType, providerName, qubitCount) as JSON array.
    """
    try:
        # Get all devices (ONLINE and OFFLINE only, excluding RETIRED)
        devices = AwsDevice.get_devices(statuses=['ONLINE', 'OFFLINE'])

        if not devices:
            print("[]", file=sys.stdout)
            print("Warning: No devices found", file=sys.stderr)
            return

        # Extract static device information (exclude status)
        devices_data = []
        for device in devices:
            device_info = {
                'deviceArn': device.arn,
                'deviceName': device.name,
                'deviceType': str(device.type),
                'providerName': device.provider_name
            }

            # Add qubit count if available
            qubit_count = get_qubit_count(device)
            if qubit_count is not None:
                device_info['qubitCount'] = qubit_count

            devices_data.append(device_info)

        # Output JSON to stdout
        print(json.dumps(devices_data, indent=2))

        # Print summary to stderr
        print(f"\nExported {len(devices_data)} device(s)", file=sys.stderr)
        print("Copy this JSON output into src/staticDeviceData.ts", file=sys.stderr)

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}", file=sys.stderr)
        print("\nMake sure:", file=sys.stderr)
        print("  1. AWS credentials are configured", file=sys.stderr)
        print("  2. You have permissions to access Amazon Braket", file=sys.stderr)
        print("  3. amazon-braket-sdk is installed", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    export_device_data()
