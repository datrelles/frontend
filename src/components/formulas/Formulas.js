import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from '@mui/material/styles';
import AddIcon from '@material-ui/icons/Add';
import Button from '@mui/material/Button';
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
import Header from './common/header';

function Formulas() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();
  const APIService = new API(jwt, userShineray, enterpriseShineray, systemShineray);
  const [formulas, setFormulas] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openNew, setOpenNew] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFormula, setCodFormula] = useState('');
  const [nombre, setNombre] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState(true);
  const [definicion, setDefinicion] = useState('');

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.addFormula({
      empresa: enterpriseShineray,
      cod_formula: codFormula,
      nombre,
      observaciones,
      definicion
    })
      .then(res => {
        toast.success(res);
        setOpenNew(false);
        setCodFormula('');
        setNombre('');
        setObservaciones('');
        setEstado(true);
        setDefinicion('');
      })
      .catch(err => toast.error(err.mensaje));
  };

  const getFormulas = async () => {
    try {
      setFormulas(await APIService.getFormulas());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateFormula(codFormula, {
      nombre,
      estado,
      observaciones: observaciones,
      definicion
    })
      .then(res => {
        toast.success(res);
        setOpenUpdate(false);
        setCodFormula('');
        setNombre('');
        setObservaciones('');
        setEstado(true);
        setDefinicion('');
      })
      .catch(err => toast.error(err.mensaje));
  };

  const handleDelete = rowsDeleted => {
    if (!window.confirm('¿Estás seguro de eliminar la fórmula?')) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = formulas[deletedRowIndex];
    const newFormulas = formulas.filter((_, index) => index !== deletedRowIndex);
    setFormulas(newFormulas);
    APIService.deleteFormula(deletedRowValue.cod_formula)
      .then(res => toast.success(res))
      .catch(err => {
        toast.error(err.message);
        getFormulas();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    const row = formulas.filter(item => item.cod_formula === rowData[0])[0];
    setCodFormula(row.cod_formula);
    setNombre(row.nombre);
    setEstado(row.estado === 1);
    setDefinicion(row.definicion);
    setObservaciones(row.observaciones ?? '');
    handleClickOpenUpdate();
  };

  const handleClickOpenNew = () => {
    setOpenNew(true);
    setCodFormula('');
    setNombre('');
    setObservaciones('');
    setEstado(true);
    setDefinicion('');
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

  const columns = [
    {
      name: "cod_formula",
      label: "Código"
    },
    {
      name: "nombre",
      label: "Nombre"
    },
    {
      name: "definicion",
      label: "Definición"
    },
    {
      name: "observaciones",
      label: "Observaciones"
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value, 'a'),
      },
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: {
        customBodyRender: (value) => formatearFecha(value),
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
    document.title = 'Fórmulas';
    getFormulas();
    getMenus();
  }, [openNew, openUpdate]);

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <Header menus={menus} />
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
          title={"Fórmulas"}
          data={formulas}
          columns={columns}
          options={options}
        />
      </ThemeProvider>
      <Dialog open={openNew} onClose={handleClickCloseNew}>
        <DialogTitle>Registrar Fórmula</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="cod_formula"
                label="Código"
                type="text"
                placeholder="FORMU###"
                fullWidth
                value={codFormula}
                onChange={(e => setCodFormula(e.target.value))}
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
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="observaciones"
                label="Observaciones"
                type="text"
                fullWidth
                value={observaciones}
                onChange={(e => setObservaciones(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="definicion"
                label="Definición"
                type="text"
                fullWidth
                value={definicion}
                onChange={(e => setDefinicion(e.target.value))}
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
        <DialogTitle>Actualizar Fórmula</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                disabled
                margin="dense"
                id="cod_formula"
                label="Código"
                type="text"
                placeholder="FORMU###"
                fullWidth
                value={codFormula}
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
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="observaciones"
                label="Observaciones"
                type="text"
                fullWidth
                value={observaciones}
                onChange={(e => setObservaciones(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="definicion"
                label="Definición"
                type="text"
                fullWidth
                value={definicion}
                onChange={(e => setDefinicion(e.target.value))}
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

export default Formulas;