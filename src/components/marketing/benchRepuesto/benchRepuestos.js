import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, DialogTitle, DialogContent,
    DialogActions, Dialog, Autocomplete, TextField
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Navbar0 from "../../Navbar0";
import LoadingCircle from "../../contabilidad/loader";
import ButtonGroup from "@mui/material/ButtonGroup";
import MUIDataTable from "mui-datatables";
import {createTheme, ThemeProvider} from "@mui/material/styles";

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
    const [prodcutoSeleccionada, setProductoSeleccionada] = useState('');
    const [modelos, setModelos] = useState([]);
    const [resultado, setResultado] = useState(null);

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

    const exportarExcel = async () => {
        const res = await fetch(`${API}/bench_model/exportar_comparacion_repuestos_xlsx`, {
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
                await fetchProductos();
                await fetchImagenData();
            } catch (err) {
                console.error("Error cargando datos iniciales .!:", err);
            }
        };
        cargarDatos();
    }, []);

    const options = {
        responsive: 'standard',
        selectableRows: 'none',
        download: false,
        print: false,
        textLabels: {
            body: {
                noMatch: "Lo siento, no se encontraron registros",
                toolTip: "Ordenar"
            },
            pagination: {
                next: "Siguiente", previous: "Anterior",
                rowsPerPage: "Filas por página:", displayRows: "de"
            }
        }
    };

    const columns = [
        { name: "nombre_modelo_comercial", label: "Modelo Comercial" },
        { name: "nombre_empresa", label: "Empresa" },
        { name: "nombre_version", label: "Versión" },
        { name: "nombre_marca", label: "Marca" },
        { name: "nombre_linea", label: "Línea" },
        { name: "nombre_segmento", label: "Segmento" },
        {
            name: "path_imagen",
            label: "Imágen Referencial",
            options: {
                customBodyRender: (value) => (
                    <Button
                        onClick={() => {
                            setImagenModal(value);
                            setOpenModalImagen(true);
                        }}
                        variant="outlined"
                        size="small"
                    >
                        Ver imagen
                    </Button>
                )
            }
        }
    ];
    const getMuiTheme = () =>
        createTheme({
            components: {
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            paddingLeft: '3px', paddingRight: '3px', paddingTop: '0px', paddingBottom: '0px',
                            backgroundColor: '#00000', whiteSpace: 'nowrap', flex: 1,
                            borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '14px'
                        },
                        head: {
                            backgroundColor: 'firebrick', color: '#ffffff', fontWeight: 'bold',
                            paddingLeft: '0px', paddingRight: '0px', fontSize: '12px'
                        },
                    }
                },
                MUIDataTableToolbar: {
                    styleOverrides: {
                        root: {
                            justifyContent: 'center'
                        },
                        titleText: {
                            width: '100%',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontSize: '22px'
                        }
                    }
                }
            }
        });

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
                        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }} >Modelos compatibles con el repuesto seleccionado</DialogTitle>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={5}>
                                <Autocomplete
                                    options={productos}
                                    getOptionLabel={(option) => option.nombre_producto || ''}
                                    value={productos.find(p => p.cod_producto === codProducto) || null}
                                    onChange={(e, v) => setCodProducto(v ? v.cod_producto : null)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Seleccionar Repuesto" variant="outlined" fullWidth />
                                    )}
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    onClick={buscarCompatibles}
                                    sx={{
                                        backgroundColor: 'firebrick',
                                        color: '#fff',
                                        fontSize: '12px',
                                        minWidth: '180px',
                                        '&:hover': {
                                            backgroundColor: '#b22222'
                                        }
                                    }}>Buscar modelos compatibles
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setCodProducto('');
                                        setCompatibles([]);
                                        setProductoSeleccionada('');
                                        setImagenModal(null);
                                        setSelectedImagen(null);
                                        if (productos.length === 0) fetchProductos();
                                    }}
                                    sx={{
                                        backgroundColor: '#535353',
                                        color: '#fff',
                                        fontSize: '12px',
                                        '&:hover': {
                                            backgroundColor: '#535353'
                                        }
                                    }}>Nueva Consulta
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    onClick={exportarExcel}
                                    sx={{
                                        backgroundColor: 'green',
                                        color: '#fff',
                                        fontSize: '12px',
                                        '&:hover': { backgroundColor: '#1b5e20' }
                                    }}>Exportar a Excel
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title="Modelos Compatibles"  data={compatibles} columns={columns} options={options} />
                    </ThemeProvider>
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

export default function  IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <BenchRepuestosCompatibles />
        </SnackbarProvider>
    );
}