import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, Typography, Table, TableHead,
    TableRow, TableCell, TableBody, ButtonGroup, Dialog, DialogTitle,
    DialogContent, DialogActions, Checkbox, TextField, Autocomplete, TableContainer
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
    const navigate = useNavigate();
    const [openResumenDialog, setOpenResumenDialog] = useState(false);
    const [lineas, setLineas] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [lineaSeleccionada, setLineaSeleccionada] = useState('');
    const [segmentoSeleccionado, setSegmentoSeleccionado] = useState('');
    const [modelos, setModelos] = useState([]);
    const [imagenModal, setImagenModal] = useState(null);
    const [openModalImagen, setOpenModalImagen] = useState(false);
    const [selectedImagen, setSelectedImagen] = useState(null);


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

    const fetchImagenData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_imagenes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setImagenModal(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener imágenes", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
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
                await fetchImagenData();
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };
        cargarDatos();
    }, []);


    const handleToggleComparable = (id) => {
        if (comparables.includes(id)) {
            setComparables(prev => prev.filter(val => val !== id));
        } else if (comparables.length <= 5) {
            setComparables(prev => [...prev, id]);
        } else {
            enqueueSnackbar("Solo puedes seleccionar hasta 5 modelos", { variant: "warning" });
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
                            <Grid item xs={1.5}>
                                <Autocomplete
                                    options={lineas}
                                    getOptionLabel={(option) => option?.nombre_linea || ''}
                                    value={lineas.find(l => l.codigo_linea === lineaSeleccionada) || null}
                                    onChange={(e, v) => handleChange('codigo_linea', v)}
                                    renderInput={(params) => <TextField {...params} label="Línea" />}
                                />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Autocomplete
                                    options={segmentos}
                                    getOptionLabel={(option) => option?.nombre_segmento || ''}
                                    value={segmentos.find(s => s.nombre_segmento === segmentoSeleccionado) || null}
                                    onChange={(e, v) => handleChange('codigo_segmento', v?.nombre_segmento)}
                                    renderInput={(params) => <TextField {...params} label="Segmento" />}
                                    disabled={!lineaSeleccionada}
                                />
                            </Grid>
                            <Grid item xs={2.5}>
                                <Autocomplete
                                    options={modelos}
                                    getOptionLabel={(option) => option.nombre_modelo_version}
                                    value={modelos.find(m => m.codigo_modelo_version === modeloBase) || null}
                                    onChange={(e, v) => setModeloBase(v ? v.codigo_modelo_version : null)}
                                    renderInput={(params) => <TextField {...params} label="Modelo Base" />}
                                />
                            </Grid>
                            <Grid item xs={6.5} sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '100%' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f5f5f5',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 2,
                                                    padding: '4px'
                                                }}>Seleccione modelos comparables (máx. 5)
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                                    <TableContainer
                                        sx={{
                                            maxHeight: 185,
                                            border: '1px solid #ccc',
                                            borderRadius: 1,
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: '100%' }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            width: '36px',
                                                            padding: '4px',
                                                            textAlign: 'center',
                                                            backgroundColor: '#fff',
                                                            position: 'sticky',
                                                            top: 0,
                                                            zIndex: 1
                                                        }}
                                                    />
                                                    <TableCell sx={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                                                        <strong>Modelo</strong>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1, padding: '4px' }}>
                                                        <strong>Modelo Comercial</strong>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                                                        <strong>Marca</strong>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                                                        <strong>Versión</strong>
                                                    </TableCell>
                                                    <TableCell sx={{
                                                            backgroundColor: '#fff',
                                                            position: 'sticky',
                                                            top: 0,
                                                            zIndex: 1,
                                                            textAlign: 'center'}}>
                                                        <strong>Año</strong>
                                                    </TableCell>
                                                    <TableCell sx={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                                                        <strong>Imágen</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {modelos
                                                    .filter((m) => m.codigo_modelo_version !== modeloBase)
                                                    .map((m) => (
                                                        <TableRow key={m.codigo_modelo_version}>
                                                            <TableCell sx={{ width: '36px', padding: '4px', textAlign: 'center' }}>
                                                                <Checkbox
                                                                    checked={comparables.includes(m.codigo_modelo_version)}
                                                                    onChange={() => handleToggleComparable(m.codigo_modelo_version)}
                                                                    disabled={
                                                                        !comparables.includes(m.codigo_modelo_version) &&
                                                                        comparables.length >= 5
                                                                    }
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{m.nombre_modelo_version}</TableCell>
                                                            <TableCell>{m.nombre_modelo_comercial}</TableCell>
                                                            <TableCell>{m.nombre_marca}</TableCell>
                                                            <TableCell sx={{padding: '1px'}}>{m.nombre_version}</TableCell>
                                                            <TableCell sx={{ textAlign: 'center' }}>{m.anio_modelo_version}</TableCell>
                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setSelectedImagen(m.path_imagen);
                                                                        setOpenModalImagen(true);
                                                                    }}>Ver
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
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
                        <DialogResumenComparacion
                            open={openResumenDialog}
                            onClose={toggleResumenDialog}
                            resultado={resultado}
                            modelos={modelos}
                        />
                        {resultado?.comparables?.length > 0 && (
                            <Box mt={2}>
                                <Table
                                    size="small"
                                    sx={{
                                        mt: 2,
                                        borderCollapse: 'collapse',
                                        width: '100%',
                                        '& td, & th': {
                                            border: '1px solid #ddd',
                                            padding: '2px',
                                            fontSize: '13px',
                                            texAlign: 'center'
                                        },
                                        '& th': {
                                            backgroundColor: 'firebrick',
                                            color: 'white',
                                            fontSize: '12px',
                                            textAlign: 'center'
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={4}>Resumen por modelo</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell >Modelo externo</TableCell>
                                            <TableCell >Marca</TableCell>
                                            <TableCell >Versión</TableCell>
                                            <TableCell >Campos en los que es diferente</TableCell>
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
                                                    <TableCell sx={{textAlign:'center'}}>{modelo?.nombre_modelo_version || `Modelo ${item.modelo_version}`}</TableCell>
                                                    <TableCell sx={{textAlign:'center'}}>{modelo?.nombre_marca || `Marca ${item.modelo_version}`}</TableCell>
                                                    <TableCell sx={{textAlign:'center'}}>{modelo?.nombre_version || `Versión ${item.modelo_version}`}</TableCell>
                                                    <TableCell >{mejoras.join(', ')}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                        <Dialog open={openModalImagen} onClose={() => setOpenModalImagen(false)} maxWidth="md" fullWidth>
                            <DialogTitle>Vista de Imagen</DialogTitle>
                            <DialogContent>
                                <img
                                    src={selectedImagen}
                                    title="Vista previa imagen"
                                    style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                                    alt="Vista previa imagen"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenModalImagen(false)} color="primary">
                                    Cerrar
                                </Button>
                            </DialogActions>
                        </Dialog>
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
