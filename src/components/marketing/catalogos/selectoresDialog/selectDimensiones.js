import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    Box, Grid, TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';

export default function SelectorDimensiones({ dimensiones, selectedDimensionesId, onSelect }) {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const selectedItem = dimensiones.find(e => e.codigo_dim_peso === selectedDimensionesId);
    const dimensionesLabel = selectedItem ? `${selectedItem.codigo_dim_peso}` : '';

    return (
        <Grid item xs={6}>
            <Box display="flex" alignItems="center">
                <TextField
                    label="Dimensiones/Peso"
                    value={dimensionesLabel}
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
                                <TableCell>Altura Total  </TableCell>
                                <TableCell>Longitud Total</TableCell>
                                <TableCell>Ancho Total</TableCell>
                                <TableCell>Peso Seco</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dimensiones.map((item) => (
                                <TableRow key={item.codigo_dim_peso} hover>
                                    <TableCell>{item.codigo_dim_peso}</TableCell>
                                    <TableCell>{item.altura_total}</TableCell>
                                    <TableCell>{item.longitud_total}</TableCell>
                                    <TableCell>{item.ancho_total}</TableCell>
                                    <TableCell>{item.peso_seco}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => {
                                            onSelect(item.codigo_dim_peso);
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