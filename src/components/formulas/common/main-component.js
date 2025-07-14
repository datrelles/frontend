import React from "react";

export default function MainComponent({ components }) {
  const keyPrefix = "comp";
  return (
    <div
      style={{
        marginTop: "150px",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      {components.map((component, index) =>
        React.cloneElement(component, { key: `${keyPrefix}${index}` })
      )}
    </div>
  );
}
