import { tiposSeleccionTabla } from "./enum";

export function createEmptyItem(xs, id) {
  return {
    xs,
    id,
    customComponent: <></>,
  };
}

export function createTextFieldItem(
  xs,
  id,
  label,
  value,
  setValue = null,
  required = true,
  placeholder = "",
  disabled = !setValue,
  type = "text"
) {
  return {
    xs,
    id,
    label,
    value,
    setValue,
    required,
    placeholder,
    disabled,
    type,
  };
}

export function createCustomComponentItem(xs, id, customComponent) {
  return {
    xs,
    id,
    customComponent,
  };
}

export function createCustomTooltip(title, onClick, icon) {
  return {
    title,
    onClick,
    icon,
  };
}

export function createCustomListItem(id, gridItems) {
  return { id, gridItems };
}

export function createTableOptions(
  onRowClick,
  onRowsDelete = null,
  selectable = tiposSeleccionTabla.SINGLE.key,
  onRowSelectionChange = null,
  customToolbarSelect = null
) {
  return {
    responsive: "standard",
    selectableRows: selectable,
    onRowClick,
    ...(onRowsDelete && { onRowsDelete }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    ...(customToolbarSelect && { customToolbarSelect }),
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: (column) => `Ordenar por ${column.label}`,
      },
      pagination: {
        next: "Siguiente",
        previous: "Anterior",
        rowsPerPage: "Filas por página:",
        displayRows: "de",
      },
      toolbar: {
        search: "Buscar",
        downloadCsv: "Descargar CSV",
        print: "Imprimir",
        viewColumns: "Ver columnas",
        filterTable: "Filtrar tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "REINICIAR",
      },
      viewColumns: {
        title: "Mostrar columnas",
        titleAria: "Mostrar/Ocultar columnas de tabla",
      },
      selectedRows:
        selectable === tiposSeleccionTabla.NONE.key
          ? {}
          : {
              text: "fila(s) seleccionada(s)",
              delete: "Borrar",
              deleteAria: "Borrar fila seleccionada",
            },
    },
  };
}

export function createDefaultSetter(setter, isCheck = false) {
  return (e) => setter(e.target[isCheck ? "checked" : "value"]);
}
