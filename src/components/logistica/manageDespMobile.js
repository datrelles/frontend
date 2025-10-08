// src/components/logistica/CDEMobile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Stack, Typography, Paper, Chip, Button, IconButton, CircularProgress,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, List, ListItem, ListItemText
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ListAltIcon from "@mui/icons-material/ListAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Navbar0 from "../Navbar0";
import { useAuthContext } from "../../context/authContext";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// APIs
import {
  setAuthToken,
  getMenus,
  // CDE/DDE
  searchCDE,
  listDDE,
  // NUEVO
  generarGuiasDespacho,
} from "../../services/dispatchApi";

// ====== helpers ======
const norm = (s) =>
  (String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase());

const themeMobile = createTheme({
 
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 12 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 14 } } },
  },
});

export default function CDEMobile() {
  // ====== Auth & token ======
  const { jwt, enterpriseShineray, userShineray } = useAuthContext();
  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  // ====== Menús / Navbar ======
  const [menus, setMenus] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, "LOG");
        setMenus(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(e?.message || "No se pudieron cargar los menús.");
      }
    })();
  }, [enterpriseShineray, userShineray, jwt]);

  // ======================
  // LISTA CABECERAS (CDE)
  // ======================
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const [fEmpresa, setFEmpresa] = useState(enterpriseShineray || 20);
  const [searchQ, setSearchQ] = useState("");

  const loadCDE = async (opts = {}) => {
    if (!fEmpresa) return;
    try {
      setLoading(true);
      const p = Number(opts.page ?? page);
      const ps = Number(opts.page_size ?? pageSize);
      const payload = {
        empresa: Number(fEmpresa),
        page: p,
        page_size: ps,
      };
      const data = await searchCDE(payload);
      setRows(Array.isArray(data?.results) ? data.results : []);
      setCount(Number(data?.count || 0));
      setPage(p);
      setPageSize(ps);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar CDE.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enterpriseShineray) {
      setFEmpresa(enterpriseShineray);
      loadCDE({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseShineray]);

  const filteredRows = useMemo(() => {
    const q = norm(searchQ);
    if (!q) return rows;
    return rows.filter((r) =>
      norm(r?.nombre_ruta).includes(q) ||
      norm(r?.nombre_transportista).includes(q) ||
      String(r?.cde_codigo ?? "").includes(q)
    );
  }, [rows, searchQ]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // ======================
  // DETALLE (DDE) MODAL
  // ======================
  const [openDetalle, setOpenDetalle] = useState(false);
  const [cdeSel, setCdeSel] = useState(null);
  const [ddeRows, setDdeRows] = useState([]);
  const [loadingDDE, setLoadingDDE] = useState(false);

  const openDetalleFor = async (row) => {
    setCdeSel(row);
    setOpenDetalle(true);
  };

  useEffect(() => {
    const fetchDDE = async () => {
      if (!openDetalle || !cdeSel) return;
      try {
        setLoadingDDE(true);
        const res = await listDDE({
          empresa: Number(cdeSel.empresa),
          cde_codigo: Number(cdeSel.cde_codigo),
          page: 1,
          per_page: 200,
        });
        setDdeRows(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        toast.error(e?.message || "No se pudo cargar el detalle.");
      } finally {
        setLoadingDDE(false);
      }
    };
    fetchDDE();
  }, [openDetalle, cdeSel]);

  // ======================
  // GENERAR GUÍAS
  // ======================
  const [generating, setGenerating] = useState(null);
  const handleGenerar = async (row) => {
    try {
      setGenerating(row?.cde_codigo);
      const resp = await generarGuiasDespacho({
        empresa: Number(enterpriseShineray || row?.empresa),
        despacho: Number(row?.cde_codigo),
      });
      const guias = Array.isArray(resp?.guias) ? resp.guias : [];
      toast.success(`GUÍAS GENERADAS para CDE ${row?.cde_codigo}. Total: ${guias.length}`);
      // Opcional: refrescar lista
      await loadCDE({ page });
    } catch (e) {
      toast.error(e?.message || "No se pudo generar guías.");
    } finally {
      setGenerating(null);
    }
  };

  // Backdrop global
  const busy = loading || loadingDDE || generating !== null;

  // ===== Render =====
  return (
    <ThemeProvider theme={themeMobile}>
      <Box sx={{ mt: 10, pb: 8 }}>
        <Navbar0 menus={menus} />

        {/* Header + filtros compactos */}
        <Box sx={{ px: 2, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
            CDE (Mobile)
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              type="number"
              label="Empresa"
              value={fEmpresa}
              onChange={(e) => setFEmpresa(Number(e.target.value || 0))}
              sx={{ width: 120 }}
            />
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar CDE / ruta / transportista"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
              }}
            />
            <IconButton
              color="primary"
              onClick={() => loadCDE({ page: 1 })}
              disabled={loading}
              aria-label="recargar"
            >
              {loading ? <CircularProgress size={22} /> : <RefreshIcon />}
            </IconButton>
          </Stack>
        </Box>

        {/* Controles de paginación compactos */}
        <Box sx={{ px: 2, mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              startIcon={<ArrowBackIosNewIcon />}
              disabled={loading || page <= 1}
              onClick={() => loadCDE({ page: Math.max(1, page - 1) })}
            >
              Anterior
            </Button>
            <Typography variant="body2">
              Página {page} de {totalPages}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ArrowForwardIosIcon />}
              disabled={loading || page >= totalPages}
              onClick={() => loadCDE({ page: Math.min(totalPages, page + 1) })}
            >
              Siguiente
            </Button>
          </Stack>
        </Box>

        {/* Lista tipo cards para mobile */}
        <Stack spacing={1.5} sx={{ px: 2 }}>
          {filteredRows.map((r) => {
            const isGen = generating === r?.cde_codigo;
            return (
              <Paper key={r?.cde_codigo} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      CDE #{r?.cde_codigo}
                    </Typography>
                    {Number(r?.finalizado) === 1 ? (
                      <Chip size="small" label="Finalizado" color="success" />
                    ) : (
                      <Chip size="small" label="Abierto" color="warning" />
                    )}
                  </Stack>

                  <Stack spacing={0.3}>
                    <Typography variant="body2">
                      <b>Ruta:</b> {r?.nombre_ruta ?? r?.cod_ruta ?? "-"}
                    </Typography>
                    <Typography variant="body2">
                      <b>Transportista:</b> {r?.nombre_transportista ?? r?.cod_transportista ?? "-"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Empresa: {r?.empresa}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ListAltIcon />}
                      onClick={() => openDetalleFor(r)}
                    >
                      Detalle
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleGenerar(r)}
                      disabled={isGen}
                    >
                      {isGen ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "GENERAR"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}

          {!loading && filteredRows.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>
              Sin resultados
            </Typography>
          )}
        </Stack>

        {/* Modal Detalle DDE (solo lectura) */}
        <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Series asignadas — CDE #{cdeSel?.cde_codigo}
            <IconButton onClick={() => setOpenDetalle(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {loadingDDE ? (
              <Stack alignItems="center" sx={{ py: 3 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <>
                <List dense>
                  {ddeRows.map((d) => (
                    <React.Fragment key={d?.secuencia}>
                      <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between">
                              <span>
                                <b>Sec:</b> {d?.secuencia} — <b>Serie:</b> {d?.numero_serie}
                              </span>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {d?.fecha ?? ""}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              <b>Despacho:</b> {d?.cod_ddespacho} — <b>Producto:</b> {d?.cod_producto}
                              {d?.observacion ? ` — ${d?.observacion}` : ""}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
                {ddeRows.length === 0 && (
                  <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mt: 1 }}>
                    Sin detalles asignados.
                  </Typography>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpenDetalle(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Backdrop global */}
        <Backdrop open={busy} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Toasts */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Box>
    </ThemeProvider>
  );
}
