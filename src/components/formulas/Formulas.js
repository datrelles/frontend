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
import {
  createCustomComponentItem,
  createDefaultSetter,
  createEmptyItem,
  createLegendItem,
  createTableOptions,
  createTextFieldItem,
} from "./common/generators";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import MainComponent from "./common/main-component";
import BoxCenter from "./common/box-center";
import AutocompleteObject from "./common/autocomplete-objects";
import Legend from "./common/legend";
import { ColoresFondo } from "./common/enum";

const shapeFuncion = {
  cod_funcion: "",
  nombre: "Seleccione",
};

const itemsLeyenda = [
  createLegendItem("Número", "#", ColoresFondo.INFO.key),
  createLegendItem("Función", "&", ColoresFondo.SUCCESS.key),
  createLegendItem("Factor", "$", ColoresFondo.DARK.key),
  createLegendItem("Fórmula", "@", ColoresFondo.DANGER.key),
  createLegendItem(
    "+ - * / ( )",
    "Caracteres válidos",
    ColoresFondo.DANGER.key
  ),
  createLegendItem(
    "S ( v1 , 'cond' , v2 , v3 , v4 , v5 )",
    "SI",
    ColoresFondo.DANGER.key
  ),
  createLegendItem(
    "'>' '<' '=' '>=' '<=' '<>' '!=' E (entre)",
    "Cond",
    ColoresFondo.DANGER.key
  ),
  createLegendItem(
    "Todas las expresiones van separadas por espacios y sin ENTER"
  ),
];

const leyendaFormulas = <Legend title="Notas" items={itemsLeyenda} />;

