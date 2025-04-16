import Navbar0 from "../Navbar0";
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { FormControlLabel, Checkbox } from '@mui/material';
import { useAuthContext } from "../../context/authContext";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import API from "../../services/modulo-formulas";
import { createMuiTheme, formatearEstado, formatearFecha } from "../../helpers/modulo-formulas";

function Procesos() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const APIService = new API(jwt, userShineray, enterpriseShineray, systemShineray);
  const [procesos, setProcesos] = useState([])
  const [menus, setMenus] = useState([])
  const [openNew, setOpenNew] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codProceso, setCodProceso] = useState('');
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState(true);

  const navigate = useNavigate();

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.addProceso({
      cod_proceso: codProceso,
      nombre
    })
      .then(res => {
        toast.success(res.mensaje);
        setOpenNew(false);
        setCodProceso('');
        setNombre('');
        setEstado(true);
      })
      .catch(err => toast.error(err.message));
  };

  const getProcesos = async () => {
    try {
      setProcesos(await APIService.getProcesos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateProceso(codProceso, {
      nombre,
      estado
    })
      .then(res => {
        toast.success(res.mensaje);
        setOpenUpdate(false);
        setCodProceso('');
        setNombre('');
        setEstado(true);
      })
      .catch(err => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm('¿Estás seguro de eliminar el proceso?')) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = procesos[deletedRowIndex];
    const newProcesos = procesos.filter((proceso, index) => index !== deletedRowIndex);
    setProcesos(newProcesos);
    APIService.deleteProceso(deletedRowValue.cod_proceso)
      .then(res => toast.success(res.mensaje))
      .catch(err => {
        toast.error(err.message);
        getProcesos();
      });
    return true;
  };

  const handleClickOpenNew = () => {
    setOpenNew(true);
    setCodProceso('');
    setNombre('');
    setEstado(true);
  };

  const handleClickCloseNew = () => {
    setOpenNew(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleRowClick = (rowData, rowMeta) => {
    const row = procesos.filter(item => item.cod_proceso === rowData[0])[0];
    setCodProceso(row.cod_proceso);
    setNombre(row.nombre);
    setEstado(row.estado === 1);
    handleClickOpenUpdate();
  };

  const columns = [
    {
      name: "cod_proceso",
      label: "Código"
    },
    {
      name: "nombre",
      label: "Nombre"
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: {
        customBodyRender: (value) => formatearFecha(value),
      },
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value),
      },
    },
  ];

  const options = {
    responsive: 'standard',
    selectableRows: 'single',
    onRowClick: handleRowClick,
    onRowsDelete: handleDelete,
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
  };

  useEffect(() => {
    document.title = 'Procesos';
    getProcesos();
    getMenus();
  }, [openNew, openUpdate]);

  return (
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
      <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
        <button
          className="btn btn-primary btn-block"
          type="button"
          style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
          onClick={handleClickOpenNew}>
          <AddIcon /> Nuevo
        </button>
      </div>
      <ThemeProvider theme={createMuiTheme()}>
        <MUIDataTable
          title={"Procesos"}
          data={procesos}
          columns={columns}
          options={options}
        />
      </ThemeProvider>
      <Dialog open={openNew} onClose={handleClickCloseNew}>
        <DialogTitle>Registrar Proceso</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="cod_proceso"
                label="Código"
                type="text"
                placeholder="PROCE###"
                fullWidth
                value={codProceso}
                onChange={(e => setCodProceso(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="nombre"
                label="Nombre"
                type="text"
                fullWidth
                value={nombre}
                onChange={(e => setNombre(e.target.value))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCloseNew} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCreate} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openUpdate} onClose={handleClickCloseUpdate}>
        <DialogTitle>Actualizar Proceso</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                disabled
                margin="dense"
                id="cod_proceso"
                label="Código"
                type="text"
                placeholder="COD###"
                fullWidth
                value={codProceso}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="nombre"
                label="Nombre"
                type="text"
                fullWidth
                value={nombre}
                onChange={(e => setNombre(e.target.value))}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
            <FormControlLabel control={
              <Checkbox
                label="Estado"
                checked={estado}
                onChange={(e) => {
                  setEstado(e.target.checked)
                }}
              />
            }
              label="Activo"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCloseUpdate} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpdate} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Procesos;