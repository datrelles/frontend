import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function CustomDialog({
  titulo,
  contenido,
  open,
  handleClose,
  handleCancel,
  cancelText = "Cancelar",
  handleConfirm = null,
  confirmText = "Crear",
  maxWidth = "sm",
}) {
  return (
    <Dialog open={open} onClose={handleClose} {...{ maxWidth }} fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>{contenido}</DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          {cancelText}
        </Button>
        {handleConfirm && (
          <Button
            onClick={handleConfirm}
            style={{
              marginBottom: "10px",
              marginTop: "10px",
              backgroundColor: "firebrick",
              color: "white",
              height: "30px",
              width: "100px",
              borderRadius: "5px",
              marginRight: "15px",
            }}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
