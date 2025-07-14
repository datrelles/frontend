import { MenuItem, TextField } from "@mui/material";
import { Enum } from "../common/enum";

export default function CustomSelect({
  label,
  options,
  value,
  onChange = null,
  disabled = !onChange,
  required = true,
  blankOption = true,
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
      {onChange && blankOption && (
        <MenuItem value="Seleccione">Seleccione</MenuItem>
      )}
      {Enum.values(options).map((option) => (
        <MenuItem
          disabled={option.disabled ?? false}
          key={option.key}
          value={option.key}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
