import React, { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

const LoadingCraft = () => {
  const [loadingMessage, setLoadingMessage] = useState('Creando Items...');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div style={{ display: 'inline-block', animation: 'spin 2s linear infinite', transform: 'rotate(0deg)' }}>
        <SettingsIcon style={{ fontSize: 160, color: 'firebrick' }} />
      </div>
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>{loadingMessage}</div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingCraft;
 