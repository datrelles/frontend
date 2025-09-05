import React, { useState } from "react";
import {
    Table, TableBody, TableCell,
    TableRow, IconButton, Collapse,
    Typography, Tooltip, Box
} from "@mui/material";
import GetAppIcon from "@material-ui/icons/GetApp";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import * as XLSX from "xlsx";
import EditIcon from '@mui/icons-material/Edit';
import MUIDataTable from "mui-datatables";

export default function CollapsibleTable({ cabeceras, modeloComercial }) {
    const getDetalleModelo = (codigo) => modeloComercial.find(e => e.codigo_modelo_comercial === codigo);

    const renderDetailTable = (section, headers, values) => (
        <>
            <TableRow>
                <TableCell sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold' }}>{section}:
                </TableCell>
                {headers.map((h, i) => (
                    <TableCell
                        key={i} sx={{
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        border: '1px solid #ddd',
                        whiteSpace: 'nowrap' }}>{h}
                    </TableCell>
                ))}
            </TableRow>
            <TableRow>
                <TableCell />
                {values.map((v, i) =>
                    <TableCell
                        key={i}
                        sx={{ border: '1px solid #ddd',
                            whiteSpace: 'nowrap' }}>{v || 'N/A'}
                    </TableCell>)}
            </TableRow>
        </>
    );

    const ExpandableRow = (row) => {
        const modelos = row?.modelos_segmento ?? [];
        const marcas = row?.marcas_segmento ?? [];

        return (
            <Box margin={2}>
                <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
                    Detalle Modelos
                </Typography>
                <Table size="small" sx={{ margin: 2 }}>
                    <TableBody>
                        {modelos.length === 0 ? (
                            renderDetailTable(
                                "Modelo Comercial",
                                ["SEGMENTO", "MARCA", "MODELO COMERCIAL", "CANTIDAD"],
                                []
                            )
                        ) : (
                            modelos.map((m, i) =>
                                renderDetailTable(
                                    `Modelo Comercial ${i + 1}`,
                                    ["SEGMENTO", "MARCA", "MODELO COMERCIAL", "CANTIDAD"],
                                    [
                                        m.nombre_segmento,
                                        m.nombre_marca,
                                        m.nombre_modelo_comercial,
                                        m.cantidad,
                                    ]
                                )
                            )
                        )}
                    </TableBody>
                </Table>
                <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
                    Detalle Marcas
                </Typography>
                <Table size="small" sx={{ margin: 2 }}>
                    <TableBody>
                        {marcas.length === 0 ? (
                            renderDetailTable("Marcas", ["MARCA", "CANTIDAD"], [])
                        ) : (
                            marcas.map((m, i) =>
                                renderDetailTable(
                                    `Marca ${i + 1}`,
                                    ["MARCA", "CANTIDAD"],
                                    [m.nombre_marca, m.cantidad]
                                )
                            )
                        )}
                    </TableBody>
                </Table>
            </Box>
        );
    };

    const camposPlantilla = [
        'codigo_promotoria','promotor','distribuidor',
        'ciudad','tienda','jefeTienda','correoTienda',
        'telefonoTienda','promedioVenta', 'total_vendedores',
        'totol_motos_piso','total_motos_shineray','modelo_1'
    ];

    const exportarCamposPlantilla = (datosOriginales) => {
        const datosFiltrados = datosOriginales.map((registro) => {
            const nuevoRegistro = {};
            camposPlantilla.forEach((campo) => {
                nuevoRegistro[campo] = registro[campo] ?? '';
            });
            return nuevoRegistro;
        });

        const hoja = XLSX.utils.json_to_sheet(datosFiltrados);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Plantilla');

        XLSX.writeFile(libro, 'actualizar_formulario_promotoria.xlsx');
    };

    const columns = [
        { name: "cod_form", label: "CÓDIGO" },
        { name: "promotor", label: "PROMOTOR" },
        { name: "distribuidor", label: "DISTRIBUIDOR" },
        { name: "ciudad", label: "CIUDAD" },
        { name: "tienda", label: "TIENDA" },
        { name: "responsable", label: "JEFE TIENDA" },
        { name: "correoTienda", label: "CORREO TIENDA" },
        { name: "telefonoTienda", label: "TELÉFONO JEFE TIENDA" },
        { name: "promedioVenta", label: "PROMEDIO VENTA" },
        { name: "total_vendedores", label: "# VENDEDORES" },
        { name: "total_motos_piso", label: "T. MOTOS PISO" },
        { name: "total_motos_shineray", label: "# MOTOS SHINERAY" },
        {
            name: "acciones",
            label: "ACCIONES",
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const row = cabeceras[dataIndex];
                    return (
                        <Tooltip title="Editar">
                            <IconButton
                                color="primary"
                                onClick={() => console.log("Editar fila:", row)}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    );
                },
            },
        },
    ];


    const options = {
        responsive: 'standard',
        selectableRows: 'none',
        download: false,
        rowsPerPage: 10,
        expandableRows: true,
        renderExpandableRow: (rowData, { dataIndex }) => (
            <TableRow>
                <TableCell colSpan={12}>
                    <Collapse in={true}>
                        {ExpandableRow(cabeceras[dataIndex])}
                    </Collapse>
                </TableCell>
            </TableRow>
        ),
        customToolbar: () => (
            <Tooltip title="Exportar XLSX">
                <IconButton onClick={() => exportarCamposPlantilla(cabeceras)}>
                    <GetAppIcon />
                </IconButton>
            </Tooltip>
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
                downloadCsv: "Exportar CSV"
            }
        }
    };

    const getMuiTheme = () => createTheme({
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: { padding: 2, borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '14px' },
                    head: { backgroundColor: 'firebrick !important', color: '#fff', fontWeight: 'bold', fontSize: '12px' }
                }
            }
        }
    });


    return (
        <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title="REGISTROS VISITA PROMOTORÍA"
                data={cabeceras}
                columns={columns}
                options={options}
            />
        </ThemeProvider>
    );
}
