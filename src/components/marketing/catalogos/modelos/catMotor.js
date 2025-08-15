import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../../Navbar0";
import MUIDataTable from "mui-datatables";
import {ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {IconButton, TextField, Autocomplete} from '@mui/material';
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

function CatMotor() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [tiposMotor, setTiposMotor] = useState([]);
    const [cabeceras, setCabeceras] = useState([]);
    const [selectedMotor, setSelectedMotor] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    const [form, setForm] = useState({
        codigo_tipo_motor: null,
        tipo_motor_nombre: '',
        nombre_motor: '',
        cilindrada: '',
        cilindrada_comercial: '',
        caballos_fuerza: '',
        torque_maximo: '',
        sistema_combustible: '',
        arranque: '',
        sistema_refrigeracion: '',
        descripcion_motor: ''
    });

    const handleChange = (field, value) => setForm({ ...form, [field]: value });

    const handleInsertMotor = async () => {
        let tipoMotor = tiposMotor.find((t) => t.nombre_tipo.trim().toLowerCase() === form.tipo_motor_nombre.trim().toLowerCase());

        // Si no existe, lo crea
        if (!tipoMotor) {
            try {
                const tipoMotorRes = await fetch(`${API}/bench/insert_tipo_motor`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt
                    },
                    body: JSON.stringify({
                        nombre_tipo: form.tipo_motor_nombre,
                        descripcion_tipo_motor: form.descripcion_tipo_motor || "Ingresado desde formulario"
                    })
                });

                const tipoMotorData = await tipoMotorRes.json();

                if (!tipoMotorRes.ok) {
                    // Si el error es por duplicado, intentar recuperar el tipo desde la API
                    if (tipoMotorData.error?.includes('unique constraint')) {
                        const lista = await fetch(`${API}/bench/get_tipos_motor`, {
                            headers: {
                                "Authorization": "Bearer " + jwt
                            }
                        });
                        const tipos = await lista.json();
                        const existente = tipos.find(t => t.nombre_tipo.trim().toLowerCase() === form.tipo_motor_nombre.trim().toLowerCase());
                        if (existente) {
                            form.codigo_tipo_motor = existente.codigo_tipo_motor;
                        } else {
                            enqueueSnackbar('Error encontrando tipo de motor existente', { variant: 'error' });
                            return;
                        }
                    } else {
                        enqueueSnackbar(tipoMotorData.error || 'Error creando tipo de motor', { variant: 'error' });
                        return;
                    }
                }

            } catch (err) {
                enqueueSnackbar('Error al crear tipo de motor', { variant: 'error' });
                return;
            }
        } else {
            form.codigo_tipo_motor = tipoMotor.codigo_tipo_motor;
        }

        const isUpdate = selectedMotor && selectedMotor.codigo_motor;
        const url = isUpdate ?
            `${API}/bench/update_motor/${selectedMotor.codigo_motor}` :
            `${API}/bench/insert_motor`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!data.error) {
                enqueueSnackbar(data.message || 'Operación exitosa', { variant: 'success' });
                fetchMotoresData();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || 'Error al guardar', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Error inesperado', { variant: 'error' });
        }
    };

    const fetchTiposMotor = async () => {
        try {
            const res = await fetch(`${API}/bench/get_tipo_motor`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setTiposMotor(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando tipos de motor', { variant: 'error' });
        }
    };

    const fetchMotoresData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_motores`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setCabeceras(data);
        } catch (err) {
            enqueueSnackbar('Error cargando motores', { variant: 'error' });
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

            try {
                const res = await fetch(`${API}/bench/insert_motor`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify({ motor: rows })
                });

                const responseData = await res.json();

                if (res.ok) {
                    enqueueSnackbar(responseData.message, { variant: "success" });

                    if (responseData.omitidos > 0) {
                        enqueueSnackbar(`${responseData.omitidos} registro(s) duplicado(s) fueron omitidos.`, { variant: "warning" });
                    }
                    fetchMotoresData();
                } else {
                    enqueueSnackbar(responseData.error || "Error al cargar registros", { variant: "error" });
                }

            } catch (error) {
                enqueueSnackbar("Error inesperado durante la carga del archivo", { variant: "error" });
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
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

            const duplicados = [];
            const combinaciones = new Map();
            rows.forEach((row, index) => {
                const clave = `${row.nombre_motor}_${row.cilindrada}_${row.cilindrada_comercial}_
                ${row.caballos_fuerza}_${row.torque_maximo}_${row.sistema_combustible}_
                ${row.arranque}_${row.sistema_refrigeracion}`;
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

            try {
                const res = await fetch(`${API}/bench/update_motor_masivo`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(rows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Actualización exitosa", { variant: "success" });
                    fetchMotoresData();
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

    const openEditDialog = (rowData) => {
        setSelectedMotor(rowData);
        setForm({
            codigo_tipo_motor: rowData.codigo_tipo_motor,
            tipo_motor_nombre: rowData.nombre_tipo_motor,
            nombre_motor: rowData.nombre_motor,
            cilindrada: rowData.cilindrada,
            cilindrada_comercial: rowData.cilindrada_comercial,
            caballos_fuerza: rowData.caballos_fuerza,
            torque_maximo: rowData.torque_maximo,
            sistema_combustible: rowData.sistema_combustible,
            arranque: rowData.arranque,
            sistema_refrigeracion: rowData.sistema_refrigeracion,
            descripcion_motor: rowData.descripcion_motor
        });
        setDialogOpen(true);
    };

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`, {
                headers: { 'Authorization': 'Bearer ' + jwt }
            });
            const data = await res.json();
            setMenus(data);
        } catch (err) {
            toast.error('Error cargando menús');
        }
    };
    const camposPlantillaModelo = [
        "codigo_motor", "nombre_tipo_motor",
        "nombre_motor", "cilindrada", "cilindrada_comercial",
        "caballos_fuerza","torque_maximo",
        "sistema_combustible","arranque",
        "sistema_refrigeracion","descripcion_motor"
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_motor.xlsx");

    useEffect(() => {
        getMenus();
        fetchTiposMotor();
        fetchMotoresData();

    }, [])

    const columns = [
        { name: 'codigo_motor', label: 'Código' },
        { name: "nombre_tipo_motor", label: "Tipo de Motor" },
        { name: 'nombre_motor', label: 'Nombre Motor' },
        { name: 'cilindrada', label: 'Cilindrada Técnica' },
        { name: 'cilindrada_comercial', label: 'Cilindrada Comercial' },
        { name: 'caballos_fuerza', label: 'Potencia' },
        { name: 'torque_maximo', label: 'Torque Máximo' },
        { name: 'sistema_combustible', label: 'Sistema de Combustible' },
        { name: 'arranque', label: 'Arranque' },
        { name: 'sistema_refrigeracion', label: 'Sistema de Refrigeración' },
        { name: 'descripcion_motor', label: 'Descripción' },
        //{ name: 'usuario_crea', label: 'Usuario Crea' },
        { name: 'fecha_creacion', label: 'Fecha Creación' },
        {
            name: 'acciones',
            label: 'Acciones',
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <IconButton onClick={() => openEditDialog(cabeceras[dataIndex])}><EditIcon /></IconButton>
                )
            }
        }
    ];

    return (
        <>
            <GlobalLoading open={loadingGlobal} />
            <div style={{ marginTop: '150px', width: '100%' }}>
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
                                setSelectedMotor(null);
                                setForm({});
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
                        <IconButton onClick={fetchMotoresData} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={tableOptions} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedMotor ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Autocomplete
                                freeSolo
                                options={tiposMotor.map((item) => item.nombre_tipo)}
                                sx={{ mt: 1 }}
                                value={form.tipo_motor_nombre || ''}
                                onInputChange={(e, newValue) => handleChange('tipo_motor_nombre', newValue?.toUpperCase() || '')}
                                renderInput={(params) => <TextField {...params} label="Tipo de Motor" />}
                            /></Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descripción del Tipo de Motor"
                                    value={form.descripcion_tipo_motor || ''}
                                    onChange={(e) => handleChange('descripcion_tipo_motor', e.target.value.toUpperCase())}
                                />
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Nombre Motor" value={form.nombre_motor || ''} onChange={(e) => handleChange('nombre_motor', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Cilindrada Técnica" value={form.cilindrada || ''} onChange={(e) => handleChange('cilindrada', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Cilindrada Comercial" value={form.cilindrada_comercial || ''} onChange={(e) => handleChange('cilindrada_comercial', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Potencia" value={form.caballos_fuerza || ''} onChange={(e) => handleChange('caballos_fuerza', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Torque Máximo" value={form.torque_maximo || ''} onChange={(e) => handleChange('torque_maximo', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Sistema de Combustible" value={form.sistema_combustible || ''} onChange={(e) => handleChange('sistema_combustible', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Arranque" value={form.arranque || ''} onChange={(e) => handleChange('arranque', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Sistema de Refrigeración" value={form.sistema_refrigeracion || ''} onChange={(e) => handleChange('sistema_refrigeracion', e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={12}><TextField fullWidth label="Descripción" value={form.descripcion_motor || ''} onChange={(e) => handleChange('descripcion_motor', e.target.value.toUpperCase())} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertMotor} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedMotor ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatMotor />
        </SnackbarProvider>
    );
}
