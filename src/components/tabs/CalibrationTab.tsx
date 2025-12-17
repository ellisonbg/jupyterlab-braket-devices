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
  Paper
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
      <Box>
        <Typography color="text.secondary">
          Calibration data not available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Calibration header */}
      {calibrationData.timestamp && (
        <Box>
          <Typography variant="h6">Calibration Data</Typography>
          <Typography variant="body2" color="text.secondary">
            Last calibrated: {new Date(calibrationData.timestamp).toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Topology information */}
      <Box>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Qubit Topology
        </Typography>
        {fullyConnected ? (
          <Typography variant="body1">
            Fully connected
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Topology graph visualization (coming soon)
          </Typography>
        )}
      </Box>

      {/* Per-qubit metrics */}
      {calibrationData.qubits && calibrationData.qubits.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Per-Qubit Metrics
          </Typography>
          <TableContainer component={Paper}>
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
        </Box>
      )}

      {/* Per-gate metrics */}
      {calibrationData.gates && calibrationData.gates.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
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
        </Box>
      )}

      {!calibrationData.qubits && !calibrationData.gates && (
        <Typography color="text.secondary">
          No detailed calibration metrics available
        </Typography>
      )}
    </Box>
  );
};
