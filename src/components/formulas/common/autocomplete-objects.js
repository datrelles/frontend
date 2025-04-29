import { Autocomplete, TextField } from "@mui/material";

export default function AutocompleteObject({
  id,
  value,
  valueId,
  shape,
  options,
  optionLabel,
  onChange,
  disabled = false,
  required = true,
}) {
  return (
    <Autocomplete
      disabled={disabled}
      id={id}
      options={value[valueId] ? options : [shape, ...options]}
      getOptionLabel={(option) => option[optionLabel]}
      value={value}
      onChange={onChange}
      isOptionEqualToValue={(option, value) =>
        option[valueId] === value?.[valueId]
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          margin="dense"
          required={required}
          label={id}
          type="text"
          className="form-control"
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
}
