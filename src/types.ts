/**
 * Type definitions for Amazon Braket device data.
 * These match the API response structure from routes.py
 */

/**
 * Device summary returned by the list devices endpoint.
 * Used in the device list view.
 */
export interface IDeviceSummary {
  deviceArn: string;
  deviceName: string;
  deviceType: string;
  deviceStatus: string;
  providerName: string;
}

/**
 * Queue depth information for a device.
 */
export interface IQueueDepth {
  quantumTasks: Record<string, number>;
  jobs: string;
}

/**
 * Full device information including properties and queue depth.
 * Used in the device detail view.
 */
export interface IDeviceDetail extends IDeviceSummary {
  queueDepth?: IQueueDepth;
  properties?: string; // JSON string of device properties
}

/**
 * API response for listing devices.
 */
export interface IDevicesResponse {
  status: 'success' | 'error';
  devices?: IDeviceSummary[];
  message?: string;
}

/**
 * API response for getting a specific device.
 */
export interface IDeviceResponse {
  status: 'success' | 'error';
  device?: IDeviceDetail;
  message?: string;
}

/**
 * Parsed device properties structure.
 * Properties come as JSON string from backend and need to be parsed.
 */
export interface IParsedProperties {
  service?: {
    deviceLocation?: string;
    deviceRegion?: string;
  };
  deviceParameters?: Record<string, any>;
  paradigm?: {
    qubitCount?: number;
    connectivity?: {
      fullyConnected?: boolean;
      connectivityGraph?: Record<string, any>;
    };
  };
  provider?: {
    properties?: Record<string, any>;
  };
  action?: Record<string, any>;
}

/**
 * Hardware specifications extracted from device properties.
 */
export interface IHardwareSpecs {
  qubitCount?: number;
  technology?: string;
  connectivityType?: string;
  coherenceTimeT1?: string;
  coherenceTimeT2?: string;
  gateTime?: string;
}

/**
 * Operational details extracted from device properties.
 */
export interface IOperationalDetails {
  executionWindows?: string;
  shotsRange?: string;
  maxCircuitDepth?: number;
}

/**
 * Calibration data for QPU devices.
 */
export interface ICalibrationData {
  timestamp?: string;
  qubits?: Array<{
    qubitId: string | number;
    t1?: number;
    t2?: number;
    readoutError?: number;
  }>;
  gates?: Array<{
    gateName: string;
    fidelity?: number;
    duration?: number;
  }>;
}

/**
 * Native gate information.
 */
export interface INativeGate {
  name: string;
  description?: string;
  type?: string;
  isNative: boolean;
}
