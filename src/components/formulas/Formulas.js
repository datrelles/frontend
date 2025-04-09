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

function Formulas() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const [formulas, setFormulas] = useState([])
  const [menus, setMenus] = useState([])
  const [openNew, setOpenNew] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFormula, setCodFormula] = useState('');
  const [nombre, setNombre] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState(true);
  const [definicion, setDefinicion] = useState('');

  const navigate = useNavigate();

  const getFormulas = async () => {
    try {
      const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/formulas`,
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
        setFormulas(data)
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
    document.title = 'Fórmulas';
    getFormulas();
    getMenus();
  }, [openNew, openUpdate])

  const handleRowClick = (rowData, rowMeta) => {
    const row = formulas.filter(item => item.cod_formula === rowData[0])[0];
    setCodFormula(row.cod_formula)
    setNombre(row.nombre)
    setEstado(row.estado === 1)
    setDefinicion(row.definicion)
    setObservaciones(row.observaciones ?? '')
    handleClickOpenUpdate();
  }

  const handleDeleteRows = rowsDeleted => {
    if (!window.confirm('¿Está seguro de eliminar la fórmula?')) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = formulas[deletedRowIndex];
    const newFormulas = formulas.filter((_, index) => index !== deletedRowIndex);
    setFormulas(newFormulas);
    fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/formulas/${deletedRowValue.cod_formula}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
    })
      .then(response => {
        if (!response.ok) {
          getFormulas();
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
    const text = progress ? "Activa" : "Inactiva";
    return (
      <div>
        <span>{text}</span>
      </div>
    );
  };

  const columns = [
    {
      name: "cod_formula",
      label: "Código"
    },
    {
      name: "nombre",
      label: "Nombre"
    },
    {
      name: "definicion",
      label: "Definición"
    },
    {
      name: "observaciones",
      label: "Observaciones"
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => renderText(value),
      },
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación"
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
    setCodFormula('')
    setNombre('')
    setObservaciones('')
    setEstado(true)
    setDefinicion('')
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
    const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/formulas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
        cod_formula: codFormula,
        nombre,
        observaciones,
        definicion
      })
    });
    const { mensaje } = await res.json();
    if(res.ok){
      toast.success(mensaje)
      setOpenNew(false)
      setCodFormula('')
      setNombre('')
      setObservaciones('')
      setEstado(true)
      setDefinicion('')
    }else{
      toast.error(mensaje)
    }
  }

  const handleUpdate = async (e)=>{
    e.preventDefault();
    const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/formulas/${codFormula}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        nombre,
        estado,
        observaciones: observaciones,
        definicion
      })
    })
    if (res.ok) {
      toast.success('Actualización exitosa')
      setOpenUpdate(false)
      setCodFormula('')
      setNombre('')
      setObservaciones('')
      setEstado(true)
      setDefinicion('')
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
          title={"Fórmulas"}
          data={formulas}
          columns={columns}
          options={options}
        />
      </ThemeProvider>
      <Dialog open={openNew} onClose={handleClickCloseNew}>
        <DialogTitle>Registrar Fórmula</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="cod_formula"
                label="Código"
                type="text"
                placeholder="FORMU###"
                fullWidth
                value={codFormula}
                onChange={(e => setCodFormula(e.target.value))}
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
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="observaciones"
                label="Observaciones"
                type="text"
                fullWidth
                value={observaciones}
                onChange={(e => setObservaciones(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="definicion"
                label="Definición"
                type="text"
                fullWidth
                value={definicion}
                onChange={(e => setDefinicion(e.target.value))}
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
        <DialogTitle>Actualizar Fórmula</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                disabled
                margin="dense"
                id="cod_formula"
                label="Código"
                type="text"
                placeholder="FORMU###"
                fullWidth
                value={codFormula}
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
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="observaciones"
                label="Observaciones"
                type="text"
                fullWidth
                value={observaciones}
                onChange={(e => setObservaciones(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="definicion"
                label="Definición"
                type="text"
                fullWidth
                value={definicion}
                onChange={(e => setDefinicion(e.target.value))}
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

export default Formulas