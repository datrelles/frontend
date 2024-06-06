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
import { getSellEcommerce, getBuyPartsEcommerce, putCasesPostVentaSubCases, getCasesPostVentaSubcasesUrl, getDataProvinces, getDataCityByProvince } from '../../../services/api';
import { ProgressBar } from './progressLine';
import LoadingCircle from '../../contabilidad/loader';

export const SellManager = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [fromDate, setFromDate] = useState(moment().subtract(1, "months"))
    const [toDate, setToDate] = useState(moment)
    const [statusWarranty, setStatusWarranty] = useState('2')
    const [statusProcess, setStatusProcess] = useState('A')
  
    const [open, setOpen] = useState(false);
    const [subCases, setSubCases] = useState([]);
    const [approvalData, setApprovalData] = useState([]);
    const [dataSellEcommerce, setDataSellEcommerce] = useState([]);
    const [imagesSubCasesUrl, setImagesSubCasesUrl] = useState([]);
    const [videosSubCasesUrl, setVideosSubCasesUrl] = useState([]);
    const [refreshSubcases, setRegreshSubcases] = useState(false);


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
            label: "Código proforma",
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
            name: "id_transaction",
            label: "ID METODO DE PAGO",
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
            name: "fecha",
            label: "Fecha",
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
            name: "amount",
            label: "Monto",
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
            name: "client_name",
            label: "Nombres",
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
            name: "client_last_name",
            label: "Apellidos",
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
            name: "payment_brand",
            label: "TARJETA",
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
            name: "id_transaction",
            label: "REPUESTOS",
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
            label: "FACTURAR",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
            },
        }

    ]
    const options = {
        selectableRows: false,
        rowsPerPage: 100
    }
    //Menu
    useEffect(() => {
        const menu = async () => {
            try {
                const data = await getMenus(userShineray, enterpriseShineray, 'VE', jwt)
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
                const casosPostVenta = await getSellEcommerce(jwt, start_date, end_date, statusProcess)
                setDataSellEcommerce(casosPostVenta)
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

    }, [fromDate, toDate, statusProcess, refreshSubcases])
    // Need to use pickDate
    useEffect(() => {
        setToDate(null);
        setFromDate(null);
    }, [])


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
    const handleClickOpenNew = (id) => {
        const fetchDataSubcases = async () => {
            try {
                setLoading(true)
                const data = await getBuyPartsEcommerce(jwt, id);
                setSubCases(data)
                setLoading(false)
                setOpen(true);
            } catch (error) {
                toast.error('NO SE PUEDE CARGAR LOS SUBCASOS')
                console.log('error')
                setLoading(false)
            }
        }

        fetchDataSubcases();

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
                            <MenuItem value="P">Pendiente</MenuItem>
                            <MenuItem value="A">Facturado</MenuItem>
                        </Select>

                    </div>
                </div>
                <div style={{ display: "flex", justifyContent:"left" }}>
                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '40px', width: '150px', borderRadius: '5px', marginLeft: '25px' }} >Facturar TODO</Button>
                </div>
                
                <div style={{ margin: '25px' }}>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title={"VENTAS E-COMMERCE"} data={dataSellEcommerce} columns={columnsCasosPostventa} options={options} />
                    </ThemeProvider>
                </div>
            </div>
        )}
            {/* --DIALOGO LIST-- */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth >
                <div style={{ display: "flex", justifyContent:"center" }}>
                    <div>
                        <DialogContent >
                            <Grid container spacing={2}>
                                {subCases.map((item, index) => (
                                    <Grid item xs={12} key={index}>
                                        <div>
                                        <TextField
                                            label={`CODIGO PRODUCTO: ${item.codigo}`}
                                            value={item.cantidad}
                                            variant="outlined"
                                            fullWidth
                                            disabled
                                        />
                                        </div>
                                        
                                    </Grid>
                                ))}
                            </Grid>

                        </DialogContent>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <DialogActions>
                                <Button onClick={handleClose}>Cerrar</Button>
                            </DialogActions>
                        </div>
                    </div>

                </div>
            </Dialog>
        </>
    )
}

//data={proformasFormasDePago} columns={columnsFormasDePago} options={optionsProformas}