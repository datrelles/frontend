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
import ImageUploader from "../uploadImages/s3_upload";

const API = process.env.REACT_APP_API;

function CatImagen() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [pathImagen, setpathImagen] = useState('');
    const [descripcionImagen, setDescripcionImagen] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [imagenModal, setImagenModal] = useState(null);
    const [openModalImagen, setOpenModalImagen] = useState(false);


    const handleInsertImagen = async () => {
        const url = selectedImagen && selectedImagen.codigo_imagen
            ? `${API}/bench/update_imagen/${selectedImagen.codigo_imagen}`
            : `${API}/bench/insert_path_imagen`;

        const method = selectedImagen && selectedImagen.codigo_imagen ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    path_imagen: pathImagen,
                    descripcion_imagen: descripcionImagen
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchImagenData();
                setDialogOpen(false);
            } else {
                enqueueSnackbar(data.error || "Error al guardar", { variant: "error" });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Error inesperado", { variant: "error" });
        }
    };

    useEffect(() => {
        getMenus();
        fetchImagenData();

    }, [])

    const fetchImagenData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_imagenes`, {
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
                enqueueSnackbar(data.error || "Error al obtener imágenes", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const eliminarImagen = async (pathImagen) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) return;

        try {
            const res = await fetch(`${API}/s3/eliminar-imagen`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({ path_imagen: pathImagen })
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(result.message || "Imagen eliminada");
                fetchImagenData();
            } else {
                toast.error(result.error || "Error al eliminar imagen");
            }
        } catch (err) {
            console.error("Error eliminando imagen:", err);
            toast.error("Error inesperado");
        }
    };

    const columns = [
        { name: "descripcion_imagen", label: "Descripción Imagen" },
        {
            name: "path_imagen",
            label: "IMAGEN REFERENCIAL",
            options: {
                customBodyRender: (value) => (
                    <Button
                        onClick={() => {
                            setImagenModal(value);
                            setOpenModalImagen(true);
                        }}
                        variant="outlined"
                        size="small"
                    >
                        Ver imagen
                    </Button>
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
                        <>
                            <IconButton onClick={() => openEditDialog(rowData)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => eliminarImagen(rowData.path_imagen)}>
                                🗑️
                            </IconButton>
                        </>
                    );
                }
            }
        }
    ];

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

    const openEditDialog = (rowData) => {
        setSelectedImagen(rowData);
        setpathImagen(rowData.path_imagen || '');
        setDescripcionImagen(rowData.descripcion_imagen || '');
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
        <>
            {loading ? (
                <LoadingCircle />
            ) : (
                <>
                    <Dialog open={openModalImagen} onClose={() => setOpenModalImagen(false)} maxWidth="md" fullWidth>
                        <DialogTitle>Vista de Imagen</DialogTitle>
                        <DialogContent>
                            <img
                                src={imagenModal}
                                title="Vista previa imagen"
                                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                                alt="Vista previa imagen"/>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenModalImagen(false)} color="primary">
                                Cerrar
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <div style={{ marginTop: '150px', width: "100%" }}>
                        <Navbar0 menus={menus} />
                        <Box>
                            <ButtonGroup variant="text">
                                <Button onClick={() => navigate('/dashboard')}>Módulos</Button>
                                <Button onClick={() => navigate(-1)}>Catálogos</Button>
                            </ButtonGroup>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box display="flex" alignItems="center">
                                    <ImageUploader
                                        onUploadComplete={(urls) => {
                                            console.log("URLs subidas:", urls);
                                            setpathImagen(urls[0]);
                                        }}
                                    />
                                </Box>
                                <Button
                                    onClick={fetchImagenData}
                                    style={{
                                        backgroundColor: "firebrick",
                                        color: "white",
                                        height: '37px'
                                    }}>Listar
                                </Button>
                            </Box>
                        </Box>
                        <ThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
                        </ThemeProvider>
                        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                            <DialogTitle>{selectedImagen ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Path/Ruta Imágen"
                                            value={pathImagen}
                                            onChange={(e) => setpathImagen(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Descripción Imagen"
                                            value={descripcionImagen}
                                            onChange={(e) => setDescripcionImagen(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={handleInsertImagen} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>
                                    {selectedImagen ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </>
            )}
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatImagen/>
        </SnackbarProvider>
    );
}