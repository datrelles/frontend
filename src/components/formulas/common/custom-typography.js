import { Typography } from "@mui/material";

export default function CustomTypography({ variant, sx = { mb: 2 }, texto }) {
  return (
    <Typography variant={variant} sx={sx}>
      {texto}
    </Typography>
  );
}
