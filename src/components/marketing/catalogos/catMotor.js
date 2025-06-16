import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import { IconButton, TextField, Autocomplete } from '@mui/material';
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

function CatMotor() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [tiposMotor, setTiposMotor] = useState([]);
    const [cabeceras, setCabeceras] = useState([]);
    const [selectedMotor, setSelectedMotor] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);

    const [form, setForm] = useState({
        codigo_tipo_motor: null,
        tipo_motor_nombre: '',
        nombre_motor: '',
        cilindrada: '',
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

    const openEditDialog = (rowData) => {
        setSelectedMotor(rowData);
        setForm({
            codigo_tipo_motor: rowData.codigo_tipo_motor,
            tipo_motor_nombre: rowData.nombre_tipo_motor,
            nombre_motor: rowData.nombre_motor,
            cilindrada: rowData.cilindrada,
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

    useEffect(() => {
        getMenus();
        fetchTiposMotor();
        fetchMotoresData();

    }, [])

    const columns = [
       // { name: 'codigo_motor', label: 'Código' },
        { name: "nombre_tipo_motor", label: "Tipo de Motor" },
        { name: 'nombre_motor', label: 'Nombre Motor' },
        { name: 'cilindrada', label: 'Cilindrada' },
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

    const options = {
        responsive: 'standard',
        selectableRows: 'none',
        textLabels: {
            body: { noMatch: "Lo siento, no se encontraron registros", toolTip: "Ordenar" },
            pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" }
        }
    };

    const getMuiTheme = () => createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: { padding: 2, borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '14px' },
                    head: { backgroundColor: 'firebrick', color: '#fff', fontWeight: 'bold', fontSize: '12px' }
                }
            }
        }
    });

    return (
        <>{loading ? <LoadingCircle /> : (
            <div style={{ marginTop: '150px', width: "100%" }}>
                <Navbar0 menus={menus} />
                <Box>
                    <ButtonGroup variant="text">
                        <Button onClick={() => navigate('/dashboard')}>Módulos</Button>
                        <Button onClick={() => navigate(-1)}>Catálogos</Button>
                    </ButtonGroup>
                </Box>
                <Box>
                    <Button onClick={() => { setSelectedMotor(null); setForm({}); setDialogOpen(true); }} style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}>Insertar Motor</Button>
                    <Button onClick={fetchMotoresData} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar Motor</Button>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedMotor ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Autocomplete
                                freeSolo
                                options={tiposMotor.map((item) => item.nombre_tipo)}
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
                            <Grid item xs={6}><TextField fullWidth label="Cilindrada" value={form.cilindrada || ''} onChange={(e) => handleChange('cilindrada', e.target.value.toUpperCase())} /></Grid>
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
                        <Button variant="contained" component="label" style={{ backgroundColor: 'firebrick', color: 'white' }}>
                            Cargar Excel
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
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
            <CatMotor />
        </SnackbarProvider>
    );
}
