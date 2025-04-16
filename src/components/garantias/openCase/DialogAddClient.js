import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import { saveNewDataClient } from '../../../services/api';

export const DialogAddClient = ({
  open,
  onClose,
  jwt,
  enterprise,
  onClientCreated, // callback que se llama cuando se crea exitosamente el cliente
  initialData = {} // Datos iniciales opcionales: { id, nombre, apellidos, direccion, celular }
}) => {
  // Estado local para el formulario
  const [formData, setFormData] = useState({
    id: '',
    type_id: 1,
    type_client: 'CF',
    nombre: '',
    apellidos: '',
    direccion: '',
    celular: '',
    empresa: enterprise // se asume que viene por props
  });

  // Efecto para cargar datos iniciales si están disponibles
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData // Sobrescribe los valores con los datos iniciales proporcionados
      }));
    }
  }, [initialData]);

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Llamamos a la API
      const resp = await saveNewDataClient(jwt, formData);
      toast.success('Cliente creado exitosamente.');
      onClose();
      onClientCreated(formData.id); // Notificamos al padre que se creó el cliente con este ID
    } catch (err) {
      console.error(err);
      toast.error('Error al crear cliente.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Identificación"
          name="id"
          value={formData.id}
          onChange={handleChange}
          fullWidth
          margin="dense"
          disabled={!!initialData?.id} // Si ya hay un ID, no se puede editar
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Tipo ID</InputLabel>
          <Select
            label="Tipo ID"
            name="type_id"
            value={formData.type_id}
            onChange={handleChange}
          >
            <MenuItem value={1}>Cédula</MenuItem>
            <MenuItem value={2}>RUC / Pasaporte</MenuItem>
            <MenuItem value={3}>Pasaporte</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Celular"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
