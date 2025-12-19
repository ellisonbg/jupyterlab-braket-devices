import { ReactWidget } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, ThemeProvider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { fetchDevices } from './api';
import { IDeviceSummary, ApiErrorType } from './types';
import { DeviceList } from './components/DeviceList';
import { FilterBar, IFilterOptions } from './components/FilterBar';
import { StatusBar } from './components/StatusBar';
import { DeviceDetail } from './components/DeviceDetail';
import { ErrorBanner } from './components/ErrorBanner';
import { getJupyterLabTheme } from './theme-provider';

interface IBraketDevicesComponentProps {
  commands: CommandRegistry;
}

/**
 * React component for Braket Devices Explorer.
 */
const BraketDevicesComponent = ({
  commands
}: IBraketDevicesComponentProps): JSX.Element => {
  const [devices, setDevices] = useState<IDeviceSummary[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [sortBy, setSortBy] = useState<'provider' | 'name' | 'status' | 'type'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Navigation state
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedDeviceArn, setSelectedDeviceArn] = useState<string | null>(
    null
  );

  // Create theme that responds to JupyterLab theme changes
  const theme = useMemo(() => getJupyterLabTheme(), []);

  // Load devices
  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    setErrorType(undefined);
    setErrorDetails(undefined);
    setWarnings(undefined);
    try {
      const result = await fetchDevices();
      setDevices(result.devices);
      setWarnings(result.warnings);
    } catch (err) {
      // Parse JSON error from API
      try {
        const errorData = JSON.parse(
          err instanceof Error ? err.message : String(err)
        );
        setError(errorData.message || 'Failed to fetch devices');
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

  // Load devices on mount
  useEffect(() => {
    loadDevices();
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

  const handleSort = (field: 'provider' | 'name' | 'status' | 'type') => {
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
            onClick={loadDevices}
            disabled={loading}
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
        {error && !loading && (
          <ErrorBanner
            message={error}
            type={errorType}
            details={errorDetails}
            severity="error"
            onRetry={loadDevices}
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
            loading={loading}
            error={null}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onDeviceClick={handleDeviceClick}
            onRetry={loadDevices}
            onSort={handleSort}
          />
        </Box>

        {/* Status Bar */}
        {!loading && !error && <StatusBar devices={filteredDevices} />}
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

