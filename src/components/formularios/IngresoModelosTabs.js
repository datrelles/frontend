import React, { useState } from "react";
import {
    Box, Tabs, Tab, Table, TableHead,
    TableRow, TableCell, TableBody, TableContainer,
    Paper, TextField, Typography,
} from "@mui/material";

const IngresoModelosTabs = ({ modelosPorSegmento, cantidades, setCantidades }) => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleChangeCantidad = (modelo, segmento, valor) => {
        setCantidades((prev) => {
            const nuevosModelos = {
                ...(prev.modelos || {}),
                [modelo.codigo_modelo_comercial]: {
                    cod_segmento: modelo.codigo_segmento,
                    cod_linea: modelo.codigo_linea,
                    cod_modelo_comercial: modelo.codigo_modelo_comercial,
                    cod_marca: modelo.codigo_marca,
                    nombre_segmento: segmento.nombre_segmento,
                    cantidad: valor
                }
            };

            // Agrupar por marca + segmento
            const marcasAgrupadas = Object.values(nuevosModelos).reduce((acc, m) => {
                const key = `${m.cod_marca}-${m.nombre_segmento}`;
                if (!acc[key]) {
                    acc[key] = {
                        cod_marca: m.cod_marca,
                        nombre_segmento: m.nombre_segmento,
                        cantidad: 0
                    };
                }
                acc[key].cantidad += m.cantidad;
                return acc;
            }, {});

            return {
                ...prev,
                modelos: nuevosModelos,
                marcas: Object.values(marcasAgrupadas)
            };
        });
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Typography
                variant="h6"
                sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
            >
                INGRESO DE MODELOS POR SEGMENTO
            </Typography>

            {/* Tabs */}
            <Tabs
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
            >
                {modelosPorSegmento.map((seg, index) => (
                    <Tab key={index} label={seg.nombre_segmento} />
                ))}
            </Tabs>

            {modelosPorSegmento.map((seg, index) => (
                <Box
                    key={index}
                    role="tabpanel"
                    hidden={tabIndex !== index}
                    sx={{ mt: 2 }}
                >
                    {tabIndex === index && (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        MODELO COMERCIAL
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        CANTIDAD
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {seg.modelos.map((modelo) => (
                                    <TableRow key={modelo.codigo_modelo_comercial}>
                                        <TableCell>{modelo.nombre_modelo}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={
                                                    cantidades?.modelos?.[modelo.codigo_modelo_comercial]?.cantidad || ""
                                                }
                                                onChange={(e) =>
                                                    handleChangeCantidad(
                                                        modelo,
                                                        seg,
                                                        parseInt(e.target.value, 10) || 0
                                                    )
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default IngresoModelosTabs;
