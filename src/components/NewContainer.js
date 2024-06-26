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
import Checkbox from '@mui/material/Checkbox';
import FavoriteBorder from '@mui/icons-material/TwoWheelerOutlined';
import Favorite from '@mui/icons-material/TwoWheeler';
import BookmarkBorderIcon from '@mui/icons-material/SettingsOutlined';
import BookmarkIcon from '@mui/icons-material/Settings';
import Typography from '@material-ui/core/Typography';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns'
import dayjs from 'dayjs';


import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useAuthContext } from '../context/authContext';
const API = process.env.REACT_APP_API;
const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '310px'
    },
});


function NewContainer() {
    const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state)
    const [tabValue, setTabValue] = useState(0);
    const [excelData, setExcelData] = useState(['']);
    const [menus, setMenus] = useState([])

    const [codTipoContenedor, setCodTipoContenedor] = useState("")
    const [codigoBlHouse, setCodigoBlHouse] = useState("")
    const [blList, setBlList] = useState([])
    const [esCargaSuelta, setEsCargaSuelta] = useState(0)
    const [lineSeal, setLineSeal] = useState("")
    const [nroContenedor, setNroContenedor] = useState("")
    const [observaciones, setObservaciones] = useState("")
    const [peso, setPeso] = useState("")
    const [shipperSeal, setShipperSeal] = useState("")
    const [volumen, setVolumen] = useState("")
    const [fechaSalida, setFechaSalida] = useState()
    const [authorizedSystems, setAuthorizedSystems] = useState([]);
    const [packingList, setPackingList] = useState([])

    const [nombreTipo, setNombreTipo] = useState("");
    const [tipoList, setTipoList] = useState([])
    const [cargaList, setCargaList] = useState([{ cod: 0, nombre: "No" }, { cod: 1, nombre: "Si" }])
    const [cargaNombre, setCargaNombre] = useState("No")

    const [esMotos, setEsMotos] = useState(0);
    const [esRepuestos, setEsRepuestos] = useState(0);

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


    const getContainer = async () => {
        if (nroContenedor)
            try {
                const res = await fetch(`${API}/container_by_nro?nro_contenedor=${nroContenedor}`,
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
                }
            } catch (error) {
            }
    }



    const getPackingList = async () => {
        if (nroContenedor)
            try {
                const res = await fetch(`${API}/packinglist_param_by_container?empresa=${enterpriseShineray}&nro_contenedor=${nroContenedor}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                })
                if (!res.ok) {
                    if (res.status === 401) {
                        toast.error('Sesión caducada.');
                    }
                } else {
                    const data = await res.json();
                    setPackingList(data)
                }
            } catch (error) {
                toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
            }
    }

    const getBl = async () => {
        try {
            const res = await fetch(`${API}/embarque`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            })
            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setBlList(data)
                console.log(data)
            }
        } catch (error) {
            toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
        }
    }

    const getTipoList = async () => {
        const res = await fetch(`${API}/tipo_contenedor`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        })
        const data = await res.json();
        console.log(data)
        setTipoList(data)
        setNombreTipo(data.find((objeto) => objeto.cod_tipo_contenedor === codTipoContenedor)?.nombre || '');

    }



    const handleDeleteRows = async (rowsDeleted) => {
        const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
        if (userResponse) {
            await rowsDeleted.data.forEach((deletedRow) => {
                const deletedRowIndex = deletedRow.dataIndex;
                const deletedRowValue = packingList[deletedRowIndex];
                console.log(deletedRowValue.secuencia);

                fetch(`${API}/orden_compra_packinglist?codigo_bl_house=${codigoBlHouse}&empresa=${enterpriseShineray}&secuencia=${deletedRowValue.secuencia}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la llamada a la API');
                        }
                        console.log('Elemento eliminado exitosamente');
                        enqueueSnackbar('¡Elementos eliminados exitosamente!', { variant: 'success' });
                    })
                    .catch(error => {
                        console.error(error);
                        enqueueSnackbar(error, { variant: 'error' });
                    });
            });
        }
    };


    const handleRowClick = (rowData, rowMeta) => {
        const row = packingList.filter(item => item.secuencia === rowData[0])[0];
        console.log(row)
        navigate('/packingList', { state: row, orden: formData });
    }

    const handleTipoChange = (event, value) => {
        if (value) {
            const tipoSeleccionado = tipoList.find((tipo) => tipo.nombre === value);
            if (tipoSeleccionado) {
                setCodTipoContenedor(tipoSeleccionado.cod_tipo_contenedor);
                setNombreTipo(tipoSeleccionado.nombre)
            }
        } else {
            setCodTipoContenedor('');
            setNombreTipo('')
        }
    };

    const handleBlChange = (event, value) => {
        if (value) {
            const blSeleccionado = blList.find((bl) => bl.codigo_bl_house === value.value);
            if (blSeleccionado) {
                setCodigoBlHouse(blSeleccionado.codigo_bl_house);
            }
        } else {
            setCodigoBlHouse('');
        }
    };


    useEffect(() => {
        document.title = 'Nuevo Contenedor';
        getContainer();
        getPackingList();
        checkAuthorization();
        getMenus();
        getTipoList();
        getBl();
    }, [])

    const columns = [
        {
            name: "cod_producto",
            label: "Codigo Producto"
        },
        {
            name: "cantidad",
            label: "Cantidad"
        },
        {
            name: "fob",
            label: "Fob"
        },
        {
            name: "cod_po",
            label: "Orden Compra"
        },
        {
            name: "cod_liquidacion",
            label: "Codigo Liquidacion"
        },

    ]

    const options = {
        filterType: 'dropdown',
        onRowsDelete: handleDeleteRows,
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
        },
    }


    const handleChange2 = async (e) => {
        e.preventDefault();

        if (fechaSalida == null) {
            enqueueSnackbar('¡Ingrese fecha de salida!', { variant: 'error' });
            return;
        }

        const res = await fetch(`${API}/contenedor/${nroContenedor}/${enterpriseShineray}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                codigo_bl_house: codigoBlHouse,
                cod_tipo_contenedor: codTipoContenedor,
                peso: parseFloat(peso),
                volumen: parseFloat(volumen),
                line_seal: lineSeal,
                shipper_seal: shipperSeal,
                es_carga_suelta: parseInt(esCargaSuelta, 10),
                observaciones: observaciones,
                usuario_crea: userShineray,
                es_repuestos: esRepuestos === "" ? 0 : esRepuestos,
                es_motos: esMotos === "" ? 0 : esMotos,
                fecha_salida: fechaSalida,
            })
        })
        const data = await res.json();
        console.log(data)
        if (!data.error) {
            enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
        } else {
            enqueueSnackbar(data.error, { variant: 'error' });
        }
        if (excelData && excelData.length > 1) {
            const res1 = await fetch(`${API}/packinglist_contenedor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    packings: excelData,
                    nro_contenedor: nroContenedor,
                    empresa: enterpriseShineray,
                    usuario_crea: userShineray,
                    tipo_comprobante: "PO"
                })
            })
            const data1 = await res1.json();
            console.log(data1)
            var msj = ''
            if (!data1.error) {
                if (data1.bl_no_existe) {
                    msj += 'EMBARQUES NO EXISTENTES: \n' + data1.bl_no_existe + ' ';
                }
                if (data1.prod_no_existe) {
                    enqueueSnackbar('Existen detalles incorrectos', { variant: 'warning' });
                    msj += 'PRODUCTOS INEXISTENTES EN DESPIECE: \n' + data1.prod_no_existe + '\n';
                }
                if (data1.unidad_medida_no_existe) {
                    msj += 'PRODUCTOS CON UNIDAD INCORRECTA: \n' + data1.unidad_medida_no_existe + '\n';
                }
                if (data1.cod_producto_no_existe) {
                    msj += 'PRODUCTOS NO CORRESPONDEN A DETALLES DE ORDEN: \n' + data1.cod_producto_no_existe + '\n';
                }
                enqueueSnackbar(data1.mensaje, { variant: 'success' });
                FileGenerator.generateAndDownloadTxtFile(msj, 'packinglist_con_error.txt');
            } else {
                enqueueSnackbar(data.error, { variant: 'error' });
            }
        }
    }

    const handleChange3 = async (e) => {
        e.preventDefault();
        navigate('/newPostSaleDetail', { state: codigoBlHouse, orden: location.state });
    }

    const handleCargaChange = (event, value) => {
        if (value) {
            const cargaSeleccionado = cargaList.find((status) => status.nombre === value);
            if (cargaSeleccionado) {
                setEsCargaSuelta(cargaSeleccionado.cod);
                setCargaNombre(cargaSeleccionado.nombre)
            }
        } else {
            setEsCargaSuelta('');
            setCargaNombre('')
        }
    };

    const handleFileUpload = (event) => {
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
            setPackingList((prevDetails) => [...prevDetails, ...newExcelData])
            console.log(newExcelData)
        };
        reader.readAsArrayBuffer(file);

    };

    const TabPanel = ({ value, index, children }) => (
        <div hidden={value !== index}>
            {value === index && children}
        </div>
    );

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

    const handleCheck1Change = (event) => {
        if (event.target.checked) {
            setEsMotos(1);
        } else {
            setEsMotos(0);
        }
    };

    const handleCheck2Change = (event) => {
        if (event.target.checked) {
            setEsRepuestos(1);
        } else {
            setEsRepuestos(0);
        }
    };

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
                    <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Contenedores</Button>
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
                        <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Nuevo Contenedor</h5>
                        <button
                            className="btn btn-primary btn-block"
                            type="button"
                            style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                            onClick={handleChange2}>
                            <SaveIcon /> Guardar
                        </button>
                    </div>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                id="carga"
                                fullWidth
                                options={cargaList.map((carga) => carga.nombre)}
                                value={cargaNombre}
                                onChange={handleCargaChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Es carga suelta?"
                                        type="text"
                                        className="form-control"
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <TextField
                                fullWidth
                                required
                                id="nro-contenedor"
                                label="Contenedor"
                                type="text"
                                onChange={e => setNroContenedor(e.target.value)}
                                value={nroContenedor}
                                className="form-control"
                            />
                            <Autocomplete
                                id="bl-house"
                                fullWidth
                                options={blList.map((bl) => ({
                                    value: bl.codigo_bl_house,
                                    label: `${bl.bl_house_manual} Ref: ${bl.codigo_bl_house}`,
                                  }))}  
                                onChange={handleBlChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Bl House"
                                        type="text"
                                        className="form-control"
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Segunda Columna */}
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                id="tipo-contenedor"
                                fullWidth
                                options={tipoList.map((tipo) => tipo.nombre)}
                                value={nombreTipo}
                                onChange={handleTipoChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        multiline
                                        rows={3}
                                        label="Tipo Contenedor"
                                        type="text"
                                        className="form-control"
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <TextField
                                id="peso"
                                fullWidth
                                label="Peso"
                                type="text"
                                onChange={e => setPeso(e.target.value)}
                                value={peso}
                                className="form-control"
                                disabled={parseInt(esCargaSuelta, 10) === 1}
                            />
                            <TextField
                                required
                                fullWidth
                                id="volumen"
                                label="Volumen"
                                type="text"
                                onChange={e => setVolumen(e.target.value)}
                                value={volumen}
                                className="form-control"
                                disabled={parseInt(esCargaSuelta, 10) === 1}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                required
                                fullWidth
                                id="line-seal"
                                label="Line Seal"
                                type="text"
                                onChange={e => setLineSeal(e.target.value)}
                                value={lineSeal}
                                className="form-control"
                                disabled={parseInt(esCargaSuelta, 10) === 1}
                            />
                            <TextField
                                required
                                fullWidth
                                id="shipper-seal"
                                label="Shipper Seal"
                                type="text"
                                onChange={e => setShipperSeal(e.target.value)}
                                value={shipperSeal}
                                className="form-control"
                                disabled={parseInt(esCargaSuelta, 10) === 1}
                            />
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                id="observaciones"
                                label="Observaciones"
                                type="text"
                                onChange={e => setObservaciones(e.target.value)}
                                value={observaciones}
                                className="form-control"
                            />
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography>Contiene:</Typography>
                                <Checkbox
                                    checked={esMotos === 1}
                                    onChange={handleCheck1Change}
                                    icon={<FavoriteBorder style={{ fontSize: 30 }} />}
                                    checkedIcon={<Favorite style={{ color: 'firebrick', fontSize: 35 }} />}
                                />
                                <Checkbox
                                    checked={esRepuestos === 1}
                                    onChange={handleCheck2Change}
                                    icon={<BookmarkBorderIcon style={{ fontSize: 30 }} />}
                                    checkedIcon={<BookmarkIcon style={{ color: 'firebrick', fontSize: 35 }} />}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <div>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                                        <DatePicker
                                            label="Fecha Embarque"
                                            value={dayjs(fechaSalida, "DD/MM/YYYY")}
                                            onChange={(newValue) => setFechaSalida(format(new Date(newValue), 'dd/MM/yyyy'))}
                                            format={'DD/MM/YYYY'}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                        </Grid>
                    </Grid>

                    <div>
                        <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
                            <Tab label="Packinglist" />
                        </Tabs>
                        <TabPanel value={tabValue} index={0}>
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
                                        Cargar en Lote
                                    </Button>
                                </label>
                            </div>
                            <ThemeProvider theme={getMuiTheme()}>
                                <MUIDataTable title={"Packinglist por Contenedor"} data={packingList} columns={columns} options={options} />
                            </ThemeProvider>
                        </TabPanel>
                    </div>
                </div>


            </Box >
        </div >
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <NewContainer />
        </SnackbarProvider>
    );
}