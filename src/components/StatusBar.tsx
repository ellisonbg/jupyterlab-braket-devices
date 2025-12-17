/**
 * StatusBar component - displays device count summary.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDeviceSummary } from '../types';

interface IStatusBarProps {
  devices: IDeviceSummary[];
}

/**
 * Status bar showing device count statistics.
 */
export const StatusBar: React.FC<IStatusBarProps> = ({ devices }) => {
  const totalCount = devices.length;
  const onlineCount = devices.filter(d => d.deviceStatus === 'ONLINE').length;
  const offlineCount = devices.filter(d => d.deviceStatus === 'OFFLINE')
    .length;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {totalCount} {totalCount === 1 ? 'device' : 'devices'} • {onlineCount}{' '}
        online • {offlineCount} offline
      </Typography>
    </Box>
  );
};
