import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import moment from 'moment';
import TrackingStep from "./TrackingStep";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Tabs, Tab } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import SendIcon from '@material-ui/icons/Send';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns'

const API = process.env.REACT_APP_API;
const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '310px'
  },
});


function EditShipment(props) {

  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const [tabValue, setTabValue] = useState(0);
  const [excelData, setExcelData] = useState(['']);
  const [menus, setMenus] = useState([])

  const [agente, setAgente] = useState(formData.agente)
  const [buque, setBuque] = useState(formData.buque)
  const [codAforo, setCodAforo] = useState(formData.cod_aforo)
  const [codItem, setCodItem] = useState(formData.cod_item)
  const [codModelo, setCodModelo] = useState(formData.cod_modelo)
  const [codProveedor, setCodProveedor] = useState(formData.cod_proveedor)
  const [codPuertoDesembarque, setCodPuertoDesembarque] = useState(formData.cod_puerto_desembarque)
  const [codPuertoEmbarque, setCodPuertoEmbarque] = useState(formData.cod_puerto_embarque)
  const [codigoBlHouse, setCodigoBlHouse] = useState(formData.codigo_bl_house)
  const [codigoBlMaster, setCodigoBlMaster] = useState(formData.codigo_bl_master)
  const [costoContenedor, setCostoContenedor] = useState(formData.costo_contenedor)
  const [descripcion, setDescripcion] = useState(formData.descripcion)
  const [fechaBodega, setFechaBodega] = useState(formData.fecha_bodega)
  const [fechaEmbarque, setFechaEmbarque] = useState(formData.fecha_embarque)
  const [fechaLlegada, setFechaLlegada] = useState(formData.fecha_llegada)
  const [modificadoPor, setModificadoPor] = useState(formData.modificado_por)
  const [naviera, setNaviera] = useState(formData.naviera)
  const [numeroTracking, setNumeroTracking] = useState(formData.numero_tracking)
  const [tipoFlete, setTipoFlete] = useState(formData.tipo_flete)
  const [codRegimen, setCodRegimen] = useState(formData.cod_regimen)
  const [nroMrn, setNroMrn] = useState(formData.nro_mrn)

  const [estado, setEstado] = useState("");
  const [authorizedSystems, setAuthorizedSystems] = useState([]);
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [nombreAforo, setNombreAforo] = useState("");
  const [aforoList, setAforoList] = useState([])
  const [puertoNombre, setPuertoNombre] = useState("");
  const [puertoDesNombre, setPuertoDesNombre] = useState("");
  const [puertoList, setPuertoList] = useState([])
  const [navieraList, setNavieraList] = useState([])
  const [navieraNombre, setNavieraNombre] = useState("")
  const [statusList, setStatusList] = useState([])
  const [fleteList, setFleteList] = useState([{ cod: "C", nombre: "AL COBRO" }, { cod: "P", nombre: "PREPAGADO" }])
  const foundFlete = fleteList.find((flete) => flete.cod === formData.tipo_flete);
  const [fleteNombre, setFleteNombre] = useState(foundFlete ? foundFlete.nombre : "0")
  const [packingList, setPackingList] = useState([])
  const [regimenList, setRegimenList] = useState([])
  const [regimenNombre, setRegimenNombre] = useState("")



  const { enqueueSnackbar } = useSnackbar();


  const checkAuthorization = async () => {
    const res = await fetch(`${API}/modules/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    });
    const data = await res.json();
    setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
  };


  const getShipment = async () => {
    try {
      const res = await fetch(`${API}/embarque_param?empresa=${sessionStorage.getItem('currentEnterprise')}&codigo_bl_house=${formData.codigo_bl_house}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
          }
        });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setAgente(data[0].agente)
        setBuque(data[0].buque)
        setCodAforo(data[0].cod_aforo)
        setCodItem(data[0].cod_item)
        setCodModelo(data[0].cod_modelo)
        setCodProveedor(data[0].cod_proveedor)
        setCodPuertoDesembarque(data[0].cod_puerto_desembarque)
        setCodPuertoEmbarque(data[0].cod_puerto_embarque)
        setCodigoBlHouse(data[0].codigo_bl_house)
        setCodigoBlMaster(data[0].codigo_bl_master)
        setCostoContenedor(data[0].costo_contenedor)
        setDescripcion(data[0].descripcion)
        setFechaBodega(data[0].fecha_bodega)
        setFechaEmbarque(data[0].fecha_embarque)
        setFechaLlegada(data[0].fecha_llegada)
        setModificadoPor(data[0].modificado_por)
        setNaviera(data[0].naviera)
        setNumeroTracking(data[0].numero_tracking)
        setTipoFlete(data[0].tipo_flete)
        setCodRegimen(data[0].cod_regimen)
        setNroMrn(data[0].nro_mrn)

      }
    } catch (error) {
    }
  }



  const getPackingList = async () => {
    try {
      const res = await fetch(`${API}/packinglist_param?empresa=${sessionStorage.getItem('currentEnterprise')}&codigo_bl_house=${codigoBlHouse}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        }
      })
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setPackingList(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_modelo=BL`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod: item.cod_item,
    }));
    if (codItem) {
      setEstado(list.find((objeto) => objeto.cod === codItem).nombre)
    }
    setStatusList(list)
  }

  const getProviderList = async () => {
    const res = await fetch(`${API}/proveedores_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_proveedor=${formData.cod_proveedor}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    setNombreProveedor(data[0].nombre)
  }

  const getAforoList = async () => {
    const res = await fetch(`${API}/tipo_aforo_param?empresa=${sessionStorage.getItem('currentEnterprise')}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod: item.cod_aforo,
    }))
    setAforoList(list)

  }

  const getPuertoList = async () => {
    const res = await fetch(`${API}/puertos_embarque`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    if (codPuertoEmbarque) {
      setPuertoNombre(data.find((objeto) => objeto.cod_puerto === codPuertoEmbarque).descripcion)
    }
    if (codPuertoDesembarque) {
      setPuertoDesNombre(data.find((objeto) => objeto.cod_puerto === codPuertoDesembarque).descripcion)
    }

    setPuertoList(data)

  }

  const getNavieralist = async () => {
    const res = await fetch(`${API}/naviera`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    if (naviera) {
      setNavieraNombre(data.find((objeto) => objeto.codigo === naviera).nombre)
    }
    setNavieraList(data)

  }

  const getRegimenList = async () => {
    const res = await fetch(`${API}/regimen_aduana`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    if (codRegimen) {
      setRegimenNombre(data.find((objeto) => objeto.cod_regimen === codRegimen).descripcion)
    }
    setRegimenList(data)

  }

  const getAforoNombre = async () => {

    const res = await fetch(`${API}/tipo_aforo_param?empresa=${sessionStorage.getItem('currentEnterprise')}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod: item.cod_aforo,
    }));
    if (formData.cod_aforo) {
      setNombreAforo(list.find((objeto) => objeto.cod === formData.cod_aforo).nombre)
    }
  }


  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = packingList[deletedRowIndex];
        console.log(deletedRowValue.secuencia);

        fetch(`${API}/orden_compra_packinglist?codigo_bl_house=${codigoBlHouse}&empresa=${sessionStorage.getItem('currentEnterprise')}&secuencia=${deletedRowValue.secuencia}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en la llamada a la API');
            }
            console.log('Elemento eliminado exitosamente');
            enqueueSnackbar('¡Elementos eliminados exitosamente!', { variant: 'success' });
          })
          .catch(error => {
            console.error(error);
            enqueueSnackbar(error, { variant: 'error' });
          });
      });
    }
  };


  const handleRowClick = (rowData, rowMeta) => {
    const row = packingList.filter(item => item.secuencia === rowData[0])[0];
    console.log(row)
    navigate('/packingList', { state: row, orden: formData });
  }

  const handleAforoChange = (event, value) => {
    if (value) {
      const aforoSeleccionado = aforoList.find((aforo) => aforo.nombre === value);
      if (aforoSeleccionado) {
        setCodAforo(aforoSeleccionado.cod);
        setNombreAforo(aforoSeleccionado.nombre)
      }
    } else {
      setCodAforo('');
      setNombreAforo('')
    }
  };
  const handlePuertoChange = (event, value) => {
    if (value) {
      const puertoSeleccionado = puertoList.find((puerto) => puerto.descripcion === value);
      if (puertoSeleccionado) {
        setCodPuertoEmbarque(puertoSeleccionado.cod_puerto);
        setPuertoNombre(puertoSeleccionado.descripcion)
      }
    } else {
      setCodPuertoEmbarque('');
      setPuertoNombre('')
    }
  };

  const handlePuertoDesChange = (event, value) => {
    if (value) {
      const puertoSeleccionado = puertoList.find((puerto) => puerto.descripcion === value);
      if (puertoSeleccionado) {
        setCodPuertoDesembarque(puertoSeleccionado.cod_puerto);
        setPuertoDesNombre(puertoSeleccionado.descripcion)
      }
    } else {
      setCodPuertoDesembarque('');
      setPuertoDesNombre('')
    }
  };

  const handleNavieraChange = (event, value) => {
    if (value) {
      const navieraSeleccionado = navieraList.find((naviera) => naviera.nombre === value);
      if (navieraSeleccionado) {
        setNaviera(navieraSeleccionado.codigo);
        setNavieraNombre(navieraSeleccionado.nombre)
      }
    } else {
      setNaviera('');
      setNavieraNombre('')
    }
  };

  const handleRegimenChange = (event, value) => {
    if (value) {
      const regimenSeleccionado = regimenList.find((regimen) => regimen.descripcion === value);
      if (regimenSeleccionado) {
        setCodRegimen(regimenSeleccionado.cod_regimen);
        setRegimenNombre(regimenSeleccionado.descripcion)
      }
    } else {
      setCodRegimen('');
      setRegimenNombre('')
    }
  };

  const handleStatusChange = (event, value) => {
    if (value) {
      const statusSeleccionado = statusList.find((status) => status.nombre === value);
      if (statusSeleccionado) {
        setCodItem(statusSeleccionado.cod);
        setEstado(statusSeleccionado.nombre)
      }
    } else {
      setCodItem('');
      setEstado('')
    }
  };

  const handleFleteChange = (event, value) => {
    if (value) {
      const fleteSeleccionado = fleteList.find((status) => status.nombre === value);
      if (fleteSeleccionado) {
        setTipoFlete(fleteSeleccionado.cod);
        setFleteNombre(fleteSeleccionado.nombre)
      }
    } else {
      setTipoFlete('');
      setFleteNombre('')
    }
  };


  useEffect(() => {
    getShipment();
    getAforoNombre();
    getAforoList();
    getPackingList();
    getStatusList();
    checkAuthorization();
    getProviderList();
    getMenus();
    getPuertoList();
    getNavieralist();
    getRegimenList();
  }, [])

  const columns = [
    {
      name: "secuencia",
      label: "Secuencia"
    },
    {
      name: "nro_contenedor",
      label: "Contenedor"
    },
    {
      name: "cod_producto",
      label: "Codigo Producto"
    },
    {
      name: "cantidad",
      label: "Cantidad"
    },
    {
      name: "fob",
      label: "Fob"
    },
    {
      name: "cod_po",
      label: "Orden Compra"
    },
    {
      name: "cod_liquidacion",
      label: "Codigo Liquidacion"
    },

  ]

  const options = {
    filterType: 'dropdown',
    onRowsDelete: handleDeleteRows,
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
    },
  }


  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/embarque/${codigoBlHouse}/${sessionStorage.getItem('currentEnterprise')}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        fecha_embarque: fechaEmbarque,
        fecha_llegada: fechaLlegada,
        fecha_bodega: fechaBodega,
        cod_proveedor: codProveedor,
        numero_tracking: numeroTracking,
        agente,
        naviera,
        buque,
        cod_puerto_embarque: codPuertoEmbarque,
        cod_puerto_desembarque: codPuertoDesembarque,
        costo_contenedor: costoContenedor,
        descripcion,
        tipo_flete: tipoFlete,
        modificado_por: sessionStorage.getItem('currentUser'),
        cod_modelo: codModelo,
        cod_item: codItem,
        cod_aforo: codAforo,
        cod_regimen: codRegimen,
        nro_mrn: nroMrn
      })
    })
    const data = await res.json();
    console.log(data)
    if (!data.error) {
      enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }
  }

  const handleChange3 = async (e) => {
    e.preventDefault();
    navigate('/newPostSaleDetail', { state: codigoBlHouse, orden: location.state });
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const properties = jsonData[0];

      const newExcelData = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        // Verificar si todas las propiedades de la fila están vacías
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
      setExcelData(newExcelData)
      setPackingList((prevDetails) => [...prevDetails, ...newExcelData])
      console.log(newExcelData)
    };
    reader.readAsArrayBuffer(file);

  };

  const TabPanel = ({ value, index, children }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sessionStorage.getItem('currentSystem')}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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
          <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Embarques</Button>
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
            <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Editar Embarque</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
              onClick={handleChange2}>
              <SaveIcon /> Guardar
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '20px' }}>
            {TrackingStep(Number(codItem), statusList.map(item => item.nombre))}
          </div>
          <Grid container spacing={3}>
            {/* Primera Columna */}
            <Grid item xs={3}>
              <TextField
                disabled
                id="id"
                label="BL House"
                type="text"
                onChange={e => setCodigoBlHouse(e.target.value)}
                value={codigoBlHouse}
                className="form-control"
                style={{ width: `130px` }}
              />

              <TextField
                required
                id="codigo-bl-master"
                label="BL Master"
                type="text"
                onChange={e => setCodigoBlMaster(e.target.value)}
                value={codigoBlMaster}
                className="form-control"
                style={{ width: `140px` }}
              />
              <Autocomplete
                id="estado"
                options={statusList.map((status) => status.nombre)}
                value={estado}
                onChange={handleStatusChange}
                style={{ width: `200px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Estado"
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
                id="codProveedor"
                label="Codigo Proveedor"
                type="text"
                onChange={e => setCodProveedor(e.target.value)}
                value={codProveedor}
                className="form-control"
                style={{ width: `160px` }}
              />

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
            </Grid>

            {/* Segunda Columna */}
            <Grid item xs={3}>
              <TextField
                required
                id="agente"
                label="Agente"
                type="text"
                onChange={e => setAgente(e.target.value)}
                value={agente}
                className="form-control"
              />
              <Autocomplete
                id="naviera"
                options={navieraList.map((naviera) => naviera.nombre)}
                value={navieraNombre}
                onChange={handleNavieraChange}
                style={{ width: `300px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    multiline
                    rows={2}
                    label="Naviera"
                    type="text"
                    className="form-control"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
              />
              <Autocomplete
                id="puerto-embarque"
                options={puertoList.map((puerto) => puerto.descripcion)}
                value={puertoNombre}
                onChange={handlePuertoChange}
                style={{ width: `200px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Puerto Embarque"
                    type="text"
                    className="form-control"
                    style={{ width: `100%` }}
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
              />
              <Autocomplete
                id="puerto-desembarque"
                options={puertoList.map((puerto) => puerto.descripcion)}
                value={puertoDesNombre}
                onChange={handlePuertoDesChange}
                style={{ width: `200px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Puerto Desembarque"
                    type="text"
                    className="form-control"
                    style={{ width: `100%` }}
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
              />
              <Autocomplete
                id="flete"
                options={fleteList.map((flete) => flete.nombre)}
                value={fleteNombre}
                onChange={handleFleteChange}
                style={{ width: `200px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Tipo Flete"
                    type="text"
                    className="form-control"
                    style={{ width: `100%` }}
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
                disabled={parseInt(formData.cod_item, 10) > 2}
              />
              <TextField
                required
                id="numero-tracking"
                label="Numero Tracking"
                type="text"
                onChange={e => setNumeroTracking(e.target.value)}
                value={numeroTracking}
                className="form-control"
              />
            </Grid>

            {/* Tercera Columna */}
            <Grid item xs={3}>
              <div className={classes.datePickersContainer}>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DatePicker
                        label="Fecha Embarque"
                        value={dayjs(formData.fecha_embarque, "DD/MM/YYYY")}
                        onChange={(newValue) => setFechaEmbarque(format(new Date(newValue), 'dd/MM/yyyy'))}
                        format={'DD/MM/YYYY'}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DatePicker
                        label="Fecha Llegada"
                        value={dayjs(formData.fecha_llegada, "DD/MM/YYYY")}
                        onChange={(newValue) => setFechaLlegada(format(new Date(newValue), 'dd/MM/yyyy'))}
                        format={'DD/MM/YYYY'}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DatePicker
                        label="Fecha Bodega"
                        value={dayjs(formData.fecha_bodega, "DD/MM/YYYY")}
                        onChange={(newValue) => setFechaBodega(format(new Date(newValue), 'dd/MM/yyyy'))}
                        format={'DD/MM/YYYY'}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
              </div>
              <TextField
                required
                id="buque"
                label="Buque"
                type="text"
                onChange={e => setBuque(e.target.value)}
                value={buque}
                className="form-control"
                style={{ width: `200px` }}
              />
              <TextField
                required
                id="Costo"
                label="Costo Contenedor"
                type="text"
                onChange={e => setCostoContenedor(e.target.value)}
                value={costoContenedor}
                className="form-control"
                style={{ width: `200px` }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                required
                multiline
                rows={4}
                id="descripcion"
                label="Descripcion"
                type="text"
                onChange={e => setDescripcion(e.target.value)}
                value={descripcion}
                className="form-control"
              />
              <Autocomplete
                id="regimen"
                options={regimenList.map((regimen) => regimen.descripcion)}
                value={regimenNombre}
                onChange={handleRegimenChange}
                style={{ width: `300px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    multiline
                    rows={2}
                    label="Regimen"
                    type="text"
                    className="form-control"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
              />
              <TextField
                required
                id="nro-mrn"
                label="Nro Mrn"
                type="text"
                onChange={e => setNroMrn(e.target.value)}
                value={nroMrn}
                className="form-control"
              />
              <Autocomplete
                id="aforo"
                options={aforoList.map((aforo) => aforo.nombre)}
                value={nombreAforo}
                onChange={handleAforoChange}
                style={{ width: `200px` }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Aforo"
                    type="text"
                    className="form-control"
                    style={{ width: `100%` }}
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
                disabled={parseInt(formData.cod_item, 10) != 2}
              />
            </Grid>
          </Grid>

          <div>
            <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
              <Tab label="Packinglist" />
              <Tab label="Productos" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  style={{ marginBottom: '10px', marginTop: '10px', marginRight: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                  onClick={handleChange3}>
                  <AddIcon /> Nuevo
                </button>
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
                    Cargar en Lote
                  </Button>
                </label>
              </div>
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable title={"Packinglist de Embarque"} data={packingList} columns={columns} options={options} />
              </ThemeProvider>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <p>Productos aquí</p>
            </TabPanel>
          </div>
        </div>


      </Box >
    </div >
  );
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <EditShipment />
    </SnackbarProvider>
  );
}