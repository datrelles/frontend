import { FormControlLabel, Checkbox } from "@mui/material";

export default function Check({ label, checked, setChecked }) {
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
            onChange={
              setChecked
                ? (e) => {
                    setChecked(e.target.checked);
                  }
                : null
            }
          />
        }
        label={label}
      />
    </div>
  );
}
