import MUIDataTable from "mui-datatables";
import {ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {Autocomplete, IconButton, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../../Navbar0";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useAuthContext } from "../../../../context/authContext";
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
import Stack from "@mui/material/Stack";
import {getTableOptions, getMuiTheme } from "../../muiTableConfig";
import GlobalLoading from "../../selectoresDialog/GlobalLoading";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from "xlsx";

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
    const [selectedHomologado, setSelectedHomologado] = useState(null);
    const [modelosSri, setModeloSri] = useState([]);
    const [modeloSriSeleccionado, setModeloSriSeleccionado] = useState('');
    const [modelosSriActivos, setModelosSriActivos] = useState(null);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

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

    const fetchModelosSri = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_sri`, {
                headers: { 'Authorization': 'Bearer ' + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                const modelosActivos = data.filter(modelo => modelo.estado_modelo === 1);
                setModelosSriActivos(modelosActivos);
                setModeloSri(data);
            } else {
                enqueueSnackbar(data.error || 'Error al obtener modelos SRI', { variant: 'error' });
            }
        } catch {
            enqueueSnackbar('Error conexión SRI', { variant: 'error' });
        }
    };

    const openEditDialog = (row) => {
        const homologado = homologados.find(
            h => Number(h.codigo_modelo_homologado) === Number(row.codigo_modelo_homologado)
        );

        if (!homologado) {
            enqueueSnackbar("Modelo homologado no encontrado en la lista", { variant: "error" });
        }
        setModeloSriSeleccionado(row.modelo_sri || '');

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

    const camposPlantillaModelo = [
        "codigo_matricula_marca", "nombre_modelo_sri",
        "placa", "fecha_matriculacion",
        "fecha_facturacion","detalle_matriculacion"
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_modelo_matriculacion.xlsx");

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

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            function excelSerialToDate(serial) {
                const excelEpoch = new Date(1899, 11, 30);
                return new Date(excelEpoch.getTime() + serial * 86400000);
            }

            rows.forEach(row => {
                if (typeof row.fecha_matriculacion === 'number') {
                    row.fecha_matriculacion = excelSerialToDate(row.fecha_matriculacion).toISOString().slice(0, 10);
                }
                if (typeof row.fecha_facturacion === 'number') {
                    row.fecha_facturacion = excelSerialToDate(row.fecha_facturacion).toISOString().slice(0, 10);
                }
            });

            try {
                const res = await fetch(`${API}/bench/insert_matriculacion_marca`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(rows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Carga exitosa", { variant: "success" });
                    fetchMatriculaMarca();
                } else {
                    enqueueSnackbar(responseData.error || "Error al cargar", { variant: "error" });
                }
            } catch (error) {
                enqueueSnackbar("Error inesperado", { variant: "error" });
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
                const clave = `${row.placa}_${row.fecha_matriculacion}_
                ${row.fecha_facturacion}_${row.detalle_matriculacion}_${row.codigo_modelo_homologado}`;
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
                const res = await fetch(`${API}/bench/update_matriculacion_marca_masiva`, {
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
                    fetchMatriculaMarca();
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

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchHomologados();
                await fetchMatriculaMarca();
                await fetchModelosSri();
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };
        cargarDatos();
    }, []);

    const columns = [
        { name: 'codigo_matricula_marca', label: 'Código' },
        {
            name: 'nombre_modelo_sri',
            label: 'Modelo',
            options: {
                customBodyRender: (value) => {
                    const modelo = modelosSri.find(m => m.codigo_modelo_sri === value);
                    return modelo ? modelo.nombre_modelo : value;
                }
            }
        },
        { name: 'placa', label: 'Número de Placa' },
        {
            name: 'fecha_matriculacion',
            label: 'Fecha Matriculación',
            options: {
                customBodyRender: (value) => value?.substring(0, 10) || ''
            }
        },
        {
            name: 'fecha_facturacion',
            label: 'Fecha Facturación',
            options: {
                customBodyRender: (value) => value?.substring(0, 10) || ''
            }
        },
        { name: 'detalle_matriculacion', label: 'DETALLE' },
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
                                    codigo_modelo_homologado: '',
                                    placa: '',
                                    fecha_matriculacion: '',
                                    fecha_facturacion: '',
                                    detalle_matriculacion: ''
                                });
                                setSelectedHomologado(null);
                                setDialogOpen(true);
                            } }
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
                        <IconButton onClick={fetchMatriculaMarca} style={{ color: 'firebrick' }}>
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
                                <Autocomplete
                                    options={homologados}
                                    getOptionLabel={(option) => option?.nombre_modelo_sri || ''}
                                    value={selectedHomologado}
                                    sx={{ mt: 1 }}
                                    onChange={(e, v) => {
                                        handleChange('codigo_modelo_homologado', v ? v.codigo_modelo_homologado : '');
                                        setSelectedHomologado(v);
                                    }}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.codigo_modelo_homologado}>
                                            {option.nombre_modelo_sri}
                                        </li>
                                    )}
                                    renderInput={(params) => <TextField {...params} label="Modelo Homologado" />}
                                />
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Número de Placa" value={form.placa || ''} onChange={(e) => handleChange('placa', e.target.value.toUpperCase())} /></Grid>
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
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    label="Detalle Matriculación"
                                    value={form.detalle_matriculacion || ''}
                                    onChange={(e) => handleChange('detalle_matriculacion', e.target.value.toUpperCase())}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsert} variant="contained"
                                style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatMatriculaMarca />
        </SnackbarProvider>
    );
}