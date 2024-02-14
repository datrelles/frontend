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

//Necesario para POp ups
import { getDataFormasDePago, postDataFormasDePago, deleteFormasDePago, postPagoAnticipo } from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { differenceInDays, parse, isValid } from 'date-fns';
import { updatedFormasPago } from '../services/api';
import { Details } from '@material-ui/icons';
import { update } from 'react-spring';
import { useDateField } from '@mui/x-date-pickers/DateField/useDateField';

const API = process.env.REACT_APP_API;

function EditPostSales() {
  const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();

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

  //NECESARIO PARA POP UP FORMAS PAGO--------------------------------------------------
  const [valorTotalDolares, setValorTotalDolares] = useState(0)
  const [proformasFormasDePago, setProformasFormasDePago] = useState([])
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPagar, setOpenPagar] = useState(false)
  const [totalAnticipos, setTotalAnticipos] = useState(0)
  const [saldoTable, setSaldoTable] = useState(0)
  const [payAnticipo, setPayAnticipo] = useState({})
  const [formDataPago, setFormDataPago] = useState({
    empresa: enterpriseShineray,
    cod_proforma: '',
    tipo_proforma: '',
    fecha_vencimiento: '',
    valor: '',
    saldo: '',
    descripcion: '',
    cod_forma_pago: '',
    pct_valor: '',
    dias_vencimiento: 0,
  });
  //UPDATE FORMAS DE PAGO

  const [flagReloadDataTableFormasdePago, setFlagReloadDataTableFormasdePago] = useState(false);
  const [updateValuePorcentFlag, setUpdateValuePorcentFlag] = useState(0)
  const [secFlagupdate, setSecFlagupdate] = useState('')
  //-----------------------------------------------------------------------------------------------


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
  const checkAuthorization = async () => {
    const res = await fetch(`${API}/modules/${userShineray}/${enterpriseShineray}`, {
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
      const res = await fetch(`${API}/orden_compra_cab_param?empresa=${enterpriseShineray}&cod_po=${formData.cod_po}`,
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
      const res = await fetch(`${API}/orden_compra_det_param?empresa=${enterpriseShineray}&cod_po=${codPo}&tipo_comprobante=PO`, {
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
        handleTotalSum(data)

      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=IMPR`, {
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
    const res = await fetch(`${API}/orden_compra_track_param?empresa=${enterpriseShineray}&cod_po=${formData.cod_po}`, {
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
      const res = await fetch(`${API}/packinglist_param?empresa=${enterpriseShineray}&cod_po=${codPo}`, {
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
    const res = await fetch(`${API}/proveedores_ext?empresa=${enterpriseShineray}`, {
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

          fetch(`${API}/orden_compra_det/${codPo}/${enterpriseShineray}/${deletedRowValue.secuencia}/PO`, {
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

          fetch(`${API}/orden_compra_packinglist?cod_po=${codPo}&empresa=${enterpriseShineray}&secuencia=${deletedRowValue.secuencia}`, {
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

  const handleTotalSum = (data) => {
    let total = 0;

    data.forEach(item => {
      // Verificar si costo_sistema es un número válido
      const costoSistema = parseFloat(item.costo_sistema);

      // Verificar si cantidad_pedido es un número válido
      const cantidadPedido = parseInt(item.cantidad_pedido);

      // Realizar la multiplicación y suma
      if (!isNaN(costoSistema) && !isNaN(cantidadPedido)) {
        total += costoSistema * cantidadPedido;
      }
    })
    const editTotal = parseFloat(total.toFixed(2))
    setValorTotalDolares(editTotal);

  }
  //----------------HANDLE POP UP FORMAS DE PAGO-----------------------------------------------------------------------------------------

  //----------------ABRIR CREAR DIALOG
  const handleClickOpenNew = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  //---------------ABRIR EDITAR DIALOG----------------------
  const handleClickOpenEdit = () => {
    setOpenEdit(true);
  }
  const handleCloseEdit = () => {
    setOpenEdit(false)
    setFormDataPago(
      {
        empresa: enterpriseShineray,
        cod_proforma: '',
        tipo_proforma: '',
        fecha_vencimiento: '',
        valor: '',
        saldo: '',
        descripcion: '',
        cod_forma_pago: '',
        pct_valor: '',
        dias_vencimiento: 0,
      }
    )
  }

  //----------------------PAGAR-------------------------------------

  const handleClickOpenPagar = () => {
    let primer_anticipo = null;
    for (const item of proformasFormasDePago) {
      if (item.cod_forma_pago === 'ANTICIPO') {
        primer_anticipo = item;
        break; // Terminar el bucle cuando se encuentra el primer anticipo
      }
    }
    setPayAnticipo(primer_anticipo);
    setOpenPagar(true);
  }
  const handleClosePagar = () => {
    setOpenPagar(false)

  }

  const handleSavePagar = () => {
    console.log('sdfdf')
    const pagoAnticipos = async () => {
      try {
        const dataForBAck = {
          p_cod_empresa: enterpriseShineray,
          p_tipo_proforma: 'PO',
          p_cod_proforma: codPo,
          p_usuario: userShineray
        }
        const response = await postPagoAnticipo(dataForBAck, jwt)
        console.log(response.data.data)
        toast.success(response.data.data)
      } catch (error) {
        console.log(error.message)
        toast.error(error.message)
      }
    }
    pagoAnticipos();
    handleClosePagar();

  }



  const handleEditFormasPago = (rowData) => {
    const filterDataBySecuencia = proformasFormasDePago.filter(item => item.secuencia === rowData[0].props.children)
    const preFormEdit = filterDataBySecuencia[0]
    if (preFormEdit.cod_forma_pago === 'SALDO') {
      toast.error('El saldo no se puede editar')
      return;
    }
    setSecFlagupdate(preFormEdit.secuencia)
    setUpdateValuePorcentFlag(preFormEdit.pct_valor)
    setFormDataPago(preFormEdit)
    handleClickOpenEdit()
  }

  const saveEditFormasPago = async () => {
    const flagFate = formDataPago.fecha_vencimiento
    const date1 = parse(fechaEstimadaPuerto, 'dd/MM/yyyy', new Date());
    const date2 = parse(flagFate, 'yyyy-MM-dd', new Date());

    let difDays = ''
    if (isValid(date1) && isValid(date2)) {
      // Calcula la diferencia en días si ambas fechas son válidas
      difDays = differenceInDays(date2, date1);
    } else {
      // En caso de fechas no válidas, devuelve un valor predeterminado (en este caso, 0)
      difDays = 0;
    }

    try {

      if (formDataPago.cod_forma_pago === 'ANTICIPO') {
        console.log('rude')
        const porcien_valor = parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3)
        const porcien_valor_saldo = parseFloat((valorTotalDolares - totalAnticipos) / (valorTotalDolares / 100)).toFixed(3)

        if (porcien_valor <= 0 || porcien_valor >= 101) {
          toast.error('El valor no debe ser menor 0% o superior al 100%')
          return;
        }

        if (!formDataPago.valor || !formDataPago.fecha_vencimiento || !formDataPago.descripcion || !formDataPago.cod_forma_pago) {
          toast.error('Todos los campos son requeridos')
          return;
        }

        if (parseFloat(parseFloat(porcien_valor_saldo) + updateValuePorcentFlag) < parseFloat(((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3))) {
          toast.error('El porcentaje de anticipo no puede ser mayor al saldo')
          return;
        }
        const newUpdateData1 = {
          empresa: +formDataPago.empresa,
          cod_proforma: codPo,
          tipo_proforma: tipoCombrobante,
          fecha_vencimiento: formDataPago.fecha_vencimiento,
          valor: formDataPago.valor,
          saldo: formDataPago.valor,
          descripcion: formDataPago.descripcion,
          cod_forma_pago: 'ANT',
          pct_valor: parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3),
          dias_vencimiento: difDays

        }
        const updateAnticipo = await updatedFormasPago(newUpdateData1, jwt, secFlagupdate, codPo)
        console.log(updateAnticipo.data.message)
        if (updateAnticipo.data.message === 'Registro actualizado exitosamente.') {
          toast.success(updateAnticipo.data.message)
          HandleupdateTablePagos()
          handleCloseEdit()
        } else {
          toast.error('Error al actualizar')
        }
      }


    } catch (error) {
      console.log(error)
      toast.error('Error')
    }
  }

  const HandleupdateTablePagos = () => {
    setFlagReloadDataTableFormasdePago(!flagReloadDataTableFormasdePago)
  }

  const handleSave = () => {
    const porcien_valor = parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3)
    const porcien_valor_saldo = parseFloat((valorTotalDolares - totalAnticipos) / (valorTotalDolares / 100)).toFixed(3)
    if (porcien_valor_saldo >= 0 && porcien_valor_saldo < 1) {
      toast.error('El saldo esta en 0% no se puede añadir mas inserciones')
      return;
    }

    if ((proformasFormasDePago.length) >= 2) {
      const datosFiltrados = proformasFormasDePago.filter(item => item.cod_forma_pago === 'SALDO');
      if (datosFiltrados.length > 0 && formDataPago.cod_forma_pago === 'SAL') {
        toast.error('Ya existe el campo SALDO, actualize este campo')
        return;
      }
    }

    if (!formDataPago.valor || !formDataPago.fecha_vencimiento || !formDataPago.descripcion || !formDataPago.cod_forma_pago) {
      toast.error('Todos los campos son requeridos')
      return;
    }

    if (formDataPago.cod_forma_pago === 'SAL') {
      if (porcien_valor > porcien_valor_saldo) {
        toast.error('Saldo no puede ser mayor al saldo Total')
        return;
      }
    }
    //console.log(parseFloat(porcien_valor_saldo))
    //console.log(parseFloat(((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3)))

    if (parseFloat(porcien_valor_saldo) < parseFloat(((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3))) {
      toast.error('El porcentaje de anticipo no puede ser mayor al saldo')
      return;
    }
    // Aquí puedes manejar la lógica para guardar la información ingresada
    const flagFate = formDataPago.fecha_vencimiento
    const date1 = parse(fechaEstimadaPuerto, 'dd/MM/yyyy', new Date());
    const date2 = parse(flagFate, 'yyyy-MM-dd', new Date());

    let difDays = ''
    if (isValid(date1) && isValid(date2)) {
      // Calcula la diferencia en días si ambas fechas son válidas
      difDays = differenceInDays(date2, date1);
    } else {
      // En caso de fechas no válidas, devuelve un valor predeterminado (en este caso, 0)
      difDays = 0;
    }
    const dataForBAck = {
      empresa: +formDataPago.empresa,
      cod_proforma: codPo,
      tipo_proforma: tipoCombrobante,
      fecha_vencimiento: formDataPago.fecha_vencimiento,
      valor: formDataPago.valor,
      saldo: formDataPago.valor,
      descripcion: formDataPago.descripcion,
      cod_forma_pago: formDataPago.cod_forma_pago,
      pct_valor: parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3),
      dias_vencimiento: difDays
    }

    const postPago = async () => {
      try {
        const response = await postDataFormasDePago(dataForBAck, jwt)
        toast.success(response.data.data)
        if (response.data.data === 'Registro añadido correctamente') {
          if ((proformasFormasDePago.length) >= 2) {
            const datosFiltrados = proformasFormasDePago.filter(item => item.cod_forma_pago === 'SALDO');
            if (datosFiltrados.length > 0) {
              const updateData = datosFiltrados[0]
              const newUpdateData = {
                ...updateData,
                valor: parseFloat((parseFloat(valorTotalDolares).toFixed(3) - parseFloat(totalAnticipos).toFixed(3)) - formDataPago.valor).toFixed(2),
                saldo: parseFloat((parseFloat(valorTotalDolares).toFixed(3) - parseFloat(totalAnticipos).toFixed(3)) - formDataPago.valor).toFixed(2),
                pct_valor: porcien_valor_saldo - parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3),
                cod_forma_pago: 'SAL'
              }
              const updateResponse = await updatedFormasPago(newUpdateData, jwt, datosFiltrados[0].secuencia, codPo)
            }

          }

        }
        HandleupdateTablePagos()

      } catch (error) {
        HandleupdateTablePagos()
        console.log(error)
      }
    }

    postPago();
    //setFlagReloadDataTableFormasdePago(!flagReloadDataTableFormasdePago)
    handleClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormDataPago({
      ...formDataPago,
      [name]: value,
    });
  };

  const handleChangePorcent = (event) => {
    const { name, value } = event.target
    console.log(parseFloat((value / 100) * valorTotalDolares).toFixed(3))
    const env = parseFloat((value / 100) * valorTotalDolares).toFixed(3)
    setFormDataPago({
      ...formDataPago,
      valor: env.slice(0, -1)
    })
    //value={parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3)}

  };

  const DeleteRowTableFormaPAgos = async (rowsDeleted) => {
    try {
      const deleteSecuencia = proformasFormasDePago[rowsDeleted.data[0]['dataIndex']].secuencia
      //console.log(proformasFormasDePago[rowsDeleted.data[0]['dataIndex']])
      const RowToDelete = proformasFormasDePago[rowsDeleted.data[0]['dataIndex']]
      const data = {
        cod_proforma: codPo,
        secuencia: deleteSecuencia.toString()
      }
      const deleteFormasDePagoResponse = await deleteFormasDePago(data, jwt)
      toast.success(deleteFormasDePagoResponse.data)
      console.log(deleteFormasDePagoResponse.data)

      //----------------UPDATE SALDO------------------------------------'Registro eliminado Correctamente'

      if (deleteFormasDePagoResponse.data === 'Registro eliminado Correctamente') {
        if ((proformasFormasDePago.length) >= 2) {
          const datosFiltrados = proformasFormasDePago.filter(item => item.cod_forma_pago === 'SALDO');
          if (datosFiltrados.length > 0) {
            const updateData = datosFiltrados[0]
            const newUpdateData = {
              ...updateData,
              valor: parseFloat((parseFloat(valorTotalDolares).toFixed(2) - parseFloat(totalAnticipos).toFixed(2)) + RowToDelete.valor).toFixed(2),
              pct_valor: (parseFloat(datosFiltrados[0].pct_valor) + parseFloat(RowToDelete.pct_valor)).toFixed(3),
              cod_forma_pago: 'SAL',
              saldo: parseFloat((parseFloat(valorTotalDolares).toFixed(2) - parseFloat(totalAnticipos).toFixed(2)) + RowToDelete.valor).toFixed(2),
            }
            console.log(newUpdateData)
            const updateResponse = await updatedFormasPago(newUpdateData, jwt, datosFiltrados[0].secuencia, codPo)
          }

        }

      }

      HandleupdateTablePagos()

    } catch (error) {
      console.log(error)
      HandleupdateTablePagos()
    }
  };
  //------------------------------------------------------------------------
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

  }, []);

  useEffect(() => {
    const dataProformasFormasPago = async () => {
      try {
        const data = await getDataFormasDePago(codPo, jwt)
        const newData = data.proformas.map(item => {
          if (item.cod_forma_pago === 'ANT') {
            return {
              ...item,
              cod_forma_pago: 'ANTICIPO'
            }
          }
          else {
            return {
              ...item,
              cod_forma_pago: 'SALDO'
            }
          }
        })
        const sumaAnticipos = newData.filter(item => item.cod_forma_pago === 'ANTICIPO').reduce((total, item) => total + item.valor, 0)
        const findSaldoTable = newData.filter(item => item.cod_forma_pago === 'SALDO').reduce((total, item) => total + item.valor, 0)
        const findSaldoTableLength = newData.filter(item => item.cod_forma_pago === 'SALDO')

        setTotalAnticipos(sumaAnticipos)
        setProformasFormasDePago(newData)

        if (findSaldoTableLength.length == 0) {
          setSaldoTable(0)
        } else {
          setSaldoTable(findSaldoTable)
        }


      } catch (error) {
        setProformasFormasDePago([])
        setTotalAnticipos(0)
        console.log(error)
      }
    }
    dataProformasFormasPago()

  }, [flagReloadDataTableFormasdePago]);

  const optionsProformas = {
    responsive: 'standard',
    filterType: 'dropdown',
    // selectableRowsHideCheckboxes: true,
    selectableRows: 'single',
    onRowsDelete: DeleteRowTableFormaPAgos,
    onRowClick: handleEditFormasPago,
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

  const columnsFormasDePago = [
    {
      name: "secuencia",
      label: "Sec",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center" }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "cod_forma_pago",
      label: "Forma Pago",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center" }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "dias_vencimiento",
      label: "Días",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center" }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "fecha_vencimiento",
      label: "Fecha Vencimiento",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center" }}>
              {value}
            </div>
          );
        },
      },
    },

    {
      name: "pct_valor",
      label: "% ",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center" }}>
              {value}
            </div>
          );
        },
      },
    },

    {
      name: "valor",
      label: "Valor",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center" }}>
              {value}
            </div>
          );
        },
      },
    },

    {
      name: "saldo",
      label: "Saldo",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "center", padding: "5px" }}>
              {value}
            </div>
          );
        },
      },
    },

    {
      name: "descripcion",
      label: "Descripción",

    },



  ]

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
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${enterpriseShineray}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
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
          empresa: enterpriseShineray,
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
          empresa: enterpriseShineray,
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
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${enterpriseShineray}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
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
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${enterpriseShineray}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
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

          <div style={{ fontWeight: 1000, color: 'black', whiteSpace: 'nowrap' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', width: '310px' }}>
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
            <Tab label="Forma de Pago" />
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
          {Number(formData.cod_item) === 4 ?
            <TabPanel value={tabValue} index={2}>
              <div style={{ marginLeft: '10px' }}>
                <Button onClick={handleClickOpenNew} variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                  Agregar $
                </Button>
                <Button onClick={handleClickOpenPagar} variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '50px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                  Pagar $
                </Button>
                <TextField
                  margin="dense"
                  id="pct_valor"
                  name="pct_valor"
                  label="Valor total"
                  type="number"
                  fullWidth
                  value={parseFloat(valorTotalDolares).toFixed(3)}
                  InputProps={{
                    readOnly: true,
                  }}
                />

                <TextField
                  margin="dense"
                  id="pct_1valor"
                  name="salto_valor"
                  label="Saldo total"
                  type="number"
                  fullWidth
                  value={parseFloat(valorTotalDolares - totalAnticipos).toFixed(3)}
                  InputProps={{
                    readOnly: true,
                  }}
                />

                <TextField
                  margin="dense"
                  id="pct_valor"
                  name="pct_valor"
                  label="SUMA"
                  type="number"
                  fullWidth
                  value={saldoTable === 0 ? valorTotalDolares : saldoTable + totalAnticipos}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable title={"Forma de pago"} data={proformasFormasDePago} columns={columnsFormasDePago} options={optionsProformas} />
              </ThemeProvider>
            </TabPanel>
            :
            null
          }

        </div>
      </Box>

      {/* --DIALOGO AGREGAR-- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Forma de Pago</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_valor"
                name="pct_valor"
                label="Valor total"
                type="number"
                fullWidth
                value={parseFloat(valorTotalDolares).toFixed(3)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_1valor"
                name="salto_valor"
                label="Saldo total"
                type="number"
                fullWidth
                value={parseFloat(valorTotalDolares - totalAnticipos).toFixed(3)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_1valor"
                name="salto_valor"
                label="Saldo total %"
                type="number"
                fullWidth
                value={parseFloat((valorTotalDolares - totalAnticipos) / (valorTotalDolares / 100)).toFixed(6)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
            <h3 style={{ fontSize: '12px' }}>Tipo de Pago</h3>
            <h3 style={{ fontSize: '12px', marginRight: '5px' }}>Fecha de Vencimiento</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
            <Select
              margin="dense"
              id="cod_forma_pago"
              name="cod_forma_pago"
              label="Forma de Pago"
              style={{ width: '48%' }}
              value={formDataPago.cod_forma_pago}
              onChange={handleChange}
            >
              <MenuItem value="ANT">Anticipo</MenuItem>
              <MenuItem value="SAL">Saldo</MenuItem>
            </Select>

            <TextField
              margin="dense"
              id="fecha_vencimiento"
              name="fecha_vencimiento"
              label=""
              type="date"
              style={{ width: '48%' }}
              value={formDataPago.fecha_vencimiento}
              onChange={handleChange}
            />

          </div>

          <label>Datos a Ingresar</label>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="valor"
                name="valor"
                label="Valor"
                type="number"
                fullWidth
                value={formDataPago.valor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="saldo"
                name="saldo"
                label="Saldo"
                type="number"
                fullWidth
                value={parseFloat(formDataPago.valor).toFixed(3)}
                onChange={handleChange}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_valor"
                name="pct_valor"
                label="Porcentaje Total %"
                type="number"
                fullWidth
                value={parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3)}
                onChange={handleChangePorcent}
              />
            </Grid>
          </Grid>

          <TextField
            margin="dense"
            id="descripcion"
            name="descripcion"
            label="Descripción"
            type="text"
            fullWidth
            value={formDataPago.descripcion}
            onChange={handleChange}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* --DIALOGO ACTUALIZAR-- */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Editar Forma de Pago</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_valor"
                name="pct_valor"
                label="Valor total"
                type="number"
                fullWidth
                value={parseFloat(valorTotalDolares).toFixed(3)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_1valor"
                name="salto_valor"
                label="Saldo total"
                type="number"
                fullWidth
                value={parseFloat(valorTotalDolares - totalAnticipos).toFixed(3)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_1valor"
                name="salto_valor"
                label="Saldo total %"
                type="number"
                fullWidth
                value={parseFloat((valorTotalDolares - totalAnticipos) / (valorTotalDolares / 100)).toFixed(3)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
            <h3 style={{ fontSize: '12px' }}>Tipo de Pago</h3>
            <h3 style={{ fontSize: '12px', marginRight: '5px' }}>Fecha de Vencimiento</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
            <Select
              margin="dense"
              id="cod_forma_pago"
              name="cod_forma_pago"
              label="Forma de Pago"
              style={{ width: '48%' }}
              value={'ANT'}
              InputProps={{
                readOnly: true,
              }}
            >
              <MenuItem value="ANT">Anticipo</MenuItem>
              <MenuItem value="SAL">Saldo</MenuItem>
            </Select>

            <TextField
              margin="dense"
              id="fecha_vencimiento"
              name="fecha_vencimiento"
              label=""
              type="date"
              style={{ width: '48%' }}
              value={formDataPago.fecha_vencimiento}
              onChange={handleChange}
            />

          </div>

          <label>Datos a Ingresar</label>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="valor"
                name="valor"
                label="Valor"
                type="number"
                fullWidth
                value={formDataPago.valor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="saldo"
                name="saldo"
                label="Saldo"
                type="number"
                fullWidth
                value={parseFloat(formDataPago.valor).toFixed(3)}
                onChange={handleChange}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="pct_valor"
                name="pct_valor"
                label="Porcentaje Total %"
                type="number"
                fullWidth
                value={parseFloat((formDataPago.valor) / (valorTotalDolares / 100)).toFixed(3)}
                onChange={handleChangePorcent}
              />

            </Grid>
          </Grid>


          <TextField
            margin="dense"
            id="descripcion"
            name="descripcion"
            label="Descripción"
            type="text"
            fullWidth
            value={formDataPago.descripcion}
            onChange={handleChange}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="primary">
            Cancelar
          </Button>
          <Button onClick={saveEditFormasPago} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* --DIALOGO PAGAR-- */}
      <Dialog open={openPagar} onClose={handleClosePagar}>
        <DialogTitle>PAGAR ANTICIPO</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="descripcion"
            name="descripcion"
            label="Valor del anticipo"
            type="text"
            fullWidth
            value={payAnticipo.valor}
            InputProps={{
              readOnly: true,
            }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePagar} color="primary">
            CANCELAR
          </Button>
          <Button onClick={handleSavePagar} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            PAGAR
          </Button>
        </DialogActions>
      </Dialog>
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