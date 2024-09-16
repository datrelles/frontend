import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
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

import Navbar0 from '../../Navbar0';
import { useAuthContext } from '../../../context/authContext';
import { getMenus } from '../../../services/api';
import { getInvoiceB2B, getBuyPartsB2B } from '../../../services/api'; // Importa los endpoints B2B
import LoadingCircle from '../../contabilidad/loader';

export const SellManagerB2B = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(moment().subtract(1, "months"));
    const [toDate, setToDate] = useState(moment());
    const [invoiced, setInvoiced] = useState(0);
    const [payMethod, setPayMethod] = useState('datafast');

    const [open, setOpen] = useState(false);
    const [subCases, setSubCases] = useState([]);
    const [dataSellB2B, setDataSellB2B] = useState([]);
    const [refreshSubcases, setRegreshSubcases] = useState(false);

    const columnsCasosB2B = [
        {
            name: "id_transaction",
            label: "ID Transacción",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "payment_type",
            label: "Tipo de Pago",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "payment_brand",
            label: "Marca de Pago",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "sub_total",
            label: "Subtotal",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "total",
            label: "Total",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "id_transaction",
            label: "Repuestos",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "left" }}>
                        <Button
                            onClick={() => handleClickOpenNew(value)}
                            color="primary"
                            style={{
                                marginBottom: '10px',
                                marginTop: '10px',
                                backgroundColor: 'firebrick',
                                color: 'white',
                                height: '30px',
                                width: '100px',
                                borderRadius: '5px',
                                marginRight: '15px'
                            }}>
                            ABRIR
                        </Button>
                    </div>
                ),
            },
        },
        {
            name: "discount_percentage",
            label: "Porcentaje de Descuento",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "discount_amount",
            label: "Monto de Descuento",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
            },
        },
        {
            name: "currency",
            label: "Moneda",
            options: {
                customBodyRender: (value) => (
                    <div style={{ textAlign: "center" }}>{value}</div>
                ),
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
            },
        }
        // Añadir el resto de las columnas similares a las del componente original
    ];

    const options = {
        selectableRows: false,
        rowsPerPage: 100,
    };

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const data = await getMenus(userShineray, enterpriseShineray, 'VE', jwt);
                setMenus(data);
            } catch (error) {
                toast.error(error);
            }
        };
        fetchMenus();
    }, [userShineray, enterpriseShineray, jwt]);

    useEffect(() => {
        const fetchB2BData = async (start, end) => {
            const start_date = start.format('DD/MM/YYYY');
            const end_date = end.format('DD/MM/YYYY');
            try {
                setLoading(true);
                const data = await getInvoiceB2B(jwt, start_date, end_date, payMethod, invoiced);
                setDataSellB2B(data);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
                toast.error('Error fetching data');
            }
        };

        if (fromDate !== null && toDate !== null) {
            fetchB2BData(fromDate, toDate);
        } else {
            fetchB2BData(moment().subtract(1, "months"), moment());
        }
    }, [fromDate, toDate, payMethod, invoiced, jwt, refreshSubcases]);

    const handleClickOpenNew = (id) => {
        const fetchDataSubcases = async () => {
            try {
                setLoading(true);
                const data = await getBuyPartsB2B(jwt, id, payMethod);
                setSubCases(data);
                setLoading(false);
                setOpen(true);
            } catch (error) {
                toast.error('NO SE PUEDE CARGAR LOS SUBCASOS');
                console.log('Error fetching parts', error);
                setLoading(false);
            }
        };

        fetchDataSubcases();
    };

    const handleClose = () => {
        setOpen(false);
        setSubCases([]);
    };

    // Need to use pickDate
    useEffect(() => {
        setToDate(null);
        setFromDate(null);
    }, [])


    const getMuiTheme = () => createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        paddingLeft: '3px',
                        paddingRight: '3px',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                        backgroundColor: '#00000',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid #ddd',
                        borderRight: '1px solid #ddd',
                        fontSize: '14px'
                    },
                    head: {
                        backgroundColor: 'firebrick',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        paddingLeft: '0px',
                        paddingRight: '0px',
                        fontSize: '12px'
                    },
                }
            },
            MuiTable: {
                styleOverrides: {
                    root: {
                        borderCollapse: 'collapse',
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        borderBottom: '5px solid #ddd',
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
            <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
                <Navbar0 menus={menus} />

                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '25px' }}>
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
                            <DemoContainer components={['DatePicker']}>
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

                <div style={{ display: 'flex', justifyContent: 'left', marginLeft: '25px', width: '350px' }}>
                    <Select
                        margin="dense"
                        label="Método de Pago"
                        value={payMethod}
                        onChange={(event) => setPayMethod(event.target.value)}
                        style={{ width: '100%' }}
                    >
                        <MenuItem value="datafast">Datafast</MenuItem>
                        <MenuItem value="deuna">DeUna</MenuItem>
                    </Select>
                </div>

                <div style={{ margin: '25px' }}>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title={"VENTAS B2B"} data={dataSellB2B} columns={columnsCasosB2B} options={options} />
                    </ThemeProvider>
                </div>

                <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                    <DialogContent>
                        <Grid container spacing={2}>
                            {subCases.map((item, index) => (
                                <Grid item lg={12} key={index}>
                                    <TextField
                                        label="REPUESTOS"
                                        value={`COD PRODUCTO: ${item.codigo} UNIDADES:${item.cantidad}`}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cerrar</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}
        </>
    );
};
