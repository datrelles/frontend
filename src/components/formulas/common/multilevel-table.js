import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
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

export const getFlatDataColumns = (headerDefs) => {
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
    tableLayout: "auto",
  },
  headerCellBase: {
    fontWeight: "bold",
    cursor: "default",
    transition: "background-color 0.2s ease-in-out",
    zIndex: 20,
    textAlign: "center",
    fontSize: "clamp(0.55rem, 1.25vw, 0.8rem)",
    padding: "clamp(1px, 0.5vw, 3px) clamp(3px, 0.9vw, 7px)",
    lineHeight: "1.2",
    "&.vertical-header": {
      height: "120px",
      minWidth: "30px",
      padding: "0",
      position: "relative",
      overflow: "hidden",
    },
  },
  verticalText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-90deg)",
    transformOrigin: "center center",
    whiteSpace: "normal",
    width: "calc(120px - 2 * clamp(1px, 0.5vw, 3px))",
    height: "auto",
    textAlign: "center",
    boxSizing: "border-box",
    padding: "clamp(1px, 0.5vw, 3px) 0",
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
    zIndex: 1,
    textAlign: "center",
    fontSize: "clamp(0.55rem, 1.25vw, 0.8rem)",
    padding: "clamp(1px, 0.4vw, 3px) clamp(3px, 0.7vw, 7px)",
    whiteSpace: "nowrap",
    height: "30px",
    minHeight: "30px",
    maxHeight: "30px",
    lineHeight: "30px",
    boxSizing: "border-box",
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
    padding: "4px 8px",
    borderRadius: "4px",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: "inherit",
    textAlign: "inherit",
    minHeight: "25px",
    lineHeight: "normal",
  },
  tableContainer: {
    width: "100%",
    overflow: "auto",
    backgroundColor: "#ffffff",
  },
  highlightedCell: {
    backgroundColor: "#FF0000 !important",
    color: "white !important",
  },
});

const ROW_HEIGHT = 30;
const OVERSCAN_COUNT = 5;

const findParentHeaders = (headers, targetField, parents = []) => {
  for (const header of headers) {
    if (header.field === targetField) {
      return [header, ...parents];
    }
    if (header.children) {
      const found = findParentHeaders(header.children, targetField, [
        header,
        ...parents,
      ]);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export default function MultiLevelTable({
  data,
  columns,
  fixedColumnsCount = 0,
}) {
  const classes = useStyles();
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const headerCellRefs = useRef({});
  const headerRowRefs = useRef({});
  const [headerRowHeights, setHeaderRowHeights] = useState([]);
  const tableContainerRef = useRef(null);
  const [tableHeight, setTableHeight] = useState("500px");
  const [hoveredCell, setHoveredCell] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);

  const flatDataColumns = useMemo(() => getFlatDataColumns(columns), [columns]);

  const visibleTopLevelColumns = useMemo(
    () => columns.filter((col) => !col.hidden),
    [columns]
  );
  const fixedTopLevelColumnDefs = useMemo(
    () => visibleTopLevelColumns.slice(0, fixedColumnsCount),
    [visibleTopLevelColumns, fixedColumnsCount]
  );
  const allFixedFlatDataColumns = useMemo(
    () => getFlatDataColumns(fixedTopLevelColumnDefs),
    [fixedTopLevelColumnDefs]
  );
  const fixedFlatColumnFields = useMemo(
    () => new Set(allFixedFlatDataColumns.map((c) => c.field)),
    [allFixedFlatDataColumns]
  );

  const isFlatColumnFixed = (colDef) => fixedFlatColumnFields.has(colDef.field);

  useLayoutEffect(() => {
    const calculateAndSetTableHeight = () => {
      if (tableContainerRef.current) {
        const rect = tableContainerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top;
        setTableHeight(`${availableHeight}px`);
      }
    };

    calculateAndSetTableHeight();
    window.addEventListener("resize", calculateAndSetTableHeight);

    return () => {
      window.removeEventListener("resize", calculateAndSetTableHeight);
    };
  }, [columns, data]);

  useEffect(() => {
    if (fixedColumnsCount > 0) {
      const updateColumnWidths = () => {
        const newWidths = {};
        let needsUpdate = false;
        allFixedFlatDataColumns.forEach((colDef) => {
          const ref = headerCellRefs.current[colDef.field];
          if (ref && ref.offsetWidth) {
            const currentWidth = Math.round(ref.offsetWidth);
            if (newWidths[colDef.field] !== currentWidth) {
              newWidths[colDef.field] = currentWidth;
              needsUpdate = true;
            }
          }
        });

        if (
          needsUpdate ||
          Object.keys(newWidths).length !== Object.keys(columnWidths).length
        ) {
          setColumnWidths(newWidths);
        }
      };

      updateColumnWidths();
      const timeoutId = setTimeout(updateColumnWidths, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [allFixedFlatDataColumns, fixedColumnsCount]);

  useLayoutEffect(() => {
    const heights = [];
    let currentHeight = 0;
    const maxDepth = getMaxDepth(columns);
    for (let i = 0; i < maxDepth; i++) {
      const rowRef = headerRowRefs.current[`header-row-${i}`];
      if (rowRef) {
        heights[i] = Math.round(currentHeight);
        currentHeight += Math.round(rowRef.offsetHeight);
      }
    }

    const heightsChanged =
      heights.length !== headerRowHeights.length ||
      heights.some((h, i) => h !== headerRowHeights[i]);

    if (heightsChanged) {
      setHeaderRowHeights(heights);
    }
  }, [columns]);

  const getStickyLeftPosition = (flatColIndex) => {
    const currentFlatColDef = flatDataColumns[flatColIndex];
    if (fixedColumnsCount === 0 || !isFlatColumnFixed(currentFlatColDef)) {
      return "auto";
    }
    let left = 0;
    for (let i = 0; i < flatColIndex; i++) {
      const prevColDef = flatDataColumns[i];
      if (isFlatColumnFixed(prevColDef)) {
        left += columnWidths[prevColDef.field] || 0;
      }
    }
    return `${left}px`;
  };

  const getAbsoluteFlatColumnIndex = (header) => {
    const flatColumnsUnderHeader = getFlatDataColumns([header]);
    if (flatColumnsUnderHeader.length === 0) return -1;

    return flatDataColumns.findIndex(
      (flatCol) => flatCol.field === flatColumnsUnderHeader[0].field
    );
  };

  const isHeaderHighlighted = (header, hoveredColIndex, hoveredColField) => {
    if (!hoveredColField) return false;
    const path = findParentHeaders(columns, hoveredColField);
    if (!path) return false;
    return path.some(
      (h) => h.header === header.header && h.field === header.field
    );
  };

  const getHeaderRows = (headers, level = 0, maxDepth = null) => {
    if (maxDepth === null) {
      maxDepth = getMaxDepth(columns);
    }
    const cells = [];
    const nextLevelHeaders = [];

    const currentTop = headerRowHeights[level] || 0;

    headers.forEach((header) => {
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

      const shouldHighlightHeader = isHeaderHighlighted(
        header,
        hoveredCell?.colIndex,
        hoveredCell?.field
      );

      const headerTooltipTitle = header.tooltip || "";

      cells.push(
        <TableCell
          key={`${
            header.header || header.field
          }-${level}-${getAbsoluteFlatColumnIndex(header)}`}
          align="center"
          colSpan={colSpan}
          rowSpan={rowSpan}
          className={`${classes.headerCellBase} ${
            header.onClickHeader ? classes.clickableHeader : ""
          } ${header.es_vertical ? "vertical-header" : ""} ${
            shouldHighlightHeader ? classes.highlightedCell : ""
          }`}
          style={{
            backgroundColor: `#${header.bgColor}`,
            position: "sticky",
            left: isSticky ? left : undefined,
            top: `${currentTop}px`,
            zIndex: isSticky ? 22 : 21,
            borderTop: `2px solid #000000`,
            borderRight: `2px solid #000000`,
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
          <TableTooltip title={headerTooltipTitle}>
            {header.es_vertical ? (
              <span className={classes.verticalText}>
                {header.header || header.field || ""}
              </span>
            ) : (
              header.header || header.field || ""
            )}
          </TableTooltip>
        </TableCell>
      );
      if (hasChildren) {
        nextLevelHeaders.push(...header.children);
      }
    });

    const rows = [
      <TableRow
        ref={(el) => (headerRowRefs.current[`header-row-${level}`] = el)}
        key={`header-row-${level}`}
      >
        {cells}
      </TableRow>,
    ];

    if (nextLevelHeaders.length > 0) {
      rows.push(...getHeaderRows(nextLevelHeaders, level + 1, maxDepth));
    }

    return rows;
  };

  const handleScroll = (event) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const containerHeight = tableContainerRef.current
    ? tableContainerRef.current.offsetHeight -
      tableContainerRef.current.querySelector("thead").offsetHeight
    : 0;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT
  );
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN_COUNT
  );

  const visibleRows = data.slice(startIndex, endIndex);

  const totalHeight = data.length * ROW_HEIGHT;
  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = totalHeight - endIndex * ROW_HEIGHT;

  if (flatDataColumns.length === 0) {
    return (
      <Paper>
        <p style={{ padding: "20px", textAlign: "center" }}>
          No hay datos para mostrar.
        </p>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      className={classes.tableContainer}
      ref={tableContainerRef}
      style={{ maxHeight: tableHeight }}
      onScroll={handleScroll}
    >
      <Table
        aria-label="custom multi-level grouped table"
        className={classes.table}
      >
        <TableHead>{getHeaderRows(columns)}</TableHead>
        <TableBody style={{ height: totalHeight, position: "relative" }}>
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
            <>
              {paddingTop > 0 && (
                <TableRow style={{ height: paddingTop }}>
                  <TableCell
                    colSpan={flatDataColumns.length}
                    style={{ padding: 0, border: "none" }}
                  />
                </TableRow>
              )}
              {visibleRows.map((row, rowIndexOffset) => {
                const rowIndex = startIndex + rowIndexOffset;
                return (
                  <TableRow key={rowIndex} style={{ height: ROW_HEIGHT }}>
                    {flatDataColumns.map((colDef, colIndex) => {
                      const onClickCell = colDef.onClickCell || null;
                      const onUpdateCell = colDef.onUpdateCell || null;
                      const isEditing =
                        editingCell?.rowIndex === rowIndex &&
                        editingCell?.field === colDef.field;

                      const isHighlighted =
                        (hoveredCell?.rowIndex === rowIndex &&
                          hoveredCell?.colIndex === colIndex) ||
                        (hoveredCell?.rowIndex === rowIndex && colIndex === 0);

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

                      let borderBottomStyle = `1px dashed #000000`;
                      let borderTopStyle =
                        rowIndex === 0 ? `1px dashed #000000` : undefined;

                      let customBackgroundForDashedBorder = {};
                      if (isSticky) {
                        borderBottomStyle = "none";
                        customBackgroundForDashedBorder = {
                          backgroundImage: `repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)`,
                          backgroundSize: "100% 1px",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "bottom",
                        };

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

                      const isCellClickable =
                        onClickCell ||
                        (onUpdateCell && (row.es_editable ?? true));

                      return (
                        <TableCell
                          key={colDef.field}
                          className={`${classes.dataCellBase} ${
                            isCellClickable ? classes.clickableCell : ""
                          } ${isHighlighted ? classes.highlightedCell : ""}`}
                          style={{
                            left: leftPosition,
                            position: isSticky ? "sticky" : undefined,
                            backgroundColor: isSticky ? "#fafafa" : "#ffffff",
                            zIndex: isSticky ? 11 : 1,
                            textAlign: "center",
                            borderBottom: borderBottomStyle,
                            borderRight: `1px solid #000000`,
                            borderLeft:
                              colIndex === 0 ? `1px solid #000000` : undefined,
                            borderTop: borderTopStyle,
                            backgroundClip: "padding-box",
                            ...customBackgroundForDashedBorder,
                            minWidth: isEditing ? "100px" : undefined,
                          }}
                          {...(onClickCell || onUpdateCell
                            ? { onClick: handleCellClick }
                            : {})}
                          onMouseEnter={() =>
                            setHoveredCell({
                              rowIndex,
                              colIndex,
                              field: colDef.field,
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
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
                );
              })}
              {paddingBottom > 0 && (
                <TableRow style={{ height: paddingBottom }}>
                  <TableCell
                    colSpan={flatDataColumns.length}
                    style={{ padding: 0, border: "none" }}
                  />
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
