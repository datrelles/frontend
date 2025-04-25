import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DataUsageIcon from "@mui/icons-material/DataUsage";

function CustomIcon({ icon }) {
  switch (icon) {
    case "delete":
      return <DeleteIcon />;
    case "calculate":
      return <CalculateIcon />;
    case "edit":
      return <EditIcon />;
    case "data":
      return <DataUsageIcon />;
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
