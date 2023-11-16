import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingCircle = () => {
  const [loadingMessage, setLoadingMessage] = useState('Iniciando el sistema');

  useEffect(() => {
    // Cambiar el mensaje después de 3 segundos
    const timer = setTimeout(() => {
      setLoadingMessage('Enviando código al correo para su autentificación');
    }, 3000);

    // Limpiar el temporizador cuando el componente se desmonta
    return () => clearTimeout(timer);
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente

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
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>{loadingMessage}</div>
      <CircularProgress style={{ color: 'red' }} />
    </div>
  );
};

export default LoadingCircle;
