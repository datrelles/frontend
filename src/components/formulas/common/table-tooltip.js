import { Tooltip, Typography } from "@mui/material";

export default function TableTooltip({ title, children }) {
  const hasTooltip = Boolean(title?.trim());

  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    cursor: hasTooltip ? "default" : "inherit",
  };

  const content = <div style={containerStyle}>{children}</div>;

  return hasTooltip ? (
    <Tooltip
      title={
        <Typography sx={{ whiteSpace: "pre-line", fontSize: "0.75rem" }}>
          {title}
        </Typography>
      }
      arrow
      placement="right"
      enterDelay={0}
      enterNextDelay={0}
      disableInteractive
      followCursor={false}
    >
      <span style={{ display: "inline-block", width: "100%", height: "100%" }}>
        {content}
      </span>
    </Tooltip>
  ) : (
    content
  );
}
