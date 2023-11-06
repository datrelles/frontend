import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import Navbar0 from "./Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import moment from 'moment';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Tabs, Tab } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import SendIcon from '@material-ui/icons/Send';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import * as XLSX from 'xlsx'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TrackingStepOrder from "./TrackingStepOrder";
import Grid from '@mui/material/Grid';
import DescriptionIcon from '@mui/icons-material/Description';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns'
import FileGenerator from './FileGenerator';
import Functions from "../helpers/Functions";
import { da } from 'date-fns/locale';
import { useAuthContext } from '../context/authContext';


const API = process.env.REACT_APP_API;
const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '310px'
  },
});


function EditPostSales() {
  const {jwt, userShineray, enterpriceShineray, systemShineray, branchShineray}=useAuthContext();

  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const [tabValue, setTabValue] = useState(0);
  const [excelData, setExcelData] = useState(['']);
  const [excelDataPack, setExcelDataPack] = useState(['']);
  const [menus, setMenus] = useState([])

  const [blNo, setBlNo] = useState(formData.bl_no)
  const [codItem, setCodItem] = useState(formData.cod_item)
  const [codModelo, setCodModelo] = useState(formData.cod_modelo)
  const [codPo, setCodPo] = useState(formData.cod_po)
  const [codPoPadre, setCodPoPadre] = useState(formData.cod_po_padre)
  const [codProveedor, setCodProveedor] = useState(formData.cod_proveedor)
  const [empresa, setEmpresa] = useState(formData.empresa)
  const [fechaCrea, setFechaCrea] = useState(formData.fecha_crea)
  const [fechaModifica, setFechaModifica] = useState(formData.fecha_modifica)
  const [invoice, setInvoice] = useState(formData.invoice)
  const [nombre, setNombre] = useState(formData.nombre)
  const [proforma, setProforma] = useState(formData.proforma)
  const [tipoCombrobante, setTipoComprobante] = useState(formData.tipo_combrobante)
  const [usuarioCrea, setUsuarioCrea] = useState(formData.usuario_crea)
  const [usuarioModifica, setUsuarioModifica] = useState(formData.usuario_modifica)
  const [estado, setEstado] = useState("");
  const [providersList, setProvidersList] = useState([])
  const [trackingList, setTrackingList] = useState([])
  const [authorizedSystems, setAuthorizedSystems] = useState([]);
  const [statusList, setStatusList] = useState([])
  const [fechaEstimadaLlegada, setFechaEstimadaLlegada] = useState(formData.fecha_estimada_llegada)
  const [fechaEstimadaPuerto, setFechaEstimadaPuerto] = useState(formData.fecha_estimada_puerto)
  const [fechaEstimadaProduccion, setFechaEstimadaProduccion] = useState(formData.fecha_estimada_produccion)


  const [details, setDetails] = useState([])
  const [packingList, setPackingList] = useState([])
  const { enqueueSnackbar } = useSnackbar();

  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${userShineray}/${enterpriceShineray}/${systemShineray}`,
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

  const checkAuthorization = async () => {
    const res = await fetch(`${API}/modules/${userShineray}/${enterpriceShineray}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    });
    const data = await res.json();
    setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
  };


  const getPurchaseOrder = async () => {
    try {
      const res = await fetch(`${API}/orden_compra_cab_param?empresa=${enterpriceShineray}&cod_po=${formData.cod_po}`,
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
        console.log(data)
        setBlNo(data.bl_no)
        setCodItem(data.cod_item)
        setCodModelo(data.cod_modelo)
        setCodProveedor(data.cod_proveedor)
        setInvoice(data.invoice)
        setNombre(data.nombre)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }



  const getPurchaseOrdersDetails = async () => {
    try {
      const res = await fetch(`${API}/orden_compra_det_param?empresa=${enterpriceShineray}&cod_po=${codPo}&tipo_comprobante=PO`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        }
      })
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setDetails(data)
        console.log(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriceShineray}&cod_modelo=IMPR`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod: item.cod_item,
    }));
    setEstado(list.find((objeto) => objeto.cod === codItem).nombre)
    setStatusList(list)
  }

  const getTracking = async () => {
    const res = await fetch(`${API}/orden_compra_track_param?empresa=${enterpriceShineray}&cod_po=${formData.cod_po}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    setTrackingList(data)
  }

  const getPackingList = async () => {
    try {
      const res = await fetch(`${API}/packinglist_param?empresa=${enterpriceShineray}&cod_po=${codPo}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
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

  const getProvidersList = async () => {
    const res = await fetch(`${API}/proveedores_ext?empresa=${enterpriceShineray}`, {
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

  const handleDeleteRows = async (rowsDeleted) => {
    if ((parseInt(formData.cod_item, 10) < 6) && authorizedSystems.includes('IMP')) {
      const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
      if (userResponse) {
        await rowsDeleted.data.forEach((deletedRow) => {
          const deletedRowIndex = deletedRow.dataIndex;
          const deletedRowValue = details[deletedRowIndex];
          console.log(deletedRowValue.secuencia);

          fetch(`${API}/orden_compra_det/${codPo}/${enterpriceShineray}/${deletedRowValue.secuencia}/PO`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + jwt
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
    }
  };

  const handleDeleteRowsPack = async (rowsDeleted) => {
    if ((parseInt(formData.cod_item, 10) < 6) && authorizedSystems.includes('IMP')) {
      const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
      if (userResponse) {
        await rowsDeleted.data.forEach((deletedRow) => {
          const deletedRowIndex = deletedRow.dataIndex;
          const deletedRowValue = packingList[deletedRowIndex];
          console.log(deletedRowValue.secuencia);

          fetch(`${API}/orden_compra_packinglist?cod_po=${codPo}&empresa=${enterpriceShineray}&secuencia=${deletedRowValue.secuencia}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + jwt
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
    }
  };


  const handleRowClick = (rowData, rowMeta) => {
    if ((parseInt(formData.cod_item, 10) < 6) && authorizedSystems.includes('IMP')) {
      const row = details.filter(item => item.secuencia === rowData[0])[0];
      console.log(row)
      navigate('/postSaleDetails', { state: row, orden: formData });
    }
  }

  const handleRowClickPack = (rowData, rowMeta) => {
    if ((parseInt(formData.cod_item, 10) < 6) && authorizedSystems.includes('IMP')) {
      const row = packingList.filter(item => item.secuencia === rowData[0])[0];
      console.log(row)
      navigate('/packingList', { state: row, orden: formData });
    }
  }

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

  useEffect(() => {
    document.title = 'Orden ' + codPo;
    getMenus();
    getPurchaseOrder();
    getPurchaseOrdersDetails();
    getStatusList();
    getProvidersList();
    checkAuthorization();
    getPackingList();
    getTracking();
  }, [])

  const columns = [
    {
      name: "secuencia",
      label: "Secuencia",
      options: {
        display: false,
      },
    },
    {
      name: "cod_producto",
      label: "Codigo Producto"
    },
    {
      name: "modelo",
      label: "Modelo"
    },
    {
      name: "nombre",
      label: "Producto"
    },
    {
      name: "nombre_i",
      label: "Ingles"
    },
    {
      name: "nombre_c",
      label: "Chino"
    },
    {
      name: "cantidad_pedido",
      label: "Cantidad",
      options: {
        customBodyRender: (value) => {
          if (value === null || value === "") {
            return "0";
          } else {
            return <div style={{ textAlign: "right" }}>
              {value}
            </div>
          }
        },
      },
    },
    {
      name: "saldo_producto",
      label: "Saldo",
      options: {
        customBodyRender: (value) => {
          if (value === null || value === "") {
            return "0";
          } else {
            return <div style={{ textAlign: "right" }}>
              {value}
            </div>
          }
        },
      },
    },
    {
      name: "costo_sistema",
      label: "Costo",
      options: {
        customBodyRender: Functions.NumericRender
      },
    },
    {
      name: "fob",
      label: "Fob",
      options: {
        customBodyRender: Functions.NumericRender
      },
    },
    {
      name: "fob_total",
      label: "Fob Total",
      options: {
        customBodyRender: Functions.NumericRender
      },
    }
  ]

  const options = {
    filterType: 'dropdown',
    responsive: 'standard',
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
    customToolbar: () => {
      return (
        <button type="button" onClick={exportToExcel}> <DescriptionIcon />
        </button>
      );
    },
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(details);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
    XLSX.writeFile(wb, `${codPo}_detalles.xlsx`);

  };

  const columnsPacking = [
    {
      name: "secuencia",
      label: "Secuencia",
      options: {
        display: false,
      },
    },
    {
      name: "cod_producto",
      label: "Codigo Producto"
    },
    {
      name: "cantidad",
      label: "Cantidad",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "right" }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "fob",
      label: "Fob",
      options: {
        customBodyRender: Functions.NumericRender
      },
    },
    {
      name: "cod_liquidacion",
      label: "Valoracion"
    },

  ]

  const optionsPacking = {
    responsive: 'standard',
    filterType: 'dropdown',
    onRowsDelete: handleDeleteRowsPack,
    onRowClick: handleRowClickPack,
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

  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${enterpriceShineray}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriceShineray,
        tipo_comprobante: tipoCombrobante,
        bodega: branchShineray,
        cod_proveedor: codProveedor,
        nombre: nombre,
        proforma: proforma,
        invoice: invoice,
        bl_no: blNo,
        cod_po_padre: codPoPadre,
        usuario_modifica: userShineray,
        fecha_modifica: moment().format('DD/MM/YYYY'),
        cod_modelo: codModelo,
        cod_item: codItem,
        fecha_crea: fechaCrea,
        fecha_estimada_llegada: fechaEstimadaLlegada,
        fecha_estimada_produccion: fechaEstimadaProduccion,
        fecha_estimada_puerto: fechaEstimadaPuerto
      })
    })
    const data = await res.json();
    console.log(data)
    setFormData(location.state)
    if (!data.error) {
      enqueueSnackbar('¡Guardando Orden de Compra!', { variant: 'success' });
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });

    }
    if (excelData && excelData.length > 1) {
      const res2 = await fetch(`${API}/orden_compra_det`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          orders: excelData,
          cod_po: codPo,
          empresa: enterpriceShineray,
          usuario_crea: userShineray,
          cod_agencia: branchShineray
        })
      });
      const data2 = await res2.json();
      console.log(data2);
      var msj = ''
      if (!data2.error) {
        if (data2.cod_producto_no_existe) {
          enqueueSnackbar('Existen detalles incorrectos', { variant: 'warning' });
          msj += 'PRODUCTOS INEXISTENTES: \n' + data2.cod_producto_no_existe + ' ';
        }
        if (data2.unidad_medida_no_existe) {
          msj += 'PRODUCTOS CON UNIDAD INCORRECTA: \n' + data2.unidad_medida_no_existe + ' ';
        }
        if (data2.cod_producto_modelo_no_existe) {
          msj += 'MODELOS INEXISTENTES: \n' + data2.cod_producto_modelo_no_existe + ' ';
        }
        enqueueSnackbar('Orden de compra creada exitosamente', { variant: 'success' });
        FileGenerator.generateAndDownloadTxtFile(msj, 'detalles_con_error.txt');
      } else {
        enqueueSnackbar(data2.error, { variant: 'error' });
      }
    }

    if (excelDataPack && excelDataPack.length > 1) {
      const res3 = await fetch(`${API}/packinglist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          packings: excelDataPack,
          cod_po: codPo,
          empresa: enterpriceShineray,
          usuario_crea: userShineray,
          tipo_comprobante: "PO"
        })
      });
      const data3 = await res3.json();
      console.log(data3);
      var msj = ''
      if (!data3.error) {
        if (data3.bl_no_existe) {
          msj += 'EMBARQUES NO EXISTENTES: \n' + data3.bl_no_existe + ' ';
        }
        if (data3.prod_no_existe) {
          enqueueSnackbar('Existen detalles incorrectos', { variant: 'warning' });
          msj += 'PRODUCTOS INEXISTENTES EN DESPIECE: \n' + data3.prod_no_existe + '\n';
        }
        if (data3.unidad_medida_no_existe) {
          msj += 'PRODUCTOS CON UNIDAD INCORRECTA: \n' + data3.unidad_medida_no_existe + '\n';
        }
        if (data3.cod_producto_no_existe) {
          msj += 'PRODUCTOS NO CORRESPONDEN A DETALLES DE ORDEN: \n' + data3.cod_producto_no_existe + '\n';
        }
        enqueueSnackbar(data3.mensaje, { variant: 'success' });
        FileGenerator.generateAndDownloadTxtFile(msj, 'packinglist_con_error.txt');
      } else {
        enqueueSnackbar(data3.error, { variant: 'error' });
      }
    }

  }

  const handleChangeSend = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${enterpriceShineray}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriceShineray,
        tipo_comprobante: tipoCombrobante,
        bodega: branchShineray,
        cod_proveedor: codProveedor,
        nombre: nombre,
        proforma: proforma,
        invoice: invoice,
        bl_no: blNo,
        cod_po_padre: codPoPadre,
        usuario_modifica: userShineray,
        fecha_modifica: moment().format('DD/MM/YYYY'),
        cod_modelo: codModelo,
        cod_item: 1,
        fecha_crea: fechaCrea
      })
    })
    const data = await res.json();
    console.log(data)
    if (!data.error) {
      enqueueSnackbar('¡Solicitado exitosamente!', { variant: 'success' });
      setEstado('SOLICITADO');
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }


  }

  const handleChangeAprob = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${enterpriceShineray}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriceShineray,
        tipo_comprobante: tipoCombrobante,
        bodega: branchShineray,
        cod_proveedor: codProveedor,
        nombre: nombre,
        proforma: proforma,
        invoice: invoice,
        bl_no: blNo,
        cod_po_padre: codPoPadre,
        usuario_modifica: userShineray,
        fecha_modifica: moment().format('DD/MM/YYYY'),
        cod_modelo: codModelo,
        cod_item: 3,
        fecha_crea: fechaCrea
      })
    })
    const data = await res.json();
    console.log(data)
    if (!data.error) {
      enqueueSnackbar('¡Aprobado exitosamente!', { variant: 'success' });
      setEstado('APROBACION COMERCIAL');
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }


  }

  const handleChange3 = async (e) => {
    e.preventDefault();
    navigate('/newPostSaleDetail', { state: codPo, orden: location.state });
  }

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
      setDetails((prevDetails) => [...prevDetails, ...newExcelData])
      console.log(newExcelData)
    };
    reader.readAsArrayBuffer(file);

  };

  const handleFileUpload2 = (event) => {
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
      setExcelDataPack(newExcelData)
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

  const getMuiTheme = () =>
    createTheme({
      components: {
        MuiTableCell: {
          styleOverrides: {
            root: {
              paddingLeft: '3px',
              paddingRight: '3px',
              paddingTop: '0px',
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
    <div style={{ marginTop: '150px' }}>
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
          <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Regresar</Button>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h5 style={{ marginTop: '20px' }}>Editar Orden de Compra</h5>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
            onClick={handleChange2}>
            <SaveIcon /> Guardar
          </button>
          {authorizedSystems.includes('REP') && parseInt(formData.cod_item, 10) == 0 && (
            <button
              className="btn btn-primary"
              type="button"
              style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
              onClick={handleChangeSend}>
              <SendIcon /> Solicitar
            </button>
          )}
          {authorizedSystems.includes('REP') && parseInt(formData.cod_item, 10) == 2 && (
            <button
              className="btn btn-primary"
              type="button"
              style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
              onClick={handleChangeAprob}>
              <CheckIcon /> Aprobar
            </button>
          )}

          <div style={{fontWeight: 1000, color: 'black', whiteSpace: 'nowrap'}}>
            {TrackingStepOrder(Number(formData.cod_item), statusList.map(item => item.nombre), trackingList.map(item => item.fecha))}
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                disabled
                id="id"
                label="Referencia"
                type="text"
                onChange={e => setCodPo(e.target.value)}
                value={codPo}
                className="form-control"
                fullWidth
              />
              <TextField
                disabled
                id="codItem"
                label="Estado"
                type="text"
                value={estado}
                className="form-control"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                id="Proveedor"
                options={providersList.map((proveedor) => proveedor.nombre)}
                onChange={handleProviderChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    multiline
                    rows={2}
                    label="Proveedor"
                    type="text"
                    value={nombre}
                    className="form-control"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
                defaultValue={nombre}
                disabled={parseInt(formData.cod_item, 10) > 3}
              />
              <TextField
                required
                id="proforma"
                label="Proforma"
                type="text"
                onChange={e => setProforma(e.target.value)}
                value={proforma}
                className="form-control"
                disabled={parseInt(formData.cod_item, 10) > 3}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              {authorizedSystems.includes('IMP') && (
                <Autocomplete
                  id="estado"
                  options={statusList.map((status) => status.nombre)}
                  value={estado}
                  onChange={handleStatusChange}
                  fullWidth
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
                  disabled={parseInt(formData.cod_item, 10) > 6}
                />
              )}
              <TextField
                id="codProveedor"
                label="Codigo Proveedor"
                type="text"
                onChange={e => setCodProveedor(e.target.value)}
                value={codProveedor}
                className="form-control"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"></InputAdornment>
                  ),
                  inputProps: {
                    style: { textAlign: 'left' },
                  },
                }}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <div style={{ display:'flex',flexDirection:'column', width:'310px'}}>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DatePicker
                        label="Fecha Estimada Produccion"
                        value={dayjs(formData.fecha_estimada_produccion, "DD/MM/YYYY")}
                        onChange={(newValue) => setFechaEstimadaProduccion(format(new Date(newValue), 'dd/MM/yyyy'))}
                        format={'DD/MM/YYYY'}
                        disabled={!authorizedSystems.includes('IMP') || (parseInt(formData.cod_item, 10) > 6)}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DatePicker
                        label="Fecha Estimada Puerto"
                        value={dayjs(formData.fecha_estimada_puerto, "DD/MM/YYYY")}
                        onChange={(newValue) => setFechaEstimadaPuerto(format(new Date(newValue), 'dd/MM/yyyy'))}
                        format={'DD/MM/YYYY'}
                        disabled={!authorizedSystems.includes('IMP') || (parseInt(formData.cod_item, 10) > 6)}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DatePicker
                        label="Fecha Estimada Llegada"
                        value={dayjs(formData.fecha_estimada_llegada, "DD/MM/YYYY")}
                        onChange={(newValue) => setFechaEstimadaLlegada(format(new Date(newValue), 'dd/MM/yyyy'))}
                        format={'DD/MM/YYYY'}
                        disabled={!authorizedSystems.includes('IMP') || (parseInt(formData.cod_item, 10) > 6)}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
              </div>
            </Grid>
          </Grid>


          <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
            <Tab label="Detalles" />
            <Tab label="Packinglist" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <div >
              {authorizedSystems.includes('IMP') && parseInt(formData.cod_item, 10) < 6 && (
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  style={{ marginBottom: '10px', marginTop: '10px', marginRight: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                  onClick={handleChange3}>
                  <AddIcon /> Nuevo
                </button>
              )}
              <input
                accept=".xlsx, .xls"
                id="file-upload"
                multiple
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                {authorizedSystems.includes('IMP') && parseInt(formData.cod_item, 10) < 6 && (
                  <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                    Cargar en Lote
                  </Button>
                )}
              </label>
            </div>
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable title={"Detalle Orden de Compra"} data={details} columns={columns} options={options} />
            </ThemeProvider>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <input
                accept=".xlsx, .xls"
                id="file-upload"
                multiple
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload2}
              />
              <label htmlFor="file-upload">
                {authorizedSystems.includes('IMP') && parseInt(formData.cod_item, 10) < 7 && parseInt(formData.cod_item, 10) > 4 && (
                  <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                    Cargar en Lote
                  </Button>
                )}
              </label>
            </div>
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable title={"Packinglist Orden de Compra"} data={packingList} columns={columnsPacking} options={optionsPacking} />
            </ThemeProvider>
          </TabPanel>

        </div>


      </Box>
    </div>
  );
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <EditPostSales />
    </SnackbarProvider>
  );
}