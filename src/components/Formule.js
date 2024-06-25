import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';
import LoadingCircle from './/contabilidad/crafter';
import Grid from '@mui/material/Grid';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import BuildIcon from '@mui/icons-material/Build';
import ExtensionIcon from '@mui/icons-material/Extension';
import ForwardTwoToneIcon from '@mui/icons-material/ArrowForward';
import ArrowIcon from '@mui/icons-material/ArrowBack';
import ArrowIcon2 from '@mui/icons-material/ManageHistoryTwoTone';

import { useAuthContext } from "../context/authContext";


const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
  datePickersContainer: {
    display: 'flex',
    gap: '15px',
  },
});

function Formules() {
  const { jwt, userShineray, enterpriseShineray, systemShineray, branchShineray } = useAuthContext();
  const [formules, setFormules] = useState([])
  const [statusList, setStatusList] = useState([])
  const [menus, setMenus] = useState([])
  const [lotes, setLotes] = useState([])
  const [currentLote, setCurrentLote] = useState()
  const [currentTipoLote, setCurrentTipoLote] = useState()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false);
  const [cantidadGen, setCantidadGen] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentAvailableStock, setCurrentAvailableStock] = useState(0);
  const [currentFormule, setCurrentFormule] = useState('')
  const [craft, setCraft] = useState(0);
  const { enqueueSnackbar } = useSnackbar();


  const getFormules = async () => {
    try {
      const res = await fetch(`${API}/formule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
          body: JSON.stringify({
            empresa: enterpriseShineray,
          })
        });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        console.log(data)
        setFormules(data)
      }
    } catch (error) {
      console.log(error)
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

  useEffect(() => {
    document.title = 'Formulas';
    getFormules();
    getMenus();
    getStatusList();
  }, [])

  const handleRowClick = async (rowData, rowMeta) => {
    const row = formules.filter(item => item.cod_formula === rowData[0])[0];
    var cantidadInventario = 0
    const res = await fetch(`${API}/validar_existencia`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          empresa: enterpriseShineray,
          cod_agencia: 6,
          cod_producto: row.cod_producto
        })
      });
    if (!res.ok) {
      if (res.status === 401) {
        toast.error('Sesión caducada.');
      }
    } else {
      const data = await res.json();
      cantidadInventario = data.cantidad_inventario
    }
    if (parseInt(cantidadInventario, 10) === 0) {
      navigate('/editFormule', { state: row });
    } else {
      toast.warning('Existen ' + cantidadInventario + ' productos creados con la Formula ' + row.nombre);
      navigate('/editFormule', { state: row });
    }
  }


  const handleChange2 = async (e) => {
    e.preventDefault();
    navigate('/newFormule');
  }

  const getStatusList = async () => {
    const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=PRO1`, {
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

  const columns = [
    {
      name: "cod_formula",
      label: "FORMULA"
    },
    {
      name: "nombre",
      label: "NOMBRE"
    },
    {
      name: "cod_producto",
      label: "Producto"
    },
    {
      name: "debito_credito",
      label: "Agrupar/Desagrupar",
      options: {
        customBodyRender: (value) => {
          // Verificar si la cadena es vacía o nula
          if (value === 1 || value === "") {
            return "Agrupar";
          } else {
            return "Desagrupar";
          }
        },
      },
    },
    {
      name: "cod_formula",
      label: "Accion",
      options: {
        customBodyRender: (value, tableMeta) => {
          const isButtonEnabled = tableMeta.rowData[3] === 2;
          return (
            <div style={{ textAlign: "center" }}>
              <IconButton onClick={() => handleRowClick(tableMeta.rowData)} color="primary" >
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleClickOpenNew(value, tableMeta.rowData, 0)} style={{ color: isButtonEnabled ? 'grey' : 'firebrick' }} disabled={isButtonEnabled}>
                <BuildIcon />
              </IconButton>
              {/* <IconButton onClick={() => handleClickOpenNew(value, tableMeta.rowData, 1)} style={{ color: isButtonEnabled ? 'grey' : 'firebrick' }} disabled={isButtonEnabled}>
                <ArrowIcon2 />
              </IconButton> */}
              <IconButton onClick={() => handleClickOpenNew(value, tableMeta.rowData, 2)} style={{ color: isButtonEnabled ? 'firebrick' : 'grey' }} disabled={!isButtonEnabled}>
                <ExtensionIcon />
              </IconButton>
            </div>
          );
        },
      },
    },
  ]

  const getLotes = async (cod_producto) => {
    const res = await fetch(`${API}/lotes_by_prod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        empresa: enterpriseShineray,
        cod_producto: cod_producto,
        cod_agencia: branchShineray
      })
    })
    const data = await res.json();
    console.log(data)
    if (!data.error) {
      setLotes(data.lotes)
      console.log(data.lotes)
    } else {
      enqueueSnackbar(data.error, { variant: 'warning' });
    }
  }

  const options = {
    responsive: 'standard',
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

  const handleClickOpenNew = async (cod_comprobante, rowData, craft) => {
    setOpen(true);
    setCraft(craft)
    setCurrentFormule(cod_comprobante)
    const row = formules.filter(item => item.cod_formula === rowData[0])[0];
    getLotes(row.cod_producto)
    const res = await fetch(`${API}/validar_existencia`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          empresa: enterpriseShineray,
          cod_agencia: 6,
          cod_producto: row.cod_producto
        })
      });
    if (!res.ok) {
      if (res.status === 401) {
        toast.error('Sesión caducada.');
      }
    } else {
      const data = await res.json();
      setCurrentStock(data.cantidad_inventario)
    }

    const res1 = await fetch(`${API}/validar_existencia_disponible`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
          empresa: enterpriseShineray,
          cod_agencia: 6,
          cod_formula: row.cod_formula
        })
      });
    if (!res1.ok) {
      if (res1.status === 401) {
        toast.error('Sesión caducada.');
      }
    } else {
      const data1 = await res1.json();
      setCurrentAvailableStock(data1.cantidad_inventario_disponible)
    }

  };
  const handleClose = () => {
    setCantidadGen(0)
    setCurrentFormule('')
    setOpen(false);
    setCurrentStock(0)
    setCraft(0)
    setLotes([])
    setCurrentLote('')
    setCurrentTipoLote('')

  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (craft == 0) {
      const res = await fetch(`${API}/generar_combo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
          body: JSON.stringify({
            empresa: enterpriseShineray,
            cod_formula: currentFormule,
            cantidad: parseInt(cantidadGen, 10),
            cod_agencia: branchShineray,
            usuario: userShineray
          })
        });
      const data = await res.json();
      setLoading(false);
      console.log(data)
      if (!data.error) {
        enqueueSnackbar('¡Generado exitosamente!', { variant: 'success' });
      } else {
        enqueueSnackbar(data.error, { variant: 'error' });
      }
    } else {
      if (craft == 1) {
        const res = await fetch(`${API}/desintegrar_combo`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify({
              empresa: enterpriseShineray,
              cod_formula: currentFormule,
              cantidad: parseInt(cantidadGen, 10),
              cod_agencia: branchShineray,
              usuario: userShineray
            })
          });
        const data = await res.json();
        setLoading(false);
        console.log(data)
        if (!data.error) {
          enqueueSnackbar('¡Desarmado exitosamente!', { variant: 'success' });
        } else {
          enqueueSnackbar(data.error, { variant: 'error' });
        }
      }
    }
    if (craft == 2) {
      const res = await fetch(`${API}/generar_despiece`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
          body: JSON.stringify({
            empresa: enterpriseShineray,
            cod_formula: currentFormule,
            cantidad: parseInt(cantidadGen, 10),
            cod_agencia: branchShineray,
            usuario: userShineray,
            cod_comprobante_lote: currentLote,
            tipo_comprobante_lote: currentTipoLote
          })
        });
      const data = await res.json();
      setLoading(false);
      console.log(data)
      if (!data.error) {
        enqueueSnackbar('¡Desarmado exitosamente!', { variant: 'success' });
      } else {
        enqueueSnackbar(data.error, { variant: 'error' });
      }
    }

    setCurrentFormule('')
    setCantidadGen(0)
    setOpen(false);
    setCurrentStock(0)
    setCraft(0)
    setLotes([])
    setCurrentLote('')
    setCurrentTipoLote('')
  }

  const handleLoteChange = (event, value) => {
    if (value) {
      const loteSeleccionado = lotes.find((lote) => lote.cod_comprobante_lote === value.value);
      if (loteSeleccionado) {
        setCurrentLote(loteSeleccionado.cod_comprobante_lote);
        setCurrentTipoLote(loteSeleccionado.tipo_comprobante_lote)
      }
    } else {
      setCurrentLote('');
      setCurrentTipoLote('')
    }
  };


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
      <SnackbarProvider>
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
              <Button onClick={() => { navigate('/dashboard') }}>Módulos</Button>
            </ButtonGroup>
          </Box>
        </div>
        <button
          className="btn btn-primary btn-block"
          type="button"
          style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
          onClick={handleChange2} >
          <AddIcon /> Nuevo
        </button>
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            title={"Formulas"}
            data={formules}
            columns={columns}
            options={options}
          />
        </ThemeProvider>


        <Dialog open={open} onClose={handleClose} maxWidth="xs" >
          <div style={{ display: "flex" }}>
            <div>
              <DialogContent >
                <Grid container spacing={3}>
                  <Grid item xs={12} sx={3}>
                    <TextField
                      disabled
                      id="stock"
                      label="Inventario Actual"
                      type="number"
                      value={currentStock}
                      className="form-control"
                      style={{ width: `130px` }}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: 'right' },
                        },
                      }}
                    />
                    {craft === 1 && (
                      <ForwardTwoToneIcon fontSize="large" style={{ marginTop: '10px' }} />
                    )}
                    {craft === 0 && (
                      <ArrowIcon fontSize="large" style={{ marginTop: '10px' }} />
                    )}
                    {craft === 2 && (
                      <ForwardTwoToneIcon fontSize="large" style={{ marginTop: '10px' }} />
                    )}
                    <TextField
                      disabled
                      id="stockAv"
                      label="Inventario Disponible"
                      type="number"
                      value={currentAvailableStock}
                      className="form-control"
                      style={{ width: `170px` }}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: 'right' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={3}>
                    {craft === 2 && (
                      <Autocomplete
                        id="lote"
                        options={lotes.map((lote) => ({
                          value: lote.cod_comprobante_lote,
                          label: `${lote.cod_comprobante_lote} Cont: ${lote.cantidad}`,
                        }))}
                        value={currentLote}
                        onChange={handleLoteChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            label="Lote"
                            type="text"
                            className="form-control"
                            InputProps={{
                              ...params.InputProps,
                            }}
                          />
                        )}
                      />
                    )}
                    <TextField
                      id="cantidad"
                      label={craft === 0 ? "Cantidad a Generar" : "Cantidad a Desarmar"}
                      type="number"
                      onChange={e => setCantidadGen(e.target.value)}
                      value={cantidadGen}
                      className="form-control"
                      style={{ width: `160px`, marginTop: `20px` }}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: 'right' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DialogActions>
                  {craft === 0 && (
                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }} >Generar</Button>
                  )}
                  {craft === 1 && (
                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }} >Desarmar</Button>
                  )}
                  {craft === 2 && (
                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }} >Despiezar</Button>
                  )}
                </DialogActions>
                <DialogActions>
                  <Button onClick={handleClose}>Cerrar</Button>
                </DialogActions>
              </div>
            </div>
          </div>
        </Dialog>
      </SnackbarProvider>
    )}
    </>
  )
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Formules />
    </SnackbarProvider>
  );
}