import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useAuthContext } from '../../../context/authContext';
import Navbar0 from '../../Navbar0';
import { getMenus, getModeloCrecimientoBI, getListModelMotorcycle, updateModeloCrecimientoBI } from '../../../services/api';
import './ParametrizacionModelosDespiece.css';

export const ParametrizacionModelosDespieceAnio = () => {
  const [crecimientoBI, setCrecimientoBI] = useState([]);
  const [loading, setLoading] = useState(false);
  const { jwt, userShineray, enterpriseShineray } = useAuthContext();
  const [menus, setMenus] = useState([]);
  const [models, setModels] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [anio, setAnio] = useState('');
  const [valor, setValor] = useState('');
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'IN', jwt);
        setMenus(data);
      } catch (error) {
        console.log(error);
        toast.error(error);
      }
    };
    menu();
  }, []);

  useEffect(() => {
    const fetchModeloCrecimientoBI = async () => {
      try {
        setLoading(true);
        const modeloCrecimientoBI = await getModeloCrecimientoBI(jwt);
        setCrecimientoBI(modeloCrecimientoBI);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching modelo crecimiento BI data:', error);
        toast.error('Error fetching modelo crecimiento BI data');
        setLoading(false);
      }
    };

    fetchModeloCrecimientoBI();
  }, [flag]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const listModel = await getListModelMotorcycle(jwt, enterpriseShineray);
        setModels(listModel);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Error fetching models');
        setLoading(false);
      }
    };

    fetchModels();
  }, [flag]);

  const crecimientoBIConProducto = crecimientoBI.map(item => {
    const model = models.find(m => m.cod_producto === item.cod_modelo);
    return {
      ...item,
      producto: model ? model.producto : 'Producto no encontrado'
    };
  });

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setAnio(item.anio || '');
    setValor(item.valor || '');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedItem(null);
  };

  const handleUpdate = async () => {
    try {
      const data = {
        cod_modelo: selectedItem.cod_modelo,
        cod_despiece: selectedItem.cod_despiece,
        anio,
        valor,
      };
      await updateModeloCrecimientoBI(jwt, data);
      toast.success('Registro actualizado con éxito');
      setFlag(prevFlag => !prevFlag);
      setOpen(false);
      // Actualizar la tabla si es necesario
    } catch (error) {
      toast.error('Error al actualizar el registro');
    }
  };

  const columns = [
    {
      name: "cod_modelo",
      label: "Código Modelo",
      options: {
        filter: true,
        sort: true,
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
      name: "producto",
      label: "Nombre Producto",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return (
            <div style={{ textAlign: "left" }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "anio",
      label: "Año",
      options: {
        filter: true,
        sort: true,
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
        filter: true,
        sort: true,
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
      name: "actions",
      label: " ",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const rowData = crecimientoBIConProducto[tableMeta.rowIndex];
          return (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleOpenDialog(rowData)}
              style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft:'15px' }}
            >
              Actualizar
            </Button>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: false,
    rowsPerPage: 100,
  };

  const getMuiTheme = () => createTheme({
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
      <div className="parametrizacion-container-crecimiento-bi">
        
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"Crecimiento BI"}
              data={crecimientoBIConProducto}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
       
      </div>

      {/* Pop-up Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Actualizar Registro</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Año"
            type="number"
            fullWidth
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Valor"
            type="number"
            fullWidth
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} >
            Cancelar
          </Button>
          <Button onClick={handleUpdate} color="primary" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
