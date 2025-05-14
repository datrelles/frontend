import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  formatearEstado,
  formatearFechaHora,
} from "../../helpers/modulo-formulas";
import Header from "./common/header";
import Tabla from "./common/tabla";
import BtnNuevo from "./common/btn-nuevo";
import CustomDialog from "./common/custom-dialog";
import AutocompleteObject from "./common/autocomplete-objects";
import CustomSelect from "./common/custom-select";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createTableOptions,
  createTextFieldItem,
} from "./common/generators";
import MainComponent from "./common/main-component";
import {
  DefaultTipoParametro,
  DefaultTipoRetorno,
  TiposParametro,
  TiposRetorno,
} from "./common/enum";
import BoxCenter from "./common/box-center";
import CustomTooltip from "./common/custom-tooltip";

const shapeModulo = {
  cod_sistema: "",
  sistema: "Seleccione",
};

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
  const [parametros, setParametros] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFuncion, setCodFuncion] = useState("");
  const [modulo, setModulo] = useState(shapeModulo);
  const [nombre, setNombre] = useState("");
  const [nombreBD, setNombreBD] = useState("");
  const [estado, setEstado] = useState(true);
  const [observaciones, setObservaciones] = useState("");
  const [retorno, setRetorno] = useState(DefaultTipoRetorno);
  const [tipoParametro, setTipoParametro] = useState(DefaultTipoParametro);
  const [secuencia, setSecuencia] = useState(1);
  const [variable, setVariable] = useState("");
  const [fijoCaracter, setFijoCaracter] = useState("");
  const [fijoNumero, setFijoNumero] = useState("");
  const [openCreateParametro, setOpenCreateParametro] = useState(false);
  const [openUpdateParametro, setOpenUpdateParametro] = useState(false);
  const [nombreBDActualizado, setNombreBDActualizado] = useState(false);

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

  const getFunciones = async () => {
    try {
      setFunciones(await APIService.getFunciones());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getParametros = async (funcion = codFuncion) => {
    try {
      setParametros(await APIService.getParametrosFuncion(funcion));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createFuncion({
      empresa: enterpriseShineray,
      cod_funcion: codFuncion,
      cod_modulo: modulo.cod_sistema,
      nombre,
      nombre_base_datos: nombreBD,
      observaciones,
      tipo_retorno: retorno,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodFuncion("");
        setModulo(shapeModulo);
        setNombre("");
        setNombreBD("");
        setEstado(true);
        setObservaciones("");
        setRetorno(DefaultTipoRetorno);
        setParametros([]);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleCreateParametro = (e) => {
    e.preventDefault();
    APIService.createParametroFuncion(codFuncion, {
      secuencia: parametros.length + 1,
      tipo_parametro: tipoParametro,
      variable,
      fijo_caracter: fijoCaracter,
      fijo_numero: fijoNumero,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreateParametro(false);
        getParametros();
        setTipoParametro(DefaultTipoParametro);
        setVariable("");
        setFijoCaracter("");
        setFijoNumero("");
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateFuncion(codFuncion, {
      cod_modulo: modulo.cod_sistema,
      nombre,
      nombre_base_datos: nombreBD,
      estado,
      observaciones: observaciones,
      tipo_retorno: retorno,
    })
      .then((res) => {
        setNombreBDActualizado(true);
        toast.success(res);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdateParametro = (e) => {
    e.preventDefault();
    APIService.updateParametroFuncion(codFuncion, secuencia, {
      tipo_parametro: tipoParametro,
      variable,
      fijo_caracter: fijoCaracter,
      fijo_numero: fijoNumero,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdateParametro(false);
        getParametros(codFuncion);
        setTipoParametro(DefaultTipoParametro);
        setVariable("");
        setFijoCaracter("");
        setFijoNumero("");
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
    APIService.deleteFuncion(deletedRowValue.cod_funcion)
      .then((res) => {
        toast.success(res);
        setCodFuncion("");
      })
      .catch((err) => {
        toast.error(err.message);
        getFunciones();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    setNombreBDActualizado(true);
    const row = funciones.find((item) => item.cod_funcion === rowData[1]);
    setCodFuncion(row.cod_funcion);
    setModulo(modulos.find((m) => m.cod_sistema === row.cod_modulo));
    setNombre(row.nombre);
    setNombreBD(row.nombre_base_datos);
    setEstado(row.estado === 1);
    setObservaciones(row.observaciones ?? "");
    setRetorno(row.tipo_retorno);
    handleClickOpenUpdate();
  };

  const handleRowSelectionChange = (
    currentRowsSelected,
    allRowsSelected,
    rowsSelected
  ) => {
    if (rowsSelected.length === 0) {
      setParametros([]);
      setCodFuncion("");
      return;
    }
    const indiceSeleccionado = rowsSelected[0];
    const funcionSeleccionada = funciones[indiceSeleccionado];
    if (funcionSeleccionada) {
      setCodFuncion(funcionSeleccionada.cod_funcion);
      getParametros(funcionSeleccionada.cod_funcion);
    }
  };

  const handleRowClickParametro = (rowData, rowMeta) => {
    const row = parametros.find((item) => item.secuencia === rowData[1]);
    setSecuencia(row.secuencia);
    setTipoParametro(row.tipo_parametro);
    setVariable(row.variable ?? "");
    setFijoCaracter(row.fijo_caracter ?? "");
    setFijoNumero(row.fijo_numero ?? "");
    handleClickOpenUpdateParametro();
  };

  const handleDeleteParametro = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar el parámetro?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = parametros[deletedRowIndex];
    const newParametros = parametros.filter(
      (_, index) => index !== deletedRowIndex
    );
    setParametros(newParametros);
    APIService.deleteParametroFuncion(
      deletedRowValue.cod_funcion,
      deletedRowValue.secuencia
    )
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getParametros();
      });
    return true;
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodFuncion("");
    setModulo(shapeModulo);
    setNombre("");
    setNombreBD("");
    setEstado(true);
    setObservaciones("");
    setRetorno(DefaultTipoRetorno);
  };

  const handleClickCloseCreate = () => {
    setCodFuncion("");
    setOpenCreate(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleClickOpenCreateParametro = () => {
    setOpenCreateParametro(true);
  };

  const handleClickCloseCreateParametro = () => {
    setOpenCreateParametro(false);
  };

  const handleClickOpenUpdateParametro = () => {
    setOpenUpdateParametro(true);
  };

  const handleClickCloseUpdateParametro = () => {
    setOpenUpdateParametro(false);
  };

  const handleTest = async () => {
    try {
      toast.success(
        "Resultado: " + (await APIService.executeFuncionBD(codFuncion)).mensaje
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const checkTipoParametro = (tipo) => {
    switch (tipo) {
      case TiposParametro.VARIABLE.key:
        setFijoCaracter("");
        setFijoNumero("");
        break;
      case TiposParametro.CARACTER.key:
        setVariable("");
        setFijoNumero("");
        break;
      case TiposParametro.NUMERO.key:
        setVariable("");
        setFijoCaracter("");
        break;
      default:
        setVariable("");
        setFijoCaracter("");
        setFijoNumero("");
        return;
    }
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
      options: { customBodyRender: (value) => <CustomTooltip texto={value} /> },
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value, "a"),
      },
    },
    {
      name: "observaciones",
      label: "Observaciones",
      options: { customBodyRender: (value) => <CustomTooltip texto={value} /> },
    },
    {
      name: "tipo_retorno",
      label: "Retorno",
    },
  ];

  const options = createTableOptions(
    handleRowClick,
    handleDelete,
    undefined,
    handleRowSelectionChange
  );

  const columnsParametros = [
    {
      name: "cod_funcion",
      options: {
        display: "excluded",
      },
    },
    {
      name: "secuencia",
      label: "Secuencia",
    },
    {
      name: "tipo_parametro",
      label: "Tipo parámetro",
    },
    {
      name: "variable",
      label: "Variable",
    },
    {
      name: "fijo_caracter",
      label: "Caracter",
    },
    {
      name: "fijo_numero",
      label: "Número",
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: {
        customBodyRender: (value) => formatearFechaHora(value),
      },
    },
  ];

  const optionsParametros = createTableOptions(
    handleRowClickParametro,
    handleDeleteParametro
  );

  const autocompleteModulos = (
    <AutocompleteObject
      id="Módulo"
      value={modulo}
      valueId="cod_sistema"
      shape={shapeModulo}
      options={modulos}
      optionLabel="sistema"
      onChange={(e, value) => {
        setModulo(value ?? shapeModulo);
      }}
    />
  );

  const selectRetorno = (
    <CustomSelect
      label="Tipo retorno"
      options={TiposRetorno}
      value={retorno}
      onChange={createDefaultSetter(setRetorno)}
    />
  );

  const selectTipoParametro = (
    <CustomSelect
      label="Tipo parámetro"
      options={TiposParametro}
      value={tipoParametro}
      onChange={(e) => {
        const nuevoTipo = e.target.value ?? "";
        checkTipoParametro(nuevoTipo);
        setTipoParametro(nuevoTipo);
      }}
    />
  );

  const checkboxEstado = (
    <Check
      label="Activa"
      checked={estado}
      onChange={createDefaultSetter(setEstado, true)}
    />
  );

  const boxCenter = (
    <BoxCenter
      components={[
        <BtnNuevo onClick={handleUpdate} texto="Actualizar" icon={false} />,
        <BtnNuevo
          onClick={handleTest}
          texto="Evaluar"
          icon={false}
          disabled={!nombreBDActualizado}
        />,
      ]}
    />
  );

  const createContentItems = [
    createCustomComponentItem(4, "autocompleteModulos", autocompleteModulos),
    createTextFieldItem(
      4,
      "cod_funcion",
      "Código",
      codFuncion,
      createDefaultSetter(setCodFuncion, undefined, true),
      true,
      "FUNC###"
    ),
    createCustomComponentItem(4, "selectRetorno", selectRetorno),
    createTextFieldItem(
      6,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createTextFieldItem(
      6,
      "nombre_base_datos",
      "Nombre base de datos",
      nombreBD,
      createDefaultSetter(setNombreBD)
    ),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      createDefaultSetter(setObservaciones),
      false,
      undefined,
      undefined,
      undefined,
      3
    ),
  ];

  const variableTextFieldItem = createTextFieldItem(
    12,
    "variable",
    "Variable",
    variable,
    createDefaultSetter(setVariable)
  );

  const caracterTextFieldItem = createTextFieldItem(
    12,
    "fijo_caracter",
    "Caracter",
    fijoCaracter,
    createDefaultSetter(setFijoCaracter)
  );

  const numeroTextFieldItem = createTextFieldItem(
    12,
    "fijo_numero",
    "Número",
    fijoNumero,
    createDefaultSetter(setFijoNumero),
    undefined,
    undefined,
    undefined,
    "number"
  );

  const createParametroContentItems = () => {
    const items = [
      createTextFieldItem(4, "cod_funcion", "Código Función", codFuncion),
      createTextFieldItem(4, "secuencia", "Secuencia", parametros.length + 1),
      createCustomComponentItem(
        4,
        "selectTipoParametro",
        selectTipoParametro,
        createDefaultSetter(setTipoParametro)
      ),
    ];
    switch (tipoParametro) {
      case TiposParametro.VARIABLE.key:
        return items.concat(variableTextFieldItem);
      case TiposParametro.CARACTER.key:
        return items.concat(caracterTextFieldItem);
      case TiposParametro.NUMERO.key:
        return items.concat(numeroTextFieldItem);
      default:
        return items;
    }
  };

  const updateContentItems = [
    createTextFieldItem(4, "cod_funcion", "Código", codFuncion),
    createCustomComponentItem(8, "autocompleteModulos", autocompleteModulos),
    createCustomComponentItem(4, "selectRetorno", selectRetorno),
    createTextFieldItem(
      6,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createCustomComponentItem(2, "checkboxEstado", checkboxEstado),
    createTextFieldItem(
      12,
      "nombre_base_datos",
      "Nombre base de datos",
      nombreBD,
      (e) => {
        setNombreBDActualizado(false);
        setNombreBD(e.target.value);
      }
    ),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      createDefaultSetter(setObservaciones),
      false,
      undefined,
      undefined,
      undefined,
      3
    ),
    createCustomComponentItem(12, "boxCenter", boxCenter),
  ];

  const updateParametroContentItems = () => {
    const items = [
      createTextFieldItem(4, "cod_funcion", "Código Función", codFuncion),
      createTextFieldItem(4, "secuencia", "Secuencia", secuencia),
      createCustomComponentItem(
        4,
        "selectTipoParametro",
        selectTipoParametro,
        createDefaultSetter(setTipoParametro)
      ),
    ];
    switch (tipoParametro) {
      case TiposParametro.VARIABLE.key:
        return items.concat(variableTextFieldItem);
      case TiposParametro.CARACTER.key:
        return items.concat(caracterTextFieldItem);
      case TiposParametro.NUMERO.key:
        return items.concat(numeroTextFieldItem);
      default:
        return items;
    }
  };

  const createContent = <CustomGrid items={createContentItems} />;

  const createParametroContent = (
    <CustomGrid items={createParametroContentItems()} />
  );

  const updateContent = <CustomGrid items={updateContentItems} />;

  const updateParametroContent = (
    <CustomGrid items={updateParametroContentItems()} />
  );

  const header = <Header menus={menus} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} texto="Nueva" />;

  const tabla = (
    <Tabla
      title="Funciones"
      data={funciones}
      columns={columns}
      options={options}
    />
  );

  const btnNuevoParametro = (
    <BtnNuevo onClick={handleClickOpenCreateParametro} disabled={!codFuncion} />
  );

  const tablaParametros = (
    <Tabla
      title={`Parámetros ${codFuncion ? `de la función ${codFuncion}` : ""}`}
      data={parametros}
      columns={columnsParametros}
      options={optionsParametros}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Función"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Función"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
    />
  );

  const createParametroDialog = (
    <CustomDialog
      titulo="Registrar Parámetro"
      contenido={createParametroContent}
      open={openCreateParametro}
      handleClose={handleClickCloseCreateParametro}
      handleCancel={handleClickCloseCreateParametro}
      handleConfirm={handleCreateParametro}
    />
  );

  const updateParametroDialog = (
    <CustomDialog
      titulo="Actualizar Parámetro"
      contenido={updateParametroContent}
      open={openUpdateParametro}
      handleClose={handleClickCloseUpdateParametro}
      handleCancel={handleClickCloseUpdateParametro}
      handleConfirm={handleUpdateParametro}
      confirmText="Actualizar"
    />
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
    <MainComponent
      components={[
        header,
        btnNuevo,
        tabla,
        btnNuevoParametro,
        tablaParametros,
        createDialog,
        updateDialog,
        createParametroDialog,
        updateParametroDialog,
      ]}
    />
  );
}
