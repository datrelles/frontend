import Navbar0 from "./Navbar0";
import { useLocation, useNavigate } from 'react-router-dom';
import { TableCell, TableFooter, TableRow } from "@material-ui/core";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import dayjs from 'dayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as XLSX from 'xlsx'
import Grid from '@mui/material/Grid';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';
import Functions from "../helpers/Functions";
import { SnackbarProvider, useSnackbar } from 'notistack';
import SaveIcon from '@material-ui/icons/Save';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";
import Autocomplete from '@mui/material/Autocomplete';
import LoadingCircle from './/contabilidad/crafter';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

import { useAuthContext } from "../context/authContext";


const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    gap: '15px',
  },
  footerCell: {
    fontWeight: 700,
    fontSize: "0.875rem",
    backgroundColor: "firebrick",
    color: "white",
    textAlign: "right",
    paddingRight: "10px"
  }
});

function Fideicomiso() {
  const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const [cabeceras, setCabeceras] = useState([])

  const [codComprobante, setCodComprobante] = useState(formData.cod_comprobante);
  const [tipoComprobante, setTipoComprobante] = useState(formData.tipo_comprobante);
  const [codCliente, setCodCliente] = useState(formData.cod_cliente);
  const [codProveedor, setCodProveedor] = useState(formData.cod_proveedor);
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [fechaNegociacion, setFechaNegociacion] = useState(formData.fecha_negociacion);
  const [providersList, setProvidersList] = useState([])
  const [nombre, setNombre] = useState("");
  const [tipoComprobanteList, setTipoComprobanteList] = useState([{ cod: "FC", nombre: "FIDEICOMISO" }, { cod: "FM", nombre: "MASSLINE" }])
  const foundTipo = tipoComprobanteList.find((flete) => flete.cod === formData.tipo_comprobante);
  const [tipoComprobanteNombre, setTipoComprobanteNombre] = useState(foundTipo ? foundTipo.nombre : "0")

  const [statusList, setStatusList] = useState([])
  const [excelData, setExcelData] = useState([]);
  const [excelDataDet, setExcelDataDet] = useState([]);
  const [fromDate, setFromDate] = useState(moment().subtract(3, "months"));
  const [toDate, setToDate] = useState(moment);
  const [menus, setMenus] = useState([])
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false)

  const classes = useStyles();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);


  const getCabeceras = async () => {
    try {
      const res = await fetch(`${API}/fin/cabeceras`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
          body: JSON.stringify({
            empresa: enterpriseShineray,
            cod_comprobante: formData.cod_comprobante
          })
        });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setCabeceras(data)
        console.log(data)
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

  const getProviderList = async () => {
    const res = await fetch(`${API}/proveedores_param?empresa=${enterpriseShineray}&cod_proveedor=${formData.cod_proveedor}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    setNombreProveedor(data[0].nombre)
  }

  useEffect(() => {
    document.title = 'Cabeceras de credito';
    getCabeceras();
    getMenus();
    getStatusList();
    getProviderList();
    setToDate(null);
    setFromDate(null);
  }, [])

  const handleRowClick = (rowData, rowMeta) => {
    const row = cabeceras.filter(item => item.nro_operacion === rowData[3])[0];
    navigate('/editCabecera', { state: row });
    console.log(row)
  }

  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar la orden de compra?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = purchaseOrders[deletedRowIndex];
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

  const handleChange2 = async (e) => {
    e.preventDefault();

    if (excelData && excelData.length > 0) {
      setLoading(true);
      const res2 = await fetch(`${API}/fin/cab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          cabeceras: excelData,
          cod_cliente: codCliente,
          cod_proveedor: codProveedor,
          cod_comprobante: formData.cod_comprobante
        })
      });
      const data2 = await res2.json();
      setLoading(false);
      if (!data2.error) {
        enqueueSnackbar('Credito(s) agregados correctamente', { variant: 'success' });
        if (data2.invalids) {
          if (data2.invalids.length > 0) {
            enqueueSnackbar('Nro. Operación ya existe: ' + data2.invalids, { variant: 'warning' });
          }
        }
      } else {
        enqueueSnackbar(data2.error, { variant: 'error' });
      }
    }

    if (excelDataDet && excelDataDet.length > 0) {
      setLoading(true);
      const res2 = await fetch(`${API}/fin/det`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          detalles: excelDataDet,
          cod_cliente: codCliente,
          cod_proveedor: codProveedor
        })
      });
      const data2 = await res2.json();
      setLoading(false);
      console.log(data2)
      if (!data2.error) {
        enqueueSnackbar('Cuota(s) agregadas correctamente', { variant: 'success' });
        if (data2.invalid_dets.length > 0) {
          enqueueSnackbar('Nro. pago ya existe: ' + data2.invalid_dets, { variant: 'warning' });
        }
      } else {
        enqueueSnackbar(data2.error, { variant: 'error' });
      }
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      jsonData[0].unshift("cod_agencia");
      jsonData[0].unshift("empresa");
      jsonData[0].unshift("usuario_crea");
      jsonData[0].unshift("cod_item");

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const isRowEmpty = row.every((cell) => cell === "");
        if (!isRowEmpty) {
          jsonData[i].unshift(branchShineray);
          jsonData[i].unshift(enterpriseShineray);
          jsonData[i].unshift(userShineray);
          jsonData[i].unshift("0");
        }
      }

      const properties = jsonData[0];
      properties[4] = 'tipo_id_cliente'
      properties[5] = 'id_cliente'
      properties[6] = 'nro_operacion'
      properties[7] = 'capital_original'
      properties[8] = 'saldo_capital'
      properties[9] = 'fecha_emision'
      properties[10] = 'fecha_vencimiento'
      properties[11] = 'plazo_credito'
      properties[12] = 'tasa_interes'
      properties[13] = 'tasa_mora'
      properties[14] = 'nro_cuota_total'
      properties[15] = 'nro_cuotas_pagadas'
      properties[16] = 'nro_cuotas_mora'
      properties[17] = 'base_calculo'
      properties[18] = 'tipo_destino'

      const newExcelData = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        const isRowEmpty = row.every((cell) => cell === "");

        if (!isRowEmpty) {

          const obj = {};
          for (let j = 0; j < properties.length; j++) {
            const property = properties[j];
            obj[property] = row[j];
          }
          newExcelData.push(obj);
        }
      }

      for (let i = 0; i < newExcelData.length; i++) {
        const customer = newExcelData[i];
        for (const key in customer) {
          if (customer.hasOwnProperty(key) && customer[key] === undefined) {
            customer[key] = '';
          }
        }
      }

      setExcelData(newExcelData)
      setCabeceras((prevDetails) => [...prevDetails, ...newExcelData])
      console.log(newExcelData)
    };
    reader.readAsArrayBuffer(file);

  };

  const handleFileUploadDet = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      jsonData[0].unshift("cod_comprobante");
      jsonData[0].unshift("tipo_comprobante");
      jsonData[0].unshift("empresa");
      jsonData[0].unshift("usuario_crea");

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const isRowEmpty = row.every((cell) => cell === "");
        if (!isRowEmpty) {
          jsonData[i].unshift(codComprobante);
          jsonData[i].unshift(tipoComprobante);
          jsonData[i].unshift(enterpriseShineray);
          jsonData[i].unshift(userShineray);
        }
      }

      const properties = jsonData[0];
      properties[4] = 'nro_operacion'
      properties[5] = 'id_cliente'
      properties[6] = 'nro_pago'
      properties[7] = 'fecha_inicio_cuota'
      properties[8] = 'fecha_vencimiento_cuota'
      properties[9] = 'plazo_cuota'
      properties[10] = 'valor_capital'
      properties[11] = 'valor_interes'
      properties[12] = 'valor_mora'
      properties[13] = 'valor_cuota'
      properties[14] = 'estado_cuota'
      properties[15] = 'tipo_destino'

      const newExcelData = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        const isRowEmpty = row.every((cell) => cell === "");

        if (!isRowEmpty) {

          const obj = {};
          for (let j = 0; j < properties.length; j++) {
            const property = properties[j];
            obj[property] = row[j];
          }
          newExcelData.push(obj);
        }
      }

      for (let i = 0; i < newExcelData.length; i++) {
        const customer = newExcelData[i];
        for (const key in customer) {
          if (customer.hasOwnProperty(key) && customer[key] === undefined) {
            customer[key] = '';
          }
        }
      }

      setExcelDataDet(newExcelData)
      console.log(newExcelData)
    };
    reader.readAsArrayBuffer(file);

  };

  const handleTipoComprobanteChange = (event, value) => {
    if (value) {
      const tipoSeleccionado = tipoComprobanteList.find((status) => status.nombre === value);
      if (tipoSeleccionado) {
        setTipoComprobante(tipoSeleccionado.cod);
        setTipoComprobanteNombre(tipoSeleccionado.nombre)
      }
    } else {
      setTipoComprobante('');
      setTipoComprobanteNombre('')
    }
  };

  const handleProviderChange = (event, value) => {
    if (value) {
      const proveedorSeleccionado = providersList.find((proveedor) => proveedor.nombre === value);
      if (proveedorSeleccionado) {
        setCodProveedor(proveedorSeleccionado.cod_proveedor);
        setNombre(proveedorSeleccionado.nombre);
      }
    } else {
      setCodProveedor('');
      setNombre('');
    }
  };


  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=FIN`, {
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

  const columns = [
    {
      name: "cod_comprobante",
      label: "Código Comprobante",
      options: {
        display: false,
      },
    },
    {
      name: "tipo_id_cliente",
      label: "Tipo ID Cliente"
    },
    {
      name: "id_cliente",
      label: "ID Cliente"
    },
    {
      name: "nro_operacion",
      label: "Número Operación"
    },
    {
      name: "capital_original",
      label: "Capital Original",

    },
    {
      name: "saldo_capital",
      label: "Saldo Capital",
    },
    {
      name: "fecha_emision",
      label: "Fecha Emisión"
    },
    {
      name: "fecha_vencimiento",
      label: "Fecha Vencimiento"
    },
    {
      name: "plazo_credito",
      label: "Plazo Crédito"
    },
    {
      name: "tasa_interes",
      label: "Tasa Interés",
      options: {
        customBodyRender: Functions.NumericRender
      },
    },
    {
      name: "tasa_mora",
      label: "Tasa Mora",
      options: {
        customBodyRender: Functions.NumericRender
      },
    },
    {
      name: "nro_cuota_total",
      label: "Número Cuota Total"
    },
    {
      name: "nro_cuotas_pagadas",
      label: "Número Cuotas Pagadas"
    },
    {
      name: "nro_cuotas_mora",
      label: "Número Cuotas Mora"
    },
    {
      name: "base_calculo",
      label: "Base Cálculo"
    },
    {
      name: "tipo_destino",
      label: "Tipo Destino"
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
      name: "secuencia_negociacion",
      label: "Secuencia Negociación"
    },
    {
      name: "liquidacion",
      label: "Liquidación"
    },
    {
      name: "es_parcial",
      label: "Es Parcial"
    },
    {
      name: "cuota_inicial",
      label: "Cuota Inicial"
    }

  ];

  const options = {
    responsive: 'standard',
    onRowClick: handleRowClick,
    onRowsDelete: handleDeleteRows,
    onChangeRowsPerPage(numberOfRows) {
      setRowsPerPage(numberOfRows);
    },
    onChangePage(page) {
      setPage(page);
    },
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
    },
    customTableBodyFooterRender: (opts) => {
      const startIndex = page * rowsPerPage;
      const endIndex = (page + 1) * rowsPerPage;
      let sumEnglish = opts.data
        .slice(startIndex, endIndex)
        .reduce((accu, item) => {
          return accu + parseFloat(item.data[4]);
        }, 0)
        .toFixed(2);
      let sumMaths = opts.data
        ?.slice(startIndex, endIndex)
        ?.reduce((accu, item) => {
          return accu + parseFloat(item.data[5]);
        }, 0)
        .toFixed(2);

      return (
        <>
          {cabeceras.length > 0 && (
            <TableFooter>
              <TableRow>
                {opts.columns.map((col, index) => {
                  if (col.display === "true") {
                    if (col.name === "tipo_id_cliente") {
                      return (
                        <TableCell key={index}>

                        </TableCell>
                      );
                    } else if (col.name === "id_cliente") {
                      return (
                        <TableCell key={index} >

                        </TableCell>
                      );
                    }
                    else if (col.name === "nro_operacion") {
                      return (
                        <TableCell key={index} >

                        </TableCell>
                      );
                    } else if (col.name === "capital_original") {
                      return (
                        <TableCell key={index} className={classes.footerCell}>
                          Total
                        </TableCell>
                      );
                    } else if (col.name === "saldo_capital") {
                      return (
                        <TableCell key={index} className={classes.footerCell}>
                          {sumEnglish}
                        </TableCell>
                      );
                    }
                    else if (col.name === "fecha_emision") {
                      return (
                        <TableCell key={index} className={classes.footerCell}>
                          {sumMaths}
                        </TableCell>
                      );
                    }
                  }
                })}
              </TableRow>
            </TableFooter>
          )}
        </>
      );
    },

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
    <>{loading ? (<LoadingCircle />) : (
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
            <Button style={{ width: `100px`, marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate('/dashboard') }}>Módulos</Button>
            <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Negociaciones</Button>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '20px' }}>
              <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Información Negociación</h5>
            </div>
            <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f0f0f0', padding: '10px' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    disabled
                    fullWidth
                    id="cod-comprobante"
                    label="Código Comprobante"
                    type="text"
                    onChange={e => setCodComprobante(e.target.value)}
                    value={codComprobante}
                    className="form-control"
                  />
                  <Autocomplete
                    disabled
                    id="tipo"
                    options={tipoComprobanteList.map((tipo) => tipo.nombre)}
                    value={tipoComprobanteNombre}
                    onChange={handleTipoComprobanteChange}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Tipo Comprobante"
                        type="text"
                        className="form-control"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                  <TextField
                    disabled
                    fullWidth
                    id="id-cliente"
                    label="Cliente"
                    type="text"
                    onChange={e => setCodCliente(e.target.value)}
                    value={codCliente}
                    className="form-control"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    disabled
                    multiline
                    rows={2}
                    id="nombre-proveedor"
                    label="Nombre Proveedor"
                    type="text"
                    value={nombreProveedor}
                    className="form-control"
                  />
                  <TextField
                    disabled
                    fullWidth
                    id="id-prov"
                    label="Codigo Proveedor"
                    type="text"
                    onChange={e => setCodProveedor(e.target.value)}
                    value={codProveedor}
                    className="form-control"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <div className={classes.datePickersContainer}>
                    <div>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker', 'DatePicker']}>
                          <DatePicker
                            label="Fecha Negociacion"
                            value={dayjs(formData.fecha_negociacion, "DD/MM/YYYY")}
                            onChange={(newValue) => setFechaNegociacion(format(new Date(newValue), 'dd/MM/yyyy'))}
                            format={'DD/MM/YYYY'}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <input
                accept=".xlsx, .xls"
                id="file-upload"
                multiple
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                  <AddIcon /> Operaciones
                </Button>
              </label>
              <input
                accept=".xlsx, .xls"
                id="file-upload-2"
                multiple
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUploadDet}
              />
              <label htmlFor="file-upload-2">
                <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                  <AddIcon /> Cuotas
                </Button>
              </label>
              <button
                className="btn btn-primary"
                type="button"
                style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                onClick={handleChange2}>
                <SaveIcon /> Guardar
              </button>
            </div>

            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                title={"Operaciones"}
                data={cabeceras}
                columns={columns}
                options={options}
              />
            </ThemeProvider>
          </div>
        </Box >
      </div>
    )}
    </>

  )
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Fideicomiso />
    </SnackbarProvider>
  );
}
