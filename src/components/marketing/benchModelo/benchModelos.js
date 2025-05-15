import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, MenuItem, Select, Typography, Table, TableHead,
    TableRow, TableCell, TableBody, ButtonGroup, Dialog, DialogTitle,
    DialogContent, DialogActions, Checkbox
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import { toast } from "react-toastify";
import { enqueueSnackbar } from "notistack";
import LoadingCircle from "../../contabilidad/loader";
import Navbar0 from "../../Navbar0";
import { useNavigate } from "react-router-dom";
import DialogResumenComparacion from "../selectoresDialog/resultModeloVersion";

const API = process.env.REACT_APP_API;

const CompararModelos = () => {
    const [modeloBase, setModeloBase] = useState('');
    const [comparables, setComparables] = useState([]);
    const [resultado, setResultado] = useState(null);
    const [modelos, setModelos] = useState([]);
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const [openResumenDialog, setOpenResumenDialog] = useState(false);
    const [lineas, setLineas] = useState([]);
    const [lineaSeleccionada, setLineaSeleccionada] = useState('');



    const toggleResumenDialog = () => setOpenResumenDialog(prev => !prev);

    const handleComparar = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/bench_model/comparar_modelos`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    modelo_base: parseInt(modeloBase),
                    comparables: comparables.map(Number)
                })
            });

            const data = await res.json();
            setResultado(data);
        } catch (error) {
            enqueueSnackbar("Error al comparar modelos", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const fetchModeloVersion = async () => {
        try {
            const res = await fetch(`${API}/bench/get_modelo_version`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            if (res.ok) {
                setModelos(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener modelos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de conexión", { variant: "error" });
        }
    };

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            toast.error('Error cargando menús');
        }
    };

    const handleLineaChange = async (e) => {
        const codigo = e.target.value;
        setLineaSeleccionada(codigo);
        setModeloBase('');
        setComparables([]);

        const res = await fetch(`${API}/bench_model/get_modelos_por_linea/${codigo}`, {
            headers: { Authorization: "Bearer " + jwt }
        });
        const data = await res.json();
        setModelos(data);
    };

    const fetchLineas = async () => {
        try {
            const res = await fetch(`${API}/bench/get_lineas`, {
                headers: { "Authorization": "Bearer " + jwt }
            });
            const data = await res.json();
            setLineas(Array.isArray(data) ? data : []);
        } catch (err) {
            enqueueSnackbar('Error cargando datos', { variant: 'error' });
        }
    };

    useEffect(() => {
        getMenus();
        fetchModeloVersion();
        handleLineaChange();
        fetchLineas()
    }, []);

    const handleDialogToggle = () => setDialogOpen(!dialogOpen);

    const handleToggleComparable = (id) => {
        if (comparables.includes(id)) {
            setComparables(prev => prev.filter(val => val !== id));
        } else if (comparables.length < 3) {
            setComparables(prev => [...prev, id]);
        } else {
            enqueueSnackbar("Solo puedes seleccionar hasta 3 modelos", { variant: "warning" });
        }
    };

    return (
        <>
            {loading ? (<LoadingCircle />) : (
                <div style={{ marginTop: '150px', width: "100%" }}>
                    <Navbar0 menus={menus} />
                    <Box>
                        <ButtonGroup variant="text">
                            <Button onClick={() => navigate('/dashboard')}>Módulos</Button>
                            <Button onClick={() => navigate(-1)}>Catálogos</Button>
                        </ButtonGroup>
                    </Box>
                    <Box padding={4}>
                        <Typography variant="h4" textAlign= "center">Comparar Modelos Versión</Typography>
                        <Grid container spacing={2} >
                            <Grid item xs={3} >
                                <Typography variant="subtitle1">Línea</Typography>
                                <Select
                                    fullWidth
                                    value={lineaSeleccionada}
                                    onChange={handleLineaChange}
                                >
                                    {lineas.map(linea => (
                                        <MenuItem key={linea.codigo_linea} value={linea.codigo_linea}>
                                            {linea.nombre_linea}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="subtitle1">Modelo Base</Typography>
                                <Select
                                    fullWidth
                                    value={modeloBase}
                                    onChange={(e) => setModeloBase(e.target.value)}
                                >
                                    {modelos.map(m => (
                                        <MenuItem key={m.codigo_modelo_version} value={m.codigo_modelo_version}>
                                            {m.nombre_modelo_version}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={5} sx={{alignItems: 'center' }}>
                                <Typography variant="subtitle1">Comparables (hasta 3)</Typography>
                                <Button variant="outlined" fullWidth onClick={handleDialogToggle}>
                                    {comparables.length > 0
                                        ? comparables.map(id => modelos.find(m => m.codigo_modelo_version === id)?.nombre_modelo_version).join(', ')
                                        : "Seleccionar comparables"}
                                </Button>
                            </Grid>
                        </Grid>
                        <Box mt={2} display="flex" gap={2}>
                            <Button variant="contained" color="primary" onClick={handleComparar} sx={{
                                backgroundColor: 'firebrick',
                                color: '#fff',
                                fontSize: '12px',
                                '&:hover': {
                                    backgroundColor: '#b22222'
                                }}} >Comparar
                            </Button>
                            {resultado?.comparables?.length > 0 && (
                                <Button variant="outlined" onClick={toggleResumenDialog} sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }}}>Ver resultados de comparación
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setModeloBase('');
                                    setComparables([]);
                                    setResultado(null);
                                    setLineas([])
                                }}
                                sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }
                                }}>Limpiar todo
                            </Button>
                        </Box>
                        <Dialog open={dialogOpen} onClose={handleDialogToggle} fullWidth maxWidth="md">
                            <DialogTitle>Seleccionar modelos comparables (máx. 3)</DialogTitle>
                            <DialogContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Modelo</TableCell>
                                            <TableCell>Modelo Comercial</TableCell>
                                            <TableCell>Motor</TableCell>
                                            <TableCell>Año</TableCell>
                                            <TableCell>Precio</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {modelos.map((m) => (
                                            <TableRow key={m.codigo_modelo_version}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={comparables.includes(m.codigo_modelo_version)}
                                                        onChange={() => handleToggleComparable(m.codigo_modelo_version)}
                                                        disabled={
                                                            !comparables.includes(m.codigo_modelo_version) &&
                                                            comparables.length >= 3
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{m.nombre_modelo_version}</TableCell>
                                                <TableCell>{m.nombre_modelo_comercial}</TableCell>
                                                <TableCell>{m.nombre_motor}</TableCell>
                                                <TableCell>{m.anio_modelo_version}</TableCell>
                                                <TableCell>{m.precio_producto_modelo}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </DialogContent>
                            <DialogActions sx={{ justifyContent: 'space-between' }}>
                                <Button onClick={() => setComparables([])} sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }}}>Limpiar selección
                                </Button>
                                <Button onClick={handleDialogToggle} sx={{
                                    backgroundColor: 'firebrick',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': {
                                        backgroundColor: '#b22222'
                                    }}}>Cerrar
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <DialogResumenComparacion
                            open={openResumenDialog}
                            onClose={toggleResumenDialog}
                            resultado={resultado}
                            modelos={modelos}
                        />
                        {resultado?.comparables?.length > 0 && (
                            <Box mt={4} mb={2}>
                                <Typography variant="h6" textAlign="center"> Resumen por modelo:</Typography>
                                <Table size="small" sx={{ mt: 1 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Modelo externo</strong></TableCell>
                                            <TableCell><strong>Campos en los que mejora</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {resultado.comparables.map((item, idx) => {
                                            const modelo = modelos.find(m => m.codigo_modelo_version === item.modelo_version);
                                            const mejoras = Object.entries(item.mejor_en)
                                                .flatMap(([detalles]) =>
                                                    detalles.filter(d => d.estado === 'mejor').map(d => d.campo)
                                                );
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{modelo?.nombre_modelo_version || `Modelo ${item.modelo_version}`}</TableCell>

                                                    <TableCell>{mejoras.join(', ')}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                </div>
            )}
        </>
    );
};

export default CompararModelos;
