import { json, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "../Navbar0";
import Box from '@mui/material/Box';
import { toast } from 'react-toastify';
import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useAuthContext } from '../../context/authContext';

const API = process.env.REACT_APP_API;

function EditProceso() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [formData] = useState(location.state)
  const [menus, setMenus] = useState([])
  const [codProceso, setCodProceso] = useState(formData.cod_proceso)
  const [nombre, setNombre] = useState(formData.nombre)
  const [estado, setEstado] = useState(formData.estado)
  const { enqueueSnackbar } = useSnackbar();

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
      }
    } catch (error) {
    }
  }

  const getProceso = async () => {
    try {
      const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          }
        });
      if (res.ok) {
        const data = await res.json();
        setCodProceso(data.cod_proceso)
        setNombre(data.nombre)
      } else {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        } else {
          const { mensaje } = await res.json();
          toast.error(mensaje);
        }
      }
    } catch (error) {
      console.log(`err ${error}`)
    }
  }

  useEffect(() => {
    document.title = 'Proceso ' + codProceso;
    getMenus();
    getProceso();
  }, []);


  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        nombre,
        estado
      })
    })
    const variant = {};
    let mensaje;
    if (res.ok) {
      variant.variant = 'success';
      mensaje = 'Actualización exitosa';
    } else {
      variant.variant = 'error';
      ({ mensaje } = await res.json());
    }
    enqueueSnackbar(mensaje, variant);
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
          <Button style={{ width: `100px`, marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate('/dashboard') }}>Módulos</Button>
          <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Regresar</Button>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h5 style={{ marginTop: '20px' }}>Editar Proceso</h5>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
            onClick={handleChange2}>
            <SaveIcon /> Guardar
          </button>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                disabled
                id="cod_proceso"
                label="Código proceso"
                type="text"
                value={codProceso}
                className="form-control"
                fullWidth
              />
              <TextField
                id="nombre"
                label="Nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="form-control"
                fullWidth
              />
              <TextField
                id="estado"
                label="Estado"
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="form-control"
                fullWidth
              />
            </Grid>
          </Grid>
        </div>
      </Box>
    </div>
  );
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <EditProceso />
    </SnackbarProvider>
  );
}