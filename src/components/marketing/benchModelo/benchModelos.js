import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, Typography, Table, TableHead,
    TableRow, TableCell, TableBody, ButtonGroup, Dialog, DialogTitle,
    DialogContent, DialogActions, Checkbox, TextField, Autocomplete
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import { toast } from "react-toastify";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import LoadingCircle from "../../contabilidad/loader";
import Navbar0 from "../../Navbar0";
import { useNavigate } from "react-router-dom";
import DialogResumenComparacion from "../selectoresDialog/resultModeloVersion";

const API = process.env.REACT_APP_API;

function CompararModelos()  {

    const [modeloBase, setModeloBase] = useState(null);
    const [comparables, setComparables] = useState([]);
    const [resultado, setResultado] = useState(null);
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const [openResumenDialog, setOpenResumenDialog] = useState(false);
    const [lineas, setLineas] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [lineaSeleccionada, setLineaSeleccionada] = useState('');
    const [segmentoSeleccionado, setSegmentoSeleccionado] = useState('');
    const [modelos, setModelos] = useState([]);

    const toggleResumenDialog = () => setOpenResumenDialog(prev => !prev);

    const handleComparar = async () => {
        if (!modeloBase || comparables.length === 0) {
            enqueueSnackbar("Debes seleccionar un modelo base y al menos un comparable", { variant: 'warning' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API}/bench_model/comparar_modelos`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    modelo_base: parseInt(modeloBase),
                    comparables: comparables.map(Number)
                })
            });

            const data = await res.json();
            setResultado(data);
        } catch (error) {
            enqueueSnackbar("Error al comparar los modelos", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            toast.error('Error cargando menús');
        }
    };

    const handleLineaChange = async (codigo) => {
        setLineaSeleccionada(codigo);
        setSegmentoSeleccionado('');
        setModelos([]);

        const res = await fetch(`${API}/bench_model/get_segmentos_por_linea/${codigo}`, {
            headers: { Authorization: 'Bearer ' + jwt }
        });
        const data = await res.json();
        setSegmentos(data);
    };

    const handleSegmentoChange = async (codigoLinea, nombreSegmento) => {
        setSegmentoSeleccionado(nombreSegmento);

        const res = await fetch(`${API}/bench_model/get_modelos_por_linea_segmento?codigo_linea=${codigoLinea}&nombre_segmento=${nombreSegmento}`, {
            headers: { Authorization: 'Bearer ' + jwt }
        });

        const data = await res.json();

        if (Array.isArray(data)) {
            setModelos(data);
        } else {
            setModelos([]);
            enqueueSnackbar("Error cargando modelos", { variant: "error" });
        }
    };

    const fetchLineas = async () => {
        try {
            const res = await fetch(`${API}/bench/get_lineas`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setLineas(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando datos', { variant: 'error' });
        }
    };

    const handleChange = (campo, valor) => {
        if (!valor) return;

        if (campo === 'codigo_linea') {
            setLineaSeleccionada(valor.codigo_linea);
            setSegmentoSeleccionado('');
            setModelos([]);
            handleLineaChange(valor.codigo_linea);
        } else if (campo === 'codigo_segmento') {
            setSegmentoSeleccionado(valor);
            handleSegmentoChange(lineaSeleccionada, valor);
        }
    };

    const exportarExcel = async () => {
        const res = await fetch(`${API}/bench_model/exportar_comparacion_xlsx`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resultado,
                modelos
            })
        });

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'comparacion_modelos.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };


    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchLineas();

            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };

        cargarDatos();
    }, []);

    const handleDialogToggle = () => setDialogOpen(!dialogOpen);

    const handleToggleComparable = (id) => {
        if (comparables.includes(id)) {
            setComparables(prev => prev.filter(val => val !== id));
        } else if (comparables.length < 3) {
            setComparables(prev => [...prev, id]);
        } else {
            enqueueSnackbar("Solo puedes seleccionar hasta 3 modelos", { variant: "warning" });
        }
    };

    return (
        <>
            {loading ? (<LoadingCircle />) : (
                <div style={{ marginTop: '150px', width: "100%" }}>
                    <Navbar0 menus={menus} />
                    <Box>
                        <ButtonGroup variant="text">
                            <Button onClick={() => navigate('/dashboard')}>Módulos</Button>
                            <Button onClick={() => navigate(-1)}>Catálogos</Button>
                        </ButtonGroup>
                    </Box>
                    <Box padding={4}>
                        <Typography variant="h4" textAlign= "center">Comparar Modelos Versión</Typography>
                        <Grid container spacing={2} >
                            <Grid item xs={2}>
                                <Autocomplete
                                    options={lineas}
                                    getOptionLabel={(option) => option?.nombre_linea || ''}
                                    value={lineas.find(l => l.codigo_linea === lineaSeleccionada) || null}
                                    onChange={(e, v) => handleChange('codigo_linea', v)}
                                    renderInput={(params) => <TextField {...params} label="Línea" />}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Autocomplete
                                    options={segmentos}
                                    getOptionLabel={(option) => option?.nombre_segmento || ''}
                                    value={segmentos.find(s => s.nombre_segmento === segmentoSeleccionado) || null}
                                    onChange={(e, v) => handleChange('codigo_segmento', v?.nombre_segmento)}
                                    renderInput={(params) => <TextField {...params} label="Segmento" />}
                                    disabled={!lineaSeleccionada}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Autocomplete
                                    options={modelos}
                                    getOptionLabel={(option) => option.nombre_modelo_version}
                                    value={modelos.find(m => m.codigo_modelo_version === modeloBase) || null}
                                    onChange={(e, v) => setModeloBase(v ? v.codigo_modelo_version : null)}
                                    renderInput={(params) => <TextField {...params} label="Modelo Base" />}
                                />
                            </Grid>
                            <Grid item xs={5} sx={{alignItems: 'center' }}>
                                <Button variant="outlined" fullWidth onClick={handleDialogToggle}>
                                    {comparables.length > 0
                                        ? comparables.map(id => modelos.find(m => m.codigo_modelo_version === id)?.nombre_modelo_version).join(', ')
                                        : "Seleccione hasta 3 modelos"}
                                </Button>
                            </Grid>
                        </Grid>
                        <Box mt={2} display="flex" gap={2}>
                            <Button variant="contained" color="primary" onClick={handleComparar} sx={{
                                backgroundColor: 'firebrick',
                                color: '#fff',
                                fontSize: '12px',
                                '&:hover': {
                                    backgroundColor: '#b22222'
                                }}} >Comparar
                            </Button>
                            {resultado?.comparables?.length > 0 && (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={toggleResumenDialog}
                                        sx={{
                                            backgroundColor: 'firebrick',
                                            color: '#fff',
                                            fontSize: '12px',
                                            '&:hover': { backgroundColor: '#b22222' }
                                        }}
                                    >
                                        Ver resultados de comparación
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={exportarExcel}
                                        sx={{
                                            backgroundColor: 'green',
                                            color: '#fff',
                                            fontSize: '12px',
                                            '&:hover': { backgroundColor: '#1b5e20' }
                                        }}
                                    >
                                        Exportar a Excel
                                    </Button>
                                </>
                            )}

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setModeloBase(null);
                                    setComparables([]);
                                    setLineaSeleccionada('');
                                    setSegmentoSeleccionado('');
                                    setModelos([]);
                                    setSegmentos([]);
                                    setResultado(null);
                                }}
                                sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }
                                }}>Limpiar todo
                            </Button>
                        </Box>
                        <Dialog open={dialogOpen} onClose={handleDialogToggle} fullWidth maxWidth="md">
                            <DialogTitle>Seleccionar modelos comparables (máx. 3)</DialogTitle>
                            <DialogContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell sx={{ fontWeight: 'bold' }}>Modelo</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Modelo Comercial</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Marca</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Versión</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Año</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Precio</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {modelos.map((m) => (
                                            <TableRow key={m.codigo_modelo_version}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={comparables.includes(m.codigo_modelo_version)}
                                                        onChange={() => handleToggleComparable(m.codigo_modelo_version)}
                                                        disabled={
                                                            !comparables.includes(m.codigo_modelo_version) &&
                                                            comparables.length >= 3
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{m.nombre_modelo_version}</TableCell>
                                                <TableCell>{m.nombre_modelo_comercial}</TableCell>
                                                <TableCell>{m.nombre_marca}</TableCell>
                                                <TableCell>{m.nombre_version}</TableCell>
                                                <TableCell>{m.anio_modelo_version}</TableCell>
                                                <TableCell>{m.precio_producto_modelo}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </DialogContent>
                            <DialogActions sx={{ justifyContent: 'space-between' }}>
                                <Button onClick={() => setComparables([])} sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }}}>Limpiar selección
                                </Button>
                                <Button onClick={handleDialogToggle} sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }}}>Cerrar
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <DialogResumenComparacion
                            open={openResumenDialog}
                            onClose={toggleResumenDialog}
                            resultado={resultado}
                            modelos={modelos}
                        />
                        {resultado?.comparables?.length > 0 && (
                            <Box mt={4} mb={2}>
                                <Typography variant="h6" textAlign="center"> Resumen por modelo:</Typography>
                                <Table size="small" sx={{ mt: 1 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Modelo externo</strong></TableCell>
                                            <TableCell><strong>Marca</strong></TableCell>
                                            <TableCell><strong>Versión</strong></TableCell>
                                            <TableCell><strong>Campos en los que mejora</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {resultado.comparables.map((item, idx) => {
                                            const modelo = modelos.find(m => m.codigo_modelo_version === item.modelo_version);
                                            const mejoras = Object.entries(item.mejor_en)
                                                .flatMap(([_, detalles]) =>
                                                    detalles.filter(d => d.estado === 'mejor').map(d => d.campo)
                                                );
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{modelo?.nombre_modelo_version || `Modelo ${item.modelo_version}`}</TableCell>
                                                    <TableCell>{modelo?.nombre_marca || `Marca ${item.modelo_version}`}</TableCell>
                                                    <TableCell>{modelo?.nombre_version || `Versión ${item.modelo_version}`}</TableCell>
                                                    <TableCell>{mejoras.join(', ')}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                </div>
            )}
        </>
    );
}

export default function  IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CompararModelos />
        </SnackbarProvider>
    );
}