export default function Formulas() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [menus, setMenus] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [matchActual, setMatchActual] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFormula, setCodFormula] = useState("");
  const [nombre, setNombre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState(true);
  const [definicion, setDefinicion] = useState("");
  const [definicionActualizada, setDefinicionActualizada] = useState(false);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
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

  const getFormulas = async () => {
    try {
      setFormulas(await APIService.getFormulas());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createFormula({
      empresa: enterpriseShineray,
      cod_formula: codFormula,
      nombre,
      observaciones,
      definicion,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodFormula("");
        setNombre("");
        setObservaciones("");
        setEstado(true);
        setDefinicion("");
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateFormula(codFormula, {
      nombre,
      estado,
      observaciones: observaciones,
      definicion,
    })
      .then((res) => {
        setDefinicionActualizada(true);
        toast.success(res);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar la fórmula?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = formulas[deletedRowIndex];
    const newFormulas = formulas.filter(
      (_, index) => index !== deletedRowIndex
    );
    setFormulas(newFormulas);
    APIService.deleteFormula(deletedRowValue.cod_formula)
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getFormulas();
      });
    return true;
  };

  const handleTest = async () => {
    try {
      toast.success(
        "Resultado: " + (await APIService.executeFormulaBD(codFormula)).mensaje
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRowClick = (rowData, rowMeta) => {
    setDefinicionActualizada(true);
    const row = formulas.find((item) => item.cod_formula === rowData[0]);
    setCodFormula(row.cod_formula);
    setNombre(row.nombre);
    setEstado(row.estado === 1);
    setDefinicion(row.definicion);
    setObservaciones(row.observaciones ?? "");
    handleClickOpenUpdate();
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodFormula("");
    setNombre("");
    setObservaciones("");
    setEstado(true);
    setDefinicion("");
  };

  const handleClickCloseCreate = () => {
    setOpenCreate(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
    setMostrarSugerencias(false);
  };

  const onChangeDefinicion = (e) => {
    setDefinicionActualizada(false);
    const definicion = e.target.value;
    setDefinicion(definicion);
    const cursor = e.target.selectionStart;
    const hastaCursor = definicion.slice(0, cursor);
    const regex = /&(\w*)/g;
    let match;
    let ultimoMatch = null;
    while ((match = regex.exec(hastaCursor)) !== null) {
      ultimoMatch = {
        textoCompleto: match[0],
        palabra: match[1],
        start: match.index,
        end: match.index + match[0].length,
      };
    }
    if (ultimoMatch) {
      const query = ultimoMatch.palabra.toLowerCase();
      const fullMatch = funciones.some(
        (funcion) => funcion.cod_funcion.toLowerCase() === query
      );
      if (!fullMatch) {
        const filtradas = funciones.filter((funcion) =>
          funcion.nombre.toLowerCase().includes(query)
        );
        setSugerencias(filtradas);
        setMostrarSugerencias(true);
        setMatchActual({ ...ultimoMatch, cursor });
      } else {
        setMostrarSugerencias(false);
        setMatchActual(null);
      }
    } else {
      setMostrarSugerencias(false);
      setMatchActual(null);
    }
  };

  const insertarSugerencia = (texto) => {
    if (!matchActual) return;
    const { start, end } = matchActual;
    const antes = definicion.slice(0, start);
    const despues = definicion.slice(end);
    const nuevoTexto = `${antes}&${texto} ${despues}`;
    setDefinicion(nuevoTexto);
    setMostrarSugerencias(false);
    setMatchActual(null);
  };

  const columns = [
    {
      name: "cod_formula",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "definicion",
      label: "Definición",
    },
    {
      name: "observaciones",
      label: "Observaciones",
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value, "a"),
      },
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: {
        customBodyRender: (value) => formatearFechaHora(value),
      },
    },
  ];

  const options = createTableOptions(handleRowClick, handleDelete);

  const checkboxEstado = (
    <Check
      label="Activa"
      checked={estado}
      onChange={createDefaultSetter(setEstado, true)}
    />
  );

  const btnTest = (
    <BoxCenter
      components={[
        <BtnNuevo onClick={handleUpdate} texto="Actualizar" icon={false} />,
        <BtnNuevo
          onClick={handleTest}
          texto="Evaluar"
          icon={false}
          disabled={!definicionActualizada}
        />,
      ]}
    />
  );

  const autocompleteFunciones = (
    <AutocompleteObject
      id="Funciones"
      value={shapeFuncion}
      valueId="cod_funcion"
      shape={shapeFuncion}
      options={sugerencias}
      optionLabel="nombre"
      onChange={(e, value) => {
        if (value) {
          insertarSugerencia(value.cod_funcion);
        }
      }}
    />
  );

  const createContentItems = [
    createTextFieldItem(
      6,
      "cod_formula",
      "Código",
      codFormula,
      createDefaultSetter(setCodFormula, undefined, true),
      true,
      "FORMU###"
    ),
    createTextFieldItem(
      6,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      createDefaultSetter(setObservaciones),
      false
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      onChangeDefinicion,
      undefined,
      undefined,
      undefined,
      undefined,
      3
    ),
    mostrarSugerencias
      ? createCustomComponentItem(
          12,
          "autocompleteFunciones",
          autocompleteFunciones
        )
      : createEmptyItem(12, "autocompleteFunciones"),
  ];

  const updateContentItems = [
    createTextFieldItem(4, "cod_formula", "Código", codFormula),
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
      "observaciones",
      "Observaciones",
      observaciones,
      createDefaultSetter(setObservaciones),
      false
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      onChangeDefinicion,
      undefined,
      undefined,
      undefined,
      undefined,
      3
    ),
    mostrarSugerencias
      ? createCustomComponentItem(
          12,
          "autocompleteFunciones",
          autocompleteFunciones
        )
      : createEmptyItem(12, "autocompleteFunciones"),
    createCustomComponentItem(12, "btnTest", btnTest),
  ];

  const createContent = (
    <>
      <CustomGrid items={createContentItems} />
      {leyendaFormulas}
    </>
  );

  const updateContent = (
    <>
      <CustomGrid items={updateContentItems} />
      {leyendaFormulas}
    </>
  );

  const header = <Header menus={menus} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} />;

  const tabla = (
    <Tabla
      title="Fórmulas"
      data={formulas}
      columns={columns}
      options={options}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Fórmula"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Fórmula"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
    />
  );

  useEffect(() => {
    document.title = "Fórmulas";
    getMenus();
    getFunciones();
    getFormulas();
  }, []);

  useEffect(() => {
    getFormulas();
  }, [openCreate, openUpdate]);

  return (
    <MainComponent
      components={[header, btnNuevo, tabla, createDialog, updateDialog]}
    />
  );
}
