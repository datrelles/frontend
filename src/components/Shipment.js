import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect} from "react";
import MUIDataTable from "mui-datatables";
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';


import { SnackbarProvider, useSnackbar } from 'notistack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';



const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    gap: '15px',
  },
});

function Shipment(props) {
  const [shipments, setShipments] = useState([])
  const [fromDate, setFromDate] = useState(moment().subtract(3,"months"));
  const [toDate, setToDate] = useState(moment);
  const [statusList, setStatusList] = useState([])
  const [menus, setMenus] = useState([])
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();


  const getShipments = async () => {
    try {
      const res = await fetch(`${API}/embarque_param?empresa=${sessionStorage.getItem('currentEnterprise')}&fecha_inicio=${format(new Date(fromDate), 'dd/MM/yyyy')}&fecha_fin=${format(new Date(toDate), 'dd/MM/yyyy')}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + props.token
          }
        });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setShipments(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sessionStorage.getItem('currentSystem')}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + props.token
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
    getShipments();
    getStatusList();
    getMenus();
    setToDate(null);
    setFromDate(null);
  }, [])

  const handleRowClick = (rowData, rowMeta) => {
    const row = shipments.filter(item => item.codigo_bl_house === rowData[0])[0];
    navigate('/editShipment', { state: row }); 
    console.log(row)
  }

  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar la orden de compra?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = shipments[deletedRowIndex];
        fetch(`${API}/eliminar_orden_compra_total/${deletedRowValue.cod_po}/${sessionStorage.getItem('currentEnterprise')}/PO`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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

  const handleChangeDate = async (e) => {
    e.preventDefault();
    getShipments()
  }

  const renderProgress = (value) => {
    const progress = parseInt(value*100/(statusList.length-1), 10);
    let name = '';
    if (statusList.find((objeto) => objeto.cod === value)){
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
    } else if (progress <= 100){
      return "#33FF39";
    }else
    return "silver"
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_modelo=BL`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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
      name: "codigo_bl_house",
      label: "BL House"
    },
    {
      name: "descripcion",
      label: "Descripcion"
    },
    {
      name: "fecha_adicion",
      label: "fecha adicion"
    },
    {
        name: "fecha_llegada",
        label: "fecha llegada"
      },
    {
      name: "naviera",
      label: "Naviera"
    },
    {
        name: "numero_tracking",
        label: "Numero Tracking"
      },
    {
      name: "cod_item",
      label: "Estado",
      options: {
        customBodyRender: (value) => renderProgress(value),
      },
    },
  ]

  const options = {
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

  return (
    <SnackbarProvider>
      <div>
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
          <div className={classes.datePickersContainer}>
            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker
                    label="Fecha Desde"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    format="DD/MM/YYYY"
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs} >
                <DemoContainer components={['DatePicker']} >
                  <DatePicker
                    label="Fecha Hasta"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    format="DD/MM/YYYY"

                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            <div>
              <button
                className="btn btn-primary btn-block"
                type="button"
                style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                onClick={handleChangeDate} >
                <SearchIcon /> Buscar
              </button>
            </div>
          </div>
        </div>
        <MUIDataTable
          title={"Embarques"}
          data={shipments}
          columns={columns}
          options={options}
        />
      </div>
    </SnackbarProvider>
  )
}

export default Shipment