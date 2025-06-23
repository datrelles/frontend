import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import {Autocomplete, IconButton, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useAuthContext } from "../../../context/authContext";
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {makeStyles} from "@mui/styles";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Stack from "@mui/material/Stack";;

const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
    textField: {
        marginBottom: '15px',
    },

});

function CatMatriculaMarca() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [homologados, setHomologados] = useState([]);
    const [cabeceras, setCabeceras] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedHomologado, setSelectedHomologado] = useState(null);
    const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'month').format('DD/MM/YYYY'));
    const [placa, setPlaca] = useState('');
    const [fechaMatriculacion, setFechaMatriculacion] = useState('');
    const [fechaFacturacion, setFechaFacturacion] = useState('');
    const [detalleMatriculacion, setDetalleMatriculacion] = useState('');
    const classes = useStyles();
    const [form, setForm] = useState({
        codigo_modelo_homologado: '',
        placa: '',
        fecha_matriculacion: '',
        fecha_facturacion: '',
        detalle_matriculacion: ''
    });

    const handleChange = (field, value) => setForm({ ...form, [field]: value });

    const handleInsert = async () => {

        const url = selectedItem ?
            `${API}/bench/update_matriculacion_marca/${selectedItem.codigo_matricula_marca}` :
            `${API}/bench/insert_matriculacion_marca`;
        const method = selectedItem ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + jwt },
                body: JSON.stringify(form)

            });
            const data = await res.json();

            if (res.ok) {
                enqueueSnackbar(data.message, { variant: "success" });
                fetchMatriculaMarca();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar("Error de red", { variant: "error" });
        }
    };



    const openEditDialog = (row) => {
        const homologado = homologados.find(
            h => Number(h.codigo_modelo_homologado) === Number(row.codigo_modelo_homologado)
        );

        if (!homologado) {
            enqueueSnackbar("Modelo homologado no encontrado en la lista", { variant: "error" });
        }

        setSelectedItem(row);
        setForm({

            codigo_modelo_homologado: homologado?.codigo_modelo_homologado || '',
            placa: row.placa,
            fecha_matriculacion: row.fecha_matriculacion,
            fecha_facturacion: row.fecha_facturacion,
            detalle_matriculacion: row.detalle_matriculacion
        });

        setSelectedHomologado(homologado || null);

        setDialogOpen(true);
    };

    const fetchMatriculaMarca = async () => {
        try {
            const res = await fetch(`${API}/bench/get_matriculacion_marca`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setCabeceras(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de Matriculación", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const fetchHomologados = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_homologados`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setHomologados(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando tipos de motor', { variant: 'error' });
        }
    };

    const handleFechaMatriculacion = (newValue) => {
        if (newValue?.isValid?.()) {
            handleChange('fecha_matriculacion', newValue.format('YYYY-MM-DD'));
        }
    };

    const handleFechaFacturacion = (newValue) => {
        if (newValue?.isValid?.()) {
            handleChange('fecha_facturacion', newValue.format('YYYY-MM-DD'));
        }
    };

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            toast.error('Error cargando menús');
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchHomologados();
                await fetchMatriculaMarca();

            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };
        cargarDatos();
    }, []);

    const columns = [
        { name: 'codigo_matriculacion_marca', label: 'Código' },
        { name: 'nombre_modelo_homologado', label: 'Modelo Homologado' },
        { name: 'placa', label: 'Número de Placa' },
        { name: 'fecha_matriculacion', label: 'Fecha Matriculación' },
        { name: 'fecha_facturacion', label: 'Fecha Facturación' },
        { name: 'usuario_crea', label: 'Usuario Crea' },
        { name: 'fecha_creacion', label: 'Fecha Creación' },
        {
            name: "acciones",
            label: "Acciones",
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const rowData = cabeceras[dataIndex];
                    return (
                        <IconButton onClick={() => openEditDialog(rowData)}>
                            <EditIcon />
                        </IconButton>
                    );
                }
            }
        }
    ];

    const options = {
        responsive: 'standard',
        selectableRows: 'none',
        textLabels: {
            body: {
                noMatch: "Lo siento, no se encontraron registros",
                toolTip: "Ordenar"
            },
            pagination: {
                next: "Siguiente", previous: "Anterior",
                rowsPerPage: "Filas por página:", displayRows: "de"
            }
        }
    };

    const getMuiTheme = () =>
        createTheme({
            components: {
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            paddingLeft: '3px', paddingRight: '3px', paddingTop: '0px', paddingBottom: '0px',
                            backgroundColor: '#00000', whiteSpace: 'nowrap', flex: 1,
                            borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '14px'
                        },
                        head: {
                            backgroundColor: 'firebrick', color: '#ffffff', fontWeight: 'bold',
                            paddingLeft: '0px', paddingRight: '0px', fontSize: '12px'
                        },
                    }
                },
                MuiTable: { styleOverrides: { root: { borderCollapse: 'collapse' } } },
                MuiToolbar: { styleOverrides: { regular: { minHeight: '10px' } } }
            }
        });

    return (
        <>{loading ? (<LoadingCircle />) : (
            <div style={{ marginTop: '150px', width: "100%" }}>
                <Navbar0 menus={menus} />
                <Box>
                    <ButtonGroup variant="text">
                        <Button onClick={() => navigate('/dashboard')}>Módulos</Button>
                        <Button onClick={() => navigate(-1)}>Catálogos</Button>
                    </ButtonGroup>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedItem(null);
                                setForm({
                                    codigo_modelo_homologado: '',
                                    placa: '',
                                    fecha_matriculacion: '',
                                    fecha_facturacion: '',
                                    detalle_matriculacion: ''
                                });
                                setSelectedHomologado(null);
                                setDialogOpen(true);
                            } }
                            sx={{ textTransform: 'none', fontWeight: 500,backgroundColor: 'firebrick' }}
                        >Nuevo
                        </Button>
                        <IconButton onClick={fetchMatriculaMarca} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedItem ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <Autocomplete
                                    options={homologados}
                                    getOptionLabel={(option) => option?.nombre_modelo_sri || ''}
                                    value={selectedHomologado}
                                    onChange={(e, v) => {
                                        handleChange('codigo_modelo_homologado', v ? v.codigo_modelo_homologado : '');
                                        setSelectedHomologado(v);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Modelo Homologado" />}
                                />
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Número de Placa" value={form.placa || ''} onChange={(e) => handleChange('placa', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Detalle Matriculación" value={form.detalle_matriculacion || ''} onChange={(e) => handleChange('detalle_matriculacion', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={12}>
                                <div className={classes.datePickersContainer} style={{ marginBottom: '30px' }}>
                                    <div>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DatePicker', 'DatePicker']}>
                                                <DatePicker
                                                    label="Fecha Matriculación"
                                                    value={form.fecha_matriculacion ? dayjs(form.fecha_matriculacion) : null}
                                                    onChange={handleFechaMatriculacion}
                                                    format={'DD/MM/YYYY'}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </div>
                                    <div>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DatePicker', 'DatePicker']}>
                                                <DatePicker
                                                    label="Fecha Facturación"
                                                    value={form.fecha_facturacion ? dayjs(form.fecha_facturacion) : null}
                                                    onChange={handleFechaFacturacion}
                                                    format={'DD/MM/YYYY'}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsert} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}</Button>

                    </DialogActions>
                </Dialog>
            </div>
        )}</>);
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatMatriculaMarca />
        </SnackbarProvider>
    );
}