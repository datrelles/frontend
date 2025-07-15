import { Autocomplete, TextField } from "@mui/material";

export default function AutocompleteObject({
  id,
  value,
  optionId,
  shape,
  options,
  optionLabel,
  onChange,
  disabled = false,
  required = true,
  customFilter = null,
}) {
  return (
    <Autocomplete
      disabled={disabled}
      id={id}
      options={value[optionId] ? options : [shape, ...options]}
      getOptionLabel={(option) => option[optionLabel]}
      value={value}
      onChange={onChange}
      isOptionEqualToValue={(option, value) =>
        option[optionId] === value?.[optionId]
      }
      {...(customFilter && { filterOptions: customFilter })}
      fullWidth
      renderOption={(props, option) => (
        <li {...props} key={option[optionId]}>
          {option[optionLabel]}
        </li>
      )}
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
