import React, { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Autocomplete from '@mui/material/Autocomplete';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import EditIcon from '@mui/icons-material/Edit';
import Navbar0 from "./Navbar0";
import { useAuthContext } from "../context/authContext";
import LoadingCircle from './contabilidad/crafter';
import Functions from "../helpers/Functions";
import { IconButton, Tooltip, Modal, Box } from '@mui/material';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useSnackbar } from 'notistack';

const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
    textField: {
        marginBottom: '15px',
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
    const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'month').format('DD/MM/YYYY'));
    const [toDate, setToDate] = useState(dayjs().format('DD/MM/YYYY'));
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [menus, setMenus] = useState([]);
    const [excelDataFee, setExcelDataFee] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusNombre, setStatusNombre] = useState("");
    const [statusCode, setStatusCode] = useState("T");
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();

    const [selectedRow, setSelectedRow] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [currentPedido, setCurrentPedido] = useState("");
    const [currentOrden, setCurrentOrden] = useState("");
    const [currentTipoPedido, setCurrentTipoPedido] = useState("");
    const [currentTipoOrden, setCurrentTipoOrden] = useState("");
    const [currentIdentificacion, setCurrentIdentificacion] = useState("");
    const [currentCliente, setCurrentCliente] = useState("");
    const [currentBodega, setCurrentBodega] = useState("");
    const [currentDireccion, setCurrentDireccion] = useState("");
    const [currentFecha, setCurrentFecha] = useState("");
    const [currentCodBodega, setCurrentCodBodega] = useState("");
    const [currentCodBodegaDesp, setCurrentCodBodegaDesp] = useState("");
    const [currentCodDireccion, setCurrentCodDireccion] = useState("");

    const [motos, setMotos] = useState([]);

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
                    pv_cod_tipo_pedido: "PC", //"PC"
                    pv_estado: statusCode,
                    pd_fecha_inicial: fromDate,
                    pd_fecha_final: toDate,
                    pv_cod_persona_cli: identificacion,
                    pedido: pedido,
                    orden: orden,
                    cliente: cliente,
                    direccion: direccion,
                    bodega_consignacion: bodega

                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setDispatchs(data);
                console.log(data)
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

    const status = [
        { name: "T", label: "TODOS" },
        { name: "BOD", label: "EN BODEGA" },
        { name: "DEP", label: "DESPACHO PARCIAL" },
        { name: "DES", label: "DESPACHADOS" },
        { name: "CAD", label: "CADUCADOS" },
        { name: "A", label: "ANULADOS" }]

    useEffect(() => {
        document.title = 'Despachos Motos';
        getDispatchs();
        getMenus();
        getStatusList();
    }, []);

    useEffect(() => {
        getDispatchs();
    }, [fromDate, toDate, pedido, orden, identificacion, cliente, bodega, statusCode, direccion]);

    const handleDateChange = (newValue) => {
        const formattedDate = dayjs(newValue).format('DD/MM/YYYY');
        setFromDate(formattedDate);
    };

    const handleDateChange2 = (newValue) => {
        const formattedDate = dayjs(newValue).format('DD/MM/YYYY');
        setToDate(formattedDate);
    };

    const handleStatusChange = (event, value) => {
        if (value) {
            const statusSeleccionado = status.find((stat) => stat.label === value);
            console.log(statusSeleccionado)
            if (statusSeleccionado) {
                setStatusCode(statusSeleccionado.name);
                setStatusNombre(statusSeleccionado.label)
            }
        } else {
            setStatusCode('');
            setStatusNombre('')
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

    const sendMotoInfo = async (value, rowData) => {
        const row = motos.filter(item => item.COD_PRODUCTO === rowData[1])[0];
        console.log(row)
        try {
            const res = await fetch(`http://172.17.23.2:5000/log/info_moto`, {     //await fetch(`${API}/log/info_moto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    cod_comprobante: row.COD_COMPROBANTE,
                    tipo_comprobante: row.TIPO_COMPROBANTE,
                    cod_producto: row.COD_PRODUCTO,
                    empresa: enterpriseShineray,
                    cod_bodega: branchShineray,
                    current_identification: currentIdentificacion,
                    cod_motor: 'XY169FMM2TA021714'

                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setDispatchs(data);
                console.log(data)
            }
        } catch (error) {
            toast.error(error.message);
        }
    };




    const CustomToolbarSelect = ({ selectedRows }) => {
        return (
            <>
                <Tooltip title="B1">
                    <Box sx={{ ml: 2 }}>
                        <IconButton onClick={handleOpenModal}>
                            <TwoWheelerIcon />
                        </IconButton>
                    </Box>
                </Tooltip>
            </>
        );
    };


    const handleRowSelection = (currentRowsSelected, allRowsSelected) => {
        if (allRowsSelected.length > 0) {
            setSelectedRow(allRowsSelected[0].dataIndex);
        } else {
            setSelectedRow(null);
        }
    };

    const handleOpenModal = async () => {
        if (selectedRow !== null) {
            console.log(dispatchs[selectedRow])
            setOpenModal(true);
            setCurrentPedido(dispatchs[selectedRow].COD_PEDIDO)
            setCurrentOrden(dispatchs[selectedRow].COD_ORDEN)
            setCurrentFecha(dispatchs[selectedRow].FECHA_PEDIDO)
            setCurrentIdentificacion(dispatchs[selectedRow].COD_PERSONA_CLI)
            setCurrentCliente(dispatchs[selectedRow].NOMBRE_PERSONA_CLI)
            setCurrentBodega(dispatchs[selectedRow].BODEGA_ENVIA)
            setCurrentDireccion(dispatchs[selectedRow].DIRECCION)
            setCurrentTipoOrden(dispatchs[selectedRow].COD_TIPO_ORDEN)
            setCurrentTipoPedido(dispatchs[selectedRow].COD_TIPO_PEDIDO)
            setCurrentCodDireccion(dispatchs[selectedRow].COD_DIRECCION)
            setCurrentCodBodega(dispatchs[selectedRow].COD_BODEGA_ENVIA)
            setCurrentCodBodegaDesp(dispatchs[selectedRow].COD_BODEGA_DESPACHA)
            try {
                const res = await fetch(`${API}/log/listado_pedido`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify({
                        pn_empresa: enterpriseShineray,
                        pv_cod_tipo_pedido: dispatchs[selectedRow].COD_TIPO_PEDIDO,
                        pedido: dispatchs[selectedRow].COD_PEDIDO,
                        pn_cod_agencia: dispatchs[selectedRow].COD_BODEGA_DESPACHA,
                        bodega_consignacion: dispatchs[selectedRow].COD_BODEGA_ENVIA,
                        cod_direccion: dispatchs[selectedRow].COD_DIRECCION,
                        p_tipo_orden: dispatchs[selectedRow].COD_TIPO_ORDEN,
                        orden: dispatchs[selectedRow].COD_ORDEN
                    })
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        toast.error('Sesión caducada.');
                    }
                } else {
                    const data = await res.json();
                    setMotos(data);
                    console.log(data)
                }
            } catch (error) {
                toast.error(error.message);
            }

        } else {
            alert("Seleccione una fila");
        }

    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setMotos([]);
    };


    const columnsMotos = [
        {
            name: "COD_SECUENCIA_MOV", label: "Sec", options: {
                customBodyRender: Functions.IntRender
            },
        },
        { name: "COD_PRODUCTO", label: "Cod Producto" },
        { name: "NOMBRE", label: "Nombre" },
        {
            name: "CANTIDAD_PEDIDA", label: "Cant Pedida", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "CANTIDAD_TRANS", label: "Cant Guia", options: {
                customBodyRender: Functions.IntRender
            },
        },
        {
            name: "scan",
            label: "Escanear",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                    <div style={{ textAlign: "center" }}>
                        <IconButton onClick={() => sendMotoInfo(value, tableMeta.rowData)} color="primary" >
                            <QrCodeScannerIcon />
                        </IconButton>
                    </div>
                    )
                },
            },
        },
    ];

    const optionsMotos = {
        responsive: 'standard',
        selectableRows: 'single',
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

    const options = {
        responsive: 'standard',
        onRowSelectionChange: handleRowSelection,
        selectableRows: 'single',
        customToolbarSelect: (selectedRows) => (
            <CustomToolbarSelect selectedRows={selectedRows} />
        ),
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
                            fontSize: '12px'
                        },
                        head: {
                            backgroundColor: 'firebrick', // Color de fondo para las celdas de encabezado
                            color: '#ffffff', // Color de texto para las celdas de encabezado
                            fontWeight: 'bold', // Añadimos negrita para resaltar el encabezado
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            fontSize: '10px'
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '15px' }}>
                        <Grid container spacing={2} justify="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    id="cod-comprobante"
                                    label="Código Pedido"
                                    type="text"
                                    onChange={e => setPedido(e.target.value)}
                                    value={pedido}
                                />
                                <TextField
                                    fullWidth
                                    id="orden-disp"
                                    label="Orden Despacho"
                                    type="text"
                                    onChange={e => setOrden(e.target.value)}
                                    value={orden}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    id="id-cli"
                                    label="Identificacion"
                                    type="text"
                                    onChange={e => setIdentificacion(e.target.value)}
                                    value={identificacion}
                                />
                                <TextField
                                    fullWidth
                                    id="id-cliente"
                                    label="Cliente"
                                    type="text"
                                    onChange={e => setCliente(e.target.value)}
                                    value={cliente}
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
                                />
                                <TextField
                                    fullWidth
                                    id="dir-recep"
                                    label="Direccion Recepcion"
                                    type="text"
                                    onChange={e => setDireccion(e.target.value)}
                                    value={direccion}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    id="status"
                                    fullWidth
                                    options={status.map((producto) => producto.label)}
                                    value={statusNombre}
                                    onChange={handleStatusChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Estado"
                                            type="text"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
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
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="simple-modal-title"
                        aria-describedby="simple-modal-description"
                    >
                        <Box sx={{ p: 8, backgroundColor: 'white', margin: 'auto', width: '90%', marginTop: '50px' }}>
                            <h2 id="simple-modal-title">Detalles del Despacho</h2>
                            <Grid container spacing={2} justify="center">
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="cod-comprobante"
                                        label="Código Pedido"
                                        type="text"
                                        value={currentPedido}
                                    />
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="orden-disp"
                                        label="Orden Despacho"
                                        type="text"
                                        value={currentOrden}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="id-cli"
                                        label="Identificacion"
                                        type="text"
                                        value={currentIdentificacion}
                                    />
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="id-cliente"
                                        label="Cliente"
                                        type="text"
                                        value={currentCliente}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="bod-consi"
                                        label="Bodega Consignacion"
                                        type="text"
                                        value={currentBodega}
                                    />
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="dir-recep"
                                        label="Direccion Recepcion"
                                        type="text"
                                        value={currentDireccion}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        id="date"
                                        label="Fecha Pedido"
                                        type="text"
                                        value={currentFecha}
                                    />
                                </Grid>
                            </Grid>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '15px' }}>
                                <ThemeProvider theme={getMuiTheme()}>
                                    <MUIDataTable
                                        title={"Detalle Pedido"}
                                        data={motos}
                                        columns={columnsMotos}
                                        options={optionsMotos}
                                    />
                                </ThemeProvider>
                            </div>
                            <IconButton onClick={handleCloseModal}>Cerrar</IconButton>
                        </Box>
                    </Modal>

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
