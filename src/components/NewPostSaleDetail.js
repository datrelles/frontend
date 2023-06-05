import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import moment from 'moment';
import { SnackbarProvider, useSnackbar } from 'notistack';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@mui/material/Autocomplete';







const API = process.env.REACT_APP_API;


function NewPostSaleDetail(props) {


  const location = useLocation();
  const [formData, setFormData] = useState(location.state)

  const [cantidadPedido, setCantidadPedido] = useState(formData.cantidad_pedido)
  const [codPo, setCodPo] = useState(location.state)
  const [codProducto, setCodProducto] = useState('')
  const [codProductoModelo, setCodProductoModelo] = useState(formData.cod_producto_modelo)
  const [costoSistema, setCostoSistema] = useState(formData.costo_sistema)
  const [empresa, setEmpresa] = useState(formData.empresa)
  const [fechaCrea, setFechaCrea] = useState(formData.fecha_crea)
  const [fechaModifica, setFechaModifica] = useState(formData.fecha_modifica)
  const [fob, setFob] = useState(formData.fob)
  const [fobTotal, setFobTotal] = useState(formData.fob_total)
  const [nombre, setNombre] = useState(formData.nombre)
  const [nombreChina, setNombreChina] = useState("")
  const [nombreIngles, setNombreIngles] = useState("")
  const [saldoProducto, setSaldoProducto] = useState(formData.saldo_producto)
  const [secuencia, setSecuencia] = useState(formData.secuencia)
  const [unidadMedida, setUnidadMedida] = useState(formData.unidad_medida)
  const [usuarioCrea, setUsuarioCrea] = useState(formData.usuario_crea)
  const [usuarioModifica, setUsuarioModifica] = useState(formData.usuario_modifica)
  const [productsList, setProductsList] = useState([])


  const { enqueueSnackbar } = useSnackbar();



  useEffect(() => {
    console.log(location.state)
    getProductsList()

  }, [])



  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_det`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({

        cod_po: codPo,
        secuencia: secuencia,
        empresa: sessionStorage.getItem('currentEnterprise'),
        cod_producto: codProducto,
        cod_producto_modelo: codProductoModelo,
        nombre: nombre,
        nombre_c: nombreChina,
        nombre_i: nombreIngles,
        costo_sistema: parseFloat(costoSistema),
        fob: parseFloat(fob),
        fobTotal: parseFloat(fobTotal),
        cantidad_pedido: parseInt(cantidadPedido, 10),
        saldo_producto: parseInt(saldoProducto, 10),
        unidad_medida: unidadMedida,
        usuario_crea: sessionStorage.getItem('currentUser'),
        fecha_crea: moment().format('DD/MM/YYYY'),
        usuario_modifica: sessionStorage.getItem('currentUser'),
        fecha_modifica: moment().format('DD/MM/YYYY'),
        exportar: false,
        nombre_mod_prov: '',
        nombre_comercial: '',
        tipo_comprobante: 'PO'
      })
    })
    const data = await res.json();
    console.log(data)
    setFormData(location.state)
    if (!data.error) {
      enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
      setFormData(location.state)

    }

  }

  const TabPanel = ({ value, index, children }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

  const opciones = [
    'Opción 1',
    'Opción 2',
    'Opción 3',
  ];

  const getProductsList = async () => {
    const res = await fetch(`${API}/productos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod_producto: item.cod_producto,
    }));
    setProductsList(list)
  }

  const handleProviderChange = (event, value) => {
    if (value) {
      const proveedorSeleccionado = productsList.find((producto) => producto.nombre === value);
      if (proveedorSeleccionado) {
        setCodProducto(proveedorSeleccionado.cod_producto);
        setNombre(proveedorSeleccionado.nombre);
      }
    } else {
      setCodProducto('');
      setNombre('');
    }
  };

  return (
    <div>
      <Navbar0 />
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '30ch' },
          width: '100%'
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ marginTop: '20px' }}>Nuevo Detalle de Orden de Compra</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px' }}
              onClick={handleChange2}>
              <AddIcon /> Crear
            </button>
          </div>
          <TextField
            disabled
            id="id"
            label="Orden de Compra"
            type="text"
            onChange={e => setCodPo(e.target.value)}
            value={codPo}
            className="form-control"
          />

          <TextField
            disabled
            id="secuencia"
            label="Secuencia"
            type="text"
            onChange={e => setSecuencia(e.target.value)}
            value={secuencia}
            className="form-control"
            style={{ width: `120px` }}
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <TextField
            disabled
            id="cod-producto"
            label="Codigo Producto"
            type="text"
            value={codProducto}
            className="form-control"
          />
          <TextField
            required
            id="cod-producto-modelo"
            label="Codigo Producto Modelo"
            type="text"
            onChange={e => setCodProductoModelo(e.target.value)}
            value={codProductoModelo}
            className="form-control"
          />
          <Autocomplete
            id="Producto"
            options={productsList.map((producto) => producto.nombre)}
            onChange={handleProviderChange}
            style={{ width: `580px` }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Producto"
                type="text"
                value={nombre}
                className="form-control"
                style={{ width: `100%` }}
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />
          <TextField
            required
            id="costo-sistema"
            label="Costo Sistema"
            type="number"
            onChange={e => setCostoSistema(e.target.value)}
            value={costoSistema}
            className="form-control"
            style={{ width: `130px` }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <TextField
            required
            id="fob"
            label="Fob"
            type="number"
            onChange={e => setFob(e.target.value)}
            value={fob}
            className="form-control"
            style={{ width: `130px` }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <TextField
            required
            id="fob-total"
            label="Fob Total"
            type="number"
            onChange={e => setFobTotal(e.target.value)}
            value={fobTotal}
            className="form-control"
            style={{ width: `130px` }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <div>

            <TextField
              required
              id="cantidad-pedido"
              label="Cantidad Pedido"
              type="number"
              onChange={e => setCantidadPedido(e.target.value)}
              value={cantidadPedido}
              className="form-control"
              style={{ width: `130px` }}
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
            <TextField
              required
              id="unidad-medida"
              label="Unidad de Medida"
              type="text"
              onChange={e => setUnidadMedida(e.target.value)}
              value={unidadMedida}
              className="form-control"
            />
            <TextField
              required
              id="saldo-producto"
              label="Saldo Producto"
              type="text"
              onChange={e => setSaldoProducto(e.target.value)}
              value={saldoProducto}
              className="form-control"
              style={{ width: `130px` }}
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
          </div>
        </div>


      </Box>
    </div>
  );
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <NewPostSaleDetail />
    </SnackbarProvider>
  );
}