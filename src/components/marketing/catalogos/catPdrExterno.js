import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import {Autocomplete, IconButton, TextField} from '@mui/material';
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

function CatProductoExterno() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [nombreProducto, setNombreProducto] = useState('');
    const [estadoProdExterno, setEstadoProdExterno] = useState('');
    const [descripcionProducto, setDescripcionProducto] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [cabeceras, setCabeceras] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [empresas, setEmpresas] = useState([]);
    const [marcaRepuesto, setMarcaRepuesto] = useState('');
    const [marcasActivas, setMarcasActivas] = useState('');
    const [marcas, setMarcas] = useState([]);


    const handleInsertProducto = async () => {
        if (!marcaRepuesto || !marcaRepuesto.codigo_marca_rep) {
            enqueueSnackbar("Debe seleccionar una Marca Repuesto", { variant: "error" });
            return;
        }
        if (!empresa || !empresa.empresa) {
            enqueueSnackbar("Debe seleccionar una Empresa", { variant: "error" });
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

        const estadoNumerico = estadoProdExterno === "Activo" ? 1 : 0;

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
                    empresa: empresa.empresa
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
        getMenus();
        fetchProductoData();
        fetchEmpresas();
        fetchMarcas();
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

    const fetchEmpresas = async () => {
        try {
            const res = await fetch(`${API}/enterprise/${userShineray}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                // Convertir claves en mayúsculas a minúsculas
                const normalizadas = data.map(emp => ({
                    empresa: emp.EMPRESA,
                    nombre: emp.NOMBRE
                }));
                setEmpresas(normalizadas);
            } else {
                setEmpresas([]);
                enqueueSnackbar(data.error || "Error al obtener empresas", { variant: "error" });
            }
        } catch (error) {
            setEmpresas([]);
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
        {
            name: "codigo_marca_rep",
            label: "Marca Repuesto",
            options: {
                customBodyRender: (value) => {
                    const marca = marcas.find(m => m.codigo_marca_rep === value);
                    return marca ? marca.nombre_comercial : value;
                }
            }
        },
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
                        {value === 1 ? "Activo" : "Inactivo"}
                    </div>
                )
            }
        },
        { name: "descripcion_producto", label: "Descripción Producto" },
        {
            name: "empresa",
            label: "Empresa",
            options: {
                customBodyRender: (value) => {
                    const empresaObj = Array.isArray(empresas) ? empresas.find(emp => emp.empresa === value) : null;
                    return empresaObj ? empresaObj.nombre : value;
                }
            }
        },
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
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                if (!rows.length) {
                    throw new Error("El archivo Excel está vacío.");
                }

                const processedRows = rows.map((row, index) => {
                    const nombreProducto = (row.nombre_producto || "").trim();
                    const nombreEmpresa = (row.nombre_empresa || "").trim();
                    const nombreMarca = (row.nombre_marca_repuesto || "").trim();
                    const estadoProducto = (row.estado_producto_externo || "").trim().toLowerCase();
                    const descripcion = (row.descripcion_producto || "").trim();

                    if (!nombreProducto) {
                        throw new Error(`Error en fila ${index + 2}: Falta nombre del producto.`);
                    }

                    const empresaObj = empresas.find(emp => emp.nombre.trim().toLowerCase() === nombreEmpresa.toLowerCase());
                    if (!empresaObj) {
                        throw new Error(`Error en fila ${index + 2}: Empresa '${nombreEmpresa}' no encontrada.`);
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
                        empresa: empresaObj.empresa
                    };
                });

                const uniqueSet = new Set();
                for (let i = 0; i < processedRows.length; i++) {
                    const { nombre_producto, codigo_marca_rep } = processedRows[i];
                    const key = `${nombre_producto.toLowerCase()}_${codigo_marca_rep}`;
                    if (uniqueSet.has(key)) {
                        throw new Error(`Error: El producto '${nombre_producto}' con la misma marca se repite en el Excel. Verifica fila ${i + 2}.`);
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

    const openEditDialog = (rowData) => {
        setSelectedProducto(rowData);
        setMarcaRepuesto(marcas.find(m => m.codigo_marca_rep === rowData.codigo_marca_rep) || null);
        setNombreProducto(rowData.nombre_producto || '');
        setEstadoProdExterno(rowData.estado_prod_externo === 1 ? "Activo" : "Inactivo");
        setDescripcionProducto(rowData.descripcion_producto || '');
        setEmpresa(empresas.find(emp => emp.empresa === rowData.empresa) || null);
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
                    <Button onClick={() => { setSelectedProducto(null); setMarcaRepuesto(null); setNombreProducto(''); setEstadoProdExterno(''); setDescripcionProducto(''); setEmpresa(null); setDialogOpen(true); }} style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}>Insertar Nuevo</Button>
                    <Button onClick={fetchProductoData} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar</Button>
                </Box>
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable title="Lista completa" data={cabeceras} columns={columns} options={options} />
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
                                    onChange={(e, newValue) => setMarcaRepuesto(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Marca Repuesto" />}
                                />
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Nombre Producto" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} /></Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="estado-prod-ext-label">Estado</InputLabel>
                                    <Select labelId="estado-prod-ext-label" value={estadoProdExterno}
                                            onChange={(e) => setEstadoProdExterno(e.target.value)}>
                                        <MenuItem value="Activo">Activo</MenuItem>
                                        <MenuItem value="Inactivo">Inactivo</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}><TextField fullWidth label="Descripción Producto" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} /></Grid>
                            <Grid item xs={6}>
                                <Autocomplete
                                    fullWidth
                                    options={empresas}
                                    getOptionLabel={(option) => option?.nombre || ''} value={empresa}
                                    onChange={(e, newValue) => setEmpresa(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Empresa" />}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleInsertProducto} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedProducto ? 'Actualizar' : 'Guardar'}</Button>
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
            <CatProductoExterno />
        </SnackbarProvider>
    );
}
