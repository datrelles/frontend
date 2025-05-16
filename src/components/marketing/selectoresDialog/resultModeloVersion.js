import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, Button, Accordion, AccordionSummary,
    AccordionDetails, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DialogResumenComparacion = ({ open, onClose, resultado, modelos }) => {
    if (!resultado?.comparables?.length) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Resumen detallado de comparación</DialogTitle>
            <DialogContent dividers sx={{ maxHeight: '75vh' }}>
                {resultado.comparables.map((item, index) => {
                    const modelo = modelos.find(m => m.codigo_modelo_version === item.modelo_version);
                    const mejorasClaras = Object.entries(item.mejor_en)
                        .flatMap(([categoria, campos]) =>
                            campos.filter(c => c.estado === 'mejor').map(c => `${c.campo} (${categoria})`)
                        );

                    return (
                        <Box key={index} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>{modelo?.nombre_modelo_version}</Typography>

                            {mejorasClaras.length > 0 && (
                                <Box mb={2}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                        Mejora clara en:
                                    </Typography>
                                    <ul>
                                        {mejorasClaras.map((txt, i) => <li key={i}>{txt}</li>)}
                                    </ul>
                                </Box>
                            )}

                            {Object.entries(item.mejor_en).map(([categoria, detalles]) => (
                                <Accordion key={categoria} defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {categoria}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Table size="small" sx={{ minWidth: 650 }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>Campo</TableCell>
                                                    <TableCell align="center" sx={{ width: '25%', fontWeight: 'bold' }}>Base</TableCell>
                                                    <TableCell align="center" sx={{ width: '25%', fontWeight: 'bold' }}>Comparable</TableCell>
                                                    <TableCell align="center" sx={{ width: '25%', fontWeight: 'bold' }}>Estado</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {detalles.map((detalle, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{detalle.campo}</TableCell>
                                                        <TableCell align="center">{detalle.base}</TableCell>
                                                        <TableCell
                                                            align="center"
                                                            sx={{
                                                                fontWeight: detalle.estado === 'mejor' ? 'bold' : 'normal',
                                                                color:
                                                                    detalle.estado === 'mejor'
                                                                        ? '#2e7d32'
                                                                        : detalle.estado === 'peor'
                                                                            ? '#d32f2f'
                                                                            : 'inherit',
                                                            }}
                                                        >
                                                            {detalle.comparable}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {detalle.estado === 'mejor'
                                                                ? 'Mejora'
                                                                : detalle.estado === 'igual'
                                                                    ? 'Igual'
                                                                    : 'Peor'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    );
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{
                    backgroundColor: 'firebrick',
                    color: '#fff',
                    fontSize: '12px',
                    '&:hover': { backgroundColor: '#b22222' }
                }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogResumenComparacion;
