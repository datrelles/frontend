// src/components/logistica/RutasAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Stack, Typography,
  TextField, Paper, IconButton, CircularProgress, Chip, Tooltip, Divider
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Autocomplete from "@mui/material/Autocomplete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MUIDataTable from "mui-datatables";
import Navbar0 from "../Navbar0";
import { useAuthContext } from "../../context/authContext";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// APIs
import {
  setAuthToken,
  listRutas, createRuta, updateRuta,
  searchDirRutas, createDirRuta, deleteDirRuta, detailDirRuta,
  searchTRuta, createTRuta, updateTRuta, deleteTRuta, detailTRuta, getMenus,
  getClientesConDirecciones, getDireccionesCliente, getTransportistas
} from "../../services/dispatchApi";

// Tema tabla (firebrick)
const getMuiTableTheme = () =>
  createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            paddingLeft: '3px',
            paddingRight: '3px',
            paddingTop: '0px',
            paddingBottom: '0px',
            backgroundColor: '#00000',
            whiteSpace: 'nowrap',
            flex: 1,
            borderBottom: '1px solid #ddd',
            borderRight: '1px solid #ddd',
            fontSize: '14px'
          },
          head: {
            backgroundColor: 'firebrick',
            color: '#ffffff',
            fontWeight: 'bold',
            paddingLeft: '0px',
            paddingRight: '0px',
            fontSize: '12px'
          },
        }
      },
      MuiTable: {
        styleOverrides: {
          root: { borderCollapse: 'collapse' },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { borderBottom: '5px solid #ddd' },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          regular: { minHeight: '10px' }
        }
      }
    }
  });

export default function RutasAdmin() {
  const { jwt, enterpriseShineray, userShineray } = useAuthContext();
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  useEffect(() => { setAuthToken(jwt); }, [jwt]);

  const [selectedRuta, setSelectedRuta] = useState(null);

  // ===== RUTAS =====
  const [rutas, setRutas] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [rutasPage, setRutasPage] = useState(1);
  const [rutasPageSize, setRutasPageSize] = useState(100);
  const [rutasCount, setRutasCount] = useState(0);
  const [searchNombre, setSearchNombre] = useState("");

  const cargarRutas = async (opts = {}) => {
    if (!enterpriseShineray) return;
    try {
      setLoadingRutas(true);
      const page = Number(opts.page ?? rutasPage);
      const page_size = Number(opts.page_size ?? rutasPageSize);

      const data = await listRutas({
        empresa: Number(enterpriseShineray),
        page,
        page_size,
      });

      setRutas(Array.isArray(data?.results) ? data.results : []);
      setRutasCount(Number(data?.count || 0));
      setRutasPage(page);
      setRutasPageSize(page_size);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar rutas.");
    } finally {
      setLoadingRutas(false);
    }
  };

  useEffect(() => { if (enterpriseShineray) cargarRutas({ page: 1 }); /* eslint-disable-line */ }, [enterpriseShineray]);

  // Crear/Editar ruta
  const [dlgCrearRuta, setDlgCrearRuta] = useState(false);
  const [dlgEditarRuta, setDlgEditarRuta] = useState(false);
  const [nombreRuta, setNombreRuta] = useState("");
  const [savingRuta, setSavingRuta] = useState(false);

  const openCrearRuta = () => { setNombreRuta(""); setDlgCrearRuta(true); };
  const closeCrearRuta = () => { if (!savingRuta) setDlgCrearRuta(false); };
  const openEditarRuta = (row) => { setSelectedRuta(row); setNombreRuta(row?.nombre || ""); setDlgEditarRuta(true); };
  const closeEditarRuta = () => { if (!savingRuta) setDlgEditarRuta(false); };

  const handleGuardarNuevaRuta = async () => {
    const nombre = String(nombreRuta || "").trim();
    if (!nombre) return toast.warning("Ingresa el nombre de la ruta.");
    if (nombre.length > 200) return toast.warning("El nombre excede 200 caracteres.");
    try {
      setSavingRuta(true);
      const res = await createRuta({ empresa: Number(enterpriseShineray), nombre });
      toast.success("Ruta creada.");
      setDlgCrearRuta(false);
      await cargarRutas({ page: 1 });
      setSelectedRuta(res);
    } catch (e) {
      toast.error(e?.message || "No se pudo crear la ruta.");
    } finally {
      setSavingRuta(false);
    }
  };

  const handleGuardarEdicionRuta = async () => {
    if (!selectedRuta) return;
    const nombre = String(nombreRuta || "").trim();
    if (!nombre) return toast.warning("Ingresa el nombre de la ruta.");
    if (nombre.length > 200) return toast.warning("El nombre excede 200 caracteres.");
    try {
      setSavingRuta(true);
      await updateRuta({ empresa: Number(enterpriseShineray), cod_ruta: Number(selectedRuta.cod_ruta), nombre });
      toast.success("Ruta actualizada.");
      setDlgEditarRuta(false);
      await cargarRutas({ page: rutasPage });
      setSelectedRuta((p) => (p ? { ...p, nombre } : p));
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar la ruta.");
    } finally {
      setSavingRuta(false);
    }
  };

  // ---- loaders de eliminación por fila
  const [deletingDirKey, setDeletingDirKey] = useState(null);      // `${empresa}-${cod_cliente}-${cod_direccion}-${cod_ruta}`
  const [deletingTRCodigo, setDeletingTRCodigo] = useState(null);  // codigo (PK)

  // ---- flag global: si cualquiera está cargando, mostramos Backdrop
  const [openDirModal, setOpenDirModal] = useState(false);
  const [openTRModal, setOpenTRModal] = useState(false);
  const [dlgCrearDir, setDlgCrearDir] = useState(false);
  const [dlgCrearTR, setDlgCrearTR] = useState(false);
  const [dlgEditarTR, setDlgEditarTR] = useState(false);

  // ===== DIR – RUTA (MODAL) =====
  const [dirRutas, setDirRutas] = useState([]);
  const [loadingDir, setLoadingDir] = useState(false);
  const [filtroCodCliente, setFiltroCodCliente] = useState("");

  const cargarDirRutas = async () => {
    if (!selectedRuta) return;
    try {
      setLoadingDir(true);
      const data = await searchDirRutas({
        empresa: Number(enterpriseShineray),
        cod_ruta: Number(selectedRuta.cod_ruta),
        ...(filtroCodCliente ? { cod_cliente: filtroCodCliente.trim() } : {}),
        page: 1,
        page_size: 200,
      });
      setDirRutas(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar Direcciones–Ruta.");
    } finally {
      setLoadingDir(false);
    }
  };
  useEffect(() => { if (openDirModal && selectedRuta) cargarDirRutas(); /* eslint-disable-line */ }, [openDirModal, selectedRuta]);

  // ===== NUEVO: Selectores de Cliente y Dirección para crear vínculo =====
  const [cliQuery, setCliQuery] = useState("");
  const [clientesOpts, setClientesOpts] = useState([]);
  const [selectedClienteOpt, setSelectedClienteOpt] = useState(null);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [direccionesOpts, setDireccionesOpts] = useState([]);
  const [selectedDireccionOpt, setSelectedDireccionOpt] = useState(null);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);

  const openCrearDir = () => {
    setSelectedClienteOpt(null);
    setSelectedDireccionOpt(null);
    setCliQuery("");
    setClientesOpts([]);
    setDireccionesOpts([]);
    setDlgCrearDir(true);
  };
  const closeCrearDir = () => { if (!loadingClientes && !loadingDirecciones) setDlgCrearDir(false); };

  // Búsqueda de clientes (debounced)
  useEffect(() => {
    if (!dlgCrearDir) return;
    let cancel = false;
    const handle = setTimeout(async () => {
      try {
        setLoadingClientes(true);
        const q = (cliQuery || "").trim();
        const params = {
          empresa: Number(enterpriseShineray),
          page: 1,
          page_size: 20,
        };
        if (q) {
          if (/^\d+$/.test(q)) params.cod_cliente_like = q;
          else params.nombre_like = q;
        }
        const res = await getClientesConDirecciones(params);
        if (!cancel) setClientesOpts(Array.isArray(res?.results) ? res.results : []);
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudo cargar clientes.");
      } finally {
        if (!cancel) setLoadingClientes(false);
      }
    }, 300);
    return () => { cancel = true; clearTimeout(handle); };
  }, [dlgCrearDir, cliQuery, enterpriseShineray]);

  // Cargar direcciones del cliente seleccionado
  useEffect(() => {
    if (!dlgCrearDir) return;
    if (!selectedClienteOpt) {
      setDireccionesOpts([]);
      setSelectedDireccionOpt(null);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        setLoadingDirecciones(true);
        const res = await getDireccionesCliente({
          cod_cliente: selectedClienteOpt.cod_cliente,
          empresa: Number(enterpriseShineray),
          page: 1,
          page_size: 500,
        });
        if (!cancel) setDireccionesOpts(Array.isArray(res?.results) ? res.results : []);
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar direcciones.");
      } finally {
        if (!cancel) setLoadingDirecciones(false);
      }
    })();
    return () => { cancel = true; };
  }, [dlgCrearDir, selectedClienteOpt, enterpriseShineray]);

  const [savingDir, setSavingDir] = useState(false);

  const handleGuardarDir = async () => {
    if (!selectedRuta) return;
    if (!selectedClienteOpt) return toast.warning("Selecciona un cliente.");
    if (!selectedDireccionOpt) return toast.warning("Selecciona una dirección.");
    try {
      setSavingDir(true);
      await createDirRuta({
        empresa: Number(enterpriseShineray),
        cod_cliente: selectedClienteOpt.cod_cliente,
        cod_direccion: Number(selectedDireccionOpt.cod_direccion),
        cod_ruta: Number(selectedRuta.cod_ruta),
      });
      toast.success("Dirección–Ruta creado.");
      setDlgCrearDir(false);
      await cargarDirRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo crear la dirección–ruta.");
    } finally {
      setSavingDir(false);
    }
  };

  const handleEliminarDir = async (row) => {
    const key = `${row.empresa}-${row.cod_cliente}-${row.cod_direccion}-${row.cod_ruta}`;
    try {
      setDeletingDirKey(key);
      await deleteDirRuta({
        empresa: Number(enterpriseShineray),
        cod_cliente: row.cod_cliente,
        cod_direccion: Number(row.cod_direccion),
        cod_ruta: Number(row.cod_ruta),
      });
      toast.success("eliminado.");
      await cargarDirRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo eliminar la dirección–ruta.");
    } finally {
      setDeletingDirKey(null);
    }
  };

  // Consulta por códigos (detail)
  const [openConsultaDir, setOpenConsultaDir] = useState(false);
  const [qCodCliente, setQCodCliente] = useState("");
  const [qCodDireccion, setQCodDireccion] = useState("");
  const [resultadoDir, setResultadoDir] = useState(null);
  const [loadingConsultaDir, setLoadingConsultaDir] = useState(false);

  const doConsultarDir = async () => {
    if (!selectedRuta) return;
    const cli = String(qCodCliente || "").trim();
    const dir = String(qCodDireccion || "").trim();
    if (!cli) return toast.warning("Ingresa el código de cliente.");
    if (cli.length > 14) return toast.warning("El código de cliente excede 14 caracteres.");
    if (!/^\d+$/.test(dir)) return toast.warning("La dirección debe ser numérica.");
    try {
      setLoadingConsultaDir(true);
      const data = await detailDirRuta({
        empresa: Number(enterpriseShineray),
        cod_cliente: cli,
        cod_direccion: Number(dir),
        cod_ruta: Number(selectedRuta.cod_ruta),
      });
      setResultadoDir(data);
    } catch (e) {
      setResultadoDir(null);
      toast.error(e?.message || "No se encontró el vínculo (o datos inválidos).");
    } finally {
      setLoadingConsultaDir(false);
    }
  };

  const doEliminarResultadoDir = async () => {
    if (!resultadoDir) return;
    try {
      await deleteDirRuta({
        empresa: Number(enterpriseShineray),
        cod_cliente: resultadoDir.cod_cliente,
        cod_direccion: Number(resultadoDir.cod_direccion),
        cod_ruta: Number(resultadoDir.cod_ruta),
      });
      toast.success("eliminado.");
      setResultadoDir(null);
      await cargarDirRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo eliminar");
    }
  };

  const dirColumns = [
    { name: "cod_ruta", label: "Cod. Ruta" },
    { name: "nombre_cliente", label: "Nombre Cliente" },
    { name: "cod_cliente", label: "RUC" },
    { name: "direccion", label: "Nombre Dirección" },
    {
      name: "acciones",
      label: "Acciones",
      options: {
        sort: false, filter: false,
        customBodyRenderLite: (idx) => {
          const row = dirRutas[idx];
          const key = `${row.empresa}-${row.cod_cliente}-${row.cod_direccion}-${row.cod_ruta}`;
          const deleting = deletingDirKey === key;
          return (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={deleting ? <CircularProgress size={16} /> : <DeleteOutlineIcon />}
              onClick={() => handleEliminarDir(row)}
              disabled={deleting}
              sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          );
        },
      },
    },
  ];

  const dirOptions = {
    selectableRows: "none",
    rowsPerPage: 10,
    elevation: 0,
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: true,
    filter: true,
    textLabels: {
      body: { noMatch: loadingDir ? "Cargando..." : "Sin resultados" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", viewColumns: "Columnas", filterTable: "Filtrar" },
      filter: { all: "Todos", title: "FILTROS", reset: "LIMPIAR" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    },
  };

  // ===== TRANSPORTISTA – RUTA (MODAL) =====
  const [trutas, setTrutas] = useState([]);
  const [loadingTR, setLoadingTR] = useState(false);
  const [filtroTransportista, setFiltroTransportista] = useState("");

  const cargarTRutas = async () => {
    if (!selectedRuta) return;
    try {
      setLoadingTR(true);
      const data = await searchTRuta({
        empresa: Number(enterpriseShineray),
        cod_ruta: Number(selectedRuta.cod_ruta),
        ...(filtroTransportista ? { cod_transportista: filtroTransportista.trim() } : {}),
        page: 1,
        page_size: 200,
      });
      setTrutas(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar Transportistas–Ruta.");
    } finally {
      setLoadingTR(false);
    }
  };
  useEffect(() => { if (openTRModal && selectedRuta) cargarTRutas(); /* eslint-disable-line */ }, [openTRModal, selectedRuta]);

  // ====== NUEVO: Selectores para AGREGAR TRANSPORTISTA ======
  const [savingTR, setSavingTR] = useState(false);
  const [rowEditTR, setRowEditTR] = useState(null);

  const [transportistasOpts, setTransportistasOpts] = useState([]);
  const [selectedTransportistaOpt, setSelectedTransportistaOpt] = useState(null);
  const [loadingTransportistas, setLoadingTransportistas] = useState(false);
  const [trInputValue, setTrInputValue] = useState("");

  const openCrearTR = async () => {
    setSelectedTransportistaOpt(null);
    setTrInputValue("");
    setDlgCrearTR(true);
  };
  const closeCrearTR = () => { if (!savingTR) setDlgCrearTR(false); };

  // Cargar transportistas activos al abrir el diálogo
  useEffect(() => {
    if (!dlgCrearTR) return;
    let cancel = false;
    (async () => {
      try {
        setLoadingTransportistas(true);
        const list = await getTransportistas(Number(enterpriseShineray));
        if (!cancel) {
          // Ordenar por nombre/apellido si aplica para mejor UX
          const ordered = Array.isArray(list)
            ? [...list].sort((a, b) => {
                const an = `${a.nombre ?? ""} ${a.apellido1 ?? ""}`.trim().toLowerCase();
                const bn = `${b.nombre ?? ""} ${b.apellido1 ?? ""}`.trim().toLowerCase();
                return an.localeCompare(bn);
              })
            : [];
          setTransportistasOpts(ordered);
        }
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar transportistas.");
      } finally {
        if (!cancel) setLoadingTransportistas(false);
      }
    })();
    return () => { cancel = true; };
  }, [dlgCrearTR, enterpriseShineray]);

  const handleGuardarTR = async () => {
    if (!selectedRuta) return;
    if (!selectedTransportistaOpt) return toast.warning("Selecciona un transportista.");
    try {
      setSavingTR(true);
      await createTRuta({
        empresa: Number(enterpriseShineray),
        cod_transportista: String(selectedTransportistaOpt.cod_transportista),
        cod_ruta: Number(selectedRuta.cod_ruta)
      });
      toast.success("Transportista–Ruta creado.");
      setDlgCrearTR(false);
      await cargarTRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo crear.");
    } finally {
      setSavingTR(false);
    }
  };

  const openEditarTR = (row) => {
    setRowEditTR(row);
    // Mantengo la edición existente por código (no solicitado cambiar)
    setDlgEditarTR(true);
  };
  const closeEditarTR = () => { if (!savingTR) setDlgEditarTR(false); };

  const [codTransportista, setCodTransportista] = useState("");
  const [codRutaEdit, setCodRutaEdit] = useState("");

  useEffect(() => {
    if (!dlgEditarTR || !rowEditTR) return;
    setCodTransportista(rowEditTR?.cod_transportista || "");
    setCodRutaEdit(String(rowEditTR?.cod_ruta ?? selectedRuta?.cod_ruta ?? ""));
  }, [dlgEditarTR, rowEditTR, selectedRuta]);

  const handleGuardarEdicionTR = async () => {
    if (!rowEditTR) return;
    const tcode = String(codTransportista || "").trim();
    const newRutaStr = String(codRutaEdit || "").trim();
    if (tcode && tcode.length > 14) return toast.warning("El código de transportista excede 14 caracteres.");
    if (newRutaStr && !/^\d+$/.test(newRutaStr)) return toast.warning("Cod. Ruta debe ser numérico.");
    try {
      setSavingTR(true);
      await updateTRuta({
        empresa: Number(enterpriseShineray),
        codigo: Number(rowEditTR.codigo),
        ...(tcode ? { cod_transportista: tcode } : {}),
        ...(newRutaStr ? { cod_ruta: Number(newRutaStr) } : {}),
      });
      toast.success("actualizado.");
      setDlgEditarTR(false);
      await cargarTRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar.");
    } finally {
      setSavingTR(false);
    }
  };

  const handleEliminarTR = async (row) => {
    try {
      setDeletingTRCodigo(row.codigo);
      await deleteTRuta({ empresa: Number(enterpriseShineray), codigo: Number(row.codigo) });
      toast.success("eliminado.");
      await cargarTRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo eliminar.");
    } finally {
      setDeletingTRCodigo(null);
    }
  };

  // Consulta por código (PK)
  const [openConsultaTR, setOpenConsultaTR] = useState(false);
  const [qCodigoTR, setQCodigoTR] = useState("");
  const [resultadoTR, setResultadoTR] = useState(null);
  const [loadingConsultaTR, setLoadingConsultaTR] = useState(false);

  const doConsultarTR = async () => {
    const code = String(qCodigoTR || "").trim();
    if (!/^\d+$/.test(code)) return toast.warning("Ingresa un código (PK) numérico.");
    try {
      setLoadingConsultaTR(true);
      const data = await detailTRuta({ empresa: Number(enterpriseShineray), codigo: Number(code) });
      setResultadoTR(data);
    } catch (e) {
      setResultadoTR(null);
      toast.error(e?.message || "No se encontró el vínculo (o datos inválidos).");
    } finally {
      setLoadingConsultaTR(false);
    }
  };

  const doEliminarResultadoTR = async () => {
    if (!resultadoTR) return;
    try {
      await deleteTRuta({ empresa: Number(enterpriseShineray), codigo: Number(resultadoTR.codigo) });
      toast.success("eliminado.");
      setResultadoTR(null);
      await cargarTRutas();
    } catch (e) {
      toast.error(e?.message || "No se pudo eliminar.");
    }
  };

  const doEditarResultadoTR = () => {
    if (!resultadoTR) return;
    openEditarTR(resultadoTR);
    setOpenConsultaTR(false);
  };

  const trColumns = [
    { name: "cod_transportista", label: "Transportista (≤14)" },
    { name: "cod_ruta", label: "Cod. Ruta (int)" },
    { name: "nombre_transportista", label: "Nombre Ruta" },
    {
      name: "acciones",
      label: "Acciones",
      options: {
        sort: false, filter: false,
        customBodyRenderLite: (idx) => {
          const row = trutas[idx];
          const deleting = deletingTRCodigo === row.codigo;
          return (
            <Stack direction="row" spacing={1}>
              <Button
                size="small" variant="outlined" startIcon={<EditIcon />}
                onClick={() => openEditarTR(row)}
                disabled={deleting}
                sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
              >
                Editar
              </Button>
              <Button
                size="small" variant="outlined" color="error"
                startIcon={deleting ? <CircularProgress size={16} /> : <DeleteOutlineIcon />}
                onClick={() => handleEliminarTR(row)}
                disabled={deleting}
                sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </Stack>
          );
        },
      },
    },
  ];

  const trOptions = {
    selectableRows: "none",
    rowsPerPage: 20,
    elevation: 0,
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: true,
    filter: true,
    textLabels: {
      body: { noMatch: loadingTR ? "Cargando..." : "Sin resultados" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", viewColumns: "Columnas", filterTable: "Filtrar" },
      filter: { all: "Todos", title: "FILTROS", reset: "LIMPIAR" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    },
  };

  const rutasColumns = [
    { name: "cod_ruta", label: "Cod. Ruta" },
    { name: "nombre", label: "Nombre" },
    {
      name: "acciones",
      label: "Acciones",
      options: {
        sort: false, filter: false,
        customBodyRenderLite: (idx) => {
          const row = rutas[idx];
          return (
            <Stack direction="row" spacing={1}>
              <Button
                size="small" variant="outlined" startIcon={<ListAltIcon />}
                onClick={() => { setSelectedRuta(row); setOpenDirModal(true); }}
                sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                title="Direcciones por Ruta"
              >
                Direcciones
              </Button>

              <Button
                size="small" variant="outlined" startIcon={<LocalShippingIcon />}
                onClick={() => { setSelectedRuta(row); setOpenTRModal(true); }}
                sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
                title="Transportistas por Ruta"
              >
                Transportistas
              </Button>

              <Button
                size="small" variant="outlined" startIcon={<EditIcon />}
                onClick={() => openEditarRuta(row)}
                sx={{ textTransform: "none", borderColor: "firebrick", color: "firebrick" }}
              >
                Editar
              </Button>
            </Stack>
          );
        },
      },
    },
  ];

  const rutasOptions = {
    selectableRows: "none",
    rowsPerPage: 20,
    elevation: 0,
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: true,
    filter: false,
    search: true,
    searchText: searchNombre,
    searchPlaceholder: "Buscar por nombre...",
    onSearchChange: (text) => setSearchNombre(text || ""),
    customSearch: (searchQuery, currentRow, columns) => {
      if (!searchQuery) return true;
      const idxNombre = columns.findIndex((c) => c.name === "nombre");
      const val = String(currentRow?.[idxNombre] ?? "").toLowerCase();
      return val.includes(String(searchQuery).toLowerCase());
    },
    textLabels: {
      body: { noMatch: loadingRutas ? "Cargando..." : "Sin resultados" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", viewColumns: "Columnas" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    },
  };

  const totalPages = Math.max(1, Math.ceil(rutasCount / rutasPageSize));

  // ---- Backdrop global
  const busy =
    loadingRutas || savingRuta ||
    loadingDir || savingDir || loadingConsultaDir ||
    loadingTR || savingTR || loadingConsultaTR ||
    loadingClientes || loadingDirecciones || loadingTransportistas ||
    Boolean(deletingDirKey) || Boolean(deletingTRCodigo);

  // --------------------------------------
  // USEEFFECT (Menus)
  // --------------------------------------
  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'LOG');
        setMenus(data);
      }
      catch (error) {
        toast.error(error?.message || "No se pudieron cargar los menús.");
      }
    };
    menu();
  }, [enterpriseShineray, userShineray, jwt]);

  // ===== Render =====
  return (
    <Box sx={{ mt: 18 }}>
      <Navbar0 menus={menus} />

      {/* Header */}
      <Box sx={{ px: 3, mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Stack spacing={0}>
          <Typography variant="h6" sx={{ fontWeight: 250 }}>Administración de Rutas</Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openCrearRuta}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            Nueva ruta
          </Button>
        </Stack>
      </Box>

      {/* Controles de paginación / recarga */}
      <Paper variant="outlined" sx={{ p: 2, mb: 0 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small" variant="outlined" startIcon={<ArrowBackIosNewIcon />}
                disabled={loadingRutas || rutasPage <= 1}
                onClick={() => cargarRutas({ page: Math.max(1, rutasPage - 1) })}
                sx={{ borderColor: "firebrick", color: "firebrick" }}
              >
                Anterior
              </Button>
              <Typography variant="body2">
                Página {rutasPage} de {Math.max(1, Math.ceil(rutasCount / rutasPageSize))}
              </Typography>
              <Button
                size="small" variant="outlined" endIcon={<ArrowForwardIosIcon />}
                disabled={loadingRutas || rutasPage >= Math.max(1, Math.ceil(rutasCount / rutasPageSize))}
                onClick={() => cargarRutas({ page: Math.min(Math.max(1, Math.ceil(rutasCount / rutasPageSize)), rutasPage + 1) })}
                sx={{ borderColor: "firebrick", color: "firebrick" }}
              >
                Siguiente
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button
              variant="outlined"
              onClick={() => cargarRutas({ page: rutasPage })}
              disabled={loadingRutas}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              {loadingRutas ? "Actualizando..." : "Recargar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <div style={{ margin: '25px' }}>
        {/* Tabla Rutas (buscar por nombre) */}
        <ThemeProvider theme={getMuiTableTheme()}>
          <MUIDataTable title={""} data={rutas} columns={rutasColumns} options={rutasOptions} />
        </ThemeProvider>
      </div>

      {/* ============ DIALOGS ============ */}

      {/* Crear Ruta */}
      <Dialog open={dlgCrearRuta} onClose={closeCrearRuta} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Crear ruta
          <IconButton onClick={closeCrearRuta} size="small" disabled={savingRuta}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Nombre de la ruta (≤200)" value={nombreRuta}
              onChange={(e) => setNombreRuta(e.target.value.slice(0, 200))}
              size="small" fullWidth inputProps={{ maxLength: 200 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeCrearRuta} disabled={savingRuta}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarNuevaRuta} disabled={savingRuta}
            startIcon={savingRuta ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}>
            {savingRuta ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar Ruta */}
      <Dialog open={dlgEditarRuta} onClose={closeEditarRuta} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Editar ruta
          <IconButton onClick={closeEditarRuta} size="small" disabled={savingRuta}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Cod Ruta" value={selectedRuta?.cod_ruta ?? ""} size="small" fullWidth InputProps={{ readOnly: true }} />

            <TextField
              label="Nombre de la ruta (≤200)" value={nombreRuta}
              onChange={(e) => setNombreRuta(e.target.value.slice(0, 200))}
              size="small" fullWidth inputProps={{ maxLength: 200 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeEditarRuta} disabled={savingRuta}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarEdicionRuta} disabled={savingRuta}
            startIcon={savingRuta ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}>
            {savingRuta ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====== Modal: Direcciones por Ruta ====== */}
      <Dialog open={openDirModal} onClose={() => setOpenDirModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Direcciones por Ruta {selectedRuta ? `— ${selectedRuta.cod_ruta} — ${selectedRuta.nombre ?? ""}` : ""}
          <IconButton onClick={() => setOpenDirModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md="auto">
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={openCrearDir}
                  disabled={!selectedRuta}
                  sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
                >
                  Agregar dirección a ruta
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <ThemeProvider theme={getMuiTableTheme()}>
            <MUIDataTable title={""} data={dirRutas} columns={dirColumns} options={dirOptions} />
          </ThemeProvider>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDirModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Crear Dirección–Ruta (con selectores) */}
      <Dialog open={dlgCrearDir} onClose={closeCrearDir} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Agregar Dirección a Ruta
          <IconButton onClick={closeCrearDir} size="small" disabled={savingDir}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Ruta"
              value={selectedRuta ? `${selectedRuta.cod_ruta} — ${selectedRuta.nombre ?? ""}` : ""}
              size="small" fullWidth InputProps={{ readOnly: true }}
            />

            {/* Selector de Cliente */}
            <Autocomplete
              options={clientesOpts}
              loading={loadingClientes}
              value={selectedClienteOpt}
              onChange={(_, val) => setSelectedClienteOpt(val)}
              inputValue={cliQuery}
              onInputChange={(_, val) => setCliQuery(val)}
              isOptionEqualToValue={(op, val) =>
                op?.empresa === val?.empresa && op?.cod_cliente === val?.cod_cliente
              }
              getOptionLabel={(o) => (o ? `${o.cod_cliente}   ${o.nombre_cliente ?? ""}` : "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente (buscar por RUC o nombre)"
                  size="small"
                  placeholder="Escribe para buscar…"
                  InputProps={{ ...params.InputProps }}
                />
              )}
            />

            {/* Selector de Dirección */}
            <Autocomplete
              options={direccionesOpts}
              loading={loadingDirecciones}
              value={selectedDireccionOpt}
              onChange={(_, val) => setSelectedDireccionOpt(val)}
              disabled={!selectedClienteOpt}
              isOptionEqualToValue={(op, val) => op?.cod_direccion === val?.cod_direccion}
              getOptionLabel={(o) =>
                o ? `${o.direccion ?? ""} — ${o.ciudad ?? ""}` : ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Dirección del cliente"
                  size="small"
                  placeholder={selectedClienteOpt ? "Selecciona una dirección…" : "Selecciona un cliente primero"}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingDirecciones ? <CircularProgress size={16} /> : null}
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
          <Button variant="outlined" onClick={closeCrearDir} disabled={savingDir}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarDir}
            disabled={savingDir || !selectedClienteOpt || !selectedDireccionOpt}
            startIcon={savingDir ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {savingDir ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Consultar Dirección–Ruta por códigos */}
      <Dialog open={openConsultaDir} onClose={() => setOpenConsultaDir(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Consultar Dirección–Ruta
          <IconButton onClick={() => setOpenConsultaDir(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Ruta" value={selectedRuta ? `${selectedRuta.cod_ruta} — ${selectedRuta.nombre ?? ""}` : ""} size="small" fullWidth InputProps={{ readOnly: true }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Código de cliente (≤14)" value={qCodCliente}
                  onChange={(e) => setQCodCliente(e.target.value.slice(0, 14))}
                  size="small" fullWidth inputProps={{ maxLength: 14 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Código de dirección (int)" value={qCodDireccion}
                  onChange={(e) => setQCodDireccion(e.target.value.replace(/\D+/g, ""))}
                  size="small" fullWidth inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} />
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              onClick={doConsultarDir}
              startIcon={loadingConsultaDir ? <CircularProgress size={16} /> : <SearchIcon />}
              disabled={loadingConsultaDir}
              sx={{ alignSelf: "flex-start", borderColor: "firebrick", color: "firebrick" }}
            >
              {loadingConsultaDir ? "Consultando..." : "Consultar"}
            </Button>

            {resultadoDir && (
              <>
                <Divider />
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Resultado</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField size="small" label="Empresa" value={resultadoDir.empresa ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Cod. Ruta" value={resultadoDir.cod_ruta ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Cliente" value={resultadoDir.cod_cliente ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Dirección" value={resultadoDir.cod_direccion ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                </Grid>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button variant="outlined" color="error" onClick={doEliminarResultadoDir}
                    startIcon={<DeleteOutlineIcon />} sx={{ borderColor: "firebrick", color: "firebrick" }}>
                    Eliminar
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenConsultaDir(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ====== Modal: Transportistas por Ruta ====== */}
      <Dialog open={openTRModal} onClose={() => setOpenTRModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Transportistas por Ruta {selectedRuta ? `— ${selectedRuta.cod_ruta} — ${selectedRuta.nombre ?? ""}` : ""}
          <IconButton onClick={() => setOpenTRModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              
              <Grid item xs={12} md="auto">
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={openCrearTR}
                  disabled={!selectedRuta}
                  sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
                >
                  Agregar transportista a ruta
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <ThemeProvider theme={getMuiTableTheme()}>
            <MUIDataTable title={""} data={trutas} columns={trColumns} options={trOptions} />
          </ThemeProvider>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenTRModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Crear Transportista–Ruta (CON SELECTOR) */}
      <Dialog open={dlgCrearTR} onClose={closeCrearTR} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Agregar Transportista a Ruta
          <IconButton onClick={closeCrearTR} size="small" disabled={savingTR}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Ruta"
              value={selectedRuta ? `${selectedRuta.cod_ruta} — ${selectedRuta.nombre ?? ""}` : ""}
              size="small" fullWidth InputProps={{ readOnly: true }}
            />

            <Autocomplete
              options={transportistasOpts}
              loading={loadingTransportistas}
              value={selectedTransportistaOpt}
              onChange={(_, val) => setSelectedTransportistaOpt(val)}
              inputValue={trInputValue}
              onInputChange={(_, val) => setTrInputValue(val)}
              getOptionKey={(o) => o?.cod_transportista ?? ""}
              isOptionEqualToValue={(op, val) => op?.cod_transportista === val?.cod_transportista}
              getOptionLabel={(o) => {
                if (!o) return "";
                const nom = `${o.nombre ?? ""} ${o.apellido1 ?? ""}`.trim();
                const placa = o.placa ? ` — ${o.placa}` : "";
                return `${o.cod_transportista ?? ""} — ${nom}${placa}`;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Transportista (buscar por código/nombre)"
                  size="small"
                  placeholder="Escribe para filtrar…"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTransportistas ? <CircularProgress size={16} /> : null}
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
          <Button variant="outlined" onClick={closeCrearTR} disabled={savingTR}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarTR}
            disabled={savingTR || !selectedTransportistaOpt}
            startIcon={savingTR ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {savingTR ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar Transportista–Ruta (se mantiene por código, como estaba) */}
      <Dialog open={dlgEditarTR} onClose={closeEditarTR} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Editar Transportista–Ruta
          <IconButton onClick={closeEditarTR} size="small" disabled={savingTR}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Código vínculo (PK)" value={rowEditTR?.codigo ?? ""} size="small" fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Transportista (≤14)" value={codTransportista}
              onChange={(e) => setCodTransportista(e.target.value.slice(0, 14))}
              size="small" fullWidth inputProps={{ maxLength: 14 }} />
            <TextField label="Cod. Ruta (int, opcional)" value={codRutaEdit}
              onChange={(e) => { const v = e.target.value.replace(/\D+/g, ""); setCodRutaEdit(v); }}
              size="small" fullWidth inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              helperText="Dejar vacío si no deseas cambiar." />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeEditarTR} disabled={savingTR}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarEdicionTR} disabled={savingTR}
            startIcon={savingTR ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}>
            {savingTR ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Consultar Transportista–Ruta por código (PK) */}
      <Dialog open={openConsultaTR} onClose={() => setOpenConsultaTR(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Consultar Transportista–Ruta (por PK)
          <IconButton onClick={() => setOpenConsultaTR(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Código vínculo (PK numérico)" value={qCodigoTR}
              onChange={(e) => setQCodigoTR(e.target.value.replace(/\D+/g, ""))}
              size="small" fullWidth inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} />
            <Button
              variant="outlined"
              onClick={doConsultarTR}
              startIcon={loadingConsultaTR ? <CircularProgress size={16} /> : <SearchIcon />}
              disabled={loadingConsultaTR}
              sx={{ alignSelf: "flex-start", borderColor: "firebrick", color: "firebrick" }}
            >
              {loadingConsultaTR ? "Consultando..." : "Consultar"}
            </Button>

            {resultadoTR && (
              <>
                <Divider />
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Resultado</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField size="small" label="Empresa" value={resultadoTR.empresa ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Código (PK)" value={resultadoTR.codigo ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Transportista" value={resultadoTR.cod_transportista ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Cod. Ruta" value={resultadoTR.cod_ruta ?? ""} fullWidth InputProps={{ readOnly: true }} /></Grid>
                </Grid>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={doEditarResultadoTR}
                    startIcon={<EditIcon />} sx={{ borderColor: "firebrick", color: "firebrick" }}>
                    Editar 
                  </Button>
                  <Button variant="outlined" color="error" onClick={doEliminarResultadoTR}
                    startIcon={<DeleteOutlineIcon />} sx={{ borderColor: "firebrick", color: "firebrick" }}>
                    Eliminar 
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenConsultaTR(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop global */}
      <Backdrop
        open={busy}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
