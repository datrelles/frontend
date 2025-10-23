// src/components/DispatchMobile.js
import React, { useEffect, useMemo, useRef, useState, useCallback, useTransition } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Box, Card, CardActionArea, CardContent, Divider, IconButton,
  InputAdornment, Modal, TextField, Toolbar, Typography, Stack, Chip,
  Drawer, Button, Backdrop, CircularProgress, Skeleton, Tooltip, Badge,
  Alert, Snackbar, LinearProgress
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ClearIcon from "@mui/icons-material/Clear";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";       // NUEVO: icono teclado
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn"; // NUEVO: botón Enter
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Navbar0 from "./Navbar0";
import { useAuthContext } from "../context/authContext";

// >>> APIs externas centralizadas
import {
  setAuthToken,
  getMenus as apiGetMenus,
  getDispatchs as apiGetDispatchs,
  getDetallePedido as apiGetDetallePedido,
  sendCode as apiSendCode,
  crearComentarioTransferencia, // <-- nuevo: crear comentario solo si sendCode fue OK
} from "../services/dispatchApi";

import SeriesAsignadas from "./logistica/seriesAsignadas";
import SeriesAgeGate from "./logistica/seriesAgeGate";
// --- Toastify ---
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_OPTIONS = [
  { code: "BOD", label: "EN BODEGA" },
  { code: "DEP", label: "PARCIAL" },
  { code: "T", label: "TODOS" },
];

const BODEGA_OPTIONS = [
  { code: "ALL", label: "TODAS" },
  { code: "RET", label: "A3 - RETAIL" },
  { code: "MAY", label: "N2 - MAYOREO" },
];

// 🔴 Firebrick theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#B22222",      // firebrick
      dark: "#7f1515",
      light: "#cd5c5c",
      contrastText: "#ffffff",
    },
  },
  components: {
    MuiCircularProgress: { defaultProps: { color: "primary" } },
    MuiLinearProgress:   { defaultProps: { color: "primary" } },
    MuiButton:           { defaultProps: { color: "primary" } },
  },
});

