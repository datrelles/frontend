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
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Tabs, Tab } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Functions from "../helpers/Functions";
import { useAuthContext } from '../context/authContext';
import Checkbox from '@mui/material/Checkbox';
import FavoriteBorder from '@mui/icons-material/TwoWheelerOutlined';
import Favorite from '@mui/icons-material/TwoWheeler';
import BookmarkBorderIcon from '@mui/icons-material/SettingsOutlined';
import BookmarkIcon from '@mui/icons-material/Settings';
import Typography from '@material-ui/core/Typography';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns'
import dayjs from 'dayjs';

const API = process.env.REACT_APP_API;
const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '310px'
  },
});


function EditContainer() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();

  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state)
  const [tabValue, setTabValue] = useState(0);
  const [excelData, setExcelData] = useState(['']);
  const [menus, setMenus] = useState([])

  const [codTipoContenedor, setCodTipoContenedor] = useState(formData.cod_tipo_contenedor)
  const [codigoBlHouse, setCodigoBlHouse] = useState(formData.codigo_bl_house)
  const [esCargaSuelta, setEsCargaSuelta] = useState(formData.es_carga_suelta === '' ? 0 : parseInt(formData.es_carga_suelta, 10));
  const [lineSeal, setLineSeal] = useState(formData.line_seal)
  const [nroContenedor, setNroContenedor] = useState(formData.nro_contenedor)
  const [observaciones, setObservaciones] = useState(formData.observaciones)
  const [peso, setPeso] = useState(formData.peso)
  const [shipperSeal, setShipperSeal] = useState(formData.shipper_seal)
  const [volumen, setVolumen] = useState(formData.volumen)
  const [fechaSalida, setFechaSalida] = useState(formData.fecha_salida)
  const [authorizedSystems, setAuthorizedSystems] = useState([]);
  const [packingList, setPackingList] = useState([])

  const [nombreTipo, setNombreTipo] = useState("");
  const [tipoList, setTipoList] = useState([])
  const [cargaList, setCargaList] = useState([{ cod: 0, nombre: "No" }, { cod: 1, nombre: "Si" }])
  const foundCarga = cargaList.find((carga) => carga.cod === parseInt(formData.es_carga_suelta, 10));
  const [cargaNombre, setCargaNombre] = useState(foundCarga ? foundCarga.nombre : "No")

  const [esMotos, setEsMotos] = useState(formData.es_motos);
  const [esRepuestos, setEsRepuestos] = useState(formData.es_repuestos);
  const [codItem, setCodItem] = useState(formData.cod_item);
  const [codModelo, setCodModelo] = useState(formData.cod_modelo);
  const [statusList, setStatusList] = useState([])
  const [estado, setEstado] = useState("");

  const { enqueueSnackbar } = useSnackbar();


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


  const getContainer = async () => {
    try {
      const res = await fetch(`${API}/container_by_nro?nro_contenedor=${formData.codigo_bl_house}`,
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
      }
    } catch (error) {
    }
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=BL`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    const list = data.map((item) => ({
      nombre: item.nombre,
      cod: item.cod_item,
      tipo: item.tipo
    }));
    if (codItem) {
      setEstado(list.find((objeto) => objeto.cod === codItem).nombre)
    }
    console.log(list)
    setStatusList(list)
  }

  const getPackingList = async () => {
    try {
      const res = await fetch(`${API}/packinglist_param_by_container?empresa=${enterpriseShineray}&nro_contenedor=${nroContenedor}`, {
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

  const getTipoList = async () => {
    const res = await fetch(`${API}/tipo_contenedor`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })
    const data = await res.json();
    setNombreTipo(data.find((objeto) => objeto.cod_tipo_contenedor === codTipoContenedor).nombre)
    setTipoList(data)

  }



  const handleDeleteRows = async (rowsDeleted) => {
    const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
    if (userResponse) {
      await rowsDeleted.data.forEach((deletedRow) => {
        const deletedRowIndex = deletedRow.dataIndex;
        const deletedRowValue = packingList[deletedRowIndex];
        console.log(deletedRowValue.secuencia);

        fetch(`${API}/orden_compra_packinglist?codigo_bl_house=${codigoBlHouse}&empresa=${enterpriseShineray}&secuencia=${deletedRowValue.secuencia}`, {
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
  };


  const handleRowClick = (rowData, rowMeta) => {
    const row = packingList.filter(item => item.secuencia === rowData[0])[0];
    console.log(row)
    navigate('/packingList', { state: row, orden: formData });
  }

  const handleTipoChange = (event, value) => {
    if (value) {
      const tipoSeleccionado = tipoList.find((tipo) => tipo.nombre === value);
      if (tipoSeleccionado) {
        setCodTipoContenedor(tipoSeleccionado.cod_tipo_contenedor);
        setNombreTipo(tipoSeleccionado.nombre)
      }
    } else {
      setCodTipoContenedor('');
      setNombreTipo('')
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


  useEffect(() => {
    document.title = 'Contenedor ' + nroContenedor;
    getContainer();
    getPackingList();
    checkAuthorization();
    getMenus();
    getTipoList();
    getStatusList();

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
      name: "nro_contenedor",
      label: "Contenedor",
      options: {
        display: false,
      },
    },
    {
      name: "cod_producto",
      label: "Codigo Producto"
    },
    {
      name: "producto",
      label: "Producto"
    },
    {
      name: "cantidad",
      label: "Cantidad",
      options: {
        customBodyRender: (value) => {
          if (value === null || value === "") {
            return <div style={{ textAlign: "right" }}>
              {"0"}
            </div>
          } else {
            return <div style={{ textAlign: "right" }}>
              {value}
            </div>
          }
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
      name: "cod_po",
      options: {
        customBodyRender: (value, tableMeta) => (
          <span
            style={{ cursor: 'pointer' }}
            onMouseOver={(e) => {
              e.target.style.color = 'blue';
              e.target.style.textDecoration = 'underline'
            }}
            onMouseOut={(e) => {
              e.target.style.color = 'black';
              e.target.style.textDecoration = 'none'
            }}
            onClick={() => handleRowClick2(value)}
          >
            {value}
          </span>
        ),
      },
      label: "Orden Compra"
    },
    {
      name: "proforma",
      label: "Proforma"
    },
    {
      name: "cod_liquidacion",
      label: "Valoracion"
    },

  ]

  const options = {
    responsive: 'standard',
    filterType: 'dropdown',
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
    },
  }

  const handleRowClick2 = async (rowData) => {
    const res = await fetch(`${API}/orden_compra_cab_param?empresa=${enterpriseShineray}&cod_po=${rowData}`,
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
      navigate('/editPostSales', { state: data[0] });
      console.log(data)
    }

  }


  const handleChange2 = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/contenedor/${nroContenedor}/${enterpriseShineray}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        codigo_bl_house: codigoBlHouse,
        cod_tipo_contenedor: codTipoContenedor,
        peso: parseFloat(peso),
        volumen: parseFloat(volumen),
        line_seal: lineSeal,
        shipper_seal: shipperSeal,
        es_carga_suelta: parseInt(esCargaSuelta, 10),
        observaciones: observaciones,
        usuario_modifica: userShineray,
        es_repuestos: esRepuestos === "" ? 0 : esRepuestos,
        es_motos: esMotos === "" ? 0 : esMotos,
        fecha_salida: fechaSalida,
        cod_item: codItem,
        cod_modelo: codModelo
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

  const handleCargaChange = (event, value) => {
    if (value) {
      const cargaSeleccionado = cargaList.find((status) => status.nombre === value);
      if (cargaSeleccionado) {
        setEsCargaSuelta(cargaSeleccionado.cod);
        setCargaNombre(cargaSeleccionado.nombre)
      }
    } else {
      setEsCargaSuelta('');
      setCargaNombre('')
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

  const handleCheck1Change = (event) => {
    if (event.target.checked) {
      setEsMotos(1);
    } else {
      setEsMotos(0);
    }
  };

  const handleCheck2Change = (event) => {
    if (event.target.checked) {
      setEsRepuestos(1);
    } else {
      setEsRepuestos(0);
    }
  };

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
          <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Contenedores</Button>
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
            <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Editar Contenedor</h5>
            <button
              className="btn btn-primary btn-block"
              type="button"
              style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
              onClick={handleChange2}>
              <SaveIcon /> Guardar
            </button>
          </div>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                disabled
                id="id"
                label="BL House"
                type="text"
                onChange={e => setCodigoBlHouse(e.target.value)}
                value={codigoBlHouse}
                className="form-control"
              />
              <TextField
                disabled
                id="nro-contenedor"
                label="Contenedor"
                type="text"
                onChange={e => setNroContenedor(e.target.value)}
                value={nroContenedor}
                className="form-control"
              />
              <Autocomplete
                id="tipo-contenedor"
                options={tipoList.map((tipo) => tipo.nombre)}
                value={nombreTipo}
                onChange={handleTipoChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Tipo Contenedor"
                    type="text"
                    multiline
                    rows={3}
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
                id="peso"
                label="Peso"
                type="text"
                onChange={e => setPeso(e.target.value)}
                value={peso}
                className="form-control"
              />
              <TextField
                required
                id="volumen"
                label="Volumen"
                type="text"
                onChange={e => setVolumen(e.target.value)}
                value={volumen}
                className="form-control"
              />
              <TextField
                required
                id="line-seal"
                label="Line Seal"
                type="text"
                onChange={e => setLineSeal(e.target.value)}
                value={lineSeal}
                className="form-control"
              />
              <TextField
                required
                id="shipper-seal"
                label="Shipper Seal"
                type="text"
                onChange={e => setShipperSeal(e.target.value)}
                value={shipperSeal}
                className="form-control"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                id="carga"
                options={cargaList.map((carga) => carga.nombre)}
                value={cargaNombre}
                onChange={handleCargaChange}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Es carga suelta"
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
                id="observaciones"
                label="Observaciones"
                multiline
                rows={4}
                type="text"
                onChange={e => setObservaciones(e.target.value)}
                value={observaciones}
                className="form-control"
                fullWidth
              />
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
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Contiene:</Typography>
                <Checkbox
                  checked={esMotos === 1}
                  onChange={handleCheck1Change}
                  icon={<FavoriteBorder style={{ fontSize: 30 }} />}
                  checkedIcon={<Favorite style={{ color: 'firebrick', fontSize: 35 }} />}
                />
                <Checkbox
                  checked={esRepuestos === 1}
                  onChange={handleCheck2Change}
                  icon={<BookmarkBorderIcon style={{ fontSize: 30 }} />}
                  checkedIcon={<BookmarkIcon style={{ color: 'firebrick', fontSize: 35 }} />}
                />
              </div>

            </Grid>
            <Grid item xs={12} md={3}>
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker', 'DatePicker']}>
                    <DatePicker
                      label="Fecha Salida"
                      value={dayjs(formData.fecha_salida, "DD/MM/YYYY")}
                      onChange={(newValue) => setFechaSalida(format(new Date(newValue), 'dd/MM/yyyy'))}
                      format={'DD/MM/YYYY'}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </Grid>
          </Grid>
          <div>
            <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
              <Tab label="Packinglist" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable title={"Packinglist por Contenedor"} data={packingList} columns={columns} options={options} />
              </ThemeProvider>
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
      <EditContainer />
    </SnackbarProvider>
  );
}