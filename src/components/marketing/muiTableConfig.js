import { createTheme } from '@mui/material/styles';
import React from "react";
import BotonExportarXLSX from "./BotonExportarXLSX";


export const getTableOptions = (cabeceras = [], camposPlantilla = [], nombreArchivo = 'plantilla_actualizar.xlsx') => ({
    responsive: 'standard',
    selectableRows: 'none',
    download: false,
    rowsPerPage: 10,
    expandableRows: false,
    customToolbar: () => (
        <BotonExportarXLSX
            datos={cabeceras}
            camposPlantilla={camposPlantilla}
            nombreArchivo={nombreArchivo}
        />
    ),
    textLabels: {
        body: {
            noMatch: "Lo siento, no se encontraron registros",
            toolTip: "Ordenar"
        },
        pagination: {
            next: "Siguiente",
            previous: "Anterior",
            rowsPerPage: "Filas por página:",
            displayRows: "de"
        },
        toolbar: {
            downloadCsv: "Exportar XLSX"
        }
    }
});

export const getMuiTheme = () =>
    createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        paddingLeft: '3px',
                        paddingRight: '3px',
                        paddingTop: '4px',
                        paddingBottom: '4px',
                        backgroundColor: '#fff',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        verticalAlign: 'top',
                        borderBottom: '1px solid #ddd',
                        borderRight: '1px solid #ddd',
                        fontSize: '14px',
                        maxWidth: '500px',
                    },
                    head: {
                        backgroundColor: 'firebrick',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        paddingLeft: '0px',
                        paddingRight: '0px',
                        fontSize: '12px'
                    }
                }
            },
            MuiTable: {
                styleOverrides: {
                    root: { borderCollapse: 'collapse' }
                }
            },
            MuiToolbar: {
                styleOverrides: {
                    regular: { minHeight: '10px' }
                }
            }
        }
    });
