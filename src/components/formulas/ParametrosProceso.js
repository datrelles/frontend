import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { FormControlLabel, Checkbox, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import { useAuthContext } from "../../context/authContext";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import API from "../../services/modulo-formulas";
import { formatearEstado, formatearFecha } from "../../helpers/modulo-formulas";
import Header from "./common/Header";
import BtnNuevo from "./common/BtnNuevo";
import Tabla from "./common/Tabla";
import CustomDialog from "./common/CustomDialog";

export default function ParametrosProceso() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [procesos, setProcesos] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [parametrosDetail, setParametrosDetail] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codProceso, setCodProceso] = useState("");
  const [codParametro, setCodParametro] = useState("");
  const [nombreParametro, setNombreParametro] = useState("");
  const [descripcionParametro, setDescripcionParametro] = useState("");
  const [ordenParametro, setOrdenParametro] = useState(0);
  const [estadoParametro, setEstadoParametro] = useState(false);

  const navigate = useNavigate();

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProcesos = async () => {
    try {
      setProcesos(await APIService.getProcesos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getParametros = async () => {
    try {
      setParametros(await APIService.getParametros());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = (rowData, rowMeta) => {
    const codParametro = rowData[0];
    const orden_imprime = parseInt(
      window.prompt(
        `Ingresa el orden de impresión para el parámetro ${codParametro}:`
      )
    );
    if (isNaN(orden_imprime)) {
      toast.error("Orden de impresión inválido");
      return;
    }
    APIService.addParametroPorProceso(codProceso, codParametro, {
      orden_imprime,
    })
      .then((res) => {
        toast.success(res);
        setOpenAdd(false);
        setCodParametro(codParametro);
      })
      .catch((err) => toast.error(err.message));
  };

  const getParametrosDetail = async () => {
    try {
      setParametrosDetail(
        (await APIService.getParametrosPorProceso(codProceso)).map(
          ({ parametro, ...rest }) => ({
            ...rest,
            nombre: parametro.nombre,
            descripcion: parametro.descripcion,
          })
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = () => {
    APIService.updateParametroPorProceso(codProceso, codParametro, {
      orden_imprime: ordenParametro,
      estado: estadoParametro,
    })
      .then((res) => {
        toast.success(res);
        setCodParametro("");
        setOpenUpdate(false);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (selectedRows, setSelectedRows) => {
    if (!window.confirm("¿Estás seguro de eliminar el parámetro?")) {
      return false;
    }
    const { data: deletedData } = selectedRows;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = parametrosDetail[deletedRowIndex];
    setCodParametro(deletedRowValue.cod_parametro);
    const newParametros = parametrosDetail.filter(
      (_, index) => index !== deletedRowIndex
    );
    setParametrosDetail(newParametros);
    APIService.deleteParametroPorProceso(
      codProceso,
      deletedRowValue.cod_parametro
    )
      .then((res) => {
        toast.success(res);
        setSelectedRows([]);
      })
      .catch((err) => {
        toast.error(err.message);
        setCodParametro("");
      });
    return true;
  };

  const handleClickMaster = (rowData, rowMeta) => {
    setCodProceso(rowData[0]);
  };

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleClickCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleClickOpenUpdate = (rowData) => {
    setCodParametro(rowData[0]);
    setNombreParametro(rowData[1]);
    setDescripcionParametro(rowData[2] || "N/A");
    setOrdenParametro(rowData[3]);
    setEstadoParametro(rowData[4] === "Activo");
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleCustomAction = (selectedRows, displayData) => {
    const indiceSeleccionado = selectedRows.data[0].index;
    const codParametro = displayData[indiceSeleccionado].data[0];
    navigate(
      `/factores-calculo?proceso=${codProceso}&parametro=${codParametro}`
    );
  };

  const CustomSelectToolbar = (selectedRows, displayData, setSelectedRows) => {
    return (
      <>
        <Tooltip title="Factores de cálculo">
          <IconButton
            onClick={() => handleCustomAction(selectedRows, displayData)}
          >
            <CalculateIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            onClick={() => handleDelete(selectedRows, setSelectedRows)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  const columnsMaster = [
    {
      name: "cod_proceso",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
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

  const optionsMaster = {
    responsive: "standard",
    selectableRows: "none",
    onRowClick: handleClickMaster,
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
    },
  };

  const columnsDetail = [
    {
      name: "cod_parametro",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "descripcion",
      label: "Descripción",
    },
    {
      name: "orden_imprime",
      label: "Orden",
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value),
      },
    },
  ];

  const optionsDetail = {
    responsive: "standard",
    selectableRows: "single",
    onRowClick: handleClickOpenUpdate,
    customToolbarSelect: CustomSelectToolbar,
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
      },
    },
  };

  const columnsParametros = [
    {
      name: "cod_parametro",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "descripcion",
      label: "Descripción",
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value),
      },
    },
  ];

  const optionsParametros = {
    responsive: "standard",
    selectableRows: "none",
    onRowClick: handleAdd,
    filter: false,
    pagination: false,
    download: false,
    print: false,
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: (column) => `Ordenar por ${column.label}`,
      },
      toolbar: {
        search: "Buscar",
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
    },
  };

  const addContent = (
    <Tabla
      title="Parámetros"
      data={parametros.filter(
        (p) =>
          !parametrosDetail.some((pd) => pd.cod_parametro === p.cod_parametro)
      )}
      columns={columnsParametros}
      options={optionsParametros}
    />
  );

  const updateContent = (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            disabled
            margin="dense"
            id="cod_parametro"
            label="Código"
            type="text"
            fullWidth
            value={codParametro}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            disabled
            margin="dense"
            id="nombre"
            label="Nombre"
            type="text"
            fullWidth
            value={nombreParametro}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled
            margin="dense"
            id="descripcion"
            label="Descripción"
            type="text"
            fullWidth
            value={descripcionParametro}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            id="orden"
            label="Orden"
            type="number"
            fullWidth
            value={ordenParametro}
            onChange={(e) => setOrdenParametro(e.target.value)}
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
              checked={estadoParametro}
              onChange={(e) => setEstadoParametro(e.target.checked)}
            />
          }
          label="Activo"
        />
      </div>
    </>
  );

  useEffect(() => {
    document.title = "Parametros por Proceso";
    getProcesos();
    getParametros();
    getMenus();
  }, []);

  useEffect(() => {
    if (codProceso) {
      getParametrosDetail();
    }
  }, [codProceso, codParametro]);

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
      <BtnNuevo
        onClick={handleClickOpenAdd}
        disabled={!codProceso}
        texto={`Agregar parámetro a ${codProceso}`}
      />
      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Tabla
            title="Procesos"
            data={procesos}
            columns={columnsMaster}
            options={optionsMaster}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Tabla
            title={`Parámetros del Proceso ${codProceso ?? ""}`}
            data={parametrosDetail}
            columns={columnsDetail}
            options={optionsDetail}
          />
        </Box>
      </Box>
      <CustomDialog
        titulo="Agregar Parámetro"
        contenido={addContent}
        open={openAdd}
        handleClose={handleClickCloseAdd}
        handleCancel={handleClickCloseAdd}
        handleConfirm={handleAdd}
      />
      <CustomDialog
        titulo={`Modificar Parámetro ${codParametro} Del Proceso ${codProceso}`}
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
