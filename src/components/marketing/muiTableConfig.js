import { createTheme } from '@mui/material/styles';

export const getTableOptions = () => ({
    responsive: 'standard',
    selectableRows: 'none',
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
                        paddingTop: '0px',
                        paddingBottom: '0px',
                        backgroundColor: '#00000',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        borderBottom: '1px solid #ddd',
                        borderRight: '1px solid #ddd',
                        fontSize: '14px'
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
