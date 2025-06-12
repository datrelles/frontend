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

// --- Definición de estilos ---
const useStyles = makeStyles({
  headerCellBase: {
    fontWeight: "bold",
    borderTop: `2px solid #000000`,
    borderBottom: `2px solid #000000`,
    borderRight: `2px solid #000000`,
    "&:last-child": {
      borderRight: `2px solid #e0e0e0`,
    },
    cursor: "default",
    transition: "background-color 0.2s ease-in-out",
    position: "sticky",
    zIndex: 10,
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
    borderBottom: `1px dashed #000000`,
    borderRight: `1px solid #000000`,
    "&:last-child": {
      borderRight: "none",
    },
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
    overflowX: "auto",
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

  // --- Sticky columns logic ---
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

  // --- Función getHeaderRows corregida con rowspan y sticky ---
  const getHeaderRows = (headers, level = 0, maxDepth = null) => {
    if (maxDepth === null) {
      maxDepth = getMaxDepth(headers);
    }

    const cells = [];
    const nextLevelHeaders = [];

    headers.forEach((header, headerIndex) => {
      if (header.hidden) return;
      const colSpan = calculateColSpan(header);
      const hasChildren = header.children && header.children.length > 0;
      const rowSpan = hasChildren ? 1 : maxDepth - level;

      // Sticky y left si corresponde
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
            backgroundColor: header.bgColor,
            position: isSticky ? "sticky" : undefined,
            left: isSticky ? left : undefined,
            zIndex: isSticky ? 11 : undefined,
          }}
          {...(header.field && {
            ref: (el) => (headerCellRefs.current[header.field] = el),
          })}
          {...(header.onClickHeader && { onClick: header.onClickHeader })}
        >
          {header.header}
        </TableCell>
      );

      if (hasChildren) {
        nextLevelHeaders.push(...header.children);
      }
    });

    if (nextLevelHeaders.length === 0) {
      return [<TableRow key={`header-row-${level}`}>{cells}</TableRow>];
    } else {
      return [
        <TableRow key={`header-row-${level}`}>{cells}</TableRow>,
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
        style={{ minWidth: flatDataColumns.length * 120 }}
      >
        <TableHead>{getHeaderRows(columns)}</TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={flatDataColumns.length}
                align="center"
                className={classes.dataCellBase}
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

                  return (
                    <TableCell
                      key={colDef.field}
                      className={`${classes.dataCellBase} ${
                        onClickCell || onUpdateCell ? classes.clickableCell : ""
                      }`}
                      style={{
                        left: leftPosition,
                        position: isSticky ? "sticky" : undefined,
                        backgroundColor: isSticky ? "#fafafa" : "inherit",
                        zIndex: isSticky ? 5 : undefined,
                        textAlign: "center",
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
