import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { formatearFechaInput } from "../../../helpers/modulo-formulas";

export default function CustomGrid({ items }) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.id} item xs={item.xs}>
          {item.custom_component || (
            <TextField
              required={item.required}
              disabled={item.disabled}
              margin="dense"
              id={item.id}
              label={item.label}
              type={item.type}
              placeholder={item.placeholder}
              fullWidth
              value={
                item.type === "date"
                  ? formatearFechaInput(item.value)
                  : item.value
              }
              InputLabelProps={item.type === "date" ? { shrink: true } : {}}
              onChange={item.setValue ?? null}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
}
