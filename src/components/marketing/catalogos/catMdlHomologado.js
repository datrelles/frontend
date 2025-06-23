import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import {ThemeProvider } from '@mui/material/styles';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import * as XLSX from "xlsx";
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Stack from "@mui/material/Stack";
import {getTableOptions, getMuiTheme } from "../muiTableConfig";

const API = process.env.REACT_APP_API;

function CatModeloHomologado() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [cabeceras, setCabeceras] = useState([]);
    const [modeloSri, setModeloSri] = useState(null);
    const [modelosSri, setModelosSri] = useState([]);
    const [descripcionHomologacion, setDescripcionHomologacion] = useState('');
    const [selected, setSelected] = useState(null);
    const [modelosSriActivos, setModelosSriActivos] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);

    const fetchModelosHomologados = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_homologados`, {
                headers: { 'Authorization': 'Bearer ' + jwt }
            });
            const data = await res.json();
            if (res.ok) setCabeceras(data);
            else enqueueSnackbar(data.error || 'Error al listar', { variant: 'error' });
        } catch {
            enqueueSnackbar('Error de conexión', { variant: 'error' });
        }
    };

    const fetchModelosSri = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_sri`, {
                headers: { 'Authorization': 'Bearer ' + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                const modelosActivos = data.filter(modelo => modelo.estado_modelo === 1);
                setModelosSriActivos(modelosActivos);
                setModelosSri(data);
            } else {
                enqueueSnackbar(data.error || 'Error al obtener modelos SRI', { variant: 'error' });
            }
        } catch {
            enqueueSnackbar('Error conexión SRI', { variant: 'error' });
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
            enqueueSnackbar('Error cargando menús', { variant: 'error' });
        }
    };

    const handleInsert = async () => {
        if (!modeloSri || !modeloSri.codigo_modelo_sri) {
            enqueueSnackbar('Seleccione un Modelo SRI', { variant: 'error' });
            return;
        }

        const url = selected ?
            `${API}/bench/update_modelo_homologado/${selected.codigo_modelo_homologado}` :
            `${API}/bench/insert_modelo_homologado`;
        const method = selected ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    codigo_modelo_sri: modeloSri.codigo_modelo_sri,
                    descripcion_homologacion: descripcionHomologacion
                })
            });
            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || 'Guardado correctamente', { variant: 'success' });
                fetchModelosHomologados();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || 'Error al guardar', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Error de red', { variant: 'error' });
        }
    };

    const openEditDialog = (rowData) => {
        setSelected(rowData);
        setModeloSri(modelosSri.find(m => m.codigo_modelo_sri === rowData.codigo_modelo_sri) || null);
        setDescripcionHomologacion(rowData.descripcion_homologacion || '');
        setDialogOpen(true);
    };

    const columns = [
        { name: 'codigo_modelo_homologado', label: 'Código Homologado' },
        {
            name: 'codigo_modelo_sri',
            label: 'Nombre Modelo SRI',
            options: {
                customBodyRender: (value) => {
                    const modelo = modelosSri.find(m => m.codigo_modelo_sri === value);
                    return modelo ? modelo.nombre_modelo : value;
                }
            }
        },
        { name: 'anio_modelo_sri', label: 'Año Modelo' },
        { name: 'descripcion_homologacion', label: 'Descripción' },
        //{ name: 'usuario_crea', label: 'Usuario Crea' },
        { name: 'fecha_creacion', label: 'Fecha Creación' },
        {
            name: 'acciones',
            label: 'Acciones',
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <IconButton onClick={() => openEditDialog(cabeceras[dataIndex])}>
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    ];

    useEffect(() => {
        getMenus();
        fetchModelosSri();
        fetchModelosHomologados();
    }, []);

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const processedRows = rows.map(row => ({
                nombre_modelo_sri: (row.nombre_modelo_sri || "")
                    .normalize("NFKD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\u00A0/g, ' ')
                    .trim()
                    .toLowerCase(),
                descripcion_homologacion: (row.descripcion_homologacion || "").trim()
            }));

            try {
                const res = await fetch(`${API}/bench/insert_modelo_homologado`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(processedRows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Carga exitosa", { variant: "success" });
                    fetchModelosHomologados();
                } else {
                    enqueueSnackbar(responseData.error || "Error al cargar", { variant: "error" });
                }
            } catch (error) {
                enqueueSnackbar("Error inesperado", { variant: "error" });
            }
        };

        reader.readAsBinaryString(file);
    };

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
                                setSelected(null);
                                setModeloSri(null);
                                setDescripcionHomologacion('');
                                setDialogOpen(true);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600,backgroundColor: 'firebrick' }}
                        >Nuevo
                        </Button>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{ textTransform: 'none', fontWeight: 600,backgroundColor: 'green' }}
                        >Insertar Masivo
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
                        </Button>
                        <IconButton onClick={fetchModelosHomologados} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={getTableOptions()} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selected ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    fullWidth
                                    options={modelosSriActivos}
                                    getOptionLabel={(option) =>
                                        `${option?.nombre_modelo ?? ''} (${option?.anio_modelo ?? ''})`
                                    }
                                    value={modeloSri}
                                    onChange={(e, newValue) => setModeloSri(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Modelo SRI" />}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descripción Homologación"
                                    value={descripcionHomologacion}
                                    onChange={(e) => setDescripcionHomologacion(e.target.value.toUpperCase())}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button variant="contained" onClick={handleInsert} style={{ backgroundColor: 'firebrick', color: 'white' }}>
                            {selected ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}</>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatModeloHomologado />
        </SnackbarProvider>
    );
}