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


const API = process.env.REACT_APP_API;

function ParametrosProceso() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const [procesos, setProcesos] = useState([])
  const [parametros, setParametros] = useState([])
  const [parametrosDetail, setParametrosDetail] = useState([])
  const [menus, setMenus] = useState([])
  const [openAdd, setOpenAdd] = useState(false);
  const [codProceso, setCodProceso] = useState('');
  const [codParametro, setCodParametro] = useState('');

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
      }
    } catch (error) {
    }
  }

  const getParametros = async () => {
    try {
      const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/parametros`,
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
        setParametros(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  const getParametrosDetail = async () => {
    try {
      const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}/parametros`,
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
        setParametrosDetail((await res.json()).map(item => ({ cod_parametro: item.cod_parametro, nombre: item.parametro.nombre, descripcion: item.parametro.descripcion, orden_imprime: item.orden_imprime })));
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

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
  }, [codProceso, codParametro])

  const handleRowClickMaster = (rowData, rowMeta) => {
    setCodProceso(rowData[0]);
  }

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

  const optionsMaster = {
    responsive: 'standard',
    selectableRows: 'none',
    onRowClick: handleRowClickMaster,
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
  }

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
  ]

  const handleDeleteRows = rowsDeleted => {
    if (!window.confirm('¿Está seguro de eliminar el parámetro?')) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = parametrosDetail[deletedRowIndex];
    const newParametros = parametrosDetail.filter((_, index) => index !== deletedRowIndex);
    setParametrosDetail(newParametros);
    fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}/parametros/${deletedRowValue.cod_parametro}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
    })
      .then(response => {
        if (!response.ok) {
          setCodParametro('')
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
  }

  const handleClickDetail = (rowData) => {
    const codParametro = rowData[0];
    const orden_imprime = parseInt(window.prompt(`Ingresa el orden de impresión para el parámetro ${codParametro}:`));
    if (isNaN(orden_imprime)) {
      toast.error("Orden de impresión inválido");
      return;
    }
    fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}/parametros/${codParametro}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        orden_imprime
      })
    }).then(res => {
      if (!res.ok)
        return res.json();
      toast.success('Actualización exitosa')
      setCodParametro(codParametro)
    }).then(res => {
      const { mensaje } = res;
      toast.error(mensaje)
    });
  }

  const optionsDetail = {
    responsive: 'standard',
    selectableRows: 'single',
    onRowClick: handleClickDetail,
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

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleClickCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleAdd = async (rowData, rowMeta) => {
    const codParametro = rowData[0];
    const orden_imprime = parseInt(window.prompt(`Ingresa el orden de impresión para el parámetro ${codParametro}:`));
    if (isNaN(orden_imprime)) {
      toast.error("Orden de impresión inválido");
      return;
    }
    const res = await fetch(`${API}/modulo-formulas/empresas/${enterpriseShineray}/procesos/${codProceso}/parametros/${codParametro}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        orden_imprime
      })
    });
    const { mensaje } = await res.json();
    if (res.ok) {
      toast.success(mensaje)
      setOpenAdd(false)
      setCodParametro(codParametro)
    } else {
      toast.error(mensaje)
    }
  }

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
  ]

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
      {codProceso && (
        <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
          <button
            className="btn btn-primary btn-block"
            type="button"
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
            onClick={handleClickOpenAdd}>
            <AddIcon /> Agregar parámetro a {codProceso}
          </button>
        </div>
      )}
      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"Procesos"}
              data={procesos}
              columns={columns}
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
    </div>
  )
}

export default ParametrosProceso