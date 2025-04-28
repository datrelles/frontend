import { MenuItem, TextField } from "@mui/material";

export default function CustomSelect({
  label,
  options,
  value,
  onChange = null,
  disabled = !onChange,
  required = true,
}) {
  return (
    <TextField
      disabled={disabled}
      required={required}
      select
      label={label}
      fullWidth
      margin="dense"
      value={value}
      onChange={onChange ?? null}
    >
      {onChange && <MenuItem value="Seleccione">Seleccione</MenuItem>}
      {options.map((option) => (
        <MenuItem
          disabled={option.disabled ?? false}
          key={option.value}
          value={option.value}
        >
          {option.label ?? option.value}
        </MenuItem>
      ))}
    </TextField>
  );
}
