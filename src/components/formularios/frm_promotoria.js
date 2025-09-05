import React, {useEffect, useMemo, useState} from 'react';
import {
    TextField, Button, Grid, Typography,
    Box, Snackbar,  Alert, Autocomplete
} from '@mui/material';
import {useAuthContext} from "../../context/authContext";
import {SnackbarProvider} from "notistack";
import API from "../../services/modulo_formularios";
import {toast} from "react-toastify";
import LoadingCircle from "../contabilidad/loader";
import AddIcon from "@material-ui/icons/Add";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import SearchIcon from "@material-ui/icons/Search";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Paper from "@mui/material/Paper";
import CollapsibleTable from "./CollapsibleTable";
import IngresoModelosTabs from "./IngresoModelosTabs";
import {TablaResumenMarcas} from "./TablaResumenMarcas";

const FrmPromotoria= () => {
    const {jwt, userShineray, enterpriseShineray, systemShineray} = useAuthContext();
    const APIService = useMemo(
        () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
        [jwt, userShineray, enterpriseShineray, systemShineray]
    );

    const [loading] = useState(false);
    const [menus, setMenus] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [indexEditar, setIndexEditar] = useState(null);
    const [mostrarTabla, setMostrarTabla] = useState(false);
    const [promotores, setPromotores] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [catsegmentos, setCatSegmentos] = useState([]);
    const [clientesRaw, setClientesRaw] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [loadingDirs, setLoadingDirs] = useState(false);
    const [alerta, setAlerta] = useState({open: false, msg: '', severity: 'info'});
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [promotorActual, setPromotorActual] = useState(null);
    const [cargandoPromotor, setCargandoPromotor] = useState(true);

    const [buscarDistribuidorId, setBuscarDistribuidorId] = useState('');
    const [buscarDistribuidorNombre, setBuscarDistribuidorNombre] = useState('');
    const todayISO = () => dayjs().format('YYYY-MM-DD');

    const [loadingTabla, setLoadingTabla] = useState(false);
    const [modelosPorSegmento, setModelosPorSegmento] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [guardadoPromotoria, setGuardadoPromotoria] = useState(false);
    const [formularios, setFormularios] = useState([]);

    const cargarVisitaPromotoriaIniciales = async (codPromotor) => {
        try {
            setLoadingTabla(true);

            const params = {
                cod_promotor: codPromotor
            };
            const resp = await APIService.getPromotoria(enterpriseShineray, params);
            const data = Array.isArray(resp) ? resp : (resp?.data ?? []);
            const rows = data.map(it => obtenerPromotoria(it));
            setFormularios(rows);
            setMostrarTabla(true);
        } catch (e) {
            const msg = e?.response?.data?.mensaje || e?.message || 'No se pudieron cargar los registros iniciales.';
            setAlerta({ open: true, msg, severity: 'error' });
        } finally {
            setLoadingTabla(false);
        }
    };

    const [form, setForm] = useState({
        fecha: todayISO(),
        promotorId: '',
        distribuidorId: '',
        codTienda: '',
        codProveedor: '',
        cod_promotor: '',
        cod_cliente: '',
        distribuidor: '',
        tiendaNombre: '',
        tienda: '',
        promotor: '',
        ToDate: '',
        FromDate: '',
        responsable: '',
        telefono1: '',
        correo_electronico: '',
        prom_venta_tienda: '',
        total_motos_shi: '',
        cod_promotoria: '',
        total_mot_piso: '',
        modelos_segmento: [],
        marcas_segmento: [],
    });

    const getMenus = async () => {
        try {
            setMenus(await APIService.getMenus());
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const p = await APIService.getPromotorActual();
                setPromotorActual(p);
                const codPromotor = String(p.identificacion || '').trim();

                setForm(prev => ({ ...prev, promotor: codPromotor }));
                await fetchClientesPromotor(codPromotor);
                await cargarVisitaPromotoriaIniciales(codPromotor);
            } catch (e) {
                console.error(e);
                toast.error(e.message || 'No se pudo obtener el promotor del usuario');
            } finally {
                setCargandoPromotor(false);
            }
        })();
    }, []);

    useEffect(() => {
        getMenus();
        fetchPromotores();
        fetchMarcas();
        fetchModeloComercial();
        fetchSegmentos();
    }, [])

    useEffect(() => {
        fetchClientesPromotor(form.promotor);
    }, [form.promotor]);

    useEffect(() => {
        fetchDirecciones(form.promotor, form.distribuidorId);
    }, [form.promotor, form.distribuidorId]);


    const handleChange = (campo) => (event) => {
        const value = event.target.value.toUpperCase();
        setForm({...form, [campo]: value});
    };

    function buildPromotoriaPayload(form, empresa, cantidades) {
        const safeInt = (v) =>
            v === '' || v === null || v === undefined || Number.isNaN(Number(v))
                ? null
                : parseInt(String(v), 10);

        const modelos_segmento = Object.values(cantidades.modelos || {}).map(m => ({
            cod_segmento: safeInt(m.cod_segmento),
            cod_linea: safeInt(m.cod_linea),
            cod_modelo_comercial: safeInt(m.cod_modelo_comercial),
            cod_marca: safeInt(m.cod_marca),
            cantidad: safeInt(m.cantidad) || 0,
        }));

        const marcas_segmento = [];

        if (cantidades.modelos) {
            const agrupado = {};

            Object.values(cantidades.modelos).forEach(m => {
                const cod_marca = safeInt(m.cod_marca);
                const nombre_segmento = m.nombre_segmento || '';
                const key = `${cod_marca}-${nombre_segmento}`;

                if (!agrupado[key]) {
                    agrupado[key] = {
                        cod_marca,
                        nombre_segmento,
                        cantidad: 0,
                    };
                }
                agrupado[key].cantidad += safeInt(m.cantidad) || 0;
            });

            for (const k in agrupado) {
                marcas_segmento.push(agrupado[k]);
            }
        }
        return {
            empresa: safeInt(empresa),
            cod_promotor: String(form.promotor ?? '').trim(),
            cod_cliente: String(form.distribuidorId ?? '').trim(),
            cod_tienda: safeInt(form.codTienda),
            total_vendedores: safeInt(form.total_vendedores) || 0,
            modelos_segmento,

            marcas_segmento: form.marcas_segmento || [],
        };
    }

    const handleSubmit = async () => {
        const required = ['promotor', 'distribuidorId', 'codTienda'];
        const missing = required.filter(f => !form[f] && form[f] !== 0);
        if (missing.length) {
            setAlerta({ open: true, msg: 'Por favor completa todos los campos obligatorios.', severity: 'warning' });
            return;
        }

        const payload = buildPromotoriaPayload(form, enterpriseShineray, cantidades);

        try {
            if (modoEdicion) {
                await APIService.updatePromotoria(form.cod_promotoria, payload);
            } else {
                await APIService.postPromotoria(enterpriseShineray, payload);
            }

            const params = {};
            if (fromDate && toDate) {
                params.fecha_inicio = dayjs(fromDate).format('YYYY-MM-DD');
                params.fecha_fin = dayjs(toDate).format('YYYY-MM-DD');
            }
            if (buscarDistribuidorId) {
                params.cod_cliente = String(buscarDistribuidorId);
            }

            const resp = await APIService.getPromotoria(enterpriseShineray, params);
            const data = Array.isArray(resp) ? resp : (resp?.data ?? []);
            const rows = data.map(it => obtenerPromotoria(it));
            setFormularios(rows);

            setGuardadoPromotoria(true);
            setAlerta({
                open: true,
                msg: modoEdicion ? 'Formulario actualizado con éxito.' : 'Formulario guardado con éxito.',
                severity: 'success'
            });
            limpiarFormulario();
            setMostrarFormulario(false);
            setMostrarTabla(true);

        } catch (error) {
            console.error('Error al guardar/actualizar formulario:', error);
            const msg = error?.response?.data?.mensaje || error?.message || 'Error al guardar.';
            setAlerta({ open: true, msg, severity: 'error' });
        }
    };

    const limpiarFormulario = () => {
        setForm(prev => ({
            ...prev,
            fecha: todayISO(),
            ToDate: '',
            FromDate: '',
            ciudad: '',
            distribuidor: '',
            tienda: '',
            motos: '',
            distribuidorId: '',
            codTienda: '',
            tiendaNombre: '',
            jefeTienda: '',
            correoTienda: '',
            telefonoTienda: '',
            total_vendedores: '',
            totalModelosPiso: '',
            totalShineray: '',
            segmento: '',
            marca: '',
            modelo: '',
            cantidadModelos: '',
            modelos_segmento: [],
            marcas_segmento: [],
        }));
        setModoEdicion(false);
        setIndexEditar(null);
    };

    const handleChangeDateCli = async () => {
        const fIni = fromDate ? dayjs(fromDate).format('YYYY-MM-DD') : null;
        const fFin = toDate   ? dayjs(toDate).format('YYYY-MM-DD')   : null;

        if (!fIni || !fFin) {
            setAlerta({ open: true, msg: 'Ingresa el rango de fechas (desde y hasta).', severity: 'warning' });
            return;
        }
        let codCliente = null;
        if (buscarDistribuidorId) {
            codCliente = String(buscarDistribuidorId);
        } else if ((buscarDistribuidorNombre || '').trim()) {
            const nombre = buscarDistribuidorNombre.trim().toUpperCase();
            const matchExact = (clientes ?? []).find(c => (c.nombre || '').toUpperCase() === nombre);
            const match = matchExact || (clientes ?? []).find(c => (c.nombre || '').toUpperCase().includes(nombre));
            if (!match) {
                setAlerta({ open: true, msg: 'Distribuidor no encontrado. Selecciónalo de la lista.', severity: 'warning' });
                return;
            }
            codCliente = String(match.id);
        } else {
            setAlerta({ open: true, msg: 'Selecciona un distribuidor.', severity: 'warning' });
            return;
        }

        try {
            const params = {
                fecha_inicio: fIni,
                fecha_fin: fFin,
                cod_cliente: codCliente,
                cod_promotor: userShineray?.cod_promotor
            };

            const resp = await APIService.getPromotoria(enterpriseShineray, params);

            const data = Array.isArray(resp) ? resp : (resp?.data ?? []);
            const rows = data.map(it => obtenerPromotoria(it));

            if (rows.length === 0) {
                setFormularios([]);
                setMostrarTabla(true);
                setAlerta({ open: true, msg: 'No se encontraron registros con esos filtros.', severity: 'warning' });
                return;
            }
            setFormularios(rows);
            setMostrarTabla(true);
            setAlerta({ open: true, msg: 'Datos cargados correctamente.', severity: 'success' });
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.mensaje || error?.message || 'Error al cargar registros.';
            setAlerta({ open: true, msg, severity: 'error' });
        }

    };

    const fetchMarcas = async () => {
        try {

            const response = await APIService.getMarcas();
            const formattedMarcas = response.map((p) => ({
                id: p.codigo_marca,
                nombre_marca: `${p.nombre_marca}`,
            }));
            setMarcas(formattedMarcas);

        } catch (error) {
            console.error("Error al obtener promotores:", error);
            toast.error(error.message || "No se pudo cargar promotores");
        }
    };

    const fetchSegmentos = async () => {
        try {

            const response = await APIService.getCatalogoSegmentos();
            const formattedCatSegmentos = response.map((p) => ({
                nombre_segmento: `${p.nombre_segmento}`,
            }));
            setCatSegmentos(formattedCatSegmentos);

        } catch (error) {
            console.error("Error al obtener segmentos:", error);
            toast.error(error.message || "No se pudo cargar segmentos");
        }
    };

    useEffect(() => {
        const fetchModeloSegmentos = async () => {
            try {
                const response = await APIService.getModeloSegmentos();

                const agrupados = response.reduce((acc, modelo) => {
                    const segmento = modelo.nombre_segmento;
                    if (!acc[segmento]) {
                        acc[segmento] = {
                            nombre_segmento: segmento,
                            modelos: [],
                        };
                    }
                    acc[segmento].modelos.push(modelo);
                    return acc;
                }, {});

                setModelosPorSegmento(Object.values(agrupados));
            } catch (error) {
                toast.error(error.message || "No se pudo cargar modelos por segmentos");
            }
        };

        fetchModeloSegmentos();
    }, []);

    const fetchModeloComercial = async () => {
        try {

            const response = await APIService.getModeloSegmentos();
            const formattedModelos = response.map((p) => ({
                id: p.codigo_segmento,
                codigo_modelo_comercial: p.codigo_modelo_comercial,
                nombre_modelo: `${p.nombre_modelo}`,
            }));
            setModelos(formattedModelos);

        } catch (error) {
            console.error("Error al obtener modelos comerciales:", error);
            toast.error(error.message || "No se pudo cargar modelos comerciales");
        }
    };


    const fetchPromotores = async () => {
        try {
            const response = await APIService.getPromotores();
            const formattedPromotores = response.map((p) => ({
                id: p.identificacion,
                nombreCompleto: `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno}`,
            }));
            setPromotores(formattedPromotores);
        } catch (error) {
            console.error("Error al obtener promotores:", error);
            toast.error(error.message || "No se pudo cargar promotores");
        }
    };

    const fetchClientesPromotor = async (cod_promotor) => {
        if (!cod_promotor) {
            setClientesRaw([]);
            return;
        }

        try {
            const raw = await APIService.getClientes(cod_promotor);
            const list =
                Array.isArray(raw) ? raw :
                    Array.isArray(raw?.data) ? raw.data :
                        Array.isArray(raw?.payload) ? raw.payload :
                            Array.isArray(raw?.result) ? raw.result :
                                [];

            const formatted = list
                .filter(p => p?.cod_cliente)
                .map(p => ({
                    cod_cliente: String(p.cod_cliente ?? '').trim(),
                    nombre: String(p.nombre ?? '').trim(),
                    cod_tipo_clienteh: String(p.cod_tipo_clienteh ?? '').trim(),
                }));

            setClientesRaw(formatted);
        } catch (error) {
            const msg = error?.response?.data?.mensaje || error?.message || 'No se pudo cargar clientes del promotor';
            toast.error(msg);
            setClientesRaw([]);
        }
    };

    const fetchDirecciones = async (cod_promotor, cod_cliente) => {
        if (!cod_promotor || !cod_cliente) { setDirecciones([]); return; }
        try {
            setLoadingDirs(true);
            const raw = await APIService.getCuidades(cod_promotor, cod_cliente);
            const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
            const formatted = list.map(d => {
                const ciudad = String(d.ciudad ?? '').toUpperCase().trim();
                const nombreRaw = d?.bodega?.nombre?.trim() || String(d.nombre ?? '').trim();
                const display = (nombreRaw || 'SIN NOMBRE').toUpperCase();
                return {
                    id: String(d.cod_direccion),
                    cod_direccion: String(d.cod_direccion),
                    ciudad,
                    nombre: nombreRaw,
                    direccion: d.direccion ?? '',
                    label: display,
                };
            });
            setDirecciones(formatted);
        } catch (e) {
            toast.error(e?.message || 'No se pudieron cargar las direcciones');
            setDirecciones([]);
        } finally {
            setLoadingDirs(false);
        }
    };

    const ciudades = useMemo(() => {
        const map = new Map();
        for (const d of direcciones) {
            const key = (d.ciudad || '').toUpperCase().trim();
            if (key && !map.has(key)) map.set(key, { id: key, label: key, ciudad: d.ciudad });
        }
        return Array.from(map.values());
    }, [direcciones]);

    const tiendasPorCiudad = useMemo(() => {
        if (!form.ciudad) return [];
        const target = (form.ciudad || '').toUpperCase().trim();
        return direcciones
            .filter(d => (d.ciudad || '').toUpperCase().trim() === target)
            .map(d => ({
                id: String(d.id),
                label: d.label,
                nombre: d.nombre,
                ciudad: d.ciudad,
            }));
    }, [direcciones, form.ciudad]);

    dayjs.extend(utc);

    const obtenerPromotoria = (item) => {
        const safe = (val) => {
            if (val == null) return '';
            if (typeof val === 'object') {
                if (val.nombres || val.apellido_paterno || val.apellido_materno) {
                    return [val.nombres, val.apellido_paterno, val.apellido_materno]
                        .filter(Boolean)
                        .join(' ')
                        .trim();
                }
                if (val.nombre) return String(val.nombre).trim();
                if (val.label) return String(val.label).trim();
                if (val.ciudad) return String(val.ciudad).trim();
                return JSON.stringify(val);
            }
            return String(val).trim();
        };

        return {
            cod_form: safe(item.cod_form),
            promotor: safe(item.promotor),
            distribuidor: safe(item.cliente),
            ciudad: safe(item.bodega?.ciudad || item.tienda?.ciudad),
            tienda: safe(item.bodega?.nombre || item.tienda?.nombre),
            responsable: safe(item.bodega?.responsable),
            correoTienda: safe(item.bodega?.correo_electronico),
            telefonoTienda: safe(item.bodega?.telefono1),
            promedioVenta: safe(item.bodega?.prom_venta_tienda),
            total_vendedores: safe(item.total_vendedores),
            total_motos_piso: safe(item.total_motos_piso),
            total_motos_shi: safe(item.total_motos_shi),
            modelos_segmento: item.modelos_segmento || [],
            marcas_segmento: item.marcas_segmento || [],
        };
    };


    const clientes = React.useMemo(() => {
        const arr = (clientesRaw ?? []).map(c => ({
            id: String(c?.cod_cliente ?? ''),
            nombre: String(c?.nombre ?? '').trim(),
            tipo: String(c?.cod_tipo_clienteh ?? '').trim(),
        }));
        return arr;
    }, [clientesRaw]);

    const selectedDistribuidorForm = React.useMemo(() => {
        const id = String(form.distribuidorId ?? '');
        return clientes.find(c => c.id === id) ?? null;
    }, [clientes, form.distribuidorId]);

    const selectedDistribuidorBuscar = React.useMemo(() => {
        const id = String(buscarDistribuidorId ?? '');
        return clientes.find(c => c.id === id) ?? null;
    }, [clientes, buscarDistribuidorId]);

    const tiendaSel = useMemo(() => {
        const id = String(form.codTienda ?? '');
        const d = direcciones.find(x => String(x.id) === id) || null;
        if (!d) return null;

        const nombreRaw = String(d.nombre ?? '').trim();
        return {
            id: String(d.id),
            label: (nombreRaw || 'SIN NOMBRE').toUpperCase(),
            nombre: nombreRaw,
        };
    }, [direcciones, form.codTienda]);

    useEffect(() => {
        // Total de todas las motos piso
        const totalPiso =
            Object.values(cantidades.modelos || {}).reduce((acc, m) => acc + (Number(m.cantidad) || 0), 0) +
            (form.marcas_segmento || []).reduce((acc, m) => acc + (Number(m.cantidad) || 0), 0);

        const totalMassline =
            Object.values(cantidades.modelos || {}).reduce((acc, m) => {
                return ["3", "18", "22"].includes(String(m.cod_marca))
                    ? acc + (Number(m.cantidad) || 0)
                    : acc;
            }, 0) +
            (form.marcas_segmento || []).reduce((acc, m) => {
                return ["3", "18", "22"].includes(String(m.cod_marca))
                    ? acc + (Number(m.cantidad) || 0)
                    : acc;
            }, 0);

        setForm(prev => ({
            ...prev,
            total_motos_piso: totalPiso,
            total_motos_shi: totalMassline,
        }));
    }, [cantidades, form.marcas_segmento, setForm]);


    return (
        <>{loading ? (<LoadingCircle/>) : (
            <div style={{marginTop: '10px', width: "100%"}}>
                <Box sx={{mt: 1, mb: 2}}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Fecha Desde"
                                    value={fromDate}
                                    onChange={(v) => setFromDate(v)}
                                    format="DD/MM/YYYY"
                                    slotProps={{textField: {size: 'small', fullWidth: true}}}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Fecha Hasta"
                                    value={toDate}
                                    onChange={(v) => setToDate(v)}
                                    format="DD/MM/YYYY"
                                    slotProps={{textField: {size: 'small', fullWidth: true}}}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                options={clientes}
                                getOptionLabel={(o) => o?.nombre ?? ''}
                                value={selectedDistribuidorBuscar}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                onChange={(_, v) => {
                                    setBuscarDistribuidorId(v ? v.id : '');
                                    setBuscarDistribuidorNombre(v?.nombre ?? '');
                                }}
                                renderInput={(params) => <TextField {...params} label="Distribuidor" />}
                                fullWidth
                                clearOnEscape
                                disablePortal
                                size="small"
                                disabled={cargandoPromotor}
                            />
                        </Grid>
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon/>}
                                onClick={handleChangeDateCli}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    backgroundColor: 'firebrick',
                                    '&:hover': {backgroundColor: 'firebrick'},
                                }}
                                disabled={
                                    cargandoPromotor ||
                                    !fromDate || !toDate ||
                                    (!buscarDistribuidorId && !(buscarDistribuidorNombre || '').trim())
                                }
                            >
                                Buscar
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={() => {
                                    setMostrarFormulario(true);
                                    setMostrarTabla(false);
                                    limpiarFormulario();
                                    setFromDate(null);
                                    setToDate(null);
                                    setBuscarDistribuidorId('');
                                    setBuscarDistribuidorNombre('');
                                }}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    backgroundColor: 'firebrick',
                                    '&:hover': { backgroundColor: 'firebrick' },
                                }}
                            >
                                Nuevo
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Box sx={{width: '100%', maxWidth: 2050}}>
                        {mostrarFormulario && (
                            <>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{textAlign: 'center', mt: 2}}
                                >
                                    VISITA TIENDA PROMOTORÍA
                                </Typography>
                                <Paper elevation={1} sx={{p: 2, mt: 3}}>
                                    <Grid container columnSpacing={2} rowSpacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Promotor"
                                                value={
                                                    promotorActual
                                                        ? `${promotorActual.nombres ?? ''} ${promotorActual.apellido_paterno ?? ''} ${promotorActual.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim()
                                                        : ''
                                                }
                                                fullWidth
                                                size="medium"
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Autocomplete
                                                options={clientes}
                                                getOptionLabel={(o) => o?.nombre ?? ''}
                                                value={selectedDistribuidorForm}
                                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                                onChange={(_, v) => {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        distribuidorId: v ? v.id : '',
                                                        distribuidorNombre: v?.nombre ?? '',
                                                        ciudad: '',
                                                        codTienda: '',
                                                        tienda: '',
                                                        tiendaNombre: '',
                                                    }));
                                                }}
                                                renderInput={(params) => <TextField {...params} label="Distribuidor" />}
                                                fullWidth
                                                clearOnEscape
                                                disablePortal
                                                disabled={!form.promotor}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <Autocomplete
                                                options={ciudades}
                                                getOptionLabel={(o) => o?.label ?? ''}
                                                value={ciudades.find(c => c.id === (form.ciudad || '').toUpperCase()) || null}
                                                onChange={(_, v) => setForm(prev => ({
                                                    ...prev,
                                                    ciudad: v ? v.ciudad : '',
                                                    codTienda: '',
                                                    tienda: '',
                                                }))}
                                                isOptionEqualToValue={(a, b) => a.id === (b?.id ?? b)}
                                                renderInput={(params) => <TextField {...params} label="Ciudad"/>}
                                                fullWidth
                                                clearOnEscape
                                                disablePortal
                                                disabled={!form.promotor || !form.distribuidorId}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <Autocomplete
                                                options={tiendasPorCiudad}
                                                getOptionLabel={(o) => o?.label ?? ''}
                                                value={tiendaSel}
                                                onChange={async (_, v) => {
                                                    if (v && typeof v === 'object') {
                                                        setForm(prev => ({
                                                            ...prev,
                                                            codTienda: v.id,
                                                            tienda: v.label,
                                                        }));
                                                        try {
                                                            const clienteId = form.distribuidorId;
                                                            const data = await APIService.getTiendas(
                                                                enterpriseShineray,
                                                                clienteId,
                                                                v.id
                                                            );
                                                            if (data) {
                                                                setForm(prev => ({
                                                                    ...prev,
                                                                        responsable: data.bodega?.responsable || '',
                                                                    telefono1: data.bodega?.telefono1 || '',
                                                                    correoTienda: data.bodega?.correo_electronico || '',
                                                                    prom_venta_tienda: data.prom_venta_tienda || ''
                                                                }));
                                                            }
                                                        } catch (error) {
                                                            console.error("Error cargando info tienda:", error);
                                                            toast.error("No se pudo cargar info de la tienda");
                                                        }
                                                    } else {
                                                        setForm(prev => ({
                                                            ...prev,
                                                            codTienda: '',
                                                            tienda: '',
                                                            responsable: '',
                                                            telefono1: '',
                                                            correoTienda: '',
                                                            prom_venta_tienda: ''
                                                        }));
                                                    }
                                                }}
                                                isOptionEqualToValue={(a, b) => `${a.id}` === `${b?.id ?? b}`}
                                                renderInput={(params) => <TextField {...params} label="Tienda" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Jefe Tienda"
                                                value={form.responsable || ''}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Correo"
                                                value={form.correoTienda || ''}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="Teléfono"
                                                value={form.telefono1 || ''}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="Promedio Venta"
                                                value={form.prom_venta_tienda || ''}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={1}>
                                            <TextField
                                                label="# Vendedores"
                                                type="number"
                                                value={form.total_vendedores ?? ''}
                                                onChange={handleChange('total_vendedores')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={1}>
                                            <TextField
                                                label="T. MOTOS PISO"
                                                type="number"
                                                value={form.total_motos_piso ?? ''}
                                                onChange={handleChange('total_motos_piso')}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid><Grid item xs={12} md={1}>
                                            <TextField
                                                label="T. MOTOS SHINERAY"
                                                type="number"
                                                value={form.total_motos_shi ?? ''}
                                                onChange={handleChange('total_motos_shi')}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <IngresoModelosTabs
                                                modelosPorSegmento={modelosPorSegmento}
                                                cantidades={cantidades}
                                                setCantidades={setCantidades}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TablaResumenMarcas
                                                modelosPorSegmento={modelosPorSegmento}
                                                cantidades={cantidades}
                                                form={form}
                                                setForm={setForm}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{display: 'flex', justifyContent: 'center', gap: 2}}>

                                                <Grid item xs={12}>
                                                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 2}}>
                                                        <Button
                                                            variant="contained"
                                                            sx={{ backgroundColor: 'firebrick', '&:hover': { backgroundColor: 'darkred' } }}
                                                            onClick={handleSubmit}
                                                        >
                                                            {modoEdicion ? 'Actualizar promotoría' : 'Guardar'}
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => {
                                                                limpiarFormulario();
                                                                setMostrarFormulario(false);
                                                                setModoEdicion(false);
                                                            }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </Box>
                                                </Grid>

                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </>
                        )}
                        {mostrarTabla && (
                            <Box sx={{ mt: 5, width: "100%", px: 2 }}>
                                <CollapsibleTable
                                    cabeceras={formularios}
                                    modeloSegmentos={modelos}
                                    APIService={APIService}
                                />
                            </Box>
                        )}
                    </Box>
                    <Snackbar open={alerta.open} autoHideDuration={3000}
                              onClose={() => setAlerta({...alerta, open: false})}>
                        <Alert onClose={() => setAlerta({...alerta, open: false})} severity={alerta.severity}
                               sx={{width: '100%'}}>
                            {alerta.msg}
                        </Alert>
                    </Snackbar>
                </Box>
            </div>
        )}</>
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <FrmPromotoria/>
        </SnackbarProvider>
    );
}