// src/components/reservas/ReservasPedidosAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Stack, Typography,
  FormControl, TextField, Paper, IconButton, CircularProgress, FormHelperText, Chip,
  ToggleButtonGroup, ToggleButton, Switch, FormControlLabel
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MUIDataTable from "mui-datatables";
import dayjs from "dayjs";
import Navbar0 from "../Navbar0";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuthContext } from "../../context/authContext";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// APIs
import {
  setAuthToken,
  getStockProductosMotos,
  getReservas,
  createReserva,
  updateReserva,
} from "../../services/dispatchApi";

// Tema de tabla
const getMuiTableTheme = () =>
  createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: { paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 6, whiteSpace: "nowrap", borderBottom: "1px solid #e0e0e0", fontSize: 14 },
          head: { backgroundColor: "firebrick", color: "#fff", fontWeight: 700, fontSize: 12 },
        },
      },
      MuiToolbar: { styleOverrides: { regular: { minHeight: 44 } } },
    },
  });

const selectedFirebrickSx = {
  textTransform: "none",

  "&:hover": { borderColor: "#8f1a1a", backgroundColor: "rgba(178,34,34,0.06)" },
  "&.Mui-selected": {
    backgroundColor: "firebrick !important",
    color: "#fff",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "#8f1a1a !important",
  },
};

const BODEGA_ORIGEN = 5;
const DESTINOS = [
  { key: "A3", label: "A3", cod_bodega: 1, subtitle: "Bodega 1" },
  { key: "MY", label: "MY", cod_bodega: 25, subtitle: "Bodega 25" },
];

const ESTADO_FILTROS = {
  TODOS: "TODOS",
  ACTIVOS: "ACTIVOS",     // es_inactivo = 0
  INACTIVOS: "INACTIVOS", // es_inactivo = 1
};

