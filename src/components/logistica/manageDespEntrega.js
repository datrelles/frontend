// src/components/logistica/DespachosControl.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Stack, Typography,
  TextField, Paper, IconButton, CircularProgress, Chip, MenuItem, Select, InputLabel, FormControl,
  LinearProgress, Tooltip
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import Autocomplete from "@mui/material/Autocomplete";
import MUIDataTable from "mui-datatables";
import Navbar0 from "../Navbar0";
import { useAuthContext } from "../../context/authContext";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// APIs
import {
  setAuthToken,
  getMenus,
  searchDespachos,
  listRutas,
  searchTRuta,
  updateCDespacho
} from "../../services/dispatchApi";

// ====== MUI table theme ======
const getMuiTableTheme = () =>
  createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            paddingLeft: "3px",
            paddingRight: "3px",
            paddingTop: "0px",
            paddingBottom: "0px",
            backgroundColor: "#00000",
            whiteSpace: "nowrap",
            flex: 1,
            borderBottom: "1px solid #ddd",
            borderRight: "1px solid #ddd",
            fontSize: "14px",
          },
          head: {
            backgroundColor: "firebrick",
            color: "#ffffff",
            fontWeight: "bold",
            paddingLeft: "0px",
            paddingRight: "0px",
            fontSize: "12px",
          },
        },
      },
      MuiTable: { styleOverrides: { root: { borderCollapse: "collapse" } } },
      MuiTableHead: { styleOverrides: { root: { borderBottom: "5px solid #ddd" } } },
      MuiToolbar: { styleOverrides: { regular: { minHeight: "10px" } } },
    },
  });

const norm = (s) =>
  (String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase());

const fmtDate = (d) => (d ? String(d).slice(0, 10) : "-");
const toISO = (d) => (d ? String(d).slice(0, 10) : null);

// Filtros de estado
const MODES = {
  TODOS: "TODOS",
  EN_DESPACHO: "EN_DESPACHO",      // en_despacho:1, despachada:0
  POR_DESPACHAR: "POR_DESPACHAR",  // en_despacho:0, despachada:0, cod_guia_des != null
  SIN_GUIA: "SIN_GUIA",            // cod_guia_des == null y en_despacho:0, despachada:0
  DESPACHADO: "DESPACHADO",        // en_despacho:1, despachada:1
};

const DATE_FIELDS = {
  TODAS: "TODAS",
  FECHA_AGREGA: "fecha_agrega",
  FECHA_EST_DESP: "fecha_est_desp",
  FECHA_DESPACHO: "fecha_despacho",
  FECHA_ENVIO: "fecha_envio",
};

export default function DespachosControl() {
  // ====== Auth & token ======
  const { jwt, enterpriseShineray, userShineray } = useAuthContext();
  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  // ====== Menús / Navbar ======
  const [menus, setMenus] = useState([]);
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, "LOG");
        setMenus(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(e?.message || "No se pudieron cargar los menús.");
      }
    };
    loadMenus();
  }, [enterpriseShineray, userShineray, jwt]);

  // ====== Estado de consulta principal ======
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [loading, setLoading] = useState(false);

  // Búsqueda rápida
  const [q, setQ] = useState("");

  // Filtro por modo
  const [mode, setMode] = useState(MODES.TODOS);

  // Filtros por fecha
  const [dateField, setDateField] = useState(DATE_FIELDS.TODAS);
  const [dateFrom, setDateFrom] = useState(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState("");     // yyyy-mm-dd

  // Empresa
  const [empresa, setEmpresa] = useState(enterpriseShineray || 20);

  // Cargar data
  const loadData = async (opts = {}) => {
    if (!empresa) return;
    try {
      setLoading(true);
      const _page = Number(opts.page ?? page);
      const _pageSize = Number(opts.page_size ?? pageSize);
      const payload = {
        empresa: Number(empresa),
        page: _page,
        page_size: _pageSize,
      };
      const data = await searchDespachos(payload);
      setRows(Array.isArray(data?.results) ? data.results : []);
      setCount(Number(data?.count || 0));
      setPage(_page);
      setPageSize(_pageSize);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar la lista de despachos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enterpriseShineray) {
      setEmpresa(enterpriseShineray);
      loadData({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseShineray]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // ====== Util de filtro por rango de fechas ======
  const inRange = (iso, from, to) => {
    if (!iso) return false;
    if (from && iso < from) return false;
    if (to && iso > to) return false;
    return true;
  };

  // ====== Filtro por modo + búsqueda + fechas ======
  const filteredRows = useMemo(() => {
    let arr = rows;

    // Filtros por modo
    switch (mode) {
      case MODES.EN_DESPACHO:
        arr = arr.filter(r => Number(r?.en_despacho) === 1 && Number(r?.despachada) === 0);
        break;
      case MODES.POR_DESPACHAR:
        arr = arr.filter(r =>
          Number(r?.en_despacho) === 0 &&
          Number(r?.despachada) === 0 &&
          r?.cod_guia_des != null &&
          String(r?.cod_guia_des).trim() !== ""
        );
        break;
      case MODES.SIN_GUIA:
        arr = arr.filter(r =>
          (r?.cod_guia_des == null || String(r?.cod_guia_des).trim() === "") &&
          Number(r?.en_despacho) === 0 &&
          Number(r?.despachada) === 0
        );
        break;
      case MODES.DESPACHADO:
        arr = arr.filter(r => Number(r?.en_despacho) === 1 && Number(r?.despachada) === 1);
        break;
      default:
        break;
    }

    // Filtro por fecha(s)
    const from = dateFrom || "";
    const to = dateTo || "";
    if (from || to) {
      arr = arr.filter(r => {
        const fa = toISO(r?.fecha_agrega);
        const fe = toISO(r?.fecha_est_desp);
        const fd = toISO(r?.fecha_despacho);
        const fv = toISO(r?.fecha_envio);

        if (dateField === DATE_FIELDS.TODAS) {
          return (
            inRange(fa, from, to) ||
            inRange(fe, from, to) ||
            inRange(fd, from, to) ||
            inRange(fv, from, to)
          );
        } else {
          const iso = toISO(r?.[dateField]);
          return inRange(iso, from, to);
        }
      });
    }

    // Búsqueda rápida
    const nq = norm(q);
    if (!nq) return arr;

    return arr.filter(r =>
      norm(r?.cliente).includes(nq) ||
      norm(r?.cod_pedido).includes(nq) ||
      norm(r?.cod_orden).includes(nq) ||
      norm(r?.numero_serie).includes(nq) ||
      norm(r?.ruta).includes(nq) ||
      norm(r?.destino).includes(nq) ||
      norm(r?.ruc_cliente).includes(nq)
    );
  }, [rows, mode, q, dateField, dateFrom, dateTo]);

  // ====== Diálogo Editar (sólo ruta, transportista, despachada) ======
  const [dlgEdit, setDlgEdit] = useState(false);
  const [rowEdit, setRowEdit] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Rutas selector
  const [rutasQuery, setRutasQuery] = useState("");
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [rutasOpts, setRutasOpts] = useState([]);
  const [rutaSel, setRutaSel] = useState(null);

  // Transportistas por ruta
  const [loadingTransp, setLoadingTransp] = useState(false);
  const [transpOpts, setTranspOpts] = useState([]);
  const [transpSel, setTranspSel] = useState(null);

  // Despachada (0/1)
  const [esDespachada, setEsDespachada] = useState("");

  // Cargar rutas con debounce cuando el diálogo está abierto
  useEffect(() => {
    if (!dlgEdit) return;
    let cancel = false;
    const h = setTimeout(async () => {
      try {
        setLoadingRutas(true);
        const resp = await listRutas({
          empresa: Number(empresa || 20),
          page: 1,
          page_size: 50,
          ...(rutasQuery.trim() ? { nombre: rutasQuery.trim() } : {})
        });
        if (!cancel) setRutasOpts(Array.isArray(resp?.results) ? resp.results : []);
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar rutas.");
      } finally {
        if (!cancel) setLoadingRutas(false);
      }
    }, 300);
    return () => { cancel = true; clearTimeout(h); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dlgEdit, rutasQuery, empresa]);

  // Cuando se elige una ruta, cargar transportistas de esa ruta
  useEffect(() => {
    if (!dlgEdit) return;
    if (!rutaSel?.cod_ruta) { setTranspOpts([]); setTranspSel(null); return; }
    let cancel = false;
    (async () => {
      try {
        setLoadingTransp(true);
        const data = await searchTRuta({
          empresa: Number(empresa || 20),
          cod_ruta: Number(rutaSel.cod_ruta),
          page: 1,
          page_size: 200,
        });
        if (!cancel) setTranspOpts(Array.isArray(data?.results) ? data.results : []);
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar transportistas.");
      } finally {
        if (!cancel) setLoadingTransp(false);
      }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dlgEdit, rutaSel, empresa]);

  const openEdit = (row) => {
    setRowEdit(row);
    setRutaSel(row?.cod_ruta ? { cod_ruta: row.cod_ruta, empresa, nombre: row?.ruta } : null);
    setTranspSel(null);
    setRutasQuery("");
    setTranspOpts([]);
    setEsDespachada(
      typeof row?.despachada !== "undefined" && row?.despachada !== null
        ? Number(row.despachada)
        : ""
    );
    setDlgEdit(true);
  };

  const closeEdit = () => { if (!savingEdit) setDlgEdit(false); };

  const handleSaveEdit = async () => {
    if (!rowEdit) return;

    // Restricción: sólo editar si en_despacho=0 y despachada=0
    if (!(Number(rowEdit?.en_despacho) === 0 && Number(rowEdit?.despachada) === 0)) {
      return toast.warning("Solo se puede editar cuando EN_DESPACHO y DESPACHADA están en 0.");
    }

    if (!rowEdit?.cod_despacho) {
      return toast.warning("Este registro no tiene 'cod_despacho' para actualizar.");
    }
    const payload = {};
    if (rutaSel?.cod_ruta) payload.cod_ruta = Number(rutaSel.cod_ruta);
    if (transpSel?.cod_transportista) payload.cod_transportista = String(transpSel.cod_transportista);
    if (esDespachada !== "") payload.es_despachada = Number(esDespachada);
    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios para guardar.");
      return;
    }
    try {
      setSavingEdit(true);
      const res = await updateCDespacho(
        Number(empresa),
        Number(rowEdit.cod_despacho),
        { ...payload, usr_agrega: userShineray || undefined },
        { method: "PATCH" }
      );
      toast.success(`Despacho ${res?.cod_despacho ?? rowEdit.cod_despacho} actualizado.`);
      setDlgEdit(false);
      await loadData({ page });
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar el despacho.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ====== Columnas ======
  const columns = useMemo(
    () => [
      {
        name: "en_despacho",
        label: "EN_DESPACHO",
        options: {
          customBodyRenderLite: (idx) => {
            const r = filteredRows[idx];
            const val = Number(r?.en_despacho) === 1;
            return val
              ? <Chip size="small" color="info" icon={<LocalShippingIcon />} label="Sí" />
              : <Chip size="small" color="default" icon={<DoNotDisturbAltIcon />} label="No" />;
          },
        },
      },
      {
        name: "despachada",
        label: "DESPACHADA",
        options: {
          customBodyRenderLite: (idx) => {
            const r = filteredRows[idx];
            const val = Number(r?.despachada) === 1;
            return val
              ? <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Sí" />
              : <Chip size="small" color="warning" icon={<AssignmentLateIcon />} label="No" />;
          },
        },
      },
      { name: "cod_pedido", label: "COD_PEDIDO" },
      { name: "fac_con", label: "FAC_CON" },
      { name: "cod_orden", label: "COD_ORDEN" },
      {
        name: "cod_guia_des",
        label: "COD_GUIA_DES",
        options: {
          customBodyRenderLite: (idx) => filteredRows[idx]?.cod_guia_des ?? "-",
        },
      },
      {
        name: "cod_guia_envio",
        label: "COD_GUIA_ENVIO",
        options: {
          customBodyRenderLite: (idx) => {
            const v = filteredRows[idx]?.cod_guia_envio;
            return v ? v : <Chip size="small" color="warning" label="SIN GUÍA" />;
          },
        },
      },
      { name: "cadena", label: "CADENA" },
      { name: "ruta", label: "RUTA" },
      { name: "transportista", label: "TRANSPORTISTA" },
      { name: "ruc_cliente", label: "RUC_CLIENTE" },
      { name: "cliente", label: "CLIENTE" },
      { name: "destino", label: "DESTINO" },
      {
        name: "fecha_agrega",
        label: "FECHA_AGREGA",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_agrega) },
      },
      {
        name: "fecha_est_desp",
        label: "FECHA_EST_DESP",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_est_desp) },
      },
      {
        name: "fecha_despacho",
        label: "FECHA_DESPACHO",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_despacho) },
      },
      {
        name: "fecha_envio",
        label: "FECHA_ENVIO",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_envio) },
      },
      { name: "bod_destino", label: "BOD_DESTINO" },
      { name: "producto", label: "PRODUCTO" },
      { name: "cod_producto", label: "COD_PRODUCTO" },
      { name: "nombre", label: "NOMBRE" },
      { name: "modelo", label: "MODELO" },
      { name: "numero_serie", label: "NUMERO_SERIE" },
      { name: "cod_color", label: "COD_COLOR" },
      {
        name: "acciones",
        label: "ACCIONES",
        options: {
          sort: false, filter: false,
          customBodyRenderLite: (idx) => {
            const row = filteredRows[idx];
            const hasCod = !!row?.cod_despacho;
            const canState = Number(row?.en_despacho) === 0 && Number(row?.despachada) === 0;
            const canEdit = hasCod && canState;
            const tooltip = !hasCod
              ? "No se puede editar: falta cod_despacho"
              : (!canState ? "Solo editable si EN_DESPACHO y DESPACHADA están en 0" : "Editar despacho");
            return (
              <Tooltip title={tooltip}>
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    disabled={!canEdit}
                    onClick={() => openEdit(row)}
                    sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                  >
                    Editar
                  </Button>
                </span>
              </Tooltip>
            );
          },
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredRows]
  );

  const options = {
    selectableRows: "none",
    rowsPerPage: 20,
    elevation: 0,
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: true,
    filter: false,
    search: true,
    searchPlaceholder: "Buscar en cliente/pedido/orden/serie/ruta/destino…",
    textLabels: {
      body: { noMatch: loading ? "Cargando..." : "Sin resultados" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", viewColumns: "Columnas" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    },
  };

  // Backdrop global
  const busy = loading || savingEdit || loadingRutas || loadingTransp;

  // ===== Render =====
  return (
    <Box sx={{ mt: 18 }}>
      <Navbar0 menus={menus} />

      {/* Header */}
      <Box
        sx={{
          px: 3, mb: 1,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 2,
        }}
      >
        <Stack spacing={0}>
          <Typography variant="h6" sx={{ fontWeight: 250 }}>
            Panel de Control de Despachos (VT_DESPACHO_FINAL)
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Empresa: {empresa}
          </Typography>
        </Stack>
      </Box>

      {/* Controles: filtros por estado, buscador, fechas y paginación/recarga */}
      <Paper variant="outlined" sx={{ p: 2, mb: 0 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Botonera de estados */}
          <Grid item xs={12} md>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant={mode === MODES.TODOS ? "contained" : "outlined"}
                onClick={() => setMode(MODES.TODOS)}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor: mode === MODES.TODOS ? "firebrick" : "transparent",
                  color: mode === MODES.TODOS ? "#fff" : "firebrick",
                  borderColor: "firebrick"
                }}
              >
                Todos
              </Button>

              <Button
                size="small"
                variant={mode === MODES.EN_DESPACHO ? "contained" : "outlined"}
                onClick={() => setMode(MODES.EN_DESPACHO)}
                startIcon={<LocalShippingIcon />}
                sx={{
                  bgcolor: mode === MODES.EN_DESPACHO ? "firebrick" : "transparent",
                  color: mode === MODES.EN_DESPACHO ? "#fff" : "firebrick",
                  borderColor: "firebrick"
                }}
              >
                En despacho
              </Button>

              <Button
                size="small"
                variant={mode === MODES.POR_DESPACHAR ? "contained" : "outlined"}
                onClick={() => setMode(MODES.POR_DESPACHAR)}
                startIcon={<AssignmentLateIcon />}
                sx={{
                  bgcolor: mode === MODES.POR_DESPACHAR ? "firebrick" : "transparent",
                  color: mode === MODES.POR_DESPACHAR ? "#fff" : "firebrick",
                  borderColor: "firebrick"
                }}
              >
                Por despachar
              </Button>

              <Button
                size="small"
                variant={mode === MODES.SIN_GUIA ? "contained" : "outlined"}
                onClick={() => setMode(MODES.SIN_GUIA)}
                startIcon={<DoNotDisturbAltIcon />}
                sx={{
                  bgcolor: mode === MODES.SIN_GUIA ? "firebrick" : "transparent",
                  color: mode === MODES.SIN_GUIA ? "#fff" : "firebrick",
                  borderColor: "firebrick"
                }}
              >
                Sin guía
              </Button>

              <Button
                size="small"
                variant={mode === MODES.DESPACHADO ? "contained" : "outlined"}
                onClick={() => setMode(MODES.DESPACHADO)}
                startIcon={<CheckCircleIcon />}
                sx={{
                  bgcolor: mode === MODES.DESPACHADO ? "firebrick" : "transparent",
                  color: mode === MODES.DESPACHADO ? "#fff" : "firebrick",
                  borderColor: "firebrick"
                }}
              >
                Despachado
              </Button>
            </Stack>
          </Grid>

          {/* Buscador rápido */}
          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar por cliente, pedido, orden, serie, ruta, destino, RUC…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "#666" }} />,
              }}
            />
          </Grid>


          {/* Paginación simple y recarga */}
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small" variant="outlined" startIcon={<ArrowBackIosNewIcon />}
                disabled={loading || page <= 1}
                onClick={() => loadData({ page: Math.max(1, page - 1) })}
                sx={{ borderColor: "firebrick", color: "firebrick" }}
              >
                Anterior
              </Button>
              <Typography variant="body2">
                Página {page} de {totalPages}
              </Typography>
              <Button
                size="small" variant="outlined" endIcon={<ArrowForwardIosIcon />}
                disabled={loading || page >= totalPages}
                onClick={() => loadData({ page: Math.min(totalPages, page + 1) })}
                sx={{ borderColor: "firebrick", color: "firebrick" }}
              >
                Siguiente
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button
              variant="outlined"
              onClick={() => loadData({ page: 1 })}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              {loading ? "Actualizando..." : "Recargar"}
            </Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mt: 1 }} />}
      </Paper>

      {/* Tabla principal */}
      <div style={{ margin: "25px" }}>
        <ThemeProvider theme={getMuiTableTheme()}>
          <MUIDataTable title={""} data={filteredRows} columns={columns} options={options} />
        </ThemeProvider>
      </div>

      {/* === Diálogo Editar === */}
      <Dialog open={dlgEdit} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Editar despacho
          <IconButton onClick={closeEdit} size="small" disabled={savingEdit}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!rowEdit ? null : (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                <b>Cod. Despacho:</b> {rowEdit?.cod_despacho ?? "-"} &nbsp;&nbsp;
                <b>Pedido:</b> {rowEdit?.cod_pedido ?? "-"} &nbsp;&nbsp;
                <b>Orden:</b> {rowEdit?.cod_orden ?? "-"}
              </Typography>

              {/* Ruta */}
              <Autocomplete
                options={rutasOpts}
                loading={loadingRutas}
                value={rutaSel}
                onChange={(_, val) => setRutaSel(val)}
                inputValue={rutasQuery}
                onInputChange={(_, val) => setRutasQuery(val)}
                isOptionEqualToValue={(op, val) =>
                  op?.cod_ruta === val?.cod_ruta && op?.empresa === val?.empresa
                }
                getOptionLabel={(o) => (o ? `${o.cod_ruta ?? ""} — ${o.nombre ?? ""}` : "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ruta (buscar por nombre)"
                    size="small"
                    placeholder="Escribe para buscar..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingRutas ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Transportista para la ruta seleccionada */}
              <Autocomplete
                options={transpOpts}
                loading={loadingTransp}
                value={transpSel}
                onChange={(_, val) => setTranspSel(val)}
                disabled={!rutaSel}
                isOptionEqualToValue={(op, val) => op?.cod_transportista === val?.cod_transportista}
                getOptionLabel={(o) => (o ? `${o.cod_transportista ?? ""} — ${o.nombre_transportista ?? ""}` : "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Transportista (de la ruta seleccionada)"
                    size="small"
                    placeholder={rutaSel ? "Selecciona un transportista..." : "Primero selecciona una Ruta"}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTransp ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Despachada 0/1 */}
              <FormControl size="small" fullWidth>
                <InputLabel id="despachada-edit">Despachada</InputLabel>
                <Select
                  labelId="despachada-edit" label="Despachada"
                  value={esDespachada}
                  onChange={(e) => setEsDespachada(e.target.value)}
                >
                  <MenuItem value="">(sin cambio)</MenuItem>
                  <MenuItem value={0}>No</MenuItem>
                  <MenuItem value={1}>Sí</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeEdit} disabled={savingEdit}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={savingEdit}
            startIcon={savingEdit ? <CircularProgress size={16} /> : <EditIcon />}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {savingEdit ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop global */}
      <Backdrop open={busy} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Toasts */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}
