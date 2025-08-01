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
import AddIcon from "@material-ui/icons/Add";
import {ThemeProvider} from "@mui/material/styles";
import {getMuiTheme, getTableOptions} from "../muiTableConfig";
import MUIDataTable from "mui-datatables";
import RefreshIcon from '@mui/icons-material/Refresh';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


const API = process.env.REACT_APP_API;

function RepCompatible()  {

    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const navigate = useNavigate();
    const [canales, setCanales] = useState([]);
    const [clienteCanalModelo, setClienteCanalModelo] = useState([]);
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
    const [erroresCarga, setErroresCarga] = useState([]);

    const [form, setForm] = useState({
        codigo_cliente_canal: '',
        codigo_canal: '',
        codigo_cliente: '',
        codigo_mod_vers_repuesto: '',
        codigo_modelo_version: '',
        anio_modelo_comercial: '',
        empresa: '',
        cod_producto: '',
        fecha_validacion: '',
        validado_por: '',
        es_compatible: '',
        nivel_confianza: '',
        comentarios_tecnicos: '',
        origen_validacion: '',
        fecha_asignacion: '',
        estado: ''
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

    const fetchRepuestoCompatible = async () => {
        try {
            const res = await fetch(`${API}/bench_rep/get_cliente_canal_modelo_compatibilidad`, {
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
                enqueueSnackbar(data.error || "Error al obtener datos de Canal", { variant: "error" });
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
                enqueueSnackbar(data.error || "Error al obtener datos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
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
                setClienteCanalModelo(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const fetchModeloVersRepuesto = async () => {
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
                enqueueSnackbar(data.error || "Error al obtener datos", { variant: "error" });
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
                enqueueSnackbar(data.error || "Error al obtener modelos", { variant: "error" });
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
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const handleInsertOrUpdate = async () => {
        console.log("form actual:", form);

        const camposObligatorios = [
            'codigo_mod_vers_repuesto','codigo_modelo_version', 'cod_producto','empresa',
            'codigo_cliente_canal','es_compatible','validado_por','nivel_confianza',
            'origen_validacion','fecha_validacion','fecha_asignacion','estado'
        ];

        const faltantes = camposObligatorios.filter(campo =>
            form[campo] === undefined || form[campo] === null || form[campo] === ''
        );

        if (faltantes.length > 0) {
            enqueueSnackbar("Faltan campos requeridos: " + faltantes.join(', '), { variant: 'error' });
            return;
        }

        const confianza = Number(form.nivel_confianza);
        if (isNaN(confianza) || confianza < 0 || confianza > 100) {
            enqueueSnackbar("El nivel de confianza debe estar entre 0 y 100", { variant: 'error' });
            return;
        }

        setLoadingGlobal(true);

        const method = selectedItem ? "PUT" : "POST";
        const url = selectedItem
            ? `${API}/bench_rep/update_cliente_canal_repuesto_compatibilidad/${selectedItem.codigo_cliente_canal}`
            : `${API}/bench_rep/insert_cliente_canal_repuesto_compatibilidad`;

        const payload = {
            cod_producto: form.cod_producto,
            empresa: Number(form.empresa),
            codigo_cliente_canal: Number(form.codigo_cliente_canal),
            codigo_modelo_version: Number(form.codigo_modelo_version),
            codigo_mod_vers_repuesto: Number(form.codigo_mod_vers_repuesto),
            es_compatible: Number(form.es_compatible),
            validado_por: form.validado_por,
            nivel_confianza: confianza,
            origen_validacion: form.origen_validacion,
            fecha_validacion: form.fecha_validacion,
            fecha_asignacion: form.fecha_asignacion,
            estado: form.estado,
            comentarios_tecnicos: form.comentarios_tecnicos || ''
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
                fetchRepuestoCompatible();
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
        getMenus();
        fetchClienteCanal();
        fetchCanal();
        fetchProductos();
        fetchModeloVersRepuesto();
        fetchRepuestoCompatible();
        fetchModeloVersion();
        fetchClienteCanalModelo();
    }, []);

    const openDialog = (item = null) => {

        if (item) {
            console.log('item recibido:', item);
            setForm(item);
        }
        if (item) {
            setForm(prev => ({
                ...prev,
                ...item,
                anio_modelo_comercial: item.anio_modelo_comercial ?? '',
            }));
        } else {
            setForm({
                codigo_cliente_canal: '',
                codigo_canal: '',
                codigo_cliente: '',
                codigo_mod_vers_repuesto: '',
                anio_modelo_comercial: '',
                codigo_modelo_version: '',
                empresa: '',
                cod_producto: '',
                fecha_validacion: '',
                fecha_asignacion: '',
                validado_por: '',
                nivel_confianza: '',
                comentarios_tecnicos: '',
                origen_validacion: '',
                estado: '',
                es_compatible: ''
            });
        }

        const clienteCanalSeleccionado = clienteCanal.find(
            c => c.codigo_cliente_canal === item?.codigo_cliente_canal
        );
        setSelectedClienteCanal(clienteCanalSeleccionado || null);
        setSelectedItem(item);
        setDialogOpen(true);
    };

    const columns = [
        // { name: 'codigo_cliente_canal', label: 'CÓDIGO' },
        //{ name: 'nombre_canal', label: 'CANAL' },
        { name: 'nombre_cliente', label: 'CLIENTE' },
        { name: 'nombre_modelo_comercial', label: 'MODELO COMERCIAL ' },
        { name: 'nombre_producto', label: 'REPUESTO' },
        { name: 'validado_por', label: 'RESPONSABLE' },
        {
            name: 'nivel_confianza',
            label: 'NIVEL CONFIANZA',
            options: {
                customBodyRender: (value) => `${value}%`
            }
        },
        { name: 'origen_validacion', label: 'ORIGEN VALIDACIÓN' },
        {
            name: 'fecha_validacion',
            label: 'FECHA VALIDACIÓN',
            options: {
                customBodyRender: (value) => value?.substring(0, 10) || ''
            }
        },
        {
            name: "es_compatible",
            label: "COMPATIBLE",
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
                        {value === 1 ? "SI" : "NO"}
                    </div>
                )
            }
        },
        {
            name: 'fecha_asignacion',
            label: 'FECHA ASIGNACIÓN',
            options: {
                customBodyRender: (value) => value?.substring(0, 10) || ''
            }
        },
        {
            name: "estado",
            label: "estado",
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
        { name: 'comentarios_tecnicos', label: 'COMENTARIOS TÉCNICOS' },
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
        "codigo_cliente_canal", "nombre_canal", "nombre_cliente",
        "nombre_producto","nombre_modelo_comercial",
        "fecha_asignacion", "estado","nivel_confianza",
        "validado_por", "origen_validacion", "fecha_validacion",
        "es_compatible", "comentarios_tecnicos"
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_compatibilidad.xlsx");

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleFechaValidacion = (newValue) => {
        if (newValue?.isValid?.()) {
            handleChange('fecha_validacion', newValue.format('YYYY-MM-DD'));
        }
    };

    const handleFechaAssignation = (newValue) => {
        if (newValue?.isValid?.()) {
            handleChange('fecha_asignacion', newValue.format('YYYY-MM-DD'));
        }
    };

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const wb = XLSX.read(evt.target.result, { type: 'binary' });
                    const sheet = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet);

                    const claves = new Map();
                    const duplicadosLocales = [];

                    rows.forEach((row, idx) => {

                        const clave = `${row.nombre_modelo_comercial}|${row.nombre_cliente}|${row.nombre_canal}|${row.nombre_producto}`;

                        if (claves.has(clave)) {
                            claves.get(clave).push(idx + 2);
                        } else {
                            claves.set(clave, [idx + 2]);
                        }
                    });

                    claves.forEach((filas, clave) => {
                        if (filas.length > 1) {
                            duplicadosLocales.push(...filas);
                        }
                    });
                    if (duplicadosLocales.length > 0) {
                        const mensaje = duplicadosLocales.map(f => `Fila ${f}`).join(', ');
                        enqueueSnackbar(`Registros duplicados en Excel (${duplicadosLocales.length}): ${mensaje}`, {
                            variant: 'warning',
                            autoHideDuration: 10000,
                            anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                        });
                        return;
                    }
                    const res = await fetch(`${API}/bench_rep/insert_repuesto_compatibilidad_masivo`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + jwt
                        },
                        body: JSON.stringify({ repuestos: rows })
                    });
                    const result = await res.json();

                    if (res.ok) {
                        if (result.insertados > 0) {
                            enqueueSnackbar(`Registros insertados: ${result.insertados}`, {
                                variant: 'success',
                                anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                            });
                        }
                        if (result.duplicados?.length > 0) {
                            const filasDuplicadas = result.duplicados
                                .map(d => d?.fila ? `Fila ${d.fila}` : 'Fila desconocida')
                                .join(', ');

                            enqueueSnackbar(`Registros duplicados (${result.duplicados.length}): ${filasDuplicadas}`, {
                                variant: 'warning',
                                autoHideDuration: 10000,
                                anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                            });
                            setErroresCarga(result.duplicados);
                        }

                        if (result.errores?.length > 0) {
                            const erroresDetallados = result.errores
                                .map(err => `${err.fila}: ${err.error}`)
                                .join(' | ');

                            enqueueSnackbar(`Errores en ${result.errores.length} fila(s): ${erroresDetallados}`, {
                                variant: 'error',
                                autoHideDuration: 10000,
                                anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                            });
                            setErroresCarga(result.errores);
                        }
                        fetchRepuestoCompatible();
                        fetchClienteCanalModelo();
                    } else {
                        enqueueSnackbar(result.error || 'Error en carga', {
                            variant: 'error',
                            anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                        });
                    }

                } catch (err) {
                    console.error("Error al procesar archivo:", err);
                    enqueueSnackbar("Error procesando archivo", {
                        variant: 'error',
                        anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
                    });
                }
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error("Error al leer archivo:", err);
            enqueueSnackbar("Error al leer o enviar el archivo", {
                variant: "error",
                anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
            });
        }
    };

    const handleUploadExcelUpdate = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);
                setLoadingGlobal(true);
                const res = await fetch(`${API}/bench_rep/update_cliente_canal_repuesto_compatibilidad_masivo`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                    body: JSON.stringify(rows)
                });

                const json = await res.json();
                if (res.ok) enqueueSnackbar(json.message, { variant: 'success' });
                else enqueueSnackbar(json.error || 'Error en carga', { variant: 'error' });
                fetchRepuestoCompatible();
                fetchClienteCanalModelo();
            } catch (error) {
                enqueueSnackbar("Error inesperado durante la carga", { variant: "error" });
            } finally {
                setLoadingGlobal(false);
            }
        };
        reader.readAsBinaryString(file);
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
                                setSelectedClienteCanal(null);
                                setForm({
                                    codigo_cliente_canal: '',
                                    codigo_canal: '',
                                    codigo_cliente: '',
                                    codigo_mod_vers_repuesto: '',
                                    codigo_modelo_version: '',
                                    empresa: '',
                                    cod_producto: '',
                                    fecha_validacion: '',
                                    fecha_asignacion: '',
                                    estado: '',
                                    nivel_confianza: '',
                                    validado_por: '',
                                    es_compatible: '',
                                    anio_modelo_comercial: '',
                                    comentarios_tecnicos: '',
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
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                },
                                '&:active': {
                                    backgroundColor: 'green',
                                    boxShadow: 'none'
                                }
                            }}>Insertar Masivo
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
                        </Button>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<EditIcon />}
                            sx={{ textTransform: 'none', fontWeight: 600,backgroundColor: 'littleseashell' }}
                        >Actualizar Masivo
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcelUpdate} />
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
                                            `${option.codigo_cliente_canal} - ${option.nombre_canal} - ${option.nombre_cliente} - ${option.nombre_producto}`
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
                                        <TextField {...params} label="Modelo Versión" />
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
                                        label="Fecha Asignacion"
                                        value={form.fecha_asignacion ? dayjs(form.fecha_asignacion) : null}
                                        onChange={handleFechaAssignation}
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
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="es_compatible-label">Es Compatible</InputLabel>
                                    <Select
                                        labelId="es_compatible-label"
                                        value={form.es_compatible}
                                        onChange={(e) => handleChange('es_compatible', e.target.value)}
                                        variant="outlined">
                                        <MenuItem value={1}>SI</MenuItem>
                                        <MenuItem value={0}>NO</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Nivel de Confianza"
                                    type="number"
                                    value={form.nivel_confianza}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (/^\d{1,3}$/.test(value) && parseInt(value) <= 100)) {
                                            handleChange('nivel_confianza', value);
                                        }
                                    }}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <span style={{
                                                fontWeight: 500,
                                                marginLeft: 2,
                                                marginRight: 4,
                                                fontSize: '1rem'
                                            }}>%</span>
                                        ),
                                        inputProps: {
                                            style: {
                                                textAlign: 'right',
                                                paddingRight: '0px',
                                                MozAppearance: 'textfield'
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                        '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Validado por"
                                    value={form.validado_por || ''}
                                    onChange={(e) => handleChange('validado_por', e.target.value.toUpperCase())}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="origen-label">Origen Validación</InputLabel>
                                    <Select
                                        labelId="origen-label"
                                        value={form.origen_validacion}
                                        onChange={(e) => handleChange('origen_validacion', e.target.value)}
                                     variant="outlined">
                                        <MenuItem value="INTERNO">INTERNO</MenuItem>
                                        <MenuItem value="FABRICANTE">FABRICANTE</MenuItem>
                                        <MenuItem value="PROVEEDOR">PROVEEDOR</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Fecha Validación"
                                        value={form.fecha_validacion ? dayjs(form.fecha_validacion) : null}
                                        onChange={handleFechaValidacion}
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
                            <Grid item xs={12}>
                                <TextField fullWidth label="Comentarios técnicos"
                                           value={form.comentarios_tecnicos || ''}
                                           onChange={(e) =>
                                               handleChange('comentarios_tecnicos', e.target.value.toUpperCase())}
                                />
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
            <RepCompatible />
        </SnackbarProvider>
    );
}
