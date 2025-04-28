import Box from "@mui/material/Box";

export default function BoxMasterDetail({ master, detail }) {
  return (
    <Box sx={{ display: "flex", gap: 4 }}>
      <Box sx={{ flex: 1 }}>{master}</Box>
      <Box sx={{ flex: 1 }}>{detail}</Box>
    </Box>
  );
}
