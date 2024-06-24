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

const NewFormuleD = ({ onClose, onAgregarDetalle, debitoCredito }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
  const [codProducto, setCodProducto] = useState('');
  const [entradaCodProducto, setEntradaCodProducto] = useState("")
  const [cantidad, setCantidad] = useState(0);
  const [costoStantard, setCostoStandard] = useState("%");
  const [error, setError] = useState('');
  const [productoList, setProductoList] = useState([])
  const [nombreProducto, setNombreProducto] = useState("");


  const [status1, setStatus1] = useState("01")
  const [status2, setStatus2] = useState("Z")
  const [status3, setStatus3] = useState("MTR")

  const [statusList1, setStatusList1] = useState([])
  const [statusList2, setStatusList2] = useState([])
  const [statusList3, setStatusList3] = useState([])


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
    if (cantidad && cantidad > 0) {
      onAgregarDetalle({
        cod_producto_f: codProducto,
        cantidad_f: parseInt(cantidad, 10),
        debito_credito: parseInt(debitoCredito, 10) === 2 ? 1 : 2,
        costo_standard: parseFloat(costoStantard, 10)
      });

      onClose();
    } else {
      enqueueSnackbar('Ingrese Cantidad', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;

    if (value.endsWith('%')) {
      value = value.slice(0, -1);
    }
   
    const numValue = parseFloat(value);
    if (numValue <= 0 || numValue > 100) {
      setError('El valor debe ser mayor a 0 y menor o igual a 100');
    } else {
      setError('');
    }

    setCostoStandard(value);
  };

  const handleFocus = (e) => {
    let value = e.target.value;

    // Remove percentage sign when focused
    if (value.endsWith('%')) {
      value = value.slice(0, -1);
    }

    setCostoStandard(value);
  };

  const handleBlur = (e) => {
    let value = e.target.value;

    // Add percentage sign when blurred
    if (!value.endsWith('%')) {
      value = `${value}%`;
    }

    setCostoStandard(value);
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
          </Grid>
          <Grid item xs={12} md={3}>
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
      {parseInt(debitoCredito, 10) !== 1 && (
        <TextField
          label="Costo Porcentual"
          value={costoStantard}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          error={!!error}
          helperText={error}
          type="text"
          InputProps={{
            inputProps: {
              style: {
                textAlign: 'right'
              }
            },
          }}
        />
      )}
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
