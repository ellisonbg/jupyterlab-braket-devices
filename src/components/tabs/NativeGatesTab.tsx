/**
 * NativeGatesTab component - shows supported quantum gates.
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
  Chip
} from '@mui/material';
import { IParsedProperties } from '../../types';
import { extractNativeGates } from '../../utils/propertiesParser';

interface INativeGatesTabProps {
  properties: IParsedProperties | null;
}

/**
 * Native gates tab showing supported quantum operations.
 */
export const NativeGatesTab: React.FC<INativeGatesTabProps> = ({
  properties
}) => {
  const gates = extractNativeGates(properties);

  if (gates.length === 0) {
    return (
      <Box>
        <Typography color="text.secondary">
          Native gates information not available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Supported Quantum Gates
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Gate Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gates.map((gate, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Chip
                    label={gate.name}
                    size="small"
                    variant={gate.isNative ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  {gate.type || <Typography color="text.secondary">-</Typography>}
                </TableCell>
                <TableCell>
                  {gate.description || (
                    <Typography color="text.secondary">-</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
