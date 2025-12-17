/**
 * CopyButton component - reusable button to copy text to clipboard.
 */

import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ICopyButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Button that copies text to clipboard and shows confirmation tooltip.
 */
export const CopyButton: React.FC<ICopyButtonProps> = ({
  text,
  size = 'small'
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Tooltip title={showCopied ? 'Copied!' : 'Copy to clipboard'} open={showCopied || undefined}>
      <IconButton size={size} onClick={handleCopy} aria-label="copy to clipboard">
        <ContentCopyIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};
