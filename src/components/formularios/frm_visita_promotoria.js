// ------------------------------------ MODULO PRINCIPAL CARGA LAS ENCUESTAS Y EL FORMULARIO PROMOTORÍA VISITA TIENDA MODELOS
import React, {useEffect, useMemo, useState} from 'react';
import {SnackbarProvider} from "notistack";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import {Autocomplete, Button, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import API from "../../services/modulo_formularios";
import {EncuestaExhibicion, EncuestaInteraccion} from "./frm_encuesta_vp";
import Navbar0 from "../Navbar0";
import LoadingCircle from "../contabilidad/loader";
import {useAuthContext} from "../../context/authContext";
import FrmActivaciones from "../formularios/frm_activaciones";
import FrmPromotoria from "../formularios/frm_promotoria";
import {Grid} from "@material-ui/core";

const up = (s) => (s ?? '').toString().toUpperCase();
const clean = (s) => {
    const v = s == null ? null : String(s).trim();
    return v === '' ? null : v;
};
const num = (x) => (x === 0 || x ? Number(x) : null);
const bool01 = (v) => {
    if (v === 0 || v === 1) return v;
    const s = up(v);
    if (s === 'SI' || s === 'S' || s === 'TRUE') return 1;
    if (s === 'NO' || s === 'N' || s === 'FALSE') return 0;
    if (s === 'N/A') return null;
    return null;
};

const VisitaPromotoria = () => {
    const {jwt, userShineray, enterpriseShineray, systemShineray} = useAuthContext();
    const APIService = useMemo(
        () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
        [jwt, userShineray, enterpriseShineray, systemShineray]
    );
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [loading] = useState(false);
    const [form, setForm] = useState({
        promotor: "",
        distribuidorId: "",
        codTienda: "",
        resumenMarcas: {},
    });

    const [guardando, setGuardando] = useState(false);
    const [guardada, setGuardada] = useState(false);
    const [mostrarSegundo, setMostrarSegundo] = useState(false);
    const [clientesRaw, setClientesRaw] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [loadingDirs, setLoadingDirs] = useState(false);
    const [promotorActual, setPromotorActual] = useState(null);
    const [cargandoPromotor, setCargandoPromotor] = useState(true);
    const [usuarioOracle, setUsuarioOracle] = useState("");

    useEffect(() => {
        window.__api = APIService;
        //console.debug("[CMP] window.__api listo (no imprime credenciales)");
    }, [APIService]);

    const getMenus = async () => {
        try {
            setMenus(await APIService.getMenus());
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        getMenus();
    }, []);

    const up = (s) => (s ?? '').toString().toUpperCase();

    const validarRegistro = (f) => {
        const faltan = [];
        if (!f.promotor) faltan.push('promotor');
        if (!f.distribuidorId) faltan.push('distribuidorId');
        if (!f.codTienda) faltan.push('codTienda');
        return {ok: faltan.length === 0, faltan};
    };

    const validarEncuesta = (f) => {
        const faltan = [];
        const errores = [];

        // Limpieza y orden
        if (!num(f.limp_orden)) faltan.push('limp_orden');

        if (bool01(f.pop_actual) == null) faltan.push('pop_actual');
        if (up(f.pop_actual) === 'NO') {
            if (!f.pop_material_desactualizado || f.pop_material_desactualizado.length === 0) {
                faltan.push('pop_material_desactualizado');
            }
            if (f.pop_material_desactualizado?.includes("Otros") && !clean(f.otros_pop_material)) {
                faltan.push('otros_pop_material');
            }
        }

        // POP suficiencia %
        const ps = num(f.pop_sufic);
        if (!(typeof ps === 'number' && ps >= 0 && ps <= 100) && up(f.pop_sufic) !== 'N/A') {
            errores.push('pop_sufic(0..100 o N/A)');
        }

        // Precio visible
        if (bool01(f.prec_vis_corr) == null && up(f.prec_vis_corr) !== "N/A") {
            faltan.push("prec_vis_corr");
        }
        // Motos con desperfectos
        if (bool01(f.motos_desper) == null) faltan.push('motos_desper');
        if (up(f.motos_desper) === 'SI') {
            if (!f.motos_desper || f.motos_desper.length === 0) {
                faltan.push('motos_danos');
            }
            if (f.motos_desper?.includes("Otros") && !clean(f.motos_desper)) {
                faltan.push('motos_danos_otros');
            }
        }
        // Motos con componentes faltantes
        if (bool01(f.motos_falt) == null) faltan.push('motos_falt');
        if (f.motos_falt?.includes("Otros") && !clean(f.motos_falt)) {
            faltan.push('motos_falt');
        }

        // Estado batería
        if (bool01(f.motos_bat) == null) {
            faltan.push('motos_bat');
        }
        if (up(f.motos_bat) === 'SI' && !clean(f.estado_bateria)) {
            faltan.push('estado_bateria');
        }

        // Publicidad
        if (bool01(f.estado_publi) == null && up(f.estado_publi) !== "N/A") {
            faltan.push('estado_publi');
        }
        if (up(f.estado_publi) === 'NO') {
            if (!f.estado_publi_problemas || f.estado_publi_problemas.length === 0) {
                faltan.push('estado_publi_problemas');
            }
            if (f.estado_publi_problemas?.includes("Otros") && !clean(f.estado_publi_otros)) {
                faltan.push('estado_publi_otros');
            }
        }

        // Material POP desactualizado → Otros
        if (f.pop_material_desactualizado?.includes("Otros") && !clean(f.otros_pop_material)) {
            faltan.push('otros_pop_material');
        }

        // Conocimientos
        if (!num(f.conoc_portaf) && up(f.conoc_portaf) !== 'N/A') faltan.push('conoc_portaf');
        if (!num(f.conoc_prod) && up(f.conoc_prod) !== 'N/A') faltan.push('conoc_prod');
        if (!num(f.conoc_garan) && up(f.conoc_garan) !== 'N/A') faltan.push('conoc_garan');
        if (!num(f.conoc_shibot) && up(f.conoc_shibot) !== 'N/A') faltan.push('conoc_shibot');

        // Ubicación de talleres (RadioSiNo)
        if (bool01(f.ubi_talleres) == null) {
            faltan.push('ubi_talleres');
        }

        if (up(f.existe_promo) === 'N/A') {
        } else if (![ "SI", "NO" ].includes(up(f.existe_promo))) {
            faltan.push("existe_promo");
        }

        if (up(f.existe_promo) === "SI" && !["SI", "NO"].includes(up(f.conoc_promo))) {
            faltan.push("conoc_promo");
        }

        // Normalizar incentivos
        const incentivosVen = Array.isArray(f.incentivos_ven)
            ? f.incentivos_ven
            : (f.incentivos_ven ? [f.incentivos_ven] : []);
        const incentivosJef = Array.isArray(f.incentivos_jef)
            ? f.incentivos_jef
            : (f.incentivos_jef ? [f.incentivos_jef] : []);

        // Incentivos vendedores
        if (Number(f.confor_compe_v) >= 3) {
            if (!incentivosVen || incentivosVen.length === 0) faltan.push('incentivos_ven');
            if (incentivosVen.includes("BONO EN EFECTIVO") && !num(f.bono_efectivo_valor)) {
                faltan.push('bono_efectivo_valor');
            }
            if (incentivosVen.includes("OTROS") && !clean(f.incentivos_ven_otros)) {
                faltan.push('incentivos_ven_otros');
            }
        }

        // Incentivos jefes
        if (Number(f.confor_compe_j) >= 3) {
            if (!incentivosJef || incentivosJef.length === 0) faltan.push('incentivos_jef');
            if (incentivosJef.includes("BONO EN EFECTIVO") && !num(f.bono_efectivo_valor_jefe)) {
                faltan.push('bono_efectivo_valor_jefe');
            }
            if (incentivosJef.includes("OTROS") && !clean(f.incentivos_jefe_otros)) {
                faltan.push('incentivos_jefe_otros');
            }
        }

        return { completa: faltan.length === 0 && errores.length === 0, faltan, errores };
    };

    const validarTodo = (f) => {
        const reg = validarRegistro(f);
        const enc = validarEncuesta(f);
        return {completa: reg.ok && enc.completa, faltan: [...reg.faltan, ...enc.faltan], errores: enc.errores};
    };

    const todoCompleto = React.useMemo(() => validarTodo(form).completa, [form]);


    const sanitizeBusinessRules = (e) => {
        const out = { ...e };
        if (up(out.estado_publi) === "N/A") {
            out.estado_publi_obs = null;
        }
        if (up(out.estado_publi) === "SI") {
            out.estado_publi_obs = null;
        }
        if (out.confor_compe_j == null) {
            out.confor_compe_obs_jef = null;
        }
        if (up(out.existe_promo) === "N/A") {
            out.existe_promo = null;
        }
        return out;
    };

    const buildPayloadEncuesta = (f, { empresa }) => {
        const mapped = {
            cod_promotor: clean(f.promotor),
            cod_cliente: clean(f.distribuidorId),
            cod_tienda: num(f.codTienda),
            limp_orden: num(f.limp_orden),

            // campos simples
            pop_actual: bool01(f.pop_actual),
            pop_sufic: num(f.pop_sufic),
            motos_desper: bool01(f.motos_desper),
            motos_falt: f.motos_falt == null ? null : bool01(f.motos_falt),
            motos_bat: f.motos_bat == null ? null : bool01(f.motos_bat),
            estado_publi: bool01(f.estado_publi),
            conoc_portaf: num(f.conoc_portaf),
            conoc_prod: num(f.conoc_prod),
            conoc_garan: num(f.conoc_garan),
            conoc_shibot: num(f.conoc_shibot),
            ubi_talleres: f.ubi_talleres == null ? null : bool01(f.ubi_talleres),

            // conformidad
            confor_shine_v: num(f.confor_shine_v),
            confor_shine_j: num(f.confor_shine_j),
            confor_compe_v: num(f.confor_compe_v),
            confor_compe_j: num(f.confor_compe_j),

            prec_vis_corr: f.prec_vis_corr == null ? null : bool01(f.prec_vis_corr),

            existe_promo:
                up(f.existe_promo) === "NA"
                    ? null
                    : f.existe_promo
                        ? bool01(f.existe_promo)
                        : null,

            conoc_promo:
                up(f.existe_promo) === "SI"
                    ? (f.conoc_promo ? bool01(f.conoc_promo) : null)
                    : null,
        };

        // Contenedor de preguntas múltiples
        const opcion_multiple = [];

        // POP desactualizado (cod_pregunta = 2)
        if (Array.isArray(f.pop_material_desactualizado)) {
            f.pop_material_desactualizado.forEach((v) => {
                const item = { cod_pregunta: 2, opcion: v.codigo };

                if (v.texto === "OTROS" && f.otros_pop_material) {
                    item.texto = f.otros_pop_material;
                }

                opcion_multiple.push(item);
            });
        }

        // Motos daños (cod_pregunta = 5)
        if (Array.isArray(f.motos_desper_opciones)) {
            f.motos_desper_opciones.forEach((v) =>
                opcion_multiple.push({ cod_pregunta: 5, opcion: v.codigo })
            );
            if (f.motos_danos_otros) {
                opcion_multiple.push({
                    cod_pregunta: 5,
                    opcion: f.motos_danos_otros,
                });
            }
        }

        // Motos faltantes (cod_pregunta = 6)
        if (Array.isArray(f.motos_falt_opciones)) {
            f.motos_falt_opciones.forEach((v) =>
                opcion_multiple.push({ cod_pregunta: 6, opcion: v.codigo })
            );
            if (f.motos_componentes_otros) {
                opcion_multiple.push({
                    cod_pregunta: 6,
                    opcion: f.motos_componentes_otros,
                });
            }
        }
        // Estado batería (cod_pregunta = 7)
        if (f.motos_bat === "SI" && f.estado_bateria) {
            opcion_multiple.push({ cod_pregunta: 7, opcion: f.estado_bateria.codigo });
        }

        // Publicidad problemas (cod_pregunta = 8)
        if (Array.isArray(f.estado_publi_problemas)) {
            f.estado_publi_problemas.forEach((v) => {
                if (v.texto === "OTROS" && f.estado_publi_otros) {
                    opcion_multiple.push({
                        cod_pregunta: 8,
                        opcion: v.codigo,
                        texto: f.estado_publi_otros,
                    });
                } else {
                    opcion_multiple.push({
                        cod_pregunta: 8,
                        opcion: v.codigo,
                    });
                }
            });
        }

        // Incentivos vendedores (cod_pregunta = 11)
        if (Array.isArray(f.incentivos_ven)) {
            f.incentivos_ven.forEach((v) => {
                const item = { cod_pregunta: 11, opcion: v.codigo };

                if (v.texto === "BONO EN EFECTIVO" && f.bono_efectivo_valor) {
                    item.numero = Number(f.bono_efectivo_valor);
                }

                if (v.texto === "OTROS" && f.incentivos_ven_otros) {
                    item.texto = f.incentivos_ven_otros;
                }

                opcion_multiple.push(item);
            });
        }
        // Incentivos jefes (cod_pregunta = 12)
        if (Array.isArray(f.incentivos_jef)) {
            f.incentivos_jef.forEach((v) => {
                const item = { cod_pregunta: 12, opcion: v.codigo };

                if (v.texto === "BONO EN EFECTIVO" && f.bono_efectivo_valor_jefe) {
                    item.numero = Number(f.bono_efectivo_valor_jefe);
                }
                if (v.texto === "OTROS" && f.incentivos_jefe_otros) {
                    item.texto = f.incentivos_jefe_otros;
                }
                opcion_multiple.push(item);
            });
        }

        // Normalización final
        const enc = sanitizeBusinessRules(mapped);
        const cleaned = Object.fromEntries(
            Object.entries(enc).filter(
                ([k, v]) =>
                    v !== undefined &&
                    !(typeof v === "string" && v.trim() === "") &&

                    !(v === null && k !== "existe_promo")
            )
        );

        return { empresa: Number(empresa), ...cleaned, opcion_multiple };
    };

    const handleGuardar = async () => {
        const v = validarTodo(form);
        if (!v.completa) {
            const det = [
                v.faltan.length ? `Faltan campos: ${v.faltan.join(', ')}` : null,
                v.errores.length ? `Errores: ${v.errores.join(', ')}` : null
            ].filter(Boolean).join(' · ');
            toast.warning(det || 'Completa la encuesta y los datos de registro.');
            return;
        }
        try {
            setGuardando(true);
            const payload = buildPayloadEncuesta(form, {empresa: enterpriseShineray});
            await APIService.guardarEncuesta(enterpriseShineray, payload);
            setGuardada(true);
            toast.success('Encuesta guardada.');
        } catch (e) {
            toast.error(e?.response?.data?.mensaje || e?.message || 'Error al guardar la encuesta.');
        } finally {
            setGuardando(false);
        }
    };

    const handleChange = (field) => (valueOrEvent) => {
        const value = typeof valueOrEvent === 'object' && valueOrEvent?.target
            ? valueOrEvent.target.value
            : valueOrEvent;
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            if (field === 'estado_publi' && (up(value) === 'SI' || up(value) === 'N/A')) {
                next.estado_publi_obs = '';
            }

            if (field === 'motos_desper' && up(value) === 'NO') {
                next.motos_desper_obs = '';
            }

            if (field === 'pop_actual' && (up(value) === 'SI' || up(value) === 'N/A')) {
                next.pop_actual_obs = '';
            }

            if (field === "existe_promo") {
                if (up(value) === "SI") {
                    next.existe_promo = "SI";
                } else if (up(value) === "NO") {
                    next.existe_promo = "NO";
                    next.conoc_promo = "";
                } else if (up(value) === "N/A") {
                    next.existe_promo = "N/A";
                    next.conoc_promo = "";
                } else {
                    next.existe_promo = "";
                }
            }
            return next;
        });
        setGuardada(false);
    };

    const fetchClientesPromotorAC = async (cod_promotor) => {
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
            const msg = error?.response?.data?.mensaje || error?.message || 'No se pudo cargar clientes del promotor logueado';
            toast.error(msg);
            setClientesRaw([]);
        }
    };

    useEffect(() => {
        fetchClientesPromotorAC(form.promotor);
    }, [form.promotor]);

    const clientes = React.useMemo(() => {
        const arr = (clientesRaw ?? []).map(c => ({
            id: String(c?.cod_cliente ?? ''),
            nombre: String(c?.nombre ?? '').trim(),
            tipo: String(c?.cod_tipo_clienteh ?? '').trim(),
        }));
        return arr;
    }, [clientesRaw]);

    useEffect(() => {
        (async () => {
            try {
                const p = await APIService.getPromotorActual();
                setPromotorActual(p);
                const codPromotor = String(p.identificacion || '').trim();

                setForm(prev => ({...prev, promotor: codPromotor}));
                await fetchClientesPromotorAC(codPromotor);
            } catch (e) {
                console.error(e);
                toast.error(e.message || 'No se pudo obtener el Promotor ');
            } finally {
                setCargandoPromotor(false);
            }
        })();
    }, []);

    const fetchDirecciones = async (cod_promotor, cod_cliente) => {
        if (!cod_promotor || !cod_cliente) {
            setDirecciones([]);
            return;
        }
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
            toast.error(e?.message || 'No se pudieron cargar las tiendas');
            setDirecciones([]);
        } finally {
            setLoadingDirs(false);
        }
    };

    const ciudades = useMemo(() => {
        const map = new Map();
        for (const d of direcciones) {
            const key = (d.ciudad || '').toUpperCase().trim();
            if (key && !map.has(key)) map.set(key, {id: key, label: key, ciudad: d.ciudad});
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

    useEffect(() => {
        fetchClientesPromotorAC(form.promotor);
    }, [form.promotor]);

    useEffect(() => {
        fetchDirecciones(form.promotor, form.distribuidorId);
    }, [form.promotor, form.distribuidorId]);

    const selectedDistribuidorForm = React.useMemo(() => {
        const id = String(form.distribuidorId ?? '');
        return clientes.find(c => c.id === id) ?? null;
    }, [clientes, form.distribuidorId]);

    const getPath = (obj, path) =>
        path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

    const firstNonEmpty = (...vals) =>
        vals.map(v => (v == null ? "" : String(v).trim())).find(Boolean) || "";

    const resolveUsuarioOracle = (u) => {
        if (!u) return "";
        if (typeof u === "string") return u.trim();

        return firstNonEmpty(
            getPath(u, "usuario_oracle"),
            getPath(u, "usuarioOracle"),
            getPath(u, "codigo_usuario"),
            getPath(u, "codigoUsuario"),
            getPath(u, "usuario"),
            getPath(u, "username"),
            getPath(u, "user.usuario_oracle"),
            getPath(u, "user.usuario"),
            getPath(u, "user.username"),
            getPath(u, "auth.usuario_oracle")
        );
    };

    useEffect(() => {
        const uo = resolveUsuarioOracle(userShineray);
        setUsuarioOracle(uo);
    }, [userShineray]);



    const handleFormChange = (campo) => (event) => {
        const value = event.target.value;
        setForm((prev) => ({
            ...prev,
            [campo]: value,
        }));
    };

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
                <Box p={2}>
                    {!mostrarSegundo ? (
                        <>
                            <fieldset disabled={guardada} style={{border: "none", padding: 0, margin: 0}}>
                                <Box
                                    mx="auto"
                                    width="100%"
                                    sx={{
                                        maxWidth: {xs: '100%', sm: 1500, md: 1000, lg: 1140, xl: 1500},
                                    }}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={4}>
                                            <Autocomplete
                                                options={clientes}
                                                getOptionLabel={(o) => o?.nombre ?? ''}
                                                value={selectedDistribuidorForm}
                                                size="small"
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
                                                renderInput={(params) => <TextField {...params} label="Distribuidor"/>}
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
                                                size="small"
                                                disablePortal
                                                disabled={!form.promotor || !form.distribuidorId}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Autocomplete
                                                options={tiendasPorCiudad}
                                                getOptionLabel={(o) => o?.label ?? ''}
                                                value={tiendasPorCiudad.find(t => t.id === (form.codTienda || '').toUpperCase()) || null}
                                                onChange={(_, v) => {
                                                    if (v && typeof v === 'object') {
                                                        setForm(prev => ({
                                                            ...prev,
                                                            codTienda: v.id,
                                                            tienda: v.label,
                                                        }));
                                                    } else {
                                                        setForm(prev => ({...prev, codTienda: '', tienda: ''}));
                                                    }
                                                }}
                                                isOptionEqualToValue={(a, b) => `${a.id}` === `${b?.id ?? b}`}
                                                renderInput={(params) => <TextField {...params} label="Tienda" />}
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                    <EncuestaExhibicion
                                        form={form}
                                        setForm={setForm}
                                        handleChange={handleChange}
                                        esRetail={true}
                                        disabled={false}
                                        APIService={APIService}
                                    />
                                    <EncuestaInteraccion
                                        form={form}
                                        setForm={setForm}
                                        handleChange={handleFormChange}
                                        disabled={guardada}
                                        APIService={APIService}
                                    />
                                </Box>
                            </fieldset>
                            <Box mt={2} display="flex" justifyContent="center" gap={2}>
                                <Button
                                    variant="contained"
                                    onClick={handleGuardar}
                                   disabled={!todoCompleto || guardando || guardada}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        backgroundColor: 'firebrick',
                                        '&:hover': {backgroundColor: 'darkred'}
                                    }}
                                >
                                    {guardando ? 'Guardando…' : 'Guardar'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setMostrarSegundo(true)}
                                    //disabled={!guardada}
                                >
                                    Siguiente
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box>
                            <FrmPromotoria onBack={() => setMostrarSegundo(false)}/>
                        </Box>
                    )}
                </Box>
            </div>
        )}</>
    );
};

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <VisitaPromotoria/>
        </SnackbarProvider>
    );
}
