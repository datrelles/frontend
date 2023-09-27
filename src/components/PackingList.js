import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
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


function PackingList(props) {

  const [menus, setMenus] = useState([]);
  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const navigate = useNavigate();

  const [cantidad, setCantidad] = useState(formData.cantidad)
  const [codLiquidacion, setCodLiquidacion] = useState(formData.cod_liquidacion)
  const [codPo, setCodPo] = useState(formData.cod_po)
  const [codProducto, setCodProducto] = useState(formData.cod_producto)
  const [codTipoLiquidacion, setCodTipoLiquidacion] = useState(formData.cod_tipo_liquidacion)
  const [nroContenedor, setNroContenedor] = useState(formData.nro_contenedor)
  const [fechaCrea, setFechaCrea] = useState(formData.fecha_crea)
  const [fechaModifica, setFechaModifica] = useState(formData.fecha_modifica)
  const [fob, setFob] = useState(formData.fob)
  const [secuencia, setSecuencia] = useState(formData.secuencia)
  const [tipoComprobante, setTipoComprobante] = useState(formData.tipo_comprobante)
  const [unidadMedida, setUnidadMedida] = useState(formData.unidad_medida)
  const [nombre, setNombre] = useState(formData.nombre)
  const [usuarioCrea, setUsuarioCrea] = useState(formData.usuario_crea)
  const [usuarioModifica, setUsuarioModifica] = useState(formData.usuario_modifica)


  const { enqueueSnackbar } = useSnackbar();

  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sessionStorage.getItem('currentSystem')}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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
    }
  }


  useEffect(() => {
    document.title = 'PackingList';
    getMenus()
    setFormData(location.state)
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

  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_packinglist/${codPo}/${sessionStorage.getItem('currentEnterprise')}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        usuario_modifica: sessionStorage.getItem('currentUser'),
        orders: [{
          nro_contenedor: nroContenedor,
          cod_producto: codProducto,
          tipo_comprobante: tipoComprobante,
          fob: parseFloat(fob),
          cantidad,
          unidad_medida: unidadMedida,
          cod_liquidacion: codLiquidacion,
          cod_tipo_liquidacion: codTipoLiquidacion
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
    <div style={{ marginTop: '150px' }}>
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
          <Button onClick={() => { navigate('/shipment') }}>Embarques</Button>
          <Button onClick={() => { navigate(-1) }}>Editar Embarque</Button>
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
            <h5 style={{ marginTop: '20px' }}>Editar PackingList</h5>
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
            id="id2"
            label="Contenedor"
            type="text"
            onChange={e => setNroContenedor(e.target.value)}
            value={nroContenedor}
            className="form-control"
          />
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
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <TextField
            disabled
            id="cantidad"
            label="Cantidad"
            type="text"
            onChange={e => setCantidad(e.target.value)}
            value={cantidad}
            className="form-control"
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
          />
          <TextField
            required
            id="fob"
            label="Fob"
            type="number"
            onChange={e => setFob(e.target.value)}
            value={fob}
            className="form-control"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <Autocomplete
            id="unidad-medida"
            options={unidadesMedida.map((unidadesMedida) => unidadesMedida.label)}
            onChange={handleMeasureChange}
            value={unidadMedida}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Unidad de Medida"
                type="text"
                value={unidadMedida}
                className="form-control"
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />
          <TextField
            id="cod-liquidacion"
            label="Codigo Liquidacion"
            type="text"
            onChange={e => setCodLiquidacion(e.target.value)}
            value={codLiquidacion}
            className="form-control"
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <TextField
            id="cod-tipo-liquidacion"
            label="Tipo Liquidacion"
            type="text"
            onChange={e => setCodTipoLiquidacion(e.target.value)}
            value={codTipoLiquidacion}
            className="form-control"
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
      <PackingList />
    </SnackbarProvider>
  );
}