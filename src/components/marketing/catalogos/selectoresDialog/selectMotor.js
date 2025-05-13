import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    Box, Grid, TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Typography from "@mui/material/Typography";

export default function SelectorMotor({ motores, tiposMotor, selectedMotorId, onSelect }) {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const selectedItem = motores.find(m => m.codigo_motor === selectedMotorId);
    const motorLabel = selectedItem ? selectedItem.nombre_motor : '';

    return (
        <Grid item xs={6}>
            <Box display="flex" alignItems="center">
                <TextField
                    label="Motor"
                    value={motorLabel}
                    fullWidth
                    disabled
                />
                <IconButton onClick={handleOpenDialog}>
                    <SearchIcon />
                </IconButton>
            </Box>
            <Dialog open={open} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Seleccionar</Typography>
                    <IconButton edge="end" onClick={handleCloseDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Tipo Motor</TableCell>
                                <TableCell>Cilindrada</TableCell>
                                <TableCell>Caballos</TableCell>
                                <TableCell>Torque</TableCell>
                                <TableCell>Combustible</TableCell>
                                <TableCell>Arranque</TableCell>
                                <TableCell>Refrigeración</TableCell>
                                <TableCell>Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {motores.map((motor) => {
                                const tipo = tiposMotor.find(t => t.codigo_tipo_motor === motor.codigo_tipo_motor);
                                return (
                                    <TableRow key={`${motor.codigo_motor}-${motor.codigo_tipo_motor}`} hover>
                                        <TableCell>{motor.nombre_motor}</TableCell>
                                        <TableCell>{tipo?.nombre_tipo || ''}</TableCell>
                                        <TableCell>{motor.cilindrada}</TableCell>
                                        <TableCell>{motor.caballos_fuerza}</TableCell>
                                        <TableCell>{motor.torque_maximo}</TableCell>
                                        <TableCell>{motor.sistema_combustible}</TableCell>
                                        <TableCell>{motor.arranque}</TableCell>
                                        <TableCell>{motor.sistema_refrigeracion}</TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={() => {
                                                onSelect({
                                                    codigo_motor: motor.codigo_motor,
                                                    codigo_tipo_motor: motor.codigo_tipo_motor,
                                                    nombre_motor: motor.nombre_motor,
                                                    nombre_tipo_motor: tipo?.nombre_tipo || ''
                                                });
                                                handleCloseDialog();
                                            }}>
                                                Seleccionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </Grid>
    );
}
