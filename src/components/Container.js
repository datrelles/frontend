import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect} from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import Functions from "../helpers/Functions";
import { SnackbarProvider, useSnackbar } from 'notistack';
import moment from "moment";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useAuthContext } from "../context/authContext";
import LinearProgress from '@mui/material/LinearProgress';


const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    gap: '15px',
  },
});

function Container() {
  const {jwt, userShineray,enterpriseShineray, systemShineray}=useAuthContext();
  const [containers, setContainers] = useState([])
  const [fromDate, setFromDate] = useState(moment().subtract(3,"years"));
  const [toDate, setToDate] = useState(moment);
  const [statusList, setStatusList] = useState([])
  const [menus, setMenus] = useState([])
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();


  const getContainers = async () => {
    try {
      const res = await fetch(`${API}/containers`,
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
        setContainers(data)
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

  const renderProgress = (value) => {
    const progress = parseInt(value * 100 / (statusList.length - 2), 10);
    let name = '';
    if (statusList.find((objeto) => objeto.cod === value)) {
      name = statusList.find((objeto) => objeto.cod === value).nombre
    }
    const backgroundColor = getBackgroundColor(progress);
    return (
      <div>
        <LinearProgress
          sx={{
            backgroundColor: 'silver',
            '& .MuiLinearProgress-bar': {
              backgroundColor: backgroundColor
            }
          }}

          variant="determinate" value={progress} />
        <span>{name}</span>
      </div>
    );
  };

  function getBackgroundColor(progress) {
    if (progress <= 20) {
      return "#FF3F33";
    } else if (progress <= 40) {
      return "#FF9333";
    } else if (progress <= 60) {
      return "#F0FF33";
    } else if (progress <= 80) {
      return "#ACFF33";
    } else if (progress <= 100) {
      return "#33FF39";
    } else
      return "silver"
  }


  useEffect(() => {
    document.title = 'Contenedores';
    getContainers();
    getStatusList();
    getMenus();
  }, [])

  const handleChange2 = async (e) => {
    e.preventDefault();
    navigate('/newContainer');
  }

  const handleRowClick = (rowData, rowMeta) => {
    const row = containers.filter(item => item.nro_contenedor === rowData[0])[0];
    navigate('/editContainer', { state: row }); 
    console.log(row)
  }

  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar la orden de compra?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = containers[deletedRowIndex];
        fetch(`${API}/eliminar_orden_compra_total/${deletedRowValue.cod_po}/${enterpriseShineray}/PO`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en la llamada a la API');
            }
            enqueueSnackbar('¡Elementos eliminados exitosamente!', { variant: 'success' });
          })
          .catch(error => {
            console.error(error);
            enqueueSnackbar(error, { variant: 'error' });
          });
      });
    }
  };


  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=BL`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    setStatusList(data.map((item) => ({
      nombre: item.nombre,
      cod: item.cod_item,
    })));
  }

  const columns = [
    
    {
      name: "nro_contenedor",
      label: "Contenedor"
    },
    {
      name: "observaciones",
      label:"Observaciones"
    },
    {
      name: "cod_item",
      label: "Estado",
      options: {
        customBodyRender: (value) => renderProgress(value),
        filter: true,
                customFilterListOptions: { render: v => `Estado: ${v}` },
                filterOptions: {
                    names: statusList.map(state => state.nombre),
                    logic: Functions.customFilterLogic(statusList)
                }
      },
    },
    {
      name: "cod_tipo_contenedor",
      label: "Tipo Contenedor"
    },
    {
        name: "codigo_bl_house",
        label: "BL House"
      },
    {
        name: "peso",
        label: "Peso",
        options: {
          customBodyRender: Functions.NumericRender
      },
      },
    {
      name: "volumen",
      label: "Volumen",
      options: {
        customBodyRender: Functions.NumericRender
    },
    },
    {
        name: "es_repuestos",
        label: "Es Repuestos",
        options: {
            customBodyRender: (value) => {
              // Verificar si la cadena es vacía o nula
              if (value === 0 || value === "") {
                return "NO";
              } else {
                return "SI";
              }
            },
          },
      },
      {
        name: "es_motos",
        label: "Es Motos",
        options: {
            customBodyRender: (value) => {
              // Verificar si la cadena es vacía o nula
              if (value === 0 || value === "") {
                return "NO";
              } else {
                return "SI";
              }
            },
          },
      },
      {
        name: "fecha_salida",
        label: "Fecha Salida",
      },
      {
        name: "es_carga_suelta",
        label: "Carga Suelta",
        options: {
            customBodyRender: (value) => {
              // Verificar si la cadena es vacía o nula
              if (value === null || value === "") {
                return "NO";
              } else {
                return "SI";
              }
            },
          },
      }
  ]

  const options = {
    onRowClick: handleRowClick,
    onRowsDelete: handleDeleteRows,
    responsive: 'standard',
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
    <SnackbarProvider>
      <div style={{ marginTop: '150px', top: 0, left:0, width: "100%", zIndex: 1000}}>
        <Navbar0 menus={menus}/>
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
          title={"Contenedores"}
          data={containers}
          columns={columns}
          options={options}
        />
        </ThemeProvider>
      </div>
    </SnackbarProvider>
  )
}

export default Container