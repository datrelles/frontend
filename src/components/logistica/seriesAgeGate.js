// src/components/logistica/seriesAgeGate.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
  LinearProgress,
  Backdrop,
} from "@mui/material";
import { toast } from "react-toastify";
import { getSeriesAntiguasPorSerie } from "../../services/dispatchApi";

export default function SeriesAgeGate({
  open,
  numeroSerie,
  enterpriseShineray,
  bodega, // <-- importante para validar disponible/reserva en backend
  onProceed,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  // Solo consultar si tenemos open, serie y bodega válida
  const canQuery = useMemo(() => {
    return Boolean(
      open &&
        numeroSerie &&
        String(numeroSerie).trim() &&
        Number.isFinite(Number(bodega))
    );
  }, [open, numeroSerie, bodega]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!canQuery) return;

      setLoading(true);
      setError("");
      setRows([]);

      try {
        const data = await getSeriesAntiguasPorSerie({
          numero_serie: String(numeroSerie).trim(),
          empresa: Number(enterpriseShineray),
          bodega: Number(bodega),
        });

        if (cancelled) return;

        // Si no hay series antiguas, continuar sin abrir diálogo
        if (!Array.isArray(data) || data.length === 0) {
          onProceed?.(String(numeroSerie).trim(), undefined);
          return;
        }

        const sorted = [...data].sort((a, b) => {
          const d = Number(b.EDAD_DIAS || 0) - Number(a.EDAD_DIAS || 0);
          if (d !== 0) return d;
          return String(a.NOMBRE || "").localeCompare(String(b.NOMBRE || ""));
        });

        setRows(sorted);
      } catch (e) {
        const status = e.message;
        const msg =e.message;

        // Para 4xx (ej: 409 "No existe Disponibilida ni reserva"): toast y cerrar el gate
        if (msg) {
          toast.error(msg, {
            position: "top-right",
            autoClose: 4000,
            theme: "colored",
            closeOnClick: true,
            pauseOnHover: true,
          });
          setRows([]);
          setError("");
          onCancel?.();
          return;
        }

        // Otros errores (500/red) se muestran dentro del diálogo
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [canQuery, numeroSerie, bodega, enterpriseShineray, onProceed, onCancel]);

  // Mostrar diálogo solo si hay filas (series antiguas)
  const showDialog = open && rows.length > 0;

  // Edad de la serie actual (el backend la incluye en la 1ra fila)
  const currentSeriesDays =
    rows.length > 0 ? Number(rows[0]?.EDAD_SERIE_ACTUAL ?? 0) : null;

  const formatProdDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  return (
    <>
      {/* Backdrop global durante consulta, incluso si el diálogo aún no aparece */}
      <Backdrop
        open={!!open && loading}
        sx={{
          color: "#fff",
          zIndex: (t) => t.zIndex.modal + 1,
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Consultando series antiguas para:{" "}
          <b>{String(numeroSerie || "")}</b>
        </Typography>
      </Backdrop>

      <Dialog open={showDialog} fullWidth maxWidth="md" onClose={onCancel}>
        <DialogTitle>Antigüedad de series</DialogTitle>

        {/* Barra de progreso superior mientras loading */}
        {loading && <LinearProgress />}

        <DialogContent dividers>
          {loading && (
            <Stack alignItems="center" py={2}>
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Consultando series antiguas para:{" "}
                <b>{String(numeroSerie || "")}</b>
              </Typography>
            </Stack>
          )}

          {!!error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1 }}
                flexWrap="wrap"
              >
                <Typography variant="body2">
                  Serie escaneada: <b>{String(numeroSerie || "")}</b>
                </Typography>

                {currentSeriesDays !== null && (
                  <Typography variant="body2">
                    Edad: {currentSeriesDays} días
                  </Typography>
                )}
              </Stack>

              <Divider sx={{ mb: 1 }} />

              <List dense disablePadding>
                {rows.map((r, idx) => (
                  <React.Fragment
                    key={`${r.NUMERO_SERIE}-${r.COD_BODEGA}-${idx}`}
                  >
                    <ListItem alignItems="flex-start" disableGutters>
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {r.NUMERO_SERIE}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              · {r.COD_PRODUCTO}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              · Bodega: ({r.NOMBRE})
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            <Tooltip title="Edad total (días) del ítem en inventario">
                              <Chip
                                size="small"
                                label={`Edad: ${r.EDAD_DIAS ?? 0} días`}
                              />
                            </Tooltip>

                            {r.FECHA_PRODUCCION && (
                              <Tooltip title="Fecha de producción">
                                <Chip
                                  size="small"
                                  label={`Prod: ${formatProdDate(
                                    r.FECHA_PRODUCCION
                                  )}`}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                    {idx < rows.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} disabled={loading || saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => setCommentOpen(true)}
            disabled={loading || saving}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de comentario */}
      <Dialog
        open={commentOpen}
        fullWidth
        maxWidth="sm"
        onClose={() => !saving && setCommentOpen(false)}
      >
        <DialogTitle>OBSERVACIÓN</DialogTitle>
        {saving && <LinearProgress />}

        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography variant="body2">Motivo de asignación de serie:</Typography>
            <Typography variant="body2">
              <b>{String(numeroSerie || "")}</b>
            </Typography>

            <Divider sx={{ my: 1 }} />

            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              label="Escribe tu comentario"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={saving}
            />
            {!!error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button disabled={saving} onClick={() => setCommentOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={saving || !String(comment).trim()}
            onClick={async () => {
              try {
                setSaving(true);
                setCommentOpen(false);
                onProceed?.(String(numeroSerie || "").trim(), String(comment).trim());
              } catch (e) {
                setError(e?.message || "No se pudo continuar.");
              } finally {
                setSaving(false);
              }
            }}
            startIcon={saving ? <CircularProgress size={18} thickness={5} /> : null}
          >
            {saving ? "ASIGNANDO…" : "ASIGNAR"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
