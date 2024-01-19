import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import Autocomplete from '@mui/material/Autocomplete';
import { useAuthContext } from '../context/authContext';
import { SnackbarProvider, useSnackbar } from 'notistack';

const API = process.env.REACT_APP_API;

const NewFormuleD = ({ onClose, onAgregarDetalle, debitoCredito}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
  const [codProducto, setCodProducto] = useState('');
  const [entradaCodProducto, setEntradaCodProducto] = useState("")
  const [cantidad, setCantidad] = useState(0);

  const [productoList, setProductoList] = useState([])
  const [nombreProducto, setNombreProducto] = useState("");


  const [status1, setStatus1] = useState("01")
  const [status2, setStatus2] = useState("Z")
  const [status3, setStatus3] = useState("MTR")

  const [statusList1, setStatusList1] = useState([])
  const [statusList2, setStatusList2] = useState([])
  const [statusList3, setStatusList3] = useState([])

  const [statusList1Nombre, setStatusList1Nombre] = useState([])
  const [statusList2Nombre, setStatusList2Nombre] = useState([])
  const [statusList3Nombre, setStatusList3Nombre] = useState([])


  const getProductList = async (status3) => {
    const res = await fetch(`${API}/productos_by_cat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
        cod_modelo_cat: 'PRO2',
        cod_item_cat: status2,
        cod_modelo: 'PRO1',
        cod_item: status1,
        cod_modelo_cat1: 'PRO3',
        cod_item_cat1: status3
      })
    })
    const data = await res.json();
    console.log(data)
    setProductoList(data)
    setNombreProducto(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');

  }

  const getStatusList1 = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO1`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
    })
    const data = await res.json();
    console.log(data)
    setStatusList1(data)
  }

  const getStatusList2 = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO2`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
    })
    const data = await res.json();
    console.log(data)
    setStatusList2(data)
  }
  const getStatusList3 = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO3`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
    })
    const data = await res.json();
    console.log(data)
    setStatusList3(data)
  }

  const handleStatus1Change = (event, value) => {
    if (value) {
      const statusSeleccionado = statusList1.find((status) => status.nombre === value);
      if (statusSeleccionado) {
        setStatus1(statusSeleccionado.cod_item);
        setStatusList1Nombre(statusSeleccionado.nombre)
      }
    } else {
      setStatus1('01');
      setStatusList1Nombre('')
    }
  };

  const handleStatus2Change = (event, value) => {
    if (value) {
      const statusSeleccionado = statusList2.find((status) => status.nombre === value);
      if (statusSeleccionado) {
        setStatus2(statusSeleccionado.cod_item);
        setStatusList2Nombre(statusSeleccionado.nombre)
      }
    } else {
      setStatus2('Z');
      setStatusList2Nombre('')
    }
  };

  const handleStatus3Change = (event, value) => {
    if (value) {
      const statusSeleccionado = statusList3.find((status) => status.nombre === value);
      if (statusSeleccionado) {
        setStatus3(statusSeleccionado.cod_item);
        setStatusList3Nombre(statusSeleccionado.nombre)
        getProductList(statusSeleccionado.cod_item);
      }
    } else {
      setStatus3('MTR');
      setStatusList3Nombre('')
    }


  };

  const handleProductoChange = (event, value) => {
    if (value) {
      const productoSeleccionado = productoList.find((producto) => producto.nombre === value);
      if (productoSeleccionado) {
        setCodProducto(productoSeleccionado.cod_producto);
        setNombreProducto(productoSeleccionado.nombre)
      }
    } else {
      setCodProducto('');
      setNombreProducto('')
    }
  };

  
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
        const res = await fetch(`${API}/productos_by_cod`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
                empresa: enterpriseShineray,
                cod_producto: entradaCodProducto
            })
        })
        const data = await res.json();
        console.log(data)
        setProductoList(data)
        setNombreProducto(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');
    }
};

  useEffect(() => {
    getStatusList1();
    getStatusList2();
    getStatusList3();
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
  if (cantidad && cantidad>0) {
    onAgregarDetalle({
      cod_producto_f: codProducto,
      cantidad_f: parseInt(cantidad, 10),
      debito_credito: parseInt(debitoCredito, 10) === 2 ? 1 : 2,
    });

    onClose();
  } else {
    // Manejar el caso donde cantidad es 0 o nulo (puedes mostrar un mensaje de error, por ejemplo)
    enqueueSnackbar('Ingrese Cantidad', { variant: 'error' });
    // O puedes retornar temprano para evitar ejecutar el resto del código
    // return;
  }
  };

  return (
    <form>
      <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
      <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    required
                                    id="codigo-producto"
                                    label="Buscar por codigo"
                                    type="text"
                                    onChange={e => setEntradaCodProducto(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    value={entradaCodProducto}
                                    className="form-control"
                                />
                                <TextField
                                    disabled
                                    fullWidth
                                    id="cod-prod"
                                    label="Codigo Producto"
                                    type="text"
                                    onChange={e => setCodProducto(e.target.value)}
                                    value={codProducto}
                                    className="form-control"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    id="estado2"
                                    fullWidth
                                    options={statusList2.map((producto) => producto.nombre)}
                                    value={statusList2Nombre}
                                    onChange={handleStatus2Change}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={1}
                                            label="Linea"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                                <Autocomplete
                                    id="producto"
                                    fullWidth
                                    options={productoList.map((producto) => producto.nombre)}
                                    value={nombreProducto}
                                    onChange={handleProductoChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={2}
                                            label="Producto"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    id="estado3"
                                    fullWidth
                                    options={statusList3.map((producto) => producto.nombre)}
                                    value={statusList3Nombre}
                                    onChange={handleStatus3Change}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={1}
                                            label="Categoria"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    id="estado1"
                                    fullWidth
                                    options={statusList1.map((status) => status.nombre)}
                                    value={statusList1Nombre}
                                    onChange={handleStatus1Change}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            multiline
                                            rows={1}
                                            label="Tipo de Articulo"
                                            type="text"
                                            className="form-control"
                                            InputProps={{
                                                ...params.InputProps,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                        </Grid>
                        </Grid>
      </div>
      <TextField
        label="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
      />
      <button
        className="btn btn-primary btn-block"
        type="button"
        style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
        onClick={handleSubmit}>
        <SaveIcon /> Agregar
      </button>
      <button
        className="btn btn-primary btn-block"
        type="button"
        style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
        onClick={onClose}>
        <CancelIcon /> Cancelar
      </button>
    </form>
  );
};

export default NewFormuleD;
