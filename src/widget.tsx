import { ReactWidget } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, ThemeProvider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { fetchDeviceStatuses } from './api';
import { IDeviceSummary, ApiErrorType } from './types';
import { DeviceList } from './components/DeviceList';
import { FilterBar, IFilterOptions } from './components/FilterBar';
import { StatusBar } from './components/StatusBar';
import { DeviceDetail } from './components/DeviceDetail';
import { ErrorBanner } from './components/ErrorBanner';
import { getJupyterLabTheme } from './theme-provider';
import { STATIC_DEVICES } from './staticDeviceData';

interface IBraketDevicesComponentProps {
  commands: CommandRegistry;
}

/**
 * React component for Braket Devices Explorer.
 */
const BraketDevicesComponent = ({
  commands
}: IBraketDevicesComponentProps): JSX.Element => {
  // Initialize devices with static data and LOADING status
  const [devices, setDevices] = useState<IDeviceSummary[]>(
    STATIC_DEVICES.map(device => ({
      ...device,
      deviceStatus: 'LOADING'
    }))
  );
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ApiErrorType | undefined>(
    undefined
  );
  const [errorDetails, setErrorDetails] = useState<string | undefined>(
    undefined
  );
  const [warnings, setWarnings] = useState<string[] | undefined>(undefined);
  const [filters, setFilters] = useState<IFilterOptions>({
    searchQuery: '',
    typeFilter: 'all',
    statusFilter: 'all',
    providerFilter: 'all'
  });

  // Sort state
  const [sortBy, setSortBy] = useState<'provider' | 'name' | 'status' | 'type' | 'qubits'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Navigation state
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedDeviceArn, setSelectedDeviceArn] = useState<string | null>(
    null
  );

  // Create theme that responds to JupyterLab theme changes
  const theme = useMemo(() => getJupyterLabTheme(), []);

  // Load device statuses (async)
  const loadDeviceStatuses = async () => {
    setStatusLoading(true);
    setError(null);
    setErrorType(undefined);
    setErrorDetails(undefined);
    setWarnings(undefined);

    // Set all devices to LOADING status
    setDevices(prevDevices =>
      prevDevices.map(device => ({
        ...device,
        deviceStatus: 'LOADING'
      }))
    );

    try {
      const result = await fetchDeviceStatuses();
      const statusMap = result.statuses;

      // Update devices with real status
      setDevices(prevDevices =>
        prevDevices.map(device => ({
          ...device,
          deviceStatus: statusMap[device.deviceArn] || 'UNKNOWN'
        }))
      );
    } catch (err) {
      // Parse JSON error from API
      try {
        const errorData = JSON.parse(
          err instanceof Error ? err.message : String(err)
        );
        setError(errorData.message || 'Failed to fetch device statuses');
        setErrorType(errorData.type);
        setErrorDetails(errorData.details);
      } catch {
        // Fallback to plain error message
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      }

      // On error, set all to UNKNOWN status
      setDevices(prevDevices =>
        prevDevices.map(device => ({
          ...device,
          deviceStatus: 'UNKNOWN'
        }))
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // Load device statuses on mount
  useEffect(() => {
    loadDeviceStatuses();
  }, []);

  // Get unique providers for filter dropdown
  const providers = useMemo(() => {
    const providerSet = new Set(devices.map(d => d.providerName));
    return Array.from(providerSet).sort();
  }, [devices]);

  // Apply filters and sorting
  const filteredDevices = useMemo(() => {
    let filtered = [...devices];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.deviceName.toLowerCase().includes(query) ||
          d.providerName.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filters.typeFilter !== 'all') {
      filtered = filtered.filter(d =>
        d.deviceType.toUpperCase().includes(filters.typeFilter.toUpperCase())
      );
    }

    // Apply status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(d => d.deviceStatus === filters.statusFilter);
    }

    // Apply provider filter
    if (filters.providerFilter !== 'all') {
      filtered = filtered.filter(d => d.providerName === filters.providerFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.deviceName.localeCompare(b.deviceName);
          break;
        case 'provider':
          comparison = a.providerName.localeCompare(b.providerName);
          break;
        case 'status':
          comparison = a.deviceStatus.localeCompare(b.deviceStatus);
          break;
        case 'type':
          comparison = a.deviceType.localeCompare(b.deviceType);
          break;
        case 'qubits':
          // Handle undefined qubit counts (treat as -1 for sorting)
          const aQubits = a.qubitCount ?? -1;
          const bQubits = b.qubitCount ?? -1;
          comparison = aQubits - bQubits;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [devices, filters, sortBy, sortDirection]);

  const handleDeviceClick = (device: IDeviceSummary) => {
    setSelectedDeviceArn(device.deviceArn);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDeviceArn(null);
  };

  const handleSort = (field: 'provider' | 'name' | 'status' | 'type' | 'qubits') => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleJobsClick = () => {
    commands.execute('scheduling:list-jobs-from-launcher');
  };

  // Check if the scheduling command is available
  const hasSchedulingCommand = commands.hasCommand('scheduling:list-jobs-from-launcher');

  // Show detail view if a device is selected
  if (currentView === 'detail' && selectedDeviceArn) {
    return (
      <ThemeProvider theme={theme}>
        <DeviceDetail deviceArn={selectedDeviceArn} onBack={handleBackToList} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          padding: 5,
          gap: 3
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Braket Devices
          </Typography>
          <IconButton
            onClick={loadDeviceStatuses}
            disabled={statusLoading}
            aria-label="refresh"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          providers={providers}
          onJobsClick={hasSchedulingCommand ? handleJobsClick : undefined}
        />

        {/* Error Banner - shown below toolbar but above content */}
        {error && !statusLoading && (
          <ErrorBanner
            message={error}
            type={errorType}
            details={errorDetails}
            severity="error"
            onRetry={loadDeviceStatuses}
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

        {/* Device List (scrollable content) */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <DeviceList
            devices={filteredDevices}
            loading={false}
            error={null}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onDeviceClick={handleDeviceClick}
            onRetry={loadDeviceStatuses}
            onSort={handleSort}
          />
        </Box>

        {/* Status Bar */}
        {!error && <StatusBar devices={filteredDevices} />}
      </Box>
    </ThemeProvider>
  );
};

/**
 * A Braket Devices Lumino Widget that wraps the React component.
 */
export class BraketDevicesWidget extends ReactWidget {
  private _commands: CommandRegistry;

  /**
   * Constructs a new BraketDevicesWidget.
   */
  constructor(commands: CommandRegistry) {
    super();
    this._commands = commands;
    this.addClass('jp-react-widget');
  }

  render(): JSX.Element {
    return <BraketDevicesComponent commands={this._commands} />;
  }
}

