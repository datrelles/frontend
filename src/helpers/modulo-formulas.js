import { createTheme } from "@mui/material/styles";

export function formatearFecha(fecha) {
  const fechaF = new Date(fecha);
  const day = String(fechaF.getDate()).padStart(2, "0");
  const month = String(fechaF.getMonth() + 1).padStart(2, "0");
  const year = fechaF.getFullYear();
  const hour = String(fechaF.getHours()).padStart(2, "0");
  const minute = String(fechaF.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${minute}`;
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
