import { TiposSeleccionTabla } from "./enum";

export function createEmptyItem(xs, id) {
  return {
    xs,
    id,
    customComponent: <></>,
  };
}

function createMultiline(rows) {
  return {
    multiline: true,
    rows,
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
  type = "text",
  rows = null
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
    multiline: rows ? createMultiline(rows) : {},
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

export function createTableFeatures(
  search = true,
  download = true,
  print = true,
  viewColumns = true,
  filter = true,
  pagination = true
) {
  return Object.fromEntries(
    Object.entries({
      search,
      download,
      print,
      viewColumns,
      filter,
      pagination,
    }).filter(([key, value]) => value === false)
  );
}

export function createTableOptions(
  onRowClick,
  onRowsDelete = null,
  selectable = TiposSeleccionTabla.SINGLE.key,
  onRowSelectionChange = null,
  customToolbarSelect = null,
  features = createTableFeatures()
) {
  return {
    responsive: "standard",
    selectableRows: selectable,
    onRowClick,
    ...(onRowsDelete && { onRowsDelete }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    ...(customToolbarSelect && { customToolbarSelect }),
    ...features,
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: (column) => `Ordenar por ${column.label}`,
      },
      selectedRows: {
        text: "fila(s) seleccionada(s)",
        delete: "Borrar",
        deleteAria: "Borrar fila seleccionada",
      },
      toolbar: {
        search: "Buscar",
        downloadCsv: "Descargar CSV",
        print: "Imprimir",
        viewColumns: "Ver columnas",
        filterTable: "Filtrar tabla",
      },
      viewColumns: {
        title: "Mostrar columnas",
        titleAria: "Mostrar/Ocultar columnas de tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "REINICIAR",
      },
      pagination: {
        next: "Siguiente",
        previous: "Anterior",
        rowsPerPage: "Filas por página:",
        displayRows: "de",
      },
    },
  };
}

export function createDefaultSetter(setter, isCheck = false, toUpper = false) {
  return (e) => {
    const result = e.target[isCheck ? "checked" : "value"];
    setter(toUpper ? result.toUpperCase() : result);
  };
}
