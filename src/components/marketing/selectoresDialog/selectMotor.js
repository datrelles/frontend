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

    const [searchText, setSearchText] = useState('');

    const filteredMotor = motores.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

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
            <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth={false}
                sx={{ '& .MuiDialog-paper': { width: '80vw', maxWidth: '80vw' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Seleccionar</Typography>
                    <IconButton edge="end" onClick={handleCloseDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Buscar"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tipo Motor</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Cilindrada</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Potencia</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Torque Máximo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Sistema de Combustible</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Arranque</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Sistema de Refrigeración</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredMotor.map((motor) =>  {
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
