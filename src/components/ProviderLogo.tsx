/**
 * ProviderLogo component - displays provider logo or placeholder.
 */

import React from 'react';
import { Avatar, Box } from '@mui/material';

interface IProviderLogoProps {
  providerName: string;
  logoUrl?: string;
  size?: number;
}

/**
 * Display provider logo with fallback to initial letter in circular avatar.
 */
export const ProviderLogo: React.FC<IProviderLogoProps> = ({
  providerName,
  logoUrl,
  size = 40
}) => {
  // Get first letter of provider name for fallback
  const initial = providerName.charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <Box
        component="img"
        src={logoUrl}
        alt={`${providerName} logo`}
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: '50%'
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
