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
} from "../services/dispatchApi";

const STATUS_OPTIONS = [
  { code: "BOD", label: "EN BODEGA" },
  { code: "DEP", label: "PARCIAL" },
  { code: "DES", label: "DESPACHADOS" },
  { code: "CAD", label: "CADUCADOS" },
  { code: "A", label: "ANULADOS" },
  { code: "T", label: "TODOS" },
];

// NUEVO: opciones de BODEGA (prefijo de COD_PEDIDO)
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
  const [loading, setLoading] = useState(false);          // fetch dispatchs
  const [loadingMenus, setLoadingMenus] = useState(false); // fetch menus

  // ui
  const [activeTab, setActiveTab] = useState("BOD");
  const [bodega, setBodega] = useState("ALL"); // NUEVO: estado del selector Bodega
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  // filtros (solo fechas disparan fetch)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs().subtract(1, "month"));
  const [toDate, setToDate] = useState(dayjs());

  // detalle
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [motos, setMotos] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // === ESCANEO POR LÍNEA (Zebra keyboard wedge, SIN Enter) ===
  const [scanOpenById, setScanOpenById] = useState({}); // visibilidad del input por ítem
  const [scanValueById, setScanValueById] = useState({}); // buffer visible del input
  const [scannedCodesById, setScannedCodesById] = useState({}); // historial de lecturas
  const scanRefs = useRef({}); // refs a inputs (autofocus)
  const scanTimersRef = useRef({}); // timers para detectar fin de lectura

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const lastFetchKey = useRef("");
  const [isPending, startTransition] = useTransition();

  // ===== Helpers de fecha =====
  const sanitizeDate = useCallback((d) => (dayjs.isDayjs(d) && d.isValid() ? d : dayjs()), []);
  const clampedRange = useMemo(() => {
    let from = sanitizeDate(fromDate).startOf("day");
    let to = sanitizeDate(toDate).endOf("day");
    if (to.isBefore(from)) to = from.endOf("day");
    return { from, to };
  }, [fromDate, toDate, sanitizeDate]);

  const fromISO = useMemo(() => clampedRange.from.format("YYYY-MM-DD"), [clampedRange]);
  const toISO = useMemo(() => clampedRange.to.format("YYYY-MM-DD"), [clampedRange]);

  // setear token global
  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  // MENÚS (con loader)
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
        console.error(e.message);
        setMenus([]);
      } finally {
        setLoadingMenus(false);
      }
    })();
  }, [userShineray, enterpriseShineray, systemShineray]);

  // === Helper numérico robusto ===
  const toNum = (v) => {
    if (v == null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Preprocesa registros (incluye flag _BOD_MATCH, _BODEGA y fecha formateada)
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
      const _PARCIAL_DISPATCH = (s_pen != 0) && (s_des < s_sol) && (s_pen != s_sol);
      const _DISPATCH_COMPLETE= (s_pen == 0) && (s_des == s_sol);

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
        _BODEGA, // NUEVO
        _PARCIAL_DISPATCH,
        _DISPATCH_COMPLETE
      };
    });
  }, []);

  // LISTADO DE PEDIDOS (con loader)
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
      console.error(e.message);
      setDispatchs([]);
    } finally {
      setLoading(false);
    }
  }, [fromISO, toISO, enterpriseShineray, preprocessDispatchs]);

  useEffect(() => { fetchDispatchs(); }, [fetchDispatchs]);

  // DETALLE (loader local del modal)
  const openDetalle = useCallback(async (row) => {
    setCurrent(row);
    setOpen(true);
    setMotos([]);
    setLoadingDetalle(true);

    // reset de escaneo al abrir un pedido nuevo
    setScanOpenById({});
    setScanValueById({});
    setScannedCodesById({});
    scanRefs.current = {};
    scanTimersRef.current = {};

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
      console.error(e.message);
      setMotos([]);
    } finally {
      setLoadingDetalle(false);
    }
  }, [enterpriseShineray]);

  // Búsqueda debounce
  const onSearchChange = useCallback((e) => {
    const v = e.target.value;
    setSearchInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(v.toLowerCase().trim());
    }, 160);
  }, []);

  // ► Filtrado client-side: Estado + Bodega + búsqueda
  const listFiltered = useMemo(() => {
    let base = dispatchs;

    // Estado
    if (activeTab === "BOD") {
      base = base.filter(d => d._BOD_MATCH === true);
    }

    if  (activeTab === "DEP") {
      base = base.filter(d => d._PARCIAL_DISPATCH === true);
    }

    if (activeTab === "DES") {
      base = base.filter(d => d._DISPATCH_COMPLETE === true);
    }

    // Bodega (prefijo de COD_PEDIDO)
    if (bodega !== "ALL") {
      base = base.filter(d => d._BODEGA === bodega);
    }

    // Búsqueda texto
    if (search) {
      base = base.filter(d => d._SEARCH.includes(search));
    }

    return base;
  }, [dispatchs, activeTab, bodega, search]);

  // Handlers
  const onOpenFilters = useCallback(() => setFiltersOpen(true), []);
  const onCloseFilters = useCallback(() => setFiltersOpen(false), []);
  const onApplyFilters = useCallback(() => { setFiltersOpen(false); fetchDispatchs(); }, [fetchDispatchs]);
  const onStatusChange = useCallback((e) => {
    const v = e.target.value;
    startTransition(() => setActiveTab(v)); // isPending activará el loader global
  }, [startTransition]);

  const onBodegaChange = useCallback((e) => {
    const v = e.target.value;
    startTransition(() => setBodega(v));
  }, [startTransition]);

  // === Escaneo sin Enter ===
  const toggleScanFor = useCallback((itemId) => {
    setScanOpenById((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      setTimeout(() => {
        if (next[itemId]) {
          scanRefs.current[itemId]?.focus();
        }
      }, 0);
      return next;
    });
  }, []);

  const commitScan = useCallback((itemId) => {
    const code = (scanValueById[itemId] || "").trim();
    if (!code) return;
    setScannedCodesById((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { code, ts: Date.now() }],
    }));
    setSnackbarMsg(`Código capturado: ${code}`);
    setSnackbarOpen(true);
    // limpiar input
    setScanValueById((prev) => ({ ...prev, [itemId]: "" }));
  }, [scanValueById]);

  const handleScanChange = useCallback((itemId) => (e) => {
    const val = e.target.value ?? "";
    setScanValueById((prev) => ({ ...prev, [itemId]: val }));
    if (scanTimersRef.current[itemId]) clearTimeout(scanTimersRef.current[itemId]);
    // fin de lectura si no hay nuevas teclas en 120ms
    scanTimersRef.current[itemId] = setTimeout(() => {
      commitScan(itemId);
    }, 120);
  }, [commitScan]);

  // Loader global visible si hay cualquier operación en curso
  const busy = loading || loadingMenus || isPending;

  // Skeleton list (mejora percepción de carga)
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
            {/* Selector ESTADO */}
            <FormControl
              size="small"
              fullWidth
              sx={{
                flex: "1 0 0",   // crecer/encoger equitativo
                minWidth: 0,     // permite encojer en pantallas muy estrechas
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
              disabled={busy}
            >
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                id="estado-select"
                label="Estado"
                value={activeTab}
                onChange={onStatusChange}
              >
                {STATUS_OPTIONS.map(opt => (
                  <MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selector BODEGA */}
            <FormControl
              size="small"
              fullWidth
              sx={{
                flex: "1 0 0",
                minWidth: 0,
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
              disabled={busy}
            >
              <InputLabel id="bodega-label">Bodega</InputLabel>
              <Select
                labelId="bodega-label"
                id="bodega-select"
                label="Bodega"
                value={bodega}
                onChange={onBodegaChange}
              >
                {BODEGA_OPTIONS.map(opt => (
                  <MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>

        {/* Fila Buscador + botón filtros (fechas) */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar pedido, orden, cliente, cédula, dirección…"
            value={searchInput}
            onChange={onSearchChange}
            disabled={busy}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: "1 1 260px" }}
          />

          <IconButton
            aria-label="abrir filtros"
            onClick={onOpenFilters}
            sx={{ bgcolor: "action.hover", borderRadius: 2 }}
            disabled={busy}
          >
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
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {`PEDIDO  ${row.COD_PEDIDO}`}
                      </Typography>
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

        {/* Modal detalle (loader local) */}
        <Modal open={open} onClose={() => setOpen(false)} keepMounted>
          <Box sx={{
            position: "fixed",
            left: 0, right: 0, bottom: 0,
            maxHeight: "85vh",
            bgcolor: "background.paper",
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            boxShadow: 24, p: 2, overflow: "auto",
          }}
          >
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
                      const openInput = !!scanOpenById[itemId];
                      const scansCount = (scannedCodesById[itemId] || []).length;
                      const lastCode = scansCount ? scannedCodesById[itemId][scansCount - 1].code : null;

                      return (
                        <Box key={itemId} sx={{ border: "1px solid #eee", p: 1.25, borderRadius: 2 }}
                          onClick={() => toggleScanFor(itemId)}
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

                            <Tooltip title={openInput ? "Ocultar escáner" : "Escanear código"}>
                              <IconButton size="small">
                                <Badge badgeContent={scansCount} color="primary">
                                  <QrCodeScannerIcon fontSize="small" />
                                </Badge>
                              </IconButton>
                            </Tooltip>
                          </Stack>

                          {openInput && (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                              <TextField
                                size="small"
                                fullWidth
                                label="Escanee (se detecta automáticamente)"
                                value={scanValueById[itemId] || ""}
                                inputRef={(el) => { scanRefs.current[itemId] = el; }}
                                onChange={handleScanChange(itemId)}
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {lastCode ? (
                                        <Tooltip title={`Último: ${lastCode}`}>
                                          <DoneIcon fontSize="small" />
                                        </Tooltip>
                                      ) : null}
                                    </InputAdornment>
                                  )
                                }}
                              />
                              <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={(e) => { e.stopPropagation(); setScannedCodesById((prev) => ({ ...prev, [itemId]: [] })); }}
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

        {/* Drawer de filtros (fechas) */}
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

        {/* LOADER GLOBAL */}
        <Backdrop open={busy} sx={{ color: "#fff", zIndex: (t) => t.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Snackbar de demo de captura */}
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
      </Box>
    </ThemeProvider>
  );
}


