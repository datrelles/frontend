import { Modal, Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingModal({
  esVisible,
  mensaje = "Procesando solicitud",
}) {
  return (
    <Modal
      open={esVisible}
      disableEscapeKeyDown
      disableAutoFocus
      aria-labelledby="loading-modal"
      aria-describedby="loading-indicator"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={3}
        borderRadius={2}
        bgcolor="white"
        boxShadow={3}
        minWidth={250}
      >
        <CircularProgress style={{ color: "red" }} />
        <Typography variant="body1" mt={2} color="textPrimary">
          {mensaje}
        </Typography>
      </Box>
    </Modal>
  );
}
