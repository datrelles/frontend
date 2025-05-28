import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, MenuItem, Select, Typography, Table,
    TableHead, TableRow, TableCell, TableBody, DialogTitle, DialogContent, DialogActions, Dialog
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Navbar0 from "../../Navbar0";
import LoadingCircle from "../../contabilidad/loader";
import ButtonGroup from "@mui/material/ButtonGroup";

const API = process.env.REACT_APP_API;

function BenchRepuestosCompatibles () {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const navigate = useNavigate();
    const [codProducto, setCodProducto] = useState('');
    const [productos, setProductos] = useState([]);
    const [compatibles, setCompatibles] = useState([]);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [imagenModal, setImagenModal] = useState(null);
    const [openModalImagen, setOpenModalImagen] = useState(false);

    const fetchProductos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelo_version`, {
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
        if (!codProducto) return;

        try {
            const res = await fetch(`${API}/bench_rep/repuesto_compatibilidad?cod_producto=${codProducto}&empresa=${enterpriseShineray}`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                setCompatibles(data);
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
                enqueueSnackbar(data.error || "Error al obtener imágenes", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchProductos();
                await fetchImagenData();
            } catch (err) {
                console.error("Error cargando datos iniciales .!:", err);
            }
        };
        cargarDatos();
    }, []);

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
                        <Typography variant="h5" textAlign="center" gutterBottom>
                            Modelos compatibles con el repuesto seleccionado
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography>Seleccionar repuesto</Typography>
                                <Select
                                    fullWidth
                                    value={codProducto}
                                    onChange={(e) => setCodProducto(e.target.value)}
                                 variant="outlined">
                                    {productos.map(p => (
                                        <MenuItem key={p.cod_producto} value={p.cod_producto}>
                                            {p.nombre_producto}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={6} display="flex" alignItems="flex-end">
                                <Button
                                    variant="contained"
                                    onClick={buscarCompatibles}
                                    sx={{ backgroundColor: 'firebrick', color: '#fff' }}
                                >
                                    Buscar modelos compatibles
                                </Button>
                            </Grid>
                        </Grid>
                        {compatibles.length > 0 && (
                            <Box mt={4}>                                
                                <Table size="small"
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
                                       }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={7}>Modelos compatibles</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell >Modelo Comercial</TableCell>
                                            <TableCell >Empresa</TableCell>
                                            <TableCell >Versión</TableCell>
                                            <TableCell >Marca</TableCell>
                                            <TableCell >Línea</TableCell>
                                            <TableCell >Segmento</TableCell>
                                            <TableCell >Imagen Referencial</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {compatibles.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.nombre_modelo_comercial}</TableCell>
                                                <TableCell>{item.nombre_empresa}</TableCell>
                                                <TableCell>{item.nombre_version}</TableCell>
                                                <TableCell>{item.nombre_marca}</TableCell>
                                                <TableCell>{item.nombre_linea}</TableCell>
                                                <TableCell>{item.nombre_segmento}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedImagen(item.path_imagen);
                                                            setOpenModalImagen(true);
                                                        }}>Ver Imágen
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Box>
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
                </div>
            )}
        </>
    );
}

export default function  IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <BenchRepuestosCompatibles />
        </SnackbarProvider>
    );
}

