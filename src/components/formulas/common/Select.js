import { MenuItem, TextField } from "@mui/material";

export default function Select({ label, value, setValue, options }) {
  return (
    <TextField
      required
      select
      label={label}
      fullWidth
      margin="dense"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      <MenuItem value="Seleccione">Seleccione</MenuItem>
      {options.map((t) => (
        <MenuItem key={t} value={t}>
          {t}
        </MenuItem>
      ))}
    </TextField>
  );
}
