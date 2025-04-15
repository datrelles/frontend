import React, { useState, useEffect, useRef } from 'react'
import MUIDataTable from 'mui-datatables'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from "moment";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { PedidoDialog } from './pedidosDialog'

import Navbar0 from '../../Navbar0'
import { useAuthContext } from '../../../context/authContext'
import { getMenus } from '../../../services/api'
import {
  getCasesPostVenta,
  getCasesPostVentaSubCases,
  putCasesPostVentaSubCases,
  getCasesPostVentaSubcasesUrl,
  getDataProvinces,
  getDataCityByProvince,
  postPostventasObs,
  getPostventasObsByCod,
  putUpdatePostventasObs,
  deletePostventasObs,
  getCasoPostventa,
  updateNumeroGuia,
  getClienteDataForId,
  getNombreProductoByMotor
} from '../../../services/api'

import { ProgressBar } from './progressLine'
import LoadingCircle from '../../contabilidad/loader'

// Import your new API calls:
import { cierrePrevio, cerrarCaso } from '../../../services/api'

export const CaseManager = () => {
  const [menus, setMenus] = useState([]);
  const { jwt, userShineray, enterpriseShineray } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [fromDate, setFromDate] = useState(moment().subtract(1, "months"))
  const [toDate, setToDate] = useState(moment)
  const [statusWarranty, setStatusWarranty] = useState('2')
  const [statusProcess, setStatusProcess] = useState('A')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [open, setOpen] = useState(false);
  const [subCases, setSubCases] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [dataCasosPostVenta, setDataCasosPostVenta] = useState([]);
  const [imagesSubCasesUrl, setImagesSubCasesUrl] = useState([]);
  const [videosSubCasesUrl, setVideosSubCasesUrl] = useState([]);
  const [refreshSubcases, setRegreshSubcases] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  // STATES FOR OBSERVATIONS
  const [observaciones, setObservaciones] = useState([]);
  const [editingObservation, setEditingObservation] = useState(null);
  const [editedObservationText, setEditedObservationText] = useState('');
  const observationRef = useRef(null);
  const numeroGuiaRef = useRef(null);

  // DIALOG: Edit/view case
  const [openEdit, setOpenEdit] = useState(false);
  const [dataCasoPostventaEdit, setDataCasoPostventaEdit] = useState(null);

  // DIALOG: "Realizar Pedido"
  const [openPedido, setOpenPedido] = useState(false);
  const [numeroGuia, setNumeroGuia] = useState('');
  // Estado para saber si el cliente existe
  const [clientExists, setClientExists] = useState(null);
  const [nombreProducto, setNombreProducto] = useState('');

  const listaProblemas = {
    46: "MOTOR",
    47: "ELECTRICO",
    48: "ESTRUCTURAL",
    49: "FALTANTE",
    50: "ESTETICO",
    51: "OTROS",
    52: "AMORTIGUADOR",
    53: "TANQUE",
    54: "BATERIA",
    55: "SISTEMA DE FRENO",
    56: "EMBRAGUE",
    57: "CARBURADOR",
    58: "TUBO DE ESCAPE",
    59: "CAJA DE CAMBIO",
    60: "VELOCIMETRO",
    61: "CILINDRO",
    62: "CABEZOTE",
    63: "CIGUEÑAL",
    64: "BOYA DE GASOLINA",
    65: "COMERCIAL",
    66: "OVERHAUL",
    67: "ENSAMBLAJE",
    68: "OBSEQUIOS"
  }

  const columnsCasosPostventa = [
    {
      name: "cod_comprobante",
      label: "Código Caso",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "center" }}>
            {value}
          </div>
        ),
      },
    },
    {
      name: "porcentaje",
      label: "% avance",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "center" }}>
            <ProgressBar percentage={value} />
          </div>
        ),
      },
    },
    {
      name: "fecha",
      label: "Fecha inicio",
      options: {
        customBodyRender: (value) => {
          const valueWithHor = new Date(value)
          const valueWithOutHor = valueWithHor.toISOString().split('T')[0];
          return (
            <div style={{ textAlign: "center" }}>
              {valueWithOutHor}
            </div>
          );
        },
      },
    },
    {
      name: "fecha",
      label: "Dias",
      options: {
        customBodyRender: (value) => {
          const starDate = new Date(value)
          const currentDate = new Date();
          const timeDifference = currentDate.getTime() - starDate.getTime();
          const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
          return (
            <div style={{ textAlign: "center" }}>
              {daysDifference}
            </div>
          );
        },
      },
    },
    {
      name: "nombre_caso",
      label: "caso",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "left" }}>
            {value}
          </div>
        ),
      },
    },
    {
      name: "taller",
      label: "Taller",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "left" }}>
            {value}
          </div>
        ),
      },
    },
    {
      name: "aplica_garantia",
      label: "Garantia",
      options: {
        customBodyRender: (value) => {
          let garantia = ''
          if (value === 1) {
            garantia = 'SI'
          } else if (value === 0) {
            garantia = 'NO'
          } else {
            garantia = 'Pendiente'
          }
          return (
            <div style={{ textAlign: "center", padding: "5px" }}>
              {garantia}
            </div>
          )
        },
      },
    },
    {
      name: "codigo_responsable",
      label: "Responsable",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "left" }}>
            {value}
          </div>
        ),
      },
    },
    {
      name: "cod_comprobante",
      label: "SUB CASOS",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "left" }}>
            <Button
              onClick={() => handleClickOpenNew(value)}
              color="primary"
              style={{
                marginBottom: '10px',
                marginTop: '10px',
                backgroundColor: 'firebrick',
                color: 'white',
                height: '30px',
                width: '100px',
                borderRadius: '5px',
                marginRight: '15px'
              }}
            >
              ABRIR
            </Button>
          </div>
        ),
      },
    },

    {
      name: "Detalles",
      label: "Detalles",
      options: {
        customBodyRender: (_, tableMeta) => {
          return (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleClickOpenEdit(tableMeta.rowData)}
            >
              ABRIR
            </Button>
          );
        }
      }
    },
    {
      name: "fecha_cierre",
      label: "FECHA CIERRE",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "left" }}>
            {value}
          </div>
        ),
      },
    },
    {
      name: "usuario_cierra",
      label: "CIERRE PREVIO",
      options: {
        customBodyRender: (value) => (
          <div style={{ textAlign: "left" }}>
            {value}
          </div>
        ),
      },
    }
  ];

  const options = {
    selectableRows: false,
    rowsPerPage: 10
  }

  // --------------------------------------
  // USEEFFECT (Menus)
  // --------------------------------------
  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'GAR', jwt)
        setMenus(data)
      }
      catch (error) {
        toast.error(error)
      }
    }
    menu();
  }, [])

  // --------------------------------------
  // USEEFFECT - GET CASOS POSTVENTA
  // --------------------------------------
  useEffect(() => {
    const functionGetCasosPostVenta = async (s, t) => {
      const start_date = s.format('DD/MM/YYYY')
      const end_date = t.format('DD/MM/YYYY')
      try {
        setLoading(true)
        const casosPostVenta = await getCasesPostVenta(jwt, start_date, end_date, statusWarranty, statusProcess, province, city)
        setDataCasosPostVenta(casosPostVenta)
        setLoading(false)
      }
      catch (error) {
        console.log(error)
        setLoading(false)
        throw error
      }
    }

    if (fromDate !== null && toDate !== null) {
      functionGetCasosPostVenta(fromDate, toDate);
    } else {
      functionGetCasosPostVenta(moment().subtract(1, "months"), moment());
    }
  }, [fromDate, toDate, statusWarranty, statusProcess, refreshSubcases, province, city])

  // Al montar, resetea el rango de fechas
  useEffect(() => {
    setToDate(null);
    setFromDate(null);
  }, [])

  // Provincias
  useEffect(() => {
    const getDataProvincesFunction = async () => {
      try {
        const response = await getDataProvinces(jwt);
        response.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        setProvinces(response)
      } catch (error) {
        console.log(error)
      }
    }
    getDataProvincesFunction();
  }, [])

  // Ciudades
  useEffect(() => {
    const getDataCitiesFunction = async () => {
      try {
        const response = await getDataCityByProvince(jwt, province);
        response.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        setCities(response)
      } catch (error) {
        console.log(error)
      }
    }
    getDataCitiesFunction();
  }, [province])

  useEffect(() => {
    if (dataCasoPostventaEdit) {
      setNumeroGuia(dataCasoPostventaEdit.numero_guia || '');
    }
  }, [dataCasoPostventaEdit]);

  // Efecto para llamar al endpoint de verificación del cliente
  useEffect(() => {
    const fetchCliente = async () => {
      if (dataCasoPostventaEdit && dataCasoPostventaEdit.identificacion_cliente) {
        try {
          // Se usa el endpoint importado getClienteDataForId (parámetros: jwt, codCliente, enterprise)
          await getClienteDataForId(jwt, dataCasoPostventaEdit.identificacion_cliente, enterpriseShineray);
          setClientExists(true);
        } catch (error) {
          setClientExists(false);
        }
      } else {
        setClientExists(false);
      }
    };
    fetchCliente();
  }, [dataCasoPostventaEdit, jwt, enterpriseShineray]);


  useEffect(() => {
    const fetchNombreProducto = async () => {
      if (dataCasoPostventaEdit?.cod_motor) {
        try {
          const response = await getNombreProductoByMotor(jwt, dataCasoPostventaEdit.cod_motor);
          setNombreProducto(response.nombre || 'No encontrado');
        } catch (error) {
          console.error('Error al obtener el nombre del producto:', error);
          setNombreProducto('Error al obtener el producto');
        }
      } else {
        setNombreProducto('');
      }
    };

    fetchNombreProducto();
  }, [dataCasoPostventaEdit?.cod_motor, jwt]);


  // SUBCASOS
  const handleRefresh = () => {
    setRegreshSubcases(prevState => !prevState);
  }

  // MUI THEME
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
              backgroundColor: 'firebrick',
              color: '#ffffff',
              fontWeight: 'bold',
              paddingLeft: '0px',
              paddingRight: '0px',
              fontSize: '12px'
            },
          }
        },
        MuiTable: {
          styleOverrides: {
            root: {
              borderCollapse: 'collapse',
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              borderBottom: '5px solid #ddd',
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

  const handleClickOpenNew = (cod_comprobante) => {
    const fetchDataSubcases = async () => {
      try {
        setLoading(true)
        const data = await getCasesPostVentaSubCases(jwt, cod_comprobante);
        setSubCases(data)
        setLoading(false)
        setOpen(true);
      } catch (error) {
        toast.error('NO SE PUEDE CARGAR LOS SUBCASOS')
        setLoading(false)
      }
    }

    const fetchDataSubcasesUrl = async () => {
      try {
        const data = await getCasesPostVentaSubcasesUrl(jwt, cod_comprobante);
        const images = data.images.split(', ');
        const videos = data.videos.split(', ');
        setImagesSubCasesUrl(images);
        setVideosSubCasesUrl(videos);
      } catch (error) {
        toast.error('NO SE PUEDE CARGAR LOS SUBCASOS')
      }
    }

    fetchDataSubcases();
    fetchDataSubcasesUrl();
  };

  const handleClose = () => {
    setOpen(false);
    setSubCases([]);
    setApprovalData([]);
    setImagesSubCasesUrl([]);
    setVideosSubCasesUrl([]);
  };

  const handleApproval = (index, estado) => {
    const newData = [...approvalData];
    newData[index] = { ...subCases[index], estado };
    setApprovalData(newData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setOpen(false);
      for (const caso of approvalData) {
        await putCasesPostVentaSubCases(
          jwt,
          caso.cod_comprobante,
          caso.codigo_problema,
          caso.estado
        );
        toast.success(`Caso actualizado: ${caso.descripcion}`)
      }
      setLoading(false)
      toast.success("Todos los casos han sido actualizados con éxito.");
    } catch (error) {
      setLoading(false)
      toast.error("Error al actualizar los casos:", error);
    }
    handleRefresh();
    setSubCases([]);
    setApprovalData([]);
    setImagesSubCasesUrl([]);
    setVideosSubCasesUrl([]);
  }

  // EDIT DIALOG
  const handleClickOpenEdit = async (rowData) => {
    const codComprobante = rowData[0]
    const empresa = 20
    const tipoComprobante = "CP"

    try {
      setLoading(true)
      const data = await getCasoPostventa(jwt, empresa, tipoComprobante, codComprobante)
      setDataCasoPostventaEdit(data)

      // Observations
      const obs = await getPostventasObsByCod(jwt, codComprobante)
      setObservaciones(obs)

      setOpenEdit(true)
      setLoading(false)
    } catch (error) {
      console.error("Error al obtener caso postventa:", error)
      toast.error("No se pudo cargar la información del caso")
      setLoading(false)
    }
  }

  const handleCloseEdit = () => {
    setOpenEdit(false)
    setDataCasoPostventaEdit(null)
  }

  // -------------------------------
  // HANDLERS FOR NEW OBSERVATIONS
  // -------------------------------
  const handleAddObservation = async () => {
    if (!dataCasoPostventaEdit) return;
    const currentObservation = observationRef.current.value;
    if (!currentObservation.trim()) {
      toast.error("La observación está vacía");
      return;
    }

    try {
      setLoading(true);
      const currentDateTime = moment().format('YYYY-MM-DDTHH:mm:ss');

      const payload = {
        empresa: 20,
        tipo_comprobante: "CP",
        cod_comprobante: dataCasoPostventaEdit.cod_comprobante,
        fecha: currentDateTime,
        usuario: userShineray,
        observacion: currentObservation,
        tipo: "OBS"
      };

      await postPostventasObs(jwt, payload);
      toast.success("Observación agregada");
      observationRef.current.value = ''; // Limpia el campo

      // Reload
      const obs = await getPostventasObsByCod(jwt, dataCasoPostventaEdit.cod_comprobante)
      setObservaciones(obs);
    } catch (error) {
      console.log(error);
      toast.error("Error al agregar la observación");
    } finally {
      setLoading(false);
    }
  };

  const handleEditObservation = (obs) => {
    setEditingObservation(obs);
    setEditedObservationText(obs.observacion);
  };

  const handleUpdateObservation = async () => {
    if (!editingObservation) return;

    try {
      setLoading(true);
      const updatePayload = {
        fecha: editingObservation.fecha,
        usuario: editingObservation.usuario,
        observacion: editedObservationText,
        tipo: editingObservation.tipo
      };

      await putUpdatePostventasObs(
        jwt,
        editingObservation.cod_comprobante,
        editingObservation.secuencia,
        updatePayload
      );

      toast.success("Observación actualizada");
      setEditingObservation(null);
      setEditedObservationText('');

      // Reload
      const obs = await getPostventasObsByCod(jwt, editingObservation.cod_comprobante);
      setObservaciones(obs);
    } catch (error) {
      console.log(error);
      toast.error("Error al actualizar la observación");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObservation = async (obs) => {
    try {
      setLoading(true);
      await deletePostventasObs(jwt, obs.cod_comprobante, obs.secuencia);
      toast.success("Observación eliminada");
      // Recarga
      const newObs = await getPostventasObsByCod(jwt, obs.cod_comprobante)
      setObservaciones(newObs);
    } catch (error) {
      console.log(error);
      toast.error("No se pudo eliminar la observación");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // CIERRE PREVIO
  // -----------------------------------------
  const handleCierrePrevio = async () => {
    if (!dataCasoPostventaEdit) return;
    try {
      // Prompt for an observation (or you can open a small modal)
      const observa = prompt("Ingrese observación para Cierre Previo:", "Cierre preliminar");
      if (observa === null) return; // user clicked Cancel

      const payload = {
        empresa: dataCasoPostventaEdit.empresa,
        tipoComprobante: dataCasoPostventaEdit.tipo_comprobante,
        codComprobante: dataCasoPostventaEdit.cod_comprobante,
        observacion: observa,
        usuarioCierra: userShineray
      };

      setLoading(true);
      await cierrePrevio(jwt, payload);
      toast.success("Cierre preliminar realizado con éxito.");
      setLoading(false);

      // (Optional) Refresh or close
      // handleCloseEdit();
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Error al realizar el cierre preliminar");
    }
  }

  // -----------------------------------------
  // CERRAR CASO DEFINITIVAMENTE
  // -----------------------------------------
  const handleCerrarCaso = async () => {
    if (!dataCasoPostventaEdit) return;
    try {
      const observa = prompt("Ingrese la observación final del caso:", "Cierre definitivo");
      if (observa === null) return;

      const body = {
        empresa: enterpriseShineray,
        cod_comprobante: dataCasoPostventaEdit.cod_comprobante,
        aplica_garantia: dataCasoPostventaEdit.aplica_garantia, // assume 2 = pendiente if not defined
        observacion_final: observa,
        usuario_cierra: userShineray,
        tipo_comprobante: "CP",
      };

      setLoading(true);
      await cerrarCaso(jwt, body);
      toast.success("Caso cerrado definitivamente.");
      setLoading(false);

      // (Optional) Refresh or close
      // handleCloseEdit();
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Error al cerrar el caso");
    }
  }

  // -----------------------------------------
  // DIALOG: "REALIZAR PEDIDO"
  // -----------------------------------------
  const handleOpenPedido = () => {
    setOpenPedido(true);
  };

  const handleClosePedido = () => {
    setOpenPedido(false);
  };

  const handleGenerarPedido = () => {
    toast.info("Generar Pedido (uno) - Pendiente de implementar");
  };

  const handleGenerarPedidoTodos = () => {
    toast.info("Generar Pedido (todos) - Pendiente de implementar");
  };

  const handleGuardarNumeroGuia = async () => {
    const nuevoNumeroGuia = numeroGuiaRef.current.value; // Lee el valor actual sin disparar re-renders en cada pulsación
    if (!nuevoNumeroGuia.trim()) {
      toast.error("Ingrese un número de guía válido.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        empresa: dataCasoPostventaEdit.empresa,
        cod_comprobante: dataCasoPostventaEdit.cod_comprobante,
        numero_guia: nuevoNumeroGuia
      };
      await updateNumeroGuia(jwt, payload);
      toast.success("Número de guía actualizado correctamente.");
      // Actualizamos opcionalmente el estado del caso
      setDataCasoPostventaEdit({
        ...dataCasoPostventaEdit,
        numero_guia: nuevoNumeroGuia
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error al actualizar el número de guía.");
      console.error(error);
    }
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  return (
    <>
      <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <Navbar0 menus={menus} />

        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '25px' }}>
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
            <div style={{ margin: '0 5px' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
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
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'space-between', marginLeft: '25px', width: '350px' }}>
          <div style={{ width: '48%', marginRight: '10px' }}>
            <label>Garantia</label>
            <Select
              margin="dense"
              id="aplica_garantia"
              name="Garantia"
              label="Garantia"
              style={{ width: '100%' }}
              value={statusWarranty}
              onChange={(event) => setStatusWarranty(event.target.value)}
            >
              <MenuItem value="2">Pendiente</MenuItem>
              <MenuItem value="1">Aplica Garantia</MenuItem>
              <MenuItem value="0">No Aplica</MenuItem>
            </Select>
          </div>

          <div style={{ width: '48%', marginRight: '10px' }}>
            <label>Estado</label>
            <Select
              margin="dense"
              id="status_case"
              name="status_case"
              label="Proceso"
              style={{ width: '100%' }}
              value={statusProcess}
              onChange={(event) => setStatusProcess(event.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="A">Pendiente</MenuItem>
              <MenuItem value="P">En Proceso</MenuItem>
              <MenuItem value="R">Cierre Previo</MenuItem>
              <MenuItem value="C">Cerrado</MenuItem>
            </Select>
          </div>

          <div style={{ width: '48%', marginRight: '10px' }}>
            <label>Provincia</label>
            <Select
              margin="dense"
              id="province"
              name="provincia"
              label="provincia"
              style={{ width: '100%' }}
              value={province}
              onChange={(event) => setProvince(event.target.value)}
            >
              {provinces.map((p) => (
                <MenuItem key={p.codigo_provincia} value={p.codigo_provincia}>
                  {p.descripcion}
                </MenuItem>
              ))}
              <MenuItem value=''>Todos</MenuItem>
            </Select>
          </div>

          <div style={{ width: '48%', marginRight: '10px' }}>
            <label>Ciudad</label>
            <Select
              margin="dense"
              id="aplica_garantia"
              name="Garantia"
              label="Garantia"
              style={{ width: '100%' }}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              {cities.map((c) => (
                <MenuItem key={c.codigo_ciudad} value={c.codigo_ciudad}>
                  {c.descripcion}
                </MenuItem>
              ))}
              <MenuItem value=''>Todos</MenuItem>
            </Select>
          </div>
        </div>

        <div style={{ margin: '25px' }}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"Casos PostVenta"}
              data={dataCasosPostVenta}
              columns={columnsCasosPostventa}
              options={options}
            />
          </ThemeProvider>
        </div>
      </div>

      {/* SUBCASES DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <div style={{ display: 'flex', width: '100%' }}>
          {/* Left side */}
          <div style={{ width: '50%', margin: '10px' }}>
            <DialogContent>
              <Grid container spacing={2}>
                {subCases.length === 0 ? (
                  <Grid item xs={12} container justifyContent="center" alignItems="center">
                    <Typography variant="body1">No hay subcasos</Typography>
                  </Grid>
                ) : (
                  subCases.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper style={{ padding: '16px', marginBottom: '16px' }}>
                        <TextField
                          label={listaProblemas[item.codigo_problema]}
                          value={item.descripcion}
                          variant="outlined"
                          fullWidth
                          disabled
                          multiline
                          minRows={2}
                          maxRows={3}
                        />
                        <TextField
                          select
                          label="Estado"
                          value={approvalData[index] ? approvalData[index].estado : subCases[index].estado}
                          onChange={(e) => handleApproval(index, e.target.value)}
                          variant="outlined"
                          fullWidth
                          style={{ marginTop: '8px' }}
                        >
                          <MenuItem value={2}>Pendiente</MenuItem>
                          <MenuItem value={1}>Aprobado</MenuItem>
                          <MenuItem value={0}>Rechazado</MenuItem>
                        </TextField>
                      </Paper>
                    </Grid>
                  ))
                )}
              </Grid>
            </DialogContent>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DialogActions>
                <Button
                  onClick={handleSave}
                  style={{
                    marginBottom: '10px',
                    marginTop: '10px',
                    backgroundColor: 'firebrick',
                    color: 'white',
                    height: '30px',
                    width: '100px',
                    borderRadius: '5px',
                    marginRight: '15px'
                  }}
                >
                  Guardar
                </Button>
              </DialogActions>
              <DialogActions>
                <Button onClick={handleClose}>Cerrar</Button>
              </DialogActions>
            </div>
          </div>

          {/* Right side */}
          <div style={{ width: '50%', margin: '10px' }}>
            <Grid container spacing={2}>
              {imagesSubCasesUrl.map((image, index) => (
                <Grid item xs={6} sm={6} key={index}>
                  <Paper style={{ width: '100%', height: '200px' }}>
                    <img
                      src={image.toLowerCase()}
                      alt={`Image ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px' }}>
              {videosSubCasesUrl.map((video, index) => (
                <Typography key={index} component="div" variant="body1">
                  <a href={video.toLowerCase()} target="_blank" rel="noopener noreferrer">
                    Video {index + 1}
                  </a>
                </Typography>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      {/* EDIT / VIEW CASE DIALOG */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Información del Caso Postventa</DialogTitle>
        <DialogContent dividers>
          {dataCasoPostventaEdit ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Código Caso"
                  value={dataCasoPostventaEdit.cod_comprobante || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre Caso"
                  value={dataCasoPostventaEdit.cod_motor || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Adicionado por"
                  value={dataCasoPostventaEdit.adicionado_por || ''}
                  fullWidth
                  margin="dense"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Responsable"
                  value={dataCasoPostventaEdit.codigo_responsable || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Aplica Garantia"
                  value={
                    dataCasoPostventaEdit.aplica_garantia === 1 ? "APROBADA" :
                      dataCasoPostventaEdit.aplica_garantia === 0 ? "NEGADA" :
                        dataCasoPostventaEdit.aplica_garantia === 2 ? "PENDIENTE" :
                          ''
                  }
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="cod motor"
                  value={dataCasoPostventaEdit.cod_motor || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Modelo"
                  value={nombreProducto}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="cod producto"
                  value={dataCasoPostventaEdit.cod_producto || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="descripcion"
                  value={dataCasoPostventaEdit.descripcion || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="email1"
                  value={dataCasoPostventaEdit.e_mail1 || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="email2"
                  value={dataCasoPostventaEdit.e_mail2 || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="estado"
                  value={
                    dataCasoPostventaEdit.estado === 'A' ? 'Pendiente' :
                      dataCasoPostventaEdit.estado === 'P' ? 'En proceso' :
                        dataCasoPostventaEdit.estado === 'R' ? 'R cierre previo' :
                          dataCasoPostventaEdit.estado === 'C' ? 'C cerrado' :
                            ''
                  }
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="fecha"
                  value={dataCasoPostventaEdit.fecha || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="fecha adicion"
                  value={dataCasoPostventaEdit.fecha_adicion || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="fecha cierre"
                  value={dataCasoPostventaEdit.fecha_cierre || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="fecha venta"
                  value={dataCasoPostventaEdit.fecha_venta || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="identificacion cliente"
                  value={dataCasoPostventaEdit.identificacion_cliente || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{
                    readOnly: true,
                    // Muestra el ícono si ya se realizó la consulta:
                    endAdornment: (
                      <InputAdornment position="end">
                        {clientExists === null ? null
                          : clientExists ? <CheckCircleIcon style={{ color: 'green' }} />
                            : <CancelIcon style={{ color: 'red' }} />}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="kilometraje"
                  value={dataCasoPostventaEdit.kilometraje || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="nombre cliente"
                  value={dataCasoPostventaEdit.nombre_cliente || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="observacion final"
                  value={dataCasoPostventaEdit.observacion_final || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="referencia"
                  value={dataCasoPostventaEdit.referencia || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="telefono contacto1"
                  value={dataCasoPostventaEdit.telefono_contacto1 || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="telefono contacto2"
                  value={dataCasoPostventaEdit.telefono_contacto2 || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="usuario_cierra"
                  value={dataCasoPostventaEdit.usuario_cierra || ''}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Guía"
                  defaultValue={dataCasoPostventaEdit.numero_guia || ''}
                  inputRef={numeroGuiaRef}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGuardarNumeroGuia}
                  style={{ marginTop: '20px', backgroundColor: 'firebrick' }}
                >
                  Agregar Número de Guía
                </Button>
              </Grid>

              {/* OBSERVACIONES */}
              <Grid item xs={12}>
                <Typography variant="h6" style={{ marginTop: '30px' }}>
                  Observaciones
                </Typography>

                <div style={{ display: 'flex', marginTop: '10px', marginBottom: '20px' }}>
                  <TextField
                    label="Nueva Observación"
                    inputRef={observationRef}
                    defaultValue=""
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddObservation}
                    style={{ marginLeft: '10px', height: '54px' }}
                  >
                    Agregar
                  </Button>
                </div>

                {observaciones.length === 0 ? (
                  <Typography variant="body2">
                    No hay observaciones.
                  </Typography>
                ) : (
                  observaciones.map((obs) => (
                    <Paper key={obs.secuencia} style={{ padding: '10px', marginBottom: '10px' }}>
                      {editingObservation && editingObservation.secuencia === obs.secuencia ? (
                        <>
                          <TextField
                            label={`Editando secuencia #${obs.secuencia}`}
                            value={editedObservationText}
                            onChange={(e) => setEditedObservationText(e.target.value)}
                            multiline
                            minRows={2}
                            fullWidth
                          />
                          <div style={{ marginTop: '8px', textAlign: 'right' }}>
                            <Button
                              onClick={handleUpdateObservation}
                              variant="contained"
                              color="primary"
                              size="small"
                              style={{ marginRight: '6px' }}
                            >
                              Guardar
                            </Button>
                            <Button
                              onClick={() => setEditingObservation(null)}
                              variant="outlined"
                              size="small"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2">
                            <strong>Observacion #{obs.secuencia}</strong> | {obs.tipo} | {obs.fecha?.slice(0, 19).replace('T', ' ')} | Usuario: {obs.usuario}
                          </Typography>
                          <Typography variant="body2" style={{ marginTop: '5px' }}>
                            {obs.observacion}
                          </Typography>
                          <div style={{ marginTop: '8px', textAlign: 'right' }}>
                            <Button
                              onClick={() => handleEditObservation(obs)}
                              variant="contained"
                              color="primary"
                              size="small"
                              style={{ marginRight: '6px' }}
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteObservation(obs)}
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={true}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </>
                      )}
                    </Paper>
                  ))
                )}
              </Grid>
            </Grid>
          ) : (
            <p>Cargando datos...</p>
          )}
        </DialogContent>
        <DialogActions>
          {/* 1) ABRIR DIALOGO "REALIZAR PEDIDO" */}
          <Button onClick={handleOpenPedido} variant="contained" color="primary" disabled={!(['P', 'R'].includes(dataCasoPostventaEdit?.estado))}>
            Realizar Pedido
          </Button>

          {/* 2) CIERRE PREVIO */}
          <Button onClick={handleCierrePrevio} variant="contained" color="primary" disabled={!(['P', 'R'].includes(dataCasoPostventaEdit?.estado))}>
            Cierre Previo
          </Button>

          {/* 3) CERRAR CASO DEFINITIVO */}
          <Button onClick={handleCerrarCaso} variant="contained" color="primary" disabled={!(['P', 'R'].includes(dataCasoPostventaEdit?.estado))}>
            Cerrar Caso
          </Button>

          <Button onClick={handleCloseEdit} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG "REALIZAR PEDIDO" */}
      <PedidoDialog
        openPedido={openPedido}
        handleClosePedido={handleClosePedido}
        handleGenerarPedido={handleGenerarPedido}
        handleGenerarPedidoTodos={handleGenerarPedidoTodos}
        dataCasoPostventaEdit={dataCasoPostventaEdit}
      />

      {/* LOADING SPINNER */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LoadingCircle />
        </div>
      )}
    </>
  )
}
