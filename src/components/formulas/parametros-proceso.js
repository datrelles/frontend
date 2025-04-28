import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  formatearEstado,
  formatearFechaHora,
  formatearFechaInput,
} from "../../helpers/modulo-formulas";
import Header from "./common/header";
import BtnNuevo from "./common/btn-nuevo";
import Tabla from "./common/tabla";
import CustomDialog from "./common/custom-dialog";
import {
  createCustomComponentItem,
  createCustomTooltip,
  createDefaultSetter,
  createTextFieldItem,
} from "./common/form-generators";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import MainComponent from "./common/main-component";
import CustomSelectToolbar from "./common/custom-select-toolbar";
import AutocompleteObject from "./common/autocomplete-objects";
import BoxMasterDetail from "./common/box-master-detail";

const shapeFormula = {
  cod_formula: "",
  nombre: "Seleccione",
};

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
  const [openUpdateDatos, setOpenUpdateDatos] = useState(false);
  const [formulas, setFormulas] = useState("");
  const [formula, setFormula] = useState(shapeFormula);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
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

  const getFormulas = async () => {
    try {
      setFormulas(await APIService.getFormulas());
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

  const handleUpdateDatos = () => {
    APIService.updateParametroPorProceso(codProceso, codParametro, {
      orden_imprime: parametrosDetail.find(
        (p) => p.cod_parametro === codParametro
      ).orden_imprime,
      cod_formula: formula.cod_formula,
      fecha_calculo_inicio: fechaInicio,
      fecha_calculo_fin: fechaFin,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdateDatos(false);
        getParametrosDetail();
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

  const handleClickCloseUpdateDatos = () => {
    setOpenUpdateDatos(false);
  };

  const handleCustomAction = (selectedRows, displayData) => {
    const indiceSeleccionado = selectedRows.data[0].index;
    const codParametro = displayData[indiceSeleccionado].data[0];
    navigate(
      `/factores-calculo?proceso=${codProceso}&parametro=${codParametro}`
    );
  };

  const handleOpenUpdateDatos = (selectedRows, displayData) => {
    const indiceSeleccionado = selectedRows.data[0].index;
    const codParametro = displayData[indiceSeleccionado].data[0];
    const parametro = parametrosDetail.find(
      (p) => p.cod_parametro === codParametro
    );
    setCodParametro(codParametro);
    setFormula(
      formulas.find((f) => f.cod_formula === formula.cod_formula) ??
        shapeFormula
    );
    setFechaInicio(formatearFechaInput(parametro.fecha_calculo_inicio));
    setFechaFin(formatearFechaInput(parametro.fecha_calculo_fin));
    setOpenUpdateDatos(true);
  };

  const customSelectToolbar = (selectedRows, displayData, setSelectedRows) => {
    const tooltips = [
      createCustomTooltip(
        "Factores de cálculo",
        () => handleCustomAction(selectedRows, displayData),
        "calculate"
      ),
      createCustomTooltip(
        "Datos parámetro",
        () => handleOpenUpdateDatos(selectedRows, displayData),
        "edit"
      ),
      createCustomTooltip(
        "Eliminar",
        () => handleDelete(selectedRows, setSelectedRows),
        "delete"
      ),
    ];
    return <CustomSelectToolbar tooltips={tooltips} />;
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
        customBodyRender: (value) => formatearFechaHora(value),
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
    customToolbarSelect: customSelectToolbar,
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

  const checkboxEstado = (
    <Check
      label="Activo"
      checked={estadoParametro}
      setChecked={setEstadoParametro}
    />
  );

  const updateContentItems = [
    createTextFieldItem(6, "cod_parametro", "Código", codParametro),
    createTextFieldItem(6, "nombre", "Nombre", nombreParametro),
    createTextFieldItem(12, "descripcion", "Descripción", descripcionParametro),
    createTextFieldItem(
      12,
      "orden",
      "Orden",
      ordenParametro,
      createDefaultSetter(setOrdenParametro),
      undefined,
      undefined,
      undefined,
      "number"
    ),
    createCustomComponentItem(12, "checkboxEstado", checkboxEstado),
  ];

  const autocompleteFormulas = (
    <AutocompleteObject
      id="Fórmula"
      value={formula}
      valueId="cod_formula"
      shape={shapeFormula}
      options={formulas}
      optionLabel="nombre"
      onChange={(e, value) => {
        setFormula(value ?? shapeFormula);
      }}
    />
  );

  const updateDatosContentItems = [
    createCustomComponentItem(12, "formula", autocompleteFormulas),
    createTextFieldItem(
      6,
      "fecha_inicio",
      "Fecha inicio",
      fechaInicio,
      createDefaultSetter(setFechaInicio),
      false,
      undefined,
      undefined,
      "date"
    ),
    createTextFieldItem(
      6,
      "fecha_fin",
      "Fecha fin",
      fechaFin,
      createDefaultSetter(setFechaFin),
      false,
      undefined,
      undefined,
      "date"
    ),
  ];

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

  const updateContent = <CustomGrid items={updateContentItems} />;

  const updateDatosContent = <CustomGrid items={updateDatosContentItems} />;

  const header = <Header menus={menus} />;

  const btnNuevo = (
    <BtnNuevo
      onClick={handleClickOpenAdd}
      disabled={!codProceso}
      texto={`Agregar parámetro a ${codProceso}`}
    />
  );

  const boxMasterDetail = (
    <BoxMasterDetail
      master={
        <Tabla
          title="Procesos"
          data={procesos}
          columns={columnsMaster}
          options={optionsMaster}
        />
      }
      detail={
        <Tabla
          title={`Parámetros del Proceso ${codProceso ?? ""}`}
          data={parametrosDetail}
          columns={columnsDetail}
          options={optionsDetail}
        />
      }
    />
  );

  const addDialog = (
    <CustomDialog
      titulo="Agregar Parámetro"
      contenido={addContent}
      open={openAdd}
      handleClose={handleClickCloseAdd}
      handleCancel={handleClickCloseAdd}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo={`Modificar Parámetro ${codParametro} Del Proceso ${codProceso}`}
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
      handleConfirm={handleUpdate}
      confirmText="Actualizar"
    />
  );

  const updateDatosDialog = (
    <CustomDialog
      titulo={`Modificar Datos de Parámetro ${codParametro}`}
      contenido={updateDatosContent}
      open={openUpdateDatos}
      handleClose={handleClickCloseUpdateDatos}
      handleCancel={handleClickCloseUpdateDatos}
      handleConfirm={handleUpdateDatos}
      confirmText="Actualizar"
    />
  );

  useEffect(() => {
    document.title = "Parametros por Proceso";
    getMenus();
    getProcesos();
    getParametros();
    getFormulas();
  }, []);

  useEffect(() => {
    if (codProceso) {
      getParametrosDetail();
    }
  }, [codProceso, codParametro]);

  return (
    <MainComponent
      components={[
        header,
        btnNuevo,
        boxMasterDetail,
        addDialog,
        updateDialog,
        updateDatosDialog,
      ]}
    />
  );
}
