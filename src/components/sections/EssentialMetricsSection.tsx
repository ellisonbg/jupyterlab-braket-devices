/**
 * EssentialMetricsSection - displays Phase 1 essential device metrics.
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
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

  // Status with indicator
  const statusColor =
    device.deviceStatus === 'ONLINE'
      ? 'success'
      : device.deviceStatus === 'OFFLINE'
        ? 'error'
        : 'default';
  parameters.push({
    label: 'Status',
    value: <Chip label={device.deviceStatus} color={statusColor} size="small" />
  });

  // Region/Location
  if (properties?.service?.deviceLocation) {
    parameters.push({
      label: 'Region',
      value: properties.service.deviceLocation
    });
  }

  // Qubit Count
  if (properties?.paradigm?.qubitCount) {
    parameters.push({
      label: 'Qubit Count',
      value: properties.paradigm.qubitCount
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

  // Pending Jobs (sum of queue depths)
  if (device.queueDepth) {
    let totalPending = 0;
    if (device.queueDepth.quantumTasks) {
      totalPending = Object.values(device.queueDepth.quantumTasks).reduce(
        (sum, count) => sum + count,
        0
      );
    }
    if (device.queueDepth.jobs) {
      totalPending += parseInt(String(device.queueDepth.jobs), 10) || 0;
    }
    parameters.push({
      label: 'Pending Jobs',
      value: totalPending
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
        Essential Metrics
      </Typography>
      <ParameterGrid parameters={parameters} />
    </Box>
  );
};
