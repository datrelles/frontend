import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import Navbar0 from "../../Navbar0";
import Grid from '@mui/material/Grid';
import LoadingCircle from "../../contabilidad/loader";
import {Autocomplete, TextField} from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useAuthContext } from "../../../context/authContext";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CatModeloVersionExpandible from "../uploadImages/tablaExpandible";
import SelectorChasis from "../selectoresDialog/selectChasis";
import SelectorDimensiones from "../selectoresDialog/selectDimensiones";
import SelectorMotor from "../selectoresDialog/selectMotor";
import SelectorElectronica from "../selectoresDialog/selectElectronica";
import { NumericFormat } from 'react-number-format';



const API = process.env.REACT_APP_API;

function CatModeloVersion() {
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const { enqueueSnackbar } = useSnackbar();
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [productos, setProductos] = useState([]);
    const [modelosComerciales, setModelosComerciales] = useState([]);
    const [versiones, setVersiones] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [selectedElectronica, setSelectedElectronica] = useState(null);
    const [selectedChasis, setSelectedChasis] = useState(null);
    const [selectedMotor, setSelectedMotor] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [selectedCanal, setSelectedCanal] = useState(null);
    const [selectedTransmision, setselectedTransmision] = useState(null);
    const [selectedModeloComercial, setSelectedModeloComercial] = useState(null);
    const [selectedClienteCanal, setSelectedClienteCanal] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [cabeceras, setCabeceras] = useState([]);
    const [loading] = useState(false);
    const [chasis, setChasis] = useState([]);
    const [motores, setMotores] = useState([]);
    const [tiposMotor, setTiposMotor] = useState([]);
    const [selectedTipoMotor, setSelectedTipoMotor] = useState(null);
    const [transmisiones, setTransmisiones] = useState([]);
    const [dimensiones, setDimensiones] = useState([]);
    const [electronica, setElectronicas] = useState([]);
    const [colores, setColores] = useState([]);
    const [images, setImages] = useState([]);
    const [canales, setCanales] = useState([]);
    const [clienteCanal, setClienteCanal] = useState([]);
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
        codigo_canal: '',
        descripcion_imagen: '',
        nombre_canal: '',
        nombre_color: '',
        codigo_mod_vers_repuesto: '',
        empresa: '',
        cod_producto: '',
        codigo_version: '',
        nombre_modelo_version: '',
        nombre_version: '',
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
                setImages(data);
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
    const fetchClienteCanal = async () => {
        try {
            const res = await fetch(`${API}/bench/get_cliente_canal`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setClienteCanal(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener datos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };


    useEffect(() => {
        getMenus();
        fetchModeloVersion();
        fetchModeloVersRepuesto();
        fetchProductos();
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
        fetchClienteCanal();
    }, []);

    const handleInsertOrUpdate = async () => {

        if (!selectedVersion?.nombre_version) {
            enqueueSnackbar("Seleccione una versión válida", { variant: "error" });
            return;
        }

        if (!form.cod_producto || !form.codigo_modelo_comercial || !form.codigo_version) {
            enqueueSnackbar("Todos los campos son obligatorios", { variant: "error" });
            return;
        }

        const method = selectedItem ? "PUT" : "POST";
        const url = selectedItem ?
            `${API}/bench/update_modelo_version/${selectedItem.codigo_modelo_version}` :
            `${API}/bench/insert_modelo_version`;

        const payload = {
            codigo_imagen: form.codigo_imagen,
            codigo_dim_peso: form.codigo_dim_peso,
            codigo_electronica: form.codigo_electronica,
            codigo_motor: form.codigo_motor,
            codigo_tipo_motor: form.codigo_tipo_motor,
            codigo_transmision: form.codigo_transmision,
            codigo_color_bench: form.codigo_color_bench,
            codigo_chasis: form.codigo_chasis,

            codigo_modelo_comercial: selectedModeloComercial?.codigo_modelo_comercial,
            codigo_marca: selectedModeloComercial?.codigo_marca,
            codigo_version: form.codigo_version,

            codigo_cliente_canal: form.codigo_cliente_canal,
            codigo_mod_vers_repuesto: form.codigo_mod_vers_repuesto,
            empresa: form.empresa,
            cod_producto: form.cod_producto,

            nombre_modelo_version: form.nombre_modelo_version,
            anio_modelo_version: parseInt(form.anio_modelo_version),
            precio_producto_modelo: parseFloat(form.precio_producto_modelo),
            precio_venta_distribuidor: parseFloat(form.precio_venta_distribuidor)
        };
        console.log("PAYLOAD:", payload);


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
            fetchModeloVersion();
            enqueueSnackbar(data.message || "Registro guardado correctamente", { variant: 'success' });
            setDialogOpen(false);
        } else {
            enqueueSnackbar(data.error || "Error al guardar", { variant: 'error' });
        }
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const openDialog = async (item = null) => {

        if (item) {
            const prod = productos.find(p => p.cod_producto === item.cod_producto);
            const modelo = modelosComerciales?.find(mc => mc.nombre_modelo === item.nombre_modelo_comercial);
            const ver = versiones?.find(v => v.nombre_version === item.nombre_version);
            const cha = chasis?.find(c => c.codigo_chasis === item.codigo_chasis);
            const motor = motores?.find(m => m.nombre_motor === item.nombre_motor);
            const tipoMotor = tiposMotor?.find(tm => tm.codigo_tipo_motor === item.codigo_tipo_motor);
            const elect = electronica?.find(e => e.codigo_electronica === item.codigo_electronica);
            const transmision = transmisiones.find(t => t.codigo_transmision === item.codigo_transmision);
            const color = colores.find(c => c.codigo_color_bench === item.codigo_color_bench);
            const imagen = images.find(i => i.codigo_imagen === item.codigo_imagen);
            const cl_canal = clienteCanal.find(c => c.codigo_cliente_canal === item.codigo_cliente_canal);
            const canal = canales.find(cc => cc.codigo_canal === item.codigo_canal);

            setSelectedProducto(prod || null);
            setSelectedModeloComercial(modelo || null);
            setSelectedVersion(ver || null);
            setSelectedTipoMotor(tipoMotor || null);
            setSelectedMotor(motor || null);
            setSelectedElectronica(elect || null);
            setSelectedChasis(cha || null);
            setselectedTransmision(transmision || null);
            setSelectedColor(color || null);
            setSelectedImagen(imagen || null);
            setSelectedClienteCanal(cl_canal || null);
            setSelectedCanal(canal || null);

            setForm({
                codigo_modelo_version: item.codigo_modelo_version || '',
                codigo_dim_peso: item.codigo_dim_peso || '',
                codigo_electronica: item.codigo_electronica || '',
                codigo_tipo_motor: item.codigo_tipo_motor || '',
                codigo_motor: item.codigo_motor || '',
                codigo_transmision: item.codigo_transmision || '',
                nombre_color: color?.nombre_color || '',
                descripcion_imagen: imagen?.descripcion_imagen || '',
                nombre_canal: item.nombre_canal || '',
                codigo_color_bench: color?.codigo_color_bench || '',
                codigo_imagen: item.codigo_imagen || '',
                codigo_chasis: item.codigo_chasis || '',
                codigo_modelo_comercial: modelo?.codigo_modelo_comercial || '',
                codigo_marca: modelo?.codigo_marca || '',
                codigo_cliente_canal: cl_canal.codigo_cliente_canal || '',
                codigo_mod_vers_repuesto: cl_canal.codigo_mod_vers_repuesto || '',
                empresa: item.empresa || '',
                cod_producto: prod?.cod_producto || '',
                codigo_canal: canal?.codigo_canal || '',
                codigo_version: ver?.codigo_version || '',
                nombre_modelo_version: item.nombre_modelo_version || '',
                nombre_version: ver?.nombre_version || '',
                anio_modelo_version: item.anio_modelo_version || '',
                precio_producto_modelo: item.precio_producto_modelo || '',
                precio_venta_distribuidor: item.precio_venta_distribuidor || ''
            });
        } else {
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
                codigo_canal: '',
                descripcion_imagen: '',
                nombre_canal: '',
                nombre_color: '',
                codigo_mod_vers_repuesto: '',
                empresa: '',
                cod_producto: '',
                codigo_version: '',
                nombre_modelo_version: '',
                nombre_version: '',
                anio_modelo_version: '',
                precio_producto_modelo: '',
                precio_venta_distribuidor: ''
            });
        }

        setSelectedItem(item);
        setDialogOpen(true);
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

    const handleUploadExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        fetch(`${API}/bench/insert_modelo_version_masivo`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwt
            },
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.insertados) {
                    enqueueSnackbar(`Modelos insertados: ${data.insertados}`, { variant: "success" });
                }
                if (data.errores?.length > 0) {
                    console.error("Errores:", data.errores);
                    enqueueSnackbar(`Errores en ${data.errores.length} fila(s)`, { variant: "error" });
                }
                fetchModeloVersion();
            })
            .catch(err => {
                console.error("Error al subir archivo:", err);
                enqueueSnackbar("Error de conexión o servidor", { variant: "error" });
            });
    };
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
                            alt="Vista previa imagen"
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
                                codigo_canal: '',
                                descripcion_imagen: '',
                                nombre_canal: '',
                                nombre_color: '',
                                codigo_mod_vers_repuesto: '',
                                empresa: '',
                                cod_producto: '',
                                codigo_version: '',
                                nombre_modelo_version: '',
                                nombre_version: '',
                                anio_modelo_version: '',
                                precio_producto_modelo: '',
                                precio_venta_distribuidor: ''
                            });
                            setSelectedProducto(null);
                            setSelectedModeloComercial(null);
                            setSelectedVersion( null);
                            setSelectedTipoMotor(null);
                            setSelectedMotor( null);
                            setSelectedElectronica( null);
                            setSelectedChasis( null);
                            setSelectedCanal( null);
                            setselectedTransmision( null);
                            setSelectedColor( null);
                            setSelectedImagen(null);
                            setSelectedClienteCanal(null);
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
                        imagenes={images}
                        tiposMotor={tiposMotor}
                        chasis={chasis}
                        onEdit={openDialog}
                    />
                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                        <DialogTitle>{selectedItem ? 'Actualizar' : 'Nuevo'}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <SelectorChasis
                                    chasis={chasis}
                                    selectedChasisId={form.codigo_chasis}
                                    onSelect={(codigo) => handleChange('codigo_chasis', codigo)}/>
                                <SelectorDimensiones
                                    dimensiones={dimensiones}
                                    selectedDimensionesId={form.codigo_dim_peso}
                                    onSelect={(codigo) => handleChange('codigo_dim_peso', codigo)}/>
                                <SelectorMotor
                                    motores={motores}
                                    tiposMotor={tiposMotor}
                                    selectedMotorId={form.codigo_motor}
                                    onSelect={({ codigo_motor, codigo_tipo_motor, nombre_tipo_motor }) => {
                                        handleChange('codigo_motor', codigo_motor);
                                        handleChange('codigo_tipo_motor', codigo_tipo_motor);
                                        setSelectedTipoMotor({ nombre_tipo: nombre_tipo_motor });
                                    }}/>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Tipo Motor"
                                        value={selectedTipoMotor?.nombre_tipo || ''}
                                        fullWidth
                                        disabled/>
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={transmisiones}
                                        getOptionLabel={(x) => x.caja_cambios}
                                        value={selectedTransmision}
                                        onChange={(e, v) => {
                                            setselectedTransmision(v || null);
                                            handleChange('codigo_transmision', v?.codigo_transmision || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Transmisión" />}/>
                                </Grid>
                                <SelectorElectronica
                                    electronica={electronica}
                                    selectedElectronicaId={form.codigo_electronica}
                                    onSelect={(codigo) => handleChange('codigo_electronica', codigo)}/>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={colores}
                                        getOptionLabel={(x) => x.nombre_color}
                                        value={selectedColor}
                                        onChange={(e, v) => {
                                            setSelectedColor(v || null);
                                            handleChange('codigo_color_bench', v?.codigo_color_bench || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Color" />}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={images}
                                        getOptionLabel={(x) => x.descripcion_imagen}
                                        value={selectedImagen}
                                        onChange={(e, v) => {
                                            setSelectedImagen(v || null);
                                            handleChange('codigo_imagen', v?.codigo_imagen || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Imagen" />}/>
                                </Grid>
                                <Grid item xs={12}><
                                    TextField fullWidth
                                              label="Nombre Modelo Version"
                                              value={form.nombre_modelo_version || ''} onChange={(e) =>
                                    handleChange('nombre_modelo_version', e.target.value.toUpperCase())} />
                                </Grid>
                                <Grid item xs={9}>
                                    <Autocomplete
                                        options={versiones.filter(v => v.estado_version === 1)}
                                        getOptionLabel={(v) => v?.nombre_version || ''}
                                        value={selectedVersion}
                                        onChange={(e, v) => {
                                            handleChange('codigo_version', v ? v.codigo_version : '');
                                            setSelectedVersion(v);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Versión Modelo"  />}
                                    />
                                </Grid>
                                <Grid item xs={3}><
                                    TextField fullWidth
                                              label="Año" type="number"
                                              value={form.anio_modelo_version || ''} onChange={(e) =>
                                    handleChange('anio_modelo_version', e.target.value)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <NumericFormat
                                        label="Precio Producto Modelo"
                                        customInput={TextField}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        value={form.precio_producto_modelo}
                                        onValueChange={(values) => handleChange('precio_producto_modelo', values.floatValue)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <NumericFormat
                                        label="Precio Venta Distribuidor"
                                        customInput={TextField}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        value={form.precio_venta_distribuidor}
                                        onValueChange={(values) => handleChange('precio_venta_distribuidor', values.floatValue)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={modelosComerciales.filter(v => v.estado_modelo === 1)}
                                        getOptionLabel={(v) =>
                                            `${v?.nombre_modelo ?? ''} (${v?.anio_modelo ?? ''})`
                                        }
                                        value={selectedModeloComercial}
                                        onChange={(e, v) => {
                                            handleChange('codigo_modelo_comercial', v ? v.codigo_modelo_comercial : '');
                                            handleChange('codigo_marca', v ? v.codigo_marca : '');
                                            setSelectedModeloComercial(v);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Modelo Comercial" />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Marca"
                                        value={selectedModeloComercial?.nombre_marca || ''}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={7}>
                                    <Autocomplete
                                        options={clienteCanal}
                                        getOptionLabel={(option) =>
                                            `${option.codigo_cliente_canal} - ${option.nombre_canal} - ${option.descripcion_cliente_canal} - ${option.nombre_producto}`
                                        }
                                        value={selectedClienteCanal}
                                        isOptionEqualToValue={(opt, val) => opt.codigo_cliente_canal === val?.codigo_cliente_canal}
                                        onChange={(e, v) => {
                                            if (!v) return;
                                            setSelectedClienteCanal(v);
                                            handleChange('codigo_cliente_canal', v.codigo_cliente_canal || '');
                                            setForm((prev) => ({
                                                ...prev,
                                                codigo_mod_vers_repuesto: v.codigo_mod_vers_repuesto,
                                                cod_producto: v.cod_producto,
                                                empresa: v.empresa,
                                                codigo_version: v.codigo_version,
                                            }));
                                            const producto = productos.find(p => p.cod_producto === v.cod_producto && p.empresa === v.empresa);
                                            const version = versiones.find(ver => ver.codigo_version === v.codigo_version);
                                            setSelectedProducto(producto || null);
                                            setSelectedVersion(version || null);
                                            setSelectedClienteCanal(v);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Canal" />}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Producto"
                                        value={selectedClienteCanal?.nombre_producto || ''}
                                        fullWidth disabled />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Empresa"
                                        value={selectedProducto?.nombre_empresa || ''}
                                        fullWidth disabled />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Versión"
                                        value={selectedClienteCanal?.nombre_version || ''}
                                        fullWidth disabled />
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