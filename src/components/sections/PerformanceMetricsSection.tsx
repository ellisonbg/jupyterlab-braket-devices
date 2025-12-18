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

  // IQM-specific metrics
  if (device.providerName.toLowerCase() === 'iqm') {
    const provider = properties.provider as any;
    const providerProps = provider?.properties;

    if (providerProps?.one_qubit) {
      // Aggregate single-qubit metrics across all qubits
      const qubitIds = Object.keys(providerProps.one_qubit);
      let sumSingleQubitFidelity = 0;
      let sumReadoutFidelity = 0;
      let sumT1 = 0;
      let sumT2 = 0;
      let countFidelity = 0;
      let countReadout = 0;
      let countT1 = 0;
      let countT2 = 0;

      qubitIds.forEach(qubitId => {
        const qubit = providerProps.one_qubit[qubitId];

        // Single-qubit fidelity
        if (qubit.f1Q_simultaneous_RB !== undefined) {
          sumSingleQubitFidelity += qubit.f1Q_simultaneous_RB;
          countFidelity++;
        }

        // Readout fidelity
        if (qubit.fRO !== undefined) {
          sumReadoutFidelity += qubit.fRO;
          countReadout++;
        }

        // T1 coherence time
        if (qubit.T1 !== undefined) {
          sumT1 += qubit.T1;
          countT1++;
        }

        // T2 coherence time
        if (qubit.T2 !== undefined) {
          sumT2 += qubit.T2;
          countT2++;
        }
      });

      // Add averaged metrics
      if (countFidelity > 0) {
        parameters.push({
          label: 'Avg Single-Qubit Fidelity',
          value: formatFidelity(sumSingleQubitFidelity / countFidelity)
        });
      }

      if (countReadout > 0) {
        parameters.push({
          label: 'Avg Readout Fidelity',
          value: formatFidelity(sumReadoutFidelity / countReadout)
        });
      }

      if (countT1 > 0) {
        parameters.push({
          label: 'Avg T1 Coherence Time',
          value: formatTime(sumT1 / countT1)
        });
      }

      if (countT2 > 0) {
        parameters.push({
          label: 'Avg T2 Coherence Time',
          value: formatTime(sumT2 / countT2)
        });
      }
    }

    // Check for two-qubit data
    if (providerProps?.two_qubit) {
      const pairIds = Object.keys(providerProps.two_qubit);
      let sumTwoQubitFidelity = 0;
      let countTwoQubit = 0;

      pairIds.forEach(pairId => {
        const pair = providerProps.two_qubit[pairId];
        if (pair.f2Q_simultaneous_RB !== undefined) {
          sumTwoQubitFidelity += pair.f2Q_simultaneous_RB;
          countTwoQubit++;
        }
      });

      if (countTwoQubit > 0) {
        parameters.push({
          label: 'Avg Two-Qubit Gate Fidelity',
          value: formatFidelity(sumTwoQubitFidelity / countTwoQubit)
        });
      }
    }
  }

  // Rigetti-specific metrics from standardized properties
  if (device.providerName.toLowerCase() === 'rigetti') {
    const standardized = (properties as any).standardized;
    const oneQubitProps = standardized?.oneQubitProperties;
    const twoQubitProps = standardized?.twoQubitProperties;

    if (oneQubitProps && typeof oneQubitProps === 'object') {
      // Aggregate single-qubit metrics across all qubits
      const qubitIds = Object.keys(oneQubitProps);
      let sumT1 = 0;
      let sumT2 = 0;
      let sumSingleQubitFidelity = 0;
      let sumReadoutFidelity = 0;
      let countT1 = 0;
      let countT2 = 0;
      let countSingleQubit = 0;
      let countReadout = 0;

      qubitIds.forEach(qubitId => {
        const qubit = oneQubitProps[qubitId];

        // T1 coherence time
        if (qubit.T1?.value !== undefined) {
          sumT1 += qubit.T1.value;
          countT1++;
        }

        // T2 dephasing time
        if (qubit.T2?.value !== undefined) {
          sumT2 += qubit.T2.value;
          countT2++;
        }

        // Single-qubit fidelity (RANDOMIZED_BENCHMARKING)
        if (Array.isArray(qubit.oneQubitFidelity)) {
          const rbFidelity = qubit.oneQubitFidelity.find(
            (f: any) => f.fidelityType?.name === 'RANDOMIZED_BENCHMARKING'
          );
          if (rbFidelity?.fidelity !== undefined) {
            sumSingleQubitFidelity += rbFidelity.fidelity;
            countSingleQubit++;
          }

          // Readout fidelity
          const readoutFidelity = qubit.oneQubitFidelity.find(
            (f: any) => f.fidelityType?.name === 'READOUT'
          );
          if (readoutFidelity?.fidelity !== undefined) {
            sumReadoutFidelity += readoutFidelity.fidelity;
            countReadout++;
          }
        }
      });

      // Add averaged metrics
      if (countT1 > 0) {
        parameters.push({
          label: 'Avg T1 Coherence Time',
          value: formatTime(sumT1 / countT1)
        });
      }

      if (countT2 > 0) {
        parameters.push({
          label: 'Avg T2 Dephasing Time',
          value: formatTime(sumT2 / countT2)
        });
      }

      if (countSingleQubit > 0) {
        parameters.push({
          label: 'Avg Single-Qubit Fidelity',
          value: formatFidelity(sumSingleQubitFidelity / countSingleQubit)
        });
      }

      if (countReadout > 0) {
        parameters.push({
          label: 'Avg Readout Fidelity',
          value: formatFidelity(sumReadoutFidelity / countReadout)
        });
      }
    }

    // Aggregate two-qubit gate fidelity
    if (twoQubitProps && typeof twoQubitProps === 'object') {
      const pairIds = Object.keys(twoQubitProps);
      let sumTwoQubitFidelity = 0;
      let countTwoQubit = 0;

      pairIds.forEach(pairId => {
        const pair = twoQubitProps[pairId];
        if (
          Array.isArray(pair.twoQubitGateFidelity) &&
          pair.twoQubitGateFidelity.length > 0
        ) {
          const gateFidelity = pair.twoQubitGateFidelity[0];
          if (gateFidelity?.fidelity !== undefined) {
            sumTwoQubitFidelity += gateFidelity.fidelity;
            countTwoQubit++;
          }
        }
      });

      if (countTwoQubit > 0) {
        parameters.push({
          label: 'Avg Two-Qubit Gate Fidelity',
          value: formatFidelity(sumTwoQubitFidelity / countTwoQubit)
        });
      }
    }
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

  // AQT-specific metrics
  if (device.providerName.toLowerCase() === 'aqt') {
    const provider = properties.provider as any;
    const providerProps = provider?.properties;

    if (providerProps) {
      // Single-qubit fidelity - average across all qubits
      if (providerProps.single_qubit_gate_fidelity) {
        const singleQubitFidelities = Object.values(
          providerProps.single_qubit_gate_fidelity
        ) as Array<{ value: number }>;
        if (singleQubitFidelities.length > 0) {
          const avgFidelity =
            singleQubitFidelities.reduce(
              (sum, item) => sum + item.value,
              0
            ) / singleQubitFidelities.length;
          parameters.push({
            label: 'Avg Single-Qubit Fidelity',
            value: formatFidelity(avgFidelity / 100) // Convert from percentage to fraction
          });
        }
      }

      // Two-qubit gate fidelity
      if (providerProps.mean_two_qubit_gate_fidelity?.value !== undefined) {
        parameters.push({
          label: 'Two-Qubit Gate Fidelity',
          value: formatFidelity(
            providerProps.mean_two_qubit_gate_fidelity.value / 100
          ) // Convert from percentage to fraction
        });
      }

      // SPAM fidelity
      if (providerProps.spam_fidelity_lower_bound !== undefined) {
        parameters.push({
          label: 'SPAM Fidelity (lower bound)',
          value: formatFidelity(providerProps.spam_fidelity_lower_bound / 100) // Convert from percentage to fraction
        });
      }

      // T1 coherence time
      if (providerProps.t1_s?.value !== undefined) {
        parameters.push({
          label: 'T1 Coherence Time',
          value: formatTime(providerProps.t1_s.value)
        });
      }

      // T2 coherence time
      if (providerProps.t2_coherence_time_s?.value !== undefined) {
        parameters.push({
          label: 'T2 Coherence Time',
          value: formatTime(providerProps.t2_coherence_time_s.value)
        });
      }

      // Readout time (convert from microseconds to seconds)
      if (providerProps.readout_time_micros !== undefined) {
        parameters.push({
          label: 'Readout Time',
          value: formatTime(providerProps.readout_time_micros / 1e6)
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
        Performance
      </Typography>
      <ParameterGrid parameters={parameters} columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} />
    </Box>
  );
};
