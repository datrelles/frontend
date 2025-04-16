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
import { FormControlLabel, Checkbox } from '@mui/material';
import { useAuthContext } from "../../context/authContext";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import API from "../../services/modulo-formulas";

function Parametros() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const APIService = new API(jwt, userShineray, enterpriseShineray, systemShineray);
  const [parametros, setParametros] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openNew, setOpenNew] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codParametro, setCodParametro] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);

  const navigate = useNavigate();

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.addParametro({
      empresa: enterpriseShineray,
      cod_parametro: codParametro,
      nombre,
      descripcion,
    })
      .then(res => {
        toast.success(res.mensaje);
        setOpenNew(false);
        setCodParametro('');
        setNombre('');
        setDescripcion('');
        setEstado(true);
      })
      .catch(err => toast.error(err.message));
  };

  const getParametros = async () => {
    try {
      setParametros(await APIService.getParametros());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateParametro(codParametro, {
      nombre,
      descripcion,
      estado,
    })
      .then(_ => {
        toast.success('Actualización exitosa');
        setOpenUpdate(false);
        setCodParametro('');
        setNombre('');
        setDescripcion('');
        setEstado(true);
      })
      .catch(err => toast.error(err.message));
  };

  const handleDelete = rowsDeleted => {
    if (!window.confirm('¿Estás seguro de eliminar el parámetro?')) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = parametros[deletedRowIndex];
    const newParametros = parametros.filter((_, index) => index !== deletedRowIndex);
    setParametros(newParametros);
    APIService.deleteParametro(deletedRowValue.cod_parametro)
      .then(_ => toast.success('Eliminación exitosa'))
      .catch(err => {
        toast.error(err.message);
        getParametros();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    const row = parametros.filter(item => item.cod_parametro === rowData[0])[0];
    setCodParametro(row.cod_parametro);
    setNombre(row.nombre);
    setDescripcion(row.descripcion ?? '');
    setEstado(row.estado === 1);
    handleClickOpenUpdate();
  };

  const handleClickOpenNew = () => {
    setOpenNew(true);
    setCodParametro('');
    setNombre('');
    setDescripcion('');
    setEstado(true);
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

  const renderText = (value) => {
    const progress = parseInt(value);
    const text = progress ? "Activo" : "Inactivo";
    return (
      <div>
        <span>{text}</span>
      </div>
    );
  };

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

  const columns = [
    {
      name: "cod_parametro",
      label: "Código"
    },
    {
      name: "nombre",
      label: "Nombre"
    },
    {
      name: "descripcion",
      label: "Descripción"
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
  ];

  const options = {
    responsive: 'standard',
    selectableRows: 'single',
    onRowClick: handleRowClick,
    onRowsDelete: handleDelete,
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
  };

  useEffect(() => {
    document.title = 'Parámetros';
    getParametros();
    getMenus();
  }, [openNew, openUpdate]);

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
          title={"Parámetros"}
          data={parametros}
          columns={columns}
          options={options}
        />
      </ThemeProvider>
      <Dialog open={openNew} onClose={handleClickCloseNew}>
        <DialogTitle>Registrar Parámetro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="cod_parametro"
                label="Código"
                type="text"
                placeholder="PARAM###"
                fullWidth
                value={codParametro}
                onChange={(e => setCodParametro(e.target.value))}
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
                id="descripcion"
                label="Descripción"
                type="text"
                fullWidth
                value={descripcion}
                onChange={(e => setDescripcion(e.target.value))}
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
        <DialogTitle>Actualizar Parámetro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                disabled
                margin="dense"
                id="cod_parametro"
                label="Código"
                type="text"
                fullWidth
                value={codParametro}
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
                id="descripcion"
                label="Descripción"
                type="text"
                fullWidth
                value={descripcion}
                onChange={(e => setDescripcion(e.target.value))}
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
  );
}

export default Parametros;