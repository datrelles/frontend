import React from 'react';
import {
    Typography, Table, TableHead, TableRow, TableCell,
    TableBody, Accordion, AccordionSummary, AccordionDetails, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const getUnidadCampo = (campo) => {
    const camposMM = ['altura_total', 'longitud_total', 'ancho_total'];
    const camposKG = ['peso_seco'];
    return camposMM.includes(campo) ? 'mm' : camposKG.includes(campo) ? 'kg' : '';
};

const ResumenComparacion = ({ resultado, bloques }) => {
    if (!resultado?.comparables?.length) return null;

    const modeloBase = bloques[0]?.modelo;
    const comparables = resultado.comparables.map(c => {
        const modelo = bloques.find(b => b.modelo?.codigo_modelo_version === c.modelo_version)?.modelo;
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

    const safeText = (value, unidad = '') =>
        value !== undefined && value !== null && value !== '' ? `${value} ${unidad}` : 'N/A';


    return (
        <Box mt={4} px={2}>
            <Typography variant="h6" align="center" gutterBottom fontWeight="bold">
                RESUMEN DETALLADO
            </Typography>
            {Object.entries(categoriesAgrupadas).map(([categoria, campos]) => (
                <Accordion key={categoria} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: 'firebrick', color: 'white' }}>
                        <Typography sx={{ textTransform: 'capitalize' }}>{categoria}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 600 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>CAMPO</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="bold">
                                                {modeloBase?.nombre_modelo_comercial || 'Base'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {modeloBase?.nombre_marca}
                                            </Typography>
                                        </TableCell>
                                        {comparables.map((m, i) => (
                                            <React.Fragment key={i}>
                                                <TableCell>
                                                    <Typography fontWeight="bold">{m?.nombre_modelo_comercial}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{m?.nombre_marca}</Typography>
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
                                            <TableCell>{safeText(data.base, getUnidadCampo(campo))}</TableCell>
                                            {data.comparables.map((comp, j) => (
                                                <React.Fragment key={j}>
                                                    <TableCell>{safeText(comp.valor, getUnidadCampo(campo))}</TableCell>
                                                    <TableCell>
                                                        {comp.estado === 'mejor' ? (
                                                            <ThumbUpIcon sx={{ color: '#2e7d32' }} />
                                                        ) : comp.estado === 'peor' ? (
                                                            <ThumbDownIcon sx={{ color: '#d32f2f' }} />
                                                        ) : comp.estado === 'diferente' ? (
                                                            <Box display="flex" gap={0.5}>
                                                                <ThumbUpIcon sx={{ color: '#b300ac', fontSize: 20 }} />
                                                                <ThumbDownIcon sx={{ color: '#b300ac', fontSize: 20 }} />
                                                            </Box>
                                                        ) : (
                                                            <Box display="flex" gap={0.5}>
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
                        </Box>
                    </AccordionDetails>

                </Accordion>
            ))}
        </Box>
    );
};

export default ResumenComparacion;
