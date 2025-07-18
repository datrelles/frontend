import React, { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
import { toast } from "react-toastify";
import moment from "moment";
import Button from "@mui/material/Button";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import RegistrarPedido from "./registrar-pedido"; // <- Tu componente, asegúrate de la ruta correcta
import Navbar0 from "../Navbar0";
import { getMenus } from "../../services/api";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function PedidosManager() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt, userShineray, enterpriseShineray, systemShineray]
  );

  // Fechas por default: 30 días atrás y hoy
  const [fromDate, setFromDate] = useState(moment().subtract(1, "months"));
  const [toDate, setToDate] = useState(moment);

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [menus, setMenus] = useState([]);
  const [estadoPedido, setEstadoPedido] = useState("PENDIENTE");

  // AGENGIA FIJA: 25
  const codAgencia = 25;

  // Trae los pedidos al cargar
  // FETCH AUTOMÁTICO AL CAMBIAR FECHAS
  useEffect(() => {
    const fetchPedidos = async (ini, fin) => {
      try {
        setLoading(true);
        const data = await APIService.listarPedidosPorFecha({
          fecha_ini: ini.format("YYYY-MM-DD"),
          fecha_fin: fin.format("YYYY-MM-DD"),
          cod_agencia: codAgencia,
        });
        setPedidos(data);
      } catch (err) {
        toast.error(err.message || "Error cargando pedidos");
      } finally {
        setLoading(false);
      }
    };

    if (fromDate && toDate) {
      fetchPedidos(fromDate, toDate);
    } else {
      fetchPedidos(moment().subtract(30, "days"), moment());
    }
  }, [fromDate, toDate, APIService, codAgencia]);

  // --------------------------------------
  // USEEFFECT (Menus)
  // --------------------------------------
  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(
          userShineray,
          enterpriseShineray,
          "VE",
          jwt
        );
        setMenus(data);
      } catch (error) {
        toast.error(error);
      }
    };
    menu();
  }, [userShineray, enterpriseShineray, jwt]);

  // Al montar, resetea el rango de fechas
  useEffect(() => {
    setToDate(null);
    setFromDate(null);
  }, []);

  // Detalle al seleccionar un pedido
  const handleVerDetalle = async (pedido) => {
    console.log(pedido)
    try {
      setLoading(true);
      const detalle = await APIService.obtenerPedidoConDetalles({
        cod_pedido: pedido.COD_PEDIDO,
        empresa: pedido.EMPRESA,
        cod_tipo_pedido: pedido.COD_TIPO_PEDIDO,
      });
      setPedidoDetalle(detalle);
      setOpenDetail(true);
    } catch (err) {
      toast.error(err.message || "Error consultando detalle");
    } finally {
      setLoading(false);
    }
  };

  // DataTable columns
  const columns = [
    { name: "COD_PEDIDO", label: "Código Pedido" },
    {
      name: "FECHA_ADICION",
      label: "FECHA",
      options: {
        customBodyRender: (value) =>
          value ? moment(value).format("YYYY-MM-DD") : "",
      },
    },
    { name: "COD_PERSONA_CLI", label: "IDENTIFICACION" },
    { name: "CLIENTE", label: "CLIENTE" },
    { name: "VALOR_PEDIDO", label: "Valor Total" },
    { name: "ADICIONADO_POR", label: "VENDEDOR" },
    {
      name: "Detalles",
      label: "Ver Detalle",
      options: {
        customBodyRenderLite: (dataIndex) => (
          <Button
            variant="contained"
            color="primary"
            style={{ background: "firebrick", margin: "5px" }}
            onClick={() => handleVerDetalle(getPedidosFiltrados()[dataIndex])}
          >
            Ver Detalle
          </Button>
        ),
      },
    },
  ];

  const options = {
    selectableRows: false,
    rowsPerPage: 10,
    elevation: 0,
  };

  // Estilo MUI
  const getMuiTheme = () =>
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
          styleOverrides: {
            root: {
              borderCollapse: "collapse",
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              borderBottom: "5px solid #ddd",
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            regular: {
              minHeight: "10px",
            },
          },
        },
      },
    });

  const getPedidosFiltrados = () => {
    if (!estadoPedido) return pedidos;
    switch (estadoPedido) {
      case "PENDIENTE":
        return pedidos.filter(
          (p) => p.ES_PENDIENTE === "S" && p.ADICIONADO_POR === userShineray
        );
      case "FACTURADO":
        return pedidos.filter(
          (p) => p.ES_FACTURADO === "S" && p.ADICIONADO_POR === userShineray
        );
      case "BLOQUEADO":
        return pedidos.filter(
          (p) => p.ES_BLOQUEADO === "S" && p.ADICIONADO_POR === userShineray
        );
      case "ANULADO":
        return pedidos.filter(
          (p) => p.ES_ANULADO === "S" && p.ADICIONADO_POR === userShineray
        );
      case "APROBADO VENTAS":
        return pedidos.filter(
          (p) => p.ES_APROBADO_VEN === "S" && p.ADICIONADO_POR === userShineray
        );
      case "APROBADO CARTERA":
        return pedidos.filter(
          (p) => p.ES_APROBADO_CART === "S" && p.ADICIONADO_POR === userShineray
        );
      default:
        return pedidos;
    }
  };

  return (
    <>
      <div
        style={{
          marginTop: "150px",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <Navbar0 menus={menus} />

        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "0px 25px 0px 25px",
            }}
          >
            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Fecha Desde"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    format="DD/MM/YYYY"
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            <div style={{ margin: "0 5px" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Fecha Hasta"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    format="DD/MM/YYYY"
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            <div style={{ margin: "8px 5px" }}>
              <FormControl fullWidth>
                <InputLabel id="estado-pedido-label">Estado</InputLabel>
                <Select
                  labelId="estado-pedido-label"
                  value={estadoPedido}
                  label="Estado"
                  onChange={(e) => setEstadoPedido(e.target.value)}
                >
                  <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                  <MenuItem value="FACTURADO">FACTURADO</MenuItem>
                  <MenuItem value="BLOQUEADO">BLOQUEADO</MenuItem>
                  <MenuItem value="ANULADO">ANULADO</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div style={{ margin: "8px 5px" }}>
              <RegistrarPedido />
            </div>
          </div>
        </div>

        <div style={{ margin: "0px 25px 25px 25px" }}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={""}
              data={getPedidosFiltrados()}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>

        {/* Dialog Detalle Pedido */}
        <Dialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Detalle del Pedido</DialogTitle>
          <DialogContent dividers>
            {pedidoDetalle ? (
              <>
                {/* CABECERA DEL PEDIDO */}
                <Paper
                  variant="outlined"
                  style={{
                    marginBottom: 15,
                    padding: 12,
                    background: "#f9f9f9",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <b>Cliente:</b> {pedidoDetalle.cabecera.COD_PERSONA_CLI}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Ciudad:</b> {pedidoDetalle.cabecera.CIUDAD}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Agencia:</b> {pedidoDetalle.cabecera.COD_AGENCIA}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Vendedor:</b> {pedidoDetalle.cabecera.ADICIONADO_POR}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Fecha Pedido:</b>{" "}
                      {moment(pedidoDetalle.cabecera.FECHA_PEDIDO).format(
                        "YYYY-MM-DD"
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Forma de Pago:</b>{" "}
                      {pedidoDetalle.cabecera.COD_FORMA_PAGO}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Política:</b> {pedidoDetalle.cabecera.COD_POLITICA}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Observaciones:</b>{" "}
                      {pedidoDetalle.cabecera.OBSERVACIONES ?? "-"}
                    </Grid>
                  </Grid>
                </Paper>

                {/* DETALLE DEL PEDIDO */}
                <Typography variant="subtitle1" style={{ marginBottom: 10 }}>
                  <strong>Detalle de Productos</strong>
                </Typography>
                <Paper variant="outlined" style={{ padding: 10 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ borderCollapse: "collapse", width: "100%" }}
                    >
                      <thead style={{ background: "#dedede" }}>
                        <tr>
                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            Sec.
                          </th>
                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            Código
                          </th>
                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            Cantidad
                          </th>
                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            Precio
                          </th>
                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            Descuento
                          </th>
                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            Precio Desc.
                          </th>

                          <th style={{ border: "1px solid #bbb", padding: 4 }}>
                            IVA
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidoDetalle.detalles.map((item, idx) => (
                          <tr
                            key={idx}
                            style={{
                              background: idx % 2 === 0 ? "#fff" : "#f7f7f7",
                            }}
                          >
                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.SECUENCIA}
                            </td>
                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.COD_PRODUCTO}
                            </td>
                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.CANTIDAD_PEDIDA}
                            </td>
                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.PRECIO}
                            </td>
                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.DESCUENTO}
                            </td>
                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.PRECIO_DESCONTADO}
                            </td>

                            <td
                              style={{ border: "1px solid #ccc", padding: 3 }}
                            >
                              {item.VALOR_IVA}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Paper>
              </>
            ) : (
              <Typography>Cargando detalles...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetail(false)} variant="outlined">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading simple */}
        {loading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
          >
            <div className="loader">Cargando...</div>
          </div>
        )}
      </div>
    </>
  );
}
