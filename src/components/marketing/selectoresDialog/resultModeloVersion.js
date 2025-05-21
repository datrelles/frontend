import React, { } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, Button, Accordion, AccordionSummary,
    AccordionDetails, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Tooltip } from '@mui/material';

const getUnidadCampo = (campo) => {
    const camposMM = ['altura_total', 'longitud_total', 'ancho_total'];
    const camposKG = ['peso_seco'];
    if (camposMM.includes(campo)) return 'mm';
    if (camposKG.includes(campo)) return 'kg';
    return '';
};

const DialogResumenComparacion = ({ open, onClose, resultado, modelos }) => {
    if (!resultado?.comparables?.length) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }} >Resumen detallado de comparación</DialogTitle>
            <DialogContent dividers sx={{ maxHeight: '75vh' }}>
                {resultado.comparables.map((item, index) => {
                    const modelo = modelos.find(m => m.codigo_modelo_version === item.modelo_version);
                    const mejorasClaras = Object.entries(item.mejor_en)
                        .flatMap(([categoria, campos]) =>
                            campos
                                .filter(c => c.estado === 'mejor')
                                .map(c => ({
                                    campo: c.campo,
                                    categoria,
                                    valor: c.comparable
                                }))
                        );
                    return (
                        <Box key={index} sx={{ mb: 4 }}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                                gap={6}
                                sx={{ flexWrap: 'wrap' }}>
                                <Box flex={1} textAlign="center">
                                    <Typography
                                        variant="h6"
                                        sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}
                                    >
                                        {`${modelos.find(m => m.codigo_modelo_version === resultado.base)?.nombre_modelo_comercial || 'Modelo Base'} VS ${modelo?.nombre_modelo_comercial || 'Comparable'}`}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={4} flex={1} justifyContent="flex-end">
                                    <Box textAlign="center">
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {modelos.find(m => m.codigo_modelo_version === resultado.base)?.nombre_modelo_comercial || "Modelo Base"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {modelos.find(m => m.codigo_modelo_version === resultado.base)?.nombre_marca || ''}
                                        </Typography>
                                        <img
                                            src={encodeURI(modelos.find(m => m.codigo_modelo_version === resultado.base)?.path_imagen)}
                                            alt="Modelo Base"
                                            style={{
                                                width: '550px',
                                                height: 'auto',
                                                maxHeight: '400px',
                                                borderRadius: 8,
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>
                                    <Box textAlign="center">
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {modelo?.nombre_modelo_comercial || "Comparable"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {modelo?.nombre_marca || ''}
                                        </Typography>
                                        <img
                                            src={encodeURI(modelo?.path_imagen)}
                                            alt="Modelo Comparable"
                                            style={{
                                                width: '550px',
                                                height: 'auto',
                                                maxHeight: '400px',
                                                borderRadius: 8,
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            {Object.entries(item.mejor_en).map(([categoria, detalles]) => (
                                <Accordion key={categoria} defaultExpanded>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                        sx={{
                                            backgroundColor: 'firebrick',
                                            color: 'white',
                                            px: 2,
                                            py: 1,
                                            minHeight: '38px',
                                            '& .MuiAccordionSummary-content': {
                                                margin: 0,
                                                alignItems: 'center'
                                            }
                                        }}>
                                        <Typography sx={{ textTransform: 'capitalize', fontSize: '15px' }}>
                                            {categoria}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Table size="small" sx={{ minWidth: 650 }}>
                                            <TableHead>
                                                <TableRow sx={{
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f5f5f5',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 2,
                                                    padding: '4px'
                                                }}>
                                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>Campo</TableCell>
                                                    <TableCell align="center" sx={{ width: '25%' }}>
                                                        <Box>
                                                            <Typography variant="body2"  fontWeight="bold">
                                                                {modelos.find(m => m.codigo_modelo_version === resultado.base)?.nombre_modelo_comercial || ''}
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {modelos.find(m => m.codigo_modelo_version === resultado.base)?.nombre_marca || ''}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ width: '25%' }}>
                                                        <Box>
                                                            <Typography variant="body2"  fontWeight="bold">
                                                                {modelo?.nombre_modelo_comercial || ''}
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {modelo?.nombre_marca || ''}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ width: '25%', fontWeight: 'bold' }}>Comparativo</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {detalles.map((detalle, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            {detalle.campo.replace(/_/g, ' ').toUpperCase()}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {detalle.base != null ? `${detalle.base} ${getUnidadCampo(detalle.campo)}` : ''}
                                                        </TableCell>
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
                                                            }}>
                                                            {detalle.comparable != null ?
                                                                `${detalle.comparable} ${getUnidadCampo(detalle.campo)}` : ''}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {detalle.estado === 'mejor' ? (
                                                                <Tooltip title="Mejor"><ThumbUpIcon sx={{ color: '#2e7d32' }} /></Tooltip>
                                                            ) : detalle.estado === 'peor' ? (
                                                                <Tooltip title="Peor"><ThumbDownIcon sx={{ color: '#d32f2f' }} /></Tooltip>
                                                            ) : detalle.estado === 'diferente' ? (
                                                                <Tooltip title="Diferente"><CompareArrowsIcon sx={{ color: '#1976d2' }} /></Tooltip>
                                                            ) : (
                                                                <Tooltip title="Igual"><DragHandleIcon sx={{ color: '#757575' }} /></Tooltip>
                                                            )}
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
                <Button onClick={onClose}
                        sx={{
                            backgroundColor: 'firebrick',
                            color: '#fff',
                            fontSize: '12px',
                            '&:hover': { backgroundColor: '#b22222' }
                        }}>Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogResumenComparacion;
