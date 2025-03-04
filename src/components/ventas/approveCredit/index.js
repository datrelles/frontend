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
import { getCabCreditoDirecto, updateCabCreditoDirecto, getDetCreditoDirecto, getBalanceDataClientB2B, postCodComprobanteEcommerceCreditoDirecto } from '../../../services/api';
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
    const [balanceData, setBalanceData] = useState(null);
    const [openBalanceDialog, setOpenBalanceDialog] = useState(false);

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [openCodComprobateContainer, setOpenCodComprobante] = useState(false)
    const [idSellEcommerce, setIdSellEcommerce] = useState('')
    const [codComprobante, setCodComprobante] = useState('')
    const [refreshSubcases, setRegreshSubcases] = useState(false);

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
    }, [jwt,refreshSubcases]);

    // Approve Credit Function
    const handleApprove = async () => {
        try {
            const credito = creditos.find(c => c.id_transaction === selectedTransaction);
            const updatedCredito = { ...credito, estado_aprobacion: '1' }; // Cambiar estado de aprobación a "APROBADO"
            const dataForAprove = {
                'estado_aprobacion': updatedCredito['estado_aprobacion'],
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

    //No Aprove Credit Function

    const handleNoApprove = async () => {
        try {
            const credito = creditos.find(c => c.id_transaction === selectedTransaction);
            const updatedCredito = { ...credito, estado_aprobacion: '2' }; // Cambiar estado de aprobación a " NO APROBADO"
            const dataForAprove = {
                'estado_aprobacion': updatedCredito['estado_aprobacion'],
                'id_transaction': updatedCredito['id_transaction']
            }
            await updateCabCreditoDirecto(jwt, dataForAprove);
            toast.success(`Crédito con ID ${selectedTransaction} NO aprobado.`);
            setCreditos(creditos.map(c => c.id_transaction === selectedTransaction ? updatedCredito : c));
            setConfirmOpen(false); // Cerrar confirmación después de NO aprobar
        } catch (error) {
            toast.error("Error NO  aprobando el crédito");
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

    const handleClickOpenCodComprobanteContainer = (id) => {
        setOpenCodComprobante(true)
        setIdSellEcommerce(id)
    }


    const handleGetBalance = async (client_id) => {
        try {
            const data = await getBalanceDataClientB2B(jwt, enterpriseShineray, client_id);
            setBalanceData(data); // Guarda los datos del balance
            setOpenBalanceDialog(true); // Abre el modal para mostrar los resultados
        } catch (error) {
            toast.error("Error obteniendo los datos de balance");
        }
    };


    const handleCloseBalanceDialog = () => {
        setOpenBalanceDialog(false);
        setBalanceData(null);
    };

    const handleCloseCointainerComprobante = () => {
        setOpenCodComprobante(false)
        setIdSellEcommerce('')
        setCodComprobante('')
    };

    const handleRefresh = () => {
        setRegreshSubcases(prevState => !prevState);
    }


    // Define Table Columns 'id_transaction"'
    const columns = [
        { name: 'id_transaction', label: 'ID PEDIDO', options: { filter: false } },
        { name: 'fecha', label: 'Fecha', options: { filter: true } },
        { name: 'client_id', label: 'ID Cliente', options: { filter: false } },
        { name: 'client_name', label: 'Nombre Cliente', options: { filter: false } },
        { name: 'client_last_name', label: 'Apellido Cliente', options: { filter: false } },
        { name: 'total', label: 'Total', options: { filter: false } },
        { name: 'sub_total', label: 'Subtotal', options: { filter: false } },
        { name: 'estado_aprobacion', label: 'Estado Aprobación', options: { filter: true } },
        { name: 'cuotas', label: 'Cuotas', options: { filter: false } },
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
                            disabled={['1', '2'].includes(creditos.find(c => c.id_transaction === value).estado_aprobacion)}
                        >
                            Aprobar
                        </Button>
                    </div>
                ),
            },
        },
        {
            name: 'client_id',
            label: 'Acción Balance',
            options: {
                filter: false,
                customBodyRender: (value) => (
                    <Button
                        variant="contained"
                        style={{ backgroundColor: 'firebrick', color: 'white' }}
                        onClick={() => handleGetBalance(value)} // Usamos el client_id para hacer la llamada
                    >
                        Balance
                    </Button>
                ),
            },
        },
 
        { name: 'discount_percentage', label: 'Porcentaje de Descuento', options: { filter: false } },
        { name: 'discount_amount', label: 'Monto de Descuento', options: { filter: false } },
        { name: 'client_type_id', label: 'Tipo de Cliente', options: { filter: false } },
        { name: 'client_address', label: 'Dirección Cliente', options: { filter: false } },
        { name: 'id_agencia_transporte', label: 'ID Agencia Transporte', options: { filter: false } },
        { name: 'nombre_agencia_transporte', label: 'Nombre Agencia Transporte', options: { filter: false } },
        { name: 'id_guia_servientrega', label: 'ID Guía Servientrega', options: { filter: false } },
        { name: 'cost_shiping', label: 'Costo Envío', options: { filter: false } },
        { name: 'cod_orden_ecommerce', label: 'Código Orden Ecommerce', options: { filter: false } },
        {
            name: "id_transaction",
            label: "Facturado",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "center" }}>
                            <Button
                                onClick={() => handleClickOpenCodComprobanteContainer(value)}
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
                                COD
                            </Button>
                        </div>
                    );
                },
                filter: false
            },
        },
        { name: 'cod_comprobante', label: 'Código Comprobante', options: { filter: false } },
        { name: 'shiping_discount', label: 'Descuento Envío', options: { filter: false } },
        { name: 'fecha_aprobacion', label: 'Fecha Aprobación', options: { filter: false, customBodyRender: (value) => value ? moment(value).format('DD/MM/YYYY') : '' } },
        { name: 'descripcion', label: 'Descripción', options: { filter: false } },
      
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
    const handleChangeComprobante = (event) => {
        setCodComprobante(event.target.value);
    };

    const handleUpdateCodComprobante = async (codComprobante) => {
        try {
            setLoading(true);
            const response = await postCodComprobanteEcommerceCreditoDirecto(jwt,'credito_directo' , idSellEcommerce, codComprobante);
            toast.success('Envío actualizado con éxito');
            console.log('Envío actualizado:', response);
            setLoading(false);
            handleRefresh(); // Actualiza los datos después de la operación
        } catch (error) {
            setLoading(false);
            console.error('Error al actualizar el codComrpobante:', error);
            toast.error('Error al ingresar código comprobante');
        } finally {
            handleCloseCointainerComprobante()
        }
    };

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
                    <p>Aprobar o rechazar crédito con ID: {selectedTransaction} </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>Cancelar</Button>
                    <Button onClick={handleApprove} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>Aprobar</Button>
                    <Button onClick={handleNoApprove} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'white', color: '00BFFF', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>RECHAZAR</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openBalanceDialog} onClose={handleCloseBalanceDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Balance del Cliente</DialogTitle>
                <DialogContent>
                    {balanceData ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ width: '50%' }}>
                                <p><strong>Total por vencer:</strong></p>
                                <p><strong>Total vencido:</strong></p>
                                <p><strong>Total deuda:</strong></p>
                            </div>
                            <div style={{ width: '50%', textAlign: 'right' }}>
                                <p>{balanceData.total_x_vencer}</p>
                                <p>{balanceData.total_vencido}</p>
                                <p>{balanceData.total_deuda}</p>
                            </div>
                        </div>
                    ) : (
                        <p>Cargando datos...</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBalanceDialog} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openCodComprobateContainer} onClose={handleCloseCointainerComprobante} maxWidth="md" fullWidth >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item lg={12}>
                                    <div style={{ width: "500px" }}>
                                        <TextField
                                            label="Insertar cod_comprobante"
                                            value={codComprobante}
                                            onChange={handleChangeComprobante}
                                            fullWidth
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <DialogActions>
                                <Button onClick={handleCloseCointainerComprobante}>Cerrar</Button>
                                <Button onClick={() => handleUpdateCodComprobante(codComprobante)} color="primary" variant="contained">
                                    Guardar
                                </Button>
                            </DialogActions>
                        </div>
                    </div>
                </div>
            </Dialog>

        </>
    );
};


