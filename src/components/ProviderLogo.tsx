/**
 * ProviderLogo component - displays provider logo or placeholder.
 */

import React from 'react';
import { Avatar, Box } from '@mui/material';
import { getProviderLogo } from '../utils/logoMapper';

interface IProviderLogoProps {
  providerName: string;
  size?: number;
}

/**
 * Display provider logo with fallback to initial letter in circular avatar.
 */
export const ProviderLogo: React.FC<IProviderLogoProps> = ({
  providerName,
  size = 40
}) => {
  // Get first letter of provider name for fallback
  const initial = providerName.charAt(0).toUpperCase();

  // Look up the logo for this provider
  const logoUrl = getProviderLogo(providerName);

  if (logoUrl) {
    return (
      <Box
        component="img"
        src={logoUrl}
        alt={`${providerName} logo`}
        sx={{
          maxWidth: size,
          maxHeight: size * 0.667,
          objectFit: 'contain'
        }}
      />
    );
  }

  // Fallback: circular avatar with provider initial
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: 'primary.main',
        fontSize: size * 0.5,
        fontWeight: 600
      }}
    >
      {initial}
    </Avatar>
  );
};
