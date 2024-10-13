import React from 'react';
import { Alert } from '@mui/material';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react'; // Icon imports

const ValidationAlert = ({ severity = 'info', message }) => {
  // Map severity to icon and color
  const iconMap = {
    success: <CheckCircleIcon sx={{ color: '#4caf50' }} />, // Green for success
    error: <AlertCircleIcon sx={{ color: '#f44336' }} />, // Red for error
    warning: <InfoIcon sx={{ color: '#ff9800' }} />, // Orange for warning
    info: <InfoIcon sx={{ color: '#2196f3' }} /> // Blue for info
  };

  const colorMap = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };

  return (
    <Alert
      severity={severity}
      icon={iconMap[severity]} // Get the appropriate icon
      sx={{
        backgroundColor: 'black',
        color: colorMap[severity], // Use the correct color for the text
        borderColor: colorMap[severity],
        borderWidth: 1,
        borderRadius: 1,
        borderStyle: 'solid',
        textAlign: 'start',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
      }}
    >
      {message}
    </Alert>
  );
};

export default ValidationAlert;
