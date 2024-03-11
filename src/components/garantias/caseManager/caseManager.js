import React, { useState, useEffect } from 'react'
import MUIDataTable from 'mui-datatables'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from '@mui/material/Select';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from "moment";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


import Navbar0 from '../../Navbar0'
import { useAuthContext } from '../../../context/authContext'
import { getMenus } from '../../../services/api'
import { getCasesPostVenta, getCasesPostVentaSubCases, putCasesPostVentaSubCases, getCasesPostVentaSubcasesUrl, getDataProvinces, getDataCityByProvince } from '../../../services/api';
import { ProgressBar } from './progressLine';
import LoadingCircle from '../../contabilidad/loader';

export const CaseManager = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [fromDate, setFromDate] = useState(moment().subtract(1, "months"))
    const [toDate, setToDate] = useState(moment)
    const [statusWarranty, setStatusWarranty] = useState('2')
    const [statusProcess, setStatusProcess] = useState('A')
    const [province, setProvince] = useState('')
    const [city, setCity] = useState('')
    const [open, setOpen] = useState(false);
    const [subCases, setSubCases] = useState([]);
    const [approvalData, setApprovalData] = useState([]);
    const [dataCasosPostVenta, setDataCasosPostVenta] = useState([]);
    const [imagesSubCasesUrl, setImagesSubCasesUrl] = useState([]);
    const [videosSubCasesUrl, setVideosSubCasesUrl] = useState([]);
    const [refreshSubcases, setRegreshSubcases] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);

    const listaProblemas = {
        46: "MOTOR",
        47: "ELECTRICO",
        48: "ESTRUCTURAL",
        49: "FALTANTE",
        50: "ESTETICO",
        51: "OTROS",
        52: "AMORTIGUADOR",
        53: "TANQUE",
        54: "BATERIA",
        55: "SISTEMA DE FRENO",
        56: "EMBRAGUE",
        57: "CARBURADOR",
        58: "TUBO DE ESCAPE",
        59: "CAJA DE CAMBIO",
        60: "VELOCIMETRO",
        61: "CILINDRO",
        62: "CABEZOTE",
        63: "CIGUEÑAL",
        64: "BOYA DE GASOLINA",
        65: "COMERCIAL",
        66: "OVERHAUL",
        67: "ENSAMBLAJE",
        68: "OBSEQUIOS"
    }
    const columnsCasosPostventa = [
        {
            name: "cod_comprobante",
            label: "Código Caso",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: "porcentaje",
            label: "% avance",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            <ProgressBar percentage={value} />
                        </div>
                    );
                },
            },
        },
        {
            name: "fecha",
            label: "Fecha inicio",
            options: {
                customBodyRender: (value) => {
                    const valueWithHor = new Date(value)
                    const valueWithOutHor = valueWithHor.toISOString().split('T')[0];
                    return (
                        <div style={{ textAlign: "center" }}>
                            {valueWithOutHor}
                        </div>
                    );
                },
            },
        },
        {
            name: "fecha",
            label: "Dias",
            options: {
                customBodyRender: (value) => {
                    const starDate = new Date(value)
                    const currentDate = new Date();
                    const timeDifference = currentDate.getTime() - starDate.getTime();
                    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

                    return (
                        <div style={{ textAlign: "center" }}>
                            {daysDifference}
                        </div>
                    );
                },
            },
        },

        {
            name: "nombre_caso",
            label: "caso",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
            },
        },

        {
            name: "taller",
            label: "Taller",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
            },
        },

        {
            name: "aplica_garantia",
            label: "Garantia",
            options: {
                customBodyRender: (value) => {
                    let garantia = ''
                    if (value === 1) {
                        garantia = 'SI';
                    } else if (value === 0) {
                        garantia = 'NO';
                    } else {
                        garantia = 'Pendiente';
                    }
                    return (
                        <div style={{ textAlign: "center", padding: "5px" }}>
                            {garantia}
                        </div>
                    );
                },
            },
        },

        {
            name: "codigo_responsable",
            label: "Responsable",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: "cod_comprobante",
            label: "SUB CASOS",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            <Button onClick={() => handleClickOpenNew(value)} color="primary" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
                                ABRIR
                            </Button>
                        </div>
                    );
                },
            },
        },

        {
            name: "fecha_cierre",
            label: "FECHA CIERRE",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: "usuario_cierra",
            label: "CIERRE PREVIO",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
            },
        },

    ]
    const options = {
        selectableRows: false,
    }
    //Menu
    useEffect(() => {
        const menu = async () => {
            try {
                const data = await getMenus(userShineray, enterpriseShineray, 'GAR', jwt)
                setMenus(data)

            }
            catch (error) {
                toast.error(error)
            }

        }
        menu();
    }, [])
    //Data filter
    useEffect(() => {
        const functionGetCasosPostVenta = async (s, t) => {
            const start_date = s.format('DD/MM/YYYY')
            const end_date = t.format('DD/MM/YYYY')
            try {
                setLoading(true)
                const casosPostVenta = await getCasesPostVenta(jwt, start_date, end_date, statusWarranty, statusProcess, province, city)
                setDataCasosPostVenta(casosPostVenta)
                setLoading(false)
            }
            catch (error) {
                console.log(error)
                setLoading(false)
                throw error
            }
        }

        if (fromDate !== null && toDate !== null) {
            functionGetCasosPostVenta(fromDate, toDate);
        }
        else {
            functionGetCasosPostVenta(moment().subtract(1, "months"), moment());

        }

    }, [fromDate, toDate, statusWarranty, statusProcess, refreshSubcases, province,city])
    // Need to use pickDate
    useEffect(() => {
        setToDate(null);
        setFromDate(null);
    }, [])
    //Provinces
    useEffect(() => {
        const getDataProvincesFunction = async () => {
            try {
                const response = await getDataProvinces(jwt);
                response.sort((a,b)=>a.descripcion.localeCompare(b.descripcion));
                setProvinces(response)
            } catch (error) {
                console.log(error)
            }
        }
        getDataProvincesFunction();

    }, [])
    //Cities
    useEffect(() => {
        const getDataCitiesFunction = async () => {
            try {
                const response = await getDataCityByProvince(jwt, province);
                response.sort((a,b)=>a.descripcion.localeCompare(b.descripcion));
                setCities(response)
            } catch (error) {
                console.log(error)
            }
        }
        getDataCitiesFunction();
    }, [province])

    const handleRefresh = () => {
        setRegreshSubcases(prevState => !prevState);
    }
    const getMuiTheme = () => createTheme({
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
    const handleClickOpenNew = (cod_comprobante) => {
        const fetchDataSubcases = async () => {
            try {
                setLoading(true)
                const data = await getCasesPostVentaSubCases(jwt, cod_comprobante);
                setSubCases(data)
                setLoading(false)
                setOpen(true);
            } catch (error) {
                toast.error('NO SE PUEDE CARGAR LOS SUBCASOS')
                console.log('error')
                setLoading(false)

            }
        }

        const fetchDataSubcasesUrl = async () => {
            try {
                const data = await getCasesPostVentaSubcasesUrl(jwt, cod_comprobante);
                const images = data.images.split(', ');
                const videos = data.videos.split(', ');
                setImagesSubCasesUrl(images);
                setVideosSubCasesUrl(videos);
            } catch (error) {
                toast.error('NO SE PUEDE CARGAR LOS SUBCASOS')
                console.log('error')
            }
        }

        fetchDataSubcases();
        fetchDataSubcasesUrl();


    };
    const handleClose = () => {
        setOpen(false);
        setSubCases([]);
        setApprovalData([]);
        setImagesSubCasesUrl([]);
        setVideosSubCasesUrl([]);
    };
    const handleApproval = (index, estado) => {
        const newData = [...approvalData];
        newData[index] = { ...subCases[index], estado };
        setApprovalData(newData);

    };
    const handleSave = async () => {
        try {
            setLoading(true);
            setOpen(false);
            for (const caso of approvalData) {
                await putCasesPostVentaSubCases(
                    jwt,
                    caso.cod_comprobante,
                    caso.codigo_problema,
                    caso.estado
                );
                console.log(`Caso actualizado: ${caso.descripcion}`);
                toast.success(`Caso actualizado: ${caso.descripcion}`)
            }
            console.log("Todos los casos han sido actualizados con éxito.");
            setLoading(false)
            toast.success("Todos los casos han sido actualizados con éxito.");
        } catch (error) {
            setLoading(false)
            console.error("Error al actualizar los casos:", error);
            toast.error("Error al actualizar los casos:", error);
        }
        handleRefresh();
        setSubCases([]);
        setApprovalData([]);
        setImagesSubCasesUrl([]);
        setVideosSubCasesUrl([]);
    }

    return (
        <>{loading ? (<LoadingCircle />) : (
            <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
                <Navbar0 menus={menus} />

                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '25px' }}>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker
                                        label="Fecha Desde"
                                        value={fromDate}
                                        onChange={(newValue) => setFromDate(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                        format="DD/MM/YYYY"
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div style={{ margin: '0 5px' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DemoContainer components={['DatePicker']} >
                                    <DatePicker
                                        label="Fecha Hasta"
                                        value={toDate}
                                        onChange={(newValue) => setToDate(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                        format="DD/MM/YYYY"
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'space-between', marginLeft: '25px', width: '350px' }} >
                    <div style={{ width: '48%', marginRight: '10px' }}>
                        <label>Garantia</label>
                        <Select
                            margin="dense"
                            id="aplica_garantia"
                            name="Garantia"
                            label="Garantia"
                            style={{ width: '100%' }}
                            value={statusWarranty}
                            onChange={(event) => setStatusWarranty(event.target.value)}
                        >
                            <MenuItem value="2">Pendiente</MenuItem>
                            <MenuItem value="1">Aplica Garantia</MenuItem>
                            <MenuItem value="0">No Aplica</MenuItem>
                        </Select>

                    </div>

                    <div style={{ width: '48%', marginRight: '10px' }}>
                        <label>Estado</label>
                        <Select
                            margin="dense"
                            id="status_case"
                            name="status_case"
                            label="Proceso"
                            style={{ width: '100%' }}
                            value={statusProcess}
                            onChange={(event) => setStatusProcess(event.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="A">Pendiente</MenuItem>
                            <MenuItem value="P">En Proceso</MenuItem>
                            <MenuItem value="R">Cierre Previo</MenuItem>
                            <MenuItem value="C">Cerrado</MenuItem>
                        </Select>

                    </div>

                    <div style={{ width: '48%', marginRight: '10px' }}>
                        <label>Provincia</label>
                        <Select
                            margin="dense"
                            id="province"
                            name="provincia"
                            label="provincia"
                            style={{ width: '100%' }}
                            value={province}
                            onChange={(event) => setProvince(event.target.value)}
                        >
                            {provinces.map((province) => (
                                <MenuItem key={province.codigo_provincia} value={province.codigo_provincia} >
                                    {province.descripcion}
                                </MenuItem>
                            ))}
                            <MenuItem value=''>Todos</MenuItem>
                        </Select>

                    </div>

                    <div style={{ width: '48%', marginRight: '10px' }}>
                        <label>Ciudad</label>
                        <Select
                            margin="dense"
                            id="aplica_garantia"
                            name="Garantia"
                            label="Garantia"
                            style={{ width: '100%' }}
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                        >
                            {cities.map((city) => (
                                <MenuItem key={city.codigo_ciudad} value={city.codigo_ciudad} >
                                    {city.descripcion}
                                </MenuItem>
                            ))}
                              <MenuItem value=''>Todos</MenuItem>
                        </Select>

                    </div>

                </div>
                <div style={{ margin: '25px' }}>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title={"Casos PostVenta"} data={dataCasosPostVenta} columns={columnsCasosPostventa} options={options} />
                    </ThemeProvider>
                </div>
            </div>
        )}
            {/* --DIALOGO LIST-- */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth >
                <div style={{ display: "flex" }}>
                    <div>
                        <DialogContent >
                            <Grid container spacing={2}>
                                {subCases.map((item, index) => (
                                    <Grid item xs={12} key={index}>
                                        <div>
                                            <TextField
                                                label={listaProblemas[item.codigo_problema]}
                                                value={item.descripcion}
                                                variant="outlined"
                                                fullWidth
                                                disabled
                                            />
                                            <TextField
                                                select
                                                label="Estado"
                                                value={approvalData[index] ? approvalData[index].estado : subCases[index].estado}
                                                onChange={(e) => handleApproval(index, e.target.value)}
                                                variant="outlined"
                                                fullWidth
                                                style={{ marginTop: '8px' }}
                                            >
                                                <MenuItem value={2}>Pendiente</MenuItem>
                                                <MenuItem value={1}>Aprobado</MenuItem>
                                                <MenuItem value={0}>Rechazado</MenuItem>
                                            </TextField>
                                        </div>
                                        <div style={{ width: '100%', height: '1px', background: 'black', marginTop: '10px' }}></div>
                                    </Grid>
                                ))}
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
                    <div style={{ margin: "25px" }} >
                        <Grid container spacing={2}>
                            {/* Renderiza las imágenes */}
                            {imagesSubCasesUrl.map((image, index) => (
                                <Grid item key={index}>
                                    <Paper style={{ width: "200px", height: "200px" }}>
                                        <img src={image.toLowerCase()} alt={`Image ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Renderiza los enlaces de los videos */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px" }}>
                            {videosSubCasesUrl.map((video, index) => (
                                <Typography key={index} component="div" variant="body1">
                                    <a href={video.toLowerCase()} target="_blank" rel="noopener noreferrer">
                                        Video {index + 1}
                                    </a>
                                </Typography>
                            ))}
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

//data={proformasFormasDePago} columns={columnsFormasDePago} options={optionsProformas}