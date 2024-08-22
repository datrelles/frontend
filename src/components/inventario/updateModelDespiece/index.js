import Navbar0 from '../../Navbar0';
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableItem from './DraggableItem';
import DroppableArea from './DroppableArea';
import { getListModelMotorcycle, getMenus, getDespieceData, getModeloCrecimientoBI, postModeloCrecimientoBI } from '../../../services/api';
import LoadingCircle from '../../contabilidad/loadermd';
import { toast } from 'react-toastify';
import './ParametrizacionModelosDespiece.css'; // Importa el archivo CSS
import { useAuthContext } from '../../../context/authContext'

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';

export const ParametrizacionModelosDespiece = () => {
  const [droppedItems, setDroppedItems] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [despiece, setDespiece] = useState([]);
  const [crecimientoBI, setCrecimientoBI] = useState([]);
  const [ModelDespieceForUpdate, setModelDespieceForUpdate] = useState('');
  const [loadingDespiece, setLoadingDespiece] = useState(false);
  const [classificationFilter, setClassificationFilter] = useState('No Clasificado'); // Nuevo estado

  const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()

  //--------------Menu-------------------------------
  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'IN', jwt)
        setMenus(data)
      }
      catch (error) {
        console.log(error)
        toast.error(error)
      }
    }
    menu();
  }, [])

  // Load list of elementos

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
  }, []);

  useEffect(() => {
    const fetchDespieceData = async () => {
      try {
        setLoadingDespiece(true);
        const despieceData = await getDespieceData(jwt, enterpriseShineray);
        setDespiece(despieceData);
        setLoadingDespiece(false);
      } catch (error) {
        console.error('Error fetching despiece data:', error);
        toast.error('Error fetching despiece data');
        setLoadingDespiece(false);
      }
    };

    fetchDespieceData();
  }, []);

  useEffect(() => {
    const fetchModeloCrecimientoBI = async () => {
      try {

        setLoading(true);
        const modeloCrecimientoBI = await getModeloCrecimientoBI(jwt);
        setCrecimientoBI(modeloCrecimientoBI);
        setLoading(false);
        if (ModelDespieceForUpdate !== '') {
          // Filtrar y añadir los modelos automáticamente al área de drop basado en el despiece seleccionado
          const filteredModelsForDrop = crecimientoBI
            .filter(item => item.cod_despiece === ModelDespieceForUpdate)
            .map(item => item.cod_modelo)
            .filter(model => {
              const isInCrecimientoBI = crecimientoBI.some(item => item.cod_modelo === model);
              if (classificationFilter === 'Clasificado') {
                return isInCrecimientoBI;
              } else if (classificationFilter === 'No Clasificado') {
                return !isInCrecimientoBI;
              }
              return true;
            });
          setDroppedItems(filteredModelsForDrop);

        };

      } catch (error) {
        console.error('Error fetching modelo crecimiento BI data:', error);
        toast.error('Error fetching modelo crecimiento BI data');
        setLoading(false);
      }
    };

    fetchModeloCrecimientoBI();
  }, [ModelDespieceForUpdate, classificationFilter]);

  //----------------------setModelosDespiece------------------------

  const handleChange = (event) => {
    const selectedDespiece = event.target.value;
    setModelDespieceForUpdate(selectedDespiece);

    // Filtrar y añadir los modelos automáticamente al área de drop basado en el despiece seleccionado
    const filteredModelsForDrop = crecimientoBI
      .filter(item => item.cod_despiece === selectedDespiece)
      .map(item => item.cod_modelo)
      .filter(model => {
        const isInCrecimientoBI = crecimientoBI.some(item => item.cod_modelo === model);
        if (classificationFilter === 'Clasificado') {
          return isInCrecimientoBI;
        } else if (classificationFilter === 'No Clasificado') {
          return !isInCrecimientoBI;
        }
        return true;
      });

    setDroppedItems(filteredModelsForDrop);
  };

  const handleDrop = (item) => {
    setDroppedItems(prevItems => [...prevItems, item.id]);
  };

  const renderModelo = (cod_producto) => {
    const producto = models.find(item => item.cod_producto === cod_producto);
    return producto ? producto.modelo : 'Modelo no encontrado';
  };

  const handleSave = async () => {
    setLoading(true); // Mostrar el círculo de carga
    let allSaved = true;
    const currentYear = new Date().getFullYear(); // Obtiene el año actual

    for (const item of droppedItems) {
      const data = {
        empresa: enterpriseShineray,
        cod_modelo: item, // Aquí pasas el cod_modelo desde droppedItems
        cod_despiece: ModelDespieceForUpdate, // Aquí pasas el cod_despiece desde el selector
        periodo: currentYear.toString(), // Asigna el año actual al periodo
      };

      try {
        const response = await postModeloCrecimientoBI(jwt, data);

        if (response.status !== "ok") {
          allSaved = false;
          toast.error(`Error al guardar el modelo con código: ${item}`);
        }
      } catch (error) {
        console.error(`Error al guardar el modelo con código: ${item}`, error);
        toast.error(`Error al guardar el modelo con código: ${item}`);
        allSaved = false;
      }
    }

    if (allSaved) {
      toast.success('Todos los modelos de crecimiento BI se guardaron exitosamente');
    } else {
      toast.error('Hubo errores al guardar algunos modelos');
    }

    // Reiniciar los elementos después del guardado
    setDroppedItems([]);
    setModelDespieceForUpdate('');
    setLoading(false); // Ocultar el círculo de carga
  };

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <Navbar0 menus={menus} />
      <div>
        <div className="parametrizacion-container">
          <div className='container-selector-model-despiece'>
            <Box sx={{ minWidth: 180 }}>
              <FormControl fullWidth>
                <InputLabel id="classification-select-label" sx={{ fontSize: '12px' }}>
                  Clasificación
                </InputLabel>
                <Select
                  labelId="classification-select-label"
                  id="classification-select"
                  value={classificationFilter}
                  label="Clasificación"
                  onChange={(event) => setClassificationFilter(event.target.value)}
                >
                  <MenuItem sx={{ fontSize: '12px' }} value="Clasificado">

                    Clasificado
                  </MenuItem>
                  <MenuItem sx={{ fontSize: '12px' }} value="No Clasificado">
                    No Clasificado
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className='container-selector-clasification-despiece'>
            <Box sx={{ minWidth: 180 }}>
              {loadingDespiece ? (
                <LoadingCircle />
              ) : despiece.length !== 0 ? (
                <FormControl fullWidth>
                  <InputLabel id="despiece-select-label" sx={{ fontSize: '12px' }}>
                    M. Despiece
                  </InputLabel>
                  <Select
                    labelId="despiece-select-label"
                    id="despiece-select"
                    value={ModelDespieceForUpdate}
                    label="Modelos"
                    onChange={handleChange}
                  >
                    {despiece.map((item) => (
                      <MenuItem sx={{ fontSize: '12px' }} key={item.nombre_i} value={item.cod_despiece}>
                        {item.nombre_i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
            </Box>
          </div>
          <div className='container-button-save-mode-relation-despiece'>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={droppedItems.length === 0 || !ModelDespieceForUpdate}
              style={{ marginTop: '300px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px' }}
            >
              Guardar
            </Button>
          </div>
          <DndProvider backend={HTML5Backend}>
            <div className="draggable-list">
              <Typography>
                MODELO MOTO
              </Typography>
              {loading ? (
                <LoadingCircle />
              ) : (
                models
                  .filter(model => {
                    const isInCrecimientoBI = crecimientoBI.some(item => item.cod_modelo === model.cod_producto);
                    if (classificationFilter === 'Clasificado') {
                      return isInCrecimientoBI;
                    } else if (classificationFilter === 'No Clasificado') {
                      return !isInCrecimientoBI;
                    }
                    return true;
                  })
                  .map((model, index) => (
                    !droppedItems.includes(model.cod_producto) && (
                      <DraggableItem key={index} id={model.cod_producto}>
                        <div className="draggable-item">{model.modelo}</div>
                      </DraggableItem>
                    )
                  ))
              )}
            </div>
            <DroppableArea onDrop={(item) => handleDrop(item)} areaName="Drop Area">
              <div className="droppable-content">
                <Typography>
                 COD DESPIECE: {ModelDespieceForUpdate}
                </Typography>
                {droppedItems.map(id => (
                  <div key={id} className="droppable-item">Moto: {renderModelo(id)}</div>
                ))}
              </div>
            </DroppableArea>
          </DndProvider>
        </div>
      </div>
    </div>
  );
};
