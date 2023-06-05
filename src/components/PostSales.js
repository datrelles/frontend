import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { useNavigate } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';

import { SnackbarProvider, useSnackbar } from 'notistack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";
import { FiberPin } from "@material-ui/icons";



const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    gap: '15px',
  },
});

function PostSales(props) {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [fromDate, setFromDate] = useState(null);  //default desde currente date to 3 months ago
  const [toDate, setToDate] = useState(moment);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const classes = useStyles();
  

  const getPurchaseOrders = async () => {
    try {
      const res = await fetch(`${API}/orden_compra_cab_param?empresa=${sessionStorage.getItem('currentEnterprise')}&fecha_inicio=${format(new Date(fromDate),'dd/MM/yyyy')}&fecha_fin=${format(new Date(toDate),'dd/MM/yyyy')}`,
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
        setPurchaseOrders(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  useEffect(() => {
    getPurchaseOrders();
    setToDate(null);
    setFromDate(null);
  }, [])

  const handleRowClick = (rowData, rowMeta) => {
    const row = purchaseOrders.filter(item => item.cod_po === rowData[0])[0];
    navigate('/editPostSales', { state: row });
    console.log(row)
  }

  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar la orden de compra?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = purchaseOrders[deletedRowIndex];
        fetch(`${API}/eliminar_orden_compra_total/${deletedRowValue.cod_po}/${sessionStorage.getItem('currentEnterprise')}`, {
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

  const handleChange2 = async (e) => {
    e.preventDefault();
    navigate('/newPostSales');
  }

  const handleChangeDate = async (e) => {
    e.preventDefault();
      getPurchaseOrders()
    }
    

  const columns = [
    {
      name: "cod_po",
      label: "Referencia"
    },
    {
      name: "invoice",
      label: "Invoice"
    },
    {
      name: "bl_no",
      label: "BL No"
    },
    {
      name: "nombre",
      label: "Proveedor"
    },
    {
      name: "fecha_crea",
      label: "Fecha Pedido"
    },
    {
      name: "proforma",
      label: "Proforma"
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
        <Navbar0 />
        <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
          <button
            className="btn btn-primary btn-block"
            type="button"
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
            onClick={handleChange2} >
            <AddIcon /> Nuevo
          </button>
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
          title={"Ordenes de Compra"}
          data={purchaseOrders}
          columns={columns}
          options={options}
        />
      </div>
    </SnackbarProvider>
  )
}

export default PostSales