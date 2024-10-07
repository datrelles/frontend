import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';
import Functions from "../helpers/Functions";
import Grid from '@mui/material/Grid';
import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import LoadingCircle from './contabilidad/crafter';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

import { useAuthContext } from "../context/authContext";


const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
});

function Presupuesto() {
    const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
    const [presupuestos, setPresupuestos] = useState([])
    const [open, setOpen] = useState(false);
    const [menus, setMenus] = useState([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();

    const [currentProduct, setCurrentProduct] = useState('')
    const [currentCostumer, setCurrentCostumer] = useState('')
    const [currentCodCostumer, setCurrentCodCostumer] = useState('')
    const [currentMonth, setCurrentMonth] = useState(0)
    const [currentYear, setCurrentYear] = useState(0)
    const [currentValue, setCurrentValue] = useState(0)


    const getPresupuestos = async () => {
        try {
            const res = await fetch(`${API}/log/presupuesto`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify({
                        empresa: 20
                    }),
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setPresupuestos(data)
                console.log(data);
            }
        } catch (error) {
            console.log(error);
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
                console.log(data)
            }
        } catch (error) {
        }
    }

    useEffect(() => {
        document.title = 'Asignaciones Cupos';
        getPresupuestos();
        getMenus();
    }, [])


    const handleChange2 = async (e) => {
        e.preventDefault();
        navigate('/newAsignacion');
    }

    const handleClickOpenNew = async (rowData) => {
        console.log(rowData)
        console.log(presupuestos)
        setOpen(true);
        const row = presupuestos.filter(item => item.COD_PERSONA === rowData[1] && item.COD_PRODUCTO_MODELO === rowData[3] && item.ANIO === rowData[5] && item.MES === rowData[6])[0];
        console.log(row)
        setCurrentCostumer(row.CLIENTE)
        setCurrentProduct(row.NOMBRE)
        setCurrentCodCostumer(row.COD_PERSONA)
        setCurrentMonth(row.MES)
        setCurrentYear(row.ANIO)
    };
    const handleClose = () => {
        setCurrentCostumer('')
        setCurrentProduct('')
        setCurrentCodCostumer('')
        setCurrentMonth(0)
        setCurrentYear(0)
        setOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (parseInt(currentValue) > 0) {
            const res = await fetch(`${API}/com/asig_edit`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify({
                        empresa: enterpriseShineray,
                        ruc_cliente: currentCodCostumer,
                        cod_producto: currentProduct,
                        cantidad_minima: parseInt(currentCantidad, 10),
                        porcentaje_maximo: parseInt(currentPorcentaje, 10),
                    })
                });
            const data = await res.json();
            setLoading(false);
            console.log(data)
            if (!data.error) {
                enqueueSnackbar('Asignación Actualizada', { variant: 'success' });
            } else {
                enqueueSnackbar(data.error, { variant: 'error' });
            }
            setCurrentProduct('')
            setCurrentCodCostumer('')
            setCurrentCostumer('')
            setCurrentPorcentaje(0)
            setCurrentCantidad(0)
            setOpen(false)
        } else {
            setLoading(false);
            enqueueSnackbar('Valor inválido', { variant: 'error' });
            setOpen(false)
        }
    }

    const columns = [
        {
            name: "EMPRESA",
            label: "Empresa",
            options: {
                display: false,
            },
        },
        {
            name: "COD_PERSONA",
            label: "Ruc"
        },
        {
            name: "CLIENTE",
            label: "Cliente"
        },
        {
            name: "COD_PRODUCTO_MODELO",
            label: "Cod Producto"
        },
        {
            name: "NOMBRE",
            label: "Modelo"
        },
        {
            name: "ANIO",
            label: "Año"
        },
        {
            name: "MES",
            label: "Mes"
        },
        {
            name: "SELLIN",
            label: "Presupuesto",
            options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "SELLOUT",
            label: "Sell Out",
            options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "VALOR",
            label: "Valor",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "action",
            label: "Accion",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            <IconButton onClick={() => handleClickOpenNew(tableMeta.rowData)} color="primary" >
                                <EditIcon />
                            </IconButton>
                        </div>
                    );
                },
            },
        },
    ];

    const options = {
        responsive: 'standard',
        textLabels: {
            body: {
                noMatch: "Lo siento, no se encontraron registros",
                toolTip: "Ordenar",
                columnHeaderTooltip: column => `Ordenar por ${column.label}`
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por página:",
                displayRows: "de"
            },
            toolbar: {
                search: "Buscar",
                downloadCsv: "Descargar CSV",
                print: "Imprimir",
                viewColumns: "Ver columnas",
                filterTable: "Filtrar tabla"
            },
            filter: {
                all: "Todos",
                title: "FILTROS",
                reset: "REINICIAR"
            },
            viewColumns: {
                title: "Mostrar columnas",
                titleAria: "Mostrar/Ocultar columnas de tabla"
            },
            selectedRows: {
                text: "fila(s) seleccionada(s)",
                delete: "Borrar",
                deleteAria: "Borrar fila seleccionada"
            }
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
        <>{loading ? (<LoadingCircle />) : (
            <SnackbarProvider>
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
                            <Button onClick={() => { navigate('/dashboard') }}>Módulos</Button>
                        </ButtonGroup>
                    </Box>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <button
                            className="btn btn-primary"
                            type="button"
                            style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                            onClick={handleChange2}>
                            <AddIcon /> Asignacion
                        </button>
                    </div>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Presupuesto"}
                            data={presupuestos}
                            columns={columns}
                            options={options}
                        />
                    </ThemeProvider>
                </div>
                <Dialog open={open} onClose={handleClose} maxWidth="xs" >
                    <div style={{ display: "flex" }}>
                        <div>
                            <DialogContent >
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            disabled
                                            fullWidth
                                            id="cod-prod"
                                            label="Modelo"
                                            type="text"
                                            value={currentProduct}
                                            className="form-control"
                                            sx={{ mb: 1 }} 
                                        />
                                        <TextField
                                            disabled
                                            fullWidth
                                            id="cod-cliente"
                                            label="Cliente"
                                            type="text"
                                            value={currentCostumer}
                                            className="form-control"
                                            sx={{ mb: 1 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Valor"
                                            type="text"
                                            onChange={e => setCurrentValue(e.target.value)}
                                            value={currentValue}
                                            className="form-control"
                                            sx={{ mb: 1 }} 
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            disabled
                                            fullWidth
                                            label="Año"
                                            type="text"
                                            onChange={e => setCurrentYear(e.target.value)}
                                            value={currentYear}
                                            className="form-control"
                                            sx={{ mb: 1 }} 
                                        />
                                        <TextField
                                            disabled
                                            fullWidth
                                            label="Mes"
                                            type="text"
                                            onChange={e => setCurrentMonth(e.target.value)}
                                            value={currentMonth}
                                            className="form-control"
                                            sx={{ mb: 1 }}
                                        />
                                    </Grid>
                                </Grid>

                            </DialogContent>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <DialogActions>
                                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }} >Guardar</Button>
                                </DialogActions>
                                <DialogActions>
                                    <Button onClick={handleClose}>Cerrar</Button>
                                </DialogActions>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </SnackbarProvider>
        )}
        </>
    )
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <Presupuesto />
        </SnackbarProvider>
    );
}
