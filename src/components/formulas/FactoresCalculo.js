import Navbar0 from "../Navbar0";
import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/authContext";
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import AddIcon from '@material-ui/icons/Add';
import {
    List,
    ListItem,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Autocomplete
} from '@mui/material';
import * as Service from "../../services/modulo-formulas";

const tiposOperadores = new Map([
    ['PAR', 'PARÁMETRO'],
    ['VAL', 'VALOR FIJO'],
    ['OPE', 'OPERADOR']
])

const operadores = [
    "+",
    "-",
    "*",
    "/"
]

function FactoresCalculo() {
    const location = useLocation();
    const navigate = useNavigate();
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [factores, setFactores] = useState([]);
    const [parametros, setParametros] = useState([]);
    const queryParams = new URLSearchParams(location.search);
    const codProceso = queryParams.get('proceso');
    const codParametro = queryParams.get('parametro');
    const [addFactor, setAddFactor] = useState(false);
    const [orden, setOrden] = useState(1);
    const [tipoOperador, setTipoOperador] = useState('Seleccione');
    const [operador, setOperador] = useState('');
    const [valorFijo, setValorFijo] = useState('');
    const [codParametroOperador, setCodParametroOperador] = useState('');

    const getMenus = async () => {
        try {
            setMenus(await Service.getMenus(jwt, userShineray, enterpriseShineray, systemShineray));
        } catch (err) {
            toast.error(err.message);
        }
    }

    const getFactores = async () => {
        try {
            setFactores(await Service.getFactores(jwt, enterpriseShineray, codProceso, codParametro));
        } catch (err) {
            toast.error(err.message);
        }
    }

    const getParametrosPorProceso = async () => {
        try {
            setParametros(await Service.getParametrosPorProceso(jwt, enterpriseShineray, codProceso));
        } catch (err) {
            toast.error(err.message);
        }
    }

    const handleAddFactor = async (e) => {
        e.preventDefault();
        try {
            toast.success((await Service.addFactor(jwt, enterpriseShineray, codProceso, codParametro, {
                orden,
                tipo_operador: tipoOperador,
                operador,
                valor_fijo: valorFijo,
                cod_parametro_operador: codParametroOperador
            })).mensaje);
            setTipoOperador('Seleccione');
            setOperador('Seleccione');
            setValorFijo('');
            setCodParametroOperador('');
            getFactores();
        } catch (err) {
            toast.error(err.message);
        }
    }

    const handleDeleteFactor = async (orden) => {
        if (!window.confirm('¿Estás seguro de eliminar el factor?')) {
            return;
        }
        try {
            await Service.deleteFactor(jwt, enterpriseShineray, codProceso, codParametro, orden);
            toast.success('¡Elemento eliminado exitosamente!');
            getFactores();
        } catch (err) {
            toast.error(err.message);
        }
    }

    const checkUltimoTipoOperador = (clave) => {
        if (!factores || factores.length === 0) {
            return clave === 'OPE'
        }
        const ultimoTipo = factores[factores.length - 1].tipo_operador;
        if (ultimoTipo === 'PAR' || ultimoTipo === 'VAL')
            return clave !== 'OPE';
        else
            return clave === 'OPE';
    }

    const checkTipoOperador = (tipo) => {
        switch (tipo) {
            case tiposOperadores.get('PAR'):
                setValorFijo('');
                setOperador('Seleccione');
                break;
            case tiposOperadores.get('VAL'):
                setCodParametroOperador('');
                setOperador('Seleccione');
                break;
            case tiposOperadores.get('OPE'):
                setCodParametroOperador('');
                setValorFijo('');
                break;
            default:
                return;
        }
    }

    useEffect(() => {
        document.title = 'Factores de cálculo';
        getMenus();
        if (codProceso && codParametro) {
            getFactores();
            getParametrosPorProceso();
        }
    }, []);

    useEffect(() => {
        setOrden(factores.length + 1);
    }, [factores]);

    return (
        <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
            <Navbar0 menus={menus} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'right',
                    '& > *': {
                        m: 1,
                    },
                }}
            >
                <ButtonGroup variant="text" aria-label="text button group" >
                    <Button onClick={() => { navigate('/dashboard') }}>Módulos</Button>
                </ButtonGroup>
            </Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Factores de cálculo del proceso {codProceso} y del parámetro {codParametro}
            </Typography>
            {factores.length === 0 && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Aún no se han registrado factores de cálculo
                </Typography>
            )}
            <List sx={{ mt: 2 }} disablePadding>
                {factores.map((item, index) => (
                    <ListItem sx={{ width: '100%' }} key={item.orden}>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    disabled
                                    label="Orden"
                                    value={item.orden}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="l_tipo_operador">Tipo operador</InputLabel>
                                    <Select
                                        labelId="l_tipo_operador"
                                        label="Tipo operador"
                                        disabled
                                        id="tipo_operador"
                                        style={{ width: "100%" }}
                                        value={item.tipo_operador}
                                    >
                                        {Array.from(tiposOperadores).map(([clave, valor]) => (
                                            <MenuItem key={clave} value={clave}>
                                                {valor}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={1}>
                                {item.operador && (
                                    <FormControl fullWidth variant="outlined" disabled>
                                        <InputLabel id="l_operador">Operador</InputLabel>
                                        <Select
                                            labelId="l_operador"
                                            label="Operador"
                                            id="operador"
                                            style={{ width: "100%" }}
                                            value={item.operador}
                                        >
                                            <MenuItem selected key={0} value="Seleccione">Seleccione</MenuItem>
                                            {operadores.map((tipo) => (
                                                <MenuItem key={tipo} value={tipo}>
                                                    {tipo}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Grid>
                            <Grid item xs={2}>
                                {item.valor_fijo && (
                                    <TextField
                                        disabled
                                        id="valor_fijo"
                                        label="Valor fijo"
                                        type="text"
                                        fullWidth
                                        value={item.valor_fijo}
                                    />
                                )}
                            </Grid>
                            <Grid item xs={2}>
                                {item.cod_parametro_operador && (
                                    <TextField
                                        disabled
                                        id="cod_parametro_operador"
                                        label="Parámetro"
                                        type="text"
                                        fullWidth
                                        value={parametros.find(p => p.cod_parametro === item.cod_parametro_operador).parametro.nombre}
                                    />
                                )}
                            </Grid>
                            {factores.length === index + 1 && (
                                <Grid item xs={1}>
                                    <Button onClick={() => { handleDeleteFactor(item.orden) }} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
                                        Quitar
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </ListItem>
                ))}
                {addFactor && (<>
                    <ListItem sx={{ width: '100%' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    disabled
                                    label="Orden"
                                    value={orden}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="l_tipo_operador">Tipo operador</InputLabel>
                                    <Select
                                        labelId="l_tipo_operador"
                                        label="Tipo operador"
                                        id="tipo_operador"
                                        style={{ width: "100%" }}
                                        value={tipoOperador}
                                        onChange={(e) => { const nuevoTipo = e.target.value; checkTipoOperador(tiposOperadores.get(nuevoTipo)); setTipoOperador(nuevoTipo); }}
                                    >
                                        <MenuItem selected key={0} value="Seleccione">Seleccione</MenuItem>
                                        {Array.from(tiposOperadores).map(([clave, valor]) => (
                                            <MenuItem disabled={checkUltimoTipoOperador(clave)}
                                                key={clave}
                                                value={clave}>
                                                {valor}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={1}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="l_operador">Operador</InputLabel>
                                    <Select
                                        labelId="l_operador"
                                        label="Operador"
                                        id="operador"
                                        disabled={tiposOperadores.get(tipoOperador) !== tiposOperadores.get('OPE')}
                                        style={{ width: "100%" }}
                                        value={operador}
                                        onChange={(e) => { setOperador(e.target.value); }}
                                    >
                                        <MenuItem selected key={0} value="Seleccione">Seleccione</MenuItem>
                                        {operadores.map((tipo) => (
                                            <MenuItem key={tipo} value={tipo}>
                                                {tipo}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    disabled={tiposOperadores.get(tipoOperador) !== tiposOperadores.get('VAL')}
                                    id="valor_fijo"
                                    label="Valor fijo"
                                    type="text"
                                    fullWidth
                                    value={valorFijo}
                                    onChange={(e => { setValorFijo(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Autocomplete
                                    disabled={tiposOperadores.get(tipoOperador) !== tiposOperadores.get('PAR')}
                                    id="Parámetro"
                                    options={parametros.map((p) => p.parametro.nombre)}
                                    onChange={(e, value) => {
                                        if (value) {
                                            const parametro = parametros.find(p => p.parametro.nombre === value);
                                            setCodParametroOperador(parametro.cod_parametro);
                                        } else {
                                            setCodParametroOperador('');
                                        }
                                    }}
                                    fullWidth
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Parámetro"
                                            type="text"
                                            value={codParametroOperador}
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </ListItem>
                    <ListItem sx={{ width: '100%' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="center">
                                    <Button onClick={handleAddFactor} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
                                        Agregar
                                    </Button>
                                    <Button onClick={() => setAddFactor(false)} color="primary">
                                        Cancelar
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </ListItem>
                </>)}
            </List>
            {!addFactor && (
                <Box display="flex" justifyContent="center">
                    <Button
                        style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}
                        sx={{ mt: 2 }}
                        onClick={() => setAddFactor(true)}>
                        <AddIcon /> Nuevo
                    </Button>
                </Box>
            )}
        </div>
    );
}

export default FactoresCalculo