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

import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import LoadingCircle from './/contabilidad/crafter';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";

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

function Negociacion() {
    const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
    const [negociaciones, setNegociaciones] = useState([])
    const [statusList, setStatusList] = useState([])
    const [excelData, setExcelData] = useState([]);
    const [fromDate, setFromDate] = useState(moment().subtract(3, "months"));
    const [toDate, setToDate] = useState(moment);
    const [menus, setMenus] = useState([])
    const [excelDataFee, setExcelDataFee] = useState([]);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();


    const getNegociaciones = async () => {
        try {
            const res = await fetch(`${API}/fin/neg`,
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
                setNegociaciones(data)
                console.log(data)
            }
        } catch (error) {
            toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
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
        document.title = 'Negociaciones';
        getNegociaciones();
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
        {
            name: "cod_comprobante",
            label: "Código Comprobante"
        },
        {
            name: "tipo_comprobante",
            label: "Tipo Comprobante"
        },
        {
            name: "cod_cliente",
            label: "Cliente"
        },
        {
            name: "fecha_negociacion",
            label: "Fecha Negociacion"
        },
        {
            name: "cod_proveedor",
            label: "Proveedor"
        }
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

    const handleFileUploadFee = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            jsonData[0].unshift("empresa");
            jsonData[0].unshift("usuario_crea");

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                const isRowEmpty = row.every((cell) => cell === "");
                if (!isRowEmpty) {
                    jsonData[i].unshift(enterpriseShineray);
                    jsonData[i].unshift(userShineray);
                }
            }

            const properties = jsonData[0];
            properties[2] = 'nro_operacion'
            properties[3] = 'id_cliente'
            properties[4] = 'fecha_pago'
            properties[5] = 'nro_cuota'
            properties[6] = 'valor_total_cuota'
            properties[7] = 'valor_pagado_capital'
            properties[8] = 'valor_pagado_interes'
            properties[9] = 'valor_pagado_mora'
            properties[10] = 'fecha_registro'
            properties[11] = 'tipo_destino'

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


            setExcelDataFee(newExcelData)
            console.log(newExcelData)

        };
        reader.readAsArrayBuffer(file);

    };

    const handleChange3 = async (e) => {
        e.preventDefault();
        if (excelDataFee && excelDataFee.length > 0) {
            setLoading(true);
            const res2 = await fetch(`${API}/fin/pay_general`, {
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
            setLoading(false);
            if (!data2.error) {
                enqueueSnackbar('Pago(s) agregados', { variant: 'success' });
            } else {
                enqueueSnackbar(data2.error, { variant: 'error' });
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
                            <AddIcon /> Negociación
                        </button>
                        <input
                            accept=".xlsx, .xls"
                            id="file-upload"
                            multiple
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUploadFee}
                        />
                        <label htmlFor="file-upload">
                            <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>
                                <AddIcon /> Pagos
                            </Button>
                            <button
                                className="btn btn-primary btn-block"
                                type="button"
                                style={{ backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                                onClick={handleChange3}>
                                <SaveIcon /> Guardar
                            </button>
                        </label>
                    </div>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Negociaciones"}
                            data={negociaciones}
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
            <Negociacion />
        </SnackbarProvider>
    );
}
