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
import RegistrarPedido from "./registrar-pedido"; // <- Tu componente, asegúrate de la ruta correcta

export default function PedidosManager() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt, userShineray, enterpriseShineray, systemShineray]
  );

  // Fechas por default: 30 días atrás y hoy
  const [fechaFin] = useState(moment());
  const [fechaIni] = useState(moment().subtract(30, "days"));

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  // AGENGIA FIJA: 25
  const codAgencia = 25;

  // Trae los pedidos al cargar
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const data = await APIService.listarPedidosPorFecha({
          fecha_ini: fechaIni.format("YYYY-MM-DD"),
          fecha_fin: fechaFin.format("YYYY-MM-DD"),
          cod_agencia: codAgencia,
        });
        setPedidos(data);
      } catch (err) {
        toast.error(err.message || "Error cargando pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [APIService, fechaIni, fechaFin, codAgencia]);

  // Detalle al seleccionar un pedido
  const handleVerDetalle = async (pedido) => {
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
    { name: "COD_TIPO_PEDIDO", label: "Tipo Pedido" },
    { name: "EMPRESA", label: "Empresa" },
    {
      name: "FECHA_PEDIDO", label: "Fecha Pedido", options: {
        customBodyRender: (value) =>
          value ? moment(value).format("YYYY-MM-DD") : "",
      }
    },
    { name: "COD_PERSONA_CLI", label: "Cliente" },
    { name: "VALOR_PEDIDO", label: "Valor Pedido" },
    {
      name: "Detalles",
      label: "Ver Detalle",
      options: {
        customBodyRenderLite: (dataIndex) => (
          <Button
            variant="contained"
            color="primary"
            style={{ background: "firebrick" }}
            onClick={() => handleVerDetalle(pedidos[dataIndex])}
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
            root: { padding: "6px" },
            head: { backgroundColor: "firebrick", color: "#fff", fontWeight: "bold" },
          },
        },
      },
    });

  return (
    <>
      <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <Navbar0 menus={menus} />

        <div style={{ padding: 24 }}>
          {/* <--------------------------  Arriba el RegistrarPedido --------------------------> */}
          <RegistrarPedido />

          <Typography variant="h5" style={{ marginBottom: 20, marginTop: 24 }}>
            Pedidos últimos 30 días (Agencia 25)
          </Typography>
          <Typography variant="body2" style={{ marginBottom: 8 }}>
            Mostrando pedidos desde <b>{fechaIni.format("YYYY-MM-DD")}</b> hasta <b>{fechaFin.format("YYYY-MM-DD")}</b> (Agencia 25)
          </Typography>

          <div style={{ marginTop: 20 }}>
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                title={""}
                data={pedidos}
                columns={columns}
                options={options}
              />
            </ThemeProvider>
          </div>
        </div>

        {/* Dialog Detalle Pedido */}
        <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
          <DialogTitle>Detalle del Pedido</DialogTitle>
          <DialogContent dividers>
            {pedidoDetalle ? (
              <>
                <Typography variant="subtitle1" style={{ marginBottom: 10 }}>
                  <strong>Cabecera:</strong>
                </Typography>
                <Paper variant="outlined" style={{ marginBottom: 20, padding: 16 }}>
                  <Grid container spacing={2}>
                    {Object.entries(pedidoDetalle.cabecera).map(([k, v]) => (
                      <Grid item xs={12} sm={6} md={4} key={k}>
                        <Typography variant="body2">
                          <b>{k.replace(/_/g, " ")}:</b> {String(v ?? "")}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
                <Typography variant="subtitle1" style={{ marginBottom: 10 }}>
                  <strong>Detalles:</strong>
                </Typography>
                <Paper variant="outlined" style={{ padding: 16 }}>
                  {pedidoDetalle.detalles.length === 0 ? (
                    <Typography>No hay detalles para este pedido.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {pedidoDetalle.detalles.map((det, idx) => (
                        <Grid item xs={12} key={idx}>
                          <Paper variant="outlined" style={{ marginBottom: 8, padding: 8 }}>
                            {Object.entries(det).map(([k, v]) => (
                              <Typography key={k} variant="body2">
                                <b>{k.replace(/_/g, " ")}:</b> {String(v ?? "")}
                              </Typography>
                            ))}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </>
            ) : (
              <Typography>Cargando detalles...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetail(false)} variant="outlined">Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Loading simple */}
        {loading && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
            }}
          >
            <div className="loader">Cargando...</div>
          </div>
        )}
      </div>


    </>
  );
}
