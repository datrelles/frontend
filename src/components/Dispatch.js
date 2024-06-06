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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import LoadingCircle from './contabilidad/crafter';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";
import dayjs from 'dayjs';
import Autocomplete from '@mui/material/Autocomplete';


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

function Dispatch() {
    const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
    const [dispatchs, setDispatchs] = useState([])
    const [statusList, setStatusList] = useState([])
    const [pedido, setPedido] = useState("");
    const [orden, setOrden] = useState("");
    const [identificacion, setIdentificacion] = useState("");
    const [cliente, setCliente] = useState("");
    const [bodega, setBodega] = useState("");
    const [direccion, setDireccion] = useState("");

    const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'year').format('DD/MM/YYYY'));
    const [toDate, setToDate] = useState(dayjs().subtract(11, 'months').format('DD/MM/YYYY'));

    const [status, setStatus] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [menus, setMenus] = useState([])
    const [excelDataFee, setExcelDataFee] = useState([]);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();


    const getDispatchs = async () => {
        try {
            console.log(fromDate)
            console.log(toDate)
            const res = await fetch(`${API}/log/pedidos`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify({
                        pn_empresa: enterpriseShineray,
                        pn_cod_agencia: branchShineray,
                        pv_cod_tipo_pedido: "PC",
                        pd_fecha_inicial: fromDate,
                        pd_fecha_final: toDate,
                        pv_cod_persona_cli: identificacion

                    })
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setDispatchs(data)
                console.log(data)
            }
        } catch (error) {
            toast.error(error);
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
        document.title = 'Despachos Motos';
        getDispatchs();
        getMenus();
        getStatusList();
        setToDate(null);
        setFromDate(null);
    }, [])

    const handleRowClick = (rowData, rowMeta) => {
        const row = negociaciones.filter(item => item.cod_comprobante === rowData[0])[0];
        navigate('/fideicomiso', { state: row });
        console.log(row)
    }

    const handleChange2 = async (e) => {
        e.preventDefault();
        navigate('/newNegociacion');
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            getDispatchs()
        }
    };

    const getStatusList = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=FIN`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        })
        const data = await res.json();
        setStatusList(data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_item,
        })));
    }


    const columns = [
        { name: "BODEGA_ENVIA", label: "Bodega Envía" },
        { name: "CANTIDAD_ANULADA", label: "Cantidad Anulada" },
        { name: "CANTIDAD_CERRADA", label: "Cantidad Cerrada" },
        { name: "CANTIDAD_DESPACHADA", label: "Cantidad Despachada" },
        { name: "CANTIDAD_PENDIENTE", label: "Cantidad Pendiente" },
        { name: "CANTIDAD_SOLICITADA", label: "Cantidad Solicitada" },
        { name: "COD_BODEGA_DESPACHA", label: "Código Bodega Despacha" },
        { name: "COD_BODEGA_ENVIA", label: "Código Bodega Envía" },
        { name: "COD_DIRECCION", label: "Código Dirección" },
        { name: "COD_ORDEN", label: "Código Orden" },
        { name: "COD_PEDIDO", label: "Código Pedido" },
        { name: "COD_PERSONA_CLI", label: "Código Persona Cliente" },
        { name: "COD_TIPO_ORDEN", label: "Código Tipo Orden" },
        { name: "COD_TIPO_PEDIDO", label: "Código Tipo Pedido" },
        { name: "COMPROBANTE_MANUAL", label: "Comprobante Manual" },
        { name: "DIRECCION", label: "Dirección" },
        { name: "ESTADO_ANTERIOR", label: "Estado Anterior" },
        { name: "FECHA_PEDIDO", label: "Fecha Pedido" },
        { name: "NOMBRE_AGENCIA", label: "Nombre Agencia" },
        { name: "NOMBRE_PERSONA_CLI", label: "Nombre Persona Cliente" },
        { name: "NOMBRE_PERSONA_VEN", label: "Nombre Persona Vendedor" },
        { name: "VALOR", label: "Valor" },
    ];


    const options = {
        responsive: 'standard',
        onRowClick: handleRowClick,
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
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    id="cod-comprobante"
                                    label="Código Comprobante"
                                    type="text"
                                    onChange={e => setPedido(e.target.value)}
                                    value={pedido}
                                    className="form-control"
                                />
                                {/* <Autocomplete
                                    disabled
                                    id="tipo"
                                    options={tipoComprobanteList.map((tipo) => tipo.nombre)}
                                    value={tipoComprobanteNombre}
                                    onChange={handleTipoComprobanteChange}
                                    fullWidth
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Tipo Comprobante"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                /> */}
                                <div className={classes.datePickersContainer}>
                                    <div>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DatePicker', 'DatePicker']}>
                                                <DatePicker
                                                    label="Fecha Inicial"
                                                    value={dayjs(fromDate, "DD/MM/YYYY")}
                                                    onChange={(newValue) => {
                                                        const formattedDate = dayjs(newValue).format('DD/MM/YYYY')
                                                        setFromDate(formattedDate);
                                                        getDispatchs()
                                                    }}
                                                    format={'DD/MM/YYYY'}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </div>
                                    <div>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DatePicker', 'DatePicker']}>
                                                <DatePicker
                                                    label="Fecha Final"
                                                    value={dayjs(toDate, "DD/MM/YYYY")}
                                                    onChange={(newValue) => {
                                                        const formattedDate = dayjs(newValue).format('DD/MM/YYYY')
                                                        setToDate(formattedDate);
                                                        getDispatchs()
                                                    }}
                                                    format={'DD/MM/YYYY'}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    multiline
                                    rows={2}
                                    id="orden-disp"
                                    label="Orden Despacho"
                                    type="text"
                                    onChange={e => {
                                        setOrden(e.target.value)
                                        getDispatchs()
                                    }}
                                    value={orden}
                                    className="form-control"
                                />
                                <TextField
                                    fullWidth
                                    id="id-cli"
                                    label="Identificacion"
                                    type="text"
                                    onChange={e => 
                                        setIdentificacion(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    value={identificacion}
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    id="id-cliente"
                                    label="Cliente"
                                    type="text"
                                    onChange={e => setCliente(e.target.value)}
                                    value={cliente}
                                    className="form-control"
                                />
                                <TextField
                                    fullWidth
                                    id="bod-consi"
                                    label="Bodega Consignacion"
                                    type="text"
                                    onChange={e => setBodega(e.target.value)}
                                    value={bodega}
                                    className="form-control"
                                />
                                <TextField
                                    fullWidth
                                    id="dir-recep"
                                    label="Direccion Recepcion"
                                    type="text"
                                    onChange={e => setDireccion(e.target.value)}
                                    value={direccion}
                                    className="form-control"
                                />
                                <TextField
                                    fullWidth
                                    id="status"
                                    label="Estado"
                                    type="text"
                                    onChange={e => setStatus(e.target.value)}
                                    value={status}
                                    className="form-control"
                                />
                            </Grid>
                        </Grid>
                    </div>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Despachos Motos"}
                            data={dispatchs}
                            columns={columns}
                            options={options}
                        />
                    </ThemeProvider>
                </div>
            </SnackbarProvider>
        )}
        </>
    )
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <Dispatch />
        </SnackbarProvider>
    );
}
