import { useState, useEffect, useRef } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TableTooltip from "./table-tooltip";

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
      if (!def.hidden) {
        flatColumns.push(def);
      }
    } else if (def.children) {
      flatColumns = flatColumns.concat(getFlatDataColumns(def.children));
    }
  });
  return flatColumns;
};

const getMaxDepth = (headers) => {
  let max = 1;
  headers.forEach((h) => {
    if (h.children) {
      max = Math.max(max, 1 + getMaxDepth(h.children));
    }
  });
  return max;
};

const useStyles = makeStyles({
  table: {
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  headerCellBase: {
    fontWeight: "bold",
    cursor: "default",
    transition: "background-color 0.2s ease-in-out",
    zIndex: 20,
    backgroundColor: "#FF3A3A",
    textAlign: "center",
  },
  clickableHeader: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.05)",
    },
  },
  dataCellBase: {
    cursor: "default",
    transition: "background-color 0.2s ease-in-out",
    position: "sticky",
    zIndex: 1,
    textAlign: "center",
  },
  clickableCell: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.03)",
    },
  },
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
    height: "500px",
    overflow: "auto",
    backgroundColor: "#ffffff",
  },
});

export default function MultiLevelTable({
  data,
  columns,
  fixedColumnsCount = 0,
}) {
  const flatDataColumns = getFlatDataColumns(columns);
  const classes = useStyles();
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const headerCellRefs = useRef({});
  const headerRowRefs = useRef({});
  const [headerRowHeights, setHeaderRowHeights] = useState([]);

  const visibleTopLevelColumns = columns.filter((col) => !col.hidden);
  const fixedTopLevelColumnDefs = visibleTopLevelColumns.slice(
    0,
    fixedColumnsCount
  );
  const allFixedFlatDataColumns = getFlatDataColumns(fixedTopLevelColumnDefs);
  const fixedFlatColumnFields = new Set(
    allFixedFlatDataColumns.map((c) => c.field)
  );

  const isFlatColumnFixed = (colDef) => fixedFlatColumnFields.has(colDef.field);

  useEffect(() => {
    if (fixedColumnsCount > 0) {
      const newWidths = {};
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
  }, [allFixedFlatDataColumns, fixedColumnsCount, columnWidths]);

  useEffect(() => {
    const heights = [];
    let currentHeight = 0;
    for (let i = 0; i < getMaxDepth(columns); i++) {
      const rowRef = headerRowRefs.current[`header-row-${i}`];
      if (rowRef) {
        heights[i] = currentHeight;
        currentHeight += rowRef.offsetHeight;
      }
    }
    if (JSON.stringify(heights) !== JSON.stringify(headerRowHeights)) {
      setHeaderRowHeights(heights);
    }
  }, [columns, headerRowHeights]);

  const getStickyLeftPosition = (flatColIndex) => {
    const currentFlatColDef = flatDataColumns[flatColIndex];
    if (fixedColumnsCount === 0 || !isFlatColumnFixed(currentFlatColDef)) {
      return "auto";
    }
    let left = 0;
    for (let i = 0; i < flatColIndex; i++) {
      const prevColDef = flatDataColumns[i];
      if (isFlatColumnFixed(prevColDef)) {
        left += columnWidths[prevColDef.field] || 120;
      }
    }
    return `${left}px`;
  };

  const getHeaderRows = (headers, level = 0, maxDepth = null) => {
    if (maxDepth === null) {
      maxDepth = getMaxDepth(headers);
    }
    const cells = [];
    const nextLevelHeaders = [];

    const currentTop = headerRowHeights[level] || 0;

    headers.forEach((header, headerIndex) => {
      if (header.hidden) return;
      const colSpan = calculateColSpan(header);
      const hasChildren = header.children && header.children.length > 0;
      const rowSpan = hasChildren ? 1 : maxDepth - level;
      const containedFlatColumns = getFlatDataColumns([header]);
      const isSticky =
        containedFlatColumns.length > 0 &&
        containedFlatColumns.every(isFlatColumnFixed);
      let left = "auto";
      if (isSticky) {
        const firstFixedFlatColInGroup =
          containedFlatColumns.find(isFlatColumnFixed);
        if (firstFixedFlatColInGroup) {
          const firstIndex = flatDataColumns.findIndex(
            (c) => c.field === firstFixedFlatColInGroup.field
          );
          left = getStickyLeftPosition(firstIndex);
        }
      }
      cells.push(
        <TableCell
          key={`${header.header || header.field} ${headerIndex}`}
          align="center"
          colSpan={colSpan}
          rowSpan={rowSpan}
          className={`${classes.headerCellBase} ${
            header.onClickHeader ? classes.clickableHeader : ""
          }`}
          style={{
            backgroundColor: header.bgColor || "#FF3A3A",
            position: "sticky",
            left: isSticky ? left : undefined,
            top: `${currentTop}px`,
            zIndex: isSticky ? 22 : 21,
            borderTop: `2px solid #000000`,
            borderRight: `2px solid #000000`,
            // Borde inferior: SOLO si no tiene hijos (es la última fila de la jerarquía)
            // O si rowSpan > 1 (es una celda que abarca múltiples filas hasta el final)
            // Si tiene hijos, su 'borderBottom' será el 'borderTop' de sus hijos, para evitar doble grosor.
            borderBottom:
              hasChildren && rowSpan === 1 ? `none` : `2px solid #000000`,
            "&:lastChild": {
              borderRight: `2px solid #e0e0e0`,
            },
            backgroundClip: "padding-box",
          }}
          {...(header.field && {
            ref: (el) => (headerCellRefs.current[header.field] = el),
          })}
          {...(header.onClickHeader && { onClick: header.onClickHeader })}
        >
          {header.header || header.field || ""}
        </TableCell>
      );
      if (hasChildren) {
        nextLevelHeaders.push(...header.children);
      }
    });

    if (nextLevelHeaders.length === 0) {
      return [
        <TableRow
          ref={(el) => (headerRowRefs.current[`header-row-${level}`] = el)}
          key={`header-row-${level}`}
        >
          {cells}
        </TableRow>,
      ];
    } else {
      return [
        <TableRow
          ref={(el) => (headerRowRefs.current[`header-row-${level}`] = el)}
          key={`header-row-${level}`}
        >
          {cells}
        </TableRow>,
        ...getHeaderRows(nextLevelHeaders, level + 1, maxDepth),
      ];
    }
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
        className={classes.table}
      >
        <TableHead>{getHeaderRows(columns)}</TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={flatDataColumns.length}
                align="center"
                className={classes.dataCellBase}
                style={{
                  borderBottom: `1px dashed #000000`,
                  backgroundColor: "#ffffff",
                  backgroundClip: "padding-box",
                  borderRight: `1px solid #000000`,
                  borderLeft: `1px solid #000000`,
                  borderTop: `2px solid #000000`,
                }}
              >
                No hay datos para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {flatDataColumns.map((colDef, colIndex) => {
                  const onClickCell = colDef.onClickCell || null;
                  const onUpdateCell = colDef.onUpdateCell || null;
                  const isEditing =
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.field === colDef.field;
                  const handleCellClick = () => {
                    if (onUpdateCell && (row.es_editable ?? true)) {
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
                  const isSticky = isFlatColumnFixed(colDef);
                  const leftPosition = isSticky
                    ? getStickyLeftPosition(colIndex)
                    : "auto";

                  // Definición del borde inferior de las celdas de datos
                  let borderBottomStyle = `1px dashed #000000`;
                  let borderTopStyle =
                    rowIndex === 0 ? `1px dashed #000000` : undefined;

                  // SIMULACIÓN DE BORDE DASHED CON BACKGROUND-IMAGE PARA CELDAS FIJAS
                  // Esto evita que las partes transparentes del borde dashed dejen ver el contenido de abajo
                  let customBackgroundForDashedBorder = {};
                  if (isSticky) {
                    // Para celdas fijas, el borde inferior se simula con un gradiente
                    // para evitar el efecto de "filtrado".
                    // El gradiente crea un patrón de líneas y espacios opacos.
                    borderBottomStyle = "none"; // Eliminamos el borde CSS nativo
                    customBackgroundForDashedBorder = {
                      backgroundImage: `repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)`, // Ajusta tamaño y color
                      backgroundSize: "100% 1px", // 1px de alto para la línea
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "bottom", // Colocar en la parte inferior
                    };

                    // Hacemos lo mismo para el borde superior si es la primera fila de datos y es fija
                    if (rowIndex === 0) {
                      borderTopStyle = "none";
                      customBackgroundForDashedBorder = {
                        ...customBackgroundForDashedBorder,
                        backgroundImage: `${
                          customBackgroundForDashedBorder.backgroundImage
                            ? customBackgroundForDashedBorder.backgroundImage +
                              ", "
                            : ""
                        }repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)`,
                        backgroundSize: `100% 1px, ${
                          customBackgroundForDashedBorder.backgroundSize ||
                          "100% 1px"
                        }`,
                        backgroundPosition: `top, ${
                          customBackgroundForDashedBorder.backgroundPosition ||
                          "bottom"
                        }`,
                        backgroundRepeat: `no-repeat`,
                      };
                    }
                  }

                  return (
                    <TableCell
                      key={colDef.field}
                      className={`${classes.dataCellBase} ${
                        onClickCell || onUpdateCell ? classes.clickableCell : ""
                      }`}
                      style={{
                        left: leftPosition,
                        position: isSticky ? "sticky" : undefined,
                        backgroundColor: isSticky ? "#fafafa" : "#ffffff",
                        zIndex: isSticky ? 11 : 1, // Z-index más alto para celdas de datos fijas
                        textAlign: "center",
                        borderBottom: borderBottomStyle,
                        borderRight: `1px solid #000000`,
                        borderLeft:
                          colIndex === 0 ? `1px solid #000000` : undefined,
                        borderTop: borderTopStyle,
                        backgroundClip: "padding-box",
                        // Aplicar la simulación de borde dashed con background-image si es necesario
                        ...customBackgroundForDashedBorder,
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
                        <TableTooltip title={row.tooltip}>
                          {row[colDef.field]}
                        </TableTooltip>
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
