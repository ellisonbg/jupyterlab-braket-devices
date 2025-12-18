/**
 * EssentialMetricsSection - displays Phase 1 essential device metrics.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDeviceDetail, IParsedProperties } from '../../types';
import { ParameterGrid, IParameter } from '../ParameterGrid';

interface IEssentialMetricsSectionProps {
  device: IDeviceDetail;
  properties: IParsedProperties | null;
}

/**
 * Section showing essential device information (Phase 1/MVP).
 */
export const EssentialMetricsSection: React.FC<
  IEssentialMetricsSectionProps
> = ({ device, properties }) => {
  const parameters: IParameter[] = [];

  // Provider
  parameters.push({
    label: 'Provider',
    value: device.providerName
  });

  // Device Type
  parameters.push({
    label: 'Device Type',
    value: device.deviceType
  });

  // Region/Location
  if (properties?.service?.deviceLocation) {
    parameters.push({
      label: 'Region',
      value: properties.service.deviceLocation
    });
  }

  // Native Gate Set
  if (properties?.paradigm?.nativeGateSet) {
    const gates = Array.isArray(properties.paradigm.nativeGateSet)
      ? properties.paradigm.nativeGateSet.join(', ')
      : String(properties.paradigm.nativeGateSet);
    parameters.push({
      label: 'Native Gate Set',
      value: gates
    });
  }

  // Topology
  if (properties?.paradigm?.connectivity) {
    const topology = properties.paradigm.connectivity.fullyConnected
      ? 'Fully Connected'
      : 'Limited Connectivity';
    parameters.push({
      label: 'Topology',
      value: topology
    });
  }

  // Cost per Shot
  if (properties?.service?.deviceCost) {
    const cost = properties.service.deviceCost;
    const costStr = `$${cost.price}/${cost.unit}`;
    parameters.push({
      label: 'Cost per Shot',
      value: costStr
    });
  }

  // Shots Range
  if (properties?.service?.shotsRange) {
    const range = properties.service.shotsRange;
    const rangeStr = `${range[0].toLocaleString()} - ${range[1].toLocaleString()}`;
    parameters.push({
      label: 'Shots Range',
      value: rangeStr
    });
  }

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Details
      </Typography>
      <ParameterGrid parameters={parameters} columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} />
    </Box>
  );
};
