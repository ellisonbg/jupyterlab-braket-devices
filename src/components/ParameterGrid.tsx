/**
 * ParameterGrid component - reusable grid for displaying device parameters.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

export interface IParameter {
  label: string;
  value: string | number | React.ReactNode;
}

interface IParameterGridProps {
  parameters: IParameter[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

/**
 * Displays a responsive grid of label-value pairs.
 *
 * @param parameters - Array of parameters with label and value
 * @param columns - Optional responsive column configuration (defaults to 1/2/3/3)
 */
export const ParameterGrid: React.FC<IParameterGridProps> = ({
  parameters,
  columns = { xs: 1, sm: 2, md: 3, lg: 3 }
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs}, 1fr)`,
          sm: `repeat(${columns.sm}, 1fr)`,
          md: `repeat(${columns.md}, 1fr)`,
          lg: `repeat(${columns.lg}, 1fr)`
        },
        gap: 2
      }}
    >
      {parameters.map((param, index) => (
        <Box key={`${param.label}-${index}`}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, marginBottom: 0.5 }}
          >
            {param.label}
          </Typography>
          <Typography variant="body1">
            {param.value !== null && param.value !== undefined
              ? param.value
              : 'N/A'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