export default function ReservasPedidosAdmin() {
  const { jwt, enterpriseShineray } = useAuthContext();
  const menus = useMemo(() => [], []);

  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  // ====== Catálogo modelos (stock) ======
  const [catalogoModelos, setCatalogoModelos] = useState([]);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [errorModelos, setErrorModelos] = useState("");
  const filtraModelos = createFilterOptions({ stringify: (opt) => `${opt.cod} ${opt.nombre}` });

  const cargarCatalogoModelos = async () => {
    try {
      setLoadingModelos(true);
      setErrorModelos("");
      const data = await getStockProductosMotos();
      const mapped = Array.isArray(data)
        ? data.map((it) => ({
          cod: String(it.COD_PRODUCTO ?? it.cod_producto ?? "").trim(),
          nombre: String(it.NOMBRE ?? it.nombre ?? "").trim() || String(it.cod_producto ?? "").trim(),
          stock: Number(it.DISPONIBLE ?? it.stock ?? 0),
          raw: it,
        }))
        : [];
      setCatalogoModelos(mapped);
    } catch (e) {
      setErrorModelos(e?.message || "No se pudo cargar el catálogo de modelos.");
      toast.error(e?.message || "No se pudo cargar el catálogo de modelos.");
    } finally {
      setLoadingModelos(false);
    }
  };

  useEffect(() => { cargarCatalogoModelos(); }, []);

  // ====== Filtros por fechas ======
  const hoy = dayjs();
  const [fechaDesde, setFechaDesde] = useState(hoy.startOf("month"));
  const [fechaHasta, setFechaHasta] = useState(hoy.endOf("month"));

  // Filtro por estado (es_inactivo) — SOLO FRONT
  const [estadoFiltro, setEstadoFiltro] = useState(ESTADO_FILTROS.TODOS);

  // ====== Listado reservas ======
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);

  const cargarReservas = async () => {
    try {
      setLoadingReservas(true);
      const params = {
        empresa: enterpriseShineray,
        ordering: "-fecha_ini",
        page: 1,
        page_size: 50,
        ...(fechaDesde ? { fecha_desde: dayjs(fechaDesde).format("YYYY-MM-DD") } : {}),
        ...(fechaHasta ? { fecha_hasta: dayjs(fechaHasta).format("YYYY-MM-DD") } : {}),
        // NO enviamos es_inactivo al backend: el filtro es solo front.
      };
      const resp = await getReservas(params);
      let rows = Array.isArray(resp?.results) ? resp.results : [];

      if (estadoFiltro === ESTADO_FILTROS.ACTIVOS) {
        rows = rows.filter((r) => Number(r?.es_inactivo || 0) === 0);
      } else if (estadoFiltro === ESTADO_FILTROS.INACTIVOS) {
        rows = rows.filter((r) => Number(r?.es_inactivo || 0) === 1);
      }

      setReservas(rows);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar reservas.");
    } finally {
      setLoadingReservas(false);
    }
  };

  useEffect(() => { if (enterpriseShineray) cargarReservas(); /* eslint-disable-next-line */ }, [enterpriseShineray]);
  useEffect(() => { if (enterpriseShineray) cargarReservas(); /* eslint-disable-next-line */ }, [fechaDesde, fechaHasta, estadoFiltro]);

  // Refresco global tras mutaciones (crear/editar)
  const refreshAfterMutation = async () => {
    await Promise.all([cargarReservas(), cargarCatalogoModelos()]);
  };

  // ====== Crear ======
  const [openCrear, setOpenCrear] = useState(false);
  const [modeloCod, setModeloCod] = useState("");
  const [unidades, setUnidades] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState(null);
  const [destinoKey, setDestinoKey] = useState(""); // "A3" | "MY"
  const [saving, setSaving] = useState(false);

  // ====== Editar ======
  const [openEditar, setOpenEditar] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editCantidad, setEditCantidad] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editEsInactivo, setEditEsInactivo] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // ====== Duplicados activos (mismo mes + bodega destino) ======
  const checkDuplicadoActivoMismoMes = async ({
    empresa,
    cod_producto,
    cod_bodega_destino,
    fecha_ini_ref,
    excluir_cod_reserva = null
  }) => {
    if (!empresa || !cod_producto || !cod_bodega_destino || !fecha_ini_ref) return false;

    const monthStart = dayjs(fecha_ini_ref).startOf("month").format("YYYY-MM-DD");
    const monthEnd = dayjs(fecha_ini_ref).endOf("month").format("YYYY-MM-DD");
    const hoyISO = dayjs().format("YYYY-MM-DD");

    const resp = await getReservas({
      empresa,
      cod_producto,
      fecha_desde: monthStart,
      fecha_hasta: monthEnd,
      page: 1,
      page_size: 200,
      ordering: "-fecha_ini",
    });

    const rows = Array.isArray(resp?.results) ? resp.results : [];

    const conflictos = rows.filter((r) => {
      if (excluir_cod_reserva && String(r.cod_reserva) === String(excluir_cod_reserva)) return false;
      const fin = r?.fecha_fin ? dayjs(r.fecha_fin).format("YYYY-MM-DD") : null;
      const mismaBodDestino = String(r?.cod_bodega_destino ?? "") === String(cod_bodega_destino);
      const activa = Number(r?.es_inactivo || 0) === 0;
      return activa && mismaBodDestino && fin && fin >= hoyISO;
    });

    return conflictos.length > 0;
  };

  const handleOpenCrear = () => {
    setModeloCod("");
    setUnidades("");
    setFechaCaducidad(null);
    setDestinoKey("");
    setOpenCrear(true);
  };
  const handleCloseCrear = () => { if (!saving) setOpenCrear(false); };

  const handleGuardarReserva = async () => {
    if (!modeloCod) return toast.warning("Selecciona un modelo.");
    if (!unidades || Number(unidades) <= 0) return toast.warning("Ingresa unidades válidas.");
    if (!fechaCaducidad?.isValid?.()) return toast.warning("Selecciona fecha de caducidad.");
    const destino = DESTINOS.find((d) => d.key === destinoKey);
    if (!destino) return toast.warning("Selecciona bodega destino (A3 o MY).");

    // Regla anti-duplicados: solo si será activa
    const fechaIniHoy = dayjs().format("YYYY-MM-DD");
    const seraActiva = true; // al crear enviamos es_inactivo=0 por defecto
    if (seraActiva) {
      const hayDuplicado = await checkDuplicadoActivoMismoMes({
        empresa: Number(enterpriseShineray),
        cod_producto: String(modeloCod),
        cod_bodega_destino: destino.cod_bodega,
        fecha_ini_ref: fechaIniHoy,
      });
      if (hayDuplicado) return toast.error("Ya existe una reserva activa de ese modelo y bodega destino en el mismo mes.");
    }

    const payload = {
      empresa: Number(enterpriseShineray),
      cod_producto: String(modeloCod),
      cod_bodega: BODEGA_ORIGEN,
      cod_bodega_destino: destino.cod_bodega,
      cantidad: Number(unidades),
      fecha_ini: fechaIniHoy,
      fecha_fin: dayjs(fechaCaducidad).format("YYYY-MM-DD"),
      es_inactivo: 0,
      cantidad_utilizada: 0,
      observacion: "Creación de reserva desde UI",
    };

    try {
      setSaving(true);
      const data = await createReserva(payload);
      const msg = (data?.errors?.cantidad ?? []).join(" | ");
      if (data?.errors) {
        toast.warning(msg);
        return; // no continúes como éxito
      }
      toast.success("Reserva creada correctamente.");
      setOpenCrear(false);
      await refreshAfterMutation(); // <— recarga reservas + stock
    } catch (e) {
      toast.error(e?.message || "No se pudo crear la reserva.");
    } finally {
      setSaving(false);
    }
  };

  // ====== Edición de cantidad y es_inactivo (observación obligatoria) ======
  const openEditarDialog = (row) => {
    setEditRow(row);
    setEditCantidad(String(row?.cantidad ?? ""));
    setEditObs("");
    setEditEsInactivo(Number(row?.es_inactivo || 0) === 1);
    setOpenEditar(true);
  };
  const closeEditarDialog = () => {
    if (!savingEdit) setOpenEditar(false);
  };

  const handleGuardarEdicion = async () => {
    if (!editRow) return;
    if (!editCantidad || Number(editCantidad) <= 0) return toast.warning("Ingresa una cantidad válida.");
    if (!editObs || String(editObs).trim().length < 5) return toast.warning("La observación es obligatoria (mínimo 5 caracteres).");

    const esInactivoNumber = editEsInactivo ? 1 : 0;

    // Regla anti-duplicados: solo si quedará activa
    if (esInactivoNumber === 0) {
      const hayDuplicado = await checkDuplicadoActivoMismoMes({
        empresa: Number(enterpriseShineray),
        cod_producto: editRow.cod_producto,
        cod_bodega_destino: editRow.cod_bodega_destino,
        fecha_ini_ref: dayjs(editRow.fecha_ini).format("YYYY-MM-DD"),
        excluir_cod_reserva: editRow.cod_reserva,
      });
      if (hayDuplicado) return toast.error("Existe otra reserva activa de ese modelo y bodega destino en el mismo mes.");
    }

    try {
      setSavingEdit(true);
      await updateReserva(enterpriseShineray, editRow.cod_reserva, {
        cantidad: Number(editCantidad),
        es_inactivo: esInactivoNumber,
        observacion: String(editObs).trim(),
      });
      toast.success("Reserva actualizada.");
      setOpenEditar(false);
      await refreshAfterMutation(); // <— recarga reservas + stock
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar la reserva.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ====== Tabla ======
  const columns = [
    { name: "cod_reserva", label: "Código Reserva" },
    { name: "cod_producto", label: "Modelo (Código)" },
    {
      name: "descripcion_modelo",
      label: "Descripción",
      options: {
        customBodyRender: (value, tableMeta) => {
          const row = reservas?.[tableMeta?.rowIndex] || {};
          const cod = row?.cod_producto ?? "";
          const cat = catalogoModelos.find((m) => m.cod === cod);
          return value || cat?.nombre || "";
        },
      },
    },
    { name: "cantidad", label: "Unidades" },
    {
      name: "fecha_ini",
      label: "Fecha inicio",
      options: { customBodyRender: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "") },
    },
    {
      name: "fecha_fin",
      label: "Caduca",
      options: { customBodyRender: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "") },
    },
    {
      name: "es_inactivo",
      label: "Estatus",
      options: {
        customBodyRender: (v) => {
          const inactivo = Number(v || 0) === 1;
          return (
            <Chip
              size="small"
              label={inactivo ? "Inactivo" : "Activo"}
              color={inactivo ? "default" : "success"}
              variant={inactivo ? "outlined" : "filled"}
            />
          );
        },
      },
    },
    { name: "cod_bodega", label: "Bod. Origen" },
    { name: "cod_bodega_destino", label: "Bod. Destino" },
    {
      name: "acciones",
      label: "Acciones",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          const row = reservas[dataIndex];
          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => openEditarDialog(row)}
              sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
            >
              Editar
            </Button>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    rowsPerPage: 10,
    elevation: 0,
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: true,
    filter: true,
    textLabels: {
      body: { noMatch: loadingReservas ? "Cargando..." : "No hay reservas para mostrar" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", viewColumns: "Columnas", filterTable: "Filtrar" },
      filter: { all: "Todos", title: "FILTROS", reset: "LIMPIAR" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 24 }}>
        <Navbar0 menus={menus} />

        {/* Header + Filtros */}
        <Box sx={{ px: 3, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Stack spacing={0.2}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Reservas de Pedidos
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Filtro estado (solo front) */}
            <ToggleButtonGroup
              value={estadoFiltro}
              exclusive
              onChange={(_, val) => setEstadoFiltro(val || ESTADO_FILTROS.TODOS)}
              size="small"
            >
              <ToggleButton value={ESTADO_FILTROS.TODOS}>Todos</ToggleButton>
              <ToggleButton value={ESTADO_FILTROS.ACTIVOS}>Activos</ToggleButton>
              <ToggleButton value={ESTADO_FILTROS.INACTIVOS}>Inactivos</ToggleButton>
            </ToggleButtonGroup>

            {/* Fechas */}
            <DatePicker
              label="Desde (fecha inicio)"
              value={fechaDesde}
              onChange={(v) => setFechaDesde(v)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
            />
            <DatePicker
              label="Hasta (fecha inicio)"
              value={fechaHasta}
              onChange={(v) => setFechaHasta(v)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
            />

            <Button
              variant="outlined"
              onClick={cargarReservas}
              disabled={loadingReservas}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              Aplicar
            </Button>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
              onClick={handleOpenCrear}
            >
              Crear reserva
            </Button>
          </Stack>
        </Box>

        {/* Tabla */}
        <Box sx={{ px: 3, pb: 4 }}>
          <ThemeProvider theme={getMuiTableTheme()}>
            <MUIDataTable title={""} data={reservas} columns={columns} options={options} />
          </ThemeProvider>
        </Box>

        {/* Diálogo: Crear Reserva */}
        <Dialog
          open={openCrear}
          onClose={handleCloseCrear}
          maxWidth={false}
          PaperProps={{ sx: { width: "75vw", maxWidth: "75vw" } }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Crear reserva de pedido
            <IconButton onClick={handleCloseCrear} size="small" disabled={saving}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Modelo */}
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" error={!!errorModelos}>
                    <Autocomplete
                      options={catalogoModelos}
                      value={catalogoModelos.find((o) => o.cod === modeloCod) || null}
                      onChange={(_, val) => setModeloCod(val?.cod ?? "")}
                      isOptionEqualToValue={(op, val) => op.cod === val.cod}
                      getOptionLabel={(o) => (o ? `${o.cod} — ${o.nombre}` : "")}
                      filterOptions={filtraModelos}
                      loading={loadingModelos}
                      disabled={loadingModelos || !!errorModelos || saving}
                      noOptionsText="Sin coincidencias"
                      ListboxProps={{ style: { maxHeight: 360, whiteSpace: "normal" } }}
                      renderOption={(props, option) => (
                        <li {...props} style={{ fontSize: 14, lineHeight: 1.25, paddingTop: 6, paddingBottom: 6, whiteSpace: "normal", wordBreak: "break-word" }}>
                          <strong>{option.cod}</strong>&nbsp;—&nbsp;{option.nombre}
                          {Number.isFinite(option.stock) ? ` (${option.stock})` : ""}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Modelo de moto"
                          size="small"
                          fullWidth
                          sx={{ "& .MuiInputBase-input": { fontSize: 13 } }}
                          inputProps={{ ...params.inputProps, maxLength: 2000 }}
                          error={!!errorModelos}
                          helperText={
                            errorModelos ||
                            (!errorModelos && !loadingModelos && catalogoModelos.length === 0 ? "No se encontraron modelos" : "")
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingModelos ? <CircularProgress size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                    {errorModelos ? <FormHelperText>{errorModelos}</FormHelperText> : null}
                  </FormControl>
                </Grid>

                {/* Unidades */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Unidades a reservar"
                    value={unidades}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*$/.test(v)) setUnidades(v);
                    }}
                    inputProps={{ min: 1, inputMode: "numeric", pattern: "[0-9]*" }}
                    disabled={saving}
                  />
                </Grid>

                {/* Fecha de caducidad */}
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Fecha de caducidad"
                    value={fechaCaducidad}
                    onChange={(v) => setFechaCaducidad(v)}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                    disablePast
                    disabled={saving}
                  />
                </Grid>

                {/* Origen (solo lectura) y Destino */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ height: "100%" }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Bodega origen
                      </Typography>
                      <Chip label={`B1`} color="default" size="small" variant="outlined" />
                    </Stack>

                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Bodega destino
                      </Typography>
                      <ToggleButtonGroup
                        value={destinoKey}
                        exclusive
                        onChange={(_, val) => setDestinoKey(val || "")}
                        size="small"
                        fullWidth
                        disabled={saving}
                      >
                        {DESTINOS.map((d) => (
                          <ToggleButton key={d.key} value={d.key} sx={selectedFirebrickSx}>
                            <Stack spacing={0} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.label}</Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1 }}>{d.subtitle}</Typography>
                            </Stack>
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={handleCloseCrear} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleGuardarReserva}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo: Editar cantidad y estatus */}
        <Dialog
          open={openEditar}
          onClose={closeEditarDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Editar reserva
            <IconButton onClick={closeEditarDialog} size="small" disabled={savingEdit}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Código reserva"
                    value={editRow?.cod_reserva ?? ""}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Modelo"
                    value={editRow?.cod_producto ?? ""}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bodega destino"
                    value={editRow?.cod_bodega_destino ?? ""}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Caduca"
                    value={editRow?.fecha_fin ? dayjs(editRow.fecha_fin).format("YYYY-MM-DD") : ""}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Cantidad"
                    type="number"
                    value={editCantidad}
                    onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setEditCantidad(v); }}
                    inputProps={{ min: 1, inputMode: "numeric", pattern: "[0-9]*" }}
                    size="small"
                    fullWidth
                    disabled={savingEdit}
                  />
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editEsInactivo}
                        onChange={(e) => setEditEsInactivo(e.target.checked)}
                        disabled={savingEdit}
                      />
                    }
                    label={editEsInactivo ? "Inactivo" : "Activo"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Observación de actualización (requerida)"
                    value={editObs}
                    onChange={(e) => setEditObs(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${editObs.length}/1000`}
                    disabled={savingEdit}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={closeEditarDialog} disabled={savingEdit}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleGuardarEdicion}
              disabled={savingEdit}
              startIcon={savingEdit ? <CircularProgress size={16} /> : null}
              sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
            >
              {savingEdit ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
