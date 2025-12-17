/**
 * DeviceDetailHeader component - header for device detail view.
 */

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IDeviceDetail } from '../types';
import { ProviderLogo } from './ProviderLogo';

interface IDeviceDetailHeaderProps {
  device: IDeviceDetail;
  onBack: () => void;
}

/**
 * Header showing back button, device name, and provider logo.
 */
export const DeviceDetailHeader: React.FC<IDeviceDetailHeaderProps> = ({
  device,
  onBack
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {/* Left: Back button and device name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
        <IconButton onClick={onBack} aria-label="back to list" size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          {device.deviceName}
        </Typography>
      </Box>

      {/* Right: Provider logo */}
      <ProviderLogo providerName={device.providerName} size={48} />
    </Box>
  );
};
