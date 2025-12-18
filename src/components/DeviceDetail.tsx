/**
 * DeviceDetail component - main container for device detail view.
 */

import React, { useState, useEffect } from 'react';
import { Box, Skeleton, Alert, Button } from '@mui/material';
import { fetchDeviceDetail } from '../api';
import { IDeviceDetail, ApiErrorType } from '../types';
import { parseDeviceProperties } from '../utils/propertiesParser';
import { DeviceDetailHeader } from './DeviceDetailHeader';
import { DeviceSummary } from './DeviceSummary';
import { ErrorBanner } from './ErrorBanner';
import { EssentialMetricsSection } from './sections/EssentialMetricsSection';
import { PerformanceMetricsSection } from './sections/PerformanceMetricsSection';
import { OperationalDetailsSection } from './sections/OperationalDetailsSection';

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
  const [errorType, setErrorType] = useState<ApiErrorType | undefined>(
    undefined
  );
  const [errorDetails, setErrorDetails] = useState<string | undefined>(
    undefined
  );
  const [warnings, setWarnings] = useState<string[] | undefined>(undefined);

  const loadDeviceDetail = async () => {
    setLoading(true);
    setError(null);
    setErrorType(undefined);
    setErrorDetails(undefined);
    setWarnings(undefined);
    try {
      const result = await fetchDeviceDetail(deviceArn);
      setDevice(result.device);
      setWarnings(result.warnings);
    } catch (err) {
      // Parse JSON error from API
      try {
        const errorData = JSON.parse(
          err instanceof Error ? err.message : String(err)
        );
        setError(errorData.message || 'Failed to fetch device details');
        setErrorType(errorData.type);
        setErrorDetails(errorData.details);
      } catch {
        // Fallback to plain error message
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      }
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

      {/* Error Banner - shown below header but above content */}
      {error && !loading && (
        <ErrorBanner
          message={error}
          type={errorType}
          details={errorDetails}
          severity="error"
          onRetry={loadDeviceDetail}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Warning Banner - for partial failures */}
      {warnings && warnings.length > 0 && !error && (
        <ErrorBanner
          message="Some device information could not be loaded"
          severity="warning"
          warnings={warnings}
          dismissable={true}
          onDismiss={() => setWarnings(undefined)}
        />
      )}

      {/* Summary */}
      <DeviceSummary
        device={device}
        properties={properties}
        onRefresh={handleRefresh}
      />

      {/* Sectioned content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <EssentialMetricsSection device={device} properties={properties} />
        <PerformanceMetricsSection device={device} properties={properties} />
        <OperationalDetailsSection device={device} properties={properties} />
      </Box>
    </Box>
  );
};
