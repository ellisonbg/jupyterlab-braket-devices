/**
 * DeviceSummary component - shows device status, ARN, queue depths, and key specs.
 * Uses a multi-column grid layout for dense, scannable information display.
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IDeviceDetail, IParsedProperties } from '../types';
import { CopyButton } from './CopyButton';
import { MetricItem } from './MetricItem';
import { formatQueueDepth } from '../utils/propertiesParser';

interface IDeviceSummaryProps {
  device: IDeviceDetail;
  properties: IParsedProperties | null;
  onRefresh: () => void;
}

/**
 * Get chip color for device status.
 */
const getStatusColor = (
  status: string
): 'success' | 'default' | 'warning' => {
  if (status === 'ONLINE') {
    return 'success';
  }
  if (status === 'OFFLINE') {
    return 'default';
  }
  return 'warning';
};

/**
 * Summary section with status, ARN, queue depths, and actions.
 * Multi-column grid layout for better space utilization.
 */
export const DeviceSummary: React.FC<IDeviceSummaryProps> = ({
  device,
  properties,
  onRefresh
}) => {
  const queueDepths = device.queueDepth
    ? formatQueueDepth(device.queueDepth.quantumTasks)
    : [];

  const qubitCount = properties?.paradigm?.qubitCount;
  const location = properties?.service?.deviceLocation;

  // Calculate total queue depth for quick summary
  const totalQueueDepth = queueDepths.reduce(
    (sum, queue) => sum + Number(queue.value || 0),
    0
  );

  return (
    <Box>
      {/* Header with title and refresh button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3
        }}
      >
        <Typography variant="h6">Summary</Typography>
        <IconButton
          onClick={onRefresh}
          aria-label="refresh device info"
          size="small"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Primary metrics grid - responsive flex layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 3,
          marginBottom: 3
        }}
      >
        {/* Status */}
        <MetricItem
          label="Status"
          value={
            <Chip
              label={device.deviceStatus}
              color={getStatusColor(device.deviceStatus)}
              size="small"
            />
          }
        />

        {/* Qubits */}
        {qubitCount && <MetricItem label="Qubits" value={qubitCount} />}

        {/* Location */}
        {location && <MetricItem label="Location" value={location} />}

        {/* Total queue depth */}
        {queueDepths.length > 0 && (
          <MetricItem
            label="Total Queue"
            value={totalQueueDepth}
            tooltip="Total tasks across all queue types"
          />
        )}
      </Box>

      {/* Device ARN - full width */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.5px',
            display: 'block',
            marginBottom: 1
          }}
        >
          Device ARN
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexGrow: 1
            }}
          >
            {device.deviceArn}
          </Typography>
          <CopyButton text={device.deviceArn} />
        </Stack>
      </Box>
    </Box>
  );
};
