import { Tooltip, Typography, Box } from "@mui/material";

export default function CustomTooltip({ texto, maxLength = 30 }) {
  texto = texto ?? "";
  const trimmed =
    texto.length > maxLength ? texto.substring(0, maxLength) + "..." : null;
  const typo = (
    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
      {trimmed ?? texto}
    </Typography>
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {trimmed ? (
        <Tooltip
          title={
            <Typography sx={{ whiteSpace: "pre-line" }}>{texto}</Typography>
          }
          arrow
          placement="top"
        >
          {typo}
        </Tooltip>
      ) : (
        typo
      )}
    </Box>
  );
}
