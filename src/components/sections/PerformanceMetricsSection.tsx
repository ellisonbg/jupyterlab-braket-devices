/**
 * PerformanceMetricsSection - displays Phase 2 performance metrics.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDeviceDetail, IParsedProperties } from '../../types';
import { ParameterGrid, IParameter } from '../ParameterGrid';

interface IPerformanceMetricsSectionProps {
  device: IDeviceDetail;
  properties: IParsedProperties | null;
}

/**
 * Format fidelity as percentage with 2 decimal places.
 */
function formatFidelity(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Format time in seconds to microseconds with proper units.
 */
function formatTime(seconds: number): string {
  const microseconds = seconds * 1e6;
  if (microseconds < 1000) {
    return `${microseconds.toFixed(2)} µs`;
  } else {
    const milliseconds = microseconds / 1000;
    return `${milliseconds.toFixed(2)} ms`;
  }
}

/**
 * Format error rate in scientific notation if < 0.01.
 */
function formatError(errorRate: number): string {
  if (errorRate < 0.01) {
    return errorRate.toExponential(2);
  }
  return `${(errorRate * 100).toFixed(3)}%`;
}

/**
 * Section showing device performance metrics (Phase 2).
 */
export const PerformanceMetricsSection: React.FC<
  IPerformanceMetricsSectionProps
> = ({ device, properties }) => {
  if (!properties) {
    return null;
  }

  const parameters: IParameter[] = [];
  const isQPU = device.deviceType.toUpperCase().includes('QPU');

  // Only show for QPUs
  if (!isQPU) {
    return null;
  }

  // IonQ-specific metrics
  if (device.providerName.toLowerCase() === 'ionq') {
    const provider = properties.provider as any;

    if (provider?.fidelity) {
      const fidelity = provider.fidelity;

      if (fidelity['1Q']?.mean !== undefined) {
        parameters.push({
          label: 'Single-Qubit Fidelity',
          value: formatFidelity(fidelity['1Q'].mean)
        });
      }

      if (fidelity['2Q']?.mean !== undefined) {
        parameters.push({
          label: 'Two-Qubit Fidelity',
          value: formatFidelity(fidelity['2Q'].mean)
        });
      }

      if (fidelity.spam?.mean !== undefined) {
        parameters.push({
          label: 'SPAM Fidelity',
          value: formatFidelity(fidelity.spam.mean)
        });
      }
    }

    if (provider?.timing) {
      const timing = provider.timing;

      if (timing.T1 !== undefined) {
        parameters.push({
          label: 'T1 Coherence Time',
          value: formatTime(timing.T1)
        });
      }

      if (timing.T2 !== undefined) {
        parameters.push({
          label: 'T2 Dephasing Time',
          value: formatTime(timing.T2)
        });
      }

      if (timing.readout !== undefined) {
        parameters.push({
          label: 'Readout Time',
          value: formatTime(timing.readout)
        });
      }
    }
  }

  // Rigetti-specific metrics (would require aggregation from benchmarks)
  // TODO: Implement Rigetti benchmark aggregation in future PR
  if (device.providerName.toLowerCase() === 'rigetti') {
    // Placeholder for Rigetti metrics - requires benchmark data aggregation
    // Will be implemented in a future phase
    parameters.push({
      label: 'Performance Metrics',
      value: 'Detailed calibration data available in Advanced view'
    });
  }

  // QuEra Aquila-specific metrics
  if (device.providerName.toLowerCase() === 'quera') {
    const performance = (properties as any).performance;

    if (performance?.lattice) {
      const lattice = performance.lattice;

      if (lattice.atomLossProbabilityTypical !== undefined) {
        parameters.push({
          label: 'Atom Loss (typical)',
          value: formatError(lattice.atomLossProbabilityTypical)
        });
      }

      if (lattice.fillingErrorTypical !== undefined) {
        parameters.push({
          label: 'Filling Error (typical)',
          value: formatError(lattice.fillingErrorTypical)
        });
      }

      if (lattice.positionErrorAbs !== undefined) {
        parameters.push({
          label: 'Position Error',
          value: `${(lattice.positionErrorAbs * 1e6).toFixed(2)} µm`
        });
      }
    }
  }

  // Don't render section if no parameters
  if (parameters.length === 0) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Performance Metrics
      </Typography>
      <ParameterGrid parameters={parameters} columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} />
    </Box>
  );
};
