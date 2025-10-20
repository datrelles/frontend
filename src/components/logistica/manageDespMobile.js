// src/components/logistica/CDEAdminMobile.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Box, Card, CardActionArea, CardContent, Divider, IconButton,
  InputAdornment, Modal, TextField, Toolbar, Typography, Stack, Chip,
  Button, Backdrop, CircularProgress, Skeleton, Tooltip, Badge,
  Alert, Snackbar, LinearProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Navbar0 from "../Navbar0";
import { useAuthContext } from "../../context/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// APIs (ya existentes en tu proyecto)
import {
  setAuthToken,
  getMenus,
  searchCDE,
  listDDE,
  createDDE,
  searchDespachos,
  generarGuiasDespacho,
} from "../../services/dispatchApi";

// ===== Tema Firebrick (igual a DispatchMobile) =====
const theme = createTheme({
  palette: {
    primary: {
      main: "#B22222",
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

// helpers
const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export default function CDEAdminMobile() {
  const { jwt, userShineray, enterpriseShineray } = useAuthContext();
  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  // Navbar / menús
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingMenus(true);
        const data = await getMenus(userShineray, enterpriseShineray, "LOG");
        setMenus(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(e?.message || "Error cargando menús");
      } finally {
        setLoadingMenus(false);
      }
    })();
  }, [userShineray, enterpriseShineray]);

  // Listado CDE (Despachos)
  const [cdeRows, setCdeRows] = useState([]);
  const [loadingCDE, setLoadingCDE] = useState(false);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const loadCDE = useCallback(async () => {
    try {
      setLoadingCDE(true);
      const payload = { empresa: Number(enterpriseShineray || 20), page: 1, page_size: 200 };
      const data = await searchCDE(payload);
      const rows = Array.isArray(data?.results) ? data.results : [];
      setCdeRows(rows);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar la lista de despachos.");
      setCdeRows([]);
    } finally {
      setLoadingCDE(false);
    }
  }, [enterpriseShineray]);

  useEffect(() => { loadCDE(); }, [loadCDE]);

  const listFiltered = useMemo(() => {
    const q = norm(search);
    if (!q) return cdeRows;
    return cdeRows.filter(r =>
      norm(r?.cde_codigo).includes(q) ||
      norm(r?.nombre_ruta).includes(q) ||
      norm(r?.nombre_transportista).includes(q)
    );
  }, [cdeRows, search]);

  // ===== Detalle (modal) =====
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Series ya asignadas (DDE)
  const [ddeRows, setDdeRows] = useState([]);
  const [loadingDDE, setLoadingDDE] = useState(false);

  // Candidatos para agregar (VT_DESPACHO_FINAL)
  const [candidates, setCandidates] = useState([]); // [{cod_ddespacho, cod_producto, numero_serie, ...}]
  const [loadingCands, setLoadingCands] = useState(false);

  // Escaneo y selección
  const [scanValue, setScanValue] = useState("");
  const [selectedSerieKeys, setSelectedSerieKeys] = useState(new Set()); // keys por numero_serie

  // Generar flag
  const [generating, setGenerating] = useState(false);

  const openDetalle = useCallback(async (row) => {
    setCurrent(row);
    setOpen(true);
    setScanValue("");
    setSelectedSerieKeys(new Set());
    setDdeRows([]);
    setCandidates([]);
    setLoadingDetalle(true);

    try {
      // 1) cargar DDE existentes
      setLoadingDDE(true);
      const res = await listDDE({
        empresa: Number(row.empresa),
        cde_codigo: Number(row.cde_codigo),
        page: 1,
        per_page: 200,
      });
      setDdeRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar series asignadas.");
    } finally {
      setLoadingDDE(false);
    }

    try {
      // 2) cargar candidatos (VT_DESPACHO_FINAL) para esta CDE: abiertos, disponibles para asignar
      setLoadingCands(true);
      const payload = {
        empresa: Number(row?.empresa ?? enterpriseShineray ?? 20),
        despachada: 0,
        en_despacho: 0,
        cod_ruta: Number(row?.cod_ruta ?? 0),
        page: 1,
        page_size: 500,
      };
      const resp = await searchDespachos(payload);
      const arr = Array.isArray(resp?.results) ? resp.results : [];
      // Mantener solo los que tengan cod_ddespacho y numero_serie
      const filtered = arr.filter(r =>
        r?.cod_ddespacho != null && String(r.cod_ddespacho).trim() !== "" &&
        r?.numero_serie != null && String(r.numero_serie).trim() !== ""
      );
      setCandidates(filtered);
    } catch (e) {
      toast.error(e?.message || "No se pudieron cargar candidatos.");
    } finally {
      setLoadingCands(false);
      setLoadingDetalle(false);
    }
  }, [enterpriseShineray]);

  // índice rápido por numero_serie
  const candBySerie = useMemo(() => {
    const m = new Map();
    for (const r of candidates) {
      const key = String(r.numero_serie).trim();
      if (key) m.set(key, r);
    }
    return m;
  }, [candidates]);

  // manejar escaneo/input
  const onScanChange = useCallback((e) => {
    const v = e.target.value || "";
    setScanValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const serie = v.trim();
      if (!serie) return;
      if (candBySerie.has(serie)) {
        // toggle selección positiva
        setSelectedSerieKeys(prev => {
          const next = new Set(prev);
          if (next.has(serie)) next.delete(serie); else next.add(serie);
          return next;
        });
        toast.success(`Serie válida para este envío: ${serie}`);
      } else {
        toast.error(`Serie no coincide para este envío: ${serie}`);
      }
    }, 120);
  }, [candBySerie]);

  const clearScan = useCallback(() => setScanValue(""), []);

  const togglePick = useCallback((serie) => {
    setSelectedSerieKeys(prev => {
      const next = new Set(prev);
      if (next.has(serie)) next.delete(serie); else next.add(serie);
      return next;
    });
  }, []);

  // Confirmar: crear DDE por cada serie seleccionada
  const [saving, setSaving] = useState(false);
  const handleConfirm = useCallback(async () => {
    if (!current) return;
    if (selectedSerieKeys.size === 0) {
      toast.info("Selecciona al menos una serie válida.");
      return;
    }
    setSaving(true);
    let ok = 0, fail = 0;
    const ordered = [...selectedSerieKeys];

    for (const serie of ordered) {
      const row = candBySerie.get(serie);
      if (!row) { fail++; continue; }
      try {
        await createDDE({
          empresa: Number(current.empresa),
          cde_codigo: Number(current.cde_codigo),
          cod_ddespacho: row.cod_ddespacho,
          cod_producto: row.cod_producto,
          numero_serie: row.numero_serie,
          observacion: "Agregado desde móvil",
        });
        ok++;
      } catch {
        fail++;
      }
    }

    toast.success(`Agregados: ${ok}. Fallidos: ${fail}.`);
    setSelectedSerieKeys(new Set());
    setScanValue("");

    // refrescar DDE
    try {
      setLoadingDDE(true);
      const res = await listDDE({
        empresa: Number(current.empresa),
        cde_codigo: Number(current.cde_codigo),
        page: 1,
        per_page: 200,
      });
      setDdeRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      toast.error(e?.message || "No se pudo refrescar el detalle.");
    } finally {
      setLoadingDDE(false);
      setSaving(false);
    }
  }, [current, selectedSerieKeys, candBySerie]);

  // GENERAR guías
  const handleGenerar = useCallback(async () => {
    if (!current) return;
    try {
      setGenerating(true);
      const resp = await generarGuiasDespacho({
        empresa: Number(current.empresa || enterpriseShineray),
        despacho: Number(current.cde_codigo),
      });
      const guias = Array.isArray(resp?.guias) ? resp.guias : [];
      toast.success(`GUÍAS GENERADAS (CDE ${current.cde_codigo}): ${guias.length}`);
    } catch (e) {
      toast.error(e?.message || "No se pudo generar guías.");
    } finally {
      setGenerating(false);
    }
  }, [current, enterpriseShineray]);

  // UI: Loader global
  const busy = loadingMenus || loadingCDE || loadingDetalle || saving || generating;

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
            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
              Despachos (Móvil)
            </Typography>
          </Toolbar>
          {loadingMenus && <LinearProgress />}
        </AppBar>

        {/* Búsqueda */}
        <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            fullWidth
            placeholder="Buscar por CDE, ruta o transportista…"
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => setSearch(v), 150);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              ),
            }}
            sx={{ flex: "1 1 260px" }}
          />
        </Box>

        {/* Loader listado */}
        {loadingCDE && (
          <Box sx={{ px: 2, mb: 1 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Lista CDE */}
        <Box sx={{ px: 2, pb: 6 }}>
          {busy && !open ? (
            <SkeletonList items={6} />
          ) : listFiltered.length === 0 ? (
            <Typography variant="body2">No hay resultados</Typography>
          ) : (
            <Stack spacing={1.5}>
              {listFiltered.map((row) => (
                <Card key={`${row.empresa}-${row.cde_codigo}`} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardActionArea onClick={() => openDetalle(row)}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        CDE {row.cde_codigo}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Ruta: {row.nombre_ruta ?? row.cod_ruta}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          color={Number(row.finalizado) === 1 ? "success" : "warning"}
                          label={Number(row.finalizado) === 1 ? "Finalizado" : "Abierto"}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="caption">
                          Transportista: {row.nombre_transportista ?? row.cod_transportista}
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
            maxHeight: "88vh",
            bgcolor: "background.paper",
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            boxShadow: 24, p: 2, overflow: "auto",
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6">Detalle del Despacho</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={generating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <AutoAwesomeIcon />}
                  onClick={handleGenerar}
                  disabled={generating}
                  sx={{ textTransform: "none" }}
                >
                  GENERAR
                </Button>
                <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
              </Stack>
            </Stack>

            {(loadingDetalle || loadingDDE) && <LinearProgress sx={{ mb: 1 }} />}

            {current && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  CDE {current.cde_codigo} · {Number(current.finalizado) === 1 ? "Finalizado" : "Abierto"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Ruta: {current.nombre_ruta ?? current.cod_ruta} · Transportista: {current.nombre_transportista ?? current.cod_transportista}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* Series ya asignadas */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Series asignadas
                </Typography>
                {loadingDDE ? (
                  <Stack spacing={1}>
                    <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
                  </Stack>
                ) : (
                  <Stack spacing={0.75} sx={{ mb: 2 }}>
                    {ddeRows.length === 0 ? (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Sin series asignadas aún.
                      </Typography>
                    ) : (
                      ddeRows.map((r) => (
                        <Box key={r.secuencia} sx={{ border: "1px solid #eee", p: 1, borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" icon={<ListAltIcon />} label={`Sec ${r.secuencia}`} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {r.cod_producto}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              · {r.numero_serie}
                            </Typography>
                          </Stack>
                        </Box>
                      ))
                    )}
                  </Stack>
                )}

                {/* Agregar series (por escaneo y/o toque en la lista de candidatos) */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Agregar series
                </Typography>

                {/* Input de escaneo: valida contra candidates (numero_serie) */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Escanee o escriba el número de serie"
                    value={scanValue}
                    onChange={onScanChange}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <QrCodeScannerIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={clearScan}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<PlaylistAddIcon />}
                    disabled={saving || selectedSerieKeys.size === 0}
                    onClick={handleConfirm}
                    sx={{ textTransform: "none" }}
                  >
                    Confirmar ({selectedSerieKeys.size})
                  </Button>
                </Stack>

                {/* Lista de candidatos: tocar para seleccionar/deseleccionar */}
                {loadingCands ? (
                  <Stack spacing={1}>
                    <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 2 }} />
                  </Stack>
                ) : candidates.length === 0 ? (
                  <Alert severity="info">No hay series candidatas para esta ruta/envío.</Alert>
                ) : (
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Toca una tarjeta para (de)seleccionar. El escaneo también selecciona si coincide.
                    </Typography>
                    {candidates.map((it) => {
                      const serie = String(it.numero_serie).trim();
                      const picked = selectedSerieKeys.has(serie);
                      return (
                        <Box
                          key={`${it.cod_ddespacho}-${serie}`}
                          onClick={() => togglePick(serie)}
                          sx={{
                            border: "1px solid",
                            borderColor: picked ? "primary.main" : "#eee",
                            p: 1,
                            borderRadius: 2,
                            cursor: "pointer",
                            bgcolor: picked ? "primary.light" : "transparent",
                            color: picked ? "#fff" : "inherit",
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {it.cod_producto}
                              </Typography>
                              <Typography variant="body2">
                                Serie: {serie}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                Pedido {it.cod_pedido} · Orden {it.cod_orden} · Cliente {it.cliente}
                              </Typography>
                            </Box>
                            {picked && (
                              <Tooltip title="Seleccionado">
                                <Badge color="primary">
                                  <DoneIcon />
                                </Badge>
                              </Tooltip>
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </>
            )}
          </Box>
        </Modal>

        {/* LOADER GLOBAL */}
        <Backdrop open={busy} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <CircularProgress color="primary" />
        </Backdrop>

        {/* Toasts */}
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}
