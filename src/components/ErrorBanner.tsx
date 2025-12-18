/**
 * ErrorBanner component - displays persistent error/warning banners.
 */

import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Collapse,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ApiErrorType } from '../types';

interface IErrorBannerProps {
  /** Error or warning message to display */
  message: string;
  /** Optional error type for appropriate styling */
  type?: ApiErrorType;
  /** Severity level - defaults to 'error' */
  severity?: 'error' | 'warning' | 'info';
  /** Optional detailed error information */
  details?: string;
  /** Whether the banner can be dismissed */
  dismissable?: boolean;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
  /** Optional retry action */
  onRetry?: () => void;
  /** Optional array of warning messages */
  warnings?: string[];
}

/**
 * Get user-friendly title based on error type.
 */
function getErrorTitle(type?: ApiErrorType, severity?: string): string {
  if (severity === 'warning') {
    return 'Warning';
  }

  switch (type) {
    case 'auth':
      return 'Authentication Error';
    case 'permission':
      return 'Permission Denied';
    case 'not_found':
      return 'Not Found';
    case 'validation':
      return 'Invalid Request';
    case 'network':
      return 'Network Error';
    case 'server_error':
      return 'Server Error';
    default:
      return 'Error';
  }
}

/**
 * Persistent error/warning banner component.
 * Displays under headers without replacing content.
 */
export const ErrorBanner: React.FC<IErrorBannerProps> = ({
  message,
  type,
  severity = 'error',
  details,
  dismissable = true,
  onDismiss,
  onRetry,
  warnings
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasDetails = details || (warnings && warnings.length > 0);

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (dismissed) {
    return null;
  }

  const title = getErrorTitle(type, severity);

  return (
    <Alert
      severity={severity}
      sx={{ marginBottom: 2 }}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasDetails && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )}
          {dismissable && (
            <IconButton
              size="small"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}

      {/* Expandable details */}
      {hasDetails && (
        <Collapse in={expanded} timeout="auto">
          <Box sx={{ marginTop: 1, fontSize: '0.875rem' }}>
            {details && (
              <Box
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: 1,
                  borderRadius: 1,
                  marginTop: 1,
                  wordBreak: 'break-word'
                }}
              >
                {details}
              </Box>
            )}
            {warnings && warnings.length > 0 && (
              <Box sx={{ marginTop: 1 }}>
                <strong>Additional Issues:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Alert>
  );
};
