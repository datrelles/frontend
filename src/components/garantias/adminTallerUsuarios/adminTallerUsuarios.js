import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Navbar0 from '../../Navbar0';
import {
  getInfoActiveTalleres,
  getUsuariosRolAstgar,
  postAssignTallerUsuario,
  putUpdateTallerUsuario,
  deleteTallerUsuario,
  getTallerUsuarioRelations,
  getMenus
} from '../../../services/api';
import { useAuthContext } from '../../../context/authContext';

export const AdminTallerUsuarios = () => {
  const { jwt, enterpriseShineray, userShineray } = useAuthContext();

  // States
  const [talleres, setTalleres] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTaller, setSelectedTaller] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [relationshipToEdit, setRelationshipToEdit] = useState(null);
  const [menus, setMenus] = useState([]);
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCanton, setFilterCanton] = useState('');

  // Load talleres
  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        const resp = await getInfoActiveTalleres(jwt, 1, enterpriseShineray);
        setTalleres(resp);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load talleres');
      }
    };
    fetchTalleres();
  }, [jwt, enterpriseShineray]);

  // Load usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const resp = await getUsuariosRolAstgar(jwt);
        setUsuarios(resp);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load ASTGAR users');
      }
    };
    fetchUsuarios();
  }, [jwt]);

  // Load relationships
  useEffect(() => {
    refreshRelationships();
  }, [jwt, enterpriseShineray]);

  const refreshRelationships = async () => {
    try {
      const resp = await getTallerUsuarioRelations(jwt, enterpriseShineray);
      setRelationships(resp);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load relationships');
    }
  };

  // Load menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'GAR', jwt);
        setMenus(data);
      } catch (error) {
        toast.error(error);
      }
    };
    fetchMenus();
  }, [userShineray, enterpriseShineray, jwt]);

  // Assign taller
  const handleAssign = async () => {
    if (!selectedUser || !selectedTaller) {
      toast.error('Please select both a user and a taller');
      return;
    }

    const newRelation = {
      empresa: enterpriseShineray,
      codigo_taller: selectedTaller,
      cod_rol: 'ASTGAR',
      usuario: selectedUser,
      activo: 1,
      adicionado_por: userShineray
    };

    try {
      await postAssignTallerUsuario(jwt, newRelation);
      toast.success('Taller assigned successfully');
      refreshRelationships();
      setSelectedUser('');
      setSelectedTaller('');
    } catch (error) {
      console.error(error);
      toast.error('Error assigning taller');
    }
  };

  // Edit relationship
  const handleEdit = (rel) => {
    setEditMode(true);
    setRelationshipToEdit({ ...rel });
  };

  const handleUpdate = async () => {
    if (!relationshipToEdit) {
      toast.error('No relationship selected for editing');
      return;
    }

    try {
      const dataToUpdate = {
        empresa: relationshipToEdit.empresa,
        codigo_taller: relationshipToEdit.codigo_taller,
        cod_rol: relationshipToEdit.cod_rol,
        usuario: relationshipToEdit.usuario,
        activo: relationshipToEdit.activo,
        modificado_por: userShineray
      };

      await putUpdateTallerUsuario(jwt, dataToUpdate);
      toast.success('Relationship updated');
      setEditMode(false);
      setRelationshipToEdit(null);
      refreshRelationships();
    } catch (error) {
      console.error(error);
      toast.error('Error updating relationship');
    }
  };

  // Delete relationship
  const handleDelete = async (rel) => {
    try {
      await deleteTallerUsuario(jwt, {
        empresa: rel.empresa,
        codigo_taller: rel.codigo_taller,
        cod_rol: rel.cod_rol,
        usuario: rel.usuario
      });
      toast.success('Relationship deleted');
      refreshRelationships();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting relationship');
    }
  };

  // Columns for MUIDataTable
  const columns = [
    { name: 'codigo_taller', label: 'Código Taller' },
    { name: 'taller', label: 'Taller' },
    { name: 'provincia', label: 'Provincia' },
    { name: 'canton', label: 'Cantón' },
    { name: 'usuario', label: 'Usuario' },
    { name: 'cod_rol', label: 'Rol' },
    {
      name: 'activo',
      label: 'Activo',
      options: {
        customBodyRender: (value) => (value === 1 ? 'Sí' : 'No'),
      },
    },
    {
      name: 'acciones',
      label: 'Acciones',
      options: {
        customBodyRender: (_, tableMeta) => {
          const rel = relationships[tableMeta.rowIndex];
          return (
            <>
              <Button
                size="small"
                onClick={() => handleEdit(rel)}
                style={{ marginRight: '5px', backgroundColor: 'firebrick', color: 'white' }}
              >
                Editar
              </Button>
              <Button
                size="small"
                onClick={() => handleDelete(rel)}
                style={{ backgroundColor: 'firebrick', color: 'white' }}
              >
                Eliminar
              </Button>
            </>
          );
        },
      },
    },
  ];

  // Table options
  const options = {
    selectableRows: false,
    responsive: 'standard',
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 50],
    download: false,
    print: false,
    filter: false,
    viewColumns: false,
  };

  // Theme for MUIDataTable
  const getMuiTheme = () =>
    createTheme({
      components: {
        MuiTableCell: {
          styleOverrides: {
            head: {
              backgroundColor: 'firebrick',
              color: '#ffffff',
              fontWeight: 'bold',
            },
          },
        },
      },
    });

  // Get unique options for provinces and cantons
  const provinces = Array.from(new Set(talleres.map((t) => t.provincia)));
  const cantons = filterProvince
    ? Array.from(
        new Set(
          talleres
            .filter((t) => t.provincia === filterProvince)
            .map((t) => t.canton)
        )
      )
    : Array.from(new Set(talleres.map((t) => t.canton)));

  // Filter the talleres array based on the selected filters
  const filteredTalleres = talleres.filter(
    (t) =>
      (filterProvince === '' || t.provincia === filterProvince) &&
      (filterCanton === '' || t.canton === filterCanton)
  );

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
      <Navbar0 menus={menus} />
      <Box sx={{ margin: '50px' }}>
        <h2>Admin - Talleres & Usuarios (ASTGAR)</h2>

        {/* Select User */}
        <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <FormControl sx={{ minWidth: 320 }}>
            <InputLabel>Usuario (ASTGAR)</InputLabel>
            <Select
              value={selectedUser}
              label="Usuario (ASTGAR)"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <MenuItem value="">
                <em>-- Seleccionar Usuario --</em>
              </MenuItem>
              {usuarios.map((u) => (
                <MenuItem key={u.usuario} value={u.usuario}>
                  {u.usuario} - {u.nombre} {u.apellido1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Select Taller */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: '20px' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Province</InputLabel>
              <Select
                value={filterProvince}
                label="Province"
                onChange={(e) => {
                  setFilterProvince(e.target.value);
                  setFilterCanton(''); // Reset canton when changing province
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {provinces.map((prov, idx) => (
                  <MenuItem key={idx} value={prov}>
                    {prov}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Canton</InputLabel>
              <Select
                value={filterCanton}
                label="Canton"
                onChange={(e) => setFilterCanton(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {cantons.map((can, idx) => (
                  <MenuItem key={idx} value={can}>
                    {can}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Taller selection based on the applied filters */}
          <Box sx={{ display: 'flex', gap: '20px' }}>
            <FormControl sx={{ minWidth: 320 }}>
              <InputLabel>Authorized Taller</InputLabel>
              <Select
                value={selectedTaller}
                label="Authorized Taller"
                onChange={(e) => setSelectedTaller(e.target.value)}
              >
                <MenuItem value="">
                  <em>-- Select Taller --</em>
                </MenuItem>
                {filteredTalleres.map((t, idx) => (
                  <MenuItem key={idx} value={t.codigo}>
                    {t.taller + ' (' + t.provincia + '-' + t.canton + ')'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={handleAssign}>
              Assign Taller
            </Button>
          </Box>
        </Box>

        {/* MUIDataTable */}
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            title="Responsables de Talleres"
            data={relationships.map((rel) => ({
              ...rel,
              taller: talleres.find((t) => t.codigo === rel.codigo_taller)?.taller || '',
              provincia: talleres.find((t) => t.codigo === rel.codigo_taller)?.provincia || '',
              canton: talleres.find((t) => t.codigo === rel.codigo_taller)?.canton || '',
            }))}
            columns={columns}
            options={options}
          />
        </ThemeProvider>

        {/* Edit Mode Section */}
        {editMode && relationshipToEdit && (
          <Box sx={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
            <h4>Editar Relación</h4>
            <p>
              <b>Empresa:</b> {relationshipToEdit.empresa} |{' '}
              <b>Taller:</b> {talleres.find((t) => t.codigo === relationshipToEdit.codigo_taller)?.taller || ''} |{' '}
              <b>Usuario:</b> {relationshipToEdit.usuario}
            </p>
            <FormControl sx={{ minWidth: 120, marginRight: '10px' }}>
              <InputLabel>Activo</InputLabel>
              <Select
                value={relationshipToEdit.activo}
                label="Activo"
                onChange={(e) =>
                  setRelationshipToEdit({ ...relationshipToEdit, activo: e.target.value })
                }
              >
                <MenuItem value={1}>Usuario Activo</MenuItem>
                <MenuItem value={0}>Desactivar Usuario</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleUpdate}
              sx={{ marginRight: '10px' }}
            >
              Guardar
            </Button>
            <Button variant="outlined" color="error" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
};
