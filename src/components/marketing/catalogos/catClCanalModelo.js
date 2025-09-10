import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, ButtonGroup, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Autocomplete, IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import { toast } from "react-toastify";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import Navbar0 from "../../Navbar0";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import GlobalLoading from "../selectoresDialog/GlobalLoading";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import {ThemeProvider} from "@mui/material/styles";
import {getMuiTheme, getTableOptions} from "../muiTableConfig";
import MUIDataTable from "mui-datatables";
import {makeStyles} from "@mui/styles";
import RefreshIcon from '@mui/icons-material/Refresh';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";


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
function CatClCanalModelo()  {

    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const navigate = useNavigate();
    const [canales, setCanales] = useState([]);
    const [clienteCanal, setClienteCanal] = useState([]);
    const [modeloVersionesRepuestos, setModeloVersionesRepuestos] = useState([]);
    const [modeloVersiones, setModeloVersiones] = useState([]);
    const [selectedClienteCanal, setSelectedClienteCanal] = useState(null);
    const [cabeceras, setCabeceras] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [productos, setProductos] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    const [form, setForm] = useState({
        codigo_cliente_canal: '',
        codigo_canal: '',
        codigo_cliente: '',
        codigo_mod_vers_repuesto: '',
        codigo_modelo_version: '',
        empresa: '',
        cod_producto: '',
        fecha_asignacion: '',
        estado: '',
    });

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

    const fetchClienteCanalModelo = async () => {
        try {
            const res = await fetch(`${API}/bench/get_cliente_canal_modelo`, {
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

    const fetchCanal = async () => {
        try {
            const res = await fetch(`${API}/bench/get_canal`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setCanales(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de CanalES", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };

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
                setClienteCanal(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos CLIENTE CANAL", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const fetchModeloVersRepuestos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_version_repuesto`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setModeloVersionesRepuestos(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de repuestos", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión mvr", { variant: "error" });
        }

    };

    const fetchModeloVersion = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelo_version`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                setModeloVersiones(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener modelos activos", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };

    const fetchProductos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_productos`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setProductos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión ..!", { variant: "error" });
        }

    };

    const handleInsertOrUpdate = async () => {
        console.log("form actual:", form);

        if (!form.codigo_mod_vers_repuesto || !form.codigo_canal || !form.codigo_cliente || !form.cod_producto || !form.empresa ) {
            enqueueSnackbar("Todos los campos son obligatorios", { variant: "error" });
            return;
        }
        setLoadingGlobal(true);
        const method = selectedItem ? "PUT" : "POST";
        const url = selectedItem
            ? `${API}/bench/update_cliente_canal_modelo/${selectedItem.codigo_cliente_canal}`
            : `${API}/bench/insert_cliente_canal_modelo`;

        const payload = {
            codigo_canal: form.codigo_canal,
            codigo_mod_vers_repuesto: form.codigo_mod_vers_repuesto,
            codigo_modelo_version: form.codigo_modelo_version,
            cod_producto: form.cod_producto,
            empresa: form.empresa,
            fecha_asignacion: form.fecha_asignacion,
            codigo_cliente_canal: form.codigo_cliente_canal,
            estado: form.estado,
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
                fetchClienteCanalModelo();
                enqueueSnackbar(data.message || "Registro guardado correctamente", { variant: 'success' });
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar("Error inesperado durante la carga", { variant: "error" });
        } finally {
            setLoadingGlobal(false);
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchClienteCanal();
                await fetchCanal();
                await fetchProductos();
                await fetchModeloVersRepuestos();
                await fetchClienteCanalModelo();
                await fetchModeloVersion();
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };

        cargarDatos();
    }, []);

    const openDialog = (item = null) => {
        if (item) setForm(item);
        else setForm({
            codigo_cliente_canal: '',
            codigo_canal: '',
            codigo_cliente: '',
            codigo_mod_vers_repuesto: '',
            codigo_modelo_version: '',
            empresa: '',
            cod_producto: '',
            fecha_asignacion: '',
            estado: '' });
        setSelectedItem(item);
        setDialogOpen(true);

    };

    const columns = [
        // { name: 'codigo_cliente_canal', label: 'CÓDIGO' },
        { name: 'nombre_canal', label: 'CANAL' },
        { name: 'nombre_cliente', label: 'CLIENTE' },
        { name: 'nombre_modelo_comercial', label: 'MODELO ' },
        { name: 'nombre_producto', label: 'REPUESTO' },
        { name: 'nombre_empresa', label: 'EMPRESA' },
        {
            name: 'fecha_asignacion',
            label: 'FECHA ASIGNACIÓN',
            options: {
                customBodyRender: (value) => value?.substring(0, 10) || ''
            }
        },
        {
            name: "estado",
            label: "Estado",
            options: {
                customBodyRender: (value) => (
                    <div
                        style={{
                            backgroundColor: value === 1 ? 'green' : 'red',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            display: 'inline-block',
                            textAlign: 'center',
                            minWidth: '70px'
                        }}
                    >
                        {value === 1 ? "ACTIVO" : "INACTIVO"}
                    </div>
                )
            }
        },
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

    const camposPlantillaModelo = [
        "codigo_cliente_canal", "cliente", "nombre_canal","nombre_producto", "nombre_modelo_comercial",
        "nombre_empresa", "fecha_asignacion", "estado",
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_cliente_canal.xlsx");

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const handleFechaAsignacion = (newValue) => {
        if (newValue?.isValid?.()) {
            handleChange('fecha_asignacion', newValue.format('YYYY-MM-DD'));
        }
    };

    return (
        <>
            <GlobalLoading open={loadingGlobal} />
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
                                    codigo_cliente: '',
                                    codigo_mod_vers_repuesto: '',
                                    codigo_modelo_version: '',
                                    empresa: '',
                                    cod_producto: '',
                                    fecha_asignacion: '',
                                    estado: '',
                                });
                                setDialogOpen(true);
                            }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: 'firebrick',
                                '&:hover': {
                                    backgroundColor: 'firebrick',
                                },
                                '&:active': {
                                    backgroundColor: 'firebrick',
                                    boxShadow: 'none'
                                }
                            }}
                        >Nuevo
                        </Button>
                        <IconButton onClick={fetchClienteCanal} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={tableOptions} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedItem ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={clienteCanal}
                                        getOptionLabel={(option) =>
                                            `${option.codigo_cliente_canal} - ${option.nombre_canal} - ${option.nombre_cliente} `
                                        }
                                        value={selectedClienteCanal}
                                        isOptionEqualToValue={(opt, val) => opt.codigo_cliente_canal === val?.codigo_cliente_canal}
                                        onChange={(e, v) => {
                                            if (!v) return;
                                            setSelectedClienteCanal(v);
                                            const producto = productos.find(p => p.cod_producto === v.cod_producto && p.empresa === v.empresa);
                                            setSelectedProducto(producto || null);
                                            setForm((prev) => ({
                                                ...prev,
                                                codigo_cliente_canal: v.codigo_cliente_canal,
                                                codigo_canal: v.codigo_canal,
                                                codigo_cliente: v.codigo_cliente,
                                                cod_producto: v.cod_producto,
                                                empresa: v.empresa,
                                                codigo_mod_vers_repuesto: v.codigo_mod_vers_repuesto,
                                                nombre_cliente: v.nombre_cliente,
                                                nombre_empresa: v.nombre_empresa,
                                                nombre_producto: v.nombre_producto,
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Canal"
                                            />
                                        )}
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
                                <Autocomplete
                                    options={modeloVersiones}
                                    getOptionLabel={(option) => option.nombre_modelo_version || ''}
                                    isOptionEqualToValue={(opt, val) => opt.codigo_modelo_version === val?.codigo_modelo_version}
                                    value={modeloVersiones.find(m => m.codigo_modelo_version === form.codigo_modelo_version) || null}
                                    onChange={(e, value) => {
                                        if (!value) return;
                                        handleChange('codigo_modelo_version', value.codigo_modelo_version);
                                        setForm((prev) => ({
                                            ...prev,
                                            nombre_modelo_comercial: value.nombre_modelo_comercial,
                                            anio_modelo_comercial: value.anio_modelo_comercial,
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Modelo Versión activo" />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Modelo Comercial"
                                    value={`${form.nombre_modelo_comercial || ''} - ${form.anio_modelo_comercial || ''}`}
                                    fullWidth
                                    disabled
                                />

                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="estado-label">Estado</InputLabel>
                                    <Select
                                        labelId="estado-label"
                                        value={form.estado}
                                        onChange={(e) => handleChange('estado', e.target.value)}
                                        variant="outlined">
                                        <MenuItem value={1}>ACTIVO</MenuItem>
                                        <MenuItem value={0}>INACTIVO</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Fecha Validación"
                                        value={form.fecha_asignacion ? dayjs(form.fecha_asignacion) : null}
                                        onChange={handleFechaAsignacion}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'outlined',
                                                size: 'medium'
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>


                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertOrUpdate} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default function  IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatClCanalModelo />
        </SnackbarProvider>
    );
}
