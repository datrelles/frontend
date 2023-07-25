import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
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
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";



const API = process.env.REACT_APP_API;


function EditPostSales(props) {

  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const [tabValue, setTabValue] = useState(0);
  const [excelData, setExcelData] = useState(['']);
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
  const [authorizedSystems, setAuthorizedSystems] = useState([]);


  const [details, setDetails] = useState([])
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


  const getPurchaseOrder = async () => {
    try {
      const res = await fetch(`${API}/orden_compra_cab_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_po=${formData.cod_po}`,
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
      const res = await fetch(`${API}/orden_compra_det_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_po=${codPo}&tipo_comprobante=PO`, {
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
        setDetails(data)
      }
    } catch (error) {
      toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
    }
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_modelo=IMPR`, {
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
    setEstado(list.find((objeto) => objeto.cod === codItem).nombre)
  }

  const getProvidersList = async () => {
    const res = await fetch(`${API}/proveedores_ext?empresa=${sessionStorage.getItem('currentEnterprise')}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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
    const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = details[deletedRowIndex];
        console.log(deletedRowValue.secuencia);

        fetch(`${API}/orden_compra_det/${codPo}/${sessionStorage.getItem('currentEnterprise')}/${deletedRowValue.secuencia}/PO`, {
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
    const row = details.filter(item => item.secuencia === rowData[0])[0];
    console.log(row)
    navigate('/postSaleDetails', { state: row, orden: formData });
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
    getPurchaseOrder();
    getPurchaseOrdersDetails();
    getStatusList();
    getProvidersList();
    checkAuthorization();


  }, [])

  const columns = [
    {
      name: "secuencia",
      label: "Secuencia"
    },
    {
      name: "cod_producto",
      label: "Codigo Producto"
    },
    {
      name: "nombre",
      label: "Producto"
    },
    {
      name: "nombre_ingles",
      label: "Ingles"
    },
    {
      name: "nombre_china",
      label: "Chino"
    },
    {
      name: "cantidad_pedido",
      label: "Cantidad"
    },
    {
      name: "saldo_producto",
      label: "Saldo"
    },
    {
      name: "costo_sistema",
      label: "Costo"
    },
    {
      name: "fob",
      label: "Fob"
    },
    {
      name: "fob_total",
      label: "Fob Total"
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
    customRowRender: (data, dataIndex, rowIndex) => {
      const colors = {
        "green": "#00ff00",
        "white": "#ffffff",
        "red": "#f2bdcd",
      };

      let backgroundColor = colors.grey;
      if (parseInt(data[6]) < 0) {
        backgroundColor = colors.red;
      } else if (parseInt(data["saldo_producto"]) == 0 || data["saldo_producto"] == null) {
        backgroundColor = colors.white;
      }

      return (
        <TableRow
          onClick={() => handleRowClick(data)}
          style={{ backgroundColor: backgroundColor }}>
          <TableCell />
          <TableCell>{data[0]}</TableCell>
          <TableCell>{data[1]}</TableCell>
          <TableCell>{data[2]}</TableCell>
          <TableCell>{data[3]}</TableCell>
          <TableCell>{data[4]}</TableCell>
          <TableCell>{data[5]}</TableCell>
          <TableCell>{data[6]}</TableCell>
          <TableCell>{data[7]}</TableCell>
          <TableCell>{data[8]}</TableCell>
          <TableCell>{data[9]}</TableCell>
        </TableRow>
      );
    },
  }


  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${sessionStorage.getItem('currentEnterprise')}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        empresa: sessionStorage.getItem('currentEnterprise'),
        tipo_comprobante: tipoCombrobante,
        bodega: sessionStorage.getItem('currentBranch'),
        cod_proveedor: codProveedor,
        nombre: nombre,
        proforma: proforma,
        invoice: invoice,
        bl_no: blNo,
        cod_po_padre: codPoPadre,
        usuario_modifica: sessionStorage.getItem('currentUser'),
        fecha_modifica: moment().format('DD/MM/YYYY'),
        cod_modelo: codModelo,
        cod_item: codItem,
        fecha_crea: fechaCrea
      })
    })
    const data = await res.json();
    console.log(data)
    setFormData(location.state)
    if (!data.error) {
      enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });

    }

    const res2 = await fetch(`${API}/orden_compra_det`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        orders: excelData.slice(1),
        cod_po: codPo,
        empresa: sessionStorage.getItem('currentEnterprise'),
        usuario_crea: sessionStorage.getItem('currentUser'),
        cod_agencia: sessionStorage.getItem('currentBranch')
      })
    });
    const data2 = await res2.json();
    console.log(data2);

    if (!data2.error) {
      enqueueSnackbar('¡Creado exitosamente!', { variant: 'success' });
    } else {
      enqueueSnackbar(data2.error, { variant: 'error' });
    }

  }

  const handleChange4 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${sessionStorage.getItem('currentEnterprise')}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        empresa: sessionStorage.getItem('currentEnterprise'),
        tipo_comprobante: tipoCombrobante,
        bodega: sessionStorage.getItem('currentBranch'),
        cod_proveedor: codProveedor,
        nombre: nombre,
        proforma: proforma,
        invoice: invoice,
        bl_no: blNo,
        cod_po_padre: codPoPadre,
        usuario_modifica: sessionStorage.getItem('currentUser'),
        fecha_modifica: moment().format('DD/MM/YYYY'),
        cod_modelo: codModelo,
        cod_item: 2,
        fecha_crea: fechaCrea
      })
    })
    const data = await res.json();
    console.log(data)
    if (!data.error) {
      enqueueSnackbar('¡Aprobado exitosamente!', { variant: 'success' });
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }
    setEstado('PEDIDO');

  }

  const handleChangeSend = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_cab/${codPo}/${sessionStorage.getItem('currentEnterprise')}/PO`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        empresa: sessionStorage.getItem('currentEnterprise'),
        tipo_comprobante: tipoCombrobante,
        bodega: sessionStorage.getItem('currentBranch'),
        cod_proveedor: codProveedor,
        nombre: nombre,
        proforma: proforma,
        invoice: invoice,
        bl_no: blNo,
        cod_po_padre: codPoPadre,
        usuario_modifica: sessionStorage.getItem('currentUser'),
        fecha_modifica: moment().format('DD/MM/YYYY'),
        cod_modelo: codModelo,
        cod_item: 1,
        fecha_crea: fechaCrea
      })
    })
    const data = await res.json();
    console.log(data)
    if (!data.error) {
      enqueueSnackbar('¡Aprobado exitosamente!', { variant: 'success' });
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }
    setEstado('PEDIDO');

  }

  const handleChange3 = async (e) => {
    e.preventDefault();
    navigate('/newPostSaleDetail', { state: codPo, orden: location.state });
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

        const obj = {};
        for (let j = 0; j < properties.length; j++) {
          const property = properties[j];
          obj[property] = row[j];
        }

        newExcelData.push(obj);
      }
      setExcelData(newExcelData)
      setDetails((prevDetails) => [...prevDetails, ...newExcelData])
      console.log(newExcelData)
    };
    reader.readAsArrayBuffer(file);

  };

  const TabPanel = ({ value, index, children }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

  return (
    <div>
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
          <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Ordenes de Compra</Button>
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
            <h5 style={{ marginTop: '20px', marginRight: '490px' }}>Editar Orden de Compra</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
              onClick={handleChange2}>
              <SaveIcon /> Guardar
            </button>
            {authorizedSystems.includes('REP') && (
              <button
                className="btn btn-primary btn-block"
                type="button"
                style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                onClick={handleChangeSend}>
                <SendIcon /> Solicitar
              </button>
            )}
            {authorizedSystems.includes('REP') && (
              <button
                className="btn btn-primary btn-block"
                type="button"
                style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                onClick={handleChangeSend}>
                <CheckIcon /> Aprob. Comer.
              </button>
            )}
            {authorizedSystems.includes('IMP') && (
              <button
                className="btn btn-primary btn-block"
                type="button"
                style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                onClick={handleChange4}>
                <CheckIcon /> Cotizar
              </button>
            )}
          </div>
          <TextField
            disabled
            id="id"
            label="Referencia"
            type="text"
            onChange={e => setCodPo(e.target.value)}
            value={codPo}
            className="form-control"
            style={{ width: `130px` }}
          />

          <TextField
            required
            id="tipo-comprobante"
            label="Tipo Comprobante"
            type="text"
            onChange={e => setTipoComprobante(e.target.value)}
            value={tipoCombrobante}
            className="form-control"
            style={{ width: `140px` }}
          />
          <TextField
            disabled
            id="codItem"
            label="Estado"
            type="text"
            value={estado}
            className="form-control"
            style={{ width: `130px` }}
          />
          <div style={{ display: 'flex' }}>
            <Autocomplete
              id="Proveedor"
              options={providersList.map((proveedor) => proveedor.nombre)}
              onChange={handleProviderChange}
              style={{ width: `580px` }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Proveedor"
                  type="text"
                  value={nombre}
                  className="form-control"
                  style={{ width: `100%` }}
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
              defaultValue={nombre}
            />
            <TextField
              required
              id="codProveedor"
              label="Codigo Proveedor"
              type="text"
              onChange={e => setCodProveedor(e.target.value)}
              value={codProveedor}
              className="form-control"
              style={{ width: `160px`, marginLeft: '25px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment></InputAdornment>
                ),
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />


          </div>
          <TextField
            required
            id="proforma"
            label="Proforma"
            type="text"
            onChange={e => setProforma(e.target.value)}
            value={proforma}
            className="form-control"
          />


          <TextField
            required
            id="invoice"
            label="Invoice"
            type="text"
            onChange={e => setInvoice(e.target.value)}
            value={invoice}
            className="form-control"
            style={{ width: `140px` }}
          />
          <TextField
            required
            id="blNo"
            label="Bl No."
            type="text"
            onChange={e => setBlNo(e.target.value)}
            value={blNo}
            className="form-control"
            style={{ width: `140px` }}
          />
          <TextField
            required
            id="codModelo"
            label="Codigo Modelo"
            type="text"
            onChange={e => setCodModelo(e.target.value)}
            value={codModelo}
            className="form-control"
            style={{ width: `140px` }}
            InputProps={{
              startAdornment: (
                <InputAdornment></InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'left' },
              },
            }}
          />

          <div>
            <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
              <Tab label="Detalles" />
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
              <MUIDataTable title={"Detalle Orden de Compra"} data={details} columns={columns} options={options} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <p>Productos aquí</p>
            </TabPanel>
          </div>
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