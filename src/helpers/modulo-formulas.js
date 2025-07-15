import { createTheme } from "@mui/material/styles";
import {
  ColoresHex,
  Enum,
  TiposRetorno,
} from "../components/formulas/common/enum";

export function validarTipoRetornoYConvertir(tipo_retorno, valor) {
  let parsedValue;
  if (valor === undefined || valor === null || valor === "") {
    throw new Error("No ingresó ningún valor");
  }
  switch (tipo_retorno) {
    case TiposRetorno.NUMERO:
      const numeroRegex = /^-?\d+(\.\d+)?$/;
      if (!numeroRegex.test(valor)) {
        throw new Error(`Número inválido: ${valor}`);
      }
      parsedValue = parseFloat(valor);
      if (Number.isNaN(parsedValue)) {
        throw new Error(`Número inválido: ${valor}`);
      }
      break;
    case TiposRetorno.FECHA:
      if (!validarFecha(valor)) {
        throw new Error(`Fecha inválida: : ${valor}`);
      }
      parsedValue = valor;
      break;
    case TiposRetorno.TEXTO:
      parsedValue = valor;
      break;
    default:
      throw new Error("Tipo de retorno inválido");
  }
  return parsedValue;
}

export function validarCedulaRUC(valor) {
  const regex = /^(?:\d{13}|\d{9}-\d|\d{10})$/;
  return regex.test(valor);
}

export function validarFecha(valor) {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!regex.test(valor)) return false;
  const [year, month, day] = valor.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

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

export function formatearSiNo(estado) {
  try {
    return parseInt(estado) ? "Sí" : "No";
  } catch (_) {
    return "No";
  }
}

export function formatearDinero(valor) {
  const formatoNumerico = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$ ${formatoNumerico.format(valor)}`;
}

export const obtenerNombreTipoRetorno = (retorno) =>
  Enum.getLabel(TiposRetorno, retorno);

export function obtenerNombreColorHex(hex) {
  const color = Enum.values(ColoresHex).find((color) => color.key === hex);
  return color?.label ?? "N/A";
}

export function obtenerValorColorHex(hex) {
  return `#${hex ?? "FFFFFF"}`;
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
