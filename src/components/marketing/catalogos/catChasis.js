import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import GlobalLoading from "../selectoresDialog/GlobalLoading";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Stack from "@mui/material/Stack";
import {getTableOptions, getMuiTheme } from "../muiTableConfig";


const API = process.env.REACT_APP_API;

function CatChasis() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [arosDel, setArosDel] = useState('');
    const [arosPost, setArosPost] = useState('');
    const [suspDel, setSuspDel] = useState('');
    const [suspPost, setSuspPost] = useState('');
    const [frenoDel, setFrenoDel] = useState('');
    const [frenoPost, setFrenoPost] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedChasis, setSelectedChasis] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [neuDel, setNeuDel] = useState('');
    const [neuPost, setNeuPost] = useState('');
    const [errorNeuDel, setErrorNeuDel] = useState(false);
    const [errorNeuPost, setErrorNeuPost] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    const handleInsertChasis = async () => {
        const url = selectedChasis && selectedChasis.codigo_chasis
            ? `${API}/bench/update_chasis/${selectedChasis.codigo_chasis}`
            : `${API}/bench/insert_chasis`;

        const method = selectedChasis && selectedChasis.codigo_chasis ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    aros_rueda_delantera: arosDel,
                    aros_rueda_posterior: arosPost,
                    neumatico_delantero: neuDel,
                    neumatico_trasero: neuPost,
                    suspension_delantera: suspDel,
                    suspension_trasera: suspPost,
                    frenos_delanteros: frenoDel,
                    frenos_traseros: frenoPost
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchChasisData();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: "error" });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Error inesperado", { variant: "error" });
        }
    };

    const formatoNeumaticoValido = (valor) => {
        const regex = /^\d{2,3}\/\d{2,3}-\d{2,3}$/;
        return regex.test(valor.trim());
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
        fetchChasisData();

    }, [])

    const sanitizeChasis = (item) => {
        const reemplazo = (val) =>
            val === null || val === undefined || val === '' ? 'N/A' : val;

        return {
            ...item,
            aros_rueda_delantera: reemplazo(item.aros_rueda_delantera),
            aros_rueda_posterior: reemplazo(item.aros_rueda_posterior),
            neumatico_delantero: reemplazo(item.neumatico_delantero),
            neumatico_trasero: reemplazo(item.neumatico_trasero),
            suspension_delantera: reemplazo(item.suspension_delantera),
            suspension_trasera: reemplazo(item.suspension_trasera),
            frenos_delanteros: reemplazo(item.frenos_delanteros),
            frenos_traseros: reemplazo(item.frenos_traseros),
        };
    };

    const fetchChasisData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_chasis`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                const dataSanitizada = data.map(sanitizeChasis);
                setCabeceras(dataSanitizada);
            } else {
                enqueueSnackbar(data.error || "Error al obtener data de chasis", { variant: "error" });
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
                const res = await fetch(`${API}/bench/insert_chasis`, {
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
                    fetchChasisData();
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
                const clave = `${row.aros_rueda_delantera}_${row.aros_rueda_posterior}_
                ${row.neumatico_delantero}_${row.neumatico_trasero}_${row.suspension_delantera}_
                ${row.suspension_trasera}_${row.frenos_delanteros}_${row.frenos_traseros}`;
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
                const res = await fetch(`${API}/bench/update_chasis_masivo`, {
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
                    fetchChasisData();
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

    const camposPlantillaModelo = [
        "codigo_chasis", "aros_rueda_delantera",
        "aros_rueda_posterior", "neumatico_delantero",
        "neumatico_trasero", "suspension_delantera",
        "suspension_trasera", "frenos_delanteros",
        "frenos_traseros"
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_chasis.xlsx");

    const columns = [
        { name: "codigo_chasis", label: "Código Chasis" },
        { name: "aros_rueda_posterior", label: "Aros Rueda Posterior" },
        { name: "aros_rueda_delantera", label: "Aros Rueda Delantera" },
        { name: "neumatico_delantero", label: "Neumático Delantero" },
        { name: "neumatico_trasero", label: "Neumático Trasero" },
        { name: "suspension_delantera", label: "Suspensión Delantera" },
        { name: "suspension_trasera", label: "Suspensión Trasera" },
        { name: "frenos_delanteros", label: "Frenos Delanteros" },
        { name: "frenos_traseros", label: "Frenos Traseros" },
       // { name: "usuario_crea", label: "Usuario Crea" },
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
        setSelectedChasis(rowData);
        setArosDel(rowData.aros_rueda_delantera || '');
        setArosPost(rowData.aros_rueda_posterior || '');
        setNeuDel(rowData.neumatico_delantero || '');
        setNeuPost(rowData.neumatico_trasero || '');
        setSuspDel(rowData.suspension_delantera || '');
        setSuspPost(rowData.suspension_trasera || '');
        setFrenoDel(rowData.frenos_delanteros || '');
        setFrenoPost(rowData.frenos_traseros || '');
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
                                setSelectedChasis(null);
                                setArosDel('');
                                setArosPost('');
                                setNeuDel('');
                                setNeuPost('');
                                setSuspDel('');
                                setSuspPost('');
                                setFrenoDel('');
                                setFrenoPost('');
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
                        <IconButton onClick={fetchChasisData} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={tableOptions} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedChasis ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Aros Rueda Delantera" value={arosDel} onChange={(e) => setArosDel(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Aros Rueda Posterior" value={arosPost} onChange={(e) => setArosPost(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Neumático Delantero"
                                    value={neuDel}
                                    error={errorNeuDel}
                                    helperText={errorNeuDel ? "Formato inválido. Usa 90/90-19" : ""}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        setNeuDel(val);
                                        setErrorNeuDel(val && !formatoNeumaticoValido(val));
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Neumático Trasero"
                                    value={neuPost}
                                    error={errorNeuPost}
                                    helperText={errorNeuPost ? "Formato inválido. Usa 110/90-17" : ""}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        setNeuPost(val);
                                        setErrorNeuPost(val && !formatoNeumaticoValido(val));
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Suspensión Delantera" value={suspDel} onChange={(e) => setSuspDel(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Suspensión Trasera" value={suspPost} onChange={(e) => setSuspPost(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Frenos Delanteros" value={frenoDel} onChange={(e) => setFrenoDel(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Frenos Traseros" value={frenoPost} onChange={(e) => setFrenoPost(e.target.value.toUpperCase())} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertChasis} variant="contained"
                                style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedChasis ? 'Actualizar' : 'Guardar'}
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
            <CatChasis />
        </SnackbarProvider>
    );
}