import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import moment from 'moment';
import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';




const API = process.env.REACT_APP_API;


function PostSaleDetails(props) {


  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const navigate = useNavigate();

  const [cantidadPedido, setCantidadPedido] = useState(formData.cantidad_pedido)
  const [codPo, setCodPo] = useState(formData.cod_po)
  const [codProducto, setCodProducto] = useState(formData.cod_producto)
  const [codProductoModelo, setCodProductoModelo] = useState(formData.cod_producto_modelo)
  const [costoSistema, setCostoSistema] = useState(formData.costo_sistema)
  const [costoCotizado, setCostoCotizado] = useState(formData.costo_cotizado)
  const [empresa, setEmpresa] = useState(formData.empresa)
  const [fechaCrea, setFechaCrea] = useState(formData.fecha_crea)
  const [fechaModifica, setFechaModifica] = useState(formData.fecha_modifica)
  const [fob, setFob] = useState(formData.fob)
  const [fobTotal, setFobTotal] = useState(formData.fob_total)
  const [nombre, setNombre] = useState(formData.nombre)
  const [nombreChina, setNombreChina] = useState(formData.nombre_china)
  const [nombreIngles, setNombreIngles] = useState(formData.nombre_ingles)
  const [saldoProducto, setSaldoProducto] = useState(formData.saldo_producto)
  const [secuencia, setSecuencia] = useState(formData.secuencia)
  const [unidadMedida, setUnidadMedida] = useState(formData.unidad_medida)
  const [usuarioCrea, setUsuarioCrea] = useState(formData.usuario_crea)
  const [usuarioModifica, setUsuarioModifica] = useState(formData.usuario_modifica)
  const [productModelList, setProductModelList] = useState([])

  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    setFormData(location.state)
    getProductModelList()
  }, [])

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

  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_det/${codPo}/${sessionStorage.getItem('currentEnterprise')}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        usuario_modifica: sessionStorage.getItem('currentUser'),
        cod_po: codPo,
        empresa: sessionStorage.getItem('currentEnterprise'),
        orders:[{   
          secuencia: secuencia,
          cod_producto: codProducto,
          cod_producto_modelo: codProductoModelo,
          nombre: nombre,
          nombre_china: nombreChina,
          nombre_ingles: nombreIngles,
          costo_sistema: parseFloat(costoSistema),
          costo_cotizado: parseFloat(costoCotizado),
          fob: parseFloat(fob),
          fobTotal: parseFloat(fobTotal),
          cantidad_pedido: parseInt(cantidadPedido, 10),
          saldo_producto: parseInt(saldoProducto, 10), 
          unidad_medida: unidadMedida,
          usuario_crea: usuarioCrea,
          fecha_crea: fechaCrea,
          fecha_modifica: moment().format('DD/MM/YYYY'),
        }]
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
    <div>
      <Navbar0 />
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
            <Button onClick={() => {navigate('/dashboard')}}>Módulos</Button>
            <Button onClick={() => {navigate('/postSales')}}>Ordenes de Compra</Button>
            <Button onClick={() => {navigate(-1)}}>Editar Orden de Compra</Button>
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
            <h5 style={{ marginTop: '20px' }}>Editar Detalle de Orden de Compra</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px' }}
              onClick={handleChange2}>
              <SaveIcon /> Guardar
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
          <TextField
            disabled
            id="cod-producto"
            label="Codigo Producto"
            type="text"
            onChange={e => setCodProducto(e.target.value)}
            value={codProducto}
            className="form-control"
          />
          <TextField
            disabled
            id="producto"
            label="Producto"
            type="text"
            onChange={e => setNombre(e.target.value)}
            value={nombre}
            className="form-control"
            style={{ width: `600px` }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            }}
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
            id="costo-cotizado"
            label="Costo Cotizado"
            type="number"
            onChange={e => setCostoCotizado(e.target.value)}
            value={costoCotizado}
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
            disabled
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
            <Autocomplete
            id="unidad-medida"
            options={unidadesMedida.map((unidadesMedida) => unidadesMedida.label)}
            onChange={handleMeasureChange}
            style={{ width: `160px` }}
            value={unidadMedida}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Unidad de Medida"
                type="text"
                value={unidadMedida}
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
      <PostSaleDetails />
    </SnackbarProvider>
  );
}