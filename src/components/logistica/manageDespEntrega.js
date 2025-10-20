// src/components/logistica/DespachosControl.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Stack, Typography,
  TextField, Paper, IconButton, CircularProgress, Chip, MenuItem, Select, InputLabel, FormControl,
  LinearProgress, Tooltip, Table, TableHead, TableRow, TableCell, TableBody
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
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Autocomplete from "@mui/material/Autocomplete";
import MUIDataTable from "mui-datatables";
import Navbar0 from "../Navbar0";
import { useAuthContext } from "../../context/authContext";
import * as XLSX from "xlsx";

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
  updateCDespacho,
  getDireccionesCliente,
  updateDDespacho
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

// Convierte un valor de fecha Excel (serial numérico o string) a YYYY-MM-DD
const toISOFromExcel = (val) => {
  if (val == null || val === "") return null;
  // Si viene como número (serial Excel)
  if (typeof val === "number" && !isNaN(val)) {
    // Excel serial date -> ms desde 1970: (val - 25569) días * 86400s * 1000ms
    const ms = Math.round((val - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    // Aseguramos ISO en local (sin tz) YYYY-MM-DD
    return d.toISOString().slice(0, 10);
  }
  // Si viene como string, intentamos parsear
  const s = String(val).trim();
  // Normalizamos separadores
  const clean = s.replace(/\//g, "-");
  // Si viene como YYYY-MM-DD o similar, tomamos los primeros 10
  const candidate = clean.slice(0, 10);
  // Validación simple YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
  // Intento con Date.parse
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
};

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

  // ====== Excel (.xlsx) - Despachada ======
  const fileInputRef = useRef(null);
  const [excelDlgOpen, setExcelDlgOpen] = useState(false);
  const [excelMatches, setExcelMatches] = useState([]); // elementos que serán actualizados
  const [excelParseErrors, setExcelParseErrors] = useState([]);
  const [updatingExcel, setUpdatingExcel] = useState(false);

  // ====== Excel (.xlsx) - Entregas ======
  const fileEntregaRef = useRef(null);
  const [excelEntregaDlgOpen, setExcelEntregaDlgOpen] = useState(false);
  const [excelEntregaMatches, setExcelEntregaMatches] = useState([]);
  const [excelEntregaErrors, setExcelEntregaErrors] = useState([]);
  const [updatingEntrega, setUpdatingEntrega] = useState(false);

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

  // ====== Diálogo Editar (ruta, transportista, despachada, dirección cliente) ======
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

  // Direcciones del cliente
  const [loadingDirs, setLoadingDirs] = useState(false);
  const [dirsOpts, setDirsOpts] = useState([]);
  const [dirSel, setDirSel] = useState(null);

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

  // Cargar direcciones del cliente al abrir el diálogo
  useEffect(() => {
    if (!dlgEdit) return;

    let cancel = false;
    (async () => {
      try {
        const codCliente = rowEdit?.ruc_cliente;
        if (!codCliente) {
          setDirsOpts([]);
          setDirSel(null);
          toast.warning("Este registro no tiene 'ruc_cliente'; no es posible listar direcciones.");
          return;
        }

        setLoadingDirs(true);
        const data = await getDireccionesCliente({
          cod_cliente: String(codCliente).trim(),
          empresa: Number(enterpriseShineray || empresa),
          page: 1,
          page_size: 2000,
        });

        const items = Array.isArray(data?.results) ? data.results : [];
        if (!cancel) {
          setDirsOpts(items);
          const currentCod = rowEdit?.cod_direccion_cli;
          if (currentCod) {
            const found = items.find(d => Number(d?.cod_direccion) === Number(currentCod));
            setDirSel(found || null);
          } else {
            setDirSel(null);
          }
        }
      } catch (e) {
        if (!cancel) toast.error(e?.message || "No se pudieron cargar direcciones del cliente.");
      } finally {
        if (!cancel) setLoadingDirs(false);
      }
    })();

    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dlgEdit, rowEdit, enterpriseShineray]);

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

    setDirsOpts([]);
    setDirSel(null);

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
    if (dirSel?.cod_direccion) payload.cod_direccion_cli = Number(dirSel.cod_direccion);

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

  // ====== DESCARGAR MODELO XLSX (DESPACHADA) ======
  const handleDownloadTemplate = () => {
    const aoa = [
      ["SERIE", "DESPACHADA"],
      ["", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, "modelo_despachos.xlsx");
    toast.info("Se descargó el modelo Excel. Llénalo y vuelve a cargarlo.");
  };

  // ====== PARSE XLSX/CSV (DESPACHADA) ======
  const parseWorkbook = (wb) => {
    const firstSheetName = wb.SheetNames?.[0];
    if (!firstSheetName) return { records: [], errors: ["El archivo no contiene hojas."] };

    const ws = wb.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
    const errors = [];
    const records = [];

    const normalizeKey = (k) => norm(k);
    const mapRow = (row) => {
      const keys = Object.keys(row);
      const keySerie = keys.find(k => normalizeKey(k) === "serie");
      const keyDesp = keys.find(k => normalizeKey(k) === "despachada");
      return {
        serie: keySerie ? String(row[keySerie] ?? "").trim() : "",
        desp: keyDesp != null ? String(row[keyDesp] ?? "").trim() : "",
      };
    };

    json.forEach((r, idx) => {
      const { serie, desp } = mapRow(r);
      const line = idx + 2;
      if (!serie && !desp) return;
      if (!serie) {
        errors.push(`Línea ${line}: SERIE vacío.`);
        return;
      }
      const v = String(desp).trim();
      if (!(v === "0" || v === "1")) {
        errors.push(`Línea ${line}: DESPACHADA debe ser 0 o 1.`);
        return;
      }
      records.push({ SERIE: serie, DESPACHADA: v });
    });

    return { records, errors };
  };

  // ====== CLICK CARGAR EXCEL (DESPACHADA) ======
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // ====== ON CHANGE FILE (DESPACHADA) ======
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!(/\.(xlsx|xls|csv)$/i.test(name))) {
      toast.error("Sube un archivo Excel (.xlsx, .xls) o CSV.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const { records, errors } = parseWorkbook(wb);

      const actives = records
        .filter(r => r.DESPACHADA === "1")
        .map(r => ({ serie: String(r.SERIE || "").trim() }))
        .filter(r => r.serie);

      if (actives.length === 0) {
        setExcelParseErrors(errors || []);
        toast.warning("No se encontraron series con DESPACHADA = 1.");
        return;
      }

      const rowsBySerie = new Map();
      for (const r of rows) {
        const key = String(r?.numero_serie ?? "").trim();
        if (key) rowsBySerie.set(key, r);
      }

      const matches = [];
      const issues = [...(errors || [])];

      for (const a of actives) {
        const found = rowsBySerie.get(a.serie);
        if (found) {
          const okState = Number(found.en_despacho) === 0 && Number(found.despachada) === 0;
          const hasCod = !!found.cod_despacho;
          if (okState && hasCod) {
            matches.push({
              serie: a.serie,
              cod_despacho: found.cod_despacho,
              cliente: found.cliente,
              pedido: found.cod_pedido,
              orden: found.cod_orden,
              ruta: found.ruta,
              cod_ddespacho: found.cod_ddespacho,
            });
          } else {
            issues.push(
              `Serie ${a.serie}: no cumple estado (en_despacho y despachada deben ser 0) o falta cod_despacho.`
            );
          }
        } else {
          issues.push(`Serie ${a.serie}: no existe en los registros actuales.`);
        }
      }

      setExcelParseErrors(issues);
      setExcelMatches(matches);
      if (matches.length === 0) {
        toast.warning("No hay series elegibles para actualizar.");
        return;
      }
      setExcelDlgOpen(true);
    } catch (err) {
      toast.error(err?.message || "Error al leer el archivo.");
    }
  };

  // ====== ACTUALIZAR SERIES DESDE DIALOG (DESPACHADA) ======
  const handleConfirmExcelUpdate = async () => {
    if (excelMatches.length === 0) return;
    setUpdatingExcel(true);
    let ok = 0, fail = 0;
    for (const item of excelMatches) {
      try {
        await updateDDespacho(
          Number(empresa),
          Number(item.cod_despacho),
          Number(item.cod_ddespacho),
          { despachada: 1, usr_agrega: userShineray || undefined },
          { method: "PATCH" }
        );
        ok++;
      } catch (e) {
        fail++;
      }
    }

    setUpdatingExcel(false);
    setExcelDlgOpen(false);

    if (ok) toast.success(`Series actualizadas: ${ok}`);
    if (fail) toast.error(`Series con error: ${fail}`);
    await loadData({ page });
  };

  // ====== NUEVO: DESCARGAR MODELO XLSX (ENTREGAS) ======
  const handleDownloadEntregaTemplate = () => {
    const aoa = [
      ["SERIE", "FECHA_ENTREGA", "OBSERVACION_ENTREGA"],
      ["", "YYYY-MM-DD", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entregas");
    XLSX.writeFile(wb, "modelo_entregas.xlsx");
    toast.info("Se descargó el modelo de Entregas. Llénalo y vuelve a cargarlo.");
  };

  // ====== NUEVO: PARSE XLSX/CSV (ENTREGAS) ======
  const parseWorkbookEntregas = (wb) => {
    const firstSheetName = wb.SheetNames?.[0];
    if (!firstSheetName) return { records: [], errors: ["El archivo no contiene hojas."] };

    const ws = wb.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
    const errors = [];
    const records = [];

    const normalizeKey = (k) => norm(k);
    const mapRow = (row) => {
      const keys = Object.keys(row);
      const kSerie = keys.find(k => normalizeKey(k) === "serie");
      const kFecha = keys.find(k => normalizeKey(k) === "fecha_entrega");
      const kObs = keys.find(k => normalizeKey(k) === "observacion_entrega");
      return {
        serie: kSerie ? String(row[kSerie] ?? "").trim() : "",
        fecha: kFecha != null ? row[kFecha] : "",
        obs: kObs != null ? String(row[kObs] ?? "").trim() : "",
      };
    };

    json.forEach((r, idx) => {
      const { serie, fecha, obs } = mapRow(r);
      const line = idx + 2;
      if (!serie && !fecha && !obs) return; // fila totalmente vacía
      if (!serie) {
        errors.push(`Línea ${line}: SERIE vacío.`);
        return;
      }
      const iso = toISOFromExcel(fecha);
      if (!iso) {
        errors.push(`Línea ${line}: FECHA_ENTREGA inválida (use YYYY-MM-DD o fecha válida de Excel).`);
        return;
      }
      records.push({ SERIE: serie, FECHA_ENTREGA: iso, OBSERVACION_ENTREGA: obs || "" });
    });

    return { records, errors };
  };

  // ====== NUEVO: CLICK CARGAR EXCEL (ENTREGAS) ======
  const handleClickUploadEntregas = () => {
    fileEntregaRef.current?.click();
  };

  // ====== NUEVO: ON CHANGE FILE (ENTREGAS) ======
  const handleFileChangeEntregas = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!(/\.(xlsx|xls|csv)$/i.test(name))) {
      toast.error("Sube un archivo Excel (.xlsx, .xls) o CSV.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const { records, errors } = parseWorkbookEntregas(wb);

      if (records.length === 0) {
        setExcelEntregaErrors(errors || []);
        toast.warning("No se encontraron registros válidos para entrega.");
        return;
      }

      const rowsBySerie = new Map();
      for (const r of rows) {
        const key = String(r?.numero_serie ?? "").trim();
        if (key) rowsBySerie.set(key, r);
      }

      const matches = [];
      const issues = [...(errors || [])];

      for (const rec of records) {
        const found = rowsBySerie.get(rec.SERIE);
        if (found) {
          const okState = true//Number(found.en_despacho) === 0 && Number(found.despachada) === 0;
          const hasCod = !!found.cod_despacho;
          if (okState && hasCod) {
            matches.push({
              serie: rec.SERIE,
              fecha_entrega: rec.FECHA_ENTREGA,
              observacion_entrega: rec.OBSERVACION_ENTREGA,
              cod_despacho: found.cod_despacho,
              cliente: found.cliente,
              pedido: found.cod_pedido,
              orden: found.cod_orden,
              ruta: found.ruta,
              cod_ddespacho: found.cod_ddespacho,
            });
          } else {
            issues.push(
              `Serie ${rec.SERIE}: no cumple estado (en_despacho y despachada deben ser 0) o falta cod_despacho.`
            );
          }
        } else {
          issues.push(`Serie ${rec.SERIE}: no existe en los registros actuales.`);
        }
      }

      setExcelEntregaErrors(issues);
      setExcelEntregaMatches(matches);
      if (matches.length === 0) {
        toast.warning("No hay series elegibles para actualizar entrega.");
        return;
      }
      setExcelEntregaDlgOpen(true);
    } catch (err) {
      toast.error(err?.message || "Error al leer el archivo de entregas.");
    }
  };

  // ====== NUEVO: ACTUALIZAR DESDE DIALOG (ENTREGAS) ======
  const handleConfirmEntregaUpdate = async () => {
    if (excelEntregaMatches.length === 0) return;
    setUpdatingEntrega(true);
    let ok = 0, fail = 0;

    for (const item of excelEntregaMatches) {
      try {
        await updateDDespacho(
          Number(empresa),
          Number(item.cod_despacho),
          Number(item.cod_ddespacho),
          {
            fecha_entrega: item.fecha_entrega,
            observacion_entrega: item.observacion_entrega,
            usr_agrega: userShineray || undefined
          },
          { method: "PATCH" }
        );
        ok++;
      } catch (e) {
        fail++;
      }
    }

    setUpdatingEntrega(false);
    setExcelEntregaDlgOpen(false);

    if (ok) toast.success(`Entregas actualizadas: ${ok}`);
    if (fail) toast.error(`Registros con error: ${fail}`);
    await loadData({ page });
  };

  // ====== Columnas ======
  const columns = useMemo(
    () => [
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
      { name: "cod_pedido", label: "COD PEDIDO" },
      { name: "cod_orden", label: "COD ORDEN" },
      {
        name: "cod_guia_des",
        label: "COD GUIA DESPACHO",
        options: {
          customBodyRenderLite: (idx) => filteredRows[idx]?.cod_guia_des ?? "-",
        },
      },
      {
        name: "cod_guia_envio",
        label: "COD GUIA ENVIO",
        options: {
          customBodyRenderLite: (idx) => {
            const v = filteredRows[idx]?.cod_guia_envio;
            return v ? v : <Chip size="small" color="warning" label="SIN GUÍA" />;
          },
        },
      },
      { name: "cadena", label: "CADENA" },
      { name: "cliente", label: "CLIENTE" },
      { name: "destino", label: "DESTINO" },
      { name: "ruta", label: "RUTA" },
      { name: "transportista", label: "TRANSPORTISTA" },
      { name: "ruc_cliente", label: "RUC " },
      { name: "fac_con", label: "TIPO" },
      {
        name: "fecha_agrega",
        label: "FECHA AGREGADO",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_agrega) },
      },
      {
        name: "fecha_est_desp",
        label: "FECHA ESTIMADA DESP",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_est_desp) },
      },
      {
        name: "fecha_despacho",
        label: "FECHA DESPACHO",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_despacho) },
      },
      {
        name: "fecha_envio",
        label: "FECHA ENVIO",
        options: { customBodyRenderLite: (i) => fmtDate(filteredRows[i]?.fecha_envio) },
      },
      { name: "bod_destino", label: "BOD DESTINO" },
      { name: "producto", label: "PRODUCTO" },
      { name: "cod_producto", label: "COD PRODUCTO" },
      { name: "nombre", label: "NOMBRE" },
      { name: "modelo", label: "MODELO" },
      { name: "numero_serie", label: "NUMERO_SERIE" },
      { name: "cod_color", label: "COD COLOR" }
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
  const busy = loading || savingEdit || loadingRutas || loadingTransp || loadingDirs || updatingExcel || updatingEntrega;

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
            Panel de Control de Despachos
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Carga masiva de “Despachada” y datos de “Entrega” vía Excel (.xlsx).
          </Typography>
        </Stack>

        {/* BOTONES: Descargar/Cargar Excel (Despachada) + (Entregas) */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {/* Modelo Despachada */}
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={handleDownloadTemplate}
            sx={{ borderColor: "firebrick", color: "firebrick", textTransform: "none" }}
          >
            Modelo Despachada
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleClickUpload}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" }, textTransform: "none" }}
          >
            Cargar Despachada
          </Button>

          {/* NUEVOS: Modelo Entregas */}
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={handleDownloadEntregaTemplate}
            sx={{ borderColor: "firebrick", color: "firebrick", textTransform: "none" }}
          >
            Modelo Entregas
          </Button>
          <input
            type="file"
            ref={fileEntregaRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChangeEntregas}
          />
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleClickUploadEntregas}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" }, textTransform: "none" }}
          >
            Cargar Entregas
          </Button>
        </Stack>
      </Box>

      {/* Controles: filtros por estado, buscador, paginación/recarga */}
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

              {/* Transportista */}
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

              {/* Dirección del cliente */}
              <Autocomplete
                options={dirsOpts}
                loading={loadingDirs}
                value={dirSel}
                onChange={(_, val) => setDirSel(val)}
                disabled={!rowEdit?.ruc_cliente}
                isOptionEqualToValue={(op, val) => Number(op?.cod_direccion) === Number(val?.cod_direccion)}
                getOptionLabel={(o) =>
                  o ? `[${o.cod_direccion}] ${o.direccion ?? ""} — ${o.ciudad ?? ""}` : ""
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Dirección del cliente"
                    size="small"
                    placeholder={
                      rowEdit?.ruc_cliente
                        ? "Selecciona la dirección para el despacho"
                        : "No hay ruc_cliente en el registro"
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingDirs ? <CircularProgress size={16} /> : null}
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

      {/* === Diálogo de confirmación de actualización por Excel (Despachada) === */}
      <Dialog open={excelDlgOpen} onClose={() => !updatingExcel && setExcelDlgOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Confirmar actualización de series (DESPACHADA = 1)
          <IconButton onClick={() => !updatingExcel && setExcelDlgOpen(false)} size="small" disabled={updatingExcel}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {excelParseErrors?.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1, borderColor: "#f44336" }}>
                <Typography variant="subtitle2" sx={{ color: "#f44336", mb: 1 }}>
                  Observaciones del archivo:
                </Typography>
                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                  {excelParseErrors.map((e, i) => <li key={i}><Typography variant="caption">{e}</Typography></li>)}
                </ul>
              </Paper>
            )}

            <Typography variant="body2">
              Series elegibles para actualizar (<b>{excelMatches.length}</b>):
            </Typography>

            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Serie</TableCell>
                  <TableCell>Cod. Despacho</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Orden</TableCell>
                  <TableCell>Ruta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelMatches.map((m, i) => (
                  <TableRow key={`${m.cod_despacho}-${m.serie}-${i}`}>
                    <TableCell>{m.serie}</TableCell>
                    <TableCell>{m.cod_despacho}</TableCell>
                    <TableCell>{m.cliente}</TableCell>
                    <TableCell>{m.pedido}</TableCell>
                    <TableCell>{m.orden}</TableCell>
                    <TableCell>{m.ruta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {excelMatches.length === 0 && (
              <Typography variant="body2" color="text.secondary">No hay elementos para actualizar.</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setExcelDlgOpen(false)} disabled={updatingExcel}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={updatingExcel ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            onClick={handleConfirmExcelUpdate}
            disabled={updatingExcel || excelMatches.length === 0}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {updatingExcel ? "Actualizando..." : "Actualizar series"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === NUEVO: Diálogo de confirmación de actualización por Excel (Entregas) === */}
      <Dialog open={excelEntregaDlgOpen} onClose={() => !updatingEntrega && setExcelEntregaDlgOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Confirmar actualización de Entregas (fecha & observación)
          <IconButton onClick={() => !updatingEntrega && setExcelEntregaDlgOpen(false)} size="small" disabled={updatingEntrega}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {excelEntregaErrors?.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1, borderColor: "#f44336" }}>
                <Typography variant="subtitle2" sx={{ color: "#f44336", mb: 1 }}>
                  Observaciones del archivo:
                </Typography>
                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                  {excelEntregaErrors.map((e, i) => <li key={i}><Typography variant="caption">{e}</Typography></li>)}
                </ul>
              </Paper>
            )}

            <Typography variant="body2">
              Registros elegibles para actualizar (<b>{excelEntregaMatches.length}</b>):
            </Typography>

            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Serie</TableCell>
                  <TableCell>Cod. Despacho</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Orden</TableCell>
                  <TableCell>Ruta</TableCell>
                  <TableCell>Fecha Entrega</TableCell>
                  <TableCell>Observación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelEntregaMatches.map((m, i) => (
                  <TableRow key={`${m.cod_despacho}-${m.serie}-${i}`}>
                    <TableCell>{m.serie}</TableCell>
                    <TableCell>{m.cod_despacho}</TableCell>
                    <TableCell>{m.cliente}</TableCell>
                    <TableCell>{m.pedido}</TableCell>
                    <TableCell>{m.orden}</TableCell>
                    <TableCell>{m.ruta}</TableCell>
                    <TableCell>{m.fecha_entrega}</TableCell>
                    <TableCell>{m.observacion_entrega}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {excelEntregaMatches.length === 0 && (
              <Typography variant="body2" color="text.secondary">No hay elementos para actualizar.</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setExcelEntregaDlgOpen(false)} disabled={updatingEntrega}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={updatingEntrega ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            onClick={handleConfirmEntregaUpdate}
            disabled={updatingEntrega || excelEntregaMatches.length === 0}
            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
          >
            {updatingEntrega ? "Actualizando..." : "Actualizar entregas"}
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
