/**
 * OperationalDetailsSection - displays Phase 3 operational details.
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { IDeviceDetail, IParsedProperties } from '../../types';
import { ParameterGrid, IParameter } from '../ParameterGrid';

interface IOperationalDetailsSectionProps {
  device: IDeviceDetail;
  properties: IParsedProperties | null;
}

/**
 * Format execution windows as human-readable schedule.
 */
function formatExecutionWindows(windows: any[]): string {
  if (!windows || windows.length === 0) {
    return 'N/A';
  }

  return windows
    .map(
      (window) =>
        `${window.executionDay}: ${window.windowStartHour} - ${window.windowEndHour}`
    )
    .join('; ');
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
 * Section showing operational details (Phase 3).
 */
export const OperationalDetailsSection: React.FC<
  IOperationalDetailsSectionProps
> = ({ device, properties }) => {
  const parameters: IParameter[] = [];

  // Execution Windows
  if (properties?.service?.executionWindows) {
    parameters.push({
      label: 'Execution Windows',
      value: formatExecutionWindows(properties.service.executionWindows)
    });
  }

  // Last Updated
  if (properties?.service?.updatedAt) {
    parameters.push({
      label: 'Last Updated',
      value: formatTimestamp(properties.service.updatedAt)
    });
  }

  // Queue Depth breakdown
  if (device.queueDepth?.quantumTasks) {
    const normalPriority =
      device.queueDepth.quantumTasks['QueueType.NORMAL'] ||
      device.queueDepth.quantumTasks['NORMAL'] ||
      0;
    parameters.push({
      label: 'Queue Depth (Normal)',
      value: normalPriority
    });

    const priorityTasks =
      device.queueDepth.quantumTasks['QueueType.PRIORITY'] ||
      device.queueDepth.quantumTasks['PRIORITY'] ||
      0;
    if (priorityTasks > 0) {
      parameters.push({
        label: 'Queue Depth (Priority)',
        value: priorityTasks
      });
    }
  }

  if (device.queueDepth?.jobs) {
    const jobs = parseInt(String(device.queueDepth.jobs), 10) || 0;
    if (jobs > 0) {
      parameters.push({
        label: 'Queue Depth (Jobs)',
        value: jobs
      });
    }
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
    ? Object.values(actionProps)[0] as any
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
        Operational Details
      </Typography>
      <ParameterGrid parameters={parameters} columns={{ xs: 1, sm: 2, md: 3, lg: 3 }} />
    </Box>
  );
};
