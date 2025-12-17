/**
 * CalibrationTab component - shows calibration data for QPU devices.
 */

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  Paper,
  Divider
} from '@mui/material';
import { IParsedProperties } from '../../types';
import {
  extractCalibrationData,
  isFullyConnected
} from '../../utils/propertiesParser';

interface ICalibrationTabProps {
  properties: IParsedProperties | null;
}

/**
 * Calibration tab showing calibration data and topology for QPU devices.
 */
export const CalibrationTab: React.FC<ICalibrationTabProps> = ({
  properties
}) => {
  const calibrationData = extractCalibrationData(properties);
  const fullyConnected = isFullyConnected(properties);

  if (!calibrationData) {
    return (
      <Box padding={2}>
        <Typography color="text.secondary">
          Calibration data not available
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={2}>
      {/* Calibration header */}
      {calibrationData.timestamp && (
        <Box marginBottom={2}>
          <Typography variant="h6">Calibration Data</Typography>
          <Typography variant="body2" color="text.secondary">
            Last calibrated: {new Date(calibrationData.timestamp).toLocaleString()}
          </Typography>
        </Box>
      )}

      <Divider sx={{ marginY: 2 }} />

      {/* Topology information */}
      <Typography variant="h6" gutterBottom>
        Qubit Topology
      </Typography>
      {fullyConnected ? (
        <Typography variant="body1" marginBottom={3}>
          Fully connected
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" marginBottom={3}>
          Topology graph visualization (coming soon)
        </Typography>
      )}

      <Divider sx={{ marginY: 2 }} />

      {/* Per-qubit metrics */}
      {calibrationData.qubits && calibrationData.qubits.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Per-Qubit Metrics
          </Typography>
          <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Qubit ID</strong></TableCell>
                  <TableCell><strong>T1 (μs)</strong></TableCell>
                  <TableCell><strong>T2 (μs)</strong></TableCell>
                  <TableCell><strong>Readout Error</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calibrationData.qubits.map((qubit, index) => (
                  <TableRow key={index}>
                    <TableCell>{qubit.qubitId}</TableCell>
                    <TableCell>
                      {qubit.t1 !== undefined ? qubit.t1.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell>
                      {qubit.t2 !== undefined ? qubit.t2.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell>
                      {qubit.readoutError !== undefined
                        ? (qubit.readoutError * 100).toFixed(2) + '%'
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Per-gate metrics */}
      {calibrationData.gates && calibrationData.gates.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Per-Gate Metrics
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Gate Name</strong></TableCell>
                  <TableCell><strong>Fidelity</strong></TableCell>
                  <TableCell><strong>Duration (ns)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calibrationData.gates.map((gate, index) => (
                  <TableRow key={index}>
                    <TableCell>{gate.gateName}</TableCell>
                    <TableCell>
                      {gate.fidelity !== undefined
                        ? (gate.fidelity * 100).toFixed(2) + '%'
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {gate.duration !== undefined ? gate.duration.toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {!calibrationData.qubits && !calibrationData.gates && (
        <Typography color="text.secondary">
          No detailed calibration metrics available
        </Typography>
      )}
    </Box>
  );
};
