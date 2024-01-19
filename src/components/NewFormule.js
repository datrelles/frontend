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

function NewFormule() {
    const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state)
    const [tabValue, setTabValue] = useState(0);
    const [menus, setMenus] = useState([])

    const [codFormula, setCodFormula] = useState("")
    const [nombre, setNombre] = useState("")
    const [codProducto, setCodProducto] = useState([])
    const [entradaCodProducto, setEntradaCodProducto] = useState("")
    const [codUnidad, setCodUnidad] = useState(0)
    const [cantidadProduccion, setCantidadProduccion] = useState("")
    const [activa, setActiva] = useState(0)
    const [activaList, setActivaList] = useState([{ cod: 0, nombre: "No" }, { cod: 1, nombre: "Si" }])
    const [activaNombre, setActivaNombre] = useState("No")
    const [manoObra, setManoObra] = useState("")
    const [costoStandard, setCostoStandard] = useState("")
    const [authorizedSystems, setAuthorizedSystems] = useState([]);
    const [formulaD, setFormulaD] = useState([])
    const [debitoCredito, setDebitoCredito] = useState(1)
    const [debitoCreditoList, setDebitoCreditoList] = useState([{ cod: 1, nombre: "Agrupar" }, { cod: 2, nombre: "Desagrupar" }])
    const [debitoCreditoNombre, setDebitoCreditoNombre] = useState("Agrupar")
    const [codItemCat, setCodItemCat] = useState("")
    const [codItem, setCodItem] = useState("")
    const [codItemCat1, setCodItemCat1] = useState("")

    const [nombreProducto, setNombreProducto] = useState("");
    const [productoList, setProductoList] = useState([])


    const [status1, setStatus1] = useState("01")
    const [status2, setStatus2] = useState("Z")
    const [status3, setStatus3] = useState("MTR")

    const [statusList1, setStatusList1] = useState([])
    const [statusList2, setStatusList2] = useState([])
    const [statusList3, setStatusList3] = useState([])

    const [statusList1Nombre, setStatusList1Nombre] = useState([])
    const [statusList2Nombre, setStatusList2Nombre] = useState([])
    const [statusList3Nombre, setStatusList3Nombre] = useState([])


    const { enqueueSnackbar } = useSnackbar();


    const checkAuthorization = async () => {
        const res = await fetch(`${API}/modules/${userShineray}/${enterpriseShineray}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        });
        const data = await res.json();
        setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
    };

    const getStatusList1 = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO1`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
        })
        const data = await res.json();
        console.log(data)
        setStatusList1(data)
    }

    const getStatusList2 = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO2`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
        })
        const data = await res.json();
        console.log(data)
        setStatusList2(data)
    }
    const getStatusList3 = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO3`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
        })
        const data = await res.json();
        console.log(data)
        setStatusList3(data)
    }

    const getProductList = async (status3) => {
        const res = await fetch(`${API}/productos_by_cat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                empresa: enterpriseShineray,
                cod_modelo_cat: 'PRO2',
                cod_item_cat: status2,
                cod_modelo: 'PRO1',
                cod_item: status1,
                cod_modelo_cat1: 'PRO3',
                cod_item_cat1: status3
            })
        })
        const data = await res.json();
        console.log(data)
        setProductoList(data)
        setNombreProducto(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');

    }


    const handleProductoChange = (event, value) => {
        if (value) {
            const productoSeleccionado = productoList.find((producto) => producto.nombre === value);
            if (productoSeleccionado) {
                setCodProducto(productoSeleccionado.cod_producto);
                setNombreProducto(productoSeleccionado.nombre)
                setNombre(productoSeleccionado.nombre)
            }
        } else {
            setCodProducto('');
            setNombreProducto('')
        }
    };

    const handleStatus1Change = (event, value) => {
        if (value) {
            const statusSeleccionado = statusList1.find((status) => status.nombre === value);
            if (statusSeleccionado) {
                setStatus1(statusSeleccionado.cod_item);
                setStatusList1Nombre(statusSeleccionado.nombre)
            }
        } else {
            setStatus1('01');
            setStatusList1Nombre('')
        }
    };

    const handleStatus2Change = (event, value) => {
        if (value) {
            const statusSeleccionado = statusList2.find((status) => status.nombre === value);
            if (statusSeleccionado) {
                setStatus2(statusSeleccionado.cod_item);
                setStatusList2Nombre(statusSeleccionado.nombre)
            }
        } else {
            setStatus2('Z');
            setStatusList2Nombre('')
        }
    };

    const handleStatus3Change = (event, value) => {
        if (value) {
            const statusSeleccionado = statusList3.find((status) => status.nombre === value);
            if (statusSeleccionado) {
                setStatus3(statusSeleccionado.cod_item);
                setStatusList3Nombre(statusSeleccionado.nombre)
                getProductList(statusSeleccionado.cod_item);
            }
        } else {
            setStatus3('MTR');
            setStatusList3Nombre('')
        }
    };

    const handleActivaChange = (event, value) => {
        if (value) {
            const activaSeleccionado = activaList.find((status) => status.nombre === value);
            if (activaSeleccionado) {
                setActiva(activaSeleccionado.cod);
                setActivaNombre(activaSeleccionado.nombre)
            }
        } else {
            setActiva('');
            setActivaNombre('')
        }
    };

    const handleDebitoCreditoChange = (event, value) => {
        if (value) {
            const debitoCreditoSeleccionado = debitoCreditoList.find((status) => status.nombre === value);
            if (debitoCreditoSeleccionado) {
                setDebitoCredito(debitoCreditoSeleccionado.cod);
                setDebitoCreditoNombre(debitoCreditoSeleccionado.nombre)
            }
        } else {
            setDebitoCredito('');
            setDebitoCreditoNombre('')
        }
    };

    useEffect(() => {
        document.title = 'Nueva Formula';
        checkAuthorization();
        getMenus();
        getStatusList1();
        getStatusList2();
        getStatusList3();
    }, [])

    const columns = [
        {
            name: "cod_formula",
            label: "Codigo Formula",
            options: {
                display: false,
            },
        },
        {
            name: "cod_producto_f",
            label: "Producto"
        },
        {
            name: "cod_unidad_f",
            label: "Codigo Unidad"
        },
        {
            name: "cantidad_f",
            label: "Cantidad"
        },
        {
            name: "debito_credito",
            label: "Agrupar/Desagrupar",
            options: {
                customBodyRender: (value) => debitoCreditoList.find((status) => status.cod === value).nombre,
            },
        },
        {
            name: "costo_standard",
            label: "Costo Standard",
            options: {
                display: false,
            },
        },

    ]

    const options = {
        filterType: 'dropdown',
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
        },
    }


    const handleChange2 = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API}/formule_total`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                formula: {
                    empresa: enterpriseShineray,
                    nombre: nombre,
                    cod_producto: codProducto,
                    mano_obra: parseFloat(manoObra, 10),
                    costo_standard: parseFloat(costoStandard, 10),
                    activa: parseFloat(activa, 10),
                    debito_credito: debitoCredito
                },
                detalles: formulaD
            })
        })
        const data = await res.json();
        setCodFormula(data.cod_formula)
        if (!data.error) {
            enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
        } else {
            enqueueSnackbar(data.error, { variant: 'error' });
        }
    }

    const [showForm, setShowForm] = useState(false);

    const handleAgregarDetalle = (detalle) => {
        // Agregar el detalle a la lista formulaD
        setFormulaD((prevFormulaD) => [...prevFormulaD, detalle]);
        console.log(formulaD)
    };

    const handleOpenForm = () => {
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const res = await fetch(`${API}/productos_by_cod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    empresa: enterpriseShineray,
                    cod_producto: entradaCodProducto
                })
            })
            const data = await res.json();
            console.log(data)
            setProductoList(data)
            setNombreProducto(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');
        }
    };

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
                    <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Formulas</Button>
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
                        <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Nueva Formula</h5>
                        <button
                            className="btn btn-primary btn-block"
                            type="button"
                            style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                            onClick={handleChange2}>
                            <SaveIcon /> Guardar
                        </button>
                    </div>
                    <TextField
                        disabled
                        fullWidth
                        id="cod-formula"
                        label="Codigo Formula"
                        type="text"
                        onChange={e => setCodFormula(e.target.value)}
                        value={codFormula}
                        className="form-control"
                    />
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
                                    id="estado2"
                                    fullWidth
                                    options={statusList2.map((producto) => producto.nombre)}
                                    value={statusList2Nombre}
                                    onChange={handleStatus2Change}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={1}
                                            label="Linea"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
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
                                <Autocomplete
                                    id="estado3"
                                    fullWidth
                                    options={statusList3.map((producto) => producto.nombre)}
                                    value={statusList3Nombre}
                                    onChange={handleStatus3Change}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={1}
                                            label="Categoria"
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
                                <Autocomplete
                                    id="estado1"
                                    fullWidth
                                    options={statusList1.map((status) => status.nombre)}
                                    value={statusList1Nombre}
                                    onChange={handleStatus1Change}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={1}
                                            label="Tipo de Articulo"
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
                                id="nombre"
                                label="Nombre Formula"
                                type="text"
                                onChange={e => setNombre(e.target.value)}
                                value={nombre}
                                className="form-control"
                            />
                        </Grid>
                        {/* Segunda Columna */}
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                disabled
                                id="Producto"
                                label="Producto"
                                type="text"
                                multiline
                                rows={2}
                                onChange={e => setNombreProducto(e.target.value)}
                                value={nombreProducto}
                                className="form-control"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                id="activa"
                                fullWidth
                                options={activaList.map((carga) => carga.nombre)}
                                value={activaNombre}
                                onChange={handleActivaChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Activo"
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
                            <Autocomplete
                                id="debito-credito"
                                fullWidth
                                options={debitoCreditoList.map((carga) => carga.nombre)}
                                value={debitoCreditoNombre}
                                onChange={handleDebitoCreditoChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Agrupar / Desagrupar"
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
                    <button
                        className="btn btn-primary btn-block"
                        type="button"
                        style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                        onClick={handleOpenForm}>
                        <AddIcon /> Agregar Detalle
                    </button>
                    {showForm && (
                        <NewFormuleD
                            onClose={handleCloseForm}
                            onAgregarDetalle={handleAgregarDetalle}
                            debitoCredito={debitoCredito}
                        />
                    )}
                    <div>
                        <ThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable title={"Detalles de Formula"} data={formulaD} columns={columns} options={options} />
                        </ThemeProvider>
                    </div>
                </div>


            </Box >
        </div >
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <NewFormule />
        </SnackbarProvider>
    );
}