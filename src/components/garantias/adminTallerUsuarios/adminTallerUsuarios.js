import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { toast } from 'react-toastify';

// Import your endpoints
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
import Navbar0 from '../../Navbar0';

export const AdminTallerUsuarios = () => {
  const { jwt, enterpriseShineray, userShineray} = useAuthContext();

  // Lists we will load
  const [talleres, setTalleres] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Currently selected user (from the ASTGAR role)
  const [selectedUser, setSelectedUser] = useState('');

  // Currently selected taller
  const [selectedTaller, setSelectedTaller] = useState('');

  // List of existing relationships
  const [relationships, setRelationships] = useState([]);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [relationshipToEdit, setRelationshipToEdit] = useState(null);
  //filters

  const [filterProvince, setFilterProvince] = useState("");
  const [filterCanton, setFilterCanton] = useState("");

  //  If you have a navbar
  const [menus, setMenus] = useState([]);

  // --------------------------------------------------------
  // 1) Load the list of active talleres
  // --------------------------------------------------------
  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        const resp = await getInfoActiveTalleres(jwt, 1, enterpriseShineray);
        setTalleres(resp);
        console.log('Talleres:', resp);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load talleres');
      }
    };
    fetchTalleres();
  }, [jwt, enterpriseShineray]);

  // --------------------------------------------------------
  // 2) Load the ASTGAR users
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // 3) Load existing relationships (filtered by enterprise)
  // --------------------------------------------------------
  useEffect(() => {
    refreshRelationships();
  }, [jwt, enterpriseShineray]);

  const refreshRelationships = async () => {
    try {
      const resp = await getTallerUsuarioRelations(jwt, enterpriseShineray);
      console.log('Relationships:', resp);
      setRelationships(resp);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load relationships');
    }
  };

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
      menu()
    }, [userShineray, enterpriseShineray, jwt])
  

  const getTallerProvincia = (codigoTaller) => {
    const found = talleres.find((t) => t.codigo === codigoTaller);
    return found ? found.provincia : '';
  };
  
  const getTallerCanton = (codigoTaller) => {
    const found = talleres.find((t) => t.codigo === codigoTaller);
    return found ? found.canton : '';
  };

  // --------------------------------------------------------
  // Helper: Return the name/description of a taller given its code
  // --------------------------------------------------------
  const getTallerName = (codigoTaller) => {
    const found = talleres.find((t) => t.codigo === codigoTaller);
    if (found) {
      // Return whichever field corresponds to the "name" you want to display
      return found.taller || found.descripcion || found.codigo;
    }
    // If not found, fall back to the code itself
    return codigoTaller;
  };

  // --------------------------------------------------------
  // Create (assign) a new relationship
  // --------------------------------------------------------
  const handleAssign = async () => {
    if (!selectedUser || !selectedTaller) {
      toast.error('Please select both a user and a taller');
      return;
    }

    const newRelation = {
      empresa: enterpriseShineray,
      codigo_taller: selectedTaller,
      cod_rol: 'ASTGAR', // assumed
      usuario: selectedUser,
      activo: 1,
      adicionado_por:userShineray
    };

    try {
      await postAssignTallerUsuario(jwt, newRelation);
      toast.success('Taller assigned successfully');
      // refresh list
      await refreshRelationships();
      // reset selection
      setSelectedUser('');
      setSelectedTaller('');
    } catch (error) {
      console.error(error);
      toast.error('Error assigning taller');
    }
  };

  // --------------------------------------------------------
  // Edit relationship
  // --------------------------------------------------------
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
      // We only update fields that matter. For example, `activo`.
      const dataToUpdate = {
        empresa: relationshipToEdit.empresa,
        codigo_taller: relationshipToEdit.codigo_taller,
        cod_rol: relationshipToEdit.cod_rol,
        usuario: relationshipToEdit.usuario,
        activo: relationshipToEdit.activo,
        modificado_por: userShineray // example
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

  // --------------------------------------------------------
  // Delete relationship
  // --------------------------------------------------------
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

  // Optional: load menu, if you have getMenus or similar
  // useEffect(() => {
  //   ...
  // }, []);



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
    (filterProvince === "" || t.provincia === filterProvince) &&
    (filterCanton === "" || t.canton === filterCanton)
);


  
  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
      <Navbar0 menus={menus}  />
      <Box sx={{ margin: '50px' }}>
        <h2>Admin - Talleres & Usuarios (ASTGAR)</h2>

        {/* SELECT USER */}
        <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px'}}>
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

        {/* SELECT TALLER */}
{/* Box for selecting taller with filters */}
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
            {t.taller + " (" + t.provincia + "-" + t.canton + ")"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <Button variant="contained" onClick={handleAssign}>
      Assign Taller
    </Button>
  </Box>
</Box>

        {/* TABLE OF EXISTING RELATIONSHIPS */}
        <Box>
  <h3>Responsables de Talleres</h3>
  {relationships.length === 0 ? (
    <p>No hay relaciones registradas o no se encontró información</p>
  ) : (
    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Codigo</th>
          <th>Taller</th>
          <th>Provincia</th>
          <th>Cantón</th>
          <th>Usuario</th>
          <th>Rol</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {relationships.map((rel, idx) => (
          <tr key={idx}>
            <td>{rel.codigo_taller}</td>
            <td>{getTallerName(rel.codigo_taller)}</td>
            <td>{getTallerProvincia(rel.codigo_taller)}</td>
            <td>{getTallerCanton(rel.codigo_taller)}</td>
            <td>{rel.usuario}</td>
            <td>{rel.cod_rol}</td>
            <td style={{ textAlign: 'center' }}>{rel.activo}</td>
            <td>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleEdit(rel)}
                sx={{ marginRight: '5px' }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDelete(rel)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</Box>

        {/* EDIT MODE SECTION */}
        {editMode && relationshipToEdit && (
          <Box sx={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
            <h4>Editar Relación</h4>
            <p>
              <b>Empresa:</b> {relationshipToEdit.empresa} |{' '}
              <b>Taller:</b> {getTallerName(relationshipToEdit.codigo_taller)} |{' '}
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
                <MenuItem value={1}> Usuario Activo</MenuItem>
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
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
};
