import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import Grid from '@mui/material/Grid';
import {IconButton, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import {SnackbarProvider, useSnackbar} from 'notistack';
import { useAuthContext } from "../../../context/authContext";
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import * as XLSX from "xlsx";
import RefreshIcon from '@mui/icons-material/Refresh';
import GlobalLoading from "../selectoresDialog/GlobalLoading";
import AddIcon from "@material-ui/icons/Add";
import Stack from "@mui/material/Stack";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {getTableOptions, getMuiTheme } from "../muiTableConfig";
import {ThemeProvider} from "@mui/material/styles";

const API = process.env.REACT_APP_API;

function CatDimensionesPeso() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [alturaTotal, setAlturaTotal] = useState('');
    const [longTotal, setLongTotal] = useState('');
    const [anchoTotal, setAnchoTotal] = useState('');
    const [pesoSeco, setPesoSeco] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedDimensiones, setSelectedDimensiones] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    const handleInsertDimensionesPeso = async () => {
        const url = selectedDimensiones && selectedDimensiones.codigo_dim_peso
            ? `${API}/bench/update_dimensiones/${selectedDimensiones.codigo_dim_peso}`
            : `${API}/bench/insert_dimension`;

        const method = selectedDimensiones && selectedDimensiones.codigo_dim_peso ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    altura_total: alturaTotal,
                    longitud_total: longTotal,
                    ancho_total: anchoTotal,
                    peso_seco: pesoSeco
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchDimensionesData();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: "error" });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Error inesperado", { variant: "error" });
        }
    };

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`,
                {
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
        getMenus();
        fetchDimensionesData();

    }, [])

    const sanitizeDimensiones = (item) => {
        const reemplazo = (val) =>
            val === null || val === undefined || val === '' ? 'N/A' : val;

        return {
            ...item,
            altura_total: reemplazo(item.altura_total),
            longitud_total: reemplazo(item.longitud_total),
            ancho_total: reemplazo(item.ancho_total),
            peso_seco: reemplazo(item.peso_seco),
        };
    };

    const fetchDimensionesData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_dimensiones`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                const dataSanitizada = data.map(sanitizeDimensiones);
                setCabeceras(dataSanitizada);
            } else {
                enqueueSnackbar(data.error || "Error al obtener data de dimensiones", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
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
                const res = await fetch(`${API}/bench/insert_dimension`, {
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
                    fetchDimensionesData();
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
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

            const combinaciones = new Map();
            const duplicados = [];

            rows.forEach((row, index) => {
                const clave = `${row.altura_total}_${row.longitud_total}_${row.ancho_total}_${row.peso_seco}`;
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
                const res = await fetch(`${API}/bench/update_dimemsiones_masivo`, {
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
                    fetchDimensionesData();
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
        { name: "codigo_dim_peso", label: "Código" },
        { name: "peso_seco", label: "Peso Seco" },
        { name: "altura_total", label: "Altura total" },
        { name: "longitud_total", label: "Longitud total" },
        { name: "ancho_total", label: "Ancho total" },
        //{ name: "usuario_crea", label: "Usuario Crea" },
        { name: "fecha_creacion", label: "Fecha Creación" },
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

    const openEditDialog = (rowData) => {
        setSelectedDimensiones(rowData);
        setAlturaTotal(rowData.altura_total || '');
        setLongTotal(rowData.longitud_total || '');
        setAnchoTotal(rowData.ancho_total || '');
        setPesoSeco(rowData.peso_seco || '');
        setDialogOpen(true);
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
                                setSelectedDimensiones(null);
                                setAlturaTotal('');
                                setLongTotal('');
                                setAnchoTotal('');
                                setPesoSeco('');
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
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<EditIcon />}
                            sx={{ textTransform: 'none', fontWeight: 600,backgroundColor: 'littleseashell' }}
                        >Actualizar Masivo
                            <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcelUpdate} />
                        </Button>
                        <IconButton onClick={fetchDimensionesData} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={getTableOptions()} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedDimensiones ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Altura Total" value={alturaTotal} onChange={(e) => setAlturaTotal(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Longitud Total" value={longTotal} onChange={(e) => setLongTotal(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Ancho Total" value={anchoTotal} onChange={(e) => setAnchoTotal(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Peso Seco" value={pesoSeco} onChange={(e) => setPesoSeco(e.target.value)} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertDimensionesPeso} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedDimensiones ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatDimensionesPeso />
        </SnackbarProvider>
    );
}