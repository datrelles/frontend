import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, Button, Paper, Box
} from '@mui/material';

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
                        <Paper key={index} elevation={2} sx={{ mb: 4, p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>{modelo?.nombre_modelo_version}</Typography>
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
                                <Box key={categoria} mt={2}>
                                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{categoria}</Typography>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Campo</TableCell>
                                                <TableCell align="center">Base</TableCell>
                                                <TableCell align="center">Comparable</TableCell>
                                                <TableCell align="center">Estado</TableCell>
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
                                                            color: detalle.estado === 'mejor' ? '#2e7d32' : detalle.estado === 'peor' ? '#d32f2f' : '#000'
                                                        }}>
                                                        {detalle.comparable}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {detalle.estado === 'mejor' ? ' Mejora' :
                                                            detalle.estado === 'igual' ? ' Igual' : 'Peor'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ))}
                        </Paper>
                    );
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{
                    backgroundColor: 'firebrick',
                    color: '#fff',
                    fontSize: '12px',
                    '&:hover': {
                        backgroundColor: '#b22222'
                    }}}>Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogResumenComparacion;
