/**
 * DeviceTabs component - tabbed interface for device details.
 */

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { IDeviceDetail, IParsedProperties } from '../types';
import { DetailsTab } from './tabs/DetailsTab';
import { CalibrationTab } from './tabs/CalibrationTab';
import { NativeGatesTab } from './tabs/NativeGatesTab';

interface IDeviceTabsProps {
  device: IDeviceDetail;
  properties: IParsedProperties | null;
}

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel container.
 */
function TabPanel(props: ITabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`device-tabpanel-${index}`}
      aria-labelledby={`device-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * Tabbed interface showing device details, calibration, and native gates.
 */
export const DeviceTabs: React.FC<IDeviceTabsProps> = ({
  device,
  properties
}) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const isQPU = device.deviceType.toUpperCase().includes('QPU');

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="device detail tabs"
      >
        <Tab label="Details" id="device-tab-0" aria-controls="device-tabpanel-0" />
        {isQPU && (
          <Tab label="Calibration" id="device-tab-1" aria-controls="device-tabpanel-1" />
        )}
        <Tab
          label="Native Gates"
          id={`device-tab-${isQPU ? 2 : 1}`}
          aria-controls={`device-tabpanel-${isQPU ? 2 : 1}`}
        />
      </Tabs>

      <TabPanel value={currentTab} index={0}>
        <DetailsTab properties={properties} />
      </TabPanel>

      {isQPU && (
        <TabPanel value={currentTab} index={1}>
          <CalibrationTab properties={properties} />
        </TabPanel>
      )}

      <TabPanel value={currentTab} index={isQPU ? 2 : 1}>
        <NativeGatesTab properties={properties} />
      </TabPanel>
    </Box>
  );
};
