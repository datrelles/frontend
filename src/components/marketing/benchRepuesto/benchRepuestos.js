import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, DialogTitle, DialogContent,
    DialogActions, Dialog, Autocomplete, TextField, IconButton
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Navbar0 from "../../Navbar0";
import LoadingCircle from "../../contabilidad/loader";
import ButtonGroup from "@mui/material/ButtonGroup";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import {Card} from "@mui/material";
import {CardContent} from "@material-ui/core";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';


const API = process.env.REACT_APP_API;

function BenchRepuestosCompatibles () {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const navigate = useNavigate();
    const [codigoMarca, setCodigoMarca] = useState(null);
    const [codigoModelo, setCodigoModelo] = useState(null);
    const [productos, setProductos] = useState([]);
    const [compatibles, setCompatibles] = useState([]);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [imagenModal, setImagenModal] = useState(null);
    const [openModalImagen, setOpenModalImagen] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [marcasActivas, setMarcasActivas] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelosComerciales, setModelosComerciales] = useState([]);
    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
    const [modeloSeleccionado, setModeloSeleccionado] = useState(null);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [busquedaEjecutada, setBusquedaEjecutada] = useState(false);
    const [categoriaStartIndex, setCategoriaStartIndex] = useState(0);
    const categoriasVisibles = 9;


    const [modeloComercialMarca, setModeloComercialMarca] = useState([]);

    const fetchProductos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_cliente_canal_modelo`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                const productosUnicos = Array.from(
                    new Map(data.map(p => [p.nombre_producto, p])).values()
                );
                setProductos(productosUnicos);
            } else {
                enqueueSnackbar("Error al obtener repuestos", { variant: "error" });
            }
        } catch (e) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const buscarCompatibles = async () => {
        console.log('Ejecutando buscarCompatibles');

        if (!codigoMarca || !codigoModelo) {
            console.warn('Faltan parámetros para buscar compatibles');
            return;
        }

        try {
            const res = await fetch(`${API}/bench_rep/repuestos_compatibles_por_modelo?codigo_marca=${codigoMarca}&codigo_modelo_comercial=${codigoModelo}`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                console.log("Datos recibidos:", data);
                setCompatibles(data);
                setCategoriaSeleccionada('');
                setBusquedaEjecutada(true);

            } else {
                enqueueSnackbar(data.error || "Error en consulta", { variant: "error" });
            }
        } catch (e) {
            enqueueSnackbar("Error en servidor", { variant: "error" });
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
                enqueueSnackbar(data.error || "Error al obtener las imágenes", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const exportarExcel = async () => {
        if (!productoSeleccionado || !productoSeleccionado.nombre_producto) {
            console.error("No hay producto seleccionado.");
            return;
        }

        const res = await fetch(`${API}/bench_rep/exportar_modelos_compatibles_xlsx`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_producto: productoSeleccionado.nombre_producto,
                modelos: compatibles
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error al exportar:", errorText);
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'modelos_compatibles.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const fetchMarcas = async () => {
        try {
            const res = await fetch(`${API}/bench/get_marca`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();

            if (res.ok && Array.isArray(data)) {
                const marcasActivas = data.filter(marca => marca.estado_marca === 1);
                setMarcasActivas(marcasActivas);
                setMarcas(data);
            } else {
                enqueueSnackbar('Error al obtener marcas activas', { variant: 'error' });
            }
        } catch (err) {
            enqueueSnackbar('Error cargando marcas', { variant: 'error' });
        }
    };

    const fetchModeloComercial = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_comerciales`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setModelosComerciales(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar('Error al obtener modelos comerciales', { variant: 'error' });
        }
    };

    const fetchModeloComercialMarca = async (marca) => {
        if (!marca || !marca.codigo_marca) return;

        try {
            const res = await fetch(`${API}/bench_rep/modelos_comerciales_por_marca?codigo_marca=${marca.codigo_marca}`, {
                headers: { Authorization: "Bearer " + jwt }
            });

            const data = await res.json();

            if (res.ok && Array.isArray(data)) {
                setModeloComercialMarca(data);
            } else {
                enqueueSnackbar('Error al obtener modelos comerciales', { variant: 'error' });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const categoriasUnicas = Object.entries(compatibles || {});


    const getColor = (nivel) => {
        if (nivel >= 95) return 'green';
        if (nivel >= 85) return 'orange';
        return 'red';
    };

    const getLabel = (nivel) => {
        if (nivel >= 95) return 'Alta';
        if (nivel >= 85) return 'Media';
        return 'Baja';
    };
    useEffect(() => {
        if (categoriasUnicas.length > 0 && !categoriaSeleccionada) {
            setCategoriaSeleccionada(categoriasUnicas[0][0]);
        }
    }, [categoriasUnicas]);


    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchProductos();
                await fetchImagenData();
                await fetchMarcas();
                await fetchModeloComercial();
            } catch (err) {
                console.error("Error cargando datos iniciales .!:", err);
            }
        };
        cargarDatos();
    }, []);

    const handleAnterior = () => {
        if (categoriaStartIndex > 0) {
            setCategoriaStartIndex(prev => prev - 1);
        }
    };

    const handleSiguiente = () => {
        if (categoriaStartIndex + categoriasVisibles < categoriasUnicas.length) {
            setCategoriaStartIndex(prev => prev + 1);
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
                    <Box padding={4} sx={{ mt: 2, borderCollapse: 'collapse', width: '100%' }} >
                        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Repuestos Compatibles con el Modelo Seleccionado
                        </Typography>
                        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={marcas}
                                        getOptionLabel={(option) => option.nombre_marca || ''}
                                        value={marcaSeleccionada || null}
                                        isOptionEqualToValue={(option, value) => option.codigo_marca === value?.codigo_marca}
                                        onChange={(e, v) => {
                                            setMarcaSeleccionada(v);
                                            setCodigoMarca(v?.codigo_marca || null);
                                            setModeloSeleccionado(null);
                                            setCodigoModelo(null);
                                            fetchModeloComercialMarca(v);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Seleccionar Marca" variant="outlined" fullWidth />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={modeloComercialMarca}
                                        getOptionLabel={(option) =>
                                            option.nombre_modelo && option.anio_modelo
                                                ? `${option.nombre_modelo} – ${option.anio_modelo}`
                                                : option.nombre_modelo || ''
                                        }
                                        value={
                                            modeloComercialMarca.length > 0
                                                ? modeloSeleccionado
                                                : null
                                        }
                                        onChange={(e, v) => {
                                            setModeloSeleccionado(v);
                                            setCodigoModelo(v?.codigo_modelo_comercial || null);
                                        }}
                                        isOptionEqualToValue={(option, value) => option.codigo_modelo_comercial === value?.codigo_modelo_comercial}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Seleccionar Modelo Comercial" variant="outlined" fullWidth />
                                        )}
                                        disabled={!marcaSeleccionada}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                        <Button
                                            variant="contained"
                                            onClick={buscarCompatibles}
                                            sx={{
                                                backgroundColor: 'firebrick',
                                                color: '#fff',
                                                fontSize: '12px',
                                                minWidth: '160px',
                                                '&:hover': { backgroundColor: '#b22222' }
                                            }}
                                        >
                                            Buscar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setCodigoMarca('');
                                                setCompatibles([]);
                                                setProductoSeleccionado('');
                                                setModeloSeleccionado(null);
                                                setMarcaSeleccionada(null);
                                                setImagenModal(null);
                                                setSelectedImagen(null);
                                                setBusquedaEjecutada(false);
                                                setCategoriaSeleccionada('');
                                                if (productos.length === 0) fetchProductos();
                                            }}
                                            sx={{
                                                backgroundColor: '#535353',
                                                color: '#fff',
                                                fontSize: '12px',
                                                minWidth: '160px',
                                                '&:hover': { backgroundColor: '#434343' }
                                            }}
                                        >
                                            Nueva Consulta
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={exportarExcel}
                                            sx={{
                                                backgroundColor: 'green',
                                                color: '#fff',
                                                fontSize: '12px',
                                                minWidth: '160px',
                                                '&:hover': { backgroundColor: '#1b5e20' }
                                            }}
                                        >
                                            EXPORTAR INF.
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                    <Box sx={{ px: 2, py: 3 }}>
                        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, mb: 3 }}>
                            {busquedaEjecutada && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <IconButton onClick={handleAnterior} disabled={categoriaStartIndex === 0}>
                                        <ChevronLeft />
                                    </IconButton>
                                    <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
                                        {categoriasUnicas
                                            .slice(categoriaStartIndex, categoriaStartIndex + categoriasVisibles)
                                            .map(([categoria]) => (
                                                <Box
                                                    key={categoria}
                                                    onClick={() => setCategoriaSeleccionada(categoria)}
                                                    sx={{
                                                        minWidth: 160,
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        bgcolor: categoriaSeleccionada === categoria ? 'primary.main' : 'grey.200',
                                                        color: categoriaSeleccionada === categoria ? 'white' : 'text.primary',
                                                        fontWeight: categoriaSeleccionada === categoria ? 'bold' : 'normal',
                                                        boxShadow: 2,
                                                        transition: '0.2s',
                                                    }}
                                                >
                                                    {categoria.toUpperCase()}
                                                </Box>
                                            ))}
                                    </Box>
                                    <IconButton
                                        onClick={handleSiguiente}
                                        disabled={categoriaStartIndex + categoriasVisibles >= categoriasUnicas.length}
                                    >
                                        <ChevronRight />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                        <Grid container spacing={3}>
                            {(categoriasUnicas.find(([cat]) => cat === categoriaSeleccionada)?.[1] || []).map((rep, idx) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                                    <Card sx={{ height: '100%', p: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom>
                                                <strong>MODELO COMERCIAL:</strong> {rep.nombre_modelo_comercial} – {rep.anio_modelo}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>NOMBRE PRODUCTO:</strong> {rep.nombre_producto}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>ORIGEN VALIDACIÓN:</strong> {rep.origen_validacion}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>FECHA VALIDACIÓN:</strong> {new Date(rep.fecha_validacion).toLocaleDateString()}
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>Nivel de Confianza:</strong> {rep.nivel_confianza}% –
                                                    <span style={{ color: getColor(rep.nivel_confianza), fontWeight: 'bold' }}>
                                                        {getLabel(rep.nivel_confianza)}
                                                    </span>
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={rep.nivel_confianza}
                                                    sx={{ height: 6, borderRadius: 5, mt: 1 }}
                                                    color={getColor(rep.nivel_confianza) === 'green' ? 'success' : 'warning'}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                    <Dialog open={openModalImagen} onClose={() => setOpenModalImagen(false)} maxWidth="md" fullWidth>
                        <DialogTitle>Vista de Imagen</DialogTitle>
                        <DialogContent>
                            <img
                                src={imagenModal}
                                title="Vista previa imagen"
                                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                                alt="Vista previa imagen"/>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenModalImagen(false)} color="primary">
                                Cerrar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            )}
        </>
    );
}

export default function  IntegrationNotistack()  {
    return (
        <SnackbarProvider maxSnack={3}>
            <BenchRepuestosCompatibles />
        </SnackbarProvider>
    );
}