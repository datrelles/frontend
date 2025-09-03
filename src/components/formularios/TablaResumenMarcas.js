import React, { useEffect, useMemo, useState } from "react";
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, TextField, Typography, Button, Autocomplete
} from "@mui/material";
import API from "../../services/modulo_formularios";
import {useAuthContext} from "../../context/authContext";

export default function TablaResumenMarcas({ modelosPorSegmento, cantidades, form, setForm }) {
    const [segmentos, setSegmentos] = useState([]);
    const [todasMarcas, setTodasMarcas] = useState([]);
    const [otrasMarcas, setOtrasMarcas] = useState([]);
    const [mostrarSelector, setMostrarSelector] = useState(false);
    const [marcaNueva, setMarcaNueva] = useState(null);

    const {jwt, userShineray, enterpriseShineray, systemShineray} = useAuthContext();
    const APIService = useMemo(
        () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
        [jwt, userShineray, enterpriseShineray, systemShineray]
    );


    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const segs = await APIService.getCatalogoSegmentos();
                setSegmentos(segs ?? []);

                const marcas = await APIService.getMarcas();
                setTodasMarcas(marcas ?? []);
            } catch (e) {
                console.error("Error cargando segmentos/marcas", e);
            }
        };
        cargarDatos();
    }, [APIService]);



    const { totalesShineray, totalesBultaco, totalesSHM } = useMemo(() => {
        const init = Object.fromEntries(segmentos.map(s => [s.nombre_segmento.toUpperCase(), 0]));
        const tShineray = { ...init };
        const tBultaco = { ...init };
        const tSHM = { ...init };

        segmentos.forEach(seg => {
            const segKey = seg.nombre_segmento.toUpperCase();
            const modelos = modelosPorSegmento
                ?.find(s => s.nombre_segmento?.toUpperCase() === segKey)
                ?.modelos || [];

            modelos.forEach(m => {
                const cantidad = Number(cantidades[m.codigo_modelo_comercial] || 0);
                const marca = m.marca?.toUpperCase() || m.nombre_marca?.toUpperCase() || "";

                if (marca === "BULTACO") tBultaco[segKey] += cantidad;
                else if (marca === "SHM") tSHM[segKey] += cantidad;
                else if (marca === "SHINERAY") tShineray[segKey] += cantidad;
            });
        });

        return { totalesShineray: tShineray, totalesBultaco: tBultaco, totalesSHM: tSHM };
    }, [cantidades, modelosPorSegmento, segmentos]);

    const totalPorMarca = (marca, tipo = "otras") => {
        return segmentos.reduce((acc, seg) => {
            const segKey = seg.nombre_segmento.toUpperCase();
            if (tipo === "massline") {
                if (marca === "SHINERAY") return acc + (totalesShineray[segKey] || 0);
                if (marca === "SHM") return acc + (totalesSHM[segKey] || 0);
                if (marca === "BULTACO") return acc + (totalesBultaco[segKey] || 0);
            } else {
                return acc + (Number(form.resumenMarcas?.[segKey]?.[marca] || 0));
            }
            return acc;
        }, 0);
    };

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Totales por Segmento y Marca
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell rowSpan={2}><b>CATEGORÍAS</b></TableCell>
                        <TableCell rowSpan={2}><b>TOTAL_SEG</b></TableCell>
                        <TableCell
                            colSpan={3}
                            align="center"
                            sx={{ backgroundColor: "firebrick !important", color: "#ffffff !important" }}
                        >
                            MASSLINE
                        </TableCell>
                        <TableCell
                            colSpan={otrasMarcas.length + 1}
                            align="center"
                            sx={{ backgroundColor: "lightblue", color: "black", fontWeight: "bold" }}
                        >
                            OTRAS MARCAS
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: "firebrick !important", color: "#ffffff !important" }}>SHINERAY</TableCell>
                        <TableCell sx={{ backgroundColor: "firebrick !important", color: "#ffffff !important" }}>SHM</TableCell>
                        <TableCell sx={{ backgroundColor: "firebrick !important", color: "#ffffff !important" }}>BULTACO</TableCell>

                        {otrasMarcas.map(m => (
                            <TableCell key={m} sx={{ backgroundColor: "lightblue", fontWeight: "bold" }}>
                                {m}
                            </TableCell>
                        ))}
                        <TableCell sx={{ backgroundColor: "lightblue" }}>
                            {mostrarSelector ? (
                                <Autocomplete
                                    options={todasMarcas}
                                    getOptionLabel={(o) => o?.nombre_marca ?? ""}
                                    onChange={(_, v) => {
                                        if (v && !otrasMarcas.includes(v.nombre_marca)) {
                                            setOtrasMarcas(prev => [...prev, v.nombre_marca]);
                                        }
                                        setMarcaNueva(null);
                                        setMostrarSelector(false);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Seleccionar marca" size="small" />}
                                    value={marcaNueva}
                                    sx={{ width: 160 }}
                                />
                            ) : (
                                <Button size="small" onClick={() => setMostrarSelector(true)}>➕ Añadir</Button>
                            )}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {segmentos.map(seg => {
                        const segKey = seg.nombre_segmento.toUpperCase();
                        const shinerayTotal = totalesShineray[segKey] || 0;
                        const shmTotal = totalesSHM[segKey] || 0;
                        const bultacoTotal = totalesBultaco[segKey] || 0;
                        const otrosTotales = form.resumenMarcas?.[segKey] || {};

                        const totalFila = shinerayTotal + shmTotal + bultacoTotal +
                            otrasMarcas.reduce((acc, m) => acc + (Number(otrosTotales[m] || 0)), 0);

                        return (
                            <TableRow key={segKey}>
                                <TableCell>{seg.nombre_segmento}</TableCell>
                                <TableCell><b>{totalFila}</b></TableCell>
                                <TableCell>{shinerayTotal}</TableCell>
                                <TableCell>{shmTotal}</TableCell>
                                <TableCell>{bultacoTotal}</TableCell>

                                {otrasMarcas.map(marca => (
                                    <TableCell key={marca}>
                                        <TextField
                                            type="number"
                                            value={otrosTotales[marca] || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setForm(prev => ({
                                                    ...prev,
                                                    resumenMarcas: {
                                                        ...prev.resumenMarcas,
                                                        [segKey]: {
                                                            ...(prev.resumenMarcas?.[segKey] || {}),
                                                            [marca]: value
                                                        }
                                                    }
                                                }));
                                            }}
                                            size="small"
                                            sx={{ width: 80 }}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <TableCell><b>TOTAL_MARCA</b></TableCell>
                        <TableCell />
                        <TableCell><b>{totalPorMarca("SHINERAY", "massline")}</b></TableCell>
                        <TableCell><b>{totalPorMarca("SHM", "massline")}</b></TableCell>
                        <TableCell><b>{totalPorMarca("BULTACO", "massline")}</b></TableCell>
                        {otrasMarcas.map(m => (
                            <TableCell key={m}><b>{totalPorMarca(m)}</b></TableCell>
                        ))}
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
}
