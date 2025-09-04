import React, { useEffect, useMemo, useState } from "react";
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, TextField, Typography, Button, Autocomplete, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../../services/modulo_formularios";
import { useAuthContext } from "../../context/authContext";

export default function TablaResumenMarcas({ cantidades, form, setForm }) {
    const [todasMarcas, setTodasMarcas] = useState([]);
    const [otrasMarcas, setOtrasMarcas] = useState([]);
    const [mostrarSelector, setMostrarSelector] = useState(false);
    const [marcaNueva, setMarcaNueva] = useState(null);

    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const APIService = useMemo(
        () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
        [jwt, userShineray, enterpriseShineray, systemShineray]
    );

    useEffect(() => {
        const cargarMarcas = async () => {
            try {
                const marcas = await APIService.getMarcas();
                setTodasMarcas(marcas ?? []);
            } catch (e) {
                console.error("Error cargando marcas", e);
            }
        };
        cargarMarcas();
    }, [APIService]);

    // Construir lista única de segmentos agrupados por nombre
    const [segmentos, setSegmentos] = useState([]);

    useEffect(() => {
        const cargarSegmentos = async () => {
            try {
                const segs = await APIService.getCatalogoSegmentos();
                // Normalizamos para evitar duplicados por mayúsculas/minúsculas
                const lista = (segs ?? []).map(s => ({
                    codigo_segmento: String(s.codigo_segmento),
                    nombre_segmento: (s.nombre_segmento || "").toUpperCase().trim()
                }));
                // Eliminamos duplicados por nombre
                const unicos = Array.from(
                    new Map(lista.map(s => [s.nombre_segmento, s])).values()
                );
                setSegmentos(unicos);
            } catch (e) {
                console.error("Error cargando segmentos", e);
            }
        };
        cargarSegmentos();
    }, [APIService]);


    // Agrupar cantidades por marca y segmento (clave = nombre_segmento)
    const totalesPorMarcaSegmento = useMemo(() => {
        const result = {};
        Object.values(cantidades.modelos || {}).forEach(m => {
            const cantidad = Number(m.cantidad) || 0;
            if (!cantidad) return;
            const segKey = (m.nombre_segmento || "").toUpperCase().trim();
            const marcaKey = String(m.cod_marca);
            if (!result[segKey]) result[segKey] = {};
            result[segKey][marcaKey] = (result[segKey][marcaKey] || 0) + cantidad;
        });
        return result;
    }, [cantidades.modelos]);

    // Total por marca global
    const totalPorMarca = (codMarca) => {
        return Object.values(cantidades.modelos || {}).reduce((acc, m) => {
            if (String(m.cod_marca) === String(codMarca)) {
                acc += Number(m.cantidad) || 0;
            }
            return acc;
        }, 0) + (form.marcas_segmento || [])
            .filter(m => String(m.cod_marca) === String(codMarca))
            .reduce((acc, m) => acc + (Number(m.cantidad) || 0), 0);
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
                        <TableCell colSpan={3} align="center"
                                   sx={{ backgroundColor: "firebrick !important", color: "#ffffff !important" }}>
                            MASSLINE
                        </TableCell>
                        <TableCell
                            colSpan={otrasMarcas.length + 1}
                            align="center"
                            sx={{ backgroundColor: "lightblue", fontWeight: "bold" }}
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
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setOtrasMarcas(prev => prev.filter(x => x !== m));
                                        setForm(prev => ({
                                            ...prev,
                                            marcas_segmento: (prev.marcas_segmento || []).filter(x => x.nombre_marca !== m)
                                        }));
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
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
                        const segKey = (seg.nombre_segmento || "").toUpperCase().trim();
                        const shinerayTotal = totalesPorMarcaSegmento[segKey]?.["3"] || 0;
                        const shmTotal      = totalesPorMarcaSegmento[segKey]?.["18"] || 0;
                        const bultacoTotal  = totalesPorMarcaSegmento[segKey]?.["22"] || 0;

                        const otrosTotales = (form.marcas_segmento || []).filter(
                            m => (m.nombre_segmento || "").toUpperCase().trim() === segKey &&
                                !["3","18","22"].includes(String(m.cod_marca))
                        );

                        const totalFila = shinerayTotal + shmTotal + bultacoTotal +
                            otrosTotales.reduce((acc, m) => acc + (Number(m.cantidad) || 0), 0);

                        return (
                            <TableRow key={segKey}>
                                <TableCell>{seg.nombre_segmento}</TableCell>
                                <TableCell><b>{totalFila}</b></TableCell>
                                <TableCell>{shinerayTotal}</TableCell>
                                <TableCell>{shmTotal}</TableCell>
                                <TableCell>{bultacoTotal}</TableCell>

                                {otrasMarcas.map(nombreMarca => (
                                    <TableCell key={nombreMarca}>
                                        <TextField
                                            type="number"
                                            value={
                                                (form.marcas_segmento || []).find(
                                                    o => o.nombre_marca === nombreMarca &&
                                                        (o.nombre_segmento || "").toUpperCase().trim() === segKey
                                                )?.cantidad || ""
                                            }
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value, 10) || 0;
                                                const marcaObj = todasMarcas.find(
                                                    x => x.nombre_marca.toUpperCase() === nombreMarca.toUpperCase()
                                                );
                                                const cod_marca = marcaObj ? String(marcaObj.codigo_marca) : null;

                                                setForm(prev => {
                                                    const filtrados = (prev.marcas_segmento || []).filter(
                                                        m => !(
                                                            String(m.cod_marca) === cod_marca &&
                                                            (m.nombre_segmento || "").toUpperCase().trim() === segKey
                                                        )
                                                    );
                                                    return {
                                                        ...prev,
                                                        marcas_segmento: [
                                                            ...filtrados,
                                                            {
                                                                cod_marca,
                                                                nombre_marca: nombreMarca,
                                                                cod_segmento: segKey,
                                                                nombre_segmento: seg.nombre_segmento,
                                                                cantidad: value
                                                            }
                                                        ]
                                                    };
                                                });
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
                        <TableCell><b>{totalPorMarca("3")}</b></TableCell>
                        <TableCell><b>{totalPorMarca("18")}</b></TableCell>
                        <TableCell><b>{totalPorMarca("22")}</b></TableCell>
                        {otrasMarcas.map(m => {
                            const marcaObj = todasMarcas.find(x => x.nombre_marca === m);
                            const cod_marca = marcaObj ? String(marcaObj.codigo_marca) : null;
                            return (
                                <TableCell key={m}><b>{totalPorMarca(cod_marca)}</b></TableCell>
                            );
                        })}
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
}
