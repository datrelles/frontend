import React, { useState, useEffect } from 'react'
import Navbar0 from '../../Navbar0'
import { getMenus } from '../../../services/api'
import { useAuthContext } from '../../../context/authContext'
import { toast } from 'react-toastify';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { postDocumentsSri } from '../../../services/api';
import { getDocumentsSri } from '../../../services/api';
import LoadingCircle from '../loader';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from "moment";
import { TextField } from '@mui/material';
import SearchIcon from '@material-ui/icons/Search';


import * as XLSX from 'xlsx'
export const ElectronicFilesSri = () => {
  const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState(null);
  const [data, setData] = useState(null);
  const [dataSri, setDataSri] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(moment().subtract(1, "months"));
  const [toDate, setToDate] = useState(moment);


  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'CON', jwt)
        setMenus(data)

      }
      catch (error) {
        toast.error(error)
      }

    }
    menu();
  }, [])

  useEffect(() => {

    const getDataSri = async () => {
      try {
        setLoading(true)
        const start_date = fromDate.format('DD/MM/YYYY')
        const end_date = toDate.format('DD/MM/YYYY')
        if (start_date !== null && end_date !== null) {
          const response = await getDocumentsSri(start_date, end_date, jwt);
          if (response.length > 0) {
            console.log(response)
            setDataSri(response)
          }
          setLoading(false)
          setToDate(null);
          setFromDate(null);
        }

      } catch (error) {
        setLoading(false)

      }
    }
    getDataSri();
  }, [])

  const options = {
    //onRowClick: handleRowClick,
    //onRowsDelete: handleDeleteRows,
    responsive: 'standard',
    download: false,
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

  const columns = [

    {
      name: "comprobante",
      label: "Tipo de Comprobante"
    },
    {
      name: "fecha_autorizacion",
      label: "Fecha de Autorización"
    },
    {
      name: "fecha_emision",
      label: "Fecha de Emisión"
    },
    {
      name: "identificacion_receptor",
      label: "Identificación del Receptor"
    },

    {
      name: "numero_autorizacion",
      label: "Número de Autorización"
    },
    {
      name: "numero_documento_modificado",
      label: "Número de Documento Modificado"
    },
    {
      name: "razon_social_emisor",
      label: "Razón Social del Emisor"
    },
    {
      name: "ruc_emisor",
      label: "RUC del Emisor"
    },
    {
      name: "serie_comprobante",
      label: "Serie del Comprobante"
    },
    {
      name: "tipo_emision",
      label: "Tipo de Emisión"
    },
    {
      name: "clave_acceso",
      label: "Clave de Acceso"
    },
    {
      name: "valor_sin_impuestos",
      label: "valor sin IVA"
    },
    {
      name: "iva",
      label: "IVA"
    },

    {
      name: "importe_total",
      label: "Importe Total"
    },
  ];


  // Función para realizar la búsqueda y reemplazo
  const buscarYReemplazar = (cadena) => {
    if (cadena == undefined) {
      console.log(cadena)
      return undefined
    } else {
      const mapeoReemplazos = {
        'Retenci�n': 'Retencion',
        'Cr�dito': 'Credito',
        'D�bito': 'Debito',
      };

      // Realizar el reemplazo utilizando expresiones regulares
      return cadena.replace(/Retenci�n|Cr�dito|D�bito/g, (match) => mapeoReemplazos[match]);

    }



  };
  const handleSaveData = async () => {
    try {
      setLoading(true)
      const datosActualizados = data.map((item) => ({
        ...item,
        COMPROBANTE: buscarYReemplazar(item.COMPROBANTE),
      }));
      const response = await postDocumentsSri(datosActualizados, jwt);
      setLoading(false)

    } catch (error) {
      setLoading(false)
      console.log(error)

    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setName(file.name)
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;

        // Divide el contenido en líneas
        const lines = fileContent.split('\n');

        // Divide cada línea en campos y crea objetos JSON
        const jsonData = lines.slice(1).map((line) => {
          const fields = line.split('\t');
          return {
            COMPROBANTE: fields[2],
            SERIE_COMPROBANTE: fields[3],
            RUC_EMISOR: fields[0],
            RAZON_SOCIAL_EMISOR: fields[1],
            FECHA_EMISION: fields[6],
            FECHA_AUTORIZACION: fields[5],
            //TIPO_EMISION: fields[6],
            VALOR_SIN_IMPUESTOS: fields[8],
            NUMERO_DOCUMENTO_MODIFICADO: fields[11],
            IDENTIFICACION_RECEPTOR: fields[7],
            CLAVE_ACCESO: fields[4],
            //NUMERO_AUTORIZACION: fields[10],
            IVA: fields[9],
            IMPORTE_TOTAL: fields[10]
          };
        });

        setData(jsonData);
      };

      reader.readAsText(file);
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
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataSri);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
    XLSX.writeFile(wb, `_detalles.xlsx`);

  };

  const handleChangeDate = async () => {
    try {
      setLoading(true)
      const start_date = fromDate.format('DD/MM/YYYY')
      const end_date = toDate.format('DD/MM/YYYY')
      if (start_date !== null && end_date !== null) {
        setToDate(null);
        setFromDate(null);
        const response = await getDocumentsSri(start_date, end_date, jwt);
        if (response.length >= 0) {
          setDataSri(response)
        }
        setLoading(false)

      }

    } catch (error) {
      setLoading(false)

    }

  };



  return (
    <>
      {loading ? (<LoadingCircle />) : (
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <input
              accept=".txt"
              id="file-upload"
              multiple
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '45px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
                CARGAR
              </Button>
            </label>
            <div>
              {name === null ? null :
                <>
                  <p className=''>
                    {name}</p>
                </>
              }
            </div>
            <div>
              <div>
                {name === null ? null :
                  <>
                    <Button onClick={() => handleSaveData()} variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '45px', width: '170px', borderRadius: '5px', marginRight: '15px', marginLeft: '32px' }}>
                      GUARDAR
                    </Button>
                  </>
                }
              </div>

            </div>

          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                  <DemoContainer components={['DatePicker']} >
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
              <div>
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                  onClick={handleChangeDate} >
                  <SearchIcon /> Buscar
                </button>
              </div>
            </div>
          </div>


          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"Ordenes de Compra"}
              data={dataSri}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>
      )}

    </>
  )
}
