// src/components/logistica/CDEAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Stack, Typography,
  TextField, Paper, IconButton, CircularProgress, Chip, MenuItem, Select, InputLabel, FormControl, LinearProgress
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Autocomplete from "@mui/material/Autocomplete";
import MUIDataTable from "mui-datatables";
import Navbar0 from "../Navbar0";
import { useAuthContext } from "../../context/authContext";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// APIs — mismas rutas de services que tu proyecto
import {
  setAuthToken,
  getMenus,
  // CDE/DDE
  searchCDE, createCDE, updateCDE,
  listDDE, createDDE, updateDDE,
  searchDespachos,
  // Selectores
  listRutas, searchTRuta,
} from "../../services/dispatchApi";

// ====== helpers ======
const toISODate = (d) => {
  if (!d) return "";
  if (Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d)) {
    return d.toISOString().slice(0, 10);
  }
  return String(d).slice(0, 10);
};
const lastNDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// Tema tabla (igual que ejemplo)
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
      MuiTable: {
        styleOverrides: { root: { borderCollapse: "collapse" } },
      },
      MuiTableHead: {
        styleOverrides: { root: { borderBottom: "5px solid #ddd" } },
      },
      MuiToolbar: {
        styleOverrides: { regular: { minHeight: "10px" } },
      },
    },
  });

