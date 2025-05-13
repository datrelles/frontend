import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    Box, Grid, TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Typography from "@mui/material/Typography";

export default function SelectorElectronica({ electronica, selectedElectronicaId, onSelect }) {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const selectedItem = electronica.find(e => e.codigo_electronica === selectedElectronicaId);
    const electronicaLabel = selectedItem ? `${selectedItem.codigo_electronica}` : '';

    return (
        <Grid item xs={6}>
            <Box display="flex" alignItems="center">
                <TextField
                    label="Electronica"
                    value={electronicaLabel}
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
                                <TableCell>Código</TableCell>
                                <TableCell>Capacidad Combustible</TableCell>
                                <TableCell>Tablero</TableCell>
                                <TableCell>Luces Delanteras</TableCell>
                                <TableCell>Luces Posteriores.</TableCell>
                                <TableCell>Garantía</TableCell>
                                <TableCell>Velocidad Máxima.</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {electronica.map((item) => (
                                <TableRow key={item.codigo_electronica} hover>
                                    <TableCell>{item.codigo_electronica}</TableCell>
                                    <TableCell>{item.capacidad_combustible}</TableCell>
                                    <TableCell>{item.tablero}</TableCell>
                                    <TableCell>{item.luces_delanteras}</TableCell>
                                    <TableCell>{item.luces_posteriores}</TableCell>
                                    <TableCell>{item.garantia}</TableCell>
                                    <TableCell>{item.velocidad_maxima}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => {
                                            onSelect(item.codigo_electronica);
                                            handleCloseDialog();
                                        }}>
                                            Seleccionar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </Grid>
    );
}