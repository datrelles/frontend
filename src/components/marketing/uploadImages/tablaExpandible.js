// CatModeloVersionExpandible.jsx
import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableRow,
    IconButton, Collapse, Box, Typography, Button, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MUIDataTable from 'mui-datatables';

export default function CatModeloVersionExpandible({
                                                       cabeceras,
                                                       electronica = [],
                                                       transmisiones = [],
                                                       dimensiones = [],
                                                       motores = [],
                                                       tiposMotor = [],
                                                       chasis = [],
                                                       //imagenes = [],
                                                       onEdit
                                                   }) {
    const [imagenModal, setImagenModal] = useState(null);
    const getDetalleElectronica = (codigo) => electronica.find(e => e.codigo_electronica === codigo);
    const getDetalleTransmision = (codigo) => transmisiones.find(t => t.codigo_transmision === codigo);
    const getDetalleDimensiones = (codigo) => dimensiones.find(d => d.codigo_dim_peso === codigo);
    const getDetalleMotor = (codigo) => motores.find(m => m.codigo_motor === codigo);
    const getTipoMotor = (codigo) => tiposMotor.find(t => t.codigo_tipo_motor === codigo);
    const getDetalleChasis = (codigo) => chasis.find(c => c.codigo_chasis === codigo);
   //const getImagen = (codigo) => imagenes.find(img => img.codigo_imagen === codigo)?.path_imagen;
    const safeValue = (val, suffix = '') => val !== undefined && val !== null ? `${val}${suffix}` : 'N/A';


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
        const detalleElectronica = getDetalleElectronica(row.codigo_electronica);
        const detalleTransmission = getDetalleTransmision(row.codigo_transmision);
        const detalleDimensiones = getDetalleDimensiones(row.codigo_dim_peso);
        const detalleMotor = getDetalleMotor(row.codigo_motor);
        const tipoMotor = getTipoMotor(row.codigo_tipo_motor);
        const detalleChasis = getDetalleChasis(row.codigo_chasis);
       // const pathImagen = row.path_imagen || getImagen(row.codigo_imagen);

        return (
            <Box margin={2}>
                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Detalles Técnicos
                </Typography>
                <Table size="small" sx={{margin: 2}}>
                    <TableBody>
                        {renderDetailTable("MOTOR",
                            [
                                "NOMBRE",
                                "TIPO",
                                "CILINDRADA",
                                "POTENCIA",
                                "TORQUE",
                                "ARRANQUE",
                                "COMBUSTIBLE",
                                "REFRIGERACIÓN"], [
                            detalleMotor?.nombre_motor,
                            tipoMotor?.nombre_tipo,
                            detalleMotor?.cilindrada,
                            detalleMotor?.caballos_fuerza,
                            detalleMotor?.torque_maximo,
                            detalleMotor?.arranque,
                            detalleMotor?.sistema_combustible,
                            detalleMotor?.sistema_refrigeracion
                        ])}
                        {renderDetailTable("CHASIS",
                            [
                                "SUSP. DELANTERA",
                                "SUSP. TRASERA",
                                "FRENO DELANTERO",
                                "FRENO TRASERO",
                                "NEUMÁTICO DELANTERO",
                                "NEUMÁTICO TRASERO",
                                "ARO RUEDA DELANTERA",
                                "ARO RUEDA TRASERA"], [
                            detalleChasis?.suspension_delantera,
                            detalleChasis?.suspension_trasera,
                            detalleChasis?.frenos_delanteros,
                            detalleChasis?.frenos_traseros,
                            detalleChasis?.neumatico_delantero,
                            detalleChasis?.neumatico_trasero,
                            detalleChasis?.aros_rueda_delantera,
                            detalleChasis?.aros_rueda_posterior
                        ])}
                        {renderDetailTable("ELECTRÓNICA",
                            [
                                "TABLERO",
                                "CAPACIDAD COMBUSTIBLE",
                                "LUCES DELANTERAS",
                                "LUCES TRASERAS",
                                "VELOCIDAD MÁXIMA",
                                "GARANTÍA"], [
                            detalleElectronica?.tablero,
                            detalleElectronica?.capacidad_combustible,
                            detalleElectronica?.luces_delanteras,
                            detalleElectronica?.luces_posteriores,
                            detalleElectronica?.velocidad_maxima,
                            detalleElectronica?.garantia
                        ])}
                        {renderDetailTable("DIMENSIONES",
                            [
                                "ALTURA TOTAL",
                                "PESO SECO",
                                "LONGITUD TOTAL",
                                "ANCHO TOTAL"
                            ],
                            [
                                safeValue(detalleDimensiones?.altura_total, ' mm'),
                                safeValue(detalleDimensiones?.peso_seco, ' kg'),
                                safeValue(detalleDimensiones?.longitud_total, ' mm'),
                                safeValue(detalleDimensiones?.ancho_total, ' mm')
                            ]
                        )}
                        {renderDetailTable("TRANSMISIÓN", ["CAJA DE CAMBIOS"], [
                            detalleTransmission?.caja_cambios
                        ])}
                    </TableBody>
                </Table>
            </Box>
        );
    };

    const columns = [
        { name: 'nombre_modelo_version', label: 'MODELO' },
       // { name: 'nombre_producto', label: 'PRODUCTO' },
        { name: 'nombre_marca', label: 'MARCA MODELO' },
        { name: 'nombre_empresa', label: 'EMPRESA' },
        {
            name: 'path_imagen', label: 'IMAGEN', options: {
                customBodyRender: (value) => value ? (
                    <Button
                        variant="outlined" size="small"
                        onClick={() => setImagenModal(value)}>Ver Imagen
                    </Button>
                ) : 'N/A'
            }
        },
        { name: 'nombre_version', label: 'VERSIÓN' },
        { name: 'nombre_color', label: 'COLOR' },
        { name: 'anio_modelo_version', label: 'AÑO MODELO' },
        {
            name: 'precio_producto_modelo',
            label: 'PRECIO PRODUCTO',
            options: {
                customBodyRender: (value) =>
                    new Intl.NumberFormat("es-EC", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(value)
            }
        },
        {
            name: 'precio_venta_distribuidor',
            label: 'PRECIO DISTRIBUIDOR',
            options: {
                customBodyRender: (value) =>
                    new Intl.NumberFormat("es-EC", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(value)
            }
        },
        {
            name: 'acciones', label: 'ACCIONES', options: {
                customBodyRenderLite: (dataIndex) => (
                    <IconButton
                        onClick={() => onEdit(cabeceras[dataIndex])}><EditIcon />
                    </IconButton>
                )
            }
        }
    ];

    const options = {
        responsive: 'standard',
        selectableRows: 'none',
        download: true,
        rowsPerPage: 10,
        expandableRows: true,
        renderExpandableRow: (rowData, { dataIndex }) => (
            <TableRow>
                <TableCell colSpan={12}>
                    <Collapse
                        in={true}>{ExpandableRow(cabeceras[dataIndex])}
                    </Collapse>
                </TableCell>
            </TableRow>
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
                    head: { backgroundColor: 'firebrick', color: '#fff', fontWeight: 'bold', fontSize: '12px' }
                }
            }
        }
    });

    return (
        <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title="LISTA COMPLETA"
                data={cabeceras}
                columns={columns}
                options={options}
            />
            <Dialog open={!!imagenModal} onClose={() => setImagenModal(null)} maxWidth="md" fullWidth>
                <DialogTitle>Vista de Imagen</DialogTitle>
                <DialogContent>
                    <img
                        src={imagenModal}
                        alt="Vista previa"
                        style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                    />
                    <Box textAlign="right" mt={2}>
                        <Button
                            onClick={() => setImagenModal(null)}
                            color="primary">Cerrar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}
