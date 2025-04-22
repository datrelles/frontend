import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
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

const API = process.env.REACT_APP_API;

function CatChasis() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [arosDel, setArosDel] = useState('');
    const [arosPost, setArosPost] = useState('');
    const [neuDel, setNeuDel] = useState('');
    const [neuPost, setNeuPost] = useState('');
    const [suspDel, setSuspDel] = useState('');
    const [suspPost, setSuspPost] = useState('');
    const [frenoDel, setFrenoDel] = useState('');
    const [frenoPost, setFrenoPost] = useState('');
    const [loading] = useState(false);
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedChasis, setSelectedChasis] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
                setCabeceras(data); // <- carga los datos en la tabla
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
                const res = await fetch(`${API}/bench/insert_chasis_batch`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify({ chasis: rows })
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

    const columns = [
        { name: "codigo_chasis", label: "Código" },
        { name: "aros_rueda_posterior", label: "Aros Rueda Posterior" },
        { name: "aros_rueda_delantera", label: "Aros Rueda Delantera" },
        { name: "neumatico_delantero", label: "Neumático Delantero" },
        { name: "neumatico_trasero", label: "Neumático Trasero" },
        { name: "suspension_delantera", label: "Suspensión Delantera" },
        { name: "suspension_trasera", label: "Suspensión Trasera" },
        { name: "frenos_delanteros", label: "Frenos Delanteros" },
        { name: "frenos_traseros", label: "Frenos Traseros" },
        { name: "usuario_crea", label: "Usuario Crea" },
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
                    <Button
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
                        style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}
                    >
                        Insertar Nuevo
                    </Button>
                    <Button onClick={fetchChasisData} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar Chasis</Button>
                </Box>

                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedChasis ? 'Actualizar Chasis' : 'Nuevo Chasis'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Aros Rueda Delantera" value={arosDel} onChange={(e) => setArosDel(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Aros Rueda Posterior" value={arosPost} onChange={(e) => setArosPost(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Neumático Delantero" value={neuDel} onChange={(e) => setNeuDel(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Neumático Trasero" value={neuPost} onChange={(e) => setNeuPost(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Suspensión Delantera" value={suspDel} onChange={(e) => setSuspDel(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Suspensión Trasera" value={suspPost} onChange={(e) => setSuspPost(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Frenos Delanteros" value={frenoDel} onChange={(e) => setFrenoDel(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Frenos Traseros" value={frenoPost} onChange={(e) => setFrenoPost(e.target.value)} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertChasis} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedChasis ? 'Actualizar' : 'Guardar'}</Button>
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
            <CatChasis />
        </SnackbarProvider>
    );
}