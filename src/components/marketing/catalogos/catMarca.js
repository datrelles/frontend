import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import {FormControl, IconButton, InputLabel, MenuItem, Select, TextField} from '@mui/material';
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
import AddIcon from "@material-ui/icons/Add";
import Stack from "@mui/material/Stack";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {getTableOptions, getMuiTheme } from "../muiTableConfig";
import {ThemeProvider} from "@mui/material/styles";

const API = process.env.REACT_APP_API;

function CatMarca() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [nombreMarca, setnombreMarca] = useState('');
    const [estadoMarca, setestadoMarca] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedMarca, setSelectedMarca] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleInsertMarca = async () => {
        const url = selectedMarca && selectedMarca.codigo_marca
            ? `${API}/bench/update_marca/${selectedMarca.codigo_marca}`
            : `${API}/bench/insert_marca`;

        const method = selectedMarca && selectedMarca.codigo_marca ? "PUT" : "POST";
        const estadoNumerico = estadoMarca === "ACTIVO" ? 1 : 0;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    nombre_marca: nombreMarca,
                    estado_marca: estadoNumerico
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchMarcaData();
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
        fetchMarcaData();
    }, [])

    const fetchMarcaData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_marca`, {
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
                enqueueSnackbar(data.error || "Error al obtener marcas", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const columns = [
        { name: "codigo_marca", label: "Código" },
        { name: "nombre_marca", label: "Nombre marca" },
        {
            name: "estado_marca",
            label: "Estado",
            options: {
                customBodyRender: (value) => (
                    <div
                        style={{
                            backgroundColor: value === 1 ? 'green' : 'red',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            display: 'inline-block',
                            textAlign: 'center',
                            minWidth: '70px'
                        }}
                    >
                        {value === 1 ? "ACTIVO" : "INACTIVO"}
                    </div>
                )
            }
        },
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
                const res = await fetch(`${API}/bench/insert_marca`, {
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
                    fetchMarcaData();
                } else {
                    enqueueSnackbar(responseData.error || "Error al cargar", { variant: "error" });
                }
            } catch (error) {
                enqueueSnackbar("Error inesperado", { variant: "error" });
            }
        };

        reader.readAsBinaryString(file);
    };

    const openEditDialog = (rowData) => {
        setSelectedMarca(rowData);
        setnombreMarca(rowData.nombre_marca || '');
        setestadoMarca(rowData.estado_marca === 1 ? "ACTIVO" : "INACTIVO");
        setDialogOpen(true);
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
                                setSelectedMarca(null);
                                setnombreMarca('');
                                setestadoMarca('');
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
                        <IconButton onClick={fetchMarcaData} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={getTableOptions()} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedMarca ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth label="Nombre marca"
                                    value={nombreMarca}
                                    onChange={(e) => setnombreMarca(e.target.value.toUpperCase())}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
                                    <InputLabel id="estado-marca-label">Estado</InputLabel>
                                    <Select
                                        labelId="estado-marca-label"
                                        value={estadoMarca}
                                        label="Estado"
                                        onChange={(e) => setestadoMarca(e.target.value)}
                                     variant="outlined">
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertMarca} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedMarca ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )}</>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatMarca/>
        </SnackbarProvider>
    );
}