import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import moment from 'moment';
import { SnackbarProvider, useSnackbar } from 'notistack';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';


const API = process.env.REACT_APP_API;

function NewPostSaleDetail(props) {


  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
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
  const [productModelList, setProductModelList] = useState([])

  const { enqueueSnackbar } = useSnackbar();

  const unidadesMedida = [
    {
      name: "U",
      label: "Unidad"
    },
    {
      name: "PCS",
      label: "Piezas"
    },
    {
      name: "SET",
      label: "Set"
    }
  ]

  useEffect(() => {
    document.title = 'Nuevo Detalle de Orden';
    getProductsList()
    getProductModelList()

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
        empresa: sessionStorage.getItem('currentEnterprise'),
        usuario_crea: sessionStorage.getItem('currentUser'),
        orders: [{
          secuencia: secuencia,
          cod_producto: codProducto,
          cod_producto_modelo: codProductoModelo,
          nombre_proveedor: nombre,
          nombre_c: nombreChina,
          nombre_ingles: nombreIngles,
          costo_sistema: parseFloat(costoSistema),
          fob: parseFloat(fob),
          fobTotal: parseFloat(fobTotal),
          pedido: parseInt(cantidadPedido, 10),
          saldo_producto: parseInt(saldoProducto, 10),
          unidad_medida: unidadMedida,
          fecha_crea: moment().format('DD/MM/YYYY'),
          usuario_modifica: sessionStorage.getItem('currentUser'),
          fecha_modifica: moment().format('DD/MM/YYYY'),
          exportar: false,
          nombre_mod_prov: '',
          nombre_comercial: '',
          tipo_comprobante: 'PO',
          agrupado: false
        }]

      })
    })
    const data = await res.json();
    console.log(data.mensaje)
    setFormData(location.state)

    if (!data.error) {
      setCodPo(data.cod_po)
      if (data.cod_producto_no_existe)
        enqueueSnackbar(data.mensaje + ' ' + data.cod_producto_modelo_no_existe, { variant: 'warning' });
      if (data.unidad_medida_no_existe)
        enqueueSnackbar(data.mensaje + ' ' + data.unidad_medida_no_existe, { variant: 'warning' });
      if (data.cod_producto_modelo_no_existe)
        enqueueSnackbar(data.mensaje + ' ' + data.cod_producto_modelo_no_existe, { variant: 'warning' });
      if (!data.cod_producto_no_existe && !data.unidad_medida_no_existe && !data.cod_producto_modelo_no_existe) {
        enqueueSnackbar(data.mensaje, { variant: 'success' });
      }
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }
  }

  const getProductsList = async () => {
    const res = await fetch(`${API}/productos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    console.log(data)
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod_producto: item.cod_producto,
      costo: item.costo
    }));
    setProductsList(list)
  }

  const getProductModelList = async () => {
    const res = await fetch(`${API}/producto_modelo`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    console.log(data)
    const list = data.map((item) => ({
      codigo: item.cod_producto,
      nombre: item.nombre,
    }));
    setProductModelList(list)
  }

  const handleProviderChange = (event, value) => {
    
    if (value) {
      const productoSeleccionado = productsList.find((producto) => producto.nombre === value);
      if (productoSeleccionado) {
        setCodProducto(productoSeleccionado.cod_producto);
        setNombre(productoSeleccionado.nombre);
        setCostoSistema(productoSeleccionado.costo)
      }
    } else {
      setCodProducto('');
      setNombre('');
    }
  }

  const handleProductModelChange = (event, value) => {
    if (value) {
      const productoSeleccionado = productModelList.find((producto) => producto.nombre === value);
      if (productoSeleccionado) {
        setCodProductoModelo(productoSeleccionado.codigo);
      }
    } else {
      setCodProductoModelo('');
    }
  }

  const handleMeasureChange = (event, value) => {
    if (value) {
      const unidadSeleccionada = unidadesMedida.find((unidad) => unidad.label === value);
      if (unidadSeleccionada) {
        setUnidadMedida(unidadSeleccionada.name);
      }
    } else {
      setUnidadMedida('');
    }
  }



  return (
    <div style={{ marginTop: '150px'}}>
      <Navbar0  menus={menus}/>
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
          <Button onClick={() => { navigate('/postSales') }}>Ordenes de Compra</Button>
          <Button onClick={() => { navigate(-1) }}>Editar Orden de Compra</Button>
        </ButtonGroup>
      </Box>
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
          <Autocomplete
            id="ProductoModelo"
            options={productModelList.map((producto) => producto.nombre)}
            onChange={handleProductModelChange}
            style={{ width: `290px` }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Producto Modelo"
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
            disabled
            id="cod-producto"
            label="Codigo Producto"
            type="text"
            value={codProducto}
            className="form-control"
          />
          <TextField
            disabled
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
              id="cantidad-pedido"
              label="Cantidad Pedido"
              type="number"
              onChange={e => setCantidadPedido(e.target.value)}
              value={cantidadPedido}
              className="form-control"
              style={{ width: `160px` }}
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
            <Autocomplete
            id="unidad-medida"
            options={unidadesMedida.map((unidadesMedida) => unidadesMedida.label)}
            onChange={handleMeasureChange}
            style={{ width: `120px` }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Unidad de Medida"
                type="text"
                value={unidadMedida}
                className="form-control"
                style={{ width: `160%` }}
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />
            <TextField
              disabled
              id="saldo-producto"
              label="Saldo Producto"
              type="text"
              onChange={e => setSaldoProducto(e.target.value)}
              value={saldoProducto}
              className="form-control"
              style={{ width: `160px` }}
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
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