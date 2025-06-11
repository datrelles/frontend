import React, { useState, useEffect, useRef, useMemo } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

// --- Funciones auxiliares (fuera del componente para evitar re-declaración) ---
const calculateColSpan = (headerDef) => {
  if (headerDef.field) {
    return 1;
  }
  return headerDef.children.reduce(
    (sum, child) => sum + calculateColSpan(child),
    0
  );
};

const getFlatDataColumns = (headerDefs) => {
  let flatColumns = [];
  headerDefs.forEach((def) => {
    if (def.field) {
      flatColumns.push(def);
    } else if (def.children) {
      flatColumns = flatColumns.concat(getFlatDataColumns(def.children));
    }
  });
  return flatColumns;
};

// --- Definición de los estilos ---
const useStyles = makeStyles({
  headerCell: (props) => ({
    fontWeight: "bold",
    borderBottom: `1px solid #e0e0e0`,
    borderRight: `1px solid #e0e0e0`,
    textAlign: "center",
    verticalAlign: "middle",
    "&:last-child": {
      borderRight: "none",
    },
    cursor: props.hasClickableHeader ? "pointer" : "default",
    transition: "background-color 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: props.hasClickableHeader
        ? "rgba(0, 0, 0, 0.05)"
        : "inherit",
    },
    position: "sticky",
    zIndex: 10,
  }),
  dataCell: (props) => ({
    borderBottom: `1px solid #e0e0e0`,
    borderRight: `1px solid #e0e0e0`,
    textAlign: "center",
    verticalAlign: "middle",
    "&:last-child": {
      borderRight: "none",
    },
    cursor: props.hasClickableCell ? "pointer" : "default",
    transition: "background-color 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: props.hasClickableCell
        ? "rgba(0, 0, 0, 0.03)"
        : "inherit",
    },
    position: "sticky",
    zIndex: 1,
  }),
  editableInput: {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid #1976d2`,
    padding: "8px",
    borderRadius: "4px",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: "inherit",
    textAlign: "inherit",
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },
});

/**
 * Componente de tabla con columnas multinivel, edición en línea y columnas iniciales fijas.
 * La prop 'fixedColumnsCount' ahora se refiere al número de grupos/columnas de nivel superior a fijar.
 *
 * @param {Array<object>} props.data - Array de objetos de datos para el cuerpo de la tabla.
 * @param {Array<object>} props.columns - Array que define los encabezados y su estructura de agrupación.
 * @param {number} [props.fixedColumnsCount=0] - El número de grupos/columnas de nivel superior a mantener fijas.
 */
export default function MultiLevelTable({
  data,
  columns,
  fixedColumnsCount = 0,
}) {
  const flatDataColumns = getFlatDataColumns(columns);

  const hasClickableHeader = columns.some(
    (c) =>
      c.onClickHeader ||
      (c.children && c.children.some((child) => child.onClickHeader))
  );
  const hasClickableCell = flatDataColumns.some(
    (c) => c.onClickCell || c.onUpdateCell
  );

  const styleProps = useMemo(
    () => ({ hasClickableHeader, hasClickableCell }),
    [hasClickableHeader, hasClickableCell]
  );

  const classes = useStyles(styleProps);

  const DEFAULT_HEADER_COLOR = "#FF3A3A";

  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const headerCellRefs = useRef({});

  // --- NUEVA LÓGICA PARA COLUMNAS FIJAS POR GRUPO SUPERIOR ---
  // 1. Obtener las definiciones de columnas/grupos de nivel superior que serán fijas
  const fixedTopLevelColumnDefs = columns.slice(0, fixedColumnsCount);
  // 2. Obtener TODAS las columnas de datos planas que pertenecen a esos grupos/columnas fijas
  const allFixedFlatDataColumns = getFlatDataColumns(fixedTopLevelColumnDefs);
  // 3. Crear un Set para una búsqueda rápida de los 'field' de las columnas planas fijas
  const fixedFlatColumnFields = new Set(
    allFixedFlatDataColumns.map((c) => c.field)
  );

  // Función auxiliar para verificar si una columna de datos plana específica es fija
  const isFlatColumnFixed = (colDef) => fixedFlatColumnFields.has(colDef.field);
  // --- FIN NUEVA LÓGICA ---

  useEffect(() => {
    // Solo medimos y aplicamos si hay columnas fijas definidas (fixedColumnsCount > 0)
    if (fixedColumnsCount > 0) {
      const newWidths = {};
      // Iteramos solo sobre las columnas planas que se supone que son fijas
      allFixedFlatDataColumns.forEach((colDef) => {
        const ref = headerCellRefs.current[colDef.field];
        if (ref && ref.offsetWidth) {
          newWidths[colDef.field] = ref.offsetWidth;
        }
      });
      if (
        Object.keys(newWidths).length > 0 &&
        JSON.stringify(newWidths) !== JSON.stringify(columnWidths)
      ) {
        setColumnWidths(newWidths);
      }
    }
  }, [allFixedFlatDataColumns, fixedColumnsCount, columnWidths]); // Dependencias actualizadas

  // Función para calcular la posición 'left' de las celdas fijas
  const getStickyLeftPosition = (flatColIndex) => {
    const currentFlatColDef = flatDataColumns[flatColIndex];

    // Si la columna actual no es una de las que deben ser fijas, o fixedColumnsCount es 0, no es sticky
    if (fixedColumnsCount === 0 || !isFlatColumnFixed(currentFlatColDef)) {
      return "auto";
    }

    let left = 0;
    // Suma los anchos de TODAS las columnas planas PRECEDENTES que también son fijas
    for (let i = 0; i < flatColIndex; i++) {
      const prevColDef = flatDataColumns[i];
      if (isFlatColumnFixed(prevColDef)) {
        if (columnWidths[prevColDef.field]) {
          left += columnWidths[prevColDef.field];
        } else {
          left += 120; // Fallback para anchos no medidos aún
        }
      }
    }
    return `${left}px`;
  };

  // Función recursiva para obtener todas las filas de encabezado
  const getHeaderRows = (headerDefs) => {
    const rows = [];
    const maxDepth = getHeaderDepth(headerDefs);

    const fillRows = (defs, level = 0) => {
      if (!rows[level]) rows[level] = [];

      defs.forEach((def) => {
        const colSpan = calculateColSpan(def);
        const rowSpan = def.children ? 1 : maxDepth - level;

        const headerBgColor = def.bgColor || DEFAULT_HEADER_COLOR;
        const onClickHeader = def.onClickHeader || null;

        const containedFlatColumns = getFlatDataColumns([def]);
        const isCellSticky =
          containedFlatColumns.length > 0 &&
          containedFlatColumns.every(isFlatColumnFixed);

        let cellLeftPosition = "auto";
        if (isCellSticky) {
          const firstFixedFlatColInGroup =
            containedFlatColumns.find(isFlatColumnFixed);
          if (firstFixedFlatColInGroup) {
            const firstFixedFlatColIndex = flatDataColumns.findIndex(
              (c) => c.field === firstFixedFlatColInGroup.field
            );
            cellLeftPosition = getStickyLeftPosition(firstFixedFlatColIndex);
          }
        }

        rows[level].push(
          <TableCell
            key={`${def.header || def.field}-${level}`}
            colSpan={colSpan}
            rowSpan={rowSpan}
            align="center"
            className={classes.headerCell}
            style={{
              backgroundColor: headerBgColor,
              left: cellLeftPosition,
              ...(isCellSticky && { position: "sticky" }),
              ...(isCellSticky && { backgroundColor: headerBgColor }),
            }}
            {...(def.field && {
              ref: (el) => (headerCellRefs.current[def.field] = el),
            })}
            {...(onClickHeader && { onClick: onClickHeader })}
          >
            {def.header}
          </TableCell>
        );

        if (def.children) {
          fillRows(def.children, level + 1);
        }
      });
    };

    fillRows(headerDefs);

    return rows.map((row, idx) => (
      <TableRow key={`header-row-${idx}`}>{row}</TableRow>
    ));
  };

  // Función auxiliar: calcula profundidad máxima del encabezado
  const getHeaderDepth = (cols) => {
    return cols.reduce((max, col) => {
      if (col.children) {
        return Math.max(max, 1 + getHeaderDepth(col.children));
      }
      return Math.max(max, 1);
    }, 0);
  };

  if (flatDataColumns.length === 0) {
    return (
      <Paper>
        <p style={{ padding: "20px", textAlign: "center" }}>
          No se definieron columnas de datos.
        </p>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table
        aria-label="custom multi-level grouped table"
        style={{ minWidth: flatDataColumns.length * 120 }}
      >
        <TableHead>
          {getHeaderRows(columns)}
          {/* Llama a la función para renderizar los encabezados */}
        </TableHead>
        <TableBody>
          {/* <-- Mantenemos la corrección de validación aquí */}
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={flatDataColumns.length}
                align="center"
                className={classes.dataCell}
              >
                No hay datos para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {flatDataColumns.map((colDef, colIndex) => {
                  // colIndex es el índice plano de la columna actual
                  const onClickCell = colDef.onClickCell || null;
                  const onUpdateCell = colDef.onUpdateCell || null;

                  const isEditing =
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.field === colDef.field;

                  const handleCellClick = () => {
                    if (onUpdateCell) {
                      setEditingCell({ rowIndex, field: colDef.field });
                      setEditingValue(row[colDef.field]);
                    }
                    if (onClickCell && !onUpdateCell) {
                      onClickCell(row, colDef);
                    }
                  };

                  const handleKeyDown = (event) => {
                    if (event.key === "Enter") {
                      if (onUpdateCell) {
                        onUpdateCell(editingValue, row, colDef);
                      }
                      setEditingCell(null);
                    } else if (event.key === "Escape") {
                      setEditingCell(null);
                    }
                  };

                  const handleBlur = () => {
                    if (isEditing && onUpdateCell) {
                      setEditingCell(null);
                    }
                  };

                  // Determinar si la celda de datos actual debe ser sticky
                  const isCellSticky = isFlatColumnFixed(colDef);
                  const leftPosition = isCellSticky
                    ? getStickyLeftPosition(colIndex)
                    : "auto";

                  return (
                    <TableCell
                      key={colDef.field}
                      className={classes.dataCell}
                      style={{
                        left: leftPosition,
                        ...(isCellSticky && { position: "sticky" }),
                        backgroundColor: isCellSticky ? "#fafafa" : "inherit",
                      }}
                      {...(onClickCell || onUpdateCell
                        ? { onClick: handleCellClick }
                        : {})}
                    >
                      {isEditing && onUpdateCell ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleBlur}
                          className={classes.editableInput}
                          autoFocus
                        />
                      ) : (
                        row[colDef.field]
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
