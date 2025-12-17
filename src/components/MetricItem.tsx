/**
 * MetricItem component - displays a metric with label above value.
 * Inspired by IBM Quantum design for dense, scannable information display.
 */

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface IMetricItemProps {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}

/**
 * Display a metric with label above value in a compact, scannable format.
 */
export const MetricItem: React.FC<IMetricItemProps> = ({
  label,
  value,
  tooltip
}) => {
  return (
    <Box>
      {/* Label with optional tooltip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          marginBottom: 0.5
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}
        >
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <InfoOutlinedIcon
              sx={{
                fontSize: '0.875rem',
                color: 'text.secondary',
                cursor: 'help'
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Value */}
      <Box>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              fontWeight: 600,
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
};
