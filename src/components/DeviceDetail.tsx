/**
 * DeviceDetail component - main container for device detail view.
 */

import React, { useState, useEffect } from 'react';
import { Box, Skeleton, Alert, Button } from '@mui/material';
import { fetchDeviceDetail } from '../api';
import { IDeviceDetail } from '../types';
import { parseDeviceProperties } from '../utils/propertiesParser';
import { DeviceDetailHeader } from './DeviceDetailHeader';
import { DeviceSummary } from './DeviceSummary';
import { DeviceTabs } from './DeviceTabs';

interface IDeviceDetailProps {
  deviceArn: string;
  onBack: () => void;
}

/**
 * Device detail view showing comprehensive device information.
 */
export const DeviceDetail: React.FC<IDeviceDetailProps> = ({
  deviceArn,
  onBack
}) => {
  const [device, setDevice] = useState<IDeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeviceDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const deviceData = await fetchDeviceDetail(deviceArn);
      setDevice(deviceData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeviceDetail();
  }, [deviceArn]);

  const handleRefresh = () => {
    loadDeviceDetail();
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'auto',
          padding: 2
        }}
      >
        <Skeleton variant="rectangular" height={60} sx={{ marginBottom: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ marginBottom: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  // Error state
  if (error || !device) {
    return (
      <Box padding={2}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onBack}>
              Back to List
            </Button>
          }
        >
          {error || 'Failed to load device details'}
        </Alert>
      </Box>
    );
  }

  const properties = parseDeviceProperties(device.properties);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        padding: 4,
        gap: 3
      }}
    >
      {/* Header */}
      <DeviceDetailHeader device={device} onBack={onBack} />

      {/* Summary */}
      <DeviceSummary
        device={device}
        properties={properties}
        onRefresh={handleRefresh}
      />

      {/* Tabbed content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DeviceTabs device={device} properties={properties} />
      </Box>
    </Box>
  );
};
