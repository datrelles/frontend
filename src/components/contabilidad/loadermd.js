import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingCircle = () => {
  const [loadingMessage, setLoadingMessage] = useState('Procesando datos espere...');

// El array vacío asegura que el efecto se ejecute solo una vez al montar el componente

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40vh',
      }}
    >
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>{loadingMessage}</div>
      <CircularProgress style={{ color: 'red' }} />
    </div>
  );
};

export default LoadingCircle;
