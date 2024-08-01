import React, { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Navbar0 from "./Navbar0";
import { useAuthContext } from "../context/authContext";
import LoadingCircle from './contabilidad/crafter';
import Functions from "../helpers/Functions";

const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
});

function Dispatch() {
    const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
    const [dispatchs, setDispatchs] = useState([]);
    const [statusList, setStatusList] = useState([]);
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
    const [menus, setMenus] = useState([]);
    const [excelDataFee, setExcelDataFee] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const classes = useStyles();

    const getDispatchs = async () => {
        try {
            const res = await fetch(`${API}/log/pedidos`, {
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
                    pv_cod_persona_cli: identificacion,
                    pedido,
                    orden,
                    cliente
                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setDispatchs(data);
            }
        } catch (error) {
            toast.error(error.message);
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

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        document.title = 'Despachos Motos';
        getDispatchs();
        getMenus();
        getStatusList();
    }, []);

    useEffect(() => {
        getDispatchs();
    }, [fromDate, toDate, pedido, orden, identificacion, cliente]);

    const handleDateChange = (newValue) => {
        const formattedDate = dayjs(newValue).format('DD/MM/YYYY');
        setFromDate(formattedDate);
    };

    const handleDateChange2 = (newValue) => {
        const formattedDate = dayjs(newValue).format('DD/MM/YYYY');
        setToDate(formattedDate);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            getDispatchs();
        }
    };

    const getStatusList = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=FIN`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        });
        const data = await res.json();
        setStatusList(data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_item,
        })));
    };

    const columns = [
        { name: "COD_PEDIDO", label: "Pedido" },
        { name: "COD_ORDEN", label: "Orden" },
        { name: "FECHA_PEDIDO", label: "Fecha" },
        { name: "COD_PERSONA_CLI", label: "Identificación" },
        { name: "NOMBRE_PERSONA_CLI", label: "Cliente" },
        { name: "BODEGA_ENVIA", label: "Bodega Consignación" },
        { name: "DIRECCION", label: "Dirección Recepción" },
        {
            name: "CANTIDAD_SOLICITADA", label: "Solicitado", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "CANTIDAD_DESPACHADA", label: "Despachado", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "CANTIDAD_ANULADA", label: "Anulado", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "CANTIDAD_CERRADA", label: "Cerrado", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "CANTIDAD_PENDIENTE", label: "Pendiente", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "COD_BODEGA_DESPACHA", label: "Código Bodega Despacha", options: {
                display: false,
            },
        },
        {
            name: "COD_BODEGA_ENVIA", label: "Código Bodega Envía", options: {
                display: false,
            },
        },
        {
            name: "COD_DIRECCION", label: "Código Dirección", options: {
                display: false,
            },
        },
        {
            name: "COD_TIPO_ORDEN", label: "Código Tipo Orden", options: {
                display: false,
            },
        },
        {
            name: "COD_TIPO_PEDIDO", label: "Código Tipo Pedido", options: {
                display: false,
            },
        },
        {
            name: "COMPROBANTE_MANUAL", label: "Comprobante Manual", options: {
                display: false,
            },
        },
        { name: "ESTADO_ANTERIOR", label: "Estado Anterior" },
        {
            name: "NOMBRE_AGENCIA", label: "Nombre Agencia", options: {
                display: false,
            },
        },
        {
            name: "NOMBRE_PERSONA_VEN", label: "Nombre Persona Vendedor", options: {
                display: false,
            },
        },
        {
            name: "VALOR", label: "Valor", options: {
                display: false,
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
    };

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
                    <div className={classes.datePickersContainer} style={{ marginBottom: '15px' }}>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker', 'DatePicker']}>
                                    <DatePicker
                                        label="Fecha Inicial"
                                        value={dayjs(fromDate, 'DD/MM/YYYY')}
                                        onChange={handleDateChange}
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
                                        value={dayjs(toDate, 'DD/MM/YYYY')}
                                        onChange={handleDateChange2}
                                        format={'DD/MM/YYYY'}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                    </div>
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
                                <TextField
                                    multiline
                                    id="orden-disp"
                                    label="Orden Despacho"
                                    type="text"
                                    onChange={e => setOrden(e.target.value)}
                                    value={orden}
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    id="id-cli"
                                    label="Identificacion"
                                    type="text"
                                    onChange={e => setIdentificacion(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    value={identificacion}
                                    className="form-control"
                                />
                                <TextField
                                    fullWidth
                                    id="id-cliente"
                                    label="Cliente"
                                    type="text"
                                    onChange={e => setCliente(e.target.value)}
                                    value={cliente}
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
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
                            </Grid>
                            <Grid item xs={12} md={3}>
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
