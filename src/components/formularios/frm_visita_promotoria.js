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
    const [form, setForm] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [guardada, setGuardada] = useState(false);
    const [mostrarSegundo, setMostrarSegundo] = useState(false);
    const [clientesRaw, setClientesRaw] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [loadingDirs, setLoadingDirs] = useState(false);
    const [promotorActual, setPromotorActual] = useState(null);
    const [cargandoPromotor, setCargandoPromotor] = useState(true);
    const [canalRaw, setCanalRaw] = useState("");
    const [esRetailUI, setEsRetailUI] = useState(false);
    const [esRetailBackend, setEsRetailBackend] = useState(false);
    const [usuarioOracle, setUsuarioOracle] = useState("");
    const [cargandoCanal, setCargandoCanal] = useState(true);

    useEffect(() => {
        window.__api = APIService;
        console.debug("[CMP] window.__api listo (no imprime credenciales)");
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

        if (!num(f.limp_orden)) faltan.push('limp_orden');
        if (bool01(f.pop_actual) == null) faltan.push('pop_actual');
        const ps = num(f.pop_sufic);
        if (!(typeof ps === 'number' && ps >= 0 && ps <= 100)) errores.push('pop_sufic(0..100)');
        if (bool01(f.motos_desper) == null) faltan.push('motos_desper');
        if (bool01(f.estado_publi) == null && up(f.estado_publi) !== "N/A") {
            faltan.push('estado_publi');
        }
        if (!num(f.conoc_portaf)) faltan.push('conoc_portaf');
        if (!num(f.conoc_prod)) faltan.push('conoc_prod');
        if (!num(f.conoc_garan)) faltan.push('conoc_garan');
        if (!num(f.conoc_shibot)) faltan.push('conoc_shibot');
        if (!num(f.ubi_talleres)) faltan.push('ubi_talleres');

        if (up(f.pop_actual) === 'NO' && !clean(f.pop_actual_obs)) faltan.push('pop_actual_obs');
        if (up(f.motos_desper) === 'SI' && !clean(f.motos_desper_obs)) faltan.push('motos_desper_obs');

        if (up(f.estado_publi) === 'NO' && !clean(f.estado_publi_obs)) {
            faltan.push('estado_publi_obs');
        }

        if (up(f.estado_publi) === 'N/A' && clean(f.estado_publi_obs)) {
            errores.push('estado_publi_obs (no debe existir cuando es N/A)');
        }
        if (esRetailUI) {
            const v4 = Number(f.prec_vis_corr);
            if (!( (v4 >= 1 && v4 <= 5) || up(f.prec_vis_corr) === "N/A")) {
                faltan.push('prec_vis_corr');
            }
        }
        return { completa: faltan.length === 0 && errores.length === 0, faltan, errores };
    };

    const validarTodo = (f) => {
        const reg = validarRegistro(f);
        const enc = validarEncuesta(f);
        return {completa: reg.ok && enc.completa, faltan: [...reg.faltan, ...enc.faltan], errores: enc.errores};
    };

    const todoCompleto = validarTodo(form).completa;

    const sanitizeBusinessRules = (e) => {
        const out = { ...e };
        if (up(out.estado_publi) === "N/A") {
            out.estado_publi_obs = null;
        }
        if (up(out.estado_publi) === "SI") {
            out.estado_publi_obs = null;
        }
        if (out.confor_compe == null) {
            out.confor_compe_obs = null;
        }
        return out;
    };

    const buildPayloadEncuesta = (f, {empresa}) => {
        const mapped = {
            cod_promotor: clean(f.promotor),
            cod_cliente: clean(f.distribuidorId),
            cod_tienda: num(f.codTienda),
            limp_orden: num(f.limp_orden),
            pop_actual: bool01(f.pop_actual),
            pop_actual_obs: clean(f.pop_actual_obs),
            pop_sufic: num(f.pop_sufic),
            ...(f.prec_vis_corr !== undefined && f.prec_vis_corr !== null && String(f.prec_vis_corr).trim() !== ""
                ? {prec_vis_corr: Number(f.prec_vis_corr)}
                : {}),
            motos_desper: bool01(f.motos_desper),
            motos_desper_obs: clean(f.motos_desper_obs),
            estado_publi: bool01(f.estado_publi),
            estado_publi_obs: clean(f.estado_publi_obs),
            conoc_portaf: num(f.conoc_portaf),
            conoc_prod: num(f.conoc_prod),
            conoc_garan: num(f.conoc_garan),
            conoc_promo: f.conoc_promo == null ? null : bool01(f.conoc_promo),
            confor_shine: f.confor_shine == null ? null : num(f.confor_shine),
            confor_compe: f.confor_compe == null ? null : num(f.confor_compe),
            confor_compe_obs: clean(f.confor_compe_obs),
            conoc_shibot: num(f.conoc_shibot),
            ubi_talleres: num(f.ubi_talleres),
        };

        const enc = sanitizeBusinessRules(mapped);
        const cleaned = Object.fromEntries(
            Object.entries(enc).filter(([_, v]) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === ''))
        );
        return {empresa: Number(empresa), ...cleaned};
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
            const next = {...prev, [field]: value};
            if (field === 'estado_publi') {
                if (up(value) !== 'SI') {
                    next.estado_publi_obs = '';
                }
            }
            if (field === 'motos_desper') {
                if (up(value) !== 'NO') {
                    next.motos_desper_obs = '';
                }
            }
            if (field === 'pop_actual') {
                if (up(value) !== 'NO') {
                    next.pop_actual_obs = '';
                }
            }
            if (field === 'confor_compe' && (value === 'N/A' || value == null)) {
                next.confor_compe_obs = '';
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
            toast.error(e?.message || 'No se pudieron cargar las TIENDAS');
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

    const isRetailRole = (canal) => {
        const x = (canal ?? "").toUpperCase().trim();
        return x === "PROM_RET" || x === "PRON_RET" || x === "RETAIL" || x.endsWith("_RET") || x.includes("RETAIL");
    };

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                if (!usuarioOracle) {
                    setEsRetailUI(false);
                    setEsRetailBackend(false);
                    return;
                }
                setCargandoCanal(true);
                const r = await APIService.getCanalPromotor(usuarioOracle);
                const canal = String(r?.data?.canal ?? r?.canal ?? "").toUpperCase().trim();
                if (cancel) return;
                setCanalRaw(canal);

                const esRet = isRetailRole(canal);
                setEsRetailUI(esRet);
                setEsRetailBackend(esRet);
            } catch {
                if (!cancel) {
                    setEsRetailUI(false);
                    setEsRetailBackend(false);
                }
            } finally {
                if (!cancel) setCargandoCanal(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [APIService, usuarioOracle]);

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
                                                value={tiendaSel}
                                                size="small"
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
                                                renderInput={(p) => <TextField {...p} label="Tienda"/>}
                                                disabled={!form.promotor || !form.distribuidorId}
                                            />
                                        </Grid>
                                    </Grid>
                                    <EncuestaExhibicion
                                        form={form}
                                        handleChange={handleChange}
                                        esRetail={esRetailUI}
                                        disabled={guardada}
                                    />
                                    <EncuestaInteraccion
                                        form={form}
                                        handleChange={handleChange}
                                        disabled={guardada}
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
                                    // disabled={!guardada}
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
