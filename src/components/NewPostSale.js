import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MUIDataTable from "mui-datatables";
import * as XLSX from 'xlsx'
import moment from 'moment';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Tabs, Tab } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API;


function NewPostSales(props) {

  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const [codPo, setCodPo] = useState("");
  const [blNo, setBlNo] = useState("");
  const [codItem, setCodItem] = useState("0");
  const [codModelo, setCodModelo] = useState("");
  const [codPoPadre, setCodPoPadre] = useState("");
  const [codProveedor, setCodProveedor] = useState("");
  const [invoice, setInvoice] = useState("");
  const [nombre, setNombre] = useState("");
  const [proforma, setProforma] = useState("");
  const [tipoCombrobante, setTipoComprobante] = useState("PO");
  const [providersList, setProvidersList] = useState([])
  const [details, setDetails] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [estado, setEstado] = useState("");
  const [menus, setMenus] = useState([]);

  const [excelData, setExcelData] = useState(['']);


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

  const getPurchaseOrdersDetails = async () => {
    const res = await fetch(`${API}/orden_compra_det_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_po=${codPo}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })
    const data = await res.json();
    setDetails(data)
  }

  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = excelData[deletedRowIndex];
        const newExcelData = excelData.filter((row) => row.COD_PRODUCTO !== deletedRowValue.COD_PRODUCTO);
        setExcelData(newExcelData);
        console.log(deletedRowValue);
      });
    }
  };

  useEffect(() => {
    getPurchaseOrdersDetails();
    getProvidersList();
    getStatusList();

  }, [])

  const columns = [
    {
      name: "COD_PRODUCTO_MODELO",
      label: "Codigo Modelo"
    },
    {
      name: "MODELO",
      label: "Modelo Moto"
    },
    {
      name: "COD_PRODUCTO",
      label: "Codigo Producto"
    },
    {
      name: "NOMBRE_INGLES",
      label: "Nombre Ingles"
    },
    {
      name: "NOMBRE",
      label: "Nombre Producto"
    },
    {
      name: "PEDIDO",
      label: "Pedido"
    },
    {
      name: "AGRUPADO",
      label: "Es Agrupado"
    },
    {
      name: "NOMBRE_PROVEEDOR",
      label: "NOMBRE PROVEEDOR"
    },
    {
      name: "NOMBRE_COMERCIAL",
      label: "NOMBRE COMERCIAL"
    },
  ]

  const options = {
    filterType: 'dropdown',
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

  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/orden_compra_total`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        cabecera: {   
          empresa: sessionStorage.getItem('currentEnterprise'),
          tipo_comprobante: tipoCombrobante,
          cod_agencia: sessionStorage.getItem('currentBranch'),
          bodega: sessionStorage.getItem('currentBranch'),
          cod_proveedor: codProveedor,
          nombre: nombre,
          proforma: proforma,
          invoice: invoice,
          bl_no: blNo,
          cod_po_padre: codPoPadre,
          cod_modelo: codModelo,
          cod_item: codItem,
          fecha_crea: moment().format('DD/MM/YYYY'),
          usuario_crea: sessionStorage.getItem('currentUser'),
          fecha_modifica: moment().format('DD/MM/YYYY'),
          usuario_modifica: sessionStorage.getItem('currentUser')
        },
        detalles: excelData

      })
    })
    const data = await res.json();
    console.log(data.mensaje)
    if (!data.error) {
      setCodPo(data.cod_po)
      if (data.cod_producto_no_existe)
        enqueueSnackbar('Orden de compra creada exitosamente', { variant: 'success' });
        enqueueSnackbar(data.mensaje +' '+ data.cod_producto_modelo_no_existe, { variant: 'warning' });
      if (data.unidad_medida_no_existe)
        enqueueSnackbar('Orden de compra creada exitosamente', { variant: 'success' });
        enqueueSnackbar(data.mensaje +' '+ data.unidad_medida_no_existe, { variant: 'warning' });
      if (data.cod_producto_modelo_no_existe)
        enqueueSnackbar('Orden de compra creada exitosamente', { variant: 'success' }); 
        enqueueSnackbar(data.mensaje +' '+ data.cod_producto_modelo_no_existe, { variant: 'warning' });
      if (!data.cod_producto_no_existe && !data.unidad_medida_no_existe && !data.cod_producto_modelo_no_existe){
        enqueueSnackbar(data.mensaje, { variant: 'success' });
      }
    } else {
      enqueueSnackbar(data.error, { variant: 'error' });
    }

  }

  

  const TabPanel = ({ value, index, children }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

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
      console.log(excelData)
    };
    reader.readAsArrayBuffer(file);

  };

  return (
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
            <Button style={{ width: `100px`, marginTop: '10px', marginRight: '10px', color:'#1976d2'}} onClick={() => {navigate('/dashboard')}}>Módulos</Button>
            <Button style={{ marginTop: '10px', marginRight: '10px', color:'#1976d2'}} onClick={() => {navigate('/postSales')}}>Ordenes de Compra</Button>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ marginTop: '20px' }}>Nueva Orden de Compra</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px' }}
              onClick={handleChange2}>
              <SaveIcon /> Crear
            </button>
          </div>
          <div>
            <TextField
              id="id"
              label="Referencia"
              type="text"
              onChange={e => setCodPo(e.target.value)}
              value={codPo}
              className="form-control"
              style={{ width: `130px` }}
            />
            <TextField
              disabled
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
              />
              <TextField
                disabled
                id="codProveedor"
                label="Codigo Proveedor"
                type="text"
                value={codProveedor}
                className="form-control"
                style={{ width: `160px`, marginLeft: '25px' }}
              />
            </div>
            <TextField
              required
              id="invoice"
              label="Invoice"
              type="text"
              onChange={e => setInvoice(e.target.value)}
              value={invoice}
              className="form-control"
              style={{ width: `130px` }}
            />
            <TextField
              disabled
              id="blNo"
              label="Bl No."
              type="text"
              onChange={e => setBlNo(e.target.value)}
              value={blNo}
              className="form-control"
              style={{ width: `130px` }}
            />
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
              id="codModelo"
              label="Codigo Modelo"
              type="text"
              onChange={e => setCodModelo(e.target.value)}
              value={codModelo}
              className="form-control"
              style={{ width: `130px` }}
            />
          </div>
          <div>
            <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
              <Tab label="Detalles" />
              <Tab label="Productos" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
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
                  <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '45px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                    Cargar en Lote
                  </Button>
                </label>
              </div>
              <MUIDataTable title={"Detalle Orden de Compra"} data={excelData} columns={columns} options={options} />
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
      <NewPostSales />
    </SnackbarProvider>
  );
}