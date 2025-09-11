// src/components/reservas/ReservasPedidosAdmin.jsx
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Paper,
    IconButton,
    CircularProgress,
    FormHelperText,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import MUIDataTable from "mui-datatables";
import dayjs from "dayjs";
import Navbar0 from "../Navbar0"; // Ajusta la ruta si tu Navbar0 está en otra carpeta
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuthContext } from "../../context/authContext";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

// 🔗 API
import { setAuthToken, getStockProductosMotos } from "../../services/dispatchApi";

// ======= Tema para MUIDataTable con encabezado firebrick =======
const getMuiTableTheme = () =>
    createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        paddingLeft: "8px",
                        paddingRight: "8px",
                        paddingTop: "6px",
                        paddingBottom: "6px",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "14px",
                    },
                    head: {
                        backgroundColor: "firebrick",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "12px",
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        borderBottom: "2px solid #e0e0e0",
                    },
                },
            },
            MuiToolbar: {
                styleOverrides: {
                    regular: {
                        minHeight: "44px",
                    },
                },
            },
        },
    });

export default function ReservasPedidosAdmin() {
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const menus = useMemo(() => [], []);

    // ======= Catálogo dinámico desde API =======
    const [catalogoModelos, setCatalogoModelos] = useState([]);
    const [loadingModelos, setLoadingModelos] = useState(false);
    const [errorModelos, setErrorModelos] = useState("");
    const filtraModelos = createFilterOptions({
        stringify: (opt) => `${opt.cod} ${opt.nombre}`,
    });

    useEffect(() => { setAuthToken(jwt); }, [jwt]);

    useEffect(() => {
        let alive = true;

        const cargarModelos = async () => {
            try {
                setLoadingModelos(true);
                setErrorModelos("");

                // Parámetros por defecto (puedes ajustarlos)
                const data = await getStockProductosMotos();
                // Asumimos estructura: [{ cod_producto, nombre, stock, cod_item_cat, ... }]
                const mapped =
                    Array.isArray(data)
                        ? data.map((it) => ({
                            cod: String(it.COD_PRODUCTO ?? "").trim(),
                            nombre: String(it.NOMBRE ?? "").trim() || String(it.cod_producto ?? "").trim(),
                            stock: Number(it.STOCK ?? 0),
                            raw: it,
                        }))
                        : [];

                if (alive) setCatalogoModelos(mapped);
            } catch (e) {
                if (alive) setErrorModelos(e?.message || "No se pudo cargar el catálogo de modelos.");
            } finally {
                if (alive) setLoadingModelos(false);
            }
        };

        cargarModelos();
        return () => {
            alive = false;
        };
    }, []);

    // ======= Estado del listado de reservas (en memoria) =======
    const [reservas, setReservas] = useState([]);

    // ======= Estado del diálogo de creación =======
    const [openCrear, setOpenCrear] = useState(false);
    const [modeloCod, setModeloCod] = useState("");
    const [unidades, setUnidades] = useState("");
    const [fechaCaducidad, setFechaCaducidad] = useState(null);

    // ======= Handlers (visual) =======
    const handleOpenCrear = () => {
        setModeloCod("");
        setUnidades("");
        setFechaCaducidad(null);
        setOpenCrear(true);
    };

    const handleCloseCrear = () => {
        setOpenCrear(false);
    };

    const handleGuardarReserva = () => {
        // Validación mínima visual
        if (!modeloCod || !unidades || Number(unidades) <= 0 || !fechaCaducidad?.isValid?.()) {
            return;
        }

        const modelo = catalogoModelos.find((m) => m.cod === modeloCod);
        const nueva = {
            id: `R-${String(reservas.length + 1).padStart(4, "0")}`,
            modeloCod,
            modeloNombre: modelo?.nombre || modeloCod,
            unidades: Number(unidades),
            caduca: fechaCaducidad.toISOString(),
            estado: "PENDIENTE",
        };

        setReservas((prev) => [nueva, ...prev]);
        setOpenCrear(false);
    };

    const columns = [
        { name: "id", label: "Código Reserva" },
        { name: "modeloCod", label: "Modelo" },
        { name: "modeloNombre", label: "Descripción" },
        { name: "unidades", label: "Unidades" },
        {
            name: "caduca",
            label: "Caduca",
            options: {
                customBodyRender: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : ""),
            },
        },
        { name: "estado", label: "Estado" },
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
            body: { noMatch: "No hay reservas para mostrar" },
            pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
            toolbar: { search: "Buscar", viewColumns: "Columnas", filterTable: "Filtrar" },
            filter: { all: "Todos", title: "FILTROS", reset: "LIMPIAR" },
            viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mt: 18 }}>
                {/* Navbar superior */}
                <Navbar0 menus={menus} />

                {/* Encabezado de la pantalla */}
                <Box sx={{ px: 3, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Stack spacing={0.2}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Administrador de Reservas de Pedidos
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Punto de partida visual para gestionar reservas (moto, unidades, caducidad).
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
                        onClick={handleOpenCrear}
                    >
                        Crear reserva
                    </Button>
                </Box>

                {/* Tabla de reservas */}
                <Box sx={{ px: 3, pb: 4 }}>
                    <ThemeProvider theme={getMuiTableTheme()}>
                        <MUIDataTable title={""} data={reservas} columns={columns} options={options} />
                    </ThemeProvider>
                </Box>

                {/* Diálogo: Crear Reserva */}
                <Dialog open={openCrear} onClose={handleCloseCrear} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        Crear reserva de pedido
                        <IconButton onClick={handleCloseCrear} size="small">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                {/* Modelo (desde API) */}
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth size="small" error={!!errorModelos}>
                                        <InputLabel id="modelo-label"></InputLabel>
                                        <Autocomplete
                                            options={catalogoModelos}
                                            value={catalogoModelos.find((o) => o.cod === modeloCod) || null}
                                            onChange={(_, val) => setModeloCod(val?.cod ?? "")}
                                            isOptionEqualToValue={(op, val) => op.cod === val.cod}
                                            getOptionLabel={(o) => (o ? `${o.cod} — ${o.nombre}` : "")}
                                            filterOptions={filtraModelos}
                                            loading={loadingModelos}
                                            disabled={loadingModelos || !!errorModelos}
                                            noOptionsText="Sin coincidencias"
                                            ListboxProps={{ style: { maxHeight: 320 } }}
                                            renderOption={(props, option) => (
                                                <li
                                                    {...props}
                                                    style={{ fontSize: 14, lineHeight: 1.25, paddingTop: 4, paddingBottom: 4 }}
                                                >
                                                    {option.cod} — {option.nombre}
                                                    {Number.isFinite(option.stock) ? ` (${option.stock})` : ""}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Modelo de moto"
                                                    size="small"
                                                    fullWidth
                                                    error={!!errorModelos}
                                                    helperText={
                                                        errorModelos ||
                                                        (!errorModelos && !loadingModelos && catalogoModelos.length === 0
                                                            ? "No se encontraron modelos"
                                                            : "")
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
                                        {errorModelos ? (
                                            <FormHelperText>{errorModelos}</FormHelperText>
                                        ) : null}
                                        {!errorModelos && !loadingModelos && catalogoModelos.length === 0 ? (
                                            <FormHelperText>No se encontraron modelos</FormHelperText>
                                        ) : null}
                                    </FormControl>
                                </Grid>

                                {/* Unidades */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Unidades a reservar"
                                        value={unidades}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (/^\d*$/.test(v)) setUnidades(v); // solo enteros positivos
                                        }}
                                        inputProps={{ min: 1, inputMode: "numeric", pattern: "[0-9]*" }}
                                    />
                                </Grid>

                                {/* Fecha de caducidad */}
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="Fecha de caducidad"
                                        value={fechaCaducidad}
                                        onChange={(v) => setFechaCaducidad(v)}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                                        disablePast
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </DialogContent>

                    <DialogActions>
                        <Button variant="outlined" onClick={handleCloseCrear}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleGuardarReserva}
                            sx={{ bgcolor: "firebrick", ":hover": { bgcolor: "#8f1a1a" } }}
                        >
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
}