export default function CDEAdmin() {
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

  // ======================
  // CABECERAS (CDE)
  // ======================
  const [cdeRows, setCdeRows] = useState([]);
  const [cdeCount, setCdeCount] = useState(0);
  const [cdePage, setCdePage] = useState(1);
  const [cdePageSize, setCdePageSize] = useState(100);
  const [loadingCDE, setLoadingCDE] = useState(false);

  // filtros
  const [fEmpresa, setFEmpresa] = useState(enterpriseShineray || 20);
  const [fCodRuta, setFCodRuta] = useState("");
  const [fCodTransportista, setFCodTransportista] = useState("");
  const [fFinalizado, setFFinalizado] = useState("");

  const loadCDE = async (opts = {}) => {
    if (!fEmpresa) return;
    try {
      setLoadingCDE(true);
      const page = Number(opts.page ?? cdePage);
      const page_size = Number(opts.page_size ?? cdePageSize);
      const payload = {
        empresa: Number(fEmpresa),
        ...(String(fCodRuta).trim() ? { cod_ruta: Number(fCodRuta) } : {}),
        ...(String(fCodTransportista).trim()
          ? { cod_transportista: String(fCodTransportista).trim() }
          : {}),
        ...(String(fFinalizado) !== "" ? { finalizado: Number(fFinalizado) } : {}),
        page,
        page_size,
      };
      const data = await searchCDE(payload);
      setCdeRows(Array.isArray(data?.results) ? data.results : []);
      setCdeCount(Number(data?.count || 0));
      setCdePage(page);
      setCdePageSize(page_size);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar CDE.");
    } finally {
      setLoadingCDE(false);
    }
  };

  useEffect(() => {
    if (enterpriseShineray) {
      setFEmpresa(enterpriseShineray);
      loadCDE({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseShineray]);

  // ===== Crear / Editar CDE =====
  const [dlgCrearCDE, setDlgCrearCDE] = useState(false);
  const [dlgEditarCDE, setDlgEditarCDE] = useState(false);
  const [savingCDE, setSavingCDE] = useState(false);
  const [rowEditCDE, setRowEditCDE] = useState(null);

  // --- NUEVO: selectores de Ruta y Transportista (sin direcciones)
  const [rutasQuery, setRutasQuery] = useState("");
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [rutasOpts, setRutasOpts] = useState([]);
  const [rutaSel, setRutaSel] = useState(null);

  const [transpOpts, setTranspOpts] = useState([]);
  const [transpSel, setTranspSel] = useState(null);
  const [loadingTransp, setLoadingTransp] = useState(false);

  const [formCrear, setFormCrear] = useState({
    empresa: enterpriseShineray || 20,
  });

  // cargar rutas con debounce simple
  useEffect(() => {
    if (!dlgCrearCDE) return;
    let cancel = false;
    const handle = setTimeout(async () => {
      try {
        setLoadingRutas(true);
        const page = 1;
        const page_size = 50;
        const resp = await listRutas({
          empresa: Number(enterpriseShineray || formCrear.empresa || 20),
          page, page_size,
          ...(rutasQuery.trim() ? { nombre: rutasQuery.trim() } : {}),
        });
        if (!cancel) setRutasOpts(Array.isArray(resp?.results) ? resp.results : []);
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar rutas.");
      } finally {
        if (!cancel) setLoadingRutas(false);
      }
    }, 300);
    return () => { cancel = true; clearTimeout(handle); };
  }, [dlgCrearCDE, rutasQuery, enterpriseShineray, formCrear.empresa]);

  // cuando se seleccione una ruta, cargar Transportistas de esa ruta
  useEffect(() => {
    if (!dlgCrearCDE) return;
    if (!rutaSel) { setTranspOpts([]); setTranspSel(null); return; }
    let cancel = false;
    (async () => {
      try {
        setLoadingTransp(true);
        const data = await searchTRuta({
          empresa: Number(enterpriseShineray || formCrear.empresa || 20),
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
  }, [dlgCrearCDE, rutaSel, enterpriseShineray, formCrear.empresa]);

  const openCrearCDE = () => {
    setFormCrear({ empresa: enterpriseShineray || 20 });
    setRutaSel(null);
    setTranspSel(null);
    setRutasQuery("");
    setRutasOpts([]);
    setTranspOpts([]);
    setDlgCrearCDE(true);
  };
  const closeCrearCDE = () => { if (!savingCDE) setDlgCrearCDE(false); };

  const handleGuardarNuevaCDE = async () => {
    const emp = Number(formCrear.empresa || 0);
    if (!emp) return toast.warning("Empresa requerida.");
    if (!rutaSel?.cod_ruta) return toast.warning("Selecciona la Ruta.");
    if (!transpSel?.cod_transportista) return toast.warning("Selecciona el Transportista.");

    try {
      setSavingCDE(true);
      const res = await createCDE({
        empresa: emp,
        cod_transportista: String(transpSel.cod_transportista),
        cod_ruta: Number(rutaSel.cod_ruta),
      });
      toast.success(`CDE creada (código: ${res?.cde_codigo ?? "?"}).`);
      setDlgCrearCDE(false);
      await loadCDE({ page: 1 });
    } catch (e) {
      toast.error(e?.message || "No se pudo crear la cabecera.");
    } finally {
      setSavingCDE(false);
    }
  };

  const [formEditar, setFormEditar] = useState({
    fecha: "",
    usuario: "",
    cod_ruta: "",
    observacion: "",
    cod_persona: "",
    cod_tipo_persona: "",
    cod_transportista: "",
    finalizado: "",
  });

  const openEditarCDE = (row) => {
    setRowEditCDE(row);
    setFormEditar({
      fecha: "",
      usuario: "",
      cod_ruta: String(row?.cod_ruta ?? ""),
      observacion: "",
      cod_persona: "",
      cod_tipo_persona: "",
      cod_transportista: String(row?.cod_transportista ?? ""),
      finalizado: "",
    });
    setDlgEditarCDE(true);
  };
  const closeEditarCDE = () => { if (!savingCDE) setDlgEditarCDE(false); };

  const handleGuardarEdicionCDE = async () => {
    if (!rowEditCDE) return;
    const changes = Object.fromEntries(
      Object.entries(formEditar).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    );
    if (changes.cod_ruta && !/^\d+$/.test(String(changes.cod_ruta))) {
      return toast.warning("cod_ruta debe ser numérico.");
    }
    try {
      setSavingCDE(true);
      const res = await updateCDE(Number(rowEditCDE.empresa), Number(rowEditCDE.cde_codigo), {
        ...changes,
        ...(changes.cod_ruta ? { cod_ruta: Number(changes.cod_ruta) } : {}),
      });
      toast.success(`Cabecera ${res?.cde_codigo ?? ""} actualizada.`);
      setDlgEditarCDE(false);
      await loadCDE({ page: cdePage });
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar la cabecera.");
    } finally {
      setSavingCDE(false);
    }
  };

  // ======================
  // DETALLES (DDE)
  // ======================
  const [openDDEModal, setOpenDDEModal] = useState(false);
  const [cdeSel, setCdeSel] = useState(null);
  const [ddeRows, setDdeRows] = useState([]);
  const [ddeTotal, setDdeTotal] = useState(0);
  const [ddePage, setDdePage] = useState(1);
  const [ddePageSize, setDdePageSize] = useState(50);
  const [loadingDDE, setLoadingDDE] = useState(false);

  const openDDE = (row) => {
    setCdeSel(row);
    setOpenDDEModal(true);
    setDdePage(1);
  };

  const cargarDDE = async (opts = {}) => {
    if (!cdeSel) return;
    try {
      setLoadingDDE(true);
      const page = Number(opts.page ?? ddePage);
      const per_page = Number(opts.page_size ?? ddePageSize);
      const res = await listDDE({
        empresa: Number(cdeSel.empresa),
        cde_codigo: Number(cdeSel.cde_codigo),
        page,
        per_page,
      });
      setDdeRows(Array.isArray(res?.data) ? res.data : []);
      setDdeTotal(Number(res?.total || 0));
      setDdePage(page);
      setDdePageSize(per_page);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar detalles.");
    } finally {
      setLoadingDDE(false);
    }
  };

  useEffect(() => {
    if (openDDEModal && cdeSel) cargarDDE({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDDEModal, cdeSel]);

  // Crear DDE
  const [savingDDE, setSavingDDE] = useState(false);
  const [formAddDDE, setFormAddDDE] = useState({
    cod_ddespacho: "",
    cod_producto: "",
    numero_serie: "",
    fecha: "",
    observacion: "",
  });

  const handleCrearDDE = async () => {
    if (!cdeSel) return;
    const hasDispatch = String(formAddDDE.cod_ddespacho || "").trim() !== "";
    const hasProdOrSerie =
      String(formAddDDE.cod_producto || "").trim() !== "" ||
      String(formAddDDE.numero_serie || "").trim() !== "";
    if (!hasDispatch && !hasProdOrSerie) {
      return toast.warning("Ingresa cod_ddespacho o (cod_producto y/o numero_serie).");
    }
    try {
      setSavingDDE(true);
      const payload = {
        empresa: Number(cdeSel.empresa),
        cde_codigo: Number(cdeSel.cde_codigo),
        ...Object.fromEntries(
          Object.entries(formAddDDE).filter(([_, v]) => String(v ?? "").trim() !== "")
        ),
      };
      await createDDE(payload);
      toast.success("Detalle creado.");
      setFormAddDDE({
        cod_ddespacho: "",
        cod_producto: "",
        numero_serie: "",
        fecha: "",
        observacion: "",
      });
      await cargarDDE({ page: 1 });
    } catch (e) {
      toast.error(e?.message || "No se pudo crear el detalle.");
    } finally {
      setSavingDDE(false);
    }
  };

  // Editar DDE
  const [dlgEditarDDE, setDlgEditarDDE] = useState(false);
  const [rowEditDDE, setRowEditDDE] = useState(null);
  const [savingEditDDE, setSavingEditDDE] = useState(false);
  const [formEditDDE, setFormEditDDE] = useState({
    cod_ddespacho: "",
    cod_producto: "",
    numero_serie: "",
    fecha: "",
    observacion: "",
  });

  const openEditarDDE = (row) => {
    setRowEditDDE(row);
    setFormEditDDE({
      cod_ddespacho: row?.cod_ddespacho ?? "",
      cod_producto: row?.cod_producto ?? "",
      numero_serie: row?.numero_serie ?? "",
      fecha: row?.fecha ?? "",
      observacion: row?.observacion ?? "",
    });
    setDlgEditarDDE(true);
  };
  const closeEditarDDE = () => { if (!savingEditDDE) setDlgEditarDDE(false); };

  const handleGuardarEdicionDDE = async () => {
    if (!rowEditDDE || !cdeSel) return;
    try {
      setSavingEditDDE(true);
      const payload = Object.fromEntries(
        Object.entries(formEditDDE).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      await updateDDE(
        Number(cdeSel.empresa),
        Number(cdeSel.cde_codigo),
        Number(rowEditDDE.secuencia),
        payload
      );
      toast.success("Detalle actualizado.");
      setDlgEditarDDE(false);
      await cargarDDE({ page: ddePage });
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar el detalle.");
    } finally {
      setSavingEditDDE(false);
    }
  };

  // ======================
  // Buscar Despachos (para prellenar cod_ddespacho)
  // ======================
  const [openDespSearch, setOpenDespSearch] = useState(false);
  const [loadingDesp, setLoadingDesp] = useState(false);
  const [despRows, setDespRows] = useState([]);
  const [despCount, setDespCount] = useState(0);
  const [despFilters, setDespFilters] = useState({
    empresa: enterpriseShineray || 20
  });

  const buscarDespachos = async () => {
    try {
      setLoadingDesp(true);
      const resp = await searchDespachos({
        ...despFilters,
        empresa: Number(despFilters.empresa),
      });
      setDespRows(Array.isArray(resp?.results) ? resp.results : []);
      setDespCount(Number(resp?.count || 0));
    } catch (e) {
      toast.error(e?.message || "No se pudo buscar despachos.");
    } finally {
      setLoadingDesp(false);
    }
  };

  const pickDespToForm = (row) => {
    setFormAddDDE((f) => ({
      ...f,
      cod_ddespacho: row?.cod_ddespacho ?? row?.cod_orden ?? "",
    }));
    toast.info("Código de despacho precargado en el formulario del detalle.");
  };

  // ===== Columns / DataTable =====
  const cdeColumns = useMemo(
    () => [
      { name: "empresa", label: "Empresa" },
      { name: "cde_codigo", label: "CDE" },
      {
        name: "cod_ruta",
        label: "Ruta",
        options: {
          customBodyRenderLite: (idx) => {
            const r = cdeRows[idx];
            return `${r.cod_ruta ?? ""} — ${r.nombre_ruta ?? "-"}`;
          },
        },
      },
      {
        name: "cod_transportista",
        label: "Transportista",
        options: {
          customBodyRenderLite: (idx) => {
            const r = cdeRows[idx];
            return `${r.cod_transportista ?? ""} — ${r.nombre_transportista ?? "-"}`;
          },
        },
      },
      {
        name: "finalizado",
        label: "Estado",
        options: {
          customBodyRenderLite: (idx) => {
            const r = cdeRows[idx];
            return Number(r.finalizado) === 1 ? (
              <Chip size="small" color="success" label="Finalizado" />
            ) : (
              <Chip size="small" color="warning" label="Abierto" />
            );
          },
        },
      },
      {
        name: "acciones",
        label: "Acciones",
        options: {
          sort: false, filter: false,
          customBodyRenderLite: (idx) => {
            const row = cdeRows[idx];
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ListAltIcon />}
                  onClick={() => { setCdeSel(row); setOpenDDEModal(true); }}
                  sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                >
                  Detalles
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => openEditarCDE(row)}
                  sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                >
                  Editar
                </Button>
              </Stack>
            );
          },
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cdeRows]
  );

  const cdeOptions = {
    selectableRows: "none",
    rowsPerPage: 20,
    elevation: 0,
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: true,
    filter: false,
    search: true,
    searchPlaceholder: "Buscar por ruta/transportista...",
    textLabels: {
      body: { noMatch: loadingCDE ? "Cargando..." : "Sin resultados" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", viewColumns: "Columnas" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    },
  };

  const totalPages = Math.max(1, Math.ceil(cdeCount / cdePageSize));

  // Backdrop global
  const busy =
    loadingCDE || savingCDE || loadingDDE || savingDDE || savingEditDDE || loadingDesp;

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
            Administración de CDE (Cabeceras de Despacho–Entrega)
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openCrearCDE}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            Nueva cabecera
          </Button>
        </Stack>
      </Box>

      {/* Controles de filtros + paginación */}
      <Paper variant="outlined" sx={{ p: 2, mb: 0 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2.2}>
            <TextField
              size="small" fullWidth type="number"
              label="Empresa"
              value={fEmpresa}
              onChange={(e) => setFEmpresa(Number(e.target.value || 0))}
            />
          </Grid>
          <Grid item xs={12} md={2.2}>
            <TextField
              size="small" fullWidth
              label="Cod. Ruta"
              value={fCodRuta}
              onChange={(e) => setFCodRuta(e.target.value.replace(/\D+/g, ""))}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          </Grid>
          <Grid item xs={12} md={2.6}>
            <TextField
              size="small" fullWidth
              label="Cod. Transportista (≤14)"
              value={fCodTransportista}
              onChange={(e) => setFCodTransportista(e.target.value.slice(0, 14))}
              inputProps={{ maxLength: 14 }}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="finalizado-label">Finalizado</InputLabel>
              <Select
                labelId="finalizado-label" label="Finalizado"
                value={fFinalizado}
                onChange={(e) => setFFinalizado(e.target.value)}
              >
                <MenuItem value="">(Todos)</MenuItem>
                <MenuItem value={0}>No</MenuItem>
                <MenuItem value={1}>Sí</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small" variant="outlined" startIcon={<ArrowBackIosNewIcon />}
                disabled={loadingCDE || cdePage <= 1}
                onClick={() => loadCDE({ page: Math.max(1, cdePage - 1) })}
                sx={{ borderColor: "firebrick", color: "firebrick" }}
              >
                Anterior
              </Button>
              <Typography variant="body2">
                Página {cdePage} de {totalPages}
              </Typography>
              <Button
                size="small" variant="outlined" endIcon={<ArrowForwardIosIcon />}
                disabled={loadingCDE || cdePage >= totalPages}
                onClick={() => loadCDE({ page: Math.min(totalPages, cdePage + 1) })}
                sx={{ borderColor: "firebrick", color: "firebrick" }}
              >
                Siguiente
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button
              variant="outlined"
              onClick={() => loadCDE({ page: 1 })}
              disabled={loadingCDE}
              startIcon={loadingCDE ? <CircularProgress size={16} /> : <SearchIcon />}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              {loadingCDE ? "Buscando..." : "Buscar / Recargar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <div style={{ margin: "25px" }}>
        <ThemeProvider theme={getMuiTableTheme()}>
          <MUIDataTable title={""} data={cdeRows} columns={cdeColumns} options={cdeOptions} />
        </ThemeProvider>
      </div>

      {/* ============ DIALOGS ============ */}

      {/* Crear CDE */}
      <Dialog open={dlgCrearCDE} onClose={closeCrearCDE} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Crear cabecera CDE
          <IconButton onClick={closeCrearCDE} size="small" disabled={savingCDE}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Empresa"
              size="small" type="number" fullWidth
              value={formCrear.empresa}
              onChange={(e) => setFormCrear((s) => ({ ...s, empresa: Number(e.target.value || 0) }))}
            />

            {/* Selector de Ruta (por nombre) */}
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

            {/* Selector de Transportista para la ruta seleccionada */}
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeCrearCDE} disabled={savingCDE}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarNuevaCDE}
            disabled={savingCDE}
            startIcon={savingCDE ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {savingCDE ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar CDE */}
      <Dialog open={dlgEditarCDE} onClose={closeEditarCDE} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Editar cabecera CDE
          <IconButton onClick={closeEditarCDE} size="small" disabled={savingCDE}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Empresa" value={rowEditCDE?.empresa ?? ""} size="small" fullWidth InputProps={{ readOnly: true }} />
            <TextField label="CDE" value={rowEditCDE?.cde_codigo ?? ""} size="small" fullWidth InputProps={{ readOnly: true }} />

            <TextField
              label="Fecha (YYYY-MM-DD)"
              size="small" fullWidth
              value={formEditar.fecha}
              onChange={(e) => setFormEditar((s) => ({ ...s, fecha: e.target.value }))}
            />
            <TextField
              label="Usuario"
              size="small" fullWidth
              value={formEditar.usuario}
              onChange={(e) => setFormEditar((s) => ({ ...s, usuario: e.target.value }))}
            />
            <TextField
              label="Cod. Ruta (int)"
              size="small" fullWidth
              value={formEditar.cod_ruta}
              onChange={(e) => setFormEditar((s) => ({ ...s, cod_ruta: e.target.value.replace(/\D+/g, "") }))}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <TextField
              label="Observación"
              size="small" fullWidth
              value={formEditar.observacion}
              onChange={(e) => setFormEditar((s) => ({ ...s, observacion: e.target.value }))}
            />
            <TextField
              label="Cod. Persona"
              size="small" fullWidth
              value={formEditar.cod_persona}
              onChange={(e) => setFormEditar((s) => ({ ...s, cod_persona: e.target.value }))}
            />
            <TextField
              label="Tipo Persona"
              size="small" fullWidth
              value={formEditar.cod_tipo_persona}
              onChange={(e) => setFormEditar((s) => ({ ...s, cod_tipo_persona: e.target.value }))}
            />
            <TextField
              label="Cod. Transportista (≤14)"
              size="small" fullWidth
              value={formEditar.cod_transportista}
              onChange={(e) => setFormEditar((s) => ({ ...s, cod_transportista: e.target.value.slice(0, 14) }))}
              inputProps={{ maxLength: 14 }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="finalizado-edit">Finalizado</InputLabel>
              <Select
                labelId="finalizado-edit" label="Finalizado"
                value={formEditar.finalizado}
                onChange={(e) => setFormEditar((s) => ({ ...s, finalizado: e.target.value }))}
              >
                <MenuItem value="">(sin cambio)</MenuItem>
                <MenuItem value={0}>No</MenuItem>
                <MenuItem value={1}>Sí</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeEditarCDE} disabled={savingCDE}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarEdicionCDE}
            disabled={savingCDE}
            startIcon={savingCDE ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {savingCDE ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====== Modal: Detalles (DDE) ====== */}
      <Dialog open={openDDEModal} onClose={() => setOpenDDEModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Detalles — CDE {cdeSel ? `${cdeSel.cde_codigo} (Emp ${cdeSel.empresa})` : ""}
          <IconButton onClick={() => setOpenDDEModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Alta de DDE */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar detalle</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2.4}>
                <TextField
                  label="cod_ddespacho" size="small" fullWidth
                  value={formAddDDE.cod_ddespacho}
                  onChange={(e) => setFormAddDDE((s) => ({ ...s, cod_ddespacho: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <TextField
                  label="cod_producto" size="small" fullWidth
                  value={formAddDDE.cod_producto}
                  onChange={(e) => setFormAddDDE((s) => ({ ...s, cod_producto: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <TextField
                  label="numero_serie" size="small" fullWidth
                  value={formAddDDE.numero_serie}
                  onChange={(e) => setFormAddDDE((s) => ({ ...s, numero_serie: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <TextField
                  label="fecha (YYYY-MM-DD)" size="small" fullWidth
                  value={formAddDDE.fecha}
                  onChange={(e) => setFormAddDDE((s) => ({ ...s, fecha: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <TextField
                  label="observación" size="small" fullWidth
                  value={formAddDDE.observacion}
                  onChange={(e) => setFormAddDDE((s) => ({ ...s, observacion: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md="auto">
                <Button
                  variant="contained"
                  onClick={handleCrearDDE}
                  disabled={savingDDE}
                  startIcon={savingDDE ? <CircularProgress size={16} /> : <AddCircleOutlineIcon />}
                  sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
                >
                  {savingDDE ? "Guardando..." : "Agregar"}
                </Button>
              </Grid>
              <Grid item xs={12} md="auto">
                <Button
                  variant="outlined"
                  onClick={() => setOpenDespSearch((v) => !v)}
                  startIcon={<SearchIcon />}
                  sx={{ borderColor: "firebrick", color: "firebrick" }}
                >
                  {openDespSearch ? "Ocultar despachos" : "Buscar despachos"}
                </Button>
              </Grid>
            </Grid>

            {/* Buscador de Despachos */}
            {openDespSearch && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Empresa" size="small" fullWidth type="number"
                      value={despFilters.empresa}
                      onChange={(e) =>
                        setDespFilters((s) => ({ ...s, empresa: Number(e.target.value || 0) }))
                      }
                    />
                  </Grid>
                
                  <Grid item xs={12} md="auto">
                    <Button
                      variant="outlined"
                      onClick={buscarDespachos}
                      startIcon={loadingDesp ? <CircularProgress size={16} /> : <SearchIcon />}
                      disabled={loadingDesp}
                      sx={{ borderColor: "firebrick", color: "firebrick" }}
                    >
                      {loadingDesp ? "Buscando..." : "Buscar"}
                    </Button>
                  </Grid>
                </Grid>

                {loadingDesp && <LinearProgress sx={{ mt: 1 }} />}

                <Box sx={{ mt: 1, maxHeight: 260, overflow: "auto" }}>
                  <ThemeProvider theme={getMuiTableTheme()}>
                    <MUIDataTable
                      title={""}
                      data={despRows}
                      columns={[
                        { name: "cod_pedido", label: "Pedido" },
                        { name: "cod_orden", label: "Orden" },
                        { name: "ruc_cliente", label: "Cliente" },
                        { name: "ruta", label: "Ruta" },
                        { name: "destino", label: "Destino" },
                        {
                          name: "acciones",
                          label: "Usar",
                          options: {
                            sort: false, filter: false,
                            customBodyRenderLite: (idx) => {
                              const row = despRows[idx];
                              return (
                                <Button
                                  size="small"
                                  onClick={() => pickDespToForm(row)}
                                  variant="outlined"
                                  sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                                >
                                  Usar
                                </Button>
                              );
                            },
                          },
                        },
                      ]}
                      options={{
                        selectableRows: "none",
                        rowsPerPage: 10,
                        elevation: 0,
                        responsive: "standard",
                        download: false,
                        print: false,
                        filter: false,
                        search: false,
                        textLabels: {
                          body: { noMatch: loadingDesp ? "Cargando..." : "Sin resultados" },
                          pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
                        },
                      }}
                    />
                  </ThemeProvider>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Tabla DDE */}
          <ThemeProvider theme={getMuiTableTheme()}>
            <MUIDataTable
              title={""}
              data={ddeRows}
              columns={[
                { name: "secuencia", label: "Secuencia" },
                { name: "cod_ddespacho", label: "cod_ddespacho" },
                { name: "cod_producto", label: "cod_producto" },
                { name: "numero_serie", label: "numero_serie" },
                { name: "fecha", label: "fecha" },
                { name: "observacion", label: "observación" },
                {
                  name: "acciones",
                  label: "Acciones",
                  options: {
                    sort: false, filter: false,
                    customBodyRenderLite: (idx) => {
                      const row = ddeRows[idx];
                      return (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEditarDDE(row)}
                          sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                        >
                          Editar
                        </Button>
                      );
                    },
                  },
                },
              ]}
              options={{
                selectableRows: "none",
                rowsPerPage: 20,
                elevation: 0,
                responsive: "standard",
                download: false,
                print: false,
                viewColumns: true,
                filter: true,
                textLabels: {
                  body: { noMatch: loadingDDE ? "Cargando..." : "Sin detalles" },
                  pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
                  toolbar: { search: "Buscar", viewColumns: "Columnas", filterTable: "Filtrar" },
                  filter: { all: "Todos", title: "FILTROS", reset: "LIMPIAR" },
                  viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
                },
              }}
            />
          </ThemeProvider>

          {/* Paginación DDE simple */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Button
              size="small" variant="outlined" startIcon={<ArrowBackIosNewIcon />}
              disabled={loadingDDE || ddePage <= 1}
              onClick={() => cargarDDE({ page: Math.max(1, ddePage - 1) })}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              Anterior
            </Button>
            <Typography variant="body2">
              Página {ddePage} de {Math.max(1, Math.ceil(ddeTotal / ddePageSize))}
            </Typography>
            <Button
              size="small" variant="outlined" endIcon={<ArrowForwardIosIcon />}
              disabled={loadingDDE || ddePage >= Math.max(1, Math.ceil(ddeTotal / ddePageSize))}
              onClick={() => cargarDDE({ page: Math.min(Math.max(1, Math.ceil(ddeTotal / ddePageSize)), ddePage + 1) })}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              Siguiente
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => cargarDDE({ page: ddePage })}
              disabled={loadingDDE}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              {loadingDDE ? "Actualizando..." : "Recargar"}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDDEModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Editar DDE */}
      <Dialog open={dlgEditarDDE} onClose={closeEditarDDE} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Editar detalle — Secuencia {rowEditDDE?.secuencia ?? ""}
          <IconButton onClick={closeEditarDDE} size="small" disabled={savingEditDDE}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="cod_ddespacho" size="small" fullWidth
              value={formEditDDE.cod_ddespacho}
              onChange={(e) => setFormEditDDE((s) => ({ ...s, cod_ddespacho: e.target.value }))}
            />
            <TextField
              label="cod_producto" size="small" fullWidth
              value={formEditDDE.cod_producto}
              onChange={(e) => setFormEditDDE((s) => ({ ...s, cod_producto: e.target.value }))}
            />
            <TextField
              label="numero_serie" size="small" fullWidth
              value={formEditDDE.numero_serie}
              onChange={(e) => setFormEditDDE((s) => ({ ...s, numero_serie: e.target.value }))}
            />
            <TextField
              label="fecha (YYYY-MM-DD)" size="small" fullWidth
              value={formEditDDE.fecha}
              onChange={(e) => setFormEditDDE((s) => ({ ...s, fecha: e.target.value }))}
            />
            <TextField
              label="observación" size="small" fullWidth
              value={formEditDDE.observacion}
              onChange={(e) => setFormEditDDE((s) => ({ ...s, observacion: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeEditarDDE} disabled={savingEditDDE}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarEdicionDDE}
            disabled={savingEditDDE}
            startIcon={savingEditDDE ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {savingEditDDE ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop global */}
      <Backdrop open={busy} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Toasts */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}
