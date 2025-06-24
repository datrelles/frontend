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

function CatElectronica() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [capCombustible, setCapCombustible] = useState('');
    const [tablero, setTablero] = useState('');
    const [lucesDelanteras, setLucesDelanteras] = useState('');
    const [lucesPosteriores, setLucesPosteriores] = useState('');
    const [garantia, setGarantia] = useState('');
    const [velocidad_maxima, setVelocidadMaxima] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedElectronica, setSelectedElectronica] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    const handleInsertElectronica = async () => {
        const url = selectedElectronica && selectedElectronica.codigo_electronica
            ? `${API}/bench/update_electronica/${selectedElectronica.codigo_electronica}`
            : `${API}/bench/insert_electronica_otros`;

        const method = selectedElectronica && selectedElectronica.codigo_electronica ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    capacidad_combustible: capCombustible,
                    tablero: tablero,
                    luces_delanteras: lucesDelanteras,
                    luces_posteriores: lucesPosteriores,
                    garantia: garantia,
                    velocidad_maxima: velocidad_maxima
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchElectronicaData();
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
        fetchElectronicaData();

    }, [])

    const sanitizeElectronica = (item) => {
        const reemplazo = (val) =>
            val === null || val === undefined || val === '' ? 'N/A' : val;

        return {
            ...item,
            capacidad_combustible: reemplazo(item.capacidad_combustible),
            tablero: reemplazo(item.tablero),
            luces_delanteras: reemplazo(item.luces_delanteras),
            luces_posteriores: reemplazo(item.luces_posteriores),
            garantia: reemplazo(item.garantia),
            velocidad_maxima: reemplazo(item.velocidad_maxima),
        };
    };

    const fetchElectronicaData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_electronica`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                const dataSanitizada = data.map(sanitizeElectronica);
                setCabeceras(dataSanitizada);
            } else {
                enqueueSnackbar(data.error || "Error al obtener data de electrónica", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const columns = [
        { name: "codigo_electronica", label: "Código" },
        { name: "velocidad_maxima", label: "Velocidad maxima" },
        { name: "capacidad_combustible", label: "Capacidad combustible" },
        { name: "tablero", label: "Tablero" },
        { name: "luces_delanteras", label: "Luces delanteras" },
        { name: "luces_posteriores", label: "Luces posteriores" },
        { name: "garantia", label: "Garantía" },
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

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            try {
                const res = await fetch(`${API}/bench/insert_electronica_otros`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(rows)
                });

                const responseData = await res.json();

                if (res.ok) {
                    enqueueSnackbar(responseData.message, { variant: "success" });

                    if (responseData.omitidos > 0) {
                        enqueueSnackbar(`${responseData.omitidos} registro(s) duplicado(s) fueron omitidos.`, { variant: "warning" });
                    }

                    fetchElectronicaData();
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
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

            const combinaciones = new Map();
            const duplicados = [];

            rows.forEach((row, index) => {
                const clave = `${row.velocidad_maxima}_${row.capacidad_combustible}_${row.tablero}_${row.luces_delanteras}_${row.luces_posteriores}_${row.garantia}`;
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
                const res = await fetch(`${API}/bench/update_electronica_masivo`, {
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
                    fetchElectronicaData();
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
        setSelectedElectronica(rowData);
        setCapCombustible(rowData.capacidad_combustible || '');
        setTablero(rowData.tablero || '');
        setLucesDelanteras(rowData.luces_delanteras || '');
        setLucesPosteriores(rowData.luces_posteriores || '');
        setGarantia(rowData.garantia || '');
        setVelocidadMaxima(rowData.velocidad_maxima || '');
        setDialogOpen(true);
    };

    const camposPlantillaModelo = [
        "codigo_electronica", "velocidad_maxima",
        "capacidad_combustible", "tablero",
        "luces_delanteras", "luces_posteriores",
        "garantia"


    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_electronica.xlsx");



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
                                setSelectedElectronica(null);
                                setCapCombustible('');
                                setTablero('');
                                setLucesDelanteras('');
                                setLucesPosteriores('');
                                setGarantia('');
                                setVelocidadMaxima('');
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
                        <IconButton onClick={fetchElectronicaData} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={tableOptions} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedElectronica ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Capacidad combustible" value={capCombustible} onChange={(e) => setCapCombustible(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Tablero" value={tablero} onChange={(e) => setTablero(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Luces delanteras" value={lucesDelanteras} onChange={(e) => setLucesDelanteras(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Luces posteriores" value={lucesPosteriores} onChange={(e) => setLucesPosteriores(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Garantía" value={garantia} onChange={(e) => setGarantia(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Velocidad Máxima" value={velocidad_maxima} onChange={(e) => setVelocidadMaxima(e.target.value.toUpperCase())} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertElectronica} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedElectronica ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatElectronica />
        </SnackbarProvider>
    );
}