import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  formatearEstado,
  formatearFechaHora,
  obtenerNombreTipoRetorno,
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
  createFunctionCustomBodyRender,
  createTableOptions,
  createTextFieldItem,
  createTooltipCustomBodyRender,
} from "./common/generators";
import MainComponent from "./common/main-component";
import {
  DefaultPaqueteBD,
  DefaultTipoParametro,
  DefaultTipoRetorno,
  PaquetesBD,
  TiposParametro,
  TiposRetorno,
} from "./common/enum";
import BoxCenter from "./common/box-center";

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
  const [paquete, setPaquete] = useState(DefaultPaqueteBD);
  const [nombre, setNombre] = useState("");
  const [nombreBD, setNombreBD] = useState("");
  const [estado, setEstado] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [retorno, setRetorno] = useState(DefaultTipoRetorno);
  const [tipoParametro, setTipoParametro] = useState(DefaultTipoParametro);
  const [secuencia, setSecuencia] = useState(1);
  const [numero, setNumero] = useState("");
  const [texto, setTexto] = useState("");
  const [variable, setVariable] = useState("");
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
      paquete,
      nombre,
      nombre_base_datos: nombreBD,
      tipo_retorno: retorno,
      descripcion,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodFuncion("");
        setModulo(shapeModulo);
        setNombre("");
        setNombreBD("");
        setEstado(true);
        setDescripcion("");
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
      texto,
      numero,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreateParametro(false);
        getParametros();
        setTipoParametro(DefaultTipoParametro);
        setVariable("");
        setTexto("");
        setNumero("");
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateFuncion(codFuncion, {
      cod_modulo: modulo.cod_sistema,
      paquete,
      nombre,
      nombre_base_datos: nombreBD,
      descripcion: descripcion,
      tipo_retorno: retorno,
      estado,
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
      texto,
      numero,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdateParametro(false);
        getParametros(codFuncion);
        setTipoParametro(DefaultTipoParametro);
        setVariable("");
        setTexto("");
        setNumero("");
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
    setDescripcion(row.descripcion ?? "");
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
    setNumero(row.numero ?? "");
    setTexto(row.texto ?? "");
    setVariable(row.variable ?? "");
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
    setDescripcion("");
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
      case TiposParametro.NUMERO.key:
        setVariable("");
        setTexto("");
        break;
      case TiposParametro.TEXTO.key:
        setVariable("");
        setNumero("");
        break;
      case TiposParametro.VARIABLE.key:
        setTexto("");
        setNumero("");
        break;
      default:
        setVariable("");
        setTexto("");
        setNumero("");
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
      options: createTooltipCustomBodyRender(),
    },
    {
      name: "descripcion",
      label: "Descripción",
      options: createTooltipCustomBodyRender(),
    },
    {
      name: "tipo_retorno",
      label: "Retorno",
      options: createFunctionCustomBodyRender(obtenerNombreTipoRetorno),
    },
    {
      name: "estado",
      label: "Estado",
      options: createFunctionCustomBodyRender(formatearEstado, "a"),
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
      name: "numero",
      label: "Número",
    },
    {
      name: "texto",
      label: "Texto",
    },
    {
      name: "variable",
      label: "Variable",
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: createFunctionCustomBodyRender(formatearFechaHora),
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
      optionId="cod_sistema"
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

  const selectPaquete = (
    <CustomSelect
      label="Paquete"
      options={PaquetesBD}
      value={paquete}
      onChange={createDefaultSetter(setPaquete)}
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
    createTextFieldItem({
      xs: 3,
      id: "cod_funcion",
      label: "Código",
      value: codFuncion,
      setValue: createDefaultSetter(setCodFuncion, undefined, true),
      placeholder: "FUNC###",
    }),
    createCustomComponentItem(5, "autocompleteModulos", autocompleteModulos),
    createCustomComponentItem(4, "selectPaquete", selectPaquete),
    createCustomComponentItem(3, "selectRetorno", selectRetorno),
    createTextFieldItem({
      xs: 9,
      id: "nombre_base_datos",
      label: "Nombre base de datos",
      value: nombreBD,
      setValue: createDefaultSetter(setNombreBD),
    }),
    createTextFieldItem({
      xs: 12,
      id: "nombre",
      label: "Nombre",
      value: nombre,
      setValue: createDefaultSetter(setNombre),
    }),
    createTextFieldItem({
      xs: 12,
      id: "descripcion",
      label: "Descripción",
      value: descripcion,
      setValue: createDefaultSetter(setDescripcion),
      required: false,
      rows: 3,
    }),
  ];

  const numeroTextFieldItem = createTextFieldItem({
    xs: 12,
    id: "numero",
    label: "Número",
    value: numero,
    setValue: createDefaultSetter(setNumero),
    type: "number",
  });

  const caracterTextFieldItem = createTextFieldItem({
    xs: 12,
    id: "texto",
    label: "Texto",
    value: texto,
    setValue: createDefaultSetter(setTexto),
  });

  const variableTextFieldItem = createTextFieldItem({
    xs: 12,
    id: "variable",
    label: "Variable",
    value: variable,
    setValue: createDefaultSetter(setVariable),
  });

  const createParametroContentItems = () => {
    const items = [
      createTextFieldItem({
        xs: 4,
        id: "cod_funcion",
        label: "Código Función",
        value: codFuncion,
      }),
      createTextFieldItem({
        xs: 4,
        id: "secuencia",
        label: "Secuencia",
        value: parametros.length + 1,
      }),
      createCustomComponentItem(
        4,
        "selectTipoParametro",
        selectTipoParametro,
        createDefaultSetter(setTipoParametro)
      ),
    ];
    switch (tipoParametro) {
      case TiposParametro.NUMERO.key:
        return items.concat(numeroTextFieldItem);
      case TiposParametro.TEXTO.key:
        return items.concat(caracterTextFieldItem);
      case TiposParametro.VARIABLE.key:
        return items.concat(variableTextFieldItem);
      default:
        return items;
    }
  };

  const updateContentItems = [
    createTextFieldItem({
      xs: 3,
      id: "cod_funcion",
      label: "Código",
      value: codFuncion,
    }),
    createCustomComponentItem(5, "autocompleteModulos", autocompleteModulos),
    createCustomComponentItem(4, "selectPaquete", selectPaquete),
    createCustomComponentItem(3, "selectRetorno", selectRetorno),
    createTextFieldItem({
      xs: 7,
      id: "nombre_base_datos",
      label: "Nombre base de datos",
      value: nombreBD,
      setValue: (e) => {
        setNombreBDActualizado(false);
        setNombreBD(e.target.value);
      },
    }),
    createCustomComponentItem(2, "checkboxEstado", checkboxEstado),
    createTextFieldItem({
      xs: 12,
      id: "nombre",
      label: "Nombre",
      value: nombre,
      setValue: createDefaultSetter(setNombre),
    }),
    createTextFieldItem({
      xs: 12,
      id: "descripcion",
      label: "Descripción",
      value: descripcion,
      setValue: createDefaultSetter(setDescripcion),
      required: false,
      rows: 3,
    }),
    createCustomComponentItem(12, "boxCenter", boxCenter),
  ];

  const updateParametroContentItems = () => {
    const items = [
      createTextFieldItem({
        xs: 4,
        id: "cod_funcion",
        label: "Código Función",
        value: codFuncion,
      }),
      createTextFieldItem({
        xs: 4,
        id: "secuencia",
        label: "Secuencia",
        value: secuencia,
      }),
      createCustomComponentItem(
        4,
        "selectTipoParametro",
        selectTipoParametro,
        createDefaultSetter(setTipoParametro)
      ),
    ];
    switch (tipoParametro) {
      case TiposParametro.NUMERO.key:
        return items.concat(numeroTextFieldItem);
      case TiposParametro.TEXTO.key:
        return items.concat(caracterTextFieldItem);
      case TiposParametro.VARIABLE.key:
        return items.concat(variableTextFieldItem);
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
