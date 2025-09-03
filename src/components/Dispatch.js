import React, { useEffect, useMemo, useRef, useState, useCallback, useTransition } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Box, Card, CardActionArea, CardContent, Divider, IconButton,
  InputAdornment, Modal, TextField, Toolbar, Typography, Stack, Chip,
  Drawer, Button, Backdrop, CircularProgress, Skeleton, Tooltip, Badge,
  Alert, Snackbar
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
  sendCode as apiSendCode
} from "../services/dispatchApi";

import SeriesAsignadas from "./logistica/seriesAsignadas";
// --- Toastify ---
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_OPTIONS = [
  { code: "BOD", label: "EN BODEGA" },
  { code: "DEP", label: "PARCIAL" },
  { code: "DES", label: "DESPACHADOS" },
  { code: "CAD", label: "CADUCADOS" },
  { code: "A", label: "ANULADOS" },
  { code: "T", label: "TODOS" },
];

const BODEGA_OPTIONS = [
  { code: "ALL", label: "TODAS" },
  { code: "RET", label: "A3 - RETAIL" },
  { code: "MAY", label: "N2 - MAYOREO" },
];

const theme = createTheme();

export default function DispatchMobile() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();

  // data
  const [menus, setMenus] = useState([]);
  const [dispatchs, setDispatchs] = useState([]);

  // loaders
  const [loading, setLoading] = useState(false);
  const [loadingMenus, setLoadingMenus] = useState(false);

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


  //loader durante send_code
  const [sending, setSending] = useState(false);

  // ===== Helpers =====
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

      const searchIdx = [
        d.NOMBRE_PERSONA_CLI,
        d.COD_PEDIDO
      ]
        .filter(Boolean)
        .map(x => String(x).toLowerCase())
        .join(" | ");

      return {
        ...d,
        _FECHA_PEDIDO_FMT: fmt,
        _SEARCH: searchIdx,
        _BOD_MATCH,
        _BODEGA,
        _PARCIAL_DISPATCH,
        _DISPATCH_COMPLETE
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
      setSearch(v.toLowerCase().trim());
    }, 160);
  }, []);

  // Filtrado client-side
  const listFiltered = useMemo(() => {
    let base = dispatchs;
    if (activeTab === "BOD") base = base.filter(d => d._BOD_MATCH === true);
    if (activeTab === "DEP") base = base.filter(d => d._PARCIAL_DISPATCH === true);
    if (activeTab === "DES") base = base.filter(d => d._DISPATCH_COMPLETE === true);
    if (bodega !== "ALL") base = base.filter(d => d._BODEGA === bodega);
    if (search) base = base.filter(d => d._SEARCH.includes(search));
    return base;
  }, [dispatchs, activeTab, bodega, search]);

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

  // === Escaneo sin Enter ===
  // Solo un input activo a la vez (y blur de los demás)
  const toggleScanFor = useCallback((itemId, disabled) => {
    if (disabled) return;
    setScanOpenById((prev) => {
      const currentlyOpen = !!prev[itemId];
      const next = currentlyOpen ? {} : { [itemId]: true };
      // blur a todos los otros inputs
      Object.entries(scanRefs.current).forEach(([id, el]) => {
        if (id !== String(itemId)) el?.blur?.();
      });
      setTimeout(() => {
        if (!currentlyOpen) scanRefs.current[itemId]?.focus();
      }, 0);
      return next;
    });
  }, []);

  // Éxito real del proceso backend
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

  // commit del escaneo (usa el buffer pasado por debounce)
  const commitScan = useCallback(async (itemId, code, cod_comprobante, tipo_comprobante, cod_producto) => {
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
      setSending(true); // <<< activar loader global durante send_code

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

      // **AUN EN FALLO**: refrescar el detalle para mantener la orden al día
      await refreshCurrentDetalle();

      setCaptureOverlay({ open: true, ok: false, message: clean });
      setTimeout(() => setCaptureOverlay({ open: false, ok: false, message: "" }), 1600);
      showError(clean, "Proceso");
    } finally {
      setSending(false); // <<< desactivar loader global
      inFlightRef.current[itemId] = false;
      setScanValueById((prev) => ({ ...prev, [itemId]: "" }));
    }
  }, [enterpriseShineray, showError, refreshCurrentDetalle]);

  // debounce + primera captura confiable
  const handleScanChange = useCallback((itemId, cod_comprobante, tipo_comprobante, cod_producto) => (e) => {
    const val = e.target.value ?? "";

    let nextVal = val;
    setScanValueById((prev) => ({ ...prev, [itemId]: val }));

    if (scanTimersRef.current[itemId]) clearTimeout(scanTimersRef.current[itemId]);
    scanTimersRef.current[itemId] = setTimeout(() => {
      commitScan(itemId, nextVal, cod_comprobante, tipo_comprobante, cod_producto);
    }, 120);
  }, [commitScan]);

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
        </AppBar>

        {/* Búsqueda + filtros */}
        <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            fullWidth
            placeholder="Buscar pedido, orden, cliente, cédula, dirección…"
            value={searchInput}
            onChange={onSearchChange}
            disabled={busy}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            sx={{ flex: "1 1 260px" }}
          />

          <IconButton aria-label="abrir filtros" onClick={onOpenFilters} sx={{ bgcolor: "action.hover", borderRadius: 2 }} disabled={busy}>
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Lista */}
        <Box sx={{ px: 2, pb: 6 }}>
          {busy ? (
            <SkeletonList items={6} />
          ) : listFiltered.length === 0 ? (
            <Typography variant="body2">No hay resultados</Typography>
          ) : (
            <Stack spacing={1.5}>
              {listFiltered.map((row) => (
                <Card key={`${row.COD_PEDIDO}-${row.COD_ORDEN}`} variant="outlined" sx={{ borderRadius: 3 }}>
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
                                    e.stopPropagation(); // evitar que abra modal de series
                                    toggleScanFor(itemId, disabledScan);
                                  }}
                                >
                                  <Badge badgeContent={scansCount} color="primary">
                                    <QrCodeScannerIcon fontSize="small" />
                                  </Badge>
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
                                onChange={handleScanChange(itemId, cod_comprobante, tipo_comprobante, cod_producto)}
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                inputProps={{ inputMode: "none" }}
                                onFocus={(e) => {
                                  const val = e.target.value;
                                  e.target.setSelectionRange(val.length, val.length);
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
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

        {/* LOADER GLOBAL (ahora también durante send_code) */}
        <Backdrop open={busy} sx={{ color: "#fff", zIndex: (t) => t.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Overlay proceso */}
        <Backdrop
          open={captureOverlay.open}
          sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 2, flexDirection: "column" }}
        >
          {captureOverlay.ok ? (
            <>
              {/* Verde más vivo */}
              <DoneIcon sx={{ fontSize: 96, color: "#00E676" }} />
              <Typography variant="h5" sx={{ mt: 1, color: "#00E676" }}>
                Proceso exitoso
              </Typography>
            </>
          ) : (
            <>
              {/* Rojo más vivo */}
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
      <SeriesAsignadas
        open={seriesModal.open}
        onClose={() => setSeriesModal((prev) => ({ ...prev, open: false }))}
        onAfterClose={refreshCurrentDetalle}   // 👈 refresca líneas (pedida / en guía) al cerrar
        codComprobante={seriesModal.codComprobante}
        tipoComprobante={seriesModal.tipoComprobante}
        codProducto={seriesModal.codProducto}
        empresa={enterpriseShineray}
        currentDetalle={current}
      />



    </ThemeProvider>
  );
}
