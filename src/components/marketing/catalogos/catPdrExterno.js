import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import {ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {Autocomplete, IconButton, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useAuthContext } from "../../../context/authContext";
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from 'react-router-dom';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as XLSX from "xlsx";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Stack from "@mui/material/Stack";
import {getTableOptions, getMuiTheme } from "../muiTableConfig";
import GlobalLoading from "../selectoresDialog/GlobalLoading";


const API = process.env.REACT_APP_API;

function CatProductoExterno() {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [nombreProducto, setNombreProducto] = useState('');
    const [estadoProdExterno, setEstadoProdExterno] = useState('');
    const [descripcionProducto, setDescripcionProducto] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [marcaRepuesto, setMarcaRepuesto] = useState('');
    const [marcasActivas, setMarcasActivas] = useState('');
    const [marcas, setMarcas] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    const handleInsertProducto = async () => {
        if (!marcaRepuesto || !marcaRepuesto.codigo_marca_rep) {
            enqueueSnackbar("Debe seleccionar una Marca Repuesto", { variant: "error" });
            return;
        }

        if (!nombreProducto) {
            enqueueSnackbar("Debe ingresar un Nombre de Producto", { variant: "error" });
            return;
        }

        const url = selectedProducto && selectedProducto.codigo_prod_externo
            ? `${API}/bench/update_producto_externo/${selectedProducto.codigo_prod_externo}`
            : `${API}/bench/insert_producto_externo`;

        const method = selectedProducto && selectedProducto.codigo_prod_externo ? "PUT" : "POST";

        const estadoNumerico = estadoProdExterno === "ACTIVO" ? 1 : 0;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    codigo_marca_rep: marcaRepuesto.codigo_marca_rep,
                    nombre_producto: nombreProducto,
                    estado_prod_externo: estadoNumerico,
                    descripcion_producto: descripcionProducto,
                })
            });

            const data = await res.json();
            if (res.ok) {
                enqueueSnackbar(data.message || "Operación exitosa", { variant: "success" });
                fetchProductoData();
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
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchProductoData();
                await fetchMarcas();
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };
        cargarDatos();
    }, []);

    const fetchProductoData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_productos_externos`, {
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
                enqueueSnackbar(data.error || "Error al obtener datos de Productos Externos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const fetchMarcas = async () => {
        try {
            const res = await fetch(`${API}/bench/get_marca_repuestos`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            console.log("Marcas cargadas:", data);

            if (res.ok && Array.isArray(data)) {
                const marcasActivas = data.filter(marca => marca.estado_marca_rep === 1);
                setMarcasActivas(marcasActivas);
                setMarcas(data);
            } else {
                setMarcas([]);
                setMarcasActivas([]);
                enqueueSnackbar(data.error || "Error al obtener marcas", { variant: "error" });
            }
        } catch (error) {
            setMarcas([]);
            setMarcasActivas([]);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const columns = [
        { name: "codigo_prod_externo", label: "Código Producto" },
        { name: "nombre_comercial", label: "Marca Repuesto" },
        { name: "nombre_producto", label: "Nombre Producto" },
        {
            name: "estado_prod_externo",
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
        { name: "descripcion_producto", label: "Descripción Producto" },
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
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                if (!rows.length) {
                    enqueueSnackbar("El archivo Excel está vacío.", { variant: "warning" });
                    return;
                }

                const processedRows = rows.map((row, index) => {
                    const nombreProducto = (row.nombre_producto || "").trim();
                    const nombreMarca = (row.nombre_marca_repuesto || "").trim();
                    const estadoProducto = (row.estado_producto_externo || "").trim().toLowerCase();
                    const descripcion = (row.descripcion_producto || "").trim();

                    if (!nombreProducto) {
                        throw new Error(`Error en fila ${index + 2}: Falta nombre del producto.`);
                    }

                    const marcaObj = Array.isArray(marcas) ? marcas.find(marca => marca.nombre_comercial.trim().toLowerCase() === nombreMarca.toLowerCase()) : null;
                    if (!marcaObj) {
                        throw new Error(`Error en fila ${index + 2}: Marca de repuesto '${nombreMarca}' no encontrada.`);
                    }

                    if (!["activo", "inactivo"].includes(estadoProducto)) {
                        throw new Error(`Error en fila ${index + 2}: Estado '${row.estado_producto_externo}' inválido (debe ser 'Activo' o 'Inactivo').`);
                    }

                    return {
                        codigo_marca_rep: marcaObj.codigo_marca_rep,
                        nombre_producto: nombreProducto,
                        estado_prod_externo: estadoProducto === "activo" ? 1 : 0,
                        descripcion_producto: descripcion,
                    };
                });

                const uniqueSet = new Set();
                for (let i = 0; i < processedRows.length; i++) {
                    const { nombre_producto, codigo_marca_rep } = processedRows[i];
                    const key = `${nombre_producto.toLowerCase()}_${codigo_marca_rep}`;
                    if (uniqueSet.has(key)) {
                        enqueueSnackbar(`Error: El producto '${nombre_producto}' con la misma marca se repite en el Excel. Verifica fila ${i + 2}.`);
                    }
                    uniqueSet.add(key);
                }

                const res = await fetch(`${API}/bench/insert_producto_externo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + jwt,
                    },
                    body: JSON.stringify(processedRows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Carga masiva exitosa", { variant: "success" });
                    fetchProductoData();
                } else {
                    enqueueSnackbar(responseData.error || "Error al cargar", { variant: "error" });
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(error.message || "Error inesperado durante la carga masiva", { variant: "error" });
            }
        };

        reader.readAsBinaryString(file);
    };

    const validarEstado = (valor) => {
        const estado = String(valor).trim().toLowerCase();
        return ["1", "0", "activo", "inactivo"].includes(estado);
    };

    const handleUploadExcelUpdate = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                const rowsInvalidas = [];
                rows.forEach((row, index) => {
                    if (row.hasOwnProperty("estado_prod_externo") && !validarEstado(row.estado_prod_externo)) {
                        rowsInvalidas.push(`Fila ${index + 2}: Estado inválido "${row.estado_prod_externo}"`);
                    }
                });

                if (rowsInvalidas.length > 0) {
                    rowsInvalidas.forEach(msg => enqueueSnackbar(msg, { variant: 'warning' }));
                    setLoadingGlobal(false);
                    return;
                }

                const duplicados = [];
                const combinaciones = new Map();
                rows.forEach((row, index) => {
                    const clave = `${row.nombre_comercial}_${row.nombre_producto}_
                ${row.estado_prod_externo}`;
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

                const res = await fetch(`${API}/bench/update_producto_externo_masivo`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify(rows)
                });

                const responseData = await res.json();
                if (res.ok) {
                    enqueueSnackbar("Actualización exitosa", { variant: "success" });
                    fetchProductoData();
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
        setSelectedProducto(rowData);
        setMarcaRepuesto(marcas.find(m => m.codigo_marca_rep === rowData.codigo_marca_rep) || null);
        setNombreProducto(rowData.nombre_producto || '');
        setEstadoProdExterno(rowData.estado_prod_externo === 1 ? "ACTIVO" : "INACTIVO");
        setDescripcionProducto(rowData.descripcion_producto || '');
        setDialogOpen(true);
    };

    const camposPlantillaModelo = [
        "codigo_prod_externo", "nombre_comercial","nombre_producto",
        "estado_prod_externo", "descripcion_producto"
    ];
    const tableOptions = getTableOptions(cabeceras, camposPlantillaModelo, "Actualizar_producto_externo.xlsx");
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
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedProducto(null);
                                setMarcaRepuesto(null);
                                setNombreProducto('');
                                setEstadoProdExterno('');
                                setDescripcionProducto('');
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
                        >
                            Nuevo
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
                        >
                            Insertar Masivo
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
                        <IconButton onClick={fetchProductoData} style={{ color: 'firebrick' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={tableOptions} />
                </ThemeProvider>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>{selectedProducto ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    fullWidth
                                    options={marcasActivas}
                                    getOptionLabel={(option) => option?.nombre_comercial || ''}
                                    value={marcaRepuesto}
                                    onChange={(e, newValue) => setMarcaRepuesto(newValue || '')}
                                    renderInput={(params) => <TextField {...params} label="Marca Repuesto" />}
                                />
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Nombre Producto" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value.toUpperCase())} /></Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="estado-prod-ext-label">Estado</InputLabel>
                                    <Select labelId="estado-prod-ext-label" value={estadoProdExterno}
                                            onChange={(e) => setEstadoProdExterno(e.target.value.toUpperCase())}
                                            variant="outlined">>
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Descripción Producto"
                                           value={descripcionProducto}
                                           onChange={(e) => setDescripcionProducto(e.target.value.toUpperCase())} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertProducto} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedProducto ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatProductoExterno />
        </SnackbarProvider>
    );
}
