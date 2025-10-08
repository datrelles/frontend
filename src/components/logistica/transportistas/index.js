import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useAuthContext } from '../../../context/authContext';
import { getMenus } from '../../../services/api'
import {
  createTransportistaEcommerce,
  updateTransportistaEcommerce,
  deleteTransportistaEcommerce,
  getTransportistasMotos
} from '../../../services/api';
import Navbar0 from '../../Navbar0';

export const TransporteMotos = () => {
  const [menus, setMenus] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { jwt, enterpriseShineray, userShineray } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransportista, setSelectedTransportista] = useState(null);
  const [transportistaToDelete, setTransportistaToDelete] = useState(null);
  const [formData, setFormData] = useState({
    cod_transportista: '',
    nombre: '',
    apellido1: '',
    direccion: '',
    telefono: '',
    placa: '',
    cod_tipo_identificacion: '',
    es_activo: 1,
    activo_ecommerce: 0,
  });

  useEffect(() => {
    const fetchTransportistas = async () => {
      try {
        setLoading(true);
        const data = await getTransportistasMotos(jwt, enterpriseShineray);
        setTransportistas(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transportistas:', error);
        toast.error('Error fetching transportistas');
        setLoading(false);
      }
    };

    fetchTransportistas();
  }, [jwt, enterpriseShineray]);

  const handleOpenDialog = (transportista = null) => {
    setSelectedTransportista(transportista);
    setFormData(transportista || {
      cod_transportista: '',
      nombre: '',
      apellido1: '',
      direccion: '',
      telefono: '',
      placa: '',
      cod_tipo_identificacion: 2,
      es_activo: 1,
      activo_ecommerce: 1,
      empresa: enterpriseShineray
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTransportista(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      if (selectedTransportista) {
        // Update transportista
        await updateTransportistaEcommerce(jwt, formData);
        toast.success('Transportista actualizado con éxito');
      } else {
        // Create new transportista
        await createTransportistaEcommerce(jwt, formData);
        toast.success('Transportista creado con éxito');
      }
      handleCloseDialog();
      setTransportistas(await getTransportistasMotos(jwt, enterpriseShineray));
    } catch (error) {
      toast.error('Error al guardar el transportista');
      console.error('Error al guardar el transportista:', error);
    }
  };

  const handleDeleteClick = (transportista) => {
    setTransportistaToDelete(transportista);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTransportistaToDelete(null);
  };

  const confirmDelete = async () => {
    if (!transportistaToDelete) return;
    try {
      await deleteTransportistaEcommerce(jwt, transportistaToDelete.cod_transportista, transportistaToDelete.empresa);
      toast.success('Transportista eliminado con éxito');
      setTransportistas(await getTransportistasMotos(jwt, enterpriseShineray));
    } catch (error) {
      toast.error('Error al eliminar el transportista');
      console.error('Error al eliminar el transportista:', error);
    }
    handleCloseDeleteDialog();
  };

  const columns = [
    { name: 'cod_transportista', label: 'RUC', options: { filter: true, sort: true } },
    { name: 'nombre', label: 'Nombre', options: { filter: true, sort: true } },
    { name: 'apellido1', label: 'Apellido', options: { filter: true, sort: true } },
    { name: 'direccion', label: 'Dirección', options: { filter: true, sort: true } },
    { name: 'telefono', label: 'Teléfono', options: { filter: true, sort: true } },
    { name: 'placa', label: 'Placa', options: { filter: true, sort: true } },
    {
      name: 'actions',
      label: 'Acciones',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const transportista = transportistas[tableMeta.rowIndex];
          return (
            <>
              <Button
                variant="contained"
                style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
                onClick={() => handleOpenDialog(transportista)}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
                onClick={() => handleDeleteClick(transportista)}
              >
                Eliminar
              </Button>
            </>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: 'none',
    responsive: 'standard',
    rowsPerPage: 100,
    textLabels: {
      body: {
        noMatch: loading ? 'Cargando...' : 'No se encontraron registros',
      },
    },
  };

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

  //Menu
  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'LOG', jwt)
        setMenus(data)

      }
      catch (error) {
        toast.error(error)
      }

    }
    menu();
  }, [])

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <Navbar0 menus={menus} />
      <div style={{ padding: '20px' }}>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
        >
          CREAR
        </Button>
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            title={"Transportistas Ecommerce"}
            data={transportistas}
            columns={columns}
            options={options}
          />
        </ThemeProvider>
      </div>

      {/* Dialog for creating/updating transportista */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{selectedTransportista ? 'Editar Transportista' : 'Crear Transportista'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="RUC"
            name="cod_transportista"
            fullWidth
            value={formData.cod_transportista}
            onChange={handleChange}
            disabled={!!selectedTransportista}
          />
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formData.nombre}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Apellido"
            name="apellido1"
            fullWidth
            value={formData.apellido1}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Dirección"
            name="direccion"
            fullWidth
            value={formData.direccion}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            name="telefono"
            fullWidth
            value={formData.telefono}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Placa"
            name="placa"
            fullWidth
            value={formData.placa}
            onChange={handleChange}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>
            Cancelar
          </Button>
          <Button onClick={handleSave}
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
          >
            {selectedTransportista ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for confirming deletion */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>¿Está seguro de eliminar este transportista?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete}
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px', marginLeft: '15px' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
