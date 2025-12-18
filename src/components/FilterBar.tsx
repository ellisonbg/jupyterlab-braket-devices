/**
 * FilterBar component - provides search, filter, and sort controls.
 */

import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  InputLabel,
  FormControl,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface IFilterOptions {
  searchQuery: string;
  typeFilter: 'all' | 'QPU' | 'Simulator';
  statusFilter: 'all' | 'ONLINE' | 'OFFLINE';
  providerFilter: string;
}

interface IFilterBarProps {
  filters: IFilterOptions;
  onFiltersChange: (filters: IFilterOptions) => void;
  providers: string[];
}

/**
 * Filter bar with search, filters, and sort controls.
 */
export const FilterBar: React.FC<IFilterBarProps> = ({
  filters,
  onFiltersChange,
  providers
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: event.target.value
    });
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      typeFilter: event.target.value as IFilterOptions['typeFilter']
    });
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      statusFilter: event.target.value as IFilterOptions['statusFilter']
    });
  };

  const handleProviderFilterChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      providerFilter: event.target.value
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      typeFilter: 'all',
      statusFilter: 'all',
      providerFilter: 'all'
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.typeFilter !== 'all' ||
    filters.statusFilter !== 'all' ||
    filters.providerFilter !== 'all';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Search bar */}
      <TextField
        size="small"
        placeholder="Search devices..."
        value={filters.searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        fullWidth
      />

      {/* Filter and sort controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center'
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.typeFilter}
            onChange={handleTypeFilterChange}
            label="Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="QPU">QPU</MenuItem>
            <MenuItem value="Simulator">Simulator</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="ONLINE">Online</MenuItem>
            <MenuItem value="OFFLINE">Offline</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Provider</InputLabel>
          <Select
            value={filters.providerFilter}
            onChange={handleProviderFilterChange}
            label="Provider"
          >
            <MenuItem value="all">All Providers</MenuItem>
            {providers.map(provider => (
              <MenuItem key={provider} value={provider}>
                {provider}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="medium"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {filters.searchQuery && (
            <Chip
              label={`Search: ${filters.searchQuery}`}
              size="small"
              onDelete={() => {
                onFiltersChange({ ...filters, searchQuery: '' });
              }}
            />
          )}
          {filters.typeFilter !== 'all' && (
            <Chip
              label={`Type: ${filters.typeFilter}`}
              size="small"
              onDelete={() => {
                onFiltersChange({ ...filters, typeFilter: 'all' });
              }}
            />
          )}
          {filters.statusFilter !== 'all' && (
            <Chip
              label={`Status: ${filters.statusFilter}`}
              size="small"
              onDelete={() => {
                onFiltersChange({ ...filters, statusFilter: 'all' });
              }}
            />
          )}
          {filters.providerFilter !== 'all' && (
            <Chip
              label={`Provider: ${filters.providerFilter}`}
              size="small"
              onDelete={() => {
                onFiltersChange({ ...filters, providerFilter: 'all' });
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
