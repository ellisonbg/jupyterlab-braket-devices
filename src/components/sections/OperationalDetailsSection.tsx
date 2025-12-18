/**
 * OperationalDetailsSection - displays Phase 3 operational details.
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { IDeviceDetail, IParsedProperties } from '../../types';
import { ParameterGrid, IParameter } from '../ParameterGrid';

interface IOperationalDetailsSectionProps {
  device: IDeviceDetail;
  properties: IParsedProperties | null;
}

/**
 * Format timestamp as human-readable date.
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

/**
 * Format time from HH:MM:SS UTC to local time with timezone indicator.
 */
function formatTime(time: string): string {
  // Parse UTC time and convert to local time
  const [hours, minutes] = time.split(':');
  const utcHour = parseInt(hours, 10);
  const minuteValue = parseInt(minutes, 10);

  // Create a date object in UTC
  const utcDate = new Date();
  utcDate.setUTCHours(utcHour, minuteValue, 0, 0);

  // Get local time
  const localHour = utcDate.getHours();
  const localMinutes = utcDate.getMinutes();

  // Format in 12-hour format with timezone
  const ampm = localHour >= 12 ? 'PM' : 'AM';
  const hour12 = localHour % 12 || 12;
  const formattedMinutes = localMinutes.toString().padStart(2, '0');

  // Get timezone abbreviation
  const timezoneName = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short'
  }).formatToParts(utcDate).find(part => part.type === 'timeZoneName')?.value || '';

  return `${hour12}:${formattedMinutes} ${ampm} ${timezoneName}`;
}

/**
 * Section showing operational details (Phase 3).
 */
export const OperationalDetailsSection: React.FC<
  IOperationalDetailsSectionProps
> = ({ device, properties }) => {
  const parameters: IParameter[] = [];
  const executionWindows = properties?.service?.executionWindows;

  // Last Updated
  if (properties?.service?.updatedAt) {
    parameters.push({
      label: 'Last Updated',
      value: formatTimestamp(properties.service.updatedAt)
    });
  }

  // Max Executables (for program set actions)
  const actionProps = properties?.action as any;
  if (actionProps?.['braket.ir.openqasm.program_set']) {
    const programSet = actionProps['braket.ir.openqasm.program_set'];
    if (programSet.maximumExecutables) {
      parameters.push({
        label: 'Max Executables',
        value: programSet.maximumExecutables
      });
    }
    if (programSet.maximumTotalShots) {
      parameters.push({
        label: 'Max Total Shots',
        value: programSet.maximumTotalShots.toLocaleString()
      });
    }
  }

  // Supported Result Types
  const firstAction = actionProps
    ? (Object.values(actionProps)[0] as any)
    : null;
  if (firstAction?.supportedResultTypes) {
    const resultTypes = firstAction.supportedResultTypes.map(
      (rt: any) => rt.name
    );
    parameters.push({
      label: 'Supported Result Types',
      value: (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {resultTypes.map((type: string) => (
            <Chip key={type} label={type} size="small" variant="outlined" />
          ))}
        </Box>
      )
    });
  }

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Operations
      </Typography>

      {/* First row: Main parameters */}
      <ParameterGrid
        parameters={parameters}
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      />

      {/* Second row: Availability table */}
      {executionWindows && executionWindows.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, marginBottom: 1 }}
          >
            Availability
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxWidth: 320 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executionWindows.map((window: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{window.executionDay}</TableCell>
                    <TableCell>{formatTime(window.windowStartHour)}</TableCell>
                    <TableCell>{formatTime(window.windowEndHour)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};
