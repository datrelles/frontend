import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import {
  FormControlLabel,
  Checkbox,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { useAuthContext } from "../../context/authContext";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import API from "../../services/modulo-formulas";
import { formatearEstado, formatearFecha } from "../../helpers/modulo-formulas";
import Header from "./common/Header";
import Tabla from "./common/Tabla";
import BtnNuevo from "./common/BtnNuevo";
import CustomDialog from "./common/CustomDialog";

const tipos_retorno = ["NUMBER", "VARCHAR2"];

export default function Funciones() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [menus, setMenus] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFuncion, setCodFuncion] = useState("");
  const [codModulo, setCodModulo] = useState("");
  const [nombre, setNombre] = useState("");
  const [nombreBD, setNombreBD] = useState("");
  const [estado, setEstado] = useState(true);
  const [observaciones, setObservaciones] = useState("");
  const [retorno, setRetorno] = useState("Seleccione");

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getModulos = async () => {
    try {
      setModulos(await APIService.getModulos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createFuncion({
      empresa: enterpriseShineray,
      cod_funcion: codFuncion,
      cod_modulo: codModulo,
      nombre,
      nombre_base_datos: nombreBD,
      observaciones,
      tipo_retorno: retorno,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodFuncion("");
        setCodModulo("");
        setNombre("");
        setNombreBD("");
        setEstado(true);
        setObservaciones("");
        setRetorno("Seleccione");
      })
      .catch((err) => toast.error(err.message));
  };

  const getFunciones = async () => {
    try {
      setFunciones(await APIService.getFunciones());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateFuncion(codModulo, codFuncion, {
      nombre,
      nombre_base_datos: nombreBD,
      estado,
      observaciones: observaciones,
      tipo_retorno: retorno,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdate(false);
        setCodFuncion("");
        setCodModulo("");
        setNombre("");
        setNombreBD("");
        setEstado(true);
        setObservaciones("");
        setRetorno("");
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar la función?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = funciones[deletedRowIndex];
    const newFunciones = funciones.filter(
      (_, index) => index !== deletedRowIndex
    );
    setFunciones(newFunciones);
    APIService.deleteFuncion(codModulo, deletedRowValue.cod_funcion)
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getFunciones();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    const row = funciones.filter((item) => item.cod_formula === rowData[0])[0];
    setCodFuncion(row.cod_funcion);
    setCodModulo(row.cod_modulo);
    setNombre(row.nombre);
    setNombreBD(row.nombre_base_datos);
    setEstado(row.estado === 1);
    setObservaciones(row.observaciones ?? "");
    setRetorno(row.tipo_retorno);
    handleClickOpenUpdate();
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodFuncion("");
    setCodModulo("");
    setNombre("");
    setNombreBD("");
    setEstado(true);
    setObservaciones("");
    setRetorno("Seleccione");
  };

  const handleClickCloseCreate = () => {
    setOpenCreate(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const columns = [
    {
      name: "cod_modulo",
      options: {
        display: "excluded",
      },
    },
    {
      name: "cod_funcion",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "nombre_base_datos",
      label: "Nombre BD",
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value),
      },
    },
    {
      name: "observaciones",
      label: "Observaciones",
    },
    {
      name: "tipo_retorno",
      label: "Retorno",
    },
    {
      name: "tipo_objeto",
      label: "Tipo",
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
    responsive: "standard",
    selectableRows: "single",
    onRowClick: handleRowClick,
    onRowsDelete: handleDelete,
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: (column) => `Ordenar por ${column.label}`,
      },
      pagination: {
        next: "Siguiente",
        previous: "Anterior",
        rowsPerPage: "Filas por página:",
        displayRows: "de",
      },
      toolbar: {
        search: "Buscar",
        downloadCsv: "Descargar CSV",
        print: "Imprimir",
        viewColumns: "Ver columnas",
        filterTable: "Filtrar tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "REINICIAR",
      },
      viewColumns: {
        title: "Mostrar columnas",
        titleAria: "Mostrar/Ocultar columnas de tabla",
      },
      selectedRows: {
        text: "fila(s) seleccionada(s)",
        delete: "Borrar",
        deleteAria: "Borrar fila seleccionada",
      },
    },
  };

  const createContent = (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Autocomplete
          id="Módulo"
          options={modulos.map((m) => m.sistema)}
          onChange={(e, value) => {
            if (value) {
              const modulo = modulos.find((m) => m.sistema === value);
              setCodModulo(modulo.cod_sistema);
            } else {
              setCodModulo("");
            }
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              required
              label="Módulo"
              type="text"
              value={codModulo}
              className="form-control"
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          required
          margin="dense"
          id="cod_funcion"
          label="Código"
          type="text"
          placeholder="FUNC###"
          fullWidth
          value={codFuncion}
          onChange={(e) => setCodFuncion(e.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          required
          select
          label="Tipo retorno"
          fullWidth
          margin="dense"
          value={retorno}
          onChange={(e) => setRetorno(e.target.value)}
        >
          <MenuItem value="Seleccione">Seleccione</MenuItem>
          {tipos_retorno.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={6}>
        <TextField
          required
          margin="dense"
          id="nombre"
          label="Nombre"
          type="text"
          fullWidth
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          required
          margin="dense"
          id="nombre_base_datos"
          label="Nombre base de datos"
          type="text"
          fullWidth
          value={nombreBD}
          onChange={(e) => setNombreBD(e.target.value)}
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
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const updateContent = (
    <>
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
            value={codFuncion}
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
            onChange={(e) => setNombre(e.target.value)}
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
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Grid>
      </Grid>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              label="Estado"
              checked={estado}
              onChange={(e) => {
                setEstado(e.target.checked);
              }}
            />
          }
          label="Activo"
        />
      </div>
    </>
  );

  useEffect(() => {
    document.title = "Funciones";
    getMenus();
    getModulos();
    getFunciones();
  }, []);

  useEffect(() => {
    getFunciones();
  }, [openCreate, openUpdate]);

  return (
    <div
      style={{
        marginTop: "150px",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <Header menus={menus} />
      <BtnNuevo onClick={handleClickOpenCreate} />
      <Tabla
        title="Funciones"
        data={funciones}
        columns={columns}
        options={options}
      />
      <CustomDialog
        titulo="Registrar Función"
        contenido={createContent}
        open={openCreate}
        handleClose={handleClickCloseCreate}
        handleCancel={handleClickCloseCreate}
        handleConfirm={handleCreate}
      />
      <CustomDialog
        titulo="Actualizar Función"
        contenido={updateContent}
        open={openUpdate}
        handleClose={handleClickCloseUpdate}
        handleCancel={handleClickCloseUpdate}
        handleConfirm={handleUpdate}
        confirmText="Actualizar"
      />
    </div>
  );
}
