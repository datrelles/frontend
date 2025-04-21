import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
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

const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
});

function CatDimensionesPeso() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const classes = useStyles();
    const [alturaTotal, setAlturaTotal] = useState('');
    const [longTotal, setLongTotal] = useState('');
    const [anchoTotal, setAnchoTotal] = useState('');
    const [pesoSeco, setPesoSeco] = useState('');

    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedDimensiones, setSelectedDimensiones] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
        const init = async () => {

            await getMenus();
            await fetchDimensionesData();
        };
        init();
    }, []);

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
                setCabeceras(data); // <- carga los datos en la tabla
            } else {
                enqueueSnackbar(data.error || "Error al obtener data de dimensiones", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const columns = [
        { name: "codigo_dim_peso", label: "Código" },
        { name: "altura_total", label: "Altura total" },
        { name: "longitud_total", label: "Longitud total" },
        { name: "ancho_total", label: "Ancho total" },
        { name: "peso_seco", label: "Peso Seco" },
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
        setSelectedDimensiones(rowData);
        setAlturaTotal(rowData.altura_total || '');
        setLongTotal(rowData.longitud_total || '');
        setAnchoTotal(rowData.ancho_total || '');
        setPesoSeco(rowData.peso_seco || '');
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
                            setSelectedDimensiones(null);
                            setAlturaTotal('');
                            setLongTotal('');
                            setAnchoTotal('');
                            setPesoSeco('');
                            setDialogOpen(true);
                        }}
                        style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}
                    >
                        Insertar Chasis
                    </Button>

                    <Button onClick={fetchDimensionesData} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar Dimensiones</Button>
                </Box>

                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedDimensiones ? 'Actualizar Chasis' : 'Nuevo Chasis'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Aros Rueda Delantera" value={alturaTotal} onChange={(e) => setAlturaTotal(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Aros Rueda Posterior" value={longTotal} onChange={(e) => setLongTotal(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Neumático Delantero" value={anchoTotal} onChange={(e) => setAnchoTotal(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Neumático Trasero" value={pesoSeco} onChange={(e) => setPesoSeco(e.target.value)} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertDimensionesPeso} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedDimensiones ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}</>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatDimensionesPeso />
        </SnackbarProvider>
    );
}
