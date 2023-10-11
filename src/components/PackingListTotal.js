import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@material-ui/icons/Save';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { TextField } from '@mui/material';
import moment from "moment";
import FileGenerator from './FileGenerator';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import * as XLSX from 'xlsx'
import Autocomplete from '@mui/material/Autocomplete';
import Functions from "../helpers/Functions"; 

const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
});

function PackingListTotal(props) {
    const [packingList, setPackingList] = useState([])
    const [container, setContainer] = useState('')
    const [excelData, setExcelData] = useState(['']);
    const [authorizedSystems, setAuthorizedSystems] = useState([]);
    const [containerList, setContainerList] = useState([])
    const [fromDate, setFromDate] = useState(moment().subtract(3, "months"));
    const [toDate, setToDate] = useState(moment);
    const [statusList, setStatusList] = useState([])
    const [menus, setMenus] = useState([])
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();

    const checkAuthorization = async () => {
        try {
            const res = await fetch(`${API}/modules/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                }
            });
            const data = await res.json();
            setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
        } catch (error) {
            console.error('Error en la solicitud:', error);
            enqueueSnackbar('Falla de Conexion. Vuelva a iniciar sesion.', { variant: 'error' });
        }
    };

    const getContainerList = async () => {
        try {
            const res = await fetch(`${API}/containers`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                }
            })
            const data = await res.json();
            setContainerList(data)
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }


    const getPackingList = async () => {
        try {
            const res = await fetch(`${API}/packinglist_total?empresa=${sessionStorage.getItem('currentEnterprise')}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setPackingList(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sessionStorage.getItem('currentSystem')}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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
            console.error('Error en la solicitud:', error);
        }
    }

    useEffect(() => {
        document.title = 'PackingList Total';
        getPackingList();
        getStatusList();
        getContainerList();
        checkAuthorization();
        getMenus();
        setToDate(null);
        setFromDate(null);
    }, [])

    const handleChange2 = async (e) => {
        e.preventDefault();
        navigate('/newShipment');
    }

    const handleRowClick = async (rowData) => {
        try {
            const res = await fetch(`${API}/container_by_nro?nro_contenedor=${rowData}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                navigate('/editContainer', { state: data[0] });
                console.log(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }

    }

    const handleRowClick2 = async (rowData) => {
        try {
            const res = await fetch(`${API}/orden_compra_cab_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_po=${rowData}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                navigate('/editPostSales', { state: data[0] });
                console.log(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }

    }


    function getBackgroundColor(progress) {
        if (progress <= 20) {
            return "#FF3F33";
        } else if (progress <= 40) {
            return "#FF9333";
        } else if (progress <= 60) {
            return "#F0FF33";
        } else if (progress <= 80) {
            return "#ACFF33";
        } else if (progress <= 100) {
            return "#33FF39";
        } else
            return "silver"
    }

    const getStatusList = async () => {
        try {
            const res = await fetch(`${API}/estados_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_modelo=BL`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                }
            })
            const data = await res.json();
            setStatusList(data.map((item) => ({
                nombre: item.nombre,
                cod: item.cod_item,
            })));
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    const columns = [
        {
            name: "secuencia",
            label: "Secuencia",
            options: {
                display: false, // Oculta la columna
            },
        },
        {
            name: "nro_contenedor",
            options: {
                customBodyRender: (value, tableMeta) => (
                    <span
                        style={{ cursor: 'pointer' }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'blue';
                            e.target.style.textDecoration = 'underline'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'black';
                            e.target.style.textDecoration = 'none'
                        }}
                        onClick={() => handleRowClick(value)}
                    >
                        {value}
                    </span>
                )
            },
            label: "Contenedor"
        },
        {
            name: "proforma",
            label: "Proforma"
        },
        {
            name: "producto",
            label: "Producto"
        },
        {
            name: "cantidad",
            label: "Cant.",
            options: {
                customBodyRender: (value) => {
                  if (value === null || value === "") {
                    return <div style={{ textAlign: "right" }}>
                    {"0"}
                  </div>
                  } else {
                    return <div style={{ textAlign: "right" }}>
                      {value}
                    </div>
                  }
                },
              },
        },
        {
            name: "fob",
            label: "Fob",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "cod_po",
            options: {
                customBodyRender: (value, tableMeta) => (
                    <span
                        style={{ cursor: 'pointer' }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'blue';
                            e.target.style.textDecoration = 'underline'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'black';
                            e.target.style.textDecoration = 'none'
                        }}
                        onClick={() => handleRowClick2(value)}
                    >
                        {value}
                    </span>
                ),
            },
            label: "Orden Compra"
        },
        {
            name: "cod_liquidacion",
            label: "Valoracion"
        },
    ]

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

    const handleFileUpload = (event) => {
        if (container != null) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const properties = jsonData[0];

                const newExcelData = [];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];

                    // Verificar si todas las propiedades de la fila están vacías
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
                setExcelData(newExcelData)
                console.log(newExcelData)
            };
            reader.readAsArrayBuffer(file);
        } else {
            enqueueSnackbar('¡Seleccione Contenedor Primero!', { variant: 'warning' });
        }
    };

    const handleChange = async (e) => {
        try{
            e.preventDefault();
            const res0 = await fetch(`${API}/packings_by_container?empresa=${sessionStorage.getItem('currentEnterprise')}&nro_contenedor=${container}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                }
            })
            const data0 = await res0.json();
            console.log(data0.packings)
            const qty = parseInt(data0.packings, 10);

            if (qty > 0) {
                const userResponse = window.confirm(`Este Contenedor tiene ${qty} registros de packinglist, desea borrar y reemplazar?`)
                if (userResponse) {
                    enqueueSnackbar('Creando PackingList en Contenedor...', { variant: 'success' });
                    const resDelete = await fetch(`${API}/orden_compra_packinglist_by_container?empresa=${sessionStorage.getItem('currentEnterprise')}&nro_contenedor=${container}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            nro_contenedor: container,
                            empresa: sessionStorage.getItem('currentEnterprise'),
                        })
                    })
                    const dataDel = await resDelete.json();
                    console.log(dataDel)
                    const res = await fetch(`${API}/packinglist_contenedor`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            packings: excelData,
                            nro_contenedor: container,
                            empresa: sessionStorage.getItem('currentEnterprise'),
                            usuario_crea: sessionStorage.getItem('currentUser'),
                            tipo_comprobante: "PO"
                        })
                    })
                    const data = await res.json();
                    console.log(data)
                    var msj = ''
                    if (!data.error) {
                        if (data.bl_no_existe) {
                            msj += 'EMBARQUES NO EXISTENTES: \n' + data.bl_no_existe + ' ';
                        }
                        if (data.prod_no_existe) {
                            enqueueSnackbar('Existen registros con novedad', { variant: 'warning' });
                            msj += 'PRODUCTOS INEXISTENTES EN DESPIECE: \n' + data.prod_no_existe + '\n';
                        }
                        if (data.unidad_medida_no_existe) {
                            msj += 'PRODUCTOS CON UNIDAD INCORRECTA: \n' + data.unidad_medida_no_existe + '\n';
                        }
                        if (data.cod_producto_no_existe) {
                            msj += 'PRODUCTOS NO CORRESPONDEN A DETALLES DE ORDEN: \n' + data.cod_producto_no_existe + '\n';
                        }
                        enqueueSnackbar(data.mensaje, { variant: 'success' });
                        FileGenerator.generateAndDownloadTxtFile(msj, 'packinglist_con_error.txt');
                    } else {
                        enqueueSnackbar(data.error, { variant: 'error' });
                    }
                }
            } else {
                enqueueSnackbar('Creando PackingList en Contenedor...', { variant: 'success' });
                const res = await fetch(`${API}/packinglist_contenedor`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        packings: excelData,
                        nro_contenedor: container,
                        empresa: sessionStorage.getItem('currentEnterprise'),
                        usuario_crea: sessionStorage.getItem('currentUser'),
                        tipo_comprobante: "PO"
                    })
                })
                const data = await res.json();
                console.log(data)
                var msj = ''
                if (!data.error) {
                    if (data.bl_no_existe) {
                        msj += 'EMBARQUES NO EXISTENTES: \n' + data.bl_no_existe + ' ';
                    }
                    if (data.prod_no_existe) {
                        enqueueSnackbar('Existen registros con novedad', { variant: 'warning' });
                        msj += 'PRODUCTOS INEXISTENTES EN TABLA PRODUCTO: \n' + data.prod_no_existe + '\n';
                    }
                    if (data.unidad_medida_no_existe) {
                        msj += 'PRODUCTOS CON UNIDAD INCORRECTA: \n' + data.unidad_medida_no_existe + '\n';
                    }
                    if (data.cod_producto_no_existe) {
                        msj += 'PRODUCTOS NO CORRESPONDEN A DETALLES DE ORDEN: \n' + data.cod_producto_no_existe + '\n';
                    }
                    enqueueSnackbar(data.mensaje, { variant: 'success' });
                    FileGenerator.generateAndDownloadTxtFile(msj, 'packinglist_con_error.txt');
                } else {
                    enqueueSnackbar(data.error, { variant: 'error' });
                }
            }
            setExcelData([''])
        }catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    const handleContainerChange = (event, value) => {
        if (value) {
            const containerSeleccionado = containerList.find((container) => container.nro_contenedor === value);
            if (containerSeleccionado) {
                setContainer(containerSeleccionado.nro_contenedor);
            }
        } else {
            setContainer('');
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
                            fontSize: '12px'
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
        <div style={{ marginTop: '150px' }}>
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
            <Autocomplete
                id="estado"
                options={containerList.map((container) => container.nro_contenedor)}
                value={container}
                onChange={handleContainerChange}
                style={{ width: `200px` }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        required
                        label="Contenedor"
                        type="text"
                        className="form-control"
                        style={{ width: `100%` }}
                        InputProps={{
                            ...params.InputProps,
                        }}
                    />
                )}
            />
            {authorizedSystems.includes('IMP') && container && (
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
                        {authorizedSystems.includes('IMP') && (
                            <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                                Cargar en Lote
                            </Button>
                        )}
                    </label>
                </div>
            )}
            {authorizedSystems.includes('IMP') && container && (
                <button
                    className="btn btn-primary"
                    type="button"
                    style={{ width: '150px', marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                    onClick={handleChange}>
                    <SaveIcon /> Guardar
                </button>
            )}
            <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Packinglist general"}
                    data={packingList}
                    columns={columns}
                    options={options}
                />
            </ThemeProvider>
        </div>
    )
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <PackingListTotal />
        </SnackbarProvider>
    );
}