import React, { useState } from "react";
import {
    Box,Tabs,Tab,Table,TableHead,
    TableRow,TableCell,TableBody,TableContainer,
    Paper, TextField,
} from "@mui/material";

export default function IngresoModelosTabs({ modelosPorSegmento = [], cantidades, setCantidades }) {
    const [tabActivo, setTabActivo] = useState(0);

    const handleChangeCantidad = (modeloId, valor) => {
        setCantidades((prev) => ({
            ...prev,
            [modeloId]: valor,
        }));
    };
    return (
        <Box sx={{ width: "100%" }}>
            <Tabs
                value={tabActivo}
                onChange={(e, nuevo) => setTabActivo(nuevo)}
                centered
                variant="scrollable"
                scrollButtons="auto"
            >
                {modelosPorSegmento.map((seg, idx) => (
                    <Tab key={idx} label={String(seg.nombre_segmento)} />
                ))}
            </Tabs>
            {modelosPorSegmento.map((seg, idx) => (
                <Box key={idx} hidden={tabActivo !== idx} sx={{ mt: 2 }}>
                    {tabActivo === idx && (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Modelo</TableCell>
                                        <TableCell align="center">Cantidad</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {seg.modelos?.map((m) => (
                                        <TableRow key={m.codigo_modelo_comercial}>
                                            <TableCell>{m.nombre_modelo}</TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    value={cantidades[m.codigo_modelo_comercial] || ""}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value) || 0;

                                                        handleChangeCantidad(m.codigo_modelo_comercial, value);
                                                    }}
                                                    size="small"
                                                    sx={{ width: 80 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            ))}
        </Box>
    );
}
