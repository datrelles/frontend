import { Autocomplete, TextField } from "@mui/material";

export default function AutocompleteObject({
  id,
  value,
  valueId,
  shape,
  options,
  optionLabel,
  setValue,
}) {
  return (
    <Autocomplete
      id={id}
      options={value[valueId] ? options : [shape, ...options]}
      getOptionLabel={(option) => option[optionLabel]}
      value={value}
      onChange={(e, value) => {
        setValue(value ?? shape);
      }}
      isOptionEqualToValue={(option, value) =>
        option[valueId] === value?.[valueId]
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          margin="dense"
          required
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
