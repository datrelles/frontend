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

function CatElectronica() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const classes = useStyles();
    const [capCombustible, setCapCombustible] = useState('');
    const [tablero, setTablero] = useState('');
    const [lucesDelanteras, setLucesDelanteras] = useState('');
    const [lucesPosteriores, setLucesPosteriores] = useState('');
    const [garantia, setGarantia] = useState('');
    const [velocidad_maxima, setVelocidadMaxima] = useState('');

    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedElectronica, setSelectedElectronica] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
        const init = async () => {

            await getMenus();
            await fetchElectronicaData();
        };
        init();
    }, []);

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
                setCabeceras(data); // <- carga los datos en la tabla
            } else {
                enqueueSnackbar(data.error || "Error al obtener data de electrónica", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const columns = [
        { name: "codigo_electronica", label: "Código" },
        { name: "capacidad_combustible", label: "Capacidad combustible" },
        { name: "tablero", label: "Tablero" },
        { name: "luces_delanteras", label: "Luces delanteras" },
        { name: "luces_posteriores", label: "Luces posteriores" },
        { name: "garantia", label: "Garantía" },
        { name: "velocidad_maxima", label: "Velocidad maxima" },
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
        setSelectedElectronica(rowData);
        setCapCombustible(rowData.capacidad_combustible || '');
        setTablero(rowData.tablero || '');
        setLucesDelanteras(rowData.luces_delanteras || '');
        setLucesDelanteras(rowData.luces_posteriores || '');
        setGarantia(rowData.garantia || '');
        setVelocidadMaxima(rowData.velocidad_maxima || '');
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
                            setSelectedElectronica(null);
                            setCapCombustible('');
                            setTablero('');
                            setLucesDelanteras('');
                            setLucesPosteriores('');
                            setGarantia('');
                            setVelocidadMaxima('');
                            setDialogOpen(true);
                        }}
                        style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}
                    >
                        Insertar Chasis
                    </Button>

                    <Button onClick={fetchElectronicaData} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar Dimensiones</Button>
                </Box>

                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedElectronica ? 'Actualizar Chasis' : 'Nuevo Chasis'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Capacidad combustible" value={capCombustible} onChange={(e) => setCapCombustible(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Tablero" value={tablero} onChange={(e) => setTablero(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Luces delanteras" value={lucesDelanteras} onChange={(e) => setLucesDelanteras(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Luces posteriores" value={lucesPosteriores} onChange={(e) => setLucesPosteriores(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Garantía" value={garantia} onChange={(e) => setGarantia(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Velocidad Máxima" value={velocidad_maxima} onChange={(e) => setVelocidadMaxima(e.target.value)} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertElectronica} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedElectronica ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}</>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatElectronica />
        </SnackbarProvider>
    );
}
