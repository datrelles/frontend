import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import { Autocomplete, IconButton, TextField } from '@mui/material';
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
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as XLSX from "xlsx";

const API = process.env.REACT_APP_API;

function CatLinea() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [nombreLinea, setNombreLinea] = useState('');
    const [estadoLinea, setEstadoLinea] = useState('');
    const [descripcionLinea, setDescripcionLinea] = useState('');
    const [lineaPadreSeleccionada, setLineaPadreSeleccionada] = useState(null);
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedLinea, setSelectedLinea] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [lineasPadre, setLineasPadre] = useState([]);
    const [lineas, setLineas] = useState([]);
    const [lineaPadre, setLineaPadre] = useState('');


    const handleInsertLinea = async () => {
        const url = selectedLinea && selectedLinea.codigo_linea
            ? `${API}/bench/update_linea/${selectedLinea.codigo_linea}`
            : `${API}/bench/insert_linea`;

        const method = selectedLinea && selectedLinea.codigo_linea ? "PUT" : "POST";
        const estadoNumerico = estadoLinea === "ACTIVO" ? 1 : 0;

        const codigoPadre = lineaPadre && typeof lineaPadre === 'object'
            ? lineaPadre.codigo_linea
            : null;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    nombre_linea: nombreLinea,
                    estado_linea: estadoNumerico,
                    descripcion_linea: descripcionLinea,
                    codigo_linea_padre: codigoPadre
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchLineaData();
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

    useEffect(() => {
        getMenus();
        fetchLineaData();
    }, []);


    const fetchLineaData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_lineas`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setCabeceras(data);
                setLineasPadre(data);
                setLineas(data); 
            } else {
                enqueueSnackbar(data.error || "Error al obtener líneas", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const columns = [
        { name: "codigo_linea", label: "Código" },
        { name: "nombre_linea", label: "Línea" },
        {
            name: "nombre_linea_padre", label: "Línea Padre",
            options: {
                customBodyRender: (value) => value || "-"
            }
        },
        {
            name: "estado_linea",
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
        { name: "descripcion_linea", label: "Descripción" },
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

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const processedRows = rows.map(row => ({
                ...row,
                estado_linea: row.estado_linea === "ACTIVO" ? 1
                    : row.estado_linea === "INACTIVO" ? 0
                        : row.estado_linea
            }));

            try {
                const res = await fetch(`${API}/bench/insert_linea`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(processedRows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Carga exitosa", { variant: "success" });
                    fetchLineaData();
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
        setSelectedLinea(rowData);
        setNombreLinea(rowData.nombre_linea || '');
        setEstadoLinea(rowData.estado_linea === 1 ? "ACTIVO" : "INACTIVO");
        setDescripcionLinea(rowData.descripcion_linea || '');
        const padre = lineasPadre.find(p => p.codigo_linea === rowData.codigo_linea_padre);
        setLineaPadreSeleccionada(padre || null);
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
                    <Button onClick={() => {
                        setSelectedLinea(null);
                        setNombreLinea('');
                        setEstadoLinea('');
                        setDescripcionLinea('');
                        setLineaPadreSeleccionada(null);
                        setDialogOpen(true);
                    }} style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}>
                        Insertar Nuevo
                    </Button>
                    <Button onClick={fetchLineaData} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar</Button>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedLinea ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre Línea"
                                    value={nombreLinea}
                                    onChange={(e) => setNombreLinea(e.target.value.toUpperCase())}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="estado-linea-label">Estado</InputLabel>
                                    <Select
                                        labelId="estado-linea-label"
                                        value={estadoLinea}
                                        onChange={(e) => setEstadoLinea(e.target.value.toUpperCase())}
                                    >
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Descripción" value={descripcionLinea} onChange={(e) => setDescripcionLinea(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}>
                                <Autocomplete
                                    fullWidth
                                    options={lineas}
                                    getOptionLabel={(option) => option?.nombre_linea || ''}
                                    value={lineaPadre}
                                    onChange={(event, newValue) => setLineaPadre(newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Línea Padre" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertLinea} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>
                            {selectedLinea ? 'Actualizar' : 'Guardar'}
                        </Button>
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
            <CatLinea />
        </SnackbarProvider>
    );
}