export default function DispatchMobile() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();

  // gate series antiguas
  const [gateOpen, setGateOpen] = useState(false);
  const [serieEscaneada, setSerieEscaneada] = useState("");
  const pendingScanRef = useRef(null);
  const [gateCtx, setGateCtx] = useState(null);

  // data
  const [menus, setMenus] = useState([]);
  const [dispatchs, setDispatchs] = useState([]);

  // loaders
  const [loading, setLoading] = useState(false);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [changeSearch, setChangeSearch] = useState(false);

  // ui
  const [activeTab, setActiveTab] = useState("BOD");
  const [bodega, setBodega] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  // filtros
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs().subtract(1, "month"));
  const [toDate, setToDate] = useState(dayjs());

  // NUEVO: filtro por dirección (valor seleccionado)
  const [direccionFilter, setDireccionFilter] = useState("");

  // detalle
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const currentRef = useRef(null);
  const [motos, setMotos] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Escaneo por línea (keyboard wedge)
  const [scanOpenById, setScanOpenById] = useState({});
  const [scanValueById, setScanValueById] = useState({});
  const [scannedCodesById, setScannedCodesById] = useState({});
  const scanRefs = useRef({});
  const scanTimersRef = useRef({});
  const inFlightRef = useRef({}); // evita doble llamada por item

  // NUEVO: modo teclado por ítem (solo si el usuario pulsa el icono teclado)
  const [keyboardForcedById, setKeyboardForcedById] = useState({});

  // Overlay proceso
  const [captureOverlay, setCaptureOverlay] = useState({ open: false, ok: false, message: "" });

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const lastFetchKey = useRef("");
  const [isPending, startTransition] = useTransition();

  const [seriesModal, setSeriesModal] = useState({
    open: false,
    codComprobante: "",
    tipoComprobante: "",
    codProducto: ""
  });

  // loader durante send_code
  const [sending, setSending] = useState(false);

  // ---- Helpers ----
  const norm = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  const sanitizeDate = useCallback((d) => (dayjs.isDayjs(d) && d.isValid() ? d : dayjs()), []);
  const clampedRange = useMemo(() => {
    let from = sanitizeDate(fromDate).startOf("day");
    let to = sanitizeDate(toDate).endOf("day");
    if (to.isBefore(from)) to = from.endOf("day");
    return { from, to };
  }, [fromDate, toDate, sanitizeDate]);

  const fromISO = useMemo(() => clampedRange.from.format("YYYY-MM-DD"), [clampedRange]);
  const toISO = useMemo(() => clampedRange.to.format("YYYY-MM-DD"), [clampedRange]);

  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  const showError = useCallback((err, ctx = "") => {
    let raw = err?.message || String(err) || "Error inesperado";
    const matches = [...raw.matchAll(/ORA-20000:\s*([^\n\r]+)/g)];
    let msg = matches.length ? matches[matches.length - 1][1].trim() : raw;

    toast.error(`${ctx ? ctx + ": " : ""}${msg}`, {
      position: "top-right",
      autoClose: 4000,
      theme: "colored",
      closeOnClick: true,
      pauseOnHover: true,
    });
  }, []);

  // MENÚS
  useEffect(() => {
    (async () => {
      try {
        setLoadingMenus(true);
        document.title = "Despachos Motos";
        const data = await apiGetMenus({
          user: userShineray,
          enterprise: enterpriseShineray,
          system: systemShineray,
        });
        setMenus(Array.isArray(data) ? data : []);
      } catch (e) {
        setMenus([]);
        showError(e, "Cargando menús");
      } finally {
        setLoadingMenus(false);
      }
    })();
  }, [userShineray, enterpriseShineray, systemShineray, showError]);

  const toNum = (v) => {
    if (v == null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // >>> NUEVO AJUSTE: opciones de Dirección SOLO con pendientes > 0
  const direccionOptions = useMemo(() => {
    const set = new Set();
    for (const d of Array.isArray(dispatchs) ? dispatchs : []) {
      const pendiente = toNum(d?.CANTIDAD_PENDIENTE);
      if (pendiente > 0) {
        const dir = (d?.DIRECCION ?? "").toString().trim();
        if (dir) set.add(dir);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [dispatchs]);
  // <<< NUEVO AJUSTE

  const preprocessDispatchs = useCallback((arr) => {
    return (Array.isArray(arr) ? arr : []).map(d => {
      const fmt = d.FECHA_PEDIDO
        ? (dayjs(d.FECHA_PEDIDO, "DD/MM/YYYY").isValid()
          ? dayjs(d.FECHA_PEDIDO, "DD/MM/YYYY").format("DD/MM/YYYY")
          : String(d.FECHA_PEDIDO))
        : "";

      const s_des = toNum(d.CANTIDAD_DESPACHADA);
      const s_pen = toNum(d.CANTIDAD_PENDIENTE);
      const s_sol = toNum(d.CANTIDAD_SOLICITADA);
      const s_anu = toNum(d.CANTIDAD_ANULADA);

      const _BOD_MATCH = (s_des === 0) && (s_pen === s_sol) && (s_anu < s_sol);
      const _PARCIAL_DISPATCH = (s_pen !== 0) && (s_des < s_sol) && (s_pen !== s_sol);
      const _DISPATCH_COMPLETE = (s_pen === 0) && (s_des === s_sol);

      const cod = String(d.COD_PEDIDO || "");
      const _BODEGA = cod.startsWith("A3") ? "RET" : cod.startsWith("N2") ? "MAY" : "OTR";

      const _SEARCH_PED = norm(d.COD_PEDIDO);
      const _SEARCH_CLI = norm(d.NOMBRE_PERSONA_CLI);

      return {
        ...d,
        _FECHA_PEDIDO_FMT: fmt,
        _BOD_MATCH,
        _BODEGA,
        _PARCIAL_DISPATCH,
        _DISPATCH_COMPLETE,
        _SEARCH_PED,
        _SEARCH_CLI
      };
    });
  }, []);

  // LISTADO
  const fetchDispatchs = useCallback(async () => {
    const key = `${fromISO}|${toISO}|${enterpriseShineray}`;
    if (lastFetchKey.current === key) return;

    setLoading(true);
    try {
      const data = await apiGetDispatchs({
        fromDateISO: fromISO,
        toDateISO: toISO,
        enterprise: enterpriseShineray,
      });
      setDispatchs(preprocessDispatchs(data));
      lastFetchKey.current = key;
    } catch (e) {
      setDispatchs([]);
      showError(e, "Cargando pedidos");
    } finally {
      setLoading(false);
    }
  }, [fromISO, toISO, enterpriseShineray, preprocessDispatchs, showError]);

  useEffect(() => { fetchDispatchs(); }, [fetchDispatchs]);

  // DETALLE
  const openDetalle = useCallback(async (row) => {
    setCurrent(row);
    currentRef.current = row;
    setOpen(true);
    setMotos([]);
    setLoadingDetalle(true);

    // reset escaneo
    setScanOpenById({});
    setScanValueById({});
    setScannedCodesById({});
    scanRefs.current = {};
    scanTimersRef.current = {};
    inFlightRef.current = {};
    setKeyboardForcedById({}); // reset modo teclado

    try {
      const payload = {
        pn_empresa: enterpriseShineray,
        pv_cod_tipo_pedido: row.COD_TIPO_PEDIDO,
        pedido: row.COD_PEDIDO,
        pn_cod_agencia: row.COD_BODEGA_DESPACHA,
        bodega_consignacion: row.COD_BODEGA_ENVIA,
        cod_direccion: row.COD_DIRECCION,
        p_tipo_orden: row.COD_TIPO_ORDEN,
        orden: row.COD_ORDEN,
      };
      const data = await apiGetDetallePedido(payload);
      setMotos(Array.isArray(data) ? data : []);
    } catch (e) {
      const serverData = e.response?.data;
      const serverMsg = serverData?.error || serverData?.mensaje;
      setMotos([]);
      showError(serverMsg || e.message, "Cargando detalle");
    } finally {
      setLoadingDetalle(false);
    }
  }, [enterpriseShineray, showError]);

  // 🔁 Recarga SOLO el detalle del pedido actual
  const refreshCurrentDetalle = useCallback(async () => {
    const cur = currentRef.current;
    if (!cur) return null;
    try {
      const payload = {
        pn_empresa: enterpriseShineray,
        pv_cod_tipo_pedido: cur.COD_TIPO_PEDIDO,
        pedido: cur.COD_PEDIDO,
        pn_cod_agencia: cur.COD_BODEGA_DESPACHA,
        bodega_consignacion: cur.COD_BODEGA_ENVIA,
        cod_direccion: cur.COD_DIRECCION,
        p_tipo_orden: cur.COD_TIPO_ORDEN,
        orden: cur.COD_ORDEN,
      };
      const data = await apiGetDetallePedido(payload);
      const arr = Array.isArray(data) ? data : [];
      setMotos(arr);
      return arr;
    } catch (e) {
      showError(e, "Actualizando detalle");
      return null;
    }
  }, [enterpriseShineray, showError]);

  // Búsqueda debounce
  const onSearchChange = useCallback((e) => {
    const v = e.target.value;
    setSearchInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(v);
    }, 180);
    setChangeSearch(prev => !prev);
  }, []);

  // Filtrado client-side
  const listFiltered = useMemo(() => {
    let base = dispatchs;
    if (activeTab === "BOD") base = base.filter(d => d._BOD_MATCH === true);
    if (activeTab === "DEP") base = base.filter(d => d._PARCIAL_DISPATCH === true);
    if (activeTab === "DES") base = base.filter(d => d._DISPATCH_COMPLETE === true);
    if (bodega !== "ALL") base = base.filter(d => d._BODEGA === bodega);

    // Filtro de Dirección (opcional)
    if (direccionFilter) base = base.filter(d => (d?.DIRECCION ?? "").toString().trim() === direccionFilter);

    const q = norm(search);
    const tokens = q.split(" ").filter(Boolean);
    const hasAll = (str) => tokens.every(t => str.includes(t));

    const matchesPed = [];
    const matchesCli = [];

    for (const d of base) {
      const inPed = hasAll(d._SEARCH_PED);
      const inCli = hasAll(d._SEARCH_CLI);
      if (inPed) matchesPed.push(d);
      else if (inCli) matchesCli.push(d);
    }

    const scorePed = (d) => {
      const s = d._SEARCH_PED;
      const pref = tokens.some(t => s.startsWith(t)) ? 1 : 0;
      return pref;
    };
    const scoreCli = (d) => {
      const s = d._SEARCH_CLI;
      const pref = tokens.some(t => s.startsWith(t)) ? 1 : 0;
      return pref;
    };

    matchesPed.sort((a, b) => scorePed(b) - scorePed(a));
    matchesCli.sort((a, b) => scoreCli(b) - scoreCli(a));

    const seen = new Set();
    const out = [];
    for (const d of [...matchesPed, ...matchesCli]) {
      const key = `${d.COD_PEDIDO}-${d.COD_ORDEN}-${d.COD_DIRECCION ?? ""}`;
      if (!seen.has(key)) { seen.add(key); out.push(d); }
    }
    return out;
  }, [dispatchs, activeTab, bodega, direccionFilter, search, changeSearch]);

  // Handlers select
  const onOpenFilters = useCallback(() => setFiltersOpen(true), []);
  const onCloseFilters = useCallback(() => setFiltersOpen(false), []);
  const onApplyFilters = useCallback(() => { setFiltersOpen(false); fetchDispatchs(); }, [fetchDispatchs]);
  const onStatusChange = useCallback((e) => {
    const v = e.target.value;
    startTransition(() => setActiveTab(v));
  }, [startTransition]);
  const onBodegaChange = useCallback((e) => {
    const v = e.target.value;
    startTransition(() => setBodega(v));
  }, [startTransition]);

  // === Reglas de negocio ===
  const isQtyComplete = (it) => {
    const pedida = toNum(it.CANTIDAD_PEDIDA);
    const enGuia = toNum(it.CANTIDAD_TRANS);
    return pedida > 0 && pedida === enGuia;
  };

  // === Escaneo por ítem (vista normal, sin teclado forzado) ===
  const toggleScanFor = useCallback((itemId, disabled) => {
    if (disabled) return;
    setScanOpenById((prev) => {
      const currentlyOpen = !!prev[itemId];
      const next = currentlyOpen ? {} : { [itemId]: true };
      Object.entries(scanRefs.current).forEach(([id, el]) => {
        if (id !== String(itemId)) el?.blur?.();
      });
      setTimeout(() => {
        if (!currentlyOpen) scanRefs.current[itemId]?.focus();
      }, 0);
      return next;
    });
    // Al usar QR NO activar modo teclado
    setKeyboardForcedById((prev) => ({ ...prev, [itemId]: false }));
  }, []);

  // === Modo TECLADO: caso especial ===
  const toggleKeyboardFor = useCallback((itemId, disabled) => {
    if (disabled) return;
    setScanOpenById((prev) => {
      const openNow = !!prev[itemId];
      const next = openNow ? prev : { [itemId]: true }; // asegurar que se vea el input
      setTimeout(() => scanRefs.current[itemId]?.focus?.(), 0);
      return next;
    });
    setKeyboardForcedById((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const isProcessOK = (resp) => {
    if (Array.isArray(resp)) return true;
    if (resp && (resp.ok === true || resp.success === true)) return true;
    if (resp && typeof resp.ok === "string" && resp.ok.trim().length > 0) return true;
    if (typeof resp === "string" && resp.toUpperCase().includes("OK")) return true;
    return false;
  };

  const getProcessError = (resp) => {
    if (!resp) return "Proceso no respondió";
    return resp.error || resp.mensaje || (typeof resp.ok === "string" ? resp.ok : null) || "Proceso fallido";
  };

  // commit real al backend
  const commitScan = useCallback(
    async (itemId, code, cod_comprobante, tipo_comprobante, cod_producto, opts = {}) => {
      const { comment } = opts || {};
      code = (code || "").trim();
      if (!code) return;

      if (inFlightRef.current[itemId]) return;
      inFlightRef.current[itemId] = true;

      if (scanTimersRef.current[itemId]) {
        clearTimeout(scanTimersRef.current[itemId]);
        scanTimersRef.current[itemId] = null;
      }

      const cur = currentRef.current || {};

      // historial visual
      setScannedCodesById((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), { code, ts: Date.now() }],
      }));
      setSnackbarMsg(`Código capturado: ${code}`);
      setSnackbarOpen(true);

      try {
        setSending(true);

        // 1) Ejecutar sendCode
        const payload = {
          empresa: enterpriseShineray,
          cod_comprobante,
          tipo_comprobante,
          cod_producto,
          cod_bodega: cur.COD_BODEGA_DESPACHA,
          current_identification: cur.COD_PERSONA_CLI,
          cod_motor: code
        };

        const data = await apiSendCode(payload);

        // 2) Si sendCode fue OK y hay comentario -> crear comentario
        if (isProcessOK(data) && comment && gateCtx) {
          try {
            await crearComentarioTransferencia({
              cod_comprobante: String(gateCtx.cod_comprobante || cod_comprobante || ""),
              cod_tipo_comprobante: String(gateCtx.cod_tipo_comprobante || tipo_comprobante || ""),
              empresa: Number(enterpriseShineray),
              secuencia: Number(gateCtx.secuencia), // <- COD_SECUENCIA_MOV
              cod_producto: String(gateCtx.cod_producto || cod_producto || ""),
              comentario: String(comment).trim(),
              numero_serie: String(code),
              usuario_creacion: String(userShineray || ""),
              origen: "DISPATCH_MOBILE",
              tipo_comentario: "SERIE_ANTIGUA",
              es_activo: 1,
            });
          } catch (ce) {
            showError(ce, "Guardando comentario");
          }
        }

        // 3) Refrescar detalle, cerrar input si completó
        if (isProcessOK(data)) {
          const updated = await refreshCurrentDetalle();
          if (updated) {
            const updatedItem = updated.find(u =>
              (u.COD_SECUENCIA_MOV ?? `${u.COD_PRODUCTO}-${u.SECUENCIA ?? ""}`) === itemId
            );
            if (updatedItem && isQtyComplete(updatedItem)) {
              setScanOpenById(prev => ({ ...prev, [itemId]: false }));
            }
          }
          setCaptureOverlay({ open: true, ok: true, message: "" });
          setTimeout(() => setCaptureOverlay({ open: false, ok: true, message: "" }), 1200);
        } else {
          throw new Error(getProcessError(data));
        }
      } catch (e) {
        const raw = e?.message || String(e) || "Error inesperado";
        const matches = [...raw.matchAll(/ORA-20000:\s*([^\n\r]+)/g)];
        const clean = matches.length ? matches[matches.length - 1][1].trim() : raw;

        await refreshCurrentDetalle();

        setCaptureOverlay({ open: true, ok: false, message: clean });
        setTimeout(() => setCaptureOverlay({ open: false, ok: false, message: "" }), 1600);
        showError(clean, "Proceso");
      } finally {
        setSending(false);
        inFlightRef.current[itemId] = false;
        setScanValueById((prev) => ({ ...prev, [itemId]: "" }));
      }
    },
    [enterpriseShineray, showError, refreshCurrentDetalle, gateCtx, userShineray]
  );

  // PRE-FLIGHT: dispara el gate; si pasa, luego commitScan
  const preflightScan = useCallback((itemId, code, cod_comprobante, tipo_comprobante, cod_producto, secuencia, bodega) => {
    const trimmed = (code || "").trim();
    if (!trimmed) return;

    pendingScanRef.current = { itemId, code: trimmed, cod_comprobante, tipo_comprobante, cod_producto, secuencia, bodega };
    setGateCtx({
      cod_comprobante,
      cod_tipo_comprobante: tipo_comprobante,
      cod_producto,
      secuencia,
      bodega,
    });

    setSerieEscaneada(trimmed);
    setGateOpen(true);
  }, []);

  // Escáner auto (debounce) — SOLO cuando NO está modo teclado
  const handleScanChange = useCallback((itemId, cod_comprobante, tipo_comprobante, cod_producto, secuencia, bodega_ingreso) => (e) => {
    const val = e.target.value ?? "";
    setScanValueById((prev) => ({ ...prev, [itemId]: val }));

    if (scanTimersRef.current[itemId]) clearTimeout(scanTimersRef.current[itemId]);
    scanTimersRef.current[itemId] = setTimeout(() => {
      preflightScan(itemId, val, cod_comprobante, tipo_comprobante, cod_producto, secuencia, bodega_ingreso);
    }, 120);
  }, [preflightScan]);

  // Modo teclado: solo escribe, sin gate hasta pulsar Enter
  const handleManualChange = useCallback((itemId) => (e) => {
    const val = e.target.value ?? "";
    setScanValueById((prev) => ({ ...prev, [itemId]: val }));
  }, []);

  // Botón Enter: dispara gate con el valor actual
  const handleKeyboardEnter = useCallback((
    itemId,
    cod_comprobante,
    tipo_comprobante,
    cod_producto,
    secuencia,
    bodega_ingreso
  ) => {
    const val = (scanValueById[itemId] || "").trim();
    if (!val) return;
    preflightScan(itemId, val, cod_comprobante, tipo_comprobante, cod_producto, secuencia, bodega_ingreso);
  }, [scanValueById, preflightScan]);

  // callbacks del gate
  const handleGateProceed = useCallback((numeroSerie, comment) => {
    setGateOpen(false);
    const ctx = pendingScanRef.current;
    if (ctx && ctx.code) {
      commitScan(
        ctx.itemId,
        ctx.code,
        ctx.cod_comprobante,
        ctx.tipo_comprobante,
        ctx.cod_producto,
        { comment }
      );
    }
    pendingScanRef.current = null;
  }, [commitScan]);

  const handleGateCancel = useCallback(() => {
    setGateOpen(false);
    pendingScanRef.current = null;
  }, []);

  // Loader global (incluye envío)
  const busy = loading || loadingMenus || isPending || sending;

  // Skeleton list
  const SkeletonList = ({ items = 6 }) => (
    <Stack spacing={1.5}>
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <Skeleton variant="text" width="40%" height={28} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="rectangular" height={18} sx={{ mt: 1, borderRadius: 1 }} />
        </Card>
      ))}
    </Stack>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pb: 8 }}>
        <Navbar0 menus={menus} />

        {/* Header */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ mt: 16 }}>
          <Toolbar sx={{ px: 2, gap: 1, flexWrap: "nowrap" }}>
            <FormControl size="small" fullWidth sx={{ flex: "1 0 0", minWidth: 0, bgcolor: "background.paper", borderRadius: 1 }} disabled={busy}>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select labelId="estado-label" id="estado-select" label="Estado" value={activeTab} onChange={onStatusChange}>
                {STATUS_OPTIONS.map(opt => (<MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={{ flex: "1 0 0", minWidth: 0, bgcolor: "background.paper", borderRadius: 1 }} disabled={busy}>
              <InputLabel id="bodega-label">Bodega</InputLabel>
              <Select labelId="bodega-label" id="bodega-select" label="Bodega" value={bodega} onChange={onBodegaChange}>
                {BODEGA_OPTIONS.map(opt => (<MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>))}
              </Select>
            </FormControl>
          </Toolbar>

          {/* Loader fino para carga de menús */}
          {loadingMenus && <LinearProgress />}
        </AppBar>

        {/* Búsqueda + filtros */}
        <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            fullWidth
            placeholder="Buscar por pedido o cliente…"
            value={searchInput}
            onChange={onSearchChange}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            sx={{ flex: "1 1 260px" }}
          />

          <IconButton aria-label="abrir filtros" onClick={onOpenFilters} sx={{ bgcolor: "action.hover", borderRadius: 2 }} disabled={busy}>
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Loader listado */}
        {loading && (
          <Box sx={{ px: 2, mb: 1 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Lista */}
        <Box sx={{ px: 2, pb: 6 }}>
          {busy ? (
            <SkeletonList items={6} />
          ) : listFiltered.length === 0 ? (
            <Typography variant="body2">No hay resultados</Typography>
          ) : (
            <Stack spacing={1.5}>
              {listFiltered.map((row) => (
                <Card
                  key={`${row.COD_PEDIDO}-${row.COD_ORDEN}-${row.COD_DIRECCION ?? ""}`}  // AUMENTAR unicidad
                  variant="outlined"
                  sx={{ borderRadius: 3 }}
                >
                  <CardActionArea onClick={() => openDetalle(row)} disabled={busy}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{`PEDIDO  ${row.COD_PEDIDO}`}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>{row.NOMBRE_PERSONA_CLI}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>{row.DIRECCION}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip size="small" label={`Orden ${row.COD_ORDEN}`} />
                        <Typography variant="caption">{row._FECHA_PEDIDO_FMT}</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="caption">
                          Pend: {row.CANTIDAD_PENDIENTE} · Desp: {row.CANTIDAD_DESPACHADA}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Modal detalle */}
        <Modal open={open} onClose={() => setOpen(false)} keepMounted>
          <Box sx={{
            position: "fixed",
            left: 0, right: 0, bottom: 0,
            maxHeight: "85vh",
            bgcolor: "background.paper",
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            boxShadow: 24, p: 2, overflow: "auto",
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6">Detalles del Despacho</Typography>
              <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
            </Stack>

            {/* Loader dentro del modal */}
            {loadingDetalle && <LinearProgress sx={{ mb: 1 }} />}

            {current && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Pedido {current.COD_PEDIDO} — Orden {current.COD_ORDEN}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {current.NOMBRE_PERSONA_CLI} · {current.COD_PERSONA_CLI}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {current.DIRECCION}
                </Typography>
                <Typography variant="caption">
                  {current.BODEGA_ENVIA} · {current._FECHA_PEDIDO_FMT}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Ítems del pedido</Typography>

                {loadingDetalle ? (
                  <Stack spacing={1}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                  </Stack>
                ) : (
                  <Stack spacing={1}>
                    {motos.map((it) => {
                      const itemId = it.COD_SECUENCIA_MOV ?? `${it.COD_PRODUCTO}-${it.SECUENCIA ?? ""}`;
                      const scansCount = (scannedCodesById[itemId] || []).length;
                      const lastCode = scansCount ? scannedCodesById[itemId][scansCount - 1].code : null;

                      const cod_comprobante = it.COD_COMPROBANTE;
                      const tipo_comprobante = it.TIPO_COMPROBANTE;
                      const cod_producto = it.COD_PRODUCTO;
                      const disabledScan = isQtyComplete(it);
                      const openInput = !!scanOpenById[itemId];
                      const bodega_ingreso = Number(it.COD_BODEGA_INGRESO ?? current?.COD_BODEGA_DESPACHA ?? 0) || 0;

                      const itemIsSending = !!inFlightRef.current[itemId];
                      const keyboardForced = !!keyboardForcedById[itemId];

                      return (
                        <Box
                          key={itemId}
                          sx={{ border: "1px solid #eee", p: 1.25, borderRadius: 2 }}
                          onClick={() => {
                            if (toNum(it.CANTIDAD_TRANS) > 0) {
                              setSeriesModal({
                                open: true,
                                codComprobante: cod_comprobante,
                                tipoComprobante: tipo_comprobante,
                                codProducto: cod_producto,
                              });
                            }
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {it.COD_PRODUCTO} — {it.NOMBRE}
                              </Typography>
                              <Typography variant="caption">
                                Pedida: {it.CANTIDAD_PEDIDA} · En guía: {it.CANTIDAD_TRANS}
                              </Typography>
                            </Box>

                            {/* Botón QR (mantiene vista sin teclado) */}
                            <Tooltip
                              title={
                                disabledScan
                                  ? "Cantidad completa (Pedida = En guía): escaneo deshabilitado"
                                  : (openInput ? "Ocultar escáner" : "Escanear código")
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={disabledScan}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleScanFor(itemId, disabledScan); // NO activa teclado
                                  }}
                                >
                                  <Badge badgeContent={scansCount} color="primary">
                                    <QrCodeScannerIcon fontSize="medium" />
                                  </Badge>
                                </IconButton>
                              </span>
                            </Tooltip>

                            {/* Botón TECLADO (caso especial) */}
                            <Tooltip
                              title={
                                disabledScan
                                  ? "Cantidad completa: teclado no necesario"
                                  : (keyboardForced ? "Desactivar teclado" : "Activar teclado")
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={disabledScan}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleKeyboardFor(itemId, disabledScan); // activa/desactiva modo teclado
                                  }}
                                  sx={{
                                    bgcolor: keyboardForced ? "primary.light" : "transparent",
                                    color: keyboardForced ? "#fff" : "inherit",
                                  }}
                                >
                                  <KeyboardAltIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>

                          {disabledScan && (
                            <Typography variant="caption" sx={{ mt: 0.5, color: "error.main", display: "block" }}>
                              Cantidad completa: Pedida = En guía. No es necesario escanear.
                            </Typography>
                          )}

                          {openInput && !disabledScan && (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                              <TextField
                                size="small"
                                fullWidth
                                label="Escanee (se detecta automáticamente)"
                                value={scanValueById[itemId] || ""}
                                inputRef={(el) => { scanRefs.current[itemId] = el; }}
                                onChange={
                                  keyboardForced
                                    ? (e) => handleManualChange(itemId)(e) // sin gate
                                    : handleScanChange(                   // con debounce + gate
                                        itemId,
                                        cod_comprobante,
                                        tipo_comprobante,
                                        cod_producto,
                                        it.COD_SECUENCIA_MOV,
                                        bodega_ingreso
                                      )
                                }
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                inputProps={{ inputMode: keyboardForced ? "text" : "none" }} // teclado SOLO cuando se pulsa el icono teclado
                                onFocus={(e) => {
                                  const val = e.target.value;
                                  e.target.setSelectionRange(val.length, val.length);
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end" sx={{ gap: 1 }}>
                                      {/* Botón Enter SOLO en modo teclado (sin texto "Teclado") */}
                                      {keyboardForced && (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          startIcon={<KeyboardReturnIcon />}
                                          disabled={itemIsSending || !(scanValueById[itemId] || "").trim()}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleKeyboardEnter(
                                              itemId,
                                              cod_comprobante,
                                              tipo_comprobante,
                                              cod_producto,
                                              it.COD_SECUENCIA_MOV,
                                              bodega_ingreso
                                            );
                                          }}
                                          sx={{ minWidth: 0, px: 1.5 }}
                                        >
                                          Enter
                                        </Button>
                                      )}

                                      {itemIsSending && (
                                        <CircularProgress size={18} thickness={5} />
                                      )}
                                      {lastCode ? (
                                        <Tooltip title={`Último: ${lastCode}`}>
                                          <DoneIcon fontSize="small" sx={{ color: "#00E676" }} />
                                        </Tooltip>
                                      ) : null}
                                    </InputAdornment>
                                  )
                                }}
                              />
                              <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setScannedCodesById((prev) => ({ ...prev, [itemId]: [] }));
                                  setScanValueById((prev) => ({ ...prev, [itemId]: "" }));

                                  if (scanTimersRef.current[itemId]) {
                                    clearTimeout(scanTimersRef.current[itemId]);
                                    scanTimersRef.current[itemId] = null;
                                  }

                                  if (pendingScanRef.current?.itemId === itemId) {
                                    pendingScanRef.current = null;
                                    setGateOpen(false);
                                  }

                                  requestAnimationFrame(() => {
                                    scanRefs.current[itemId]?.focus?.();
                                  });
                                }}
                              >
                                Limpiar
                              </Button>

                            </Stack>
                          )}
                        </Box>
                      );
                    })}

                    {motos.length === 0 && (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Sin líneas para mostrar.
                      </Typography>
                    )}
                  </Stack>
                )}
              </>
            )}
          </Box>
        </Modal>

        {/* Drawer de filtros */}
        <Drawer anchor="right" open={filtersOpen} onClose={onCloseFilters}>
          <Box sx={{ width: 300, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Filtros</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack spacing={2}>
                <DatePicker
                  label="Fecha inicial"
                  value={fromDate}
                  onChange={(v) => v && setFromDate(v)}
                  format="DD/MM/YYYY"
                  maxDate={toDate}
                  disableFuture
                />
                <DatePicker
                  label="Fecha final"
                  value={toDate}
                  onChange={(v) => v && setToDate(v)}
                  format="DD/MM/YYYY"
                  minDate={fromDate}
                  disableFuture
                />

                {/* Selector de Dirección basado en pedidos con pendientes > 0 */}
                <FormControl fullWidth size="small">
                  <InputLabel id="direccion-label">Dirección</InputLabel>
                  <Select
                    labelId="direccion-label"
                    id="direccion-select"
                    label="Dirección"
                    value={direccionFilter}
                    onChange={(e) => setDireccionFilter(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {direccionOptions.map((dir) => (
                      <MenuItem key={dir} value={dir}>{dir}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </LocalizationProvider>
            <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
              <Button onClick={onCloseFilters}>Cerrar</Button>
              <Button variant="contained" onClick={onApplyFilters}>
                Aplicar
              </Button>
            </Stack>
          </Box>
        </Drawer>

        {/* LOADER GLOBAL */}
        <Backdrop open={busy} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <CircularProgress color="primary" />
        </Backdrop>

        {/* Overlay proceso */}
        <Backdrop
          open={captureOverlay.open}
          sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 2, flexDirection: "column" }}
        >
          {captureOverlay.ok ? (
            <>
              <DoneIcon sx={{ fontSize: 96, color: "#00E676" }} />
              <Typography variant="h5" sx={{ mt: 1, color: "#00E676" }}>
                Proceso exitoso
              </Typography>
            </>
          ) : (
            <>
              <CloseIcon sx={{ fontSize: 96, color: "#FF1744" }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {captureOverlay.message || "Proceso fallido"}
              </Typography>
            </>
          )}
        </Backdrop>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2400}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>

        {/* Toasts */}
        <ToastContainer />
      </Box>

      {/* Series ya asignadas */}
      <SeriesAsignadas
        open={seriesModal.open}
        onClose={() => setSeriesModal((prev) => ({ ...prev, open: false }))}
        onAfterClose={refreshCurrentDetalle}
        codComprobante={seriesModal.codComprobante}
        tipoComprobante={seriesModal.tipoComprobante}
        codProducto={seriesModal.codProducto}
        empresa={enterpriseShineray}
        currentDetalle={current}
      />

      {/* Gate de series antiguas */}
      <SeriesAgeGate
        open={gateOpen}
        numeroSerie={serieEscaneada}
        enterpriseShineray={enterpriseShineray}
        codComprobante={gateCtx?.cod_comprobante}
        codTipoComprobante={gateCtx?.cod_tipo_comprobante}
        secuencia={gateCtx?.secuencia}
        codProducto={gateCtx?.cod_producto}
        usuarioCreacion={userShineray}
        bodega={gateCtx?.bodega ?? current?.COD_BODEGA_DESPACHA}
        origen="DISPATCH_MOBILE"
        tipoComentario="SERIE_ANTIGUA"
        onProceed={handleGateProceed}
        onCancel={handleGateCancel}
      />
    </ThemeProvider>
  );
}
