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
  ListItemSecondaryAction,
  Chip,
  Stack,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import { getSeriesAntiguasPorSerie } from "../../services/dispatchApi"; // ajusta la ruta a donde tengas tus APIs

/**
 * SeriesAgeGate
 * 
 * Props:
 * - open: boolean -> si el gate debe activarse (ej. justo cuando capturas/escaneas la serie)
 * - numeroSerie: string -> la serie escaneada
 * - enterpriseShineray: number -> empresa (ej. 20)
 * - onProceed: (numeroSerie: string) => void -> continuar flujo normal de escaneo
 * - onCancel: () => void -> cancelar (no continuar)
 * 
 * Comportamiento:
 * - Cuando open === true y hay numeroSerie válido, consulta getSeriesAntiguasPorSerie.
 * - Si la respuesta es [], llama onProceed(numeroSerie) inmediatamente (no muestra UI).
 * - Si hay resultados, muestra un diálogo con la lista de series y sus edades.
 *   El usuario puede "Continuar" (onProceed) o "Cancelar" (onCancel).
 */
export default function SeriesAgeGate({
  open,
  numeroSerie,
  enterpriseShineray,
  onProceed,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // Normaliza y evita llamadas si no hay datos requeridos
  const canQuery = useMemo(() => {
    return Boolean(open && numeroSerie && String(numeroSerie).trim());
  }, [open, numeroSerie]);

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
        });

        if (cancelled) return;

        // Si no hay resultados, continuar flujo normal sin mostrar el diálogo
        if (!Array.isArray(data) || data.length === 0) {
          onProceed?.(String(numeroSerie).trim());
          return;
        }

        // Orden sugerido: mayores EDAD_DIAS primero, luego por bodega
        const sorted = [...data].sort((a, b) => {
          const d = Number(b.EDAD_DIAS || 0) - Number(a.EDAD_DIAS || 0);
          if (d !== 0) return d;
          return String(a.NOMBRE || "").localeCompare(String(b.NOMBRE || ""));
        });

        setRows(sorted);
      } catch (e) {
        setError(e?.message || "No se pudo consultar las series antiguas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [canQuery, numeroSerie, enterpriseShineray, onProceed]);

  // Si no hay nada que mostrar (porque no hubo resultados), el diálogo puede permanecer montado pero cerrado
  const showDialog = open && rows.length > 0;

  return (
    <Dialog open={showDialog} fullWidth maxWidth="md" onClose={onCancel}>
      <DialogTitle>antigüedad de series</DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Stack alignItems="center" py={2}>
            <CircularProgress size={28} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Consultando series antiguas para: <b>{String(numeroSerie || "")}</b>
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
            <Typography variant="body2" sx={{ mb: 1 }}>
              Serie escaneada: <b>{String(numeroSerie || "")}</b>
            </Typography>

            <Divider sx={{ mb: 1 }} />

            <List dense disablePadding>
              {rows.map((r, idx) => (
                <React.Fragment key={`${r.NUMERO_SERIE}-${r.COD_BODEGA}-${idx}`}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                        <Stack direction="row" spacing={1} alignItems="center"  sx={{ mt: 0.5 }}>
                          <Tooltip title="Edad total (días) del ítem en inventario">
                            <Chip size="small" label={`Edad: ${r.EDAD_DIAS ?? 0} días`} />
                          </Tooltip>
                          <Tooltip title="Edad (días) de la serie actualmente considerada">
                            <Chip size="small" label={`serie actual: ${r.EDAD_SERIE_ACTUAL ?? 0} días`} />
                          </Tooltip>
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
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onProceed?.(String(numeroSerie || "").trim())}
        >
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
