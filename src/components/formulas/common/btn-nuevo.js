import Button from "@mui/material/Button";
import AddIcon from "@material-ui/icons/Add";

export default function BtnNuevo({
  onClick,
  disabled = false,
  texto = "Nuevo",
  icon = true,
}) {
  return (
    <Button
      disabled={disabled}
      style={{
        marginBottom: "10px",
        marginTop: "10px",
        backgroundColor: "firebrick",
        color: "white",
        borderRadius: "5px",
        marginRight: "15px",
      }}
      onClick={onClick}
    >
      {icon ? <AddIcon /> : null} {texto}
    </Button>
  );
}
