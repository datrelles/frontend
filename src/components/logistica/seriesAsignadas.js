import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { getSeriesAsignadas, revertirSerieAsignada } from "../../services/dispatchApi";

const modalStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  maxHeight: "80vh",
  bgcolor: "background.paper",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  boxShadow: 24,
  p: 2,
  overflowY: "auto",
  zIndex: (theme) => theme.zIndex.modal + 3,
};

export default function SeriesAsignadas({
  open,
  onClose,
  onAfterClose,
  codComprobante,
  tipoComprobante,
  codProducto,
  empresa,
  currentDetalle
}) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState({ open: false, ok: true, message: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Mostrar overlay de resultado
  const showOverlay = useCallback((ok = true, message = "") => {
    setOverlay({ open: true, ok, message });
    setTimeout(() => setOverlay({ open: false, ok, message: "" }), 1500);
  }, []);

  // Cargar series
  useEffect(() => {
    if (!open) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getSeriesAsignadas({
          cod_comprobante: codComprobante,
          cod_tipo_comprobante: tipoComprobante,
          empresa,
          cod_producto: codProducto,
        });
        setSeries(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando series:", e);
        setSeries([]);
        showOverlay(false, "Error al cargar series");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, codComprobante, tipoComprobante, empresa, codProducto, showOverlay]);

  // Confirmar eliminación
  const requestDelete = (serie) => {
    setToDelete(serie);
    setConfirmOpen(true);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setConfirmOpen(false);
      setLoading(true);

      const payload = {
        empresa,
        cod_comprobante: codComprobante,
        tipo_comprobante: tipoComprobante,
        cod_producto: codProducto,
        numero_serie: toDelete.NUMERO_SERIE,
        numero_agencia: currentDetalle?.COD_BODEGA_DESPACHA,
        empresa_g: empresa,
        cod_estado_producto: toDelete.COD_ESTADO_PRODUCTO,
      };

      const resp = await revertirSerieAsignada(payload);

      if (resp?.ok === true || (typeof resp?.ok === "string" && resp.ok.toUpperCase().includes("OK"))) {
        setSeries(prev => prev.filter(x => x.NUMERO_SERIE !== toDelete.NUMERO_SERIE));
        showOverlay(true, "Serie desasignada");
      } else {
        throw new Error(resp?.mensaje || "No se pudo desasignar");
      }
    } catch (e) {
      showOverlay(false, e?.message || "Error al desasignar");
    } finally {
      setToDelete(null);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose?.();
    setTimeout(() => {
      onAfterClose?.();
    }, 0);
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} keepMounted>
        <Box sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">Series asignadas</Typography>
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
          </Box>

          {series.length === 0 ? (
            <Typography variant="body2">No se encontraron series.</Typography>
          ) : (
            <List dense>
              {series.map((s, i) => (
                <React.Fragment key={`${s.NUMERO_SERIE}-${i}`}>
                  <ListItem
                    secondaryAction={
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => requestDelete(s)}
                        disabled={loading}
                      >
                        Desasignar
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={s.NUMERO_SERIE}
                      secondary={`Fecha: ${new Date(s.FECHA_ADICION).toLocaleDateString("es-EC", {
                        day: "2-digit", month: "2-digit", year: "numeric"
                      })}`}
                    />
                  </ListItem>
                  {i < series.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Modal>

      {/* Confirmación antes de desasignar */}
      <Dialog
        open={confirmOpen}
        onClose={cancelDelete}
        aria-labelledby="confirm-delete-title"
      >
        <DialogTitle id="confirm-delete-title">Confirmar</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Está seguro que desea desasignar esta serie
            {toDelete ? ` ${toDelete.NUMERO_SERIE}` : ""} del pedido?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Sí, desasignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback visual ✅ ❌ */}
      <Backdrop
        open={overlay.open}
        sx={{
          color: "#fff",
          zIndex: (t) => t.zIndex.modal + 10,
          flexDirection: "column"
        }}
      >
        {overlay.ok ? (
          <>
            <DoneIcon sx={{ fontSize: 96, color: "#00E676" }} />
            <Typography variant="h5" sx={{ mt: 1, color: "#00E676" }}>
              {overlay.message || "Éxito"}
            </Typography>
          </>
        ) : (
          <>
            <CloseIcon sx={{ fontSize: 96, color: "#FF1744" }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              {overlay.message || "Error"}
            </Typography>
          </>
        )}
      </Backdrop>

      {/* Loader durante peticiones */}
      <Backdrop
        open={loading}
        sx={{
          color: "#fff",
          zIndex: (t) => t.zIndex.modal + 8
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
