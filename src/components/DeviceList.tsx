/**
 * DeviceList component - displays devices in a table.
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  Skeleton,
  Alert,
  Button,
  TableSortLabel,
  CircularProgress
} from '@mui/material';
import { IDeviceSummary } from '../types';

type SortField = 'provider' | 'name' | 'status' | 'type' | 'qubits';
type SortDirection = 'asc' | 'desc';

interface IDeviceListProps {
  devices: IDeviceSummary[];
  loading: boolean;
  error: string | null;
  sortBy: SortField;
  sortDirection: SortDirection;
  onDeviceClick: (device: IDeviceSummary) => void;
  onRetry: () => void;
  onSort: (field: SortField) => void;
}

/**
 * Get chip color for device status.
 */
const getStatusColor = (
  status: string
): 'success' | 'error' | 'warning' | 'default' => {
  if (status === 'ONLINE') {
    return 'success';
  }
  if (status === 'OFFLINE') {
    return 'error';
  }
  if (status === 'LOADING') {
    return 'default';
  }
  return 'warning';
};

/**
 * Get chip variant for device type.
 */
const getTypeVariant = (type: string): 'filled' | 'outlined' => {
  return type.toUpperCase().includes('QPU') ? 'filled' : 'outlined';
};

/**
 * Device list table component with sortable headers.
 */
export const DeviceList: React.FC<IDeviceListProps> = ({
  devices,
  loading,
  error,
  sortBy,
  sortDirection,
  onDeviceClick,
  onRetry,
  onSort
}) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ padding: 0 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} height={60} sx={{ marginBottom: 1 }} />
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (devices.length === 0) {
    return (
      <Box
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No devices found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or refresh the list
        </Typography>
      </Box>
    );
  }

  // Device table
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: 'action.hover'
              }}
            >
              <TableSortLabel
                active={sortBy === 'provider'}
                direction={sortBy === 'provider' ? sortDirection : 'asc'}
                onClick={() => onSort('provider')}
              >
                Provider
              </TableSortLabel>
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: 'action.hover'
              }}
            >
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortBy === 'name' ? sortDirection : 'asc'}
                onClick={() => onSort('name')}
              >
                Device Name
              </TableSortLabel>
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: 'action.hover'
              }}
            >
              <TableSortLabel
                active={sortBy === 'qubits'}
                direction={sortBy === 'qubits' ? sortDirection : 'asc'}
                onClick={() => onSort('qubits')}
              >
                Qubits
              </TableSortLabel>
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: 'action.hover'
              }}
            >
              <TableSortLabel
                active={sortBy === 'type'}
                direction={sortBy === 'type' ? sortDirection : 'asc'}
                onClick={() => onSort('type')}
              >
                Type
              </TableSortLabel>
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                backgroundColor: 'action.hover'
              }}
            >
              <TableSortLabel
                active={sortBy === 'status'}
                direction={sortBy === 'status' ? sortDirection : 'asc'}
                onClick={() => onSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {devices.map(device => (
              <TableRow
                key={device.deviceArn}
                hover
                onClick={() => {
                  onDeviceClick(device);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{device.providerName}</TableCell>
                <TableCell>{device.deviceName}</TableCell>
                <TableCell>
                  {device.qubitCount !== undefined ? device.qubitCount : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={device.deviceType}
                    variant={getTypeVariant(device.deviceType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {device.deviceStatus === 'LOADING' ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Loading...
                      </Typography>
                    </Box>
                  ) : (
                    <Chip
                      label={device.deviceStatus}
                      color={getStatusColor(device.deviceStatus)}
                      size="small"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
