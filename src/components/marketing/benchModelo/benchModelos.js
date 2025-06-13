import React, { useEffect, useState } from 'react';
import {
    Box, Button, Grid, ButtonGroup, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Autocomplete
} from '@mui/material';
import { useAuthContext } from "../../../context/authContext";
import { toast } from "react-toastify";
import {enqueueSnackbar, SnackbarProvider} from "notistack";
import LoadingCircle from "../../contabilidad/loader";
import Navbar0 from "../../Navbar0";
import { useNavigate } from "react-router-dom";
import ResumenComparacion from "../selectoresDialog/resultModeloVersion";

const API = process.env.REACT_APP_API;

function CompararModelos()  {

    const [resultado, setResultado] = useState(null);
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [lineas, setLineas] = useState([]);
    const [imagenModal, setImagenModal] = useState(null);
    const [openModalImagen, setOpenModalImagen] = useState(false);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const lineaAutomotriz = lineas.find((l) => l.nombre_linea?.toUpperCase() === 'AUTOMOTRIZ');
    const [comparacionActiva, setComparacionActiva] = useState(false);
    const [bloquearInputs, setBloquearInputs] = useState(false);

    const lineasFiltradas = lineaAutomotriz
        ? lineas.filter((l) => l.codigo_linea_padre === lineaAutomotriz.codigo_linea)
        : [];

    const lineaPadre = lineas.find(
        (l) => l.nombre_linea?.toUpperCase() === "AUTOMOTRIZ"
    );

    const lineasHijas = lineas.filter(
        (l) => l.codigo_linea_padre === lineaPadre?.codigo_linea
    );


    const numeroModelos = 5;

    const [bloques, setBloques] = useState(
        Array(numeroModelos).fill().map(() => ({
            linea: null,
            segmento: null,
            modelo: null,
            marca: null
        }))
    );

    const [segmentosPorBloque, setSegmentosPorBloque] = useState(
        Array(numeroModelos).fill([])
    );

    const [modelosPorBloque, setModelosPorBloque] = useState(
        Array(numeroModelos).fill([])
    );
    const [marcasPorBloque, setMarcasPorBloque] = useState(
        Array(numeroModelos).fill([])
    );

    const textFieldSmallSx = {
        width: 260,
        '& .MuiInputBase-root': {
            fontSize: '11px',
            height: 32,
            paddingY: 0
        },
        '& .MuiInputLabel-root': {
            fontSize: '11px'
        }
    };

    const handleComparar = async () => {
        const modeloBase = bloques[0]?.modelo;
        const comparables = bloques.slice(1).map(b => b.modelo).filter(Boolean);

        if (!modeloBase?.codigo_modelo_version || comparables.length === 0) {
            enqueueSnackbar("Debes seleccionar un modelo base y al menos un comparable", { variant: 'warning' });
            return;
        }

        const codigosComparables = comparables
            .map(m => m.codigo_modelo_version)
            .filter((id, index, self) => id !== modeloBase.codigo_modelo_version && self.indexOf(id) === index);

        if (codigosComparables.length === 0) {
            enqueueSnackbar("Los modelos comparables deben ser diferentes entre sí y al modelo base", { variant: 'warning' });
            return;
        }

        setLoading(true);
        setBloquearInputs(true);

        try {
            const res = await fetch(`${API}/bench_model/comparar_modelos`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    modelo_base: modeloBase.codigo_modelo_version,
                    comparables: codigosComparables
                })
            });

            const data = await res.json();
            setResultado(data);
            setComparacionActiva(true);

        } catch (error) {
            enqueueSnackbar("Error al comparar los modelos", { variant: "error" });
        } finally {
            setLoading(false);
            setBloquearInputs(true);
        }
    };

    const fetchImagenData = async () => {
        try {
            const res = await fetch(`${API}/bench/get_imagenes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                }
            });
            const data = await res.json();
            if (res.ok) {
                setImagenModal(data);
            } else {
                enqueueSnackbar(data.error || "Error al obtener imágenes", { variant: "error" });
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

    const exportarExcel = async () => {
        const modelos = bloques.map(b => b.modelo).filter(Boolean);
        const res = await fetch(`${API}/bench_model/exportar_comparacion_xlsx`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resultado,
                modelos
            })
        });

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'comparacion_modelos.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleLineaChange = async (index, linea) => {
        const nuevosBloques = [...bloques];
        nuevosBloques[index] = { linea, segmento: null, marca: null, modelo: null };

        if (index === 0) {
            for (let i = 1; i < nuevosBloques.length; i++) {
                nuevosBloques[i] = {
                    linea,
                    segmento: null,
                    marca: null,
                    modelo: null
                };
            }
        }
        setBloques(nuevosBloques);

        const resSeg = await fetch(`${API}/bench_model/get_segmentos_por_linea/${linea.codigo_linea}`, {
            headers: { Authorization: 'Bearer ' + jwt }
        });
        const dataSeg = await resSeg.json();
        setSegmentosPorBloque(prev => {
            const copia = [...prev];
            copia[index] = dataSeg;

            if (index === 0) {
                for (let i = 1; i < copia.length; i++) {
                    copia[i] = [];
                }
            }

            return copia;
        });

        setModelosPorBloque(prev => {
            const copia = [...prev];
            copia[index] = [];
            if (index === 0) {
                for (let i = 1; i < copia.length; i++) copia[i] = [];
            }

            return copia;
        });

        setMarcasPorBloque(prev => {
            const copia = [...prev];
            copia[index] = [];
            if (index === 0) {
                for (let i = 1; i < copia.length; i++) copia[i] = [];
            }

            return copia;
        });
    };

    const handleSegmentoChange = async (index, segmento) => {
        const nuevosBloques = [...bloques];
        nuevosBloques[index].segmento = segmento;
        nuevosBloques[index].marca = null;
        nuevosBloques[index].modelo = null;

        if (index === 0) {
            for (let i = 1; i < nuevosBloques.length; i++) {
                if (
                    nuevosBloques[i].linea?.codigo_linea === nuevosBloques[0].linea?.codigo_linea
                ) {
                    nuevosBloques[i].segmento = segmento;
                    nuevosBloques[i].marca = null;
                    nuevosBloques[i].modelo = null;
                }
            }
        }

        setBloques(nuevosBloques);

        const linea = nuevosBloques[index].linea;
        const res = await fetch(`${API}/bench_model/get_marcas_por_linea_segmento?codigo_linea=${linea.codigo_linea}&nombre_segmento=${encodeURIComponent(segmento.nombre_segmento)}`, {
            headers: { Authorization: 'Bearer ' + jwt }
        });
        const data = await res.json();
        setMarcasPorBloque(prev => {
            const copia = [...prev];
            copia[index] = data;
            if (index === 0) {
                for (let i = 1; i < nuevosBloques.length; i++) {
                    if (
                        nuevosBloques[i].linea?.codigo_linea === nuevosBloques[0].linea?.codigo_linea &&
                        nuevosBloques[i].segmento?.nombre_segmento === segmento.nombre_segmento
                    ) {
                        copia[i] = data;
                    }
                }
            }
            return copia;
        });

        setModelosPorBloque(prev => {
            const copia = [...prev];
            copia[index] = [];
            if (index === 0) {
                for (let i = 1; i < nuevosBloques.length; i++) {
                    if (
                        nuevosBloques[i].linea?.codigo_linea === nuevosBloques[0].linea?.codigo_linea &&
                        nuevosBloques[i].segmento?.nombre_segmento === segmento.nombre_segmento
                    ) {
                        copia[i] = [];
                    }
                }
            }
            return copia;
        });

        if (index === 0) {
            const marcaShineray = data.find(m => m.nombre_marca?.toUpperCase().trim() === "SHINERAY");
            if (marcaShineray && !nuevosBloques[0].marca) {
                const nuevosBloquesConMarca = [...nuevosBloques];
                nuevosBloquesConMarca[0].marca = marcaShineray;
                setBloques(nuevosBloquesConMarca);

                const resModelos = await fetch(`${API}/bench_model/get_modelos_por_linea_segmento_marca?codigo_linea=${linea.codigo_linea}&nombre_segmento=${encodeURIComponent(segmento.nombre_segmento)}&codigo_marca=${marcaShineray.codigo_marca}`, {
                    headers: { Authorization: 'Bearer ' + jwt }
                });
                const modelosData = await resModelos.json();
                console.log('Modelos para SHINERAY:', modelosData);

                setModelosPorBloque(prev => {
                    const copia = [...prev];
                    copia[0] = modelosData;
                    return copia;
                });
            }
        }
    };

    const handleMarcasChange = async (index, marca) => {
        const nuevosBloques = [...bloques];
        nuevosBloques[index].marca = marca;
        nuevosBloques[index].modelo = null;
        setBloques(nuevosBloques);

        const linea = nuevosBloques[index].linea;
        const segmento = nuevosBloques[index].segmento;

        const res = await fetch(`${API}/bench_model/get_modelos_por_linea_segmento_marca?codigo_linea=${linea.codigo_linea}&nombre_segmento=${encodeURIComponent(segmento.nombre_segmento)}&codigo_marca=${marca.codigo_marca}`, {
            headers: { Authorization: 'Bearer ' + jwt }
        });

        const data = await res.json();
        setModelosPorBloque(prev => {
            const copia = [...prev];
            copia[index] = data;
            return copia;
        });
    };

    const handleModeloChange = (index, modelo) => {
        const actualizados = [...bloques];
        actualizados[index].modelo = modelo;
        setBloques(actualizados);
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await getMenus();
                await fetchLineas();
                await fetchImagenData();
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            }
        };
        cargarDatos();
    }, []);

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
                    <Box padding={2}>
                        <Grid container spacing={2} justifyContent="center">
                            {bloques.map((bloque, index) => {
                                if (comparacionActiva && index > 0 && !bloque.modelo) return null;
                                return (
                                    <Grid key={index} item xs={12} sm={6} md={2.4}>
                                        <Box sx={{
                                            border: '1px solid #ccc',
                                            borderRadius: 2,
                                            p: 1,
                                            textAlign: 'center',
                                            minHeight: 150,
                                            width: 290,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            mb: 1
                                        }}>
                                            <Box mt={1} fontSize="10px">
                                                <strong>MARCA: </strong>{bloque.modelo?.nombre_marca}<br />
                                                <strong>MODELO: </strong> {bloque.modelo?.nombre_modelo_comercial}<br/>
                                                <strong>PRECIO VENTA CLIENTE: </strong> $ {bloque.modelo?.precio_producto_modelo}<br/>
                                            </Box>
                                            <Box sx={{
                                                height: 150,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {bloque.modelo?.path_imagen && (
                                                    <img
                                                        src={bloque.modelo.path_imagen}
                                                        alt="modelo"
                                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                    />
                                                )}
                                            </Box>
                                            <Autocomplete
                                                size="small"
                                                options={lineasHijas}
                                                value={bloque.linea}
                                                getOptionLabel={(op) => op?.nombre_linea || ''}
                                                onChange={(e, v) => handleLineaChange(index, v)}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Línea" sx={textFieldSmallSx} />
                                                )}
                                                disabled={bloquearInputs || index !== 0}
                                            />
                                            <Autocomplete
                                                size="small"
                                                options={segmentosPorBloque[index] || []}
                                                value={bloque.segmento}
                                                getOptionLabel={(op) => op?.nombre_segmento || ''}
                                                onChange={(e, v) => handleSegmentoChange(index, v)}
                                                renderInput={(params) => <TextField {...params} label="Segmento" sx={textFieldSmallSx} />}
                                                disabled={bloquearInputs || index !== 0 || !bloque.linea}
                                            />
                                            <Autocomplete
                                                size="small"
                                                options={marcasPorBloque[index] || []}
                                                value={bloque.marca}
                                                getOptionLabel={(op) => op?.nombre_marca || ''}
                                                onChange={(e, v) => handleMarcasChange(index, v)}
                                                renderInput={(params) => <TextField {...params} label="Marca" sx={textFieldSmallSx} />}
                                                disabled={bloquearInputs || !bloque.segmento}
                                            />
                                            <Autocomplete
                                                size="small"
                                                options={modelosPorBloque[index] || []}
                                                value={bloque.modelo}
                                                getOptionLabel={(op) => op?.nombre_modelo_comercial || ''}
                                                onChange={(e, v) => handleModeloChange(index, v)}
                                                renderInput={(params) => <TextField {...params} label="Modelo" sx={textFieldSmallSx} />}
                                                disabled={bloquearInputs || !bloque.marca}
                                            />
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                        <Box mt={2} display="flex" gap={2}>
                            <Button variant="contained" color="primary" onClick={handleComparar} sx={{
                                backgroundColor: 'firebrick',
                                color: '#fff',
                                fontSize: '12px',
                                '&:hover': {
                                    backgroundColor: '#b22222'
                                }}} >COMPARAR MODELOS
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={exportarExcel}
                                sx={{
                                    backgroundColor: 'green',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': { backgroundColor: '#1b5e20' }
                                }}>Exportar
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setComparacionActiva(false);
                                    setResultado(null);
                                    setBloquearInputs(false);
                                    setBloques(Array(numeroModelos).fill().map(() => ({
                                        linea: null,
                                        segmento: null,
                                        modelo: null
                                    })));
                                    setSegmentosPorBloque(Array(numeroModelos).fill([]));
                                    setModelosPorBloque(Array(numeroModelos).fill([]));
                                }}
                                sx={{
                                    backgroundColor: '#535353',
                                    color: '#fff',
                                    fontSize: '12px',
                                    '&:hover': { backgroundColor: '#535353' }
                                }}
                            >
                                Nueva Consulta
                            </Button>
                        </Box>
                        <ResumenComparacion resultado={resultado} bloques={bloques} />
                        <Dialog open={openModalImagen} onClose={() => setOpenModalImagen(false)} maxWidth="md" fullWidth>
                            <DialogTitle>Vista de Imagen</DialogTitle>
                            <DialogContent>
                                <img
                                    src={selectedImagen}
                                    title="Vista previa imagen"
                                    style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                                    alt="Vista previa imagen"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenModalImagen(false)} color="primary">
                                    Cerrar
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </div>
            )}
        </>
    );
}

export default function  IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <CompararModelos />
        </SnackbarProvider>
    );
}
