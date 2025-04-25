import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import { IconButton, Tooltip } from "@mui/material";

function CustomIcon({ icon }) {
  switch (icon) {
    case "eliminar":
      return <DeleteIcon />;
    case "calculo":
      return <CalculateIcon />;
    default:
      return <></>;
  }
}

function CustomIconButton({ onClick, icon }) {
  return <IconButton onClick={onClick}>{CustomIcon({ icon })}</IconButton>;
}

export default function CustomSelectToolbar({ tooltips }) {
  return (
    <>
      {tooltips.map((tooltip) => (
        <Tooltip title={tooltip.title}>
          <CustomIconButton onClick={tooltip.onClick} icon={tooltip.icon} />
        </Tooltip>
      ))}
    </>
  );
}
