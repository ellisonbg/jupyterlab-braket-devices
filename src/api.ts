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
 * Clean device type strings by removing the "AwsDeviceType." prefix.
 * Transforms "AwsDeviceType.QPU" to "QPU" and "AwsDeviceType.SIMULATOR" to "Simulator".
 *
 * @param deviceType - Raw device type string from the backend
 * @returns Cleaned device type string
 */
function cleanDeviceType(deviceType: string): string {
  if (deviceType.includes('QPU')) {
    return 'QPU';
  }
  if (deviceType.includes('SIMULATOR')) {
    return 'Simulator';
  }
  return deviceType; // fallback for unknown types
}

/**
 * Result from fetchDevices including devices and optional warnings.
 */
export interface IFetchDevicesResult {
  devices: IDeviceSummary[];
  warnings?: string[];
  error?: {
    message: string;
    type?: string;
    details?: string;
  };
}

/**
 * Fetch the list of all available Braket devices.
 *
 * @returns Promise resolving to devices and optional warnings
 * @throws Error with descriptive message if the request fails
 */
export async function fetchDevices(): Promise<IFetchDevicesResult> {
  try {
    const response = await requestAPI<IDevicesResponse>('devices', {
      method: 'GET'
    });

    if (response.status === 'error') {
      const error = {
        message: response.message || 'Failed to fetch devices',
        type: response.type,
        details: response.details
      };
      throw new Error(JSON.stringify(error));
    }

    // Clean device types before returning
    const cleanedDevices = (response.devices || []).map(device => ({
      ...device,
      deviceType: cleanDeviceType(device.deviceType)
    }));

    return {
      devices: cleanedDevices,
      warnings: response.warnings
    };
  } catch (err) {
    // Extract detailed error information from ResponseError
    if (err instanceof ServerConnection.ResponseError) {
      const status = err.response.status;
      let detail = err.message;

      // Try to parse JSON error response
      try {
        const errorData = JSON.parse(detail);
        throw new Error(
          JSON.stringify({
            message: errorData.message || `Request failed (${status})`,
            type: errorData.type,
            details: errorData.details
          })
        );
      } catch {
        // Not JSON, handle as plain text
        // Truncate HTML responses for cleaner error messages
        if (
          typeof detail === 'string' &&
          (detail.includes('<!DOCTYPE') || detail.includes('<html'))
        ) {
          detail = `HTML error page (${detail.substring(0, 100)}...)`;
        }

        throw new Error(
          JSON.stringify({
            message: `Failed to fetch devices (${status})`,
            type: status === 401 ? 'auth' : 'server_error',
            details: detail
          })
        );
      }
    }

    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(
      JSON.stringify({
        message: `Failed to fetch devices: ${msg}`,
        type: 'network'
      })
    );
  }
}

/**
 * Result from fetchDeviceDetail including device and optional warnings.
 */
export interface IFetchDeviceDetailResult {
  device: IDeviceDetail;
  warnings?: string[];
  error?: {
    message: string;
    type?: string;
    details?: string;
  };
}

/**
 * Fetch detailed information for a specific device.
 *
 * @param deviceArn - The ARN of the device to fetch
 * @returns Promise resolving to device details and optional warnings
 * @throws Error with descriptive message if the request fails
 */
export async function fetchDeviceDetail(
  deviceArn: string
): Promise<IFetchDeviceDetailResult> {
  try {
    const response = await requestAPI<IDeviceResponse>(
      `devices?deviceArn=${encodeURIComponent(deviceArn)}`,
      {
        method: 'GET'
      }
    );

    if (response.status === 'error') {
      const error = {
        message: response.message || 'Failed to fetch device details',
        type: response.type,
        details: response.details
      };
      throw new Error(JSON.stringify(error));
    }

    if (!response.device) {
      throw new Error(
        JSON.stringify({
          message: 'Device not found in response',
          type: 'not_found'
        })
      );
    }

    // Clean device type before returning
    const cleanedDevice = {
      ...response.device,
      deviceType: cleanDeviceType(response.device.deviceType)
    };

    return {
      device: cleanedDevice,
      warnings: response.warnings
    };
  } catch (err) {
    // Extract detailed error information from ResponseError
    if (err instanceof ServerConnection.ResponseError) {
      const status = err.response.status;
      let detail = err.message;

      // Try to parse JSON error response
      try {
        const errorData = JSON.parse(detail);
        throw new Error(
          JSON.stringify({
            message: errorData.message || `Request failed (${status})`,
            type: errorData.type,
            details: errorData.details
          })
        );
      } catch {
        // Not JSON, handle as plain text
        // Truncate HTML responses for cleaner error messages
        if (
          typeof detail === 'string' &&
          (detail.includes('<!DOCTYPE') || detail.includes('<html'))
        ) {
          detail = `HTML error page (${detail.substring(0, 100)}...)`;
        }

        throw new Error(
          JSON.stringify({
            message: `Failed to fetch device details (${status})`,
            type: status === 401 ? 'auth' : 'server_error',
            details: detail
          })
        );
      }
    }

    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(
      JSON.stringify({
        message: `Failed to fetch device details: ${msg}`,
        type: 'network'
      })
    );
  }
}
