import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LoadingCircle from './/contabilidad/crafter';
import * as XLSX from 'xlsx'
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';
import Functions from "../helpers/Functions";
import { SnackbarProvider, useSnackbar } from 'notistack';
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

function Costumer() {
    const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
    const [costumers, setCostumers] = useState([])
    const [fromDate, setFromDate] = useState(moment().subtract(3, "months"));
    const [toDate, setToDate] = useState(moment);
    const [excelData, setExcelData] = useState([]);
    const [menus, setMenus] = useState([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();


    const getCostumers = async () => {
        try {
            const res = await fetch(`${API}/fin/cliente`,
                {
                    method: 'POST',
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
                setCostumers(data)
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
        document.title = 'Clientes Credito';
        getCostumers();
        getMenus();
        setToDate(null);
        setFromDate(null);
    }, [])

    const handleRowClick = (rowData, rowMeta) => {
        const row = cabeceras.filter(item => item.cod_comprobante === rowData[0])[0];
        navigate('/editCabecera', { state: row });
        console.log(row)
    }

    const handleDeleteRows = async (rowsDeleted) => {
        const userResponse = window.confirm('¿Está seguro de eliminar la orden de compra?')
        if (userResponse) {
            await rowsDeleted.data.forEach((deletedRow) => {
                const deletedRowIndex = deletedRow.dataIndex;
                const deletedRowValue = purchaseOrders[deletedRowIndex];
                fetch(`${API}/eliminar_orden_compra_total/${deletedRowValue.cod_po}/${enterpriseShineray}/PO`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la llamada a la API');
                        }
                        enqueueSnackbar('¡Elementos eliminados exitosamente!', { variant: 'success' });
                    })
                    .catch(error => {
                        console.error(error);
                        enqueueSnackbar(error, { variant: 'error' });
                    });
            });
        }
    };

    const handleChange2 = async (e) => {
        e.preventDefault();
        if (excelData && excelData.length > 0) {
            setLoading(true);
            const res2 = await fetch(`${API}/fin/cli`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    costumers: excelData,
                })
            });
            const data2 = await res2.json();
            setLoading(false);
            if (!data2.error) {
                enqueueSnackbar('Cliente(s) agregados correctamente', { variant: 'success' });
                if (data2.invalids.length > 0) {
                    enqueueSnackbar('Clientes ya existentes: ' + data2.invalids, { variant: 'warning' });
                }
            } else {
                enqueueSnackbar(data2.error, { variant: 'error' });
            }
        }
    }

    const handleFileUpload = (event) => {
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
            properties[2] = 'id_cliente'
            properties[3] = 'pais_origen'
            properties[4] = 'primer_apellido'
            properties[5] = 'segundo_apellido'
            properties[6] = 'primer_nombre'
            properties[7] = 'segundo_nombre'
            properties[8] = 'calle_principal'
            properties[9] = 'calle_secundaria'
            properties[10] = 'numero_casa'
            properties[11] = 'ciudad'
            properties[12] = 'numero_celular'
            properties[13] = 'numero_convencional'
            properties[14] = 'direccion_electronica'
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

            setExcelData(newExcelData)
            setCostumers((prevDetails) => [...prevDetails, ...newExcelData])
            console.log(newExcelData)
        };
        reader.readAsArrayBuffer(file);

    };

    const columns = [
        {
            name: "id_cliente",
            label: "ID Cliente"
        },
        {
            name: "pais_origen",
            label: "País Origen"
        },
        {
            name: "primer_apellido",
            label: "Primer Apellido"
        },
        {
            name: "segundo_apellido",
            label: "Segundo Apellido"
        },
        {
            name: "primer_nombre",
            label: "Primer Nombre"
        },
        {
            name: "segundo_nombre",
            label: "Segundo Nombre"
        },
        {
            name: "calle_principal",
            label: "Calle Principal"
        },
        {
            name: "calle_secundaria",
            label: "Calle Secundaria"
        },
        {
            name: "numero_casa",
            label: "Número Casa"
        },
        {
            name: "ciudad",
            label: "Ciudad"
        },
        {
            name: "numero_celular",
            label: "Número Celular"
        },
        {
            name: "numero_convencional",
            label: "Número Convencional"
        },
        {
            name: "direccion_electronica",
            label: "Dirección Electrónica"
        },
        {
            name: "usuario_crea",
            label: "Usuario Crea"
        },
        {
            name: "fecha_crea",
            label: "Fecha Crea"
        },
        {
            name: "usuario_modifica",
            label: "Usuario Modifica"
        },
        {
            name: "fecha_modifica",
            label: "Fecha Modifica"
        }
    ];

    const options = {
        responsive: 'standard',
        /* onRowClick: handleRowClick,
        onRowsDelete: handleDeleteRows, */
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
            <SnackbarProvider maxSnack={3}>
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
                        <input
                            accept=".xlsx, .xls"
                            id="file-upload"
                            multiple
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="file-upload">
                            <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                                Agregar Clientes
                            </Button>
                        </label>
                        <button
                            className="btn btn-primary"
                            type="button"
                            style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                            onClick={handleChange2}>
                            <SaveIcon /> Guardar
                        </button>
                    </div>

                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Clientes Créditos"}
                            data={costumers}
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
            <Costumer />
        </SnackbarProvider>
    );
}
