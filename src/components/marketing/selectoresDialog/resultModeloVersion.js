import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, Button, Accordion, AccordionSummary,
    AccordionDetails, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const getUnidadCampo = (campo) => {
    const camposMM = ['altura_total', 'longitud_total', 'ancho_total'];
    const camposKG = ['peso_seco'];
    return camposMM.includes(campo) ? 'mm' : camposKG.includes(campo) ? 'kg' : '';
};

const DialogResumenComparacion = ({ open, onClose, resultado, modelos }) => {
    if (!resultado?.comparables?.length) return null;

    const modeloBase = modelos.find(m => m.codigo_modelo_version === resultado.base);
    const comparables = resultado.comparables.map(c => {
        const modelo = modelos.find(m => m.codigo_modelo_version === c.modelo_version);
        return { ...modelo, detalles: c.mejor_en };
    });

    const categoriesAgrupadas = {};
    for (const comparable of comparables) {
        for (const [categoria, campos] of Object.entries(comparable.detalles)) {
            if (!categoriesAgrupadas[categoria]) categoriesAgrupadas[categoria] = {};
            for (const campo of campos) {
                if (!categoriesAgrupadas[categoria][campo.campo]) {
                    categoriesAgrupadas[categoria][campo.campo] = {
                        base: campo.base,
                        comparables: []
                    };
                }
                categoriesAgrupadas[categoria][campo.campo].comparables.push({
                    modelo_version: comparable.codigo_modelo_version,
                    valor: campo.comparable,
                    estado: campo.estado
                });
            }
        }
    }
    const MAX_COMPARABLES = 4;
    const placeholdersCount = MAX_COMPARABLES - comparables.length;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={false} sx={{ '& .MuiDialog-paper': { width: '100vw' } }}>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>RESUMEN DETALLADO</DialogTitle>
            <Box
                display="flex"
                justifyContent="space-evenly"
                mb={3}
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    borderBottom: '1px solid lightgray'
                }}
            >
                {[modeloBase, ...comparables].map((m, i) => (
                    <Box key={i} textAlign="center">
                        <Typography variant="subtitle2" fontWeight="bold">{m.nombre_modelo_comercial}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{m.nombre_marca}</Typography>
                        <img src={encodeURI(m.path_imagen)} alt={m.nombre_modelo_comercial} style={{ width: 300, height: 'auto' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Precio Venta Cliente</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>$ {m.precio_producto_modelo}</Typography>
                    </Box>
                ))}
            </Box>
            <DialogContent dividers sx={{ maxHeight: '75vh' }}>
                {Object.entries(categoriesAgrupadas).map(([categoria, campos]) => (
                    <Accordion key={categoria} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: 'firebrick', color: 'white' }}>
                            <Typography sx={{ textTransform: 'capitalize' }}>{categoria}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }} >CAMPO</TableCell>
                                        <TableCell>
                                            <Box >
                                                <Typography fontWeight="bold">
                                                    {modeloBase.nombre_modelo_comercial}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {modeloBase.nombre_marca}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {comparables.map((m, i) => (
                                            <React.Fragment key={i}>
                                                <TableCell>
                                                    <Box >
                                                        <Typography fontWeight="bold">{m.nombre_modelo_comercial}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{m.nombre_marca}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell><strong>Comparativo</strong></TableCell>
                                            </React.Fragment>
                                        ))}
                                        {[...Array(placeholdersCount)].map((_, i) => (
                                            <React.Fragment key={`ph-head-${i}`}>
                                                <TableCell />
                                                <TableCell />
                                            </React.Fragment>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(campos).map(([campo, data], i) => (
                                        <TableRow key={i}>
                                            <TableCell>{campo.replace(/_/g, ' ').toUpperCase()}</TableCell>
                                            <TableCell>{data.base} {getUnidadCampo(campo)}</TableCell>
                                            {data.comparables.map((comp, j) => (
                                                <React.Fragment key={j}>
                                                    <TableCell>{comp.valor ? `${comp.valor} ${getUnidadCampo(campo)}` : ''}</TableCell>
                                                    <TableCell>
                                                        {comp.estado === 'mejor' ? (
                                                            <ThumbUpIcon sx={{ color: '#2e7d32' }} />
                                                        ) : comp.estado === 'peor' ? (
                                                            <ThumbDownIcon sx={{ color: '#d32f2f' }} />
                                                        ) : comp.estado === 'diferente' ? (
                                                            <Box display="flex"   gap={0.5}>
                                                                <ThumbUpIcon sx={{ color: '#b300ac', fontSize: 20 }} />
                                                                <ThumbDownIcon sx={{ color: '#b300ac', fontSize: 20 }} />
                                                            </Box>
                                                        ) : (
                                                            <Box display="flex"   gap={0.5}>
                                                                <ThumbUpIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                                                                <ThumbUpIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </React.Fragment>
                                            ))}
                                            {[...Array(placeholdersCount)].map((_, i) => (
                                                <React.Fragment key={`ph-body-${i}`}>
                                                    <TableCell />
                                                    <TableCell />
                                                </React.Fragment>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{
                    backgroundColor: 'firebrick',
                    color: '#fff',
                    fontSize: '12px',
                    '&:hover': {
                        backgroundColor: '#b22222' } }}>Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogResumenComparacion;
