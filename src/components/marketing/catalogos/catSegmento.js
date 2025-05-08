import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import {Autocomplete, FormControl, IconButton, InputLabel, MenuItem, Select, TextField} from '@mui/material';
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
    const [loading] = useState(false);
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
            const modelo = modelosComerciales?.find(mc => mc.nombre_modelo === item.nombre_modelo_comercial);
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
                nombre_modelo_comercial: modelo?.nombre_modelo || '',
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
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);
                const res = await fetch(`${API}/bench/insert_segmento`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                    body: JSON.stringify({ repuestos: rows })
                });
                const json = await res.json();
                if (res.ok) enqueueSnackbar(json.message, { variant: 'success' });
                else enqueueSnackbar(json.error || 'Error en carga', { variant: 'error' });
                fetchSegmentos();
            } catch (err) {
                enqueueSnackbar('Error procesando archivo', { variant: 'error' });
            }
        };
        reader.readAsBinaryString(file);
    };

    const columns = [
        { name: 'codigo_segmento', label: 'CÓDIGO' },
        { name: 'nombre_linea_padre', label: 'LINEA PRINCIPAL' },
        { name: 'nombre_linea', label: 'LINEA' },
        { name: 'nombre_segmento', label: 'SEGMENTO' },
        { name: 'nombre_modelo_comercial', label: 'MODELO COMERCIAL' },
        { name: 'nombre_marca', label: 'MARCA' },
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
                        {value === 1 ? "Activo" : "Inactivo"}
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
                <Box>
                    <Button onClick={() => {
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
                    } }
                            style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}>Insertar Nuevo</Button>
                    <Button onClick={fetchSegmentos} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar</Button>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedItem ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre Segmento"
                                    value={form.nombre_segmento || ''}
                                    onChange={(e) =>
                                        handleChange('nombre_segmento', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={modelosComerciales.filter(mc => mc.estado_modelo === 1)}
                                    getOptionLabel={(mc) => mc.nombre_modelo || ''}
                                    value={selectedModeloComercial}
                                    onChange={(e, v) => {
                                        handleChange('codigo_modelo_comercial', v?.codigo_modelo_comercial || '');
                                        handleChange('codigo_marca', v?.codigo_marca || '');
                                        handleChange('nombre_marca', v?.nombre_marca || '');
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
                                <FormControl fullWidth>
                                    <InputLabel id="estado-segmento-label">Estado</InputLabel>
                                    <Select
                                        labelId="estado-segmento-label"
                                        value={form.estado_segmento}
                                        onChange={(e) => handleChange('estado_segmento', e.target.value)}
                                    >
                                        <MenuItem value={1}>Activo</MenuItem>
                                        <MenuItem value={0}>Inactivo</MenuItem>
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
                                               handleChange('descripcion_segmento', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertOrUpdate} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}</Button>
                        <Button variant="contained" component="label" style={{ backgroundColor: 'firebrick', color: 'white' }}>
                            Cargar Excel
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}</>);
}

export default function IntegrationNotistackWrapper() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatSegmento />
        </SnackbarProvider>
    );
}
