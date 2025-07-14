import Button from "@mui/material/Button";

export default function BtnCancelar({
  onClick,
  disabled = false,
  texto = "Cancelar",
}) {
  return (
    <Button disabled={disabled} color="primary" onClick={onClick}>
      {texto}
    </Button>
  );
}
