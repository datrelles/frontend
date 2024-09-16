import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from "moment";
import Button from '@mui/material/Button';
import { useAuthContext } from '../../../context/authContext';
import { getCabCreditoDirecto, updateCabCreditoDirecto, getDetCreditoDirecto } from '../../../services/api';
import { getMenus } from '../../../services/api'
import LoadingCircle from '../../contabilidad/loader';
import Navbar0 from '../../Navbar0';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

export const CreditoDirectoManager = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [creditos, setCreditos] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Fetch Menus and Credit Data
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const data = await getMenus(userShineray, enterpriseShineray, 'VE', jwt);
                setMenus(data);
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchMenus();
    }, [jwt, userShineray, enterpriseShineray]);

    useEffect(() => {
        const fetchCreditos = async () => {
            try {
                setLoading(true);
                const data = await getCabCreditoDirecto(jwt);
                setCreditos(data);
                setLoading(false);
            } catch (error) {
                toast.error("Error cargando créditos directos");
                setLoading(false);
            }
        };
        fetchCreditos();
    }, [jwt]);

    // Approve Credit Function
    const handleApprove = async () => {
        try {
            const credito = creditos.find(c => c.id_transaction === selectedTransaction);
            const updatedCredito = { ...credito, estado_aprobacion: '1' }; // Cambiar estado de aprobación a "APROBADO"
            const dataForAprove = {
                'estado_aprobacion':updatedCredito['estado_aprobacion'],
                'id_transaction': updatedCredito['id_transaction']
            }
            await updateCabCreditoDirecto(jwt, dataForAprove);
            toast.success(`Crédito con ID ${selectedTransaction} aprobado.`);
            setCreditos(creditos.map(c => c.id_transaction === selectedTransaction ? updatedCredito : c));
            setConfirmOpen(false); // Cerrar confirmación después de aprobar
        } catch (error) {
            toast.error("Error aprobando el crédito");
        }
    };

    // Fetch Detail Data
    const handleClickOpenNew = async (id_transaction) => {
        try {
            setLoading(true);
            const data = await getDetCreditoDirecto(jwt, id_transaction);
            setDetalles(data);
            setLoading(false);
            setOpen(true);
        } catch (error) {
            toast.error('Error obteniendo los detalles del crédito directo');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setDetalles([]);
    };

    const handleOpenConfirm = (id_transaction) => {
        setSelectedTransaction(id_transaction);
        setConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setSelectedTransaction(null);
    };

    // Define Table Columns
    const columns = [
        { name: 'fecha', label: 'Fecha', options: { filter: true } },
        { name: 'client_id', label: 'ID Cliente', options: { filter: false } },
        { name: 'client_name', label: 'Nombre Cliente', options: { filter: false } },
        { name: 'client_last_name', label: 'Apellido Cliente', options: { filter: false } },
        { name: 'total', label: 'Total', options: { filter: false } },
        { name: 'estado_aprobacion', label: 'Estado Aprobación', options: { filter: true } },
        {
            name: 'id_transaction',
            label: 'Acciones',
            options: {
                filter: false,
                customBodyRender: (value) => (
                    <div>
                        <Button
                            variant="contained"
                            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
                            onClick={() => handleClickOpenNew(value)}
                         
                        >
                            Abrir
                        </Button>
                        <Button
                            variant="contained"
                            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
                            onClick={() => handleOpenConfirm(value)}
                            disabled={creditos.find(c => c.id_transaction === value).estado_aprobacion === '1'}
                        >
                            Aprobar
                        </Button>
                    </div>
                ),
            },
        },
        { name: 'sub_total', label: 'Subtotal', options: { filter: false } },
        { name: 'discount_percentage', label: 'Porcentaje de Descuento', options: { filter: false } },
        { name: 'discount_amount', label: 'Monto de Descuento', options: { filter: false } },
        { name: 'currency', label: 'Moneda', options: { filter: false } },
        { name: 'id_guia_servientrega', label: 'ID Guía Servientrega', options: { filter: false } },
        { name: 'client_type_id', label: 'Tipo de Cliente', options: { filter: false } },
        { name: 'client_address', label: 'Dirección Cliente', options: { filter: false } },
        { name: 'cost_shiping', label: 'Costo Envío', options: { filter: false } },
        { name: 'cod_orden_ecommerce', label: 'Código Orden Ecommerce', options: { filter: false } },
        { name: 'cod_comprobante', label: 'Código Comprobante', options: { filter: false } },
        { name: 'shiping_discount', label: 'Descuento Envío', options: { filter: false } },
        { name: 'cuotas', label: 'Cuotas', options: { filter: false } },
        { name: 'fecha_aprobacion', label: 'Fecha Aprobación', options: { filter: false, customBodyRender: (value) => value ? moment(value).format('DD/MM/YYYY') : '' } },
        { name: 'descripcion', label: 'Descripción', options: { filter: false } },
        { name: 'id_agencia_transporte', label: 'ID Agencia Transporte', options: { filter: false } },
        { name: 'nombre_agencia_transporte', label: 'Nombre Agencia Transporte', options: { filter: false } },
    ];

    const options = {
        selectableRows: 'none',
        rowsPerPage: 100,
        responsive: 'standard',
        download: false,
        print: false,
        viewColumns: false,
        filter: true,
        search: true,
        customFilterDialogFooter: () => null,
    };

    const getMuiTheme = () => createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        paddingLeft: '3px',
                        paddingRight: '3px',
                        paddingTop: '0px',
                        paddingBottom: '0px',
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
        <>

            <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
                <Navbar0 menus={menus} />
            

                <div style={{ margin: '25px' }}>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Aprobación de Créditos Directos"}
                            data={creditos}
                            columns={columns}
                            options={options}
                        />
                    </ThemeProvider>
                </div>
            </div>


            {/* Dialog to show product codes */}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <Grid container spacing={2}>
                        {loading ? (
                            <LoadingCircle />
                        ) : (detalles.map((item, index) => (
                            <Grid item xs={12} key={index}>
                                <TextField
                                    label={`Código Producto`}
                                    value={`Producto: ${item.cod_producto}, Cantidad: ${item.quantity}, Precio: ${item.price}`}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                        )))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
                <DialogTitle>Confirmar Aprobación</DialogTitle>
                <DialogContent>
                    <p>¿Está seguro que desea aprobar el crédito con ID: {selectedTransaction}?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>Cancelar</Button>
                    <Button onClick={handleApprove} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>Aprobar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


