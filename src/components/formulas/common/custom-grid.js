import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

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
              type="text"
              placeholder={item.placeholder}
              fullWidth
              value={item.value}
              onChange={
                item.setValue ? (e) => item.setValue(e.target.value) : null
              }
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
}
