/**
 * Utility functions for parsing device properties JSON.
 */

import {
  IParsedProperties,
  IHardwareSpecs,
  IOperationalDetails,
  ICalibrationData,
  INativeGate
} from '../types';

/**
 * Parse device properties JSON string.
 * Returns null if parsing fails.
 */
export function parseDeviceProperties(
  propertiesJson?: string
): IParsedProperties | null {
  if (!propertiesJson) {
    return null;
  }

  try {
    return JSON.parse(propertiesJson) as IParsedProperties;
  } catch (error) {
    console.error('Failed to parse device properties:', error);
    return null;
  }
}

/**
 * Extract hardware specifications from parsed properties.
 */
export function extractHardwareSpecs(
  properties: IParsedProperties | null
): IHardwareSpecs {
  if (!properties) {
    return {};
  }

  const specs: IHardwareSpecs = {};

  // Qubit count
  if (properties.paradigm?.qubitCount) {
    specs.qubitCount = properties.paradigm.qubitCount;
  }

  // Connectivity type
  if (properties.paradigm?.connectivity) {
    specs.connectivityType = properties.paradigm.connectivity.fullyConnected
      ? 'Fully Connected'
      : 'Partial';
  }

  // Try to extract T1/T2 from provider properties
  if (properties.provider?.properties) {
    const providerProps = properties.provider.properties;
    if (providerProps.t1) {
      specs.coherenceTimeT1 = `${providerProps.t1} μs`;
    }
    if (providerProps.t2) {
      specs.coherenceTimeT2 = `${providerProps.t2} μs`;
    }
  }

  return specs;
}

/**
 * Extract operational details from parsed properties.
 */
export function extractOperationalDetails(
  properties: IParsedProperties | null
): IOperationalDetails {
  if (!properties) {
    return {};
  }

  const details: IOperationalDetails = {};

  // Try to extract from deviceParameters or action
  if (properties.deviceParameters) {
    const params = properties.deviceParameters;

    if (params.shotsRange) {
      details.shotsRange = `${params.shotsRange.min} - ${params.shotsRange.max}`;
    }

    if (params.maximumCircuitDepth) {
      details.maxCircuitDepth = params.maximumCircuitDepth;
    }
  }

  return details;
}

/**
 * Extract calibration data from parsed properties.
 * Returns null if not available or not a QPU.
 */
export function extractCalibrationData(
  properties: IParsedProperties | null
): ICalibrationData | null {
  if (!properties) {
    return null;
  }

  // Check if calibration data exists in provider properties
  const providerProps = properties.provider?.properties;
  if (!providerProps || !providerProps.calibration) {
    return null;
  }

  const calibration = providerProps.calibration;
  const data: ICalibrationData = {
    timestamp: calibration.timestamp || calibration.calibratedAt
  };

  // Extract per-qubit metrics
  if (calibration.qubits && Array.isArray(calibration.qubits)) {
    data.qubits = calibration.qubits.map((q: any) => ({
      qubitId: q.qubitId || q.id,
      t1: q.t1,
      t2: q.t2,
      readoutError: q.readoutError || q.readout_error
    }));
  }

  // Extract per-gate metrics
  if (calibration.gates && Array.isArray(calibration.gates)) {
    data.gates = calibration.gates.map((g: any) => ({
      gateName: g.gateName || g.name,
      fidelity: g.fidelity,
      duration: g.duration
    }));
  }

  return data;
}

/**
 * Extract native gates from parsed properties.
 */
export function extractNativeGates(
  properties: IParsedProperties | null
): INativeGate[] {
  if (!properties) {
    return [];
  }

  const gates: INativeGate[] = [];

  // Try to extract from action or paradigm
  const actionProps = properties.action;
  if (actionProps && actionProps.supportedOperations) {
    const operations = actionProps.supportedOperations;

    if (Array.isArray(operations)) {
      operations.forEach((op: any) => {
        gates.push({
          name: op.name || op,
          description: op.description,
          type: op.type,
          isNative: true
        });
      });
    }
  }

  return gates;
}

/**
 * Check if device has fully connected topology.
 */
export function isFullyConnected(
  properties: IParsedProperties | null
): boolean {
  if (!properties || !properties.paradigm?.connectivity) {
    return false;
  }

  return properties.paradigm.connectivity.fullyConnected === true;
}

/**
 * Format queue depth information for display.
 */
export function formatQueueDepth(
  quantumTasks: Record<string, number>
): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = [];

  // Map queue types to friendly labels
  const typeLabels: Record<string, string> = {
    Normal: 'Tasks Queue',
    Priority: 'Priority Queue',
    Hybrid: 'Hybrid Queue'
  };

  Object.entries(quantumTasks).forEach(([type, count]) => {
    result.push({
      label: typeLabels[type] || type,
      value: count
    });
  });

  return result;
}
