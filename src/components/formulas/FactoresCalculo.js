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
    Grid
} from '@mui/material';

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

const API = process.env.REACT_APP_API;

function FactoresCalculo() {
    const location = useLocation();
    const navigate = useNavigate();
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
    const [menus, setMenus] = useState([]);
    const [factores, setFactores] = useState([]);
    const queryParams = new URLSearchParams(location.search);
    const codProceso = queryParams.get('proceso');
    const codParametro = queryParams.get('parametro');
    const [addFactor, setAddFactor] = useState(false);
    const [orden, setOrden] = useState(1);
    const [tipoOperador, setTipoOperador] = useState('Seleccione');
    const [operador, setOperador] = useState('');
    const [valorFijo, setValorFijo] = useState('');
    const [codParametroOperador, setCodParametroOperador] = useState('');
    const [nombreParametroOperador, setNombreParametroOperador] = useState('');
    const [nuevoFactor, setNuevoFactor] = useState('');

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setMenus(data)
                console.log(data)
            }
        } catch (error) {
            console.log(error);
            toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
        }
    }

    const getFactores = async () => {
        try {
            const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}/parametros/${codParametro}/factores`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });
            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setFactores(data);
                setOrden(data ? data.length + 1 : 0);
            }
        } catch (error) {
            console.log(error);
            toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
        }
    }

    const checkTipoOperador = (tipo) => {
        switch (tipo) {
            case tiposOperadores.get('PAR'):
                setValorFijo('');
                setOperador('Seleccione');
                break;
            case tiposOperadores.get('VAL'):
                setCodParametroOperador('');
                setNombreParametroOperador('');
                setOperador('Seleccione');
                break;
            case tiposOperadores.get('OPE'):
                setCodParametroOperador('');
                setNombreParametroOperador('');
                setValorFijo('');
                break;
            default:
                return;
        }
    }

    const handleAddFactor = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}/parametros/${codParametro}/factores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                orden,
                tipo_operador: tipoOperador,
                operador,
                valor_fijo: valorFijo,
                cod_parametro_operador: codParametroOperador
            })
        });
        if (!res.ok) {
            if (res.status === 401) {
                toast.error('Sesión caducada.');
                return;
            }
        }
        const { mensaje } = await res.json();
        if (res.ok) {
            toast.success(mensaje)
            setOrden('');
            setTipoOperador('Seleccione');
            setOperador('Seleccione');
            setValorFijo('');
            setCodParametroOperador('');
            setNombreParametroOperador('');
            setNuevoFactor(codProceso, codParametro, orden);
        } else {
            toast.error(mensaje)
        }
    }

    useEffect(() => {
        document.title = 'Factores de cálculo';
        getMenus();
        if (codProceso && codParametro)
            getFactores();
    }, []);

    useEffect(() => {
        getFactores();
    }, [nuevoFactor]);

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
            <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
                <button
                    className="btn btn-primary btn-block"
                    type="button"
                    style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                    onClick={() => setAddFactor(true)}>
                    <AddIcon /> Nuevo
                </button>
            </div>
            <Grid container spacing={2}>
                {factores.map((item, index) => (
                    <Grid item xs={12}>
                        <List disablePadding>
                            <ListItem sx={{ width: '100%' }} key={item.orden}>
                                <Grid item xs={3}>
                                    <TextField
                                        disabled
                                        label="Orden"
                                        value={item.orden}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <Select
                                        disabled
                                        style={{ width: "100%" }}
                                        value={item.tipo_operador}
                                        label="Tipo operador"
                                    >
                                        {Array.from(tiposOperadores).map(([clave, valor]) => (
                                            <MenuItem key={clave} value={clave}>
                                                {valor}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={1}>
                                    <Select
                                        disabled
                                        id="operador"
                                        style={{ width: "100%" }}
                                        value={item.operador}
                                        label="Operador"
                                    >
                                        <MenuItem selected key={0} value="Seleccione">Seleccione</MenuItem>
                                        {operadores.map((tipo) => (
                                            <MenuItem key={tipo} value={tipo}>
                                                {tipo}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        disabled
                                        id="valor_fijo"
                                        label="Valor fijo"
                                        type="text"
                                        fullWidth
                                        value={item.valor_fijo}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        disabled
                                        id="cod_parametro_operador"
                                        label="Parámetro"
                                        type="text"
                                        fullWidth
                                        value={item.cod_parametro_operador}
                                    />
                                </Grid>
                            </ListItem>
                        </List>
                    </Grid>
                ))}
            </Grid>
            {addFactor && (<>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <TextField
                            disabled
                            label="Orden"
                            value={orden}
                            onChange={(e) => { setOrden(e.target.value) }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Select
                            style={{ width: "100%" }}
                            value={tipoOperador}
                            label="Tipo operador"
                            onChange={(e) => { const nuevoTipo = e.target.value; checkTipoOperador(tiposOperadores.get(nuevoTipo)); setTipoOperador(nuevoTipo); }}
                        >
                            <MenuItem selected key={0} value="Seleccione">Seleccione</MenuItem>
                            {Array.from(tiposOperadores).map(([clave, valor]) => (
                                <MenuItem key={clave} value={clave}>
                                    {valor}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={1}>
                        <Select
                            disabled={tiposOperadores.get(tipoOperador) !== tiposOperadores.get('OPE')}
                            id="operador"
                            style={{ width: "100%" }}
                            value={operador}
                            label="Operador"
                            onChange={(e) => { setOperador(e.target.value); }}
                        >
                            <MenuItem selected key={0} value="Seleccione">Seleccione</MenuItem>
                            {operadores.map((tipo) => (
                                <MenuItem key={tipo} value={tipo}>
                                    {tipo}
                                </MenuItem>
                            ))}
                        </Select>
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
                    <Grid item xs={1}>
                        <TextField
                            disabled={tiposOperadores.get(tipoOperador) !== tiposOperadores.get('PAR')}
                            id="cod_parametro_operador"
                            label="Parámetro"
                            type="text"
                            fullWidth
                            value={codParametroOperador}
                            onChange={(e => { setCodParametroOperador(e.target.value) })}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            disabled
                            id="nombre_parametro_operador"
                            label="Nombre del parámetro"
                            type="text"
                            fullWidth
                            value={nombreParametroOperador}
                            onChange={(e => { setNombreParametroOperador(e.target.value) })}
                        />
                    </Grid>
                </Grid>
                <Button onClick={handleAddFactor} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
                    Agregar
                </Button>
                <Button onClick={() => setAddFactor(false)} color="primary">
                    Cancelar
                </Button>
            </>)}
        </div>
    );
}

export default FactoresCalculo