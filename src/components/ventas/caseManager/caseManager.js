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
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Navbar0 from '../../Navbar0'
import { useAuthContext } from '../../../context/authContext'
import { getMenus } from '../../../services/api'
import { getSellEcommerce, getBuyPartsEcommerce, putCasesPostVentaSubCases, getCasesPostVentaSubcasesUrl, getDataProvinces, getDataCityByProvince, postChangePriceEcommerce } from '../../../services/api';
import LoadingCircle from '../../contabilidad/loader';

export const SellManager = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [fromDate, setFromDate] = useState(moment().subtract(1, "months"))
    const [toDate, setToDate] = useState(moment)
    const [invoiced, setInvoiced] = useState(0)
    const [payMethod, setPayMethod] = useState('datafast')

    const [open, setOpen] = useState(false);
    const [subCases, setSubCases] = useState([]);
    const [approvalData, setApprovalData] = useState([]);
    const [dataSellEcommerce, setDataSellEcommerce] = useState([]);
    const [refreshSubcases, setRegreshSubcases] = useState(false);

    const columnsCasosPostventa = [
        {
            name: "id_transaction",
            label: "ID Transacción",
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
            name: "payment_type",
            label: "Tipo de Pago",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "payment_brand",
            label: "Marca de Pago",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "sub_total",
            label: "Subtotal",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "total",
            label: "Total",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },

        {
            name: "id_transaction",
            label: "Repuestos",
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
                filter: false
            },
        },

        {
            name: "discount_percentage",
            label: "Porcentaje de Descuento",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
            },
            filter: false
        },
        {
            name: "discount_amount",
            label: "Monto de Descuento",
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
            name: "batch_no",
            label: "Número de Lote",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "id_guia_servientrega",
            label: "ID Guía Servientrega",
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
            name: "card_type",
            label: "Tipo de Tarjeta",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "bin_card",
            label: "BIN de la Tarjeta",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "last_4_digits",
            label: "Últimos 4 Dígitos",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "holder",
            label: "Titular",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "expiry_month",
            label: "Mes de Expiración",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "expiry_year",
            label: "Año de Expiración",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "acquirer_code",
            label: "Código del Adquiriente",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "client_type_id",
            label: "Tipo de ID del Cliente",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "client_name",
            label: "Nombre del Cliente",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "client_last_name",
            label: "Apellido del Cliente",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "client_id",
            label: "ID del Cliente",
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
            name: "client_address",
            label: "Dirección del Cliente",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
            
        },
        {
            name: "cost_shiping",
            label: "Costo de Envío Calculado",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "shiping_discount",
            label: "Descuento en Envío",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },

        {
            name: "cost_shiping",
            label: "Actualizar precio envio",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            <Button
                                onClick={() => handleUpdatePrice(value)}
                                color="primary"
                                style={{
                                    marginBottom: '10px',
                                    marginTop: '10px',
                                    backgroundColor: 'firebrick',
                                    color: 'white',
                                    height: '30px',
                                    width: '100px',
                                    borderRadius: '5px'
                                }}
                            >
                                Actualizar
                            </Button>
                        </div>
                    );
                },
                filter: false
            },
            
        },
        {
            name: "cod_orden_ecommerce",
            label: "Código de Orden Ecommerce",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "cod_comprobante",
            label: "Código Comprobante",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        },
        {
            name: "fecha",
            label: "Fecha",
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
            name: "fecha_cierre",
            label: "Facturar",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "left" }}>
                            {value}
                        </div>
                    );
                },
                filter: false
            },
        }
    ];

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
        const functionGetEcommerceSell = async (s, t) => {
            const start_date = s.format('DD/MM/YYYY')
            const end_date = t.format('DD/MM/YYYY')
            try {
                setLoading(true)
                const casosPostVenta = await getSellEcommerce(jwt, start_date, end_date, payMethod, invoiced)
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
            functionGetEcommerceSell(fromDate, toDate);
        }
        else {
            functionGetEcommerceSell(moment().subtract(1, "months"), moment());

        }

    }, [fromDate, toDate, payMethod, refreshSubcases])
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
                const data = await getBuyPartsEcommerce(jwt, id, payMethod);
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
    };

    const handleUpdatePrice = async (price) => {
        try {
            setLoading(true);
            const response = await postChangePriceEcommerce(jwt, price);
            toast.success('Envío actualizado con éxito');
            console.log('Envío actualizado:', response);
            setLoading(false);
            handleRefresh(); // Actualiza los datos después de la operación
        } catch (error) {
            setLoading(false);
            console.error('Error al actualizar el precio de envío:', error);
            toast.error('Error al actualizar el precio de envío');
        }
    };


    return (
        <>
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
                        <label>Método de Pago</label>
                        <Select
                            margin="dense"
                            id="status_case"
                            name="status_case"
                            label="Método de Pago"
                            style={{ width: '100%' }}
                            value={payMethod}
                            onChange={(event) => setPayMethod(event.target.value)}
                        >
                            <MenuItem value="datafast">Todos</MenuItem>
                            <MenuItem value="datafast">Datafast</MenuItem>
                            <MenuItem value="deuna">DeUna</MenuItem>
                        </Select>

                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "left" }}>
                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '40px', width: '150px', borderRadius: '5px', marginLeft: '25px' }} >Facturar TODO</Button>
                </div>

                <div style={{ margin: '25px' }}>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title={"VENTAS E-COMMERCE"} data={dataSellEcommerce} columns={columnsCasosPostventa} options={options} />
                    </ThemeProvider>
                </div>
            </div>

            {/* --DIALOGO LIST-- */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div>
                        <DialogContent >
                            <Grid container spacing={2}>
                                {subCases.map((item, index) => (
                                    <Grid item lg={12} key={index}>
                                        <div style={{ width: "500px" }}>
                                            <TextField
                                                label={`REPUESTOS`}
                                                value={`COD PRODUCTO: ${item.codigo} UNIDADES:${item.cantidad}`}
                                                //variant="outlined"
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

            <Dialog open={loading} maxWidth="xl" fullScreen>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <div>
                        <DialogContent>
                            <div style={{ justifyContent: 'center', width: "500px" }}>
                                <LoadingCircle />
                            </div>
                        </DialogContent>
                    </div>
                </div>
            </Dialog>

        </>
    )
}

//data={proformasFormasDePago} columns={columnsFormasDePago} options={optionsProformas}