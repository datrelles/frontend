// src/components/logistica/CDEAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Typography,
  TextField,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  // CDE/DDE
  searchCDE,
  createCDE,
  updateCDE,
  listDDE,
  createDDE,
  updateDDE,
  searchDespachos,
  // Selectores
  listRutas,
  searchTRuta,
  getListOfVendors,
  // NUEVOS
  generarGuiasDespacho,
  deleteDDE,
} from "../../services/dispatchApi";

// ====== helpers ======
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
      MuiTableHead: {
        styleOverrides: { root: { borderBottom: "5px solid #ddd" } },
      },
      MuiToolbar: { styleOverrides: { regular: { minHeight: "10px" } } },
    },
  });

// Quita acentos y baja a minúsculas
const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Clave estable por fila (para selección persistente al filtrar/paginar)
const rowKey = (r) => {
  const dd = r?.cod_ddespacho ?? "NOID";
  const pr = r?.cod_producto ?? "NOPROD";
  const ns = r?.numero_serie ?? "NOSERIE";
  return `${dd}__${pr}__${ns}`;
};

const MODES = {
  TODOS: "TODOS",
  FINALIZADOS: "FINALIZADOS",
  ABIERTOS: "ABIERTOS",
};

export default function CDEAdmin() {
  // ====== Auth & token ======
  const { jwt, enterpriseShineray, userShineray, branchShineray } =
    useAuthContext();
  useEffect(() => {
    setAuthToken(jwt);
  }, [jwt]);

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
  const [mode, setMode] = useState(MODES.TODOS);

  // ======================
  // CABECERAS (CDE)
  // ======================
  const [cdeRowsFull, setCdeRowsFull] = useState([]);
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
  const [vendorSel, setVendorSel] = useState(null);

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
        ...(String(fFinalizado) !== ""
          ? { finalizado: Number(fFinalizado) }
          : {}),
        page,
        page_size,
      };
      const data = await searchCDE(payload);
      setCdeRowsFull(Array.isArray(data?.results) ? data.results : []);
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

  // Selectores Ruta/Transportista
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
          page,
          page_size,
          ...(rutasQuery.trim() ? { nombre: rutasQuery.trim() } : {}),
        });
        if (!cancel)
          setRutasOpts(Array.isArray(resp?.results) ? resp.results : []);
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar rutas.");
      } finally {
        if (!cancel) setLoadingRutas(false);
      }
    }, 300);
    return () => {
      cancel = true;
      clearTimeout(handle);
    };
  }, [dlgCrearCDE, rutasQuery, enterpriseShineray, formCrear.empresa]);

  // cuando se seleccione una ruta, cargar Transportistas de esa ruta
  useEffect(() => {
    if (!dlgCrearCDE) return;
    if (!rutaSel) {
      setTranspOpts([]);
      setTranspSel(null);
      return;
    }
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
        if (!cancel)
          setTranspOpts(Array.isArray(data?.results) ? data.results : []);
      } catch (e) {
        if (!cancel)
          toast.error(e?.message || "No se pudieron cargar transportistas.");
      } finally {
        if (!cancel) setLoadingTransp(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [dlgCrearCDE, rutaSel, enterpriseShineray, formCrear.empresa]);

  const openCrearCDE = () => {
    setFormCrear({ empresa: enterpriseShineray || 20 });
    setRutaSel(null);
    setTranspSel(null);
    setRutasQuery("");
    setRutasOpts([]);
    setTranspOpts([]);
    setVendorSel(null);
    setDlgCrearCDE(true);
  };
  const closeCrearCDE = () => {
    if (!savingCDE) setDlgCrearCDE(false);
  };

  const handleGuardarNuevaCDE = async () => {
    const emp = Number(formCrear.empresa || 0);
    if (!emp) return toast.warning("Empresa requerida.");
    if (!rutaSel?.cod_ruta) return toast.warning("Selecciona la Ruta.");
    if (!transpSel?.cod_transportista)
      return toast.warning("Selecciona el Transportista.");
    if (!vendorSel?.cod_persona_vendor)
      return toast.warning("Selecciona el Vendedor (Vendor).");

    try {
      setSavingCDE(true);
      const res = await createCDE({
        empresa: emp,
        cod_transportista: String(transpSel.cod_transportista),
        cod_ruta: Number(rutaSel.cod_ruta),
        usuario: userShineray,
        cod_persona: String(vendorSel.cod_persona_vendor),
        cod_tipo_persona: "VEN",
      });
      toast.success(`CDE creada (código: ${res?.cde_codigo ?? "?"}).`);
      setDlgCrearCDE(false);
      await loadCDE({ page: 1 });
    } catch (e) {
      toast.error(e?.message || "No se pudo crear el cabecera.");
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
  const closeEditarCDE = () => {
    if (!savingCDE) setDlgEditarCDE(false);
  };

  const handleGuardarEdicionCDE = async () => {
    if (!rowEditCDE) return;
    const changes = Object.fromEntries(
      Object.entries(formEditar).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );
    if (changes.cod_ruta && !/^\d+$/.test(String(changes.cod_ruta))) {
      return toast.warning("cod_ruta debe ser numérico.");
    }
    try {
      setSavingCDE(true);
      const res = await updateCDE(
        Number(rowEditCDE.empresa),
        Number(rowEditCDE.cde_codigo),
        {
          ...changes,
          ...(changes.cod_ruta ? { cod_ruta: Number(changes.cod_ruta) } : {}),
        }
      );
      toast.success(`Cabecera ${res?.cde_codigo ?? ""} actualizada.`);
      setDlgEditarCDE(false);
      await loadCDE({ page: cdePage });
    } catch (e) {
      toast.error(e?.message || "No se pudo actualizar el Envio.");
    } finally {
      setSavingCDE(false);
    }
  };

  // ====== NUEVO: GENERAR GUÍAS (por CDE)
  const [generatingCDE, setGeneratingCDE] = useState(null); // cde_codigo en proceso

  const handleGenerarGuias = async (row) => {
    try {
      setGeneratingCDE(row?.cde_codigo);
      const resp = await generarGuiasDespacho({
        empresa: Number(enterpriseShineray || row?.empresa),
        despacho: Number(row?.cde_codigo),
      });
      const guias = Array.isArray(resp?.guias) ? resp.guias : [];
      toast.success(
        `GUÍAS GENERADAS para CDE ${row?.cde_codigo}. Total: ${guias.length}`
      );
      if (resp?.out_raw) console.log("GENERAR_GUIAS out_raw:", resp.out_raw);
    } catch (e) {
      toast.error(e?.message || "No se pudo generar guías.");
    } finally {
      setGeneratingCDE(null);
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
  const [deletingSeq, setDeletingSeq] = useState(null);
  const [listOfVendors, setListOfVendors] = useState([]);

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

  useEffect(() => {
    if (!cdeRowsFull) return;
    let rows = cdeRowsFull;
    switch (mode) {
      case MODES.ABIERTOS:
        rows = rows.filter((r) => Number(r.finalizado) === 0);
        break;
      case MODES.FINALIZADOS:
        rows = rows.filter((r) => Number(r.finalizado) === 1);
        break;
    }
    rows = rows.map((r) => ({ ...r }));
    setCdeRows(rows);
  }, [mode]);

  // Crear DDE (individual) — se mantiene el estado porque se precarga desde el diálogo de selección
  const [formAddDDE, setFormAddDDE] = useState({
    cod_ddespacho: "",
    cod_producto: "",
    numero_serie: "",
    fecha: "",
    observacion: "",
  });

  // Editar DDE (se conserva por si lo reutilizamos)
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
  const closeEditarDDE = () => {
    if (!savingEditDDE) setDlgEditarDDE(false);
  };

  const handleGuardarEdicionDDE = async () => {
    if (!rowEditDDE || !cdeSel) return;
    try {
      setSavingEditDDE(true);
      const payload = Object.fromEntries(
        Object.entries(formEditDDE).filter(
          ([_, v]) => v !== "" && v !== null && v !== undefined
        )
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
  // Diálogo "Agregar DETALLE" — lista VT_DESPACHO_FINAL con búsqueda local
  // ======================
  const [openDespDialog, setOpenDespDialog] = useState(false);
  const [loadingDesp, setLoadingDesp] = useState(false);
  const [despRows, setDespRows] = useState([]);

  // búsqueda local (cod_pedido, cliente)
  const [searchSelQuery, setSearchSelQuery] = useState("");

  // selección persistente
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  // paginación local
  const [selPage, setSelPage] = useState(0);
  const [selRowsPerPage, setSelRowsPerPage] = useState(10);

  const openAgregarDetalleDialog = () => {
    setSelectedKeys(new Set());
    setSearchSelQuery("");
    setDespRows([]);
    setSelPage(0);
    setOpenDespDialog(true);
  };

  useEffect(() => {
    const fetchDesp = async () => {
      if (!openDespDialog || !cdeSel) return;
      try {
        setLoadingDesp(true);
        // Filtro back-end:
        const payload = {
          empresa: Number(cdeSel?.empresa ?? enterpriseShineray ?? 20),
          despachada: 0,
          en_despacho: 0,
          cod_ruta: Number(cdeSel?.cod_ruta ?? 0),
          page: 1,
          page_size: 100,
        };
        const resp = await searchDespachos(payload);

        // Mostrar SOLO registros con cod_ddespacho
        const rows = (Array.isArray(resp?.results) ? resp.results : []).filter(
          (r) =>
            r?.cod_ddespacho !== null &&
            r?.cod_ddespacho !== undefined &&
            String(r?.cod_ddespacho).trim() !== ""
        );

        setDespRows(rows);
      } catch (e) {
        toast.error(e?.message || "No se pudo cargar la lista de despachos.");
      } finally {
        setLoadingDesp(false);
      }
    };
    fetchDesp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDespDialog]);

  useEffect(() => {
    const LoadgetListOfVendors = async () => {
      try {
        const data = await getListOfVendors(
          enterpriseShineray,
          branchShineray,
          userShineray
        );
        setListOfVendors(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    LoadgetListOfVendors();
  }, []);

  // Filtrado local por cod_pedido y cliente
  const filteredDespRows = useMemo(() => {
    const q = norm(searchSelQuery);
    if (!q) return despRows;
    return despRows.filter(
      (r) => norm(r?.cod_pedido).includes(q) || norm(r?.cliente).includes(q)
    );
  }, [despRows, searchSelQuery]);

  // Resetear a primera página al cambiar el filtro
  useEffect(() => {
    setSelPage(0);
  }, [searchSelQuery]);

  const isSelected = (key) => selectedKeys.has(key);

  const handleToggleRow = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleToggleAllPage = (checked, pageRows) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const r of pageRows) {
        const k = rowKey(r);
        if (checked) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const handleSelPageChange = (_e, newPage) => setSelPage(newPage);
  const handleSelRowsPerPage = (e) => {
    setSelRowsPerPage(parseInt(e.target.value, 10));
    setSelPage(0);
  };

  const handleConfirmSeleccionados = async () => {
    if (!cdeSel) return;
    if (selectedKeys.size === 0) {
      toast.info("Selecciona al menos un registro.");
      return;
    }
    const selectedInOrder = despRows.filter((r) => selectedKeys.has(rowKey(r)));

    let ok = 0,
      fail = 0;
    for (const row of selectedInOrder) {
      const cod_ddespacho = row?.cod_ddespacho;
      const cod_producto = row?.cod_producto ?? "";
      const numero_serie = row?.numero_serie ?? "";
      if (!cod_ddespacho) {
        fail++;
        continue;
      }
      try {
        await createDDE({
          cod_producto,
          numero_serie,
          observacion: "Agregado desde selección",
          empresa: Number(cdeSel.empresa),
          cde_codigo: Number(cdeSel.cde_codigo),
          cod_ddespacho,
        });
        ok++;
      } catch {
        fail++;
      }
    }

    toast.success(`Agregados: ${ok}. Fallidos: ${fail}.`);
    setOpenDespDialog(false);
    setSelectedKeys(new Set());
    await cargarDDE({ page: 1 });
  };

  const pickDespToForm = (row) => {
    setFormAddDDE((f) => ({
      ...f,
      cod_ddespacho: row?.cod_ddespacho ?? "",
      cod_producto: row?.cod_producto ?? "",
      numero_serie: row?.numero_serie ?? "",
    }));
    toast.info("Datos precargados en el formulario del detalle.");
  };

  // ===== Columns / DataTable principal =====
  const cdeColumns = useMemo(
    () => [
      { name: "cde_codigo", label: "CDE" },
      {
        name: "cod_ruta",
        label: "Ruta",
        options: {
          customBodyRenderLite: (idx) => {
            const r = cdeRows[idx];
            return `${r.nombre_ruta ?? "-"}`;
          },
        },
      },
      {
        name: "cod_transportista",
        label: "Transportista",
        options: {
          customBodyRenderLite: (idx) => {
            const r = cdeRows[idx];
            return `${r.nombre_transportista ?? "-"}`;
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
          sort: false,
          filter: false,
          customBodyRenderLite: (idx) => {
            const row = cdeRows[idx];
            const isGenerating = generatingCDE === row?.cde_codigo;
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ListAltIcon />}
                  onClick={() => {
                    setCdeSel(row);
                    setOpenDDEModal(true);
                  }}
                  sx={{
                    textTransform: "none",
                    borderColor: "firebrick",
                    color: "firebrick",
                  }}
                >
                  Detalle
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => openEditarCDE(row)}
                  sx={{
                    textTransform: "none",
                    borderColor: "firebrick",
                    color: "firebrick",
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleGenerarGuias(row)}
                  disabled={isGenerating}
                  sx={{
                    textTransform: "none",
                    bgcolor: "firebrick",
                    ":hover": { bgcolor: "#8f1a1a" },
                  }}
                >
                  {isGenerating ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    "GENERAR"
                  )}
                </Button>
              </Stack>
            );
          },
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cdeRows, generatingCDE]
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
      pagination: {
        next: "Siguiente",
        previous: "Anterior",
        rowsPerPage: "Filas por página:",
        displayRows: "de",
      },
      toolbar: { search: "Buscar", viewColumns: "Columnas" },
      viewColumns: {
        title: "Mostrar Columnas",
        titleAria: "Mostrar/Ocultar Columnas",
      },
    },
  };

  const totalPages = Math.max(1, Math.ceil(cdeCount / cdePageSize));

  // Backdrop global
  const busy =
    loadingCDE || savingCDE || loadingDDE || savingEditDDE || loadingDesp;

  const isCDEFinalizado = Number(cdeSel?.finalizado) === 1;

  // ===== Render =====
  return (
    <Box sx={{ mt: 18 }}>
      <Navbar0 menus={menus} />

      {/* Header */}
      <Box
        sx={{
          px: 3,
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Stack spacing={0}>
          <Typography variant="h6" sx={{ fontWeight: 250 }}>
            Administración de Despacho–Entrega
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openCrearCDE}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            Nuevo Envio
          </Button>
        </Stack>
      </Box>

      {/* Controles de filtros + paginación */}
      <Paper variant="outlined" sx={{ p: 2, mb: 0 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            item
            xs={12}
            md
            sx={{
              flexBasis: { md: "40%" },
              maxWidth: { md: "40%" },
              flexGrow: 0,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              <Button
                size="small"
                variant={mode === MODES.TODOS ? "contained" : "outlined"}
                onClick={() => setMode(MODES.TODOS)}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor: mode === MODES.TODOS ? "firebrick" : "transparent",
                  color: mode === MODES.TODOS ? "#fff" : "firebrick",
                  borderColor: "firebrick",
                }}
              >
                Todos
              </Button>

              <Button
                size="small"
                variant={mode === MODES.FINALIZADOS ? "contained" : "outlined"}
                onClick={() => setMode(MODES.FINALIZADOS)}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor:
                    mode === MODES.FINALIZADOS ? "firebrick" : "transparent",
                  color: mode === MODES.FINALIZADOS ? "#fff" : "firebrick",
                  borderColor: "firebrick",
                }}
              >
                Finalizados
              </Button>

              <Button
                size="small"
                variant={mode === MODES.ABIERTOS ? "contained" : "outlined"}
                onClick={() => setMode(MODES.ABIERTOS)}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor:
                    mode === MODES.ABIERTOS ? "firebrick" : "transparent",
                  color: mode === MODES.ABIERTOS ? "#fff" : "firebrick",
                  borderColor: "firebrick",
                }}
              >
                Abiertos
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowBackIosNewIcon />}
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
                size="small"
                variant="outlined"
                endIcon={<ArrowForwardIosIcon />}
                disabled={loadingCDE || cdePage >= totalPages}
                onClick={() =>
                  loadCDE({ page: Math.min(totalPages, cdePage + 1) })
                }
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
              startIcon={
                loadingCDE ? <CircularProgress size={16} /> : <SearchIcon />
              }
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              {loadingCDE ? "Buscando..." : "Buscar / Recargar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <div style={{ margin: "25px" }}>
        <ThemeProvider theme={getMuiTableTheme()}>
          <MUIDataTable
            title={""}
            data={cdeRows}
            columns={cdeColumns}
            options={cdeOptions}
          />
        </ThemeProvider>
      </div>

      {/* ============ DIALOGS ============ */}

      {/* Crear CDE */}
      <Dialog
        open={dlgCrearCDE}
        onClose={closeCrearCDE}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Crear Envio
          <IconButton onClick={closeCrearCDE} size="small" disabled={savingCDE}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Selector de Vendedor (listOfVendors) */}
            <Autocomplete
              options={Array.isArray(listOfVendors) ? listOfVendors : []}
              value={vendorSel}
              onChange={(_, val) => setVendorSel(val)}
              isOptionEqualToValue={(op, val) =>
                op?.cod_persona_vendor === val?.cod_persona_vendor
              }
              getOptionLabel={(o) =>
                o ? `${o.cod_persona_vendor ?? ""} — ${o.nombre ?? ""}` : ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vendedor"
                  size="small"
                  placeholder="Selecciona un vendedor..."
                />
              )}
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
              getOptionLabel={(o) => (o ? `${o.nombre ?? ""}` : "")}
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
              isOptionEqualToValue={(op, val) =>
                op?.cod_transportista === val?.cod_transportista
              }
              getOptionLabel={(o) =>
                o
                  ? `${o.cod_transportista ?? ""} — ${
                      o.nombre_transportista ?? ""
                    }`
                  : ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Transportista (de la ruta seleccionada)"
                  size="small"
                  placeholder={
                    rutaSel
                      ? "Selecciona un transportista..."
                      : "Primero selecciona una Ruta"
                  }
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
          <Button
            variant="outlined"
            onClick={closeCrearCDE}
            disabled={savingCDE}
          >
            Cancelar
          </Button>
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
      <Dialog
        open={dlgEditarCDE}
        onClose={closeEditarCDE}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Editar cabecera CDE
          <IconButton
            onClick={closeEditarCDE}
            size="small"
            disabled={savingCDE}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="finalizado-edit">Finalizado</InputLabel>
              <Select
                labelId="finalizado-edit"
                label="Finalizado"
                value={formEditar.finalizado}
                onChange={(e) =>
                  setFormEditar((s) => ({ ...s, finalizado: e.target.value }))
                }
              >
                <MenuItem value="">(sin cambio)</MenuItem>
                <MenuItem value={0}>No</MenuItem>
                <MenuItem value={1}>Sí</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={closeEditarCDE}
            disabled={savingCDE}
          >
            Cancelar
          </Button>
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
      <Dialog
        open={openDDEModal}
        onClose={() => setOpenDDEModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          SERIES ASIGNADAS
          <IconButton onClick={() => setOpenDDEModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Acciones superiores */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PlaylistAddIcon />}
              onClick={openAgregarDetalleDialog}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
              disabled={isCDEFinalizado}
            >
              {isCDEFinalizado ? "CDE finalizado" : "Agregar series"}
            </Button>
          </Stack>
          {/* Tabla DDE (principal) */}
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
                    sort: false,
                    filter: false,
                    customBodyRenderLite: (idx) => {
                      const row = ddeRows[idx];
                      const isDeleting = deletingSeq === row?.secuencia;
                      return (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            isDeleting ? (
                              <CircularProgress size={14} />
                            ) : (
                              <DeleteOutlineIcon />
                            )
                          }
                          onClick={async () => {
                            if (!cdeSel) return;
                            const ok = window.confirm(
                              `¿Desasignar la serie ${row?.numero_serie} (seq ${row?.secuencia})?`
                            );
                            if (!ok) return;
                            try {
                              setDeletingSeq(row?.secuencia);
                              await deleteDDE(
                                Number(cdeSel.empresa),
                                Number(cdeSel.cde_codigo),
                                Number(row?.secuencia)
                              );
                              toast.success("Serie desasignada.");
                              await cargarDDE({ page: ddePage });
                            } catch (e) {
                              toast.error(
                                e?.message || "No se pudo desasignar."
                              );
                            } finally {
                              setDeletingSeq(null);
                            }
                          }}
                          sx={{
                            textTransform: "none",
                            borderColor: "firebrick",
                            color: "firebrick",
                          }}
                          disabled={isCDEFinalizado}
                        >
                          Desasignar
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
                  body: {
                    noMatch: loadingDDE ? "Cargando..." : "Sin detalles",
                  },
                  pagination: {
                    next: "Siguiente",
                    previous: "Anterior",
                    rowsPerPage: "Filas por página:",
                    displayRows: "de",
                  },
                  toolbar: {
                    search: "Buscar",
                    viewColumns: "Columnas",
                    filterTable: "Filtrar",
                  },
                  filter: { all: "Todos", title: "FILTROS", reset: "LIMPIAR" },
                  viewColumns: {
                    title: "Mostrar Columnas",
                    titleAria: "Mostrar/Ocultar Columnas",
                  },
                },
              }}
            />
          </ThemeProvider>

          {/* Paginación DDE simple */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ArrowBackIosNewIcon />}
              disabled={loadingDDE || ddePage <= 1}
              onClick={() => cargarDDE({ page: Math.max(1, ddePage - 1) })}
              sx={{ borderColor: "firebrick", color: "firebrick" }}
            >
              Anterior
            </Button>
            <Typography variant="body2">
              Página {ddePage} de{" "}
              {Math.max(1, Math.ceil(ddeTotal / ddePageSize))}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ArrowForwardIosIcon />}
              disabled={
                loadingDDE ||
                ddePage >= Math.max(1, Math.ceil(ddeTotal / ddePageSize))
              }
              onClick={() =>
                cargarDDE({
                  page: Math.min(
                    Math.max(1, Math.ceil(ddeTotal / ddePageSize)),
                    ddePage + 1
                  ),
                })
              }
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
          <Button variant="outlined" onClick={() => setOpenDDEModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de selección con TABLA MUI estándar + BÚSQUEDA (pedido/cliente) */}
      <Dialog
        open={openDespDialog}
        onClose={() => setOpenDespDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            width: "85vw",
            maxWidth: "85vw",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Seleccionar registros de VT_DESPACHO_FINAL
          <IconButton onClick={() => setOpenDespDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Buscador local por cod_pedido y cliente */}
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar por pedido o cliente..."
              value={searchSelQuery}
              onChange={(e) => setSearchSelQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {loadingDesp && <LinearProgress sx={{ mb: 1 }} />}

          <Paper variant="outlined">
            <TableContainer sx={{ maxHeight: 540 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      padding="checkbox"
                      sx={{ backgroundColor: "firebrick", color: "#fff" }}
                    >
                      {/* Checkbox seleccionar página */}
                      <Checkbox
                        size="small"
                        sx={{ color: "#fff" }}
                        indeterminate={(() => {
                          const start = selPage * selRowsPerPage;
                          const end = Math.min(
                            filteredDespRows.length,
                            start + selRowsPerPage
                          );
                          const pageItems = filteredDespRows.slice(start, end);
                          const selectedCount = pageItems.reduce(
                            (acc, it) =>
                              acc + (selectedKeys.has(rowKey(it)) ? 1 : 0),
                            0
                          );
                          return (
                            selectedCount > 0 &&
                            selectedCount < pageItems.length
                          );
                        })()}
                        checked={(() => {
                          const start = selPage * selRowsPerPage;
                          const end = Math.min(
                            filteredDespRows.length,
                            start + selRowsPerPage
                          );
                          const pageItems = filteredDespRows.slice(start, end);
                          return (
                            pageItems.length > 0 &&
                            pageItems.every((it) =>
                              selectedKeys.has(rowKey(it))
                            )
                          );
                        })()}
                        onChange={(e) => {
                          const start = selPage * selRowsPerPage;
                          const end = Math.min(
                            filteredDespRows.length,
                            start + selRowsPerPage
                          );
                          const pageItems = filteredDespRows.slice(start, end);
                          handleToggleAllPage(e.target.checked, pageItems);
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Pedido
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Orden
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Cliente
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Ruta
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Destino
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      cod_ddespacho
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      cod_producto
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      numero_serie
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDespRows
                    .slice(
                      selPage * selRowsPerPage,
                      selPage * selRowsPerPage + selRowsPerPage
                    )
                    .map((row) => {
                      const key = rowKey(row);
                      const selected = isSelected(key);
                      return (
                        <TableRow
                          key={key}
                          hover
                          selected={selected}
                          sx={{ cursor: "pointer" }}
                          onClick={(e) => {
                            if (e.target.closest?.("button")) return;
                            handleToggleRow(key);
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={selected}
                              onChange={() => handleToggleRow(key)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>{row?.cod_pedido}</TableCell>
                          <TableCell>{row?.cod_orden}</TableCell>
                          <TableCell>{row?.cliente}</TableCell>
                          <TableCell>{row?.ruta}</TableCell>
                          <TableCell>{row?.destino}</TableCell>
                          <TableCell>{row?.cod_ddespacho}</TableCell>
                          <TableCell>{row?.cod_producto}</TableCell>
                          <TableCell>{row?.numero_serie}</TableCell>
                          <TableCell align="center"></TableCell>
                        </TableRow>
                      );
                    })}

                  {!loadingDesp && filteredDespRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        align="center"
                        sx={{ py: 3, color: "#888" }}
                      >
                        Sin resultados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              rowsPerPageOptions={[5, 10, 20, 50]}
              count={filteredDespRows.length}
              rowsPerPage={selRowsPerPage}
              page={selPage}
              onPageChange={handleSelPageChange}
              onRowsPerPageChange={handleSelRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDespDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSeleccionados}
            disabled={selectedKeys.size === 0}
            startIcon={<PlaylistAddIcon />}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            Confirmar ({selectedKeys.size})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop global */}
      <Backdrop
        open={busy}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Toasts */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}
