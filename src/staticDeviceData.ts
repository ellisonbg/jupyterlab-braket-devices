/**
 * Static device data for Braket devices.
 *
 * This data is hard-coded for immediate display in the UI.
 * Only the device status is fetched dynamically via the API.
 *
 * To regenerate this data, run:
 *   python scripts/export_device_data.py > devices.json
 *
 * Generated: 2025-12-19
 */

import { IDeviceSummary } from './types';

/**
 * Static device information without status.
 * Status will be fetched asynchronously and merged in at runtime.
 */
export type StaticDeviceData = Omit<IDeviceSummary, 'deviceStatus'>;

/**
 * Hard-coded device data for immediate UI rendering.
 * Device status is loaded separately and asynchronously.
 */
export const STATIC_DEVICES: StaticDeviceData[] = [
  {
    deviceArn: 'arn:aws:braket:us-west-1::device/qpu/rigetti/Ankaa-3',
    deviceName: 'Ankaa-3',
    deviceType: 'QPU',
    providerName: 'Rigetti',
    qubitCount: 82
  },
  {
    deviceArn: 'arn:aws:braket:us-east-1::device/qpu/quera/Aquila',
    deviceName: 'Aquila',
    deviceType: 'QPU',
    providerName: 'QuEra',
    qubitCount: 256
  },
  {
    deviceArn: 'arn:aws:braket:us-east-1::device/qpu/ionq/Aria-1',
    deviceName: 'Aria 1',
    deviceType: 'QPU',
    providerName: 'IonQ',
    qubitCount: 25
  },
  {
    deviceArn: 'arn:aws:braket:eu-north-1::device/qpu/iqm/Emerald',
    deviceName: 'Emerald',
    deviceType: 'QPU',
    providerName: 'IQM',
    qubitCount: 54
  },
  {
    deviceArn: 'arn:aws:braket:us-east-1::device/qpu/ionq/Forte-1',
    deviceName: 'Forte 1',
    deviceType: 'QPU',
    providerName: 'IonQ',
    qubitCount: 36
  },
  {
    deviceArn: 'arn:aws:braket:us-east-1::device/qpu/ionq/Forte-Enterprise-1',
    deviceName: 'Forte Enterprise 1',
    deviceType: 'QPU',
    providerName: 'IonQ',
    qubitCount: 36
  },
  {
    deviceArn: 'arn:aws:braket:eu-north-1::device/qpu/iqm/Garnet',
    deviceName: 'Garnet',
    deviceType: 'QPU',
    providerName: 'IQM',
    qubitCount: 20
  },
  {
    deviceArn: 'arn:aws:braket:eu-north-1::device/qpu/aqt/Ibex-Q1',
    deviceName: 'IBEX Q1',
    deviceType: 'QPU',
    providerName: 'AQT',
    qubitCount: 1
  },
  {
    deviceArn: 'arn:aws:braket:::device/quantum-simulator/amazon/sv1',
    deviceName: 'SV1',
    deviceType: 'Simulator',
    providerName: 'Amazon Braket',
    qubitCount: 34
  },
  {
    deviceArn: 'arn:aws:braket:::device/quantum-simulator/amazon/dm1',
    deviceName: 'dm1',
    deviceType: 'Simulator',
    providerName: 'Amazon Braket',
    qubitCount: 17
  }
];
