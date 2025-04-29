import { FormControlLabel, Checkbox } from "@mui/material";

export default function Check({ label, checked, onChange = null }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            label={label}
            checked={checked}
            onChange={onChange ?? null}
          />
        }
        label={label}
      />
    </div>
  );
}
