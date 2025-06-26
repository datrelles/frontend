import React from 'react';
import { createPortal } from 'react-dom';
import { Backdrop, CircularProgress, Typography } from '@mui/material';

const GlobalLoading = ({ open = false, message = 'Procesando datos, espere...' }) => {
    if (!open) return null;

    return createPortal(
        <Backdrop
            open
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(255,255,255,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress color="inherit" size={48} />
            <Typography mt={2} fontWeight="bold">
                {message}
            </Typography>
        </Backdrop>,
        document.body
    );
};

export default GlobalLoading;
