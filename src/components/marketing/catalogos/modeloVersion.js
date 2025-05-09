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
import * as XLSX from "xlsx";
import CatModeloVersionExpandible from "../uploadImages/tablaExpandible";

const API = process.env.REACT_APP_API;

function CatModeloVersion() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [productos, setProductos] = useState([]);
    const [productosExternos, setProductosExternos] = useState([]);
    const [modelosComerciales, setModelosComerciales] = useState([]);
    const [versiones, setVersiones] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [selectedProductoExterno, setSelectedProductoExterno] = useState(null);
    const [selectedModeloComercial, setSelectedModeloComercial] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [cabeceras, setCabeceras] = useState([]);
    const [loading] = useState(false);
    const [chasis, setChasis] = useState([]);
    const [motores, setMotores] = useState([]);
    const [tiposMotor, setTiposMotor] = useState([]);
    const [transmisiones, setTransmisiones] = useState([]);
    const [dimensiones, setDimensiones] = useState([]);
    const [electronica, setElectronicas] = useState([]);
    const [colores, setColores] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [canales, setCanales] = useState([]);
    const [modeloVersionesRepuestos, setModeloVersionesRepuestos] = useState([]);
    const [imagenModal, setImagenModal] = useState(null);
    const [openModalImagen, setOpenModalImagen] = useState(false);

    const [form, setForm] = useState({
        codigo_modelo_version: '',
        codigo_dim_peso: '',
        codigo_imagen: '',
        codigo_electronica: '',
        codigo_tipo_motor: '',
        codigo_motor: '',
        codigo_transmision: '',
        codigo_color_bench: '',
        codigo_chasis: '',
        codigo_modelo_comercial: '',
        codigo_marca: '',
        codigo_cliente_canal: '',
        codigo_mod_vers_repuesto: '',
        empresa: '',
        cod_producto: '',
        codigo_version: '',
        nombre_modelo_version: '',
        anio_modelo_version: '',
        precio_producto_modelo: '',
        precio_venta_distribuidor: ''
    });

    const fetchModeloVersion = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelo_version`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                setCabeceras(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener modelos", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchModeloVersRepuesto = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_version_repuesto`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setModeloVersionesRepuestos(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión mvr", { variant: "error" });
        }

    };
    const fetchChasis = async () => {
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
                setChasis(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de chasis", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchProductos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_productos`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setProductos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchProductosExternos = async () => {
        try {
            const res = await fetch(`${API}/bench/get_productos_externos`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setProductosExternos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchModeloComercial = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelos_comerciales`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setModelosComerciales(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchVersiones = async () => {
        try {
            const res = await fetch(`${API}/bench/get_version`, { headers: { "Authorization": "Bearer " + jwt } });
            const data = await res.json();
            setVersiones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchColores = async () => {
        try {
            const res = await fetch(`${API}/bench/get_color`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setColores(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de colores", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchDimensiones = async () => {
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
                setDimensiones(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de dimensiones", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchMotores = async () => {
        try {
            const res = await fetch(`${API}/bench/get_motores`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setMotores(data);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchTiposMotor = async () => {
        try {
            const res = await fetch(`${API}/bench/get_tipo_motor`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setTiposMotor(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchTransmisiones = async () => {
        try {
            const res = await fetch(`${API}/bench/get_transmision`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setTransmisiones(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de transmisión", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchElectronica = async () => {
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
                setElectronicas(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de electrónica", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchImagen = async () => {
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
                setImagenes(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de imágenes", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };
    const fetchCanal = async () => {
        try {
            const res = await fetch(`${API}/bench/get_canal`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setCanales(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos de Canal", { variant: "error" });
            }
        } catch (error) {
            console.error("Error:", error);
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }

    };

    useEffect(() => {
        getMenus();
        fetchModeloVersion();
        fetchModeloVersRepuesto();
        fetchProductos();
        fetchProductosExternos();
        fetchModeloComercial();
        fetchVersiones();
        fetchChasis();
        fetchMotores();
        fetchTiposMotor();
        fetchTransmisiones();
        fetchDimensiones();
        fetchElectronica();
        fetchColores();
        fetchImagen();
        fetchCanal();
    }, []);

    const handleInsertOrUpdate = async () => {
        if (!form.cod_producto || !form.codigo_prod_externo || !form.codigo_modelo_comercial || !form.codigo_version) {
            enqueueSnackbar("Todos los campos son obligatorios", { variant: "error" });
            return;
        }

        const method = selectedItem ? "PUT" : "POST";
        const url = selectedItem ?
            `${API}/bench/update_modelo_version_repuesto/${selectedItem.codigo_mod_vers_repuesto}` :
            `${API}/bench/insert_modelo_version_repuesto`;

        const payload = {
            ...form,
            precio_producto_modelo: parseFloat(form.precio_producto_modelo),
            precio_venta_distribuidor: parseFloat(form.precio_venta_distribuidor)
        };

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + jwt
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
            fetchModeloVersRepuesto();
            enqueueSnackbar(data.message || "Registro guardado correctamente", { variant: 'success' });
            setDialogOpen(false);
        } else {
            enqueueSnackbar(data.error || "Error al guardar", { variant: 'error' });
        }
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const openDialog = async (item = null) => {
        console.log("ITEM seleccionado:", item);

        if (item) {
            const prod = productos.find(p => p.cod_producto === item.cod_producto);
            const modelo = modelosComerciales?.find(mc => mc.nombre_modelo === item.nombre_modelo_comercial);
            const prodExt = productosExternos?.find(pe => pe.nombre_producto === item.nombre_producto_externo);
            const ver = versiones?.find(v => v.nombre_version === item.nombre_version);

            setSelectedProducto(prod || null);
            setSelectedProductoExterno(prodExt || null);
            setSelectedModeloComercial(modelo || null);
            setSelectedVersion(ver || null);

            setForm({
                cod_producto: prod?.cod_producto || '',
                empresa: prod?.empresa || '',
                nombre_empresa: prod?.nombre_empresa || '',
                codigo_prod_externo: prodExt?.codigo_prod_externo || '',
                codigo_modelo_comercial: modelo?.codigo_modelo_comercial || '',
                codigo_marca: modelo?.codigo_marca || '',
                nombre_marca: modelo?.nombre_marca || '',
                codigo_version: ver?.codigo_version || '',
                descripcion: item.descripcion || '',
                precio_producto_modelo: item.precio_producto_modelo || '',
                precio_venta_distribuidor: item.precio_venta_distribuidor || ''
            });
        } else {
            setSelectedProducto(null);
            setSelectedProductoExterno(null);
            setSelectedModeloComercial(null);
            setSelectedVersion(null);

            setForm({
                codigo_modelo_version: '',
                codigo_dim_peso: '',
                codigo_imagen: '',
                codigo_electronica: '',
                codigo_tipo_motor: '',
                codigo_motor: '',
                codigo_transmision: '',
                codigo_color_bench: '',
                codigo_chasis: '',
                codigo_modelo_comercial: '',
                codigo_marca: '',
                codigo_cliente_canal: '',
                codigo_mod_vers_repuesto: '',
                empresa: '',
                cod_producto: '',
                codigo_version: '',
                nombre_modelo_version: '',
                anio_modelo_version: '',
                precio_producto_modelo: '',
                precio_venta_distribuidor: ''
            });
        }

        setSelectedItem(item);
        setDialogOpen(true);
    };

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);
                const res = await fetch(`${API}/bench/insert_modelo_version_repuesto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                    body: JSON.stringify({ repuestos: rows })
                });
                const json = await res.json();
                if (res.ok) enqueueSnackbar(json.message, { variant: 'success' });
                else enqueueSnackbar(json.error || 'Error en carga', { variant: 'error' });
                fetchModeloVersRepuesto();
            } catch (err) {
                enqueueSnackbar('Error procesando archivo', { variant: 'error' });
            }
        };
        reader.readAsBinaryString(file);
    };

    const columns = [
        { name: 'codigo_modelo_version', label: 'CÓDIGO' },
        { name: 'nombre_modelo_version', label: 'MODELO VERSIÓN' },
        { name: 'nombre_producto', label: 'PRODUCTO' },
        { name: 'nombre_empresa', label: 'EMPRESA' },
        {
            name: "path_imagen",
            label: "Imagen",
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
        { name: 'codigo_dim_peso', label: 'DIMENSIONES' },
        { name: 'codigo_electronica', label: 'ELECTRÓNICA' },
        { name: 'nombre_tipo_motor', label: 'TIPO MOTOR' },
        { name: 'nombre_motor', label: 'MOTOR' },
        { name: 'caja_cambios', label: 'TRANSMISIÓN' },
        { name: 'nombre_color', label: 'COLOR' },
        { name: 'codigo_chasis', label: 'CHASIS' },
        { name: 'nombre_modelo_comercial', label: 'MODELO COMERCIAL' },
        { name: 'nombre_marca', label: 'MARCA' },
        { name: 'nombre_canal', label: 'CANAL' },
        { name: 'nombre_version', label: 'VERSIÓN' },
        { name: 'anio_modelo_version', label: 'AÑO MODELO' },
        { name: 'precio_producto_modelo', label: 'PRECIO PRODUCTO' },
        { name: 'precio_venta_distribuidor', label: 'PRECIO DISTRIBUIDOR' },
        {
            name: "acciones",
            label: "ACCIONES",
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const rowData = cabeceras[dataIndex];
                    return (
                        <IconButton onClick={() => openDialog(rowData)}>
                            <EditIcon />
                        </IconButton>
                    );
                }
            }
        }
    ];

    const options = {
        responsive: 'standard', selectableRows: 'none', textLabels: {
            body: { noMatch: 'Lo siento, no se encontraron registros', toolTip: 'Ordenar' },
            pagination: { next: 'Siguiente', previous: 'Anterior', rowsPerPage: 'Filas por página:', displayRows: 'de' }
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

    const getMuiTheme = () => createTheme({
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
                    }
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
                        />
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
                    <Box>
                        <Button onClick={() => {
                            setSelectedItem(null);
                            setForm({
                                codigo_modelo_version: '',
                                codigo_dim_peso: '',
                                codigo_imagen: '',
                                codigo_electronica: '',
                                codigo_tipo_motor: '',
                                codigo_motor: '',
                                codigo_transmision: '',
                                codigo_color_bench: '',
                                codigo_chasis: '',
                                codigo_modelo_comercial: '',
                                codigo_marca: '',
                                codigo_cliente_canal: '',
                                codigo_mod_vers_repuesto: '',
                                empresa: '',
                                cod_producto: '',
                                codigo_version: '',
                                nombre_modelo_version: '',
                                anio_modelo_version: '',
                                precio_producto_modelo: '',
                                precio_venta_distribuidor: ''
                            });
                            setSelectedProductoExterno(null);
                            setSelectedProducto(null);
                            setSelectedModeloComercial(null);
                            setSelectedVersion(null);
                            fetchVersiones();
                            setDialogOpen(true);
                        } }
                                style={{ marginTop: 10, backgroundColor: 'firebrick', color: 'white' }}>Insertar Nuevo</Button>
                        <Button onClick={fetchModeloVersion} style={{ marginTop: 10, marginLeft: 10, backgroundColor: 'firebrick', color: 'white' }}>Listar</Button>
                    </Box>
                    <CatModeloVersionExpandible
                        cabeceras={cabeceras}
                        electronica={electronica}
                        transmisiones={transmisiones}
                        dimensiones={dimensiones}
                        motores={motores}
                        imagenes={imagenes}
                        tiposMotor={tiposMotor}
                        chasis={chasis}
                        onEdit={openDialog}
                    />
                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                        <DialogTitle>{selectedItem ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={chasis}
                                        getOptionLabel={(x) => x.codigo_chasis + ''}
                                        onChange={(e, v) => handleChange('codigo_chasis', v?.codigo_chasis || '')}
                                        renderInput={(params) => <TextField {...params} label="Chasis" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={tiposMotor}
                                        getOptionLabel={(x) => x.nombre_tipo + ''}
                                        onChange={(e, v) => handleChange('codigo_tipo_motor', v?.codigo_tipo_motor || '')}
                                        renderInput={(params) => <TextField {...params} label="Tipo Motor" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={motores}
                                        getOptionLabel={(x) => x.nombre_motor}
                                        onChange={(e, v) => handleChange('codigo_motor', v?.codigo_motor || '')}
                                        renderInput={(params) => <TextField {...params} label="Motor" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={transmisiones}
                                        getOptionLabel={(x) => x.codigo_transmision + ''}
                                        onChange={(e, v) => handleChange('caja_cambios', v?.codigo_transmision || '')}
                                        renderInput={(params) => <TextField {...params} label="Transmisión" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={dimensiones}
                                        getOptionLabel={(x) => x.codigo_dim_peso + ''}
                                        onChange={(e, v) => handleChange('codigo_dim_peso', v?.codigo_dim_peso || '')}
                                        renderInput={(params) => <TextField {...params} label="Dimensiones" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={electronica}
                                        getOptionLabel={(x) => x.codigo_electronica + ''}
                                        onChange={(e, v) => handleChange('codigo_electronica', v?.codigo_electronica || '')}
                                        renderInput={(params) => <TextField {...params} label="Electrónica" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={colores}
                                        getOptionLabel={(x) => x.nombre_color}
                                        onChange={(e, v) => handleChange('codigo_color_bench', v?.codigo_color_bench || '')}
                                        renderInput={(params) => <TextField {...params} label="Color" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={canales}
                                        getOptionLabel={(x) => x.nombre_canal}
                                        onChange={(e, v) => handleChange('codigo_cliente_canal', v?.codigo_canal || '')}
                                        renderInput={(params) => <TextField {...params} label="Canal" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={imagenes}
                                        getOptionLabel={(x) => x.path_imagen}
                                        onChange={(e, v) => handleChange('codigo_imagen', v?.codigo_imagen || '')}
                                        renderInput={(params) => <TextField {...params} label="Imagen" />}
                                    />
                                </Grid>
                                <Grid item xs={12}>

                                    <Autocomplete
                                        options={productos}
                                        getOptionLabel={(p) => p.nombre_producto || ''}
                                        value={selectedProducto}
                                        onChange={(e, v) => {
                                            handleChange('cod_producto', v?.cod_producto || '');
                                            handleChange('empresa', v?.empresa || '');
                                            handleChange('nombre_empresa', v?.nombre_empresa || '');
                                            setSelectedProducto(v);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Producto" />}
                                        isOptionEqualToValue={(option, value) => option.cod_producto === value.cod_producto}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Empresa" value={selectedProducto?.nombre_empresa || ''} fullWidth disabled />
                                </Grid>

                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={modelosComerciales.filter(mc => mc.estado_modelo === 1)}
                                        getOptionLabel={(mc) => mc.nombre_modelo || ''}
                                        value={selectedModeloComercial}
                                        onChange={(e, v) => {
                                            handleChange('codigo_modelo_comercial', v?.codigo_modelo_comercial || '');
                                            handleChange('codigo_marca', v?.codigo_marca || '');
                                            handleChange('nombre_marca', v?.nombre_marca || '');
                                            setSelectedModeloComercial(v);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Modelo Comercial" />}
                                        isOptionEqualToValue={(option, value) => option.codigo_modelo_comercial === value.codigo_modelo_comercial}
                                    />
                                </Grid>
                                <Grid item xs={6}>

                                    <TextField label="Marca" value={selectedModeloComercial?.nombre_marca || ''} fullWidth disabled />
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={versiones.filter(v => v.estado_version === 1)}
                                        getOptionLabel={(v) => v?.nombre_version || ''}
                                        value={selectedVersion}
                                        onChange={(e, v) => {
                                            handleChange('codigo_version', v ? v.codigo_version : '');
                                            setSelectedVersion(v);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Versión" />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Precio Producto Modelo"
                                               type="number" value={form.precio_producto_modelo}
                                               onChange={(e) =>
                                                   handleChange('precio_producto_modelo', e.target.value)} fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Precio Venta Distribuidor"
                                               type="number" value={form.precio_venta_distribuidor}
                                               onChange={(e) =>
                                                   handleChange('precio_venta_distribuidor', e.target.value)} fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleInsertOrUpdate} variant="contained" style={{ backgroundColor: 'firebrick', color: 'white' }}>{selectedItem ? 'Actualizar' : 'Guardar'}</Button>
                            <Button variant="contained" component="label" style={{ backgroundColor: 'firebrick', color: 'white' }}>
                                Cargar Excel
                                <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </>
        )}
        </>
    );
}

export default function IntegrationNotistackWrapper() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CatModeloVersion/>
        </SnackbarProvider>
    );
}