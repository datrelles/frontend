import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Tabs, Tab } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import FileGenerator from './FileGenerator';
import AddIcon from '@material-ui/icons/Add';
import NewFormuleD from './NewFormuleD';
import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useAuthContext } from '../context/authContext';

const API = process.env.REACT_APP_API;

function NewAsignacion() {
    const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [menus, setMenus] = useState([])

    const [codProducto, setCodProducto] = useState("")
    const [nombreProducto, setNombreProducto] = useState("");
    const [productoList, setProductoList] = useState([]);

    const [entradaCodProducto, setEntradaCodProducto] = useState("")
    const [entradaCodCliente, setEntradaCodCliente] = useState("")

    const [rucCliente, setRucCliente] = useState([])
    const [nombreCostumer, setNombreCostumer] = useState("");
    const [costumersList, setCostumersList] = useState([]);

    const [porcentajeMaximo, setPorcentajeMaximo] = useState(0);
    const [cantidadMinima, setCantidadMinima] = useState(0);

    const { enqueueSnackbar } = useSnackbar();

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const res = await fetch(`${API}/com/modelos_by_cod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    empresa: enterpriseShineray,
                    cod_producto: entradaCodProducto.toUpperCase()
                })
            })
            const data = await res.json();
            console.log(data)
            setProductoList(data)
            setNombreProducto(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');
        }
    };

    const handleProductoChange = (event, value) => {
        if (value) {
            const productoSeleccionado = productoList.find((producto) => producto.nombre === value);
            if (productoSeleccionado) {
                setCodProducto(productoSeleccionado.cod_producto);
                setNombreProducto(productoSeleccionado.nombre)
            }
        } else {
            setCodProducto('');
            setNombreProducto('')
        }
    };

    const handleKeyDown2 = async (e) => {
        if (e.key === 'Enter') {
            const res = await fetch(`${API}/fin/costumers_by_cod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    empresa: enterpriseShineray,
                    cod_cliente: entradaCodCliente.toUpperCase()
                })
            })
            const data = await res.json();
            console.log(data)
            setCostumersList(data)
            setNombreCostumer(data.find((objeto) => objeto.cod_cliente === rucCliente)?.apellido1 || '');
        }
    };

    const handleCostumerChange = (event, value) => {
        if (value) {
            const clienteSeleccionado = costumersList.find((cliente) => cliente.apellido1 === value);
            if (clienteSeleccionado) {
                setRucCliente(clienteSeleccionado.cod_cliente);
                setNombreCostumer(clienteSeleccionado.apellido1)
            }
        } else {
            setRucCliente('');
            setNombreCostumer('')
        }
    };


    useEffect(() => {
        document.title = 'Nueva Asignacion';
        getMenus();
    }, [])

    const handleChange2 = async (e) => {
        if (parseInt(cantidadMinima) > 0 && 100 > parseFloat(porcentajeMaximo) > 0) {
            e.preventDefault();
            const res = await fetch(`${API}/com/asig_new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    empresa: enterpriseShineray,
                    ruc_cliente: rucCliente,
                    cod_producto: codProducto,
                    porcentaje_maximo: parseFloat(porcentajeMaximo),
                    cantidad_minima: parseInt(cantidadMinima)
                })
            })
            const data = await res.json();
            if (!data.error) {
                enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
            } else {
                enqueueSnackbar(data.error, { variant: 'error' });
            }
        } else {
            enqueueSnackbar('Cantidades o porcentajes inválidos', { variant: 'error' });
        }
    }

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setMenus(data)
            }
        } catch (error) {
        }
    }

    const getMuiTheme = () =>
        createTheme({
            components: {
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            paddingLeft: '3px', // Relleno a la izquierda
                            paddingRight: '3px',
                            paddingTop: '0px', // Ajusta el valor en el encabezado si es necesario
                            paddingBottom: '0px',
                            backgroundColor: '#00000',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            borderBottom: '1px solid #ddd',
                            borderRight: '1px solid #ddd',
                            fontSize: '14px'
                        },
                        head: {
                            backgroundColor: 'firebrick', // Color de fondo para las celdas de encabezado
                            color: '#ffffff', // Color de texto para las celdas de encabezado
                            fontWeight: 'bold', // Añadimos negrita para resaltar el encabezado
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            fontSize: '12px'
                        },
                    }
                },
                MuiTable: {
                    styleOverrides: {
                        root: {
                            borderCollapse: 'collapse', // Fusionamos los bordes de las celdas
                        },
                    },
                },
                MuiTableHead: {
                    styleOverrides: {
                        root: {
                            borderBottom: '5px solid #ddd', // Línea inferior más gruesa para el encabezado
                        },
                    },
                },
                MuiToolbar: {
                    styleOverrides: {
                        regular: {
                            minHeight: '10px',
                        }
                    }
                }
            }
        });

    return (
        <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
            <Navbar0 menus={menus} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'right',
                    '& > *': {
                        m: 1,
                    },
                }}
            >
                <ButtonGroup variant="text" aria-label="text button group" >
                    <Button style={{ width: `100px`, marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate('/dashboard') }}>Módulos</Button>
                    <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Asignaciones</Button>
                </ButtonGroup>
            </Box>
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '30ch' },
                    width: '100%'
                }}
                noValidate
                autoComplete="off"
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '20px' }}>
                        <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Nueva Asignacion</h5>
                        <button
                            className="btn btn-primary btn-block"
                            type="button"
                            style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                            onClick={handleChange2}>
                            <SaveIcon /> Guardar
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    required
                                    id="codigo-producto"
                                    label="Buscar por codigo"
                                    type="text"
                                    onChange={e => setEntradaCodProducto(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    value={entradaCodProducto}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    fullWidth
                                    id="cod-prod"
                                    label="Codigo Producto"
                                    type="text"
                                    onChange={e => setCodProducto(e.target.value)}
                                    value={codProducto}
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    id="producto"
                                    fullWidth
                                    options={productoList.map((producto) => producto.nombre)}
                                    value={nombreProducto}
                                    onChange={handleProductoChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={2}
                                            label="Producto"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    required
                                    id="codigo-cliente"
                                    label="Buscar por nombre"
                                    type="text"
                                    onChange={e => setEntradaCodCliente(e.target.value)}
                                    onKeyDown={handleKeyDown2}
                                    value={entradaCodCliente}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    fullWidth
                                    id="cod-cli"
                                    label="Ruc Cliente"
                                    type="text"
                                    onChange={e => setRucCliente(e.target.value)}
                                    value={rucCliente}
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    id="cliente"
                                    fullWidth
                                    options={costumersList.map((cliente) => cliente.apellido1)}
                                    value={nombreCostumer}
                                    onChange={handleCostumerChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={2}
                                            label="Cliente"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </div>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                required
                                id="porcentaje"
                                label="Porcentaje Maximo"
                                type="number"
                                onChange={e => setPorcentajeMaximo(e.target.value)}
                                value={porcentajeMaximo}
                                className="form-control"
                            />
                            <TextField
                                fullWidth
                                required
                                id="minimo"
                                label="Cantidad Minima"
                                type="number"
                                onChange={e => setCantidadMinima(e.target.value)}
                                value={cantidadMinima}
                                className="form-control"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                        </Grid>
                        <Grid item xs={12} md={3}>
                        </Grid>
                        <Grid item xs={12} md={3}>
                        </Grid>
                    </Grid>
                </div>


            </Box >
        </div >
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <NewAsignacion />
        </SnackbarProvider>
    );
}