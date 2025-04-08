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

import { useAuthContext } from "../../context/authContext";


const API = process.env.REACT_APP_API;

function Procesos() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const [procesos, setProcesos] = useState([])
  const [menus, setMenus] = useState([])

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
  }, [])

  const handleRowClick = (rowData, rowMeta) => {
    const row = procesos.filter(item => item.cod_proceso === rowData[0])[0];
    navigate('/editProceso', { state: row });
    console.log(row)
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

  const handleChange2 = async (e) => {
    e.preventDefault();
    navigate('/newProceso');
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
          onClick={handleChange2} >
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
    </div>
  )
}

export default Procesos