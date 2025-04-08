import React, { useState, useEffect } from "react";
import Navbar0 from "../Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import { useAuthContext } from "../../context/authContext";


const API = process.env.REACT_APP_API;


function NewProceso() {
  const { jwt, enterpriseShineray, userShineray, systemShineray } = useAuthContext();
  const navigate = useNavigate();
  const [codProceso, setCodProceso] = useState("COD");
  const [nombre, setNombre] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [menus, setMenus] = useState([]);

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
    }
  }

  useEffect(() => {
    document.title = 'Nuevo proceso';
    getMenus();
  }, [])

  const handleChange2 = async (e) => {
    e.preventDefault();
    enqueueSnackbar('Registrando proceso...', { variant: 'info' })
    const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
        cod_proceso: codProceso,
        nombre
      })
    });
    const { mensaje } = await res.json();
    const variant = { variant: (res.ok ? 'success' : 'error') };
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
          <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate('/procesos') }}>Procesos</Button>
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
            <h5 style={{ marginTop: '20px' }}>Nuevo Proceso</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px' }}
              onClick={handleChange2}>
              <SaveIcon /> Crear
            </button>
          </div>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField                
                id="cod_proceso"
                label="Código proceso"
                type="text"
                onChange={e => setCodProceso(e.target.value)}
                value={codProceso}
                placeholder="COD###"
                className="form-control"
                fullWidth
              />
              <TextField                
                id="nombre"
                label="Nombre"
                type="text"
                onChange={e => setNombre(e.target.value)}
                value={nombre}
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
      <NewProceso />
    </SnackbarProvider>
  );
}