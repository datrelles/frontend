// ESTE ARCHIVO COMBINA CatModeloVersion CON TABLA EXPANDIBLE
import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Collapse, Box, Typography, Button, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit as EditIcon } from '@mui/icons-material';

export default function CatModeloVersionExpandible({
                                                       cabeceras,
                                                       electronica = [],
                                                       transmisiones = [],
                                                       dimensiones = [],
                                                       motores = [],
                                                       tiposMotor = [],
                                                       chasis = [],
                                                       imagenes = [],
                                                       onEdit
                                                   }) {
    const [imagenModal, setImagenModal] = useState(null);

    const getDetalleElectronica = (codigo) => electronica.find(e => e.codigo_electronica === codigo);
    const getDetalleTransmision = (codigo) => transmisiones.find(t => t.codigo_transmision === codigo);
    const getDetalleDimensiones = (codigo) => dimensiones.find(d => d.codigo_dim_peso === codigo);
    const getDetalleMotor = (codigo) => motores.find(m => m.codigo_motor === codigo);
    const getTipoMotor = (codigo) => tiposMotor.find(t => t.codigo_tipo_motor === codigo);
    const getDetalleChasis = (codigo) => chasis.find(c => c.codigo_chasis === codigo);
    const getImagen = (codigo) => imagenes.find(img => img.codigo_imagen === codigo)?.path_imagen;

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
                {values.map((v, i) => <TableCell key={i} sx={{ border: '1px solid #ddd', whiteSpace: 'nowrap' }}>{v || 'N/A'}</TableCell>)}
            </TableRow>
        </>
    );

    const ExpandableRow = ({ row }) => {
        const [open, setOpen] = useState(false);
        const detalleElectronica = getDetalleElectronica(row.codigo_electronica);
        const detalleTransmision = getDetalleTransmision(row.codigo_transmision);
        const detalleDimensiones = getDetalleDimensiones(row.codigo_dim_peso);
        const detalleMotor = getDetalleMotor(row.codigo_motor);
        const tipoMotor = getTipoMotor(row.codigo_tipo_motor);
        const detalleChasis = getDetalleChasis(row.codigo_chasis);
        const pathImagen = row.path_imagen || getImagen(row.codigo_imagen);

        return (
            <>
                <TableRow>
                    <TableCell sx={{ border: '1px solid #ddd', padding: '6px' }}>
                        <IconButton onClick={() => setOpen(!open)} size="small">
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    </TableCell>
                    {[
                        row.nombre_modelo_version,
                        row.nombre_producto, row.nombre_empresa].map((value, idx) => (
                        <TableCell key={idx} sx={{ border: '1px solid #ddd', padding: '6px', whiteSpace: 'nowrap' }}>{value}</TableCell>
                    ))}
                    <TableCell sx={{ border: '1px solid #ddd', padding: '6px' }}>
                        {pathImagen ? (
                            <Button variant="outlined" size="small" onClick={() => setImagenModal(pathImagen)}>Ver Imagen</Button>
                        ) : 'N/A'}
                    </TableCell>
                    {[
                        row.nombre_marca,
                        row.nombre_version,
                        row.anio_modelo_version,
                        row.precio_producto_modelo,
                        row.precio_venta_distribuidor].map((value, idx) => (
                        <TableCell key={idx} sx={{ border: '1px solid #ddd', padding: '6px', whiteSpace: 'nowrap' }}>{value}</TableCell>
                    ))}
                    <TableCell sx={{ border: '1px solid #ddd', padding: '6px' }}>
                        <IconButton onClick={() => onEdit(row)} size="small">
                            <EditIcon />
                        </IconButton>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={11} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                    Detalles Técnicos
                                </Typography>
                                <Table size="small">
                                    <TableBody>
                                        {renderDetailTable("Motor", ["Nombre", "Tipo", "Cilindrada", "Caballos Fuerza", "Torque", "Arranque", "Combustible", "Refrigeración"], [
                                            detalleMotor?.nombre_motor,
                                            tipoMotor?.nombre_tipo,
                                            detalleMotor?.cilindrada,
                                            detalleMotor?.caballos_fuerza,
                                            detalleMotor?.torque_maximo,
                                            detalleMotor?.arranque,
                                            detalleMotor?.sistema_combustible,
                                            detalleMotor?.sistema_refrigeracion
                                        ])}
                                        {renderDetailTable("Chasis", ["Susp. Delantera", "Susp. Trasera", "Freno Delantero", "Freno Trasero", "Neumático Delantero", "Neumático Trasero", "Aro Delantero", "Aro Trasero"], [
                                            detalleChasis?.suspension_delantera,
                                            detalleChasis?.suspension_trasera,
                                            detalleChasis?.frenos_delanteros,
                                            detalleChasis?.frenos_traseros,
                                            detalleChasis?.neumatico_delantero,
                                            detalleChasis?.neumatico_trasero,
                                            detalleChasis?.aros_rueda_delantera,
                                            detalleChasis?.aros_rueda_posterior
                                        ])}
                                        {renderDetailTable("Electrónica", ["Tablero", "Luces delanteras", "Luces traseras", "Velocidad máxima", "Garantía"], [
                                            detalleElectronica?.tablero,
                                            detalleElectronica?.luces_delanteras,
                                            detalleElectronica?.luces_posteriores,
                                            detalleElectronica?.velocidad_maxima,
                                            detalleElectronica?.garantia
                                        ])}
                                        {renderDetailTable("Dimensiones", ["Altura Total", "Peso Seco", "Longitud Total", "Ancho Total"], [
                                            detalleDimensiones?.altura_total + ' mm',
                                            detalleDimensiones?.peso_seco + ' kg',
                                            detalleDimensiones?.longitud_total + ' mm',
                                            detalleDimensiones?.ancho_total + ' mm'
                                        ])}
                                        {renderDetailTable("Transmisión", ["Caja de cambios"], [
                                            detalleTransmision?.caja_cambios
                                        ])}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        );
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'firebrick', textAlign: 'center' }}>
                            {["",
                                "MODELO",
                                "PRODUCTO",
                                "EMPRESA",
                                "IMAGEN REFERENCIA",
                                "MARCA",
                                "VERSIÓN",
                                "AÑO",
                                "PRECIO PRODUCTO",
                                "PRECIO DISTRIBUIDOR",
                                "ACCIONES"].map((label, i) => (
                                <TableCell key={i} sx={{
                                    color: 'white',
                                    border: '1px solid #ddd',
                                    padding: '6px',
                                    whiteSpace: 'nowrap' }}>{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cabeceras.map((row, index) => (
                            <ExpandableRow key={index} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!imagenModal} onClose={() => setImagenModal(null)} maxWidth="md" fullWidth>
                <DialogTitle>Vista de Imagen</DialogTitle>
                <DialogContent>
                    <img
                        src={imagenModal}
                        alt="Vista previa"
                        style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                    />
                    <Box textAlign="right" mt={2}>
                        <Button onClick={() => setImagenModal(null)} color="primary">Cerrar</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}
