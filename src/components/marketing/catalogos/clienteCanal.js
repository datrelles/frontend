import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import {Autocomplete, IconButton, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useAuthContext } from "../../../context/authContext";
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import * as XLSX from "xlsx";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Stack from "@mui/material/Stack";


const API = process.env.REACT_APP_API;

function ClienteCanal() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [canales, setCanales] = useState([]);
    const [modeloVersionRepuesto, setModeloVersionRepuesto] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [cabeceras, setCabeceras] = useState([]);
    const [loading] = useState(false);
    const [form, setForm] = useState({
        codigo_cliente_canal: '',
        codigo_canal: '',
        codigo_mod_vers_repuesto: '',
        empresa: '',
        cod_producto: '',
        codigo_version: '',
        descripcion_cliente_canal: '',
    });

    const fetchClienteCanal = async () => {
        try {
            const res = await fetch(`${API}/bench/get_cliente_canal`, {
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
                enqueueSnackbar(data.error || "Error al obtener datos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const fetchModeloVersionRepuesto = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_version_repuesto`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setModeloVersionRepuesto(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando modelos versión repuesto', { variant: 'error' });
        }
    };

    const fetchCanalesActivos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_canal`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            const activos = Array.isArray(data) ? data.filter(c => c.estado_canal === 1) : [];
            setCanales(activos);
        } catch (err) {
            enqueueSnackbar('Error cargando canales', { variant: 'error' });
        }
    };

    const handleInsertOrUpdate = async () => {
        console.log("form actual:", form);

        if (!form.codigo_mod_vers_repuesto || !form.codigo_canal || !form.cod_producto || !form.empresa  || !form.codigo_version) {
            enqueueSnackbar("Todos los campos son obligatorios", { variant: "error" });
            return;
        }
        const method = selectedItem ? "PUT" : "POST";
        const url = selectedItem
            ? `${API}/bench/update_cliente_canal/${selectedItem.codigo_cliente_canal}`
            : `${API}/bench/insert_cliente_canal`;

        const payload = {
            codigo_canal: form.codigo_canal,
            codigo_mod_vers_repuesto: form.codigo_mod_vers_repuesto,
            cod_producto: form.cod_producto,
            empresa: form.empresa,
            codigo_version: form.codigo_version,
            descripcion_cliente_canal: form.descripcion_cliente_canal
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                fetchClienteCanal();
                enqueueSnackbar(data.message || "Registro guardado correctamente", { variant: 'success' });
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar("Error al enviar los datos", { variant: 'error' });
        }
    };

    useEffect(() => {
        getMenus();
        fetchModeloVersionRepuesto();
        fetchCanalesActivos();
        fetchClienteCanal()
    }, []);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const openDialog = (item = null) => {
        if (item) setForm(item);
        else setForm({
            codigo_cliente_canal: '',
            codigo_canal: '',
            codigo_mod_vers_repuesto: '',
            empresa: '',
            cod_producto: '',
            codigo_version: '',
            descripcion_cliente_canal: '' });
        setSelectedItem(item);
        setDialogOpen(true);

    };

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);
                const res = await fetch(`${API}/bench/insert_cliente_canal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                    body: JSON.stringify({ repuestos: rows })
                });
                const json = await res.json();
                if (res.ok) enqueueSnackbar(json.message, { variant: 'success' });
                else enqueueSnackbar(json.error || 'Error en carga', { variant: 'error' });
                fetchClienteCanal();
            } catch (err) {
                enqueueSnackbar('Error procesando archivo', { variant: 'error' });
            }
        };
        reader.readAsBinaryString(file);
    };

    const columns = [
       // { name: 'codigo_cliente_canal', label: 'CÓDIGO' },
        { name: 'nombre_canal', label: 'CANAL' },
        { name: 'descripcion_cliente_canal', label: 'CLIENTE' },
        { name: 'codigo_mod_vers_repuesto', label: 'MODELO VERSION REPUESTO' },
        { name: 'nombre_producto', label: 'PRODUCTO' },
        { name: 'nombre_empresa', label: 'EMPRESA' },
        { name: 'nombre_version', label: 'VERSIÓN' },
        {
            name: "acciones",
            label: "ACCIONES",
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const rowData = cabeceras[dataIndex];
                    return (
                        <IconButton onClick={() => openDialog(rowData)}>
                            <EditIcon />
                        </IconButton>
                    );
                }
            }
        }
    ];

    const options = {
        responsive: 'standard', selectableRows: 'none', textLabels: {
            body: { noMatch: 'Lo siento, no se encontraron registros', toolTip: 'Ordenar' },
            pagination: { next: 'Siguiente', previous: 'Anterior', rowsPerPage: 'Filas por página:', displayRows: 'de' }
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

    const getMuiTheme = () => createTheme({
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
                    }
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
                                    codigo_cliente_canal: '',
                                    codigo_canal: '',
                                    codigo_mod_vers_repuesto: '',
                                    empresa: '',
                                    cod_producto: '',
                                    codigo_version: '',
                                    descripcion_cliente_canal: '',
                                });
                                setDialogOpen(true);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 500,backgroundColor: 'firebrick' }}
                        >Nuevo
                        </Button>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{ textTransform: 'none', fontWeight: 500,backgroundColor: 'green' }}
                        >Insertar Masivo
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
                        </Button>
                        <IconButton onClick={fetchClienteCanal} style={{ color: 'firebrick' }}>
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
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={modeloVersionRepuesto}
                                        getOptionLabel={(option) => `${option.codigo_mod_vers_repuesto} - ${option.nombre_producto || ''}`}
                                        value={modeloVersionRepuesto.find(m => m.codigo_mod_vers_repuesto === form.codigo_mod_vers_repuesto) || null}
                                        onChange={(e, v) => {
                                            if (v) {
                                                console.log("modelo version seleccionado", v);  // Debug
                                                setForm(prev => ({
                                                    ...prev,
                                                    codigo_mod_vers_repuesto: v.codigo_mod_vers_repuesto ?? '',
                                                    empresa: v.empresa ?? '',
                                                    cod_producto: v.cod_producto ?? '',
                                                    codigo_version: v.codigo_version ?? '',
                                                    nombre_empresa: v.nombre_empresa ?? '',
                                                    nombre_marca: v.nombre_marca ?? '',
                                                    nombre_modelo_comercial: v.nombre_modelo_comercial ?? '',
                                                    nombre_producto: v.nombre_producto ?? '',
                                                    nombre_version: v.nombre_version ?? ''
                                                }));
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Modelo Versión Repuesto" fullWidth />}
                                        isOptionEqualToValue={(option, value) => option.codigo_mod_vers_repuesto === value.codigo_mod_vers_repuesto}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Empresa" value={form.nombre_empresa || ''} fullWidth disabled />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Producto" value={form.nombre_producto || ''} fullWidth disabled />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Versión" value={form.nombre_version || ''} fullWidth disabled />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={canales}
                                        getOptionLabel={(c) => c.nombre_canal || ''}
                                        value={canales.find(c => String(c.codigo_canal) === String(form.codigo_canal)) || null}
                                        onChange={(e, v) => {
                                            handleChange('codigo_canal', v?.codigo_canal || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Canal" />}
                                        isOptionEqualToValue={(option, value) => option.codigo_canal === value.codigo_canal}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Descripción" value={form.descripcion_cliente_canal} onChange={e => handleChange('descripcion_cliente_canal', e.target.value.toUpperCase())} fullWidth />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertOrUpdate} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}</>);
}

export default function IntegrationNotistackWrapper() {
    return (
        <SnackbarProvider maxSnack={3}>
            <ClienteCanal />
        </SnackbarProvider>
    );
}
