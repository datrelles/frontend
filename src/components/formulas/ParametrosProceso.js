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
import { FormControlLabel, Checkbox, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useAuthContext } from "../../context/authContext";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import API from "../../services/modulo-formulas";

function ParametrosProceso() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const APIService = new API(jwt, userShineray, enterpriseShineray, systemShineray);
  const [procesos, setProcesos] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [parametrosDetail, setParametrosDetail] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codProceso, setCodProceso] = useState('');
  const [codParametro, setCodParametro] = useState('');
  const [nombreParametro, setNombreParametro] = useState('');
  const [descripcionParametro, setDescripcionParametro] = useState('');
  const [ordenParametro, setOrdenParametro] = useState(0);
  const [estadoParametro, setEstadoParametro] = useState(false);

  const navigate = useNavigate();

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProcesos = async () => {
    try {
      setProcesos(await APIService.getProcesos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getParametros = async () => {
    try {
      setParametros(await APIService.getParametros());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = (rowData, rowMeta) => {
    const codParametro = rowData[0];
    const orden_imprime = parseInt(window.prompt(`Ingresa el orden de impresión para el parámetro ${codParametro}:`));
    if (isNaN(orden_imprime)) {
      toast.error("Orden de impresión inválido");
      return;
    }
    APIService.addParametroPorProceso(codProceso, codParametro, {
      orden_imprime
    })
      .then(res => {
        toast.success(res.mensaje);
        setOpenAdd(false);
        setCodParametro(codParametro);
      })
      .catch(err => toast.error(err.message));
  };

  const getParametrosDetail = async () => {
    try {
      setParametrosDetail(await APIService.getParametrosPorProceso(codProceso));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = () => {
    APIService.updateParametroPorProceso(codProceso, codParametro, {
      orden_imprime: ordenParametro,
      estado: estadoParametro
    })
      .then(_ => {
        toast.success('Actualización exitosa');
        setCodParametro('');
        setOpenUpdate(false);
      })
      .catch(err => toast.error(err.message));
  };

  const handleDelete = (selectedRows, setSelectedRows) => {
    if (!window.confirm('¿Estás seguro de eliminar el parámetro?')) {
      return false;
    }
    const { data: deletedData } = selectedRows;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = parametrosDetail[deletedRowIndex];
    const newParametros = parametrosDetail.filter((_, index) => index !== deletedRowIndex);
    setParametrosDetail(newParametros);
    APIService.deleteParametroPorProceso(codProceso, deletedRowValue.cod_parametro)
      .then(_ => {
        toast.success('Eliminación exitosa');
        setSelectedRows([]);
      })
      .catch(err => {
        toast.error(err.message);
        setCodParametro('');
      });
    return true;
  };

  const handleClickMaster = (rowData, rowMeta) => {
    setCodProceso(rowData[0]);
  };

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleClickCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleClickOpenUpdate = (rowData) => {
    setCodParametro(rowData[0]);
    setNombreParametro(rowData[1]);
    setDescripcionParametro(rowData[2] || "N/A");
    setOrdenParametro(rowData[3]);
    setEstadoParametro(rowData[4] === "Activo");
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleCustomAction = (selectedRows, displayData) => {
    const indiceSeleccionado = selectedRows.data[0].index;
    const codParametro = displayData[indiceSeleccionado].data[0];
    navigate(`/factores-calculo?proceso=${codProceso}&parametro=${codParametro}`);
  };

  const CustomSelectToolbar = (selectedRows, displayData, setSelectedRows) => {
    return (<>
      <Tooltip title="Factores de cálculo">
        <IconButton onClick={() => handleCustomAction(selectedRows, displayData)}>
          <CalculateIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton onClick={() => handleDelete(selectedRows, setSelectedRows)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>);
  };

  const renderText = (value) => {
    const progress = parseInt(value);
    const text = progress ? "Activo" : "Inactivo";
    return text;
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

  const columnsMaster = [
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
  ];

  const optionsMaster = {
    responsive: 'standard',
    selectableRows: 'none',
    onRowClick: handleClickMaster,
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
    }
  };

  const columnsDetail = [
    {
      name: "cod_parametro",
      label: "Código"
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "descripcion",
      label: "Descripción"
    },
    {
      name: "orden_imprime",
      label: "Orden"
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => renderText(value),
      },
    },
  ];

  const optionsDetail = {
    responsive: 'standard',
    selectableRows: 'single',
    onRowClick: handleClickOpenUpdate,
    customToolbarSelect: CustomSelectToolbar,
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
      // selectedRows: {
      //   text: "fila(s) seleccionada(s)",
      //   delete: "Borrar",
      //   deleteAria: "Borrar fila seleccionada"
      // }
    }
  };

  const columnsParametros = [
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
  ];

  const optionsParametros = {
    responsive: 'standard',
    selectableRows: 'none',
    onRowClick: handleAdd,
    filter: false,
    pagination: false,
    download: false,
    print: false,
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: column => `Ordenar por ${column.label}`
      },
      toolbar: {
        search: "Buscar",
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
    }
  };

  useEffect(() => {
    document.title = 'Parametros por Proceso';
    getProcesos();
    getParametros();
    getMenus();
  }, []);

  useEffect(() => {
    if (codProceso) {
      getParametrosDetail();
    }
  }, [codProceso, codParametro]);

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
          disabled={!codProceso}
          className="btn btn-primary btn-block"
          type="button"
          style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
          onClick={handleClickOpenAdd}>
          <AddIcon /> Agregar parámetro a {codProceso}
        </button>
      </div>
      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"Procesos"}
              data={procesos}
              columns={columnsMaster}
              options={optionsMaster}
            />
          </ThemeProvider>
        </Box>
        <Box sx={{ flex: 1 }}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={`Parámetros del Proceso ${codProceso ?? ''}`}
              data={parametrosDetail}
              columns={columnsDetail}
              options={optionsDetail}
            />
          </ThemeProvider>
        </Box>
      </Box>

      <Dialog open={openAdd} onClose={handleClickCloseAdd}>
        <DialogTitle>Agregar Parámetro</DialogTitle>
        <DialogContent>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"Parámetros"}
              data={parametros.filter(p => !parametrosDetail.some(pd => pd.cod_parametro === p.cod_parametro))}
              columns={columnsParametros}
              options={optionsParametros}
            />
          </ThemeProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCloseAdd} color="primary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openUpdate} onClose={handleClickCloseUpdate}>
        <DialogTitle>Modificar Parámetro {codParametro} Del Proceso {codProceso}</DialogTitle>
        <DialogContent>
          <ThemeProvider theme={getMuiTheme()}>
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
                  disabled
                  margin="dense"
                  id="nombre"
                  label="Nombre"
                  type="text"
                  fullWidth
                  value={nombreParametro}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled
                  margin="dense"
                  id="descripcion"
                  label="Descripción"
                  type="text"
                  fullWidth
                  value={descripcionParametro}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="orden"
                  label="Orden"
                  type="number"
                  fullWidth
                  value={ordenParametro}
                  onChange={(e) => setOrdenParametro(e.target.value)}
                />
              </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
              <FormControlLabel control={
                <Checkbox
                  label="Estado"
                  checked={estadoParametro}
                  onChange={(e) => setEstadoParametro(e.target.checked)}
                />
              }
                label="Activo"
              />
            </div>
          </ThemeProvider>
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

export default ParametrosProceso;