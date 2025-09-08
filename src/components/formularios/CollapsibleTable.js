import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell,
    TableRow, IconButton, Collapse,
    Typography, Tooltip, Box, TableHead
} from "@mui/material";
import GetAppIcon from "@material-ui/icons/GetApp";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as XLSX from "xlsx";
import EditIcon from '@mui/icons-material/Edit';
import MUIDataTable from "mui-datatables";

export default function CollapsibleTable({ cabeceras, setCantidades, APIService,setForm,setMostrarTabla,setMostrarFormulario,setModoEdicion, getNombreMarca }) {

    const renderDetailTable = (section, headers, values) => (
        <>
            <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>{section}:</TableCell>
                {headers.map((h, i) => (
                    <TableCell key={i} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
            </TableRow>
            <TableRow>
                <TableCell />
                {values.map((v, i) =>
                    <TableCell key={i} sx={{ border: '1px solid #ddd', whiteSpace: 'nowrap' }}>{v || 'N/A'}</TableCell>)}
            </TableRow>
        </>
    );

    const ExpandableRow = ({ row }) => {
        const [segmentos, setSegmentos] = useState([]);
        const [marcas, setMarcas] = useState([]);


        useEffect(() => {
            const cargarCatalogo = async () => {
                try {
                    const res = await APIService.getModeloSegmentos();
                    setSegmentos(res || []);

                    const resMarcas = await APIService.getMarcas();
                    setMarcas(resMarcas || []);
                } catch (e) {
                    console.error("Error cargando catalogos", e);
                }
            };
            cargarCatalogo();
        }, []);

        const getNombreMarca = (cod) =>
            marcas.find((m) => String(m.codigo_marca) === String(cod))?.nombre_marca || "N/A";

        const getNombreSegmento = (cod) =>
            segmentos.find((s) => String(s.codigo_segmento) === String(cod))?.nombre_segmento || "N/A";

        const getNombreModelo = (cod) =>
            segmentos.find((s) => String(s.codigo_modelo_comercial) === String(cod))?.nombre_modelo || "N/A";


        const agrupadosMarcas = (row.marcas_segmento || []).reduce((acc, item) => {
            const seg = item.nombre_segmento || getNombreSegmento(item.cod_segmento);
            if (!acc[seg]) acc[seg] = [];
            acc[seg].push(item);
            return acc;
        }, {});


        return (
            <Box margin={2}>
                <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
                    Detalle Modelos
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>SEGMENTO</TableCell>
                            <TableCell>MARCA</TableCell>
                            <TableCell>MODELO COMERCIAL</TableCell>
                            <TableCell>CANTIDAD</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(
                            (row.modelos_segmento || []).reduce((acc, item) => {
                                const seg = getNombreSegmento(item.cod_segmento);
                                if (!acc[seg]) acc[seg] = [];
                                acc[seg].push(item);
                                return acc;
                            }, {})
                        ).map(([segmento, items], idx) => {

                            const subtotal = items.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0);

                            return (
                                <React.Fragment key={idx}>
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ fontWeight: "bold", backgroundColor: "#eee" }}>
                                            {segmento}
                                        </TableCell>
                                    </TableRow>
                                    {items.map((item, subIdx) => (
                                        <TableRow key={subIdx}>
                                            <TableCell>{segmento}</TableCell>
                                            <TableCell>{item.nombre_marca || getNombreMarca(item.cod_marca)}</TableCell>
                                            <TableCell>{getNombreModelo(item.cod_modelo_comercial)}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} sx={{ fontWeight: "bold", textAlign: "right" }}>
                                            Total:
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>{subtotal}</TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>

                </Table>
                <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold", mt: 3 }}>
                    Detalle Marcas
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>SEGMENTO</TableCell>
                            <TableCell>MARCA</TableCell>
                            <TableCell>CANTIDAD</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(agrupadosMarcas).map(([segmento, items], idx) => {

                            const subtotal = items.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0);

                            return (
                                <React.Fragment key={idx}>
                                    <TableRow>
                                        <TableCell colSpan={3} sx={{ fontWeight: "bold", backgroundColor: "#eee" }}>
                                            {segmento}
                                        </TableCell>
                                    </TableRow>
                                    {items.map((item, subIdx) => (
                                        <TableRow key={subIdx}>
                                            <TableCell>{segmento}</TableCell>
                                            <TableCell>{getNombreMarca(item.cod_marca)}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={2} sx={{ fontWeight: "bold", textAlign: "right" }}>
                                            Total:
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>{subtotal}</TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>

                </Table>
            </Box>
        );
    };

    const camposPlantilla = [
        'codigo_promotoria', 'promotor', 'distribuidor',
        'ciudad', 'tienda', 'jefeTienda', 'correoTienda',
        'telefonoTienda', 'promedioVenta', 'total_vendedores',
        'total_motos_piso', 'total_motos_shi', 'modelos_segmento', "marcas_segmento",
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
        { name: "total_motos_shi", label: "# MOTOS SHINERAY" },
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
                                // onClick={() => console.log("Editar fila:", row)}
                                onClick={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        cod_form: row.cod_form,
                                        cod_promotor: row.cod_promotor || prev.cod_promotor,
                                        promotor: prev.promotor,
                                        // Distribuidor
                                        distribuidor: row.distribuidor || '',
                                        distribuidorId: row.cod_cliente || '',
                                        // Ciudad y Tienda
                                        ciudad: row.ciudad || '',
                                        codTienda: row.cod_tienda || '',
                                        tienda: row.tienda || '',
                                        // Otros campos
                                        responsable: row.responsable || '',
                                        correoTienda: row.correoTienda || '',
                                        telefono1: row.telefonoTienda || '',
                                        prom_venta_tienda: row.promedioVenta || '',
                                        total_vendedores: row.total_vendedores || '',
                                        total_motos_piso: row.total_motos_piso || '',
                                        total_motos_shi: row.total_motos_shi || '',
                                        modelos_segmento: row.modelos_segmento || [],
                                        marcas_segmento: row.marcas_segmento || [],
                                    }));
                                    setModoEdicion(true);
                                    setMostrarFormulario(true);
                                    setMostrarTabla(false);

                                    setCantidades({
                                        modelos: (row.modelos_segmento || []).reduce((acc, m) => {
                                            acc[m.cod_modelo_comercial] = {
                                                cod_modelo_comercial: m.cod_modelo_comercial,
                                                cod_segmento: m.cod_segmento,
                                                nombre_segmento: m.nombre_segmento || '',
                                                cod_marca: m.cod_marca,
                                                cantidad: Number(m.cantidad) || 0
                                            };
                                            return acc;
                                        }, {}),
                                        marcas: (row.marcas_segmento || []).reduce((acc, m) => {
                                            const key = `${m.cod_segmento}_${m.cod_marca}`;
                                            acc[key] = {
                                                cod_segmento: m.cod_segmento,
                                                nombre_segmento: m.nombre_segmento || '',
                                                cod_marca: m.cod_marca,
                                                nombre_marca: m.nombre_marca || getNombreMarca(m.cod_marca),
                                                cantidad: Number(m.cantidad) || 0
                                            };
                                            return acc;
                                        }, {})

                                    });

                                    console.log("Editar fila:", row);
                                }}
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
                        <ExpandableRow row={cabeceras[dataIndex]} />
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
            body: { noMatch: "Lo siento, no se encontraron registros", toolTip: "Ordenar" },
            pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
            toolbar: { downloadCsv: "Exportar CSV" }
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
