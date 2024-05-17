import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { TableCell, TableFooter, TableRow } from "@material-ui/core";
import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Functions from "../helpers/Functions";
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

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
    footerCell: {
        fontWeight: 700,
        fontSize: "0.875rem",
        backgroundColor: "firebrick",
        color: "white",
        textAlign: "right",
        paddingRight: "10px"
    }
});

function EditCabecera() {
    const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state)
    const [menus, setMenus] = useState([])
    const [excelData, setExcelData] = useState([]);
    const [excelDataFee, setExcelDataFee] = useState([]);

    const [empresa, setEmpresa] = useState(formData.empresa);
    const [codComprobante, setCodComprobante] = useState(formData.cod_comprobante);
    const [tipoComprobante, setTipoComprobante] = useState(formData.tipo_comprobante);
    const [tipoIdCliente, setTipoIdCliente] = useState(formData.tipo_id_cliente);
    const [idCliente, setIdCliente] = useState(formData.id_cliente);
    const [nroOperacion, setNroOperacion] = useState(formData.nro_operacion);
    const [capitalOriginal, setCapitalOriginal] = useState(formData.capital_original);
    const [saldoCapital, setSaldoCapital] = useState(formData.saldo_capital);
    const [fechaEmision, setFechaEmision] = useState(formData.fecha_emision);
    const [fechaVencimiento, setFechaVencimiento] = useState(formData.fecha_vencimiento);
    const [plazoCredito, setPlazoCredito] = useState(formData.plazo_credito);
    const [tasaInteres, setTasaInteres] = useState(formData.tasa_interes);
    const [tasaMora, setTasaMora] = useState(formData.tasa_mora);
    const [nroCuotaTotal, setNroCuotaTotal] = useState(formData.nro_cuota_total);
    const [nroCuotasPagadas, setNroCuotasPagadas] = useState(formData.nro_cuotas_pagadas);
    const [nroCuotasMora, setNroCuotasMora] = useState(formData.nro_cuotas_mora);
    const [baseCalculo, setBaseCalculo] = useState(formData.base_calculo);
    const [tipoDestino, setTipoDestino] = useState(formData.tipo_destino);
    const [usuarioCrea, setUsuarioCrea] = useState(formData.usuario_crea);
    const [fechaCrea, setFechaCrea] = useState(formData.fecha_crea);
    const [usuarioModifica, setUsuarioModifica] = useState(formData.usuario_modifica);
    const [fechaModifica, setFechaModifica] = useState(formData.fecha_modifica);
    const [codModelo, setCodModelo] = useState(formData.cod_modelo);
    const [codItem, setCodItem] = useState(formData.cod_item);
    const [codCliente, setCodCliente] = useState(formData.cod_cliente);
    const [codProveedor, setCodProveedor] = useState(formData.cod_proveedor);

    const [authorizedSystems, setAuthorizedSystems] = useState([]);

    const [details, setDetails] = useState([])
    const [fees, setFees] = useState([])


    const [status1, setStatus1] = useState(formData.cod_item)
    const [statusList1, setStatusList1] = useState([])
    const [statusList1Nombre, setStatusList1Nombre] = useState([])

    const [nombreCliente, setNombreCliente] = useState("");
    const [clienteList, setClienteList] = useState([])

    const [tabValue, setTabValue] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const classes = useStyles();
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
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=FIN`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
        })
        const data = await res.json();
        console.log(data)
        setStatusList1(data)
        setStatusList1Nombre(data.find((objeto) => objeto.cod_item === formData.cod_item)?.nombre);
    }

    const getCostumerList = async () => {
        const res = await fetch(`${API}/fin/cliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                empresa: enterpriseShineray,
                id_cliente: formData.id_cliente
            })
        })
        const data = await res.json();
        setNombreCliente(data.find(objeto => objeto.id_cliente === formData.id_cliente)?.primer_apellido + ' ' + data.find(objeto => objeto.id_cliente === formData.id_cliente)?.segundo_apellido + ' ' + data.find(objeto => objeto.id_cliente === formData.id_cliente)?.primer_nombre + ' ' + data.find(objeto => objeto.id_cliente === formData.id_cliente)?.segundo_nombre);

        setClienteList(data)
    }

    const getDetails = async () => {
        const res = await fetch(`${API}/fin/detail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                empresa: enterpriseShineray,
                cod_comprobante: formData.cod_comprobante,
                nro_operacion: formData.nro_operacion
            })
        })
        const data = await res.json();
        setDetails(data)
    }

    const getFee = async () => {
        const res = await fetch(`${API}/fin/fee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                empresa: enterpriseShineray,
                cod_cliente: formData.cod_cliente,
                cod_proveedor: formData.cod_proveedor,
                nro_operacion: formData.nro_operacion
            })
        })
        const data = await res.json();
        setFees(data)
        console.log(data)
    }


    const handleStatus1Change = (event, value) => {
        if (value) {
            const statusSeleccionado = statusList1.find((status) => status.nombre === value);
            if (statusSeleccionado) {
                setCodItem(statusSeleccionado.cod_item);
                setStatusList1Nombre(statusSeleccionado.nombre)
            }
        } else {
            setCodItem('');
            setStatusList1Nombre('')
        }
    };

    useEffect(() => {
        document.title = 'Credito ' + nroOperacion;
        console.log(formData)
        checkAuthorization();
        getMenus();
        getDetails();
        getFee();
        getStatusList1();
        getCostumerList();
    }, [])

    const columns = [
        {
            name: "cod_comprobante",
            label: "Código Comprobante",
            options: {
                display: false,
            }
        },
        {
            name: "tipo_comprobante",
            label: "Tipo Comprobante",
            options: {
                display: false,
            },
        },
        {
            name: "id_cliente",
            label: "ID Cliente"
        },
        {
            name: "nro_operacion",
            label: "Número Operación"
        },
        {
            name: "nro_pago",
            label: "Número Pago"
        },
        {
            name: "fecha_inicio_cuota",
            label: "Fecha Inicio Cuota"
        },
        {
            name: "fecha_vencimiento_cuota",
            label: "Fecha Vencimiento Cuota"
        },
        {
            name: "plazo_cuota",
            label: "Plazo Cuota"
        },
        {
            name: "valor_capital",
            label: "Valor Capital",
        },
        {
            name: "valor_interes",
            label: "Valor Interés",
        },
        {
            name: "valor_mora",
            label: "Valor Mora",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "valor_cuota",
            label: "Valor Cuota",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "estado_cuota",
            label: "Estado Cuota"
        }
    ];

    const columnsFee = [
        {
            name: "id_cliente",
            label: "ID Cliente"
        },
        {
            name: "nro_operacion",
            label: "Número Operación"
        },
        {
            name: "nro_cuota",
            label: "Número Cuota"
        },
        {
            name: "secuencia",
            label: "Secuencia"
        },
        {
            name: "valor_total_cuota",
            label: "Valor Total Cuota",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "valor_pagado_capital",
            label: "Valor Pagado Capital"
        },
        {
            name: "valor_pagado_interes",
            label: "Valor Pagado Interés"
        },
        {
            name: "valor_pagado_mora",
            label: "Valor Pagado Mora",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "fecha_registro",
            label: "Fecha Registro"
        }
    ];

    const options = {
        filterType: 'dropdown',
        onChangeRowsPerPage(numberOfRows) {
            setRowsPerPage(numberOfRows);
        },
        onChangePage(page) {
            setPage(page);
        },
        customTableBodyFooterRender: (opts) => {
            const startIndex = page * rowsPerPage;
            const endIndex = (page + 1) * rowsPerPage;
            let sumEnglish = opts.data
                .slice(startIndex, endIndex)
                .reduce((accu, item) => {
                    return accu + parseFloat(item.data[8]);
                }, 0).toFixed(2);;
            let sumMaths = opts.data
                ?.slice(startIndex, endIndex)
                ?.reduce((accu, item) => {
                    return accu + parseFloat(item.data[9]);
                }, 0).toFixed(2);;
            return (
                <>
                    {details.length > 0 && (
                        <TableFooter>
                            <TableRow>
                                {opts.columns.map((col, index) => {
                                    if (col.display === "true") {
                                        if (col.name === "tipo_id_cliente") {
                                            return (
                                                <TableCell key={index}>

                                                </TableCell>
                                            );
                                        } else if (col.name === "id_cliente") {
                                            return (
                                                <TableCell key={index} >

                                                </TableCell>
                                            );
                                        }
                                        else if (col.name === "nro_pago") {
                                            return (
                                                <TableCell key={index} >

                                                </TableCell>
                                            );
                                        }
                                        else if (col.name === "fecha_inicio_cuota") {
                                            return (
                                                <TableCell key={index} >

                                                </TableCell>
                                            );
                                        }
                                        else if (col.name === "fecha_vencimiento_cuota") {
                                            return (
                                                <TableCell key={index} >

                                                </TableCell>
                                            );
                                        }
                                        else if (col.name === "plazo_cuota") {
                                            return (
                                                <TableCell key={index} >

                                                </TableCell>
                                            );
                                        }
                                        else if (col.name === "nro_operacion") {
                                            return (
                                                <TableCell key={index} >

                                                </TableCell>
                                            );
                                        } else if (col.name === "valor_capital") {
                                            return (
                                                <TableCell key={index} className={classes.footerCell}>
                                                    Total
                                                </TableCell>
                                            );
                                        } else if (col.name === "valor_interes") {
                                            return (
                                                <TableCell key={index} className={classes.footerCell}>
                                                    {sumEnglish}
                                                </TableCell>
                                            );
                                        }
                                        else if (col.name === "valor_mora") {
                                            return (
                                                <TableCell key={index} className={classes.footerCell}>
                                                    {sumMaths}
                                                </TableCell>
                                            );
                                        }
                                    }
                                })}
                            </TableRow>
                        </TableFooter>
                    )}
                </>
            );
        },
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

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[1]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            jsonData[0].unshift("cod_comprobante");
            jsonData[0].unshift("tipo_comprobante");
            jsonData[0].unshift("empresa");
            jsonData[0].unshift("usuario_crea");

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                const isRowEmpty = row.every((cell) => cell === "");
                if (!isRowEmpty) {
                    jsonData[i].unshift(codComprobante);
                    jsonData[i].unshift(tipoComprobante);
                    jsonData[i].unshift(enterpriseShineray);
                    jsonData[i].unshift(userShineray);
                }
            }

            const properties = jsonData[0];
            properties[4] = 'nro_operacion'
            properties[5] = 'id_cliente'
            properties[6] = 'nro_pago'
            properties[7] = 'fecha_inicio_cuota'
            properties[8] = 'fecha_vencimiento_cuota'
            properties[9] = 'plazo_cuota'
            properties[10] = 'valor_capital'
            properties[11] = 'valor_interes'
            properties[12] = 'valor_mora'
            properties[13] = 'valor_cuota'
            properties[14] = 'estado_cuota'
            properties[15] = 'tipo_destino'

            const newExcelData = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];

                const isRowEmpty = row.every((cell) => cell === "");

                if (!isRowEmpty) {

                    const obj = {};
                    for (let j = 0; j < properties.length; j++) {
                        const property = properties[j];
                        obj[property] = row[j];
                    }
                    newExcelData.push(obj);
                }
            }

            for (let i = 0; i < newExcelData.length; i++) {
                const customer = newExcelData[i];
                for (const key in customer) {
                    if (customer.hasOwnProperty(key) && customer[key] === undefined) {
                        customer[key] = '';
                    }
                }
            }

            const nroOperacionValues = newExcelData.map(item => item.nro_operacion.toString())
            console.log(nroOperacionValues)
            const nroOperacionVerify = nroOperacionValues.every(value => value === nroOperacion)

            const idClienteValues = newExcelData.map(item => item.id_cliente.toString())
            console.log(idClienteValues)
            const idClienteVerify = idClienteValues.every(value => value === idCliente)

            if (nroOperacionVerify && idClienteVerify) {
                setExcelData(newExcelData)
                setDetails((prevDetails) => [...prevDetails, ...newExcelData])
                console.log(newExcelData)
            } else {
                if (!nroOperacionVerify) {
                    enqueueSnackbar('Nro. Opeación de pagos ingresados no corresponde a : ' + nroOperacion, { variant: 'error' });
                }
                if (!idClienteVerify) {
                    enqueueSnackbar('Identificación de Cliente no corresponde a : ' + idCliente, { variant: 'error' });
                }
            }
        };
        reader.readAsArrayBuffer(file);

    };

    const handleFileUploadFee = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            jsonData[0].unshift("cod_comprobante");
            jsonData[0].unshift("tipo_comprobante");
            jsonData[0].unshift("empresa");
            jsonData[0].unshift("usuario_crea");

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                const isRowEmpty = row.every((cell) => cell === "");
                if (!isRowEmpty) {
                    jsonData[i].unshift(codComprobante);
                    jsonData[i].unshift(tipoComprobante);
                    jsonData[i].unshift(enterpriseShineray);
                    jsonData[i].unshift(userShineray);
                }
            }

            const properties = jsonData[0];
            properties[4] = 'nro_operacion'
            properties[5] = 'id_cliente'
            properties[6] = 'fecha_pago'
            properties[7] = 'nro_cuota'
            properties[8] = 'valor_total_cuota'
            properties[9] = 'valor_pagado_capital'
            properties[10] = 'valor_pagado_interes'
            properties[11] = 'valor_pagado_mora'
            properties[12] = 'fecha_registro'
            properties[13] = 'tipo_destino'

            const newExcelData = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];

                const isRowEmpty = row.every((cell) => cell === "");

                if (!isRowEmpty) {

                    const obj = {};
                    for (let j = 0; j < properties.length; j++) {
                        const property = properties[j];
                        obj[property] = row[j];
                    }
                    newExcelData.push(obj);
                }
            }

            for (let i = 0; i < newExcelData.length; i++) {
                const customer = newExcelData[i];
                for (const key in customer) {
                    if (customer.hasOwnProperty(key) && customer[key] === undefined) {
                        customer[key] = '';
                    }
                }
            }

            const nroOperacionValues = newExcelData.map(item => item.nro_operacion.toString())
            console.log(nroOperacionValues)
            const nroOperacionVerify = nroOperacionValues.every(value => value === nroOperacion)

            const idClienteValues = newExcelData.map(item => item.id_cliente.toString())
            console.log(idClienteValues)
            const idClienteVerify = idClienteValues.every(value => value === idCliente)

            if (nroOperacionVerify && idClienteVerify) {
                setExcelDataFee(newExcelData)
                setFees((prevDetails) => [...prevDetails, ...newExcelData])
                console.log(newExcelData)
            } else {
                if (!nroOperacionVerify) {
                    enqueueSnackbar('Nro. Opeación de pagos ingresados no corresponde a : ' + nroOperacion, { variant: 'error' });
                }
                if (!idClienteVerify) {
                    enqueueSnackbar('Identificación de Cliente no corresponde a : ' + idCliente, { variant: 'error' });
                }
            }


        };
        reader.readAsArrayBuffer(file);

    };


    const handleChange2 = async (e) => {
        e.preventDefault();
        if (excelData && excelData.length > 0) {
            const res2 = await fetch(`${API}/fin/det`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    detalles: excelData,
                })
            });
            const data2 = await res2.json();
            if (!data2.error) {
                enqueueSnackbar('Cuota(s) agregadas correctamente', { variant: 'success' });
                if (data2.invalid_dets.length > 0) {
                    enqueueSnackbar('Nro. pago ya existe: ' + data2.invalid_dets, { variant: 'warning' });
                }
            } else {
                enqueueSnackbar(data2.error, { variant: 'error' });
            }
        }
    }

    const handleChange3 = async (e) => {
        e.preventDefault();
        if (excelDataFee && excelDataFee.length > 0) {
            const res2 = await fetch(`${API}/fin/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    pagos: excelDataFee,
                })
            });
            const data2 = await res2.json();
            if (!data2.error) {
                enqueueSnackbar('Cuota(s) agregadas correctamente', { variant: 'success' });
                if (data2.invalid_dets.length > 0) {
                    enqueueSnackbar('Nro. pago ya existe: ' + data2.invalid_dets, { variant: 'warning' });
                }
            } else {
                enqueueSnackbar(data2.error, { variant: 'error' });
            }
        }
    }

    const handleChangeOper = async (e) => {
        e.preventDefault();
        const res2 = await fetch(`${API}/fin/cabecera_edit_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                cod_comprobante: codComprobante,
                empresa: enterpriseShineray,
                nro_operacion: nroOperacion,
                cod_cliente: codCliente,
                cod_proveedor: codProveedor,
                cod_item: codItem
            })
        });
        const data2 = await res2.json();
        if (!data2.error) {
            enqueueSnackbar('Operación Guardada', { variant: 'success' });
        } else {
            enqueueSnackbar(data2.error, { variant: 'error' });
        }
    }


    const [showForm, setShowForm] = useState(false);

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

    const TabPanel = ({ value, index, children }) => (
        <div hidden={value !== index}>
            {value === index && children}
        </div>
    );

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
                    <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Operaciones</Button>
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
                        <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Información Operación</h5>
                        <button
                            className="btn btn-primary btn-block"
                            type="button"
                            style={{ backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                            onClick={handleChangeOper}>
                            <SaveIcon /> Guardar
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    disabled
                                    fullWidth
                                    id="cod-comprobante"
                                    label="Código Comprobante"
                                    type="text"
                                    onChange={e => setCodComprobante(e.target.value)}
                                    value={codComprobante}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    fullWidth
                                    id="tipo-id"
                                    label="Tipo ID Cliente"
                                    type="text"
                                    onChange={e => setTipoIdCliente(e.target.value)}
                                    value={tipoIdCliente}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    fullWidth
                                    id="id-cliente"
                                    label="ID Cliente"
                                    type="text"
                                    onChange={e => setIdCliente(e.target.value)}
                                    value={idCliente}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    multiline
                                    value={nombreCliente}
                                    rows={2}
                                    label="Cliente"
                                    type="text"
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    disabled
                                    fullWidth
                                    id="nro-operacion"
                                    label="Numero Operación"
                                    type="text"
                                    onChange={e => setNroOperacion(e.target.value)}
                                    value={nroOperacion}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    id="capital-or"
                                    label="Capital Original"
                                    type="number"
                                    onChange={e => setCapitalOriginal(e.target.value)}
                                    value={capitalOriginal}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="saldo-capital"
                                    label="Saldo Capital"
                                    type="number"
                                    onChange={e => setCapitalOriginal(e.target.value)}
                                    value={capitalOriginal}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="emision"
                                    label="Fecha Emision"
                                    type="text"
                                    onChange={e => setFechaEmision(e.target.value)}
                                    value={fechaEmision}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="vencimiento"
                                    label="Fecha Vencimiento"
                                    type="text"
                                    onChange={e => setFechaVencimiento(e.target.value)}
                                    value={fechaVencimiento}
                                    className="form-control"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    disabled
                                    id="nro-cuotas-mora"
                                    label="Numero Cuotas Mora"
                                    type="number"
                                    onChange={e => setNroCuotasMora(e.target.value)}
                                    value={nroCuotasMora}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="base-calculo"
                                    label="Base Calculo"
                                    type="text"
                                    onChange={e => setBaseCalculo(e.target.value)}
                                    value={baseCalculo}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="plazo"
                                    label="Plazo Credito"
                                    type="number"
                                    onChange={e => setPlazoCredito(e.target.value)}
                                    value={plazoCredito}
                                    className="form-control"
                                    fullWidth
                                />

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
                                            label="Estado Credito"
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
                                    disabled
                                    id="interes"
                                    label="Tasa Interes"
                                    type="number"
                                    onChange={e => setTasaInteres(e.target.value)}
                                    value={tasaInteres}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="mora"
                                    label="Tasa Mora"
                                    type="number"
                                    onChange={e => setTasaMora(e.target.value)}
                                    value={tasaMora}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="nro-cuota"
                                    label="Numero Cuota Total"
                                    type="number"
                                    onChange={e => setNroCuotaTotal(e.target.value)}
                                    value={nroCuotaTotal}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="nro-cuotas-pagadas"
                                    label="Numero Cuotas Pagadas"
                                    type="number"
                                    onChange={e => setNroCuotasPagadas(e.target.value)}
                                    value={nroCuotasPagadas}
                                    className="form-control"
                                    fullWidth
                                />
                                <TextField
                                    disabled
                                    id="tipo_destino"
                                    label="Tipo Destino"
                                    type="number"
                                    onChange={e => setTipoDestino(e.target.value)}
                                    value={tipoDestino}
                                    className="form-control"
                                    fullWidth
                                />

                            </Grid>
                        </Grid>
                    </div>
                    <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
                        <Tab label="Tabla de Amortización" />
                        <Tab label="Tabla de Pagos" />
                    </Tabs>
                    <TabPanel value={tabValue} index={0}>
                        <input
                            accept=".xlsx, .xls"
                            id="file-upload"
                            multiple
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <div>
                            <ThemeProvider theme={getMuiTheme()}>
                                <MUIDataTable title={"Tabla de Amortización"} data={details} columns={columns} options={options} />
                            </ThemeProvider>
                        </div>
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <input
                            accept=".xlsx, .xls"
                            id="file-upload"
                            multiple
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUploadFee}
                        />
                        <div>
                            <ThemeProvider theme={getMuiTheme()}>
                                <MUIDataTable title={"Tabla de Pagos"} data={fees} columns={columnsFee} options={options} />
                            </ThemeProvider>
                        </div>
                    </TabPanel>
                </div>


            </Box >
        </div >
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <EditCabecera />
        </SnackbarProvider>
    );
}