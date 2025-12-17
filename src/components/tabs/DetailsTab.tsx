/**
 * DetailsTab component - shows detailed device specifications.
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
  Paper,
  Divider
} from '@mui/material';
import { IParsedProperties } from '../../types';
import {
  extractHardwareSpecs,
  extractOperationalDetails
} from '../../utils/propertiesParser';

interface IDetailsTabProps {
  properties: IParsedProperties | null;
}

/**
 * Details tab showing hardware specs and operational details.
 */
export const DetailsTab: React.FC<IDetailsTabProps> = ({ properties }) => {
  const hardwareSpecs = extractHardwareSpecs(properties);
  const operationalDetails = extractOperationalDetails(properties);

  return (
    <Box padding={2}>
      {/* Hardware Specifications Section */}
      <Typography variant="h6" gutterBottom>
        Hardware Specifications
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableBody>
            {hardwareSpecs.qubitCount && (
              <TableRow>
                <TableCell><strong>Qubit Count</strong></TableCell>
                <TableCell>{hardwareSpecs.qubitCount}</TableCell>
              </TableRow>
            )}
            {hardwareSpecs.technology && (
              <TableRow>
                <TableCell><strong>Technology</strong></TableCell>
                <TableCell>{hardwareSpecs.technology}</TableCell>
              </TableRow>
            )}
            {hardwareSpecs.connectivityType && (
              <TableRow>
                <TableCell><strong>Connectivity</strong></TableCell>
                <TableCell>{hardwareSpecs.connectivityType}</TableCell>
              </TableRow>
            )}
            {hardwareSpecs.coherenceTimeT1 && (
              <TableRow>
                <TableCell><strong>Coherence Time (T1)</strong></TableCell>
                <TableCell>{hardwareSpecs.coherenceTimeT1}</TableCell>
              </TableRow>
            )}
            {hardwareSpecs.coherenceTimeT2 && (
              <TableRow>
                <TableCell><strong>Coherence Time (T2)</strong></TableCell>
                <TableCell>{hardwareSpecs.coherenceTimeT2}</TableCell>
              </TableRow>
            )}
            {hardwareSpecs.gateTime && (
              <TableRow>
                <TableCell><strong>Gate Time</strong></TableCell>
                <TableCell>{hardwareSpecs.gateTime}</TableCell>
              </TableRow>
            )}
            {Object.keys(hardwareSpecs).length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography color="text.secondary">
                    Hardware specifications not available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: 3 }} />

      {/* Operational Details Section */}
      <Typography variant="h6" gutterBottom>
        Operational Details
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableBody>
            {operationalDetails.shotsRange && (
              <TableRow>
                <TableCell><strong>Shots Range</strong></TableCell>
                <TableCell>{operationalDetails.shotsRange}</TableCell>
              </TableRow>
            )}
            {operationalDetails.maxCircuitDepth && (
              <TableRow>
                <TableCell><strong>Max Circuit Depth</strong></TableCell>
                <TableCell>{operationalDetails.maxCircuitDepth}</TableCell>
              </TableRow>
            )}
            {operationalDetails.executionWindows && (
              <TableRow>
                <TableCell><strong>Execution Windows</strong></TableCell>
                <TableCell>{operationalDetails.executionWindows}</TableCell>
              </TableRow>
            )}
            {Object.keys(operationalDetails).length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography color="text.secondary">
                    Operational details not available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
