import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../../Navbar0";
import MUIDataTable from "mui-datatables";
import {ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {Autocomplete, FormControl, IconButton, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useAuthContext } from "../../../../context/authContext";
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import * as XLSX from "xlsx";
import GlobalLoading from "../../selectoresDialog/GlobalLoading";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Stack from "@mui/material/Stack";
import {getTableOptions, getMuiTheme } from "../../muiTableConfig";

const API = process.env.REACT_APP_API;

function CatSegmento() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [modelosComerciales, setModelosComerciales] = useState([]);
    const [lineas, setLineas] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedModeloComercial, setSelectedModeloComercial] = useState(null);
    const [selectedLineas, setSelectedLineas] = useState(null);
    const [selectedLineaPadre, setSelectedLineaPadre] = useState(null);
    const [cabeceras, setCabeceras] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [form, setForm] = useState({
        codigo_segmento: '',
        codigo_linea: '',
        codigo_linea_padre: '',
        nombre_linea: '',
        nombre_linea_padre: '',
        codigo_modelo_comercial: '',
        nombre_modelo_comercial: '',
        codigo_marca: '',
        nombre_marca: '',
        nombre_segmento: '',
        estado_segmento: '',
        descripcion_segmento: '',
    });

    const fetchSegmentos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_segmentos`, {
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

    const fetchModeloComercial = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_comerciales`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setModelosComerciales(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando datos', { variant: 'error' });
        }
    };

    const fetchLineas = async () => {
        try {
            const res = await fetch(`${API}/bench/get_lineas`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setLineas(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando datos', { variant: 'error' });
        }
    };

    useEffect(() => {
        getMenus();
        fetchSegmentos();
        fetchLineas();
        fetchModeloComercial();
    }, []);

    const handleInsertOrUpdate = async () => {
        console.log("form actual:", form);

        if (!form.codigo_linea || !form.codigo_modelo_comercial || !form.codigo_marca || form.estado_segmento === '' || !form.nombre_segmento) {
            enqueueSnackbar("Todos los campos obligatorios deben ser completados", { variant: "error" });
            return;
        }
        const method = selectedItem ? "PUT" : "POST";
        const url = selectedItem
            ? `${API}/bench/update_segmento/${selectedItem.codigo_segmento}`
            : `${API}/bench/insert_segmento`;

        const payload = {
            codigo_segmento: form.codigo_segmento,
            codigo_linea: form.codigo_linea,
            nombre_linea: form.nombre_linea,
            codigo_linea_padre: form.codigo_linea_padre,
            codigo_modelo_comercial: form.codigo_modelo_comercial,
            codigo_marca: form.codigo_marca,
            nombre_segmento: form.nombre_segmento,
            estado_segmento: form.estado_segmento,
            descripcion_segmento: form.descripcion_segmento,
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
                fetchSegmentos();
                enqueueSnackbar(data.message || "Registro guardado correctamente", { variant: 'success' });
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar("Error al enviar los datos", { variant: 'error' });
        }
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const openDialog = async (item = null) => {
        console.log("ITEM seleccionado:", item);

        if (item) {
            //const modelo = modelosComerciales?.find(mc => mc.nombre_modelo === item.nombre_modelo_comercial);
            const modelo = modelosComerciales?.find(mc => mc.codigo_modelo_comercial === item.codigo_modelo_comercial);

            const linea = lineas.find(l => l.codigo_linea === item.codigo_linea);
            const lineaPadre = lineas.find(l => l.codigo_linea === linea?.codigo_linea_padre);
            setSelectedLineas(linea || null);
            setSelectedLineaPadre(lineaPadre || null);
            setSelectedModeloComercial(modelo || null);

            setForm({
                codigo_segmento: item.codigo_segmento,
                codigo_linea: linea?.codigo_linea || '',
                codigo_linea_padre: linea?.codigo_linea_padre || '',
                nombre_linea: linea?.nombre_linea || '',
                nombre_linea_padre: linea?.nombre_linea_padre || '',
                codigo_modelo_comercial: modelo?.codigo_modelo_comercial || '',
                //nombre_modelo_comercial: modelo?.nombre_modelo || '',
                nombre_modelo_comercial: modelo?.nombre_modelo || item.nombre_modelo || '',
                codigo_marca: modelo?.codigo_marca || '',
                nombre_marca: modelo?.nombre_marca || '',
                estado_segmento: item.estado_segmento !== undefined ? item.estado_segmento : '',
                nombre_segmento: item.nombre_segmento || '',
                descripcion_segmento: item.descripcion_segmento || ''
            });
        } else {

            setForm({
                codigo_segmento: '',
                codigo_linea: '',
                codigo_linea_padre: '',
                nombre_linea: '',
                nombre_linea_padre: '',
                codigo_modelo_comercial: '',
                nombre_modelo_comercial: '',
                codigo_marca: '',
                nombre_marca: '',
                nombre_segmento: '',
                estado_segmento: '',
                descripcion_segmento: '',
            });
        }
        setSelectedItem(item);
        setDialogOpen(true);
    };

    const handleUploadExcel = (e) => {
        const file = e.target.files?.[0];

        if (!file || !(file instanceof Blob)) {
            enqueueSnackbar('Por favor selecciona un archivo válido .xlsx', { variant: 'warning' });
            console.error("Archivo inválido:", file);
            return;
        }

        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                const res = await fetch(`${API}/bench/insert_segmento`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify(rows)
                });

                const json = await res.json();

                if (res.ok) {
                    enqueueSnackbar(json.message || 'Segmentos cargados', { variant: 'success' });
                    if (json.errores?.length > 0) {
                        enqueueSnackbar(`${json.errores.length} fila(s) con error`, { variant: 'error' });
                        console.warn("Errores:", json.errores);
                    }
                    fetchSegmentos();
                } else {
                    enqueueSnackbar(json.error || 'Error en carga', { variant: 'error' });
                }

            } catch (err) {
                console.error("Error al leer el archivo:", err);
                enqueueSnackbar('Error procesando archivo', { variant: 'error' });
            }
        };

        reader.readAsBinaryString(file);
    };

    const validarEstado = (valor) => {
        const estado = String(valor).trim().toLowerCase();
        return ["1", "0", "activo", "inactivo"].includes(estado);
    };


    const handleUploadExcelUpdate = (e) => {
        const file = e.target.files?.[0];

        if (!file || !(file instanceof Blob)) {
            enqueueSnackbar("Selecciona un archivo válido (.xlsx)", { variant: "warning" });
            return;
        }

        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                const rowsInvalidas = [];
                rows.forEach((row, index) => {
                    if (row.hasOwnProperty("estado_segmento") && !validarEstado(row.estado_segmento)) {
                        rowsInvalidas.push(`Fila ${index + 2}: Estado inválido "${row.estado_segmento}"`);
                    }
                });

                if (rowsInvalidas.length > 0) {
                    rowsInvalidas.forEach(msg => enqueueSnackbar(msg, { variant: 'warning' }));
                    setLoadingGlobal(false);
                    return;
                }

                const duplicados = [];
                const combinaciones = new Map();
                rows.forEach((row, index) => {
                    const clave = `${row.nombre_linea}_${row.nombre_segmento}_${row.nombre_modelo}_${row.estado_segmento}`;
                    if (combinaciones.has(clave)) {
                        const filaOriginal = combinaciones.get(clave);
                        duplicados.push({ filaOriginal, filaDuplicada: index + 2, clave });
                    } else {
                        combinaciones.set(clave, index + 2);
                    }
                });

                if (duplicados.length > 0) {
                    const msg = duplicados.map(d =>
                        `Duplicado con clave [${d.clave}] en filas ${d.filaOriginal} y ${d.filaDuplicada}`
                    ).join('\n');

                    enqueueSnackbar(`Error..!! Registros duplicados detectados:\n${msg}`, {
                        variant: "error",
                        persist: true
                    });
                    return;
                }

                setLoadingGlobal(true);

                const res = await fetch(`${API}/bench/update_segmentos_masivo`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify(rows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Actualización exitosa", { variant: "success" });
                    fetchSegmentos();
                } else {
                    enqueueSnackbar(responseData.error || "Error al cargar", { variant: "error" });
                }
            } catch (error) {
                enqueueSnackbar("Error inesperado durante la carga", { variant: "error" });
            } finally {
                setLoadingGlobal(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    const columns = [
        { name: 'codigo_segmento', label: 'CÓDIGO' },
        { name: 'nombre_linea_padre', label: 'LINEA PRINCIPAL' },
        { name: 'nombre_linea', label: 'LINEA' },
        { name: 'nombre_segmento', label: 'SEGMENTO' },
        { name: 'nombre_modelo', label: 'MODELO COMERCIAL' },
        { name: 'nombre_marca', label: 'MARCA' },
        { name: 'anio_modelo', label: 'AÑO' },
        {
            name: "estado_segmento",
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
        { name: 'descripcion_segmento', label: 'DESCRIPCIÓN' },
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

    const camposPlantillaModelo = [
        "codigo_segmento", "nombre_linea",
        "nombre_segmento", "nombre_modelo","anio_modelo",
        "estado_segmento","descripcion_segmento"
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_segmento.xlsx");

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
                                    codigo_segmento: '',
                                    codigo_linea: '',
                                    codigo_linea_padre: '',
                                    nombre_linea: '',
                                    nombre_linea_padre: '',
                                    codigo_modelo_comercial: '',
                                    nombre_modelo_comercial: '',
                                    codigo_marca: '',
                                    nombre_marca: '',
                                    nombre_segmento: '',
                                    estado_segmento: '',
                                    descripcion_segmento: '',
                                });
                                setSelectedModeloComercial(null);
                                setSelectedLineaPadre(null);
                                setSelectedLineas(null);
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
                            }}
                        >Insertar Masivo
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
                        <IconButton onClick={fetchSegmentos} style={{ color: 'firebrick' }}>
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
                                <TextField
                                    fullWidth
                                    label="Nombre Segmento"
                                    sx={{ mt: 1 }}
                                    value={form.nombre_segmento || ''}
                                    onChange={(e) =>
                                        handleChange('nombre_segmento', e.target.value.toUpperCase())}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={modelosComerciales.filter(mc => mc.estado_modelo === 1)}
                                    getOptionLabel={(mc) => `${mc.nombre_modelo} (${mc.anio_modelo})`}

                                    value={selectedModeloComercial}
                                    onChange={(e, v) => {
                                        handleChange('codigo_modelo_comercial', v?.codigo_modelo_comercial || '');
                                        handleChange('codigo_marca', v?.codigo_marca || '');
                                        handleChange('nombre_marca', v?.nombre_marca || '');
                                        handleChange('anio_modelo', v?.anio_modelo || '');
                                        setSelectedModeloComercial(v);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Modelo Comercial" />}
                                    isOptionEqualToValue={(option, value) => option.codigo_modelo_comercial === value.codigo_modelo_comercial}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Marca" value={selectedModeloComercial?.nombre_marca || ''} fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="AÑO" value={selectedModeloComercial?.anio_modelo || ''} fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth variant="outlined" size="medium">
                                    <InputLabel id="estado-segmento-label">Estado</InputLabel>
                                    <Select
                                        labelId="estado-segmento-label"
                                        value={form.estado_segmento}
                                        onChange={(e) => handleChange('estado_segmento', e.target.value)}
                                        variant="outlined"
                                        label="Estado">
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Autocomplete
                                    options={lineas.filter(p => p.estado_linea === 1 && p.nombre_linea_padre === null)}
                                    getOptionLabel={(option) => option?.nombre_linea || ''}
                                    value={selectedLineaPadre}
                                    onChange={(e, v) => {
                                        setSelectedLineaPadre(v);
                                        setForm(prev => ({
                                            ...prev,
                                            codigo_linea_padre: v?.codigo_linea || ''
                                        }));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Línea padre" />}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Autocomplete
                                    options={lineas.filter(p =>
                                        p.estado_linea === 1 &&
                                        p.codigo_linea_padre === selectedLineaPadre?.codigo_linea
                                    )}
                                    getOptionLabel={(option) => option?.nombre_linea || ''}
                                    value={selectedLineas}
                                    onChange={(e, v) => {
                                        setSelectedLineas(v);
                                        setForm(prev => ({
                                            ...prev,
                                            codigo_linea: v?.codigo_linea || ''
                                        }));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Línea" />}
                                    isOptionEqualToValue={(option, value) => option.codigo_linea === value.codigo_linea}
                                    disabled={!selectedLineaPadre}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Descripción"
                                           value={form.descripcion_segmento || ''}
                                           onChange={(e) =>
                                               handleChange('descripcion_segmento', e.target.value.toUpperCase())}
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

export default function IntegrationNotistackWrapper() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatSegmento />
        </SnackbarProvider>
    );
}
