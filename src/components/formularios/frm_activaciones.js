import React, {useEffect, useMemo, useState} from 'react';
import {
    TextField, Button, Grid, Typography,
    Select, MenuItem, Box, Snackbar,
    Alert, IconButton, Tooltip, InputLabel,
    FormControl, Autocomplete
} from '@mui/material';
import {useAuthContext} from "../../context/authContext";
import {SnackbarProvider} from "notistack";
import API from "../../services/modulo_formularios";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Navbar0 from "../Navbar0";
import ButtonGroup from "@mui/material/ButtonGroup";
import LoadingCircle from "../contabilidad/loader";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from "@material-ui/icons/Add";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import SearchIcon from "@material-ui/icons/Search";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {getMuiTheme, getTableOptions} from "../marketing/muiTableConfig";
import MUIDataTable from "mui-datatables";
import {ThemeProvider} from "@mui/material/styles";
import Paper from "@mui/material/Paper";

const FrmActivaciones = () => {
    const {jwt, userShineray, enterpriseShineray, systemShineray} = useAuthContext();
    const APIService = useMemo(
        () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
        [jwt, userShineray, enterpriseShineray, systemShineray]
    );

    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [indexEditar, setIndexEditar] = useState(null);
    const [mostrarTabla, setMostrarTabla] = useState(false);
    const [promotores, setPromotores] = useState([]);
    const [tipoActivaciones, setTipoActivaciones] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [clientesRaw, setClientesRaw] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [loadingDirs, setLoadingDirs] = useState(false);

    const [promotorActual, setPromotorActual] = useState(null);
    const [cargandoPromotor, setCargandoPromotor] = useState(true);

    const [buscarDistribuidorId, setBuscarDistribuidorId] = useState('');
    const [buscarDistribuidorNombre, setBuscarDistribuidorNombre] = useState('');

    const todayISO = () => dayjs().format('YYYY-MM-DD');



    const setField = (key, value) => setForm(prev => ({...prev, [key]: value}));

    const renderById = (getLabel) => (props, option) => (
        <li {...props} key={`${option.id}`}>{getLabel(option)}</li>
    );

    const [form, setForm] = useState({
        fecha: todayISO(),
        horaInicio: '',
        horaFinal: '',
        promotorId: '',
        distribuidorId: '',
        horas: '',
        canal: '',
        codTienda: '',
        codProveedor: '',
        cod_promotor: '',
        cod_cliente: '',
        cod_proveedor: '',
        distribuidor: '',
        animadoraNombre: '',
        tiendaNombre: '',
        tienda: '',
        motos: 0,
        tipoActivacion: '',
        promotor: '',
        animadora: '',
        ToDate: '',
        FromDate: ''
    });

    const [activaciones, setActivaciones] = useState([]);
    const [alerta, setAlerta] = useState({open: false, msg: '', severity: 'info'});

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
        fetchTipoActivaciones();
        fetchProveedores();
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

    function buildActivacionPayload(form, empresa) {
        const safeInt = (v) =>
            v === '' || v === null || v === undefined || Number.isNaN(Number(v))
                ? null
                : parseInt(String(v), 10);

        const proveedorSel = Array.isArray(proveedores)
            ? proveedores.find(p => String(p.id) === String(form.codProveedor))
            : null;

        const animadora = String(form.animadoraNombre || proveedorSel?.nombre || '')
            .trim();

        return {
            empresa:        safeInt(empresa),
            cod_promotor:   String(form.promotor ?? '').trim(),
            cod_cliente:    String(form.distribuidorId ?? '').trim(),
            cod_tienda:     safeInt(form.codTienda),
            cod_proveedor:  (form.codProveedor ?? '') ? String(form.codProveedor).trim() : null,
            cod_modelo_act: 'ACT',
            cod_item_act:   String(form.tipoActivacion ?? '').trim(),
            animadora,
            hora_inicio:    String(form.horaInicio ?? '').trim(),
            hora_fin:       String(form.horaFinal ?? '').trim(),
            fecha_act:      String(form.fecha ?? '').trim(),
            num_exhi_motos: safeInt(form.motos),
        };
    }

    const handleSubmit = async () => {

        const required = [
            'fecha', 'horaInicio', 'horaFinal',
            'promotor', 'distribuidorId', 'codTienda',
            'tipoActivacion', 'motos', 'codProveedor'
        ];
        const missing = required.filter(f => !form[f] && form[f] !== 0);
        if (missing.length) {
            setAlerta({ open: true, msg: 'Por favor completa todos los campos obligatorios.', severity: 'warning' });
            return;
        }

        const tiendaSel = (direcciones || []).find(d => String(d.id) === String(form.codTienda)) || null;
        const nombreActual    = (tiendaSel?.nombre || '').trim().toUpperCase();
        const nombreIngresado = (form.tiendaNombre || '').trim();
        const faltaNombre     = !nombreActual || nombreActual === 'SIN NOMBRE';

        const payload = buildActivacionPayload(form, enterpriseShineray);

        payload.fecha_act = String(form.fecha || dayjs().format('YYYY-MM-DD')).trim();

        try {
            if (faltaNombre && nombreIngresado && tiendaSel) {
                const putBody = {
                    ciudad: (tiendaSel?.ciudad || '').toString().trim(),
                    es_activo: 1,
                    direccion: tiendaSel?.direccion || '',
                    direccion_larga: tiendaSel?.direccion_larga || '',
                    cod_zona_ciudad: tiendaSel?.cod_zona_ciudad || '',
                    nombre: nombreIngresado.toUpperCase(),
                };

                await APIService.putDireccionGuia(
                    enterpriseShineray,
                    String(form.distribuidorId),
                    Number(form.codTienda),
                    putBody
                );
            }
            if (modoEdicion) {
                await APIService.updateActivaciones(form.cod_activacion, payload);
            } else {
                await APIService.postActivaciones(enterpriseShineray, payload);
            }

            const fIni = fromDate ? dayjs(fromDate).format('YYYY-MM-DD') : null;
            const fFin = toDate   ? dayjs(toDate).format('YYYY-MM-DD')   : null;
            const params = {};
            if (fIni && fFin) { params.fecha_inicio = fIni; params.fecha_fin = fFin; }
            if (buscarDistribuidorId) { params.cod_cliente = String(buscarDistribuidorId); }

            const resp = await APIService.getActivacionesPromotor(enterpriseShineray, form.promotor, params);
            const data = Array.isArray(resp) ? resp : (resp?.data ?? []);
            const tiposDict = mapTipoById(tipoActivaciones);
            const rows = data.map(it => obtenerActivacion(it, tiposDict));
            setActivaciones(rows);

            setAlerta({
                open: true,
                msg: modoEdicion ? 'Activación actualizada con éxito.' : 'Activación guardada con éxito.',
                severity: 'success'
            });
            limpiarFormulario();
            setMostrarFormulario(false);
            setMostrarTabla(true);
            setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);

        } catch (error) {
            console.error('Error al guardar/actualizar activación:', error);
            const msg = error?.response?.data?.mensaje || error?.message || (modoEdicion ? 'Error al actualizar.' : 'Error al guardar.');
            setAlerta({ open: true, msg, severity: 'error' });
        }
    };


    const limpiarFormulario = () => {
        setForm(prev => ({
            ...prev,
            fecha: todayISO(),
            ToDate: '',
            FromDate: '',
            horaInicio: '',
            horaFinal: '',
            horas: '',
            canal: '',
            ciudad: '',
            distribuidor: '',
            tienda: '',
            motos: '',
            tipoActivacion: '',
            animadora: '',
            distribuidorId: '',
            codTienda: '',
            tiendaNombre: '',
            codProveedor: '',
            animadoraNombre: '',

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
            const params = { fecha_inicio: fIni, fecha_fin: fFin, cod_cliente: codCliente };
            const resp = await APIService.getActivacionesPromotor(enterpriseShineray, form.promotor, params);
            const data = Array.isArray(resp) ? resp : (resp?.data ?? []);
            const tiposDict = mapTipoById(tipoActivaciones);
            const rows = data.map(it => obtenerActivacion(it, tiposDict));

            if (rows.length === 0) {
                setActivaciones([]);
                setMostrarTabla(true);
                setAlerta({ open: true, msg: 'No se encontraron registros con esos filtros.', severity: 'warning' });
                return;
            }
            setActivaciones(rows);
            setMostrarTabla(true);
            setAlerta({ open: true, msg: 'Datos cargados correctamente.', severity: 'success' });
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.mensaje || error?.message || 'Error al cargar activaciones.';
            setAlerta({ open: true, msg, severity: 'error' });
        }
    };




    useEffect(() => {
        if (form.horaInicio && form.horaFinal) {
            const inicio = dayjs(`2023-01-01T${form.horaInicio}`);
            const fin = dayjs(`2023-01-01T${form.horaFinal}`);
            const diferencia = fin.diff(inicio, 'minute');
            const horas = Math.floor(diferencia / 60);
            const minutos = diferencia % 60;
            setForm((prev) => ({
                ...prev,
                horas: `${horas}:${minutos.toString().padStart(2, '0')}`
            }));
        }
    }, [form.horaInicio, form.horaFinal]);

    const columns = [
        { name: "cod_activacion", label: "CÓDIGO" },
        { name: "tipoActivacion", label: "TIPO ACTIVACIÓN" },
        { name: "promotor", label: "AGENCIA" },
        { name: "distribuidor", label: "DISTRIBUIDOR" },
        { name: "canal", label: "CANAL" },
        { name: "ciudad", label: "CIUDAD" },
        { name: "tienda", label: "TIENDA" },
        { name: "fecha", label: "FECHA" },
        { name: "horaInicio", label: "HORAS INICIO" },
        { name: "horaFinal", label: "HORA FINAL" },
        { name: "horas", label: "HORAS" },
        { name: "motos", label: "# MOTOS EXHIBICIÓN" },
        { name: "animadora", label: "ANIMADORA" },
        {
            name: "acciones",
            label: "ACCIONES",
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const row = activaciones[dataIndex];
                    return (
                        <Tooltip title="Editar">
                            <IconButton
                                color="primary"
                                onClick={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        cod_activacion: row.cod_activacion,
                                        promotor: row.cod_promotor || prev.promotor,
                                        distribuidorId: row.cod_cliente || '',
                                        distribuidorNombre: row.distribuidor || '',
                                        ciudad: row.ciudad || '',
                                        codTienda: row.cod_tienda || '',
                                        tienda: row.tienda || '',
                                        tiendaNombre: '',
                                        tipoActivacion: row.cod_item_act || '',
                                        codProveedor: row.cod_proveedor || '',
                                        animadoraNombre: row.animadora || '',
                                        fecha: row.fechaISO || prev.fecha,
                                        horaInicio: row.horaInicio || '',
                                        horaFinal: row.horaFinal || '',
                                        horas: row.horas || '',
                                        motos: row.motos ?? '',
                                        canal: row.canal || '',
                                    }));
                                    fetchDirecciones(
                                        (row.cod_promotor || form.promotor),
                                        row.cod_cliente
                                    );
                                    setMostrarFormulario(true);
                                    setModoEdicion(true);
                                    setIndexEditar(dataIndex);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    );
                },
            },
        },
    ];

    const camposPlantillaModelo = [
        "cod_activacion", "fecha",
        "horaInicio", "horaFinal",
        "horas", "canal", "ciudad", "distribuidor", "tienda",
        "motos", "tipoActivacion", "promotor", "animadora",
    ];
    const tableOptions = getTableOptions(activaciones, camposPlantillaModelo, "Actualizar_activaciones.xlsx");

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

    const fetchTipoActivaciones = async () => {
        try {
            const raw = await APIService.getTipoActivaciones(enterpriseShineray);
            const list =
                Array.isArray(raw) ? raw :
                    Array.isArray(raw?.data) ? raw.data :
                        Array.isArray(raw?.payload) ? raw.payload :
                            Array.isArray(raw?.result) ? raw.result :
                                [];

            const formatted = list.map(p => ({
                id: p.cod_item,
                cod_item: p.cod_item,
                cod_modelo: p.cod_modelo,
                nombre: p.nombre,
            }));
            setTipoActivaciones(formatted);
        } catch (error) {
            const msg = error?.response?.data?.mensaje || error?.message || 'No se pudo cargar tipos de activaciones';
            toast.error(msg);
        }
    };

    const fetchProveedores = async () => {
        try {
            const raw = await APIService.getProveedores(enterpriseShineray);
            const list =
                Array.isArray(raw) ? raw :
                    Array.isArray(raw?.data) ? raw.data :
                        Array.isArray(raw?.payload) ? raw.payload :
                            Array.isArray(raw?.result) ? raw.result :
                                [];

            const formatted = list.map(p => ({
                id: p.cod_proveedor,
                nombre: p.nombre,
            }));

            setProveedores(formatted);
        } catch (error) {
            const msg = error?.response?.data?.mensaje || error?.message || 'No se pudo cargar los proveedores';
            toast.error(msg);
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
                const nombreRaw = String(d.nombre ?? '').trim();
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

    const mapTipoById = (listaTipos = []) =>
        Object.fromEntries(listaTipos.map(t => [t.id, t.nombre]));

    const minutosAHoras = (min = 0) => {
        const m = Number(min || 0);
        const h = Math.floor(m / 60);
        const mm = `${m % 60}`.padStart(2, '0');
        return `${h}:${mm}`;
    };

    const normStr = (s) =>
        String(s ?? "")
            .replace(/\t/g, "")
            .replace(/\s+/g, " ")
            .trim();

    const normNombreTienda = (s) => normStr(s);

    const getNombreTienda = (tienda, bodega) => {

        const t = normNombreTienda(tienda?.nombre);
        const b = normNombreTienda(bodega?.nombre);

        return t || b || "SIN NOMBRE";
    };

    const canalFromTipo = (t) =>
        (String(t || '').trim().toUpperCase() === 'MY' ? 'MAYOREO' : 'RETAIL');

    const getCanal = (it) =>
        canalFromTipo(
            it?.cliente_hor?.cod_tipo_clienteh ?? it?.cliente?.cod_tipo_clienteh
        );

    dayjs.extend(utc);
    const obtenerActivacion = (item, tiposDict) => {
        const fUTC = item.fecha_act ? dayjs.utc(item.fecha_act) : null;

        return {
            cod_activacion: item.cod_activacion,
            tipoActivacion: tiposDict[item?.cod_item_act] || item?.cod_item_act || '',
            promotor: [item?.promotor?.nombres, item?.promotor?.apellido_paterno, item?.promotor?.apellido_materno]
                .filter(Boolean).join(' ').trim(),
            distribuidor: [item?.cliente?.nombre, item?.cliente?.apellido1].filter(Boolean).join(' ').trim(),
            canal: getCanal(item),
            ciudad: item?.tienda?.ciudad || '',
            tienda: getNombreTienda(item?.tienda, item?.bodega),
            fecha:   fUTC ? fUTC.format('DD/MM/YYYY') : '',
            fechaISO: fUTC ? fUTC.format('YYYY-MM-DD') : '',
            horaInicio: item.hora_inicio || '',
            horaFinal:  item.hora_fin || '',
            horas: item.total_minutos != null ? minutosAHoras(item.total_minutos) : '',
            motos: Number(item?.num_exhi_motos ?? 0),
            animadora: item?.animadora || (item?.proveedor?.nombre || '').trim(),
            cod_cliente: String(item.cod_cliente ?? '').trim(),
            cod_tienda:  String(item.cod_tienda ?? '').trim(),
            cod_proveedor: item.cod_proveedor ? String(item.cod_proveedor).trim() : '',
            cod_item_act: String(item.cod_item_act ?? '').trim(),
            cod_modelo_act: String(item.cod_modelo_act ?? 'ACT').trim(),
            cod_promotor: String(item.cod_promotor ?? '').trim(),
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

    React.useEffect(() => {
        if (selectedDistribuidorForm) {
            setForm(prev => ({
                ...prev,
                canal: canalFromTipo(selectedDistribuidorForm.tipo),
                distribuidorNombre: selectedDistribuidorForm.nombre ?? '',
            }));
        } else {
            setForm(prev => ({ ...prev, canal: '' }));
        }
    }, [selectedDistribuidorForm]);

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

    const faltaNombreTienda = useMemo(() => {
        const n = (tiendaSel?.nombre || '').trim().toUpperCase();
        return !n || n === 'SIN NOMBRE';
    }, [tiendaSel]);

    return (
        <>{loading ? (<LoadingCircle/>) : (
            <div style={{marginTop: '150px', width: "100%"}}>
                <Navbar0 menus={menus}/>
                <Box>
                    <ButtonGroup variant="text">
                        <Button onClick={() => navigate('/dashboard')}>Módulos</Button>
                        <Button onClick={() => navigate(-1)}>Catálogos</Button>
                    </ButtonGroup>
                </Box>
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
                    <Box sx={{width: '100%', maxWidth: 1900}}>
                        {mostrarFormulario && (
                            <>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{textAlign: 'center', mt: 2}}
                                >
                                    ACTIVACIONES SHINERAY-BULTACO
                                </Typography>
                                <Paper elevation={1} sx={{p: 2, mt: 3}}>
                                    <Grid container columnSpacing={2} rowSpacing={2}>
                                        <Grid item xs={12} md={2}>
                                            <Autocomplete
                                                options={tipoActivaciones ?? []}
                                                getOptionLabel={(o) => (o?.nombre ? o.nombre.toUpperCase() : '')}
                                                value={tipoActivaciones.find(act => act.id === form.tipoActivacion) || null}
                                                onChange={(_, v) => handleChange('tipoActivacion')({target: {value: v ? v.id : ''}})}
                                                isOptionEqualToValue={(a, b) => a.id === (b?.id ?? b)}
                                                renderInput={(params) => <TextField {...params} label="Tipo Activación"/>}
                                                fullWidth
                                                clearOnEscape
                                                disablePortal
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Promotor"
                                                value={
                                                    promotorActual
                                                        ? `${promotorActual.nombres ?? ''} ${promotorActual.apellido_paterno ?? ''} ${promotorActual.apellido_materno ?? ''}`.replace(/\s+/g,' ').trim()
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
                                            <FormControl fullWidth>
                                                <InputLabel id="canal-label">Canal</InputLabel>
                                                <Select
                                                    labelId="canal-label"
                                                    label="Canal"
                                                    value={form.canal || ''}
                                                    onChange={() => {
                                                    }}
                                                    variant="outlined"
                                                    disabled
                                                >
                                                    <MenuItem value="RETAIL">RETAIL</MenuItem>
                                                    <MenuItem value="MAYOREO">MAYOREO</MenuItem>
                                                </Select>
                                            </FormControl>
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
                                        <Grid item xs={12} md={4}>
                                            <Autocomplete
                                                options={tiendasPorCiudad}
                                                getOptionLabel={(o) => o?.label ?? ''}
                                                value={tiendaSel}
                                                onChange={(_, v) => {
                                                    if (v && typeof v === 'object') {
                                                        setForm(prev => ({
                                                            ...prev,
                                                            codTienda: v.id,
                                                            tienda: v.label,
                                                        }));
                                                    } else {
                                                        setForm(prev => ({ ...prev, codTienda: '', tienda: ''  }));
                                                    }
                                                }}
                                                isOptionEqualToValue={(a,b) => `${a.id}` === `${b?.id ?? b}`}
                                                renderInput={(p) => <TextField {...p} label="Tienda" />}
                                            />
                                        </Grid>
                                        {form.codTienda && (faltaNombreTienda || (form.tiendaNombre || '').trim()) && (
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    label="Nombre de Tienda (faltante)"
                                                    value={form.tiendaNombre || ''}
                                                    onChange={(e) =>
                                                        setForm(prev => ({ ...prev, tiendaNombre: (e.target.value || '').toUpperCase() }))
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="Fecha"
                                                type="date"
                                                value={form.fecha || todayISO()}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{
                                                    min: form.fecha || todayISO(),
                                                    max: form.fecha || todayISO(),
                                                    readOnly: true
                                                }}
                                                disabled
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="Hora Inicio"
                                                type="time"
                                                value={form.horaInicio || ''}
                                                onChange={handleChange('horaInicio')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="Hora Final"
                                                type="time"
                                                value={form.horaFinal || ''}
                                                onChange={handleChange('horaFinal')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="Total horas"
                                                value={form.horas || ''}
                                                InputProps={{readOnly: true}}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                label="# Motos Exhibición"
                                                type="number"
                                                value={form.motos ?? ''}
                                                onChange={handleChange('motos')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Autocomplete
                                                options={proveedores ?? []}
                                                getOptionLabel={(o) => (o?.nombre ? o.nombre.toUpperCase() : '')}
                                                renderOption={renderById(o => o?.nombre ?? '')}
                                                value={proveedores.find(p => `${p.id}` === `${form.codProveedor}`) || null}
                                                onChange={(_, v) =>
                                                    setForm(prev => ({
                                                        ...prev,
                                                        codProveedor: v ? v.id : '',
                                                    }))
                                                }
                                                isOptionEqualToValue={(a, b) => `${a.id}` === `${b?.id ?? b}`}
                                                renderInput={(params) => <TextField {...params} label="Agencia"/>}
                                                fullWidth
                                                clearOnEscape
                                                disablePortal
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Nombre Animadora"
                                                value={form.animadoraNombre || ''}
                                                onChange={(e) => setField('animadoraNombre', e.target.value.toUpperCase())}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{display: 'flex', justifyContent: 'center', gap: 2}}>
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: 'firebrick',
                                                        '&:hover': {backgroundColor: 'darkred'}
                                                    }}
                                                    onClick={handleSubmit}
                                                >
                                                    {modoEdicion ? 'Actualizar Activación' : 'Guardar'}
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
                                    </Grid>
                                </Paper>
                            </>
                        )}
                        {mostrarTabla && (
                            <Box sx={{mt: 5, width: '100%', px: 2}}>
                                <ThemeProvider theme={getMuiTheme()}>
                                    <Box sx={{width: '100%', '& .MuiPaper-root': {width: '100%'}}}>
                                        <MUIDataTable
                                            title="ACTIVACIONES REGISTRADAS"
                                            data={activaciones}
                                            columns={columns}
                                            options={{
                                                ...tableOptions,
                                                responsive: 'standard',
                                            }}
                                        />
                                    </Box>
                                </ThemeProvider>
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
            <FrmActivaciones/>
        </SnackbarProvider>
    );
}