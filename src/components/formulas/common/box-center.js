import Box from "@mui/material/Box";
import React from "react";

export default function BoxCenter({ components }) {
  const keyPrefix = "box-center";
  return (
    <Box display="flex" justifyContent="center">
      {components.map((component, index) =>
        React.cloneElement(component, { key: `${keyPrefix}${index}` })
      )}
    </Box>
  );
}
