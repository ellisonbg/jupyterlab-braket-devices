/**
 * API functions for interacting with the Braket devices backend.
 */

import { ServerConnection } from '@jupyterlab/services';
import { requestAPI } from './request';
import {
  IDeviceSummary,
  IDeviceDetail,
  IDevicesResponse,
  IDeviceResponse
} from './types';

/**
 * Fetch the list of all available Braket devices.
 *
 * @returns Promise resolving to array of device summaries
 * @throws Error with descriptive message if the request fails
 */
export async function fetchDevices(): Promise<IDeviceSummary[]> {
  try {
    const response = await requestAPI<IDevicesResponse>('devices', {
      method: 'GET'
    });

    if (response.status === 'error') {
      throw new Error(response.message || 'Failed to fetch devices');
    }

    return response.devices || [];
  } catch (err) {
    // Extract detailed error information from ResponseError
    if (err instanceof ServerConnection.ResponseError) {
      const status = err.response.status;
      let detail = err.message;

      // Truncate HTML responses for cleaner error messages
      if (
        typeof detail === 'string' &&
        (detail.includes('<!DOCTYPE') || detail.includes('<html'))
      ) {
        detail = `HTML error page (${detail.substring(0, 100)}...)`;
      }

      throw new Error(`Failed to fetch devices (${status}): ${detail}`);
    }

    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to fetch devices: ${msg}`);
  }
}

/**
 * Fetch detailed information for a specific device.
 *
 * @param deviceArn - The ARN of the device to fetch
 * @returns Promise resolving to device details
 * @throws Error with descriptive message if the request fails
 */
export async function fetchDeviceDetail(
  deviceArn: string
): Promise<IDeviceDetail> {
  try {
    const response = await requestAPI<IDeviceResponse>(
      `devices?deviceArn=${encodeURIComponent(deviceArn)}`,
      {
        method: 'GET'
      }
    );

    if (response.status === 'error') {
      throw new Error(response.message || 'Failed to fetch device details');
    }

    if (!response.device) {
      throw new Error('Device not found in response');
    }

    return response.device;
  } catch (err) {
    // Extract detailed error information from ResponseError
    if (err instanceof ServerConnection.ResponseError) {
      const status = err.response.status;
      let detail = err.message;

      // Truncate HTML responses for cleaner error messages
      if (
        typeof detail === 'string' &&
        (detail.includes('<!DOCTYPE') || detail.includes('<html'))
      ) {
        detail = `HTML error page (${detail.substring(0, 100)}...)`;
      }

      throw new Error(`Failed to fetch device details (${status}): ${detail}`);
    }

    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to fetch device details: ${msg}`);
  }
}
