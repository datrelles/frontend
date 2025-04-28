import { createTheme } from "@mui/material/styles";

export function formatearFechaHora(valor) {
  let fecha = new Date(valor);
  if (isNaN(fecha.getTime())) {
    console.log(`Error formatearFecha: ${valor}`);
    fecha = new Date();
  }
  const day = String(fecha.getUTCDate()).padStart(2, "0");
  const month = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const year = fecha.getUTCFullYear();
  const hour = String(fecha.getUTCHours()).padStart(2, "0");
  const minute = String(fecha.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function formatearFechaInput(valor) {
  if (!valor) return "";
  let fecha = new Date(valor);
  if (isNaN(fecha.getTime())) {
    console.log(`Error formatearFechaInput: ${valor}`);
    fecha = new Date();
  }
  return fecha.toISOString().split("T")[0];
}

export function formatearEstado(estado, terminacion = "o") {
  try {
    return parseInt(estado) ? `Activ${terminacion}` : `Inactiv${terminacion}`;
  } catch (_) {
    return `Inactiv${terminacion}`;
  }
}

export function createMuiTheme() {
  return createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            paddingLeft: "3px",
            paddingRight: "3px",
            paddingTop: "0px",
            paddingBottom: "0px",
            backgroundColor: "#00000",
            whiteSpace: "nowrap",
            flex: 1,
            borderBottom: "1px solid #ddd",
            borderRight: "1px solid #ddd",
            fontSize: "14px",
          },
          head: {
            backgroundColor: "firebrick",
            color: "#ffffff",
            fontWeight: "bold",
            paddingLeft: "0px",
            paddingRight: "0px",
            fontSize: "12px",
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: "collapse",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            borderBottom: "5px solid #ddd",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          regular: {
            minHeight: "10px",
          },
        },
      },
    },
  });
}
