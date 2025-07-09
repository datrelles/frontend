import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    Box, Grid, TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from "@mui/material/InputAdornment";

export default function SelectorChasis({ chasis, selectedChasisId, onSelect,error, helperText }) {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const selectedItem = chasis.find(c => c.codigo_chasis === selectedChasisId);
    const chasisLabel = selectedItem ? `${selectedItem.codigo_chasis}` : '';
    const [searchText, setSearchText] = useState('');

    const filteredChasis = chasis.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const safeValue = (val) => val !== undefined && val !== null && val !== '' ? val : 'N/A';

    return (
        <Grid item xs={6}>
            <Box display="flex" alignItems="center">
                <TextField
                    label="Chasis"
                    value={chasisLabel}
                    error={!!error}
                    helperText={helperText}
                    fullWidth
                    disabled
                />
                <InputAdornment position="end">
                    <IconButton onClick={handleOpenDialog}>
                        <SearchIcon />
                    </IconButton>
                </InputAdornment>
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Aros Delanteros</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Aros Traseros</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Neumático Del.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Neumático Tras.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Suspensión Del.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Suspensión Tras.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Frenos Del.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Frenos Tras.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredChasis.map((item) => (
                                <TableRow key={item.codigo_chasis} hover>
                                    <TableCell>{safeValue(item.codigo_chasis)}</TableCell>
                                    <TableCell>{safeValue(item.aros_rueda_delantera)}</TableCell>
                                    <TableCell>{safeValue(item.aros_rueda_posterior)}</TableCell>
                                    <TableCell>{safeValue(item.neumatico_delantero)}</TableCell>
                                    <TableCell>{safeValue(item.neumatico_trasero)}</TableCell>
                                    <TableCell>{safeValue(item.suspension_delantera)}</TableCell>
                                    <TableCell>{safeValue(item.suspension_trasera)}</TableCell>
                                    <TableCell>{safeValue(item.frenos_delanteros)}</TableCell>
                                    <TableCell>{safeValue(item.frenos_traseros)}</TableCell>
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