import Navbar0 from "../Navbar0";
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import {FormControlLabel, Checkbox} from '@mui/material';
import { useAuthContext } from "../../context/authContext";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


const API = process.env.REACT_APP_API;

function Procesos() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const [procesos, setProcesos] = useState([])
  const [menus, setMenus] = useState([])
  const [openNew, setOpenNew] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codProceso, setCodProceso] = useState('');
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState(true);

  const navigate = useNavigate();

  const getProcesos = async () => {
    try {
      const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos`,
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
        setProcesos(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

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
    document.title = 'Procesos';
    getProcesos();
    getMenus();
  }, [openNew, openUpdate])

  const handleRowClick = (rowData, rowMeta) => {
    const row = procesos.filter(item => item.cod_proceso === rowData[0])[0];
    setCodProceso(row.cod_proceso)
    setNombre(row.nombre)
    setEstado(row.estado === 1)
    handleClickOpenUpdate();
  }

  const handleDeleteRows = rowsDeleted => {
    if (!window.confirm('¿Está seguro de eliminar el proceso?')) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = procesos[deletedRowIndex];
    const newProcesos = procesos.filter((proceso, index) => index !== deletedRowIndex);
    setProcesos(newProcesos);
    fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${deletedRowValue.cod_proceso}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
    })
      .then(response => {
        if (!response.ok) {
          getProcesos();
          return response.json();
        }
        toast.success('¡Elemento eliminado exitosamente!');
      })
      .then(data => {
        if (data) {
          toast.error(data.mensaje);
        }
      })
      .catch(error => {
        console.error(error);
        toast.error('Ocurrió un error en la llamada a la API');
      })
    return true;
  };

  const renderText = (value) => {
    const progress = parseInt(value);
    const text = progress ? "Activo" : "Inactivo";
    return (
      <div>
        <span>{text}</span>
      </div>
    );
  };

  const columns = [
    {
      name: "cod_proceso",
      label: "Código"
    },
    {
      name: "nombre",
      label: "Nombre"
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación"
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => renderText(value),
      },
    },
  ]

  const options = {
    responsive: 'standard',
    selectableRows: 'single',
    onRowClick: handleRowClick,
    onRowsDelete: handleDeleteRows,
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: column => `Ordenar por ${column.label}`
      },
      pagination: {
        next: "Siguiente",
        previous: "Anterior",
        rowsPerPage: "Filas por página:",
        displayRows: "de"
      },
      toolbar: {
        search: "Buscar",
        downloadCsv: "Descargar CSV",
        print: "Imprimir",
        viewColumns: "Ver columnas",
        filterTable: "Filtrar tabla"
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "REINICIAR"
      },
      viewColumns: {
        title: "Mostrar columnas",
        titleAria: "Mostrar/Ocultar columnas de tabla"
      },
      selectedRows: {
        text: "fila(s) seleccionada(s)",
        delete: "Borrar",
        deleteAria: "Borrar fila seleccionada"
      }
    }

  }

  const getMuiTheme = () =>
    createTheme({
      components: {
        MuiTableCell: {
          styleOverrides: {
            root: {
              paddingLeft: '3px', // Relleno a la izquierda
              paddingRight: '3px',
              paddingTop: '0px', // Ajusta el valor en el encabezado si es necesario
              paddingBottom: '0px',
              backgroundColor: '#00000',
              whiteSpace: 'nowrap',
              flex: 1,
              borderBottom: '1px solid #ddd',
              borderRight: '1px solid #ddd',
              fontSize: '14px'
            },
            head: {
              backgroundColor: 'firebrick', // Color de fondo para las celdas de encabezado
              color: '#ffffff', // Color de texto para las celdas de encabezado
              fontWeight: 'bold', // Añadimos negrita para resaltar el encabezado
              paddingLeft: '0px',
              paddingRight: '0px',
              fontSize: '12px'
            },
          }
        },
        MuiTable: {
          styleOverrides: {
            root: {
              borderCollapse: 'collapse', // Fusionamos los bordes de las celdas
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              borderBottom: '5px solid #ddd', // Línea inferior más gruesa para el encabezado
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            regular: {
              minHeight: '10px',
            }
          }
        }
      }
    });

  const handleClickOpenNew = () => {
    setOpenNew(true);
    setCodProceso('')
    setNombre('')
    setEstado(true)
  };

  const handleClickCloseNew = () => {
    setOpenNew(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
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
    if(res.ok){
      toast.success(mensaje)
      setOpenNew(false)
      setCodProceso('')
      setNombre('')
      setEstado(true)
    }else{
      toast.error(mensaje)
    }
  }

  const handleUpdate = async (e)=>{
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
    if (res.ok) {
      toast.success('Actualización exitosa')
      setOpenUpdate(false)
      setCodProceso('')
      setNombre('')
      setEstado(true)
    } else {
      const { mensaje } = await res.json();
      toast.error(mensaje)
    }
  }

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
          onClick={handleClickOpenNew}>
          <AddIcon /> Nuevo
        </button>
      </div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          title={"Procesos"}
          data={procesos}
          columns={columns}
          options={options}
        />
      </ThemeProvider>
      <Dialog open={openNew} onClose={handleClickCloseNew}>
        <DialogTitle>Registrar Proceso</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="cod_proceso"
                label="Código"
                type="text"
                placeholder="COD###"
                fullWidth
                value={codProceso}
                onChange={(e => setCodProceso(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="nombre"
                label="Nombre"
                type="text"
                fullWidth
                value={nombre}
                onChange={(e => setNombre(e.target.value))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCloseNew} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCreate} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openUpdate} onClose={handleClickCloseUpdate}>
        <DialogTitle>Actualizar Proceso</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                disabled
                margin="dense"
                id="cod_proceso"
                label="Código"
                type="text"
                placeholder="COD###"
                fullWidth
                value={codProceso}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="nombre"
                label="Nombre"
                type="text"
                fullWidth
                value={nombre}
                onChange={(e => setNombre(e.target.value))}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
          <FormControlLabel control={
            <Checkbox 
            label="Estado"
            checked={estado}
            onChange={(e) => {
              setEstado(e.target.checked)
            }}
            />
          }
          label="Activo"
          />
            
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCloseUpdate} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpdate} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Procesos