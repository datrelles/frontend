import React, { useState, useEffect } from 'react'
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

import Navbar0 from '../../Navbar0'
import { useAuthContext } from '../../../context/authContext'
import { getMenus } from '../../../services/api'
import {
  getCasesPostVenta,
  getCasesPostVentaSubCases,
  putCasesPostVentaSubCases,
  getCasesPostVentaSubcasesUrl,
  getDataProvinces,
  getDataCityByProvince
} from '../../../services/api'

// Importamos la función que llama a la API de caso postventa
import { getCasoPostventa } from '../../../services/api'

import { ProgressBar } from './progressLine'
import LoadingCircle from '../../contabilidad/loader'

export const CaseManager = () => {
  const [menus, setMenus] = useState([]);
  const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
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

  // ---------------------------
  // ESTADO PARA EL DIALOGO DE VISUALIZACIÓN/EDICIÓN
  // ---------------------------
  const [openEdit, setOpenEdit] = useState(false);
  const [dataCasoPostventaEdit, setDataCasoPostventaEdit] = useState(null);

  // Mapeo de tipos de problema (ya lo tenías en tu código)
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

  // COLUMNAS DE LA TABLA (no se altera nada del funcionamiento original)
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
    },
    // BOTÓN EXTRA PARA VISUALIZAR/EDITAR EL CASO POSTVENTA
    {
      name: "editar",
      label: "Editar",
      options: {
        customBodyRender: (_, tableMeta) => {
          // tableMeta.rowData corresponde a la data de esa fila
          // en el orden definido arriba
          return (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleClickOpenEdit(tableMeta.rowData)}
            >
              EDITAR
            </Button>
          );
        }
      }
    }
  ];

  const options = {
    selectableRows: false,
    rowsPerPage: 100
  }

  // --------------------------------------
  // EFECTOS (USEEFFECT) - SIN ALTERAR NADA
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

  // ----------------------------------------
  // MANEJO DE SUB-CASOS (ya existente)
  // ----------------------------------------
  const handleRefresh = () => {
    setRegreshSubcases(prevState => !prevState);
  }

  const getMuiTheme = () => createTheme({
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
        console.log('error')
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
        console.log('error')
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

  // ----------------------------------------
  // MANEJO DEL NUEVO DIALOGO "EDITAR CASO"
  // ----------------------------------------
  const handleClickOpenEdit = async (rowData) => {
    /*
      rowData es un array con las celdas de la fila en orden:
        rowData[0] -> cod_comprobante
        rowData[1] -> % de avance
        ...
      Ajusta según tu lógica real si necesitas.
      
      En este ejemplo forzamos (empresa=1, tipoComprobante="FA").
      Cámbialos para que coincidan con tu implementación real.
    */
    const codComprobante = rowData[0]
    const empresa = 20
    const tipoComprobante = "CP"

    try {
      setLoading(true)
      const data = await getCasoPostventa(jwt, empresa, tipoComprobante, codComprobante)
      setDataCasoPostventaEdit(data)
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

  const handleSaveEdit = () => {
    // Aquí podrías hacer un PUT/PATCH si quisieras editar.
    // Ahora solo mostramos un mensaje de ejemplo.
    toast.info("Aquí iría la lógica para GUARDAR cambios (PUT/PATCH).")
    handleCloseEdit()
  }

  // ----------------------------------------
  // RENDER PRINCIPAL
  // ----------------------------------------
  return (
    <>
      {loading ? (
        <LoadingCircle />
      ) : (
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
      )}

      {/* --DIALOGO LIST (SUB CASOS)-- */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth >
        <div style={{ display: "flex" }}>
          <div>
            <DialogContent>
              <Grid container spacing={2}>
                {subCases.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <div>
                      <TextField
                        label={listaProblemas[item.codigo_problema]}
                        value={item.descripcion}
                        variant="outlined"
                        fullWidth
                        disabled
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
                    </div>
                    <div style={{ width: '100%', height: '1px', background: 'black', marginTop: '10px' }}></div>
                  </Grid>
                ))}
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

          <div style={{ margin: "25px" }}>
            <Grid container spacing={2}>
              {/* Renderiza las imágenes */}
              {imagesSubCasesUrl.map((image, index) => (
                <Grid item key={index}>
                  <Paper style={{ width: "200px", height: "200px" }}>
                    <img
                      src={image.toLowerCase()}
                      alt={`Image ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Renderiza los enlaces de los videos */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px" }}>
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

      {/* -- NUEVO DIALOGO PARA VISUALIZAR/EDITAR EL CASO POSTVENTA -- */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Información del Caso Postventa</DialogTitle>
        <DialogContent dividers>
          {dataCasoPostventaEdit ? (
            <Grid container spacing={2}>

              {/* Puedes acomodarlos en dos columnas, en la que quieras. Aquí se hace a 2 columnas (xs={12} sm={6}). */}

              <Grid item xs={12} sm={6}>

                <Grid item xs={12} >
                  <TextField
                    label="Código Caso"
                    value={dataCasoPostventaEdit.cod_comprobante || ''}
                    fullWidth
                    margin="dense"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nombre Caso"
                    value={dataCasoPostventaEdit.cod_motor || ''}
                    fullWidth
                    margin="dense"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

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
                  label="Aplica Garantia (1 Subcaso)"
                  value={
                    dataCasoPostventaEdit.aplica_garantia === 1 ? "APROBADA" :
                      dataCasoPostventaEdit.aplica_garantia === 0 ? "NEGADA" :
                        dataCasoPostventaEdit.aplica_garantia === 2 ? "PENDIENTE" : ''
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
                  value={dataCasoPostventaEdit.estado || ''}
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
                  InputProps={{ readOnly: true }}
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


              <Grid item xs={12} sm={6}>
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
            </Grid>
          ) : (
            <p>Cargando datos...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Guardar
          </Button>
          <Button onClick={handleCloseEdit} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
