import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
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
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import * as XLSX from "xlsx";
import GlobalLoading from "../selectoresDialog/GlobalLoading";

const API = process.env.REACT_APP_API;


function CatModeloComercial() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [marcas, setMarcas] = useState([]);
    const [homologados, setHomologados] = useState([]);
    const [cabeceras, setCabeceras] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [selectedHomologado, setSelectedHomologado] = useState(null);
    const [estadoModelo, setEstadoModelo] = useState('');
    const [marcasActivas, setMarcasActivas] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [form, setForm] = useState({
        codigo_marca: '',
        nombre_marca: '',
        codigo_modelo_homologado: '',
        nombre_modelo: '',
        nombre_modelo_homologado: '',
        anio_modelo: '',
        estado_modelo: ''
    });

    const handleChange = (field, value) => setForm({ ...form, [field]: value });

    const handleInsert = async () => {
        let marca = marcas.find((t) => t.nombre_marca.trim().toLowerCase() === form.nombre_marca.trim().toLowerCase());

        if (!marca) {
            try {
                const marcaRes = await fetch(`${API}/bench/insert_marca`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt
                    },
                    body: JSON.stringify({
                        nombre_marca: form.nombre_marca,
                        estado_marca: 1
                    })
                });

                const marcaData = await marcaRes.json();

                if (marcaRes.ok) {
                    form.codigo_marca = marcaData.codigo_marca;

                    await fetchMarcas();
                } else {
                    enqueueSnackbar(marcaData.error || 'Error creando la marca', { variant: 'error' });
                    return;
                }
            } catch (err) {
                enqueueSnackbar('Error al crear la marca', { variant: 'error' });
                return;
            }
        } else {
            form.codigo_marca = marca.codigo_marca;
        }
        const estadoNumerico = estadoModelo === 'ACTIVO' ? 1 : 0;
        const payload = { ...form, estado_modelo: estadoNumerico };
        const url = selectedItem ?
            `${API}/bench/update_modelo_comercial/${selectedItem.codigo_modelo_comercial}` :
            `${API}/bench/insert_modelo_comercial`;
        const method = selectedItem ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + jwt },
                body: JSON.stringify(payload)

            });
            const data = await res.json();

            if (res.ok) {
                enqueueSnackbar(data.message, { variant: "success" });
                fetchModeloComercial();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar("Error de red", { variant: "error" });
        }
    };

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            setLoadingGlobal(true);

            try {
                const processedRows = rows.map((row, index) => {
                    const nombre_marca = (row.nombre_marca || "").toString().trim();
                    const nombre_modelo_sri = (row.nombre_modelo_sri || "").toString().trim();
                    const nombre_modelo = (row.nombre_modelo || "").toString().trim();
                    const anio_modelo = parseInt(row.anio_modelo);
                    const estado_raw = (row.estado_modelo || "").toString().trim().toLowerCase();

                    if (!nombre_marca || !nombre_modelo_sri || !nombre_modelo || isNaN(anio_modelo)) {
                        throw new Error(`Fila ${index + 2}: Datos obligatorios faltantes.`);
                    }

                    const estado_modelo = estado_raw === "activo" ? 1 : estado_raw === "inactivo" ? 0 : null;

                    if (estado_modelo === null) {
                        throw new Error(`Fila ${index + 2}: Estado debe ser 'ACTIVO' o 'INACTIVO'.`);
                    }

                    const homologado = homologados.find(
                        h =>
                            (h.nombre_modelo_sri ?? "")
                                .toString()
                                .trim()
                                .toLowerCase() === nombre_modelo_sri.toLowerCase()
                    );

                    if (!homologado) {
                        throw new Error(`Fila ${index + 2}: Modelo homologado '${nombre_modelo_sri}' no encontrado.`);
                    }

                    return {
                        nombre_marca,
                        codigo_modelo_homologado: homologado.codigo_modelo_homologado,
                        nombre_modelo,
                        anio_modelo,
                        estado_modelo
                    };
                });

                const res = await fetch(`${API}/bench/insert_modelo_comercial`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(processedRows)
                });

                const responseData = await res.json();

                if (res.ok) {
                    enqueueSnackbar(responseData.message || "Carga exitosa", { variant: "success" });

                    if (responseData.duplicados?.length > 0) {
                        enqueueSnackbar(`${responseData.duplicados.length} duplicado(s) omitido(s)`, { variant: "warning" });
                    }

                    if (responseData.errores?.length > 0) {
                        enqueueSnackbar(`${responseData.errores.length} con error(es)`, { variant: "error" });
                    }
                    fetchModeloComercial();
                } else {
                    enqueueSnackbar(responseData.error || "Error en la carga", { variant: "error" });
                }

            } catch (error) {
                enqueueSnackbar("Error inesperado durante la carga", { variant: "error" });
            } finally {
                setLoadingGlobal(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleUploadExcelUpdate = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            setLoadingGlobal(true);

            try {
                const processedRows = rows.map((row, index) => {
                    const codigo_modelo_comercial = parseInt(row.codigo_modelo_comercial);
                    const nombre_marca = (row.nombre_marca || "").toString().trim();
                    const nombre_modelo_sri = (row.nombre_modelo_sri || "").toString().trim();
                    const nombre_modelo = (row.nombre_modelo || "").toString().trim();
                    const anio_modelo = parseInt(row.anio_modelo);
                    const estado_raw = (row.estado_modelo || "").toString().trim().toLowerCase();

                    if (
                        isNaN(codigo_modelo_comercial) ||
                        !nombre_marca ||
                        !nombre_modelo_sri ||
                        !nombre_modelo ||
                        isNaN(anio_modelo)
                    ) {
                        throw new Error(`Fila ${index + 2}: Datos obligatorios faltantes.`);
                    }

                    const estado_modelo = estado_raw === "activo" ? 1 : estado_raw === "inactivo" ? 0 : null;
                    if (estado_modelo === null) {
                        throw new Error(`Fila ${index + 2}: Estado debe ser 'ACTIVO' o 'INACTIVO'.`);
                    }

                    const homologado = homologados.find(
                        h =>
                            (h.nombre_modelo_sri ?? "")
                                .toString()
                                .trim()
                                .toLowerCase() === nombre_modelo_sri.toLowerCase()
                    );

                    if (!homologado) {
                        throw new Error(`Fila ${index + 2}: Modelo homologado '${nombre_modelo_sri}' no encontrado.`);
                    }

                    return {
                        codigo_modelo_comercial,
                        nombre_marca,
                        codigo_modelo_homologado: homologado.codigo_modelo_homologado,
                        nombre_modelo,
                        anio_modelo,
                        estado_modelo
                    };
                });

                const res = await fetch(`${API}/bench/update_modelos_comerciales_masivo`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(processedRows)
                });

                const responseData = await res.json();

                if (res.ok) {
                    enqueueSnackbar(responseData.message || "Actualización masiva exitosa", { variant: "success" });

                    if (responseData.duplicados?.length > 0) {
                        enqueueSnackbar(`${responseData.duplicados.length} duplicado(s) omitido(s)`, { variant: "warning" });
                    }

                    if (responseData.errores?.length > 0) {
                        enqueueSnackbar(`${responseData.errores.length} fila(s) con error`, { variant: "error" });
                    }

                    fetchModeloComercial();
                } else {
                    enqueueSnackbar(responseData.error || "Error en la actualización", { variant: "error" });
                }

            } catch (error) {
                enqueueSnackbar("Error inesperado durante la carga", { variant: "error" });
            } finally {
                setLoadingGlobal(false);
            }
        };

        reader.readAsBinaryString(file);
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
            nombre_marca: row.nombre_marca,
            codigo_modelo_homologado: homologado?.codigo_modelo_homologado || '',
            nombre_modelo: row.nombre_modelo,
            anio_modelo: row.anio_modelo,
            estado_modelo: row.estado_modelo === 1 ? 'ACTIVO' : 'INACTIVO'
        });

        setSelectedHomologado(homologado || null);
        setEstadoModelo(row.estado_modelo === 1 ? 'ACTIVO' : 'INACTIVO');
        setDialogOpen(true);
    };

    const fetchModeloComercial = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_comerciales`, {
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
                enqueueSnackbar(data.error || "Error al obtener datos de Modelos comerciales", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const fetchMarcas = async () => {
        try {
            const res = await fetch(`${API}/bench/get_marca`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();

            if (res.ok && Array.isArray(data)) {
                const marcasActivas = data.filter(marca => marca.estado_marca === 1);
                setMarcasActivas(marcasActivas);
                setMarcas(data);
            } else {
                enqueueSnackbar('Error al obtener marcas', { variant: 'error' });
            }
        } catch (err) {
            enqueueSnackbar('Error cargando marcas', { variant: 'error' });
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
                await fetchMarcas();
                await fetchHomologados();
                await fetchModeloComercial();

            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };
        cargarDatos();
    }, []);

    const columns = [
        { name: 'codigo_modelo_comercial', label: 'Código' },
        {
            name: 'nombre_marca',
            label: 'Marca',
            options: {
                customBodyRender: (value) => {
                    const marca = marcas.find(m => m.codigo_marca === value);
                    return marca ? marca.nombre_marca : value;
                }
            }
        },
        { name: 'nombre_modelo_homologado', label: 'Modelo Homologado' },
        { name: 'nombre_modelo', label: 'Modelo Comercial' },
        { name: 'anio_modelo', label: 'Año' },
        {
            name: "estado_modelo",
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
       // { name: 'usuario_crea', label: 'Usuario Crea' },
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
            <Box>
                <Button onClick={() => {
                    setSelectedItem(null);
                    setForm({
                        nombre_marca: '',
                        codigo_modelo_homologado: '',
                        nombre_modelo: '',
                        anio_modelo: '',
                        estado_modelo: ''
                    });
                    setSelectedHomologado(null);
                    setEstadoModelo('');
                    setDialogOpen(true);
                } }
                        style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Insertar Nuevo</Button>
                <Button variant="contained" component="label" style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>
                    Cargar Excel
                    <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
                </Button>
                <Button
                    variant="contained"
                    component="label"
                    style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}
                >
                    ACTUALIZAR MASIVO
                    <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcelUpdate} />
                </Button>
                <IconButton onClick={fetchModeloComercial} style={{ color: 'firebrick' }}>
                    <RefreshIcon />
                </IconButton>
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
                                freeSolo
                                options={marcasActivas.map(m => m.nombre_marca)}
                                value={form.nombre_marca || ''}
                                onInputChange={(e, v) => handleChange('nombre_marca', v)}
                                renderInput={(params) => <TextField {...params} label="Marca" />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={homologados}
                                getOptionLabel={(option) =>
                                    `${option?.nombre_modelo_sri ?? ''} (${option?.anio_modelo_sri ?? ''})`
                                }
                                value={selectedHomologado}
                                onChange={(e, v) => {
                                    handleChange('codigo_modelo_homologado', v ? v.codigo_modelo_homologado : '');
                                    setSelectedHomologado(v);
                                }}
                                renderInput={(params) => <TextField {...params} label="Modelo Homologado" />}
                            />
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Nombre Modelo Comercial" value={form.nombre_modelo || ''} onChange={(e) => handleChange('nombre_modelo', e.target.value.toUpperCase())} /></Grid>
                        <Grid item xs={3}><TextField fullWidth label="Año" type="number" value={form.anio_modelo || ''} onChange={(e) => handleChange('anio_modelo', e.target.value)} /></Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel id="estado-modelo-label">Estado</InputLabel>
                                <Select
                                    labelId="estado-modelo-label"
                                    value={estadoModelo}
                                    onChange={(e) => setEstadoModelo(e.target.value.toUpperCase())}
                                 variant="outlined">
                                    <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                    <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleInsert} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}</Button>
                </DialogActions>
            </Dialog>
        </div>
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatModeloComercial />
        </SnackbarProvider>
    );
}