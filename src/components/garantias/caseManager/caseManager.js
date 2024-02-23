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

import Navbar0 from '../../Navbar0'
import { useAuthContext } from '../../../context/authContext'
import { getMenus, postPagoAnticipo } from '../../../services/api'
import { getCasesPostVenta } from '../../../services/api';
import { ProgressBar } from './progressLine';
import LoadingCircle from '../../contabilidad/loader';
import MenuItem from '@mui/material/MenuItem';




export const CaseManager = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [fromDate, setFromDate] = useState(moment().subtract(1, "months"))
    const [toDate, setToDate] = useState(moment)
    const [statusWarranty, setStatusWarranty] = useState(null)
    const [statusProcess, setStatusProcess] = useState(null)
    const [province, setProvince] = useState(null)
    const [city, setCity] = useState(null)

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
    const [dataCasosPostVenta, setDataCasosPostVenta] = useState([])

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

    useEffect(() => {
        const functionGetCasosPostVenta = async (s,t) => {
            const start_date = s.format('DD/MM/YYYY')
            const end_date = t.format('DD/MM/YYYY')
            try {
                setLoading(true)
                const casosPostVenta = await getCasesPostVenta(jwt, s, t)
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
        else{

        }

    }, [fromDate, toDate])

    useEffect(() => {
        setToDate(null);
        setFromDate(null);
    }, [])


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
                    value = 1 ? garantia = 'SI' : garantia = 'NO'
                    return (
                        <div style={{ textAlign: "center", padding: "5px" }}>
                            {value}
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
                            <MenuItem value="1">Aplica Garantia</MenuItem>
                            <MenuItem value="0">No Aplica</MenuItem>
                        </Select>

                    </div>

                    <div style={{ width: '48%', marginRight: '10px' }}>
                        <label>Estado</label>
                        <Select
                            margin="dense"
                            id="aplica_garantia"
                            name="Garantia"
                            label="Garantia"
                            style={{ width: '100%' }}
                            value={statusProcess}
                            onChange={(event) => setStatusProcess(event.target.value)}
                        >
                            <MenuItem value="1">Pendiente</MenuItem>
                            <MenuItem value="2">En Proceso</MenuItem>
                            <MenuItem value="3">Cierre Previo</MenuItem>
                            <MenuItem value="4">Cerrado</MenuItem>
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
                            <MenuItem value="1">Azuay</MenuItem>
                            <MenuItem value="0">No Aplica</MenuItem>
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
                            <MenuItem value="1">Cuenca</MenuItem>
                    
                        </Select>

                    </div>

                </div>
                <div style={{ margin: '25px' }}>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title={"Casos PostVenta"} data={dataCasosPostVenta} columns={columnsCasosPostventa} />
                    </ThemeProvider>
                </div>
            </div>
        )}

        </>
    )
}

//data={proformasFormasDePago} columns={columnsFormasDePago} options={optionsProformas}