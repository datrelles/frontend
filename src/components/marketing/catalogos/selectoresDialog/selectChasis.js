import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    Box, Grid, TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';

export default function SelectorChasis({ chasis, selectedChasisId, onSelect }) {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const selectedItem = chasis.find(c => c.codigo_chasis === selectedChasisId);
    const chasisLabel = selectedItem ? `${selectedItem.codigo_chasis}` : '';

    return (
        <Grid item xs={6}>
            <Box display="flex" alignItems="center">
                <TextField
                    label="Chasis"
                    value={chasisLabel}
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
                                <TableCell>Aros Delanteros</TableCell>
                                <TableCell>Aros Traseros</TableCell>
                                <TableCell>Neumático Del.</TableCell>
                                <TableCell>Neumático Tras.</TableCell>
                                <TableCell>Suspensión Del.</TableCell>
                                <TableCell>Suspensión Tras.</TableCell>
                                <TableCell>Frenos Del.</TableCell>
                                <TableCell>Frenos Tras.</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {chasis.map((item) => (
                                <TableRow key={item.codigo_chasis} hover>
                                    <TableCell>{item.codigo_chasis}</TableCell>
                                    <TableCell>{item.aros_rueda_delantera}</TableCell>
                                    <TableCell>{item.aros_rueda_posterior}</TableCell>
                                    <TableCell>{item.neumatico_delantero}</TableCell>
                                    <TableCell>{item.neumatico_trasero}</TableCell>
                                    <TableCell>{item.suspension_delantera}</TableCell>
                                    <TableCell>{item.suspension_trasera}</TableCell>
                                    <TableCell>{item.frenos_delanteros}</TableCell>
                                    <TableCell>{item.frenos_traseros}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => {
                                            onSelect(item.codigo_chasis);
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