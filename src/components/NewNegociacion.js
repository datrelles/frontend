import Navbar0 from "./Navbar0";
import { useLocation, useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as XLSX from 'xlsx'
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
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
});

function NewNegociacion() {
  const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
  const navigate = useNavigate();
  const [cabeceras, setCabeceras] = useState([])

  const [empresa, setEmpresa] = useState(enterpriseShineray);
  const [codComprobante, setCodComprobante] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('');
  const [codCliente, setCodCliente] = useState('');
  const [codProveedor, setCodProveedor] = useState('');
  const [tipoDestino, setTipoDestino] = useState('');
  const [fechaNegociacion, setFechaNegociacion] = useState(moment());
  const [tipoComprobanteList, setTipoComprobanteList] = useState([{ cod: "FC", nombre: "FIDEICOMISO" }, { cod: "FM", nombre: "MASSLINE" }])
  const [tipoComprobanteNombre, setTipoComprobanteNombre] = useState("")
  const [statusList, setStatusList] = useState([])
  const [providersList, setProvidersList] = useState([])
  const [nombre, setNombre] = useState("");
  const [costumersList, setCostumersList] = useState([])
  const [nombreCostumer, setNombreCostumer] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [fromDate, setFromDate] = useState(moment().subtract(3, "months"));
  const [toDate, setToDate] = useState(moment);
  const [menus, setMenus] = useState([])
  const { enqueueSnackbar } = useSnackbar();
  const [entradaCodProveedor, setEntradaCodProveedor] = useState("")
  const [entradaCodCliente, setEntradaCodCliente] = useState("")

  const classes = useStyles();

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

  const getProvidersList = async () => {
    const res = await fetch(`${API}/proveedores_nac?empresa=${enterpriseShineray}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod_proveedor: item.cod_proveedor,
    }));
    setProvidersList(list)
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      const res = await fetch(`${API}/fin/providers_by_cod`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          empresa: enterpriseShineray,
          cod_proveedor: entradaCodProveedor.toUpperCase()
        })
      })
      const data = await res.json();
      console.log(data)
      setProvidersList(data)
      setNombre(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');
    }
  };

  const handleKeyDown2 = async (e) => {
    if (e.key === 'Enter') {
      const res = await fetch(`${API}/fin/costumers_by_cod`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          empresa: enterpriseShineray,
          cod_cliente: entradaCodCliente.toUpperCase()
        })
      })
      const data = await res.json();
      console.log(data)
      setCostumersList(data)
      setNombreCostumer(data.find((objeto) => objeto.cod_producto === codProducto)?.nombre || '');
    }
  };

  useEffect(() => {
    document.title = 'Nueva Negociación';
    getMenus();
    getProvidersList();
    getStatusList();
    setToDate(null);
    setFromDate(null);
  }, [])

  const handleRowClick = (rowData, rowMeta) => {
    const row = cabeceras.filter(item => item.cod_comprobante === rowData[0])[0];
    navigate('/editCabecera', { state: row });
    console.log(row)
  }

  const handleChange2 = async (e) => {
    e.preventDefault();
    const res1 = await fetch(`${API}/fin/negociacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
        tipo_comprobante: tipoComprobante,
        cod_agencia: branchShineray,
        cod_cliente: codCliente,
        cod_proveedor: codProveedor,
        usuario_crea: userShineray,
        tipo_destino: tipoDestino,
        fecha_negociacion: fechaNegociacion
      })
    });
    const data1 = await res1.json();
    if (!data1.error) {
      enqueueSnackbar('Negociación creada', { variant: 'success' });
      if (data1.cod_comprobante) {
        setCodComprobante(data1.cod_comprobante);
        console.log(data1.cod_comprobante)
      }
    } else {
      enqueueSnackbar(data1.error, { variant: 'error' });
    }

    if (excelData && excelData.length > 0) {
      const res2 = await fetch(`${API}/fin/cab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          cabeceras: excelData,
          cod_comprobante: data1.cod_comprobante,
          cod_cliente: codCliente,
          cod_proveedor: codProveedor,
        })
      });
      const data2 = await res2.json();
      if (!data2.error) {
        enqueueSnackbar('Crédito(s) agregados correctamente', { variant: 'success' });
        if (data2.invalids && data2.invalids.length > 0) {
          enqueueSnackbar('Nro. Operación ya existe: ' + data2.invalids.join(', '), { variant: 'warning' });
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
      properties[19] = 'secuencia_negociacion'
      properties[20] = 'liquidacion'
      properties[21] = 'es_parcial'
      properties[22] = 'cuota_inicial'

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

  const handleCostumerChange = (event, value) => {
    if (value) {
      const proveedorSeleccionado = costumersList.find((proveedor) => proveedor.nombre === value);
      if (proveedorSeleccionado) {
        setCodCliente(proveedorSeleccionado.cod_cliente);
        setNombreCostumer(proveedorSeleccionado.nombre);
      }
    } else {
      setCodCliente('');
      setNombreCostumer('');
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
      label: "Código Comprobante"
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
      options: {
        customBodyRender: Functions.NumericRender
      },
    },
    {
      name: "saldo_capital",
      label: "Saldo Capital",
      options: {
        customBodyRender: Functions.NumericRender
      },
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
                <div className={classes.datePickersContainer}>
                  <div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['DatePicker', 'DatePicker']}>
                        <DatePicker
                          label="Fecha Negociacion"
                          value={dayjs(fechaNegociacion, "DD/MM/YYYY")}
                          onChange={(newValue) =>
                            setFechaNegociacion(format(new Date(newValue), "dd/MM/yyyy"))
                          }
                          format={"DD/MM/YYYY"}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  required
                  id="codigo-provider"
                  label="Buscar Proveedor por codigo"
                  type="text"
                  onChange={e => setEntradaCodProveedor(e.target.value)}
                  onKeyDown={handleKeyDown}
                  value={entradaCodProveedor}
                  className="form-control"
                />
                <Autocomplete
                  id="proveedor"
                  fullWidth
                  options={providersList.map((producto) => producto.nombre)}
                  value={nombre}
                  onChange={handleProviderChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      multiline
                      rows={2}
                      label="Proveedor"
                      type="text"
                      className="form-control"
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
              <TextField
                  fullWidth
                  required
                  id="codigo-cliente"
                  label="Buscar Cliente por codigo"
                  type="text"
                  onChange={e => setEntradaCodCliente(e.target.value)}
                  onKeyDown={handleKeyDown2}
                  value={entradaCodCliente}
                  className="form-control"
                />
                <Autocomplete
                  id="Cliente"
                  fullWidth
                  options={costumersList.map((producto) => producto.nombre)}
                  value={nombreCostumer}
                  onChange={handleCostumerChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      multiline
                      rows={2}
                      label="Cliente"
                      type="text"
                      className="form-control"
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                  )}
                />
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
                Agregar Creditos
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
              title={"Créditos"}
              data={cabeceras}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>
      </Box >
    </div>

  )
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <NewNegociacion />
    </SnackbarProvider>
  );
}
