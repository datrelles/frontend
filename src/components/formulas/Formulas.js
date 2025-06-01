import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  formatearEstado,
  obtenerNombreTipoRetorno,
} from "../../helpers/modulo-formulas";
import Header from "./common/header";
import Tabla from "./common/tabla";
import BtnNuevo from "./common/btn-nuevo";
import CustomDialog from "./common/custom-dialog";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createEmptyItem,
  createFunctionCustomBodyRender,
  createLegendItem,
  createTableOptions,
  createTextFieldItem,
  createTooltipCustomBodyRender,
} from "./common/generators";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import MainComponent from "./common/main-component";
import BoxCenter from "./common/box-center";
import AutocompleteObject from "./common/autocomplete-objects";
import Legend from "./common/legend";
import {
  CaracteresFormula,
  ColoresFondo,
  DefaultTipoRetorno,
  Enum,
  TiposRetorno,
} from "./common/enum";
import CustomSelect from "./common/custom-select";

const shapeSugerencia = {
  codigo: "",
  nombre: "Seleccione",
};

const itemsLeyenda = [
  createLegendItem("Número", "#", ColoresFondo.INFO.key),
  createLegendItem("Función", "&", ColoresFondo.SUCCESS.key),
  createLegendItem("Parámetro", "$", ColoresFondo.DARK.key),
  createLegendItem("Fórmula", "@", ColoresFondo.WARNING.key),
  createLegendItem(
    "+ - * / ( )",
    "Operadores válidos",
    ColoresFondo.DANGER.key
  ),
  createLegendItem(
    "S (v1,condición,v2,v3,v4,v5)",
    "SI",
    ColoresFondo.DANGER.key
  ),
  createLegendItem(
    "= <> != > >= < <= E (entre)",
    "Condición",
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
  const [funcionesSugerencias, setFuncionesSugerencias] = useState([]);
  const [parametrosSugerencias, setParametrosSugerencias] = useState([]);
  const [matchActual, setMatchActual] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [labelSugerencias, setLabelSugerencias] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFormula, setCodFormula] = useState("");
  const [nombre, setNombre] = useState("");
  const [retorno, setRetorno] = useState(DefaultTipoRetorno);
  const [descripcion, setDescripcion] = useState("");
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

  const getFuncionesSugerencias = async () => {
    try {
      setFuncionesSugerencias(
        (await APIService.getFunciones()).map(
          ({ cod_funcion, nombre, estado }) => ({
            codigo: cod_funcion,
            nombre,
            estado,
          })
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getParmetrosSugerencias = async () => {
    try {
      setParametrosSugerencias(
        (await APIService.getParametros()).map(
          ({ cod_parametro, nombre, estado }) => ({
            codigo: cod_parametro,
            nombre,
            estado,
          })
        )
      );
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
    const definicionTrim = definicion.trim();
    setDefinicion(definicionTrim);
    APIService.createFormula({
      empresa: enterpriseShineray,
      cod_formula: codFormula,
      nombre,
      tipo_retorno: retorno,
      descripcion,
      definicion: definicionTrim,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodFormula("");
        setNombre("");
        setRetorno(DefaultTipoRetorno);
        setDescripcion("");
        setEstado(true);
        setDefinicion("");
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const definicionTrim = definicion.trim();
    setDefinicion(definicionTrim);
    APIService.updateFormula(codFormula, {
      nombre,
      tipo_retorno: retorno,
      estado,
      descripcion: descripcion,
      definicion: definicionTrim,
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
    setRetorno(row.tipo_retorno);
    setEstado(row.estado === 1);
    setDefinicion(row.definicion);
    setDescripcion(row.descripcion ?? "");
    handleClickOpenUpdate();
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodFormula("");
    setNombre("");
    setRetorno(DefaultTipoRetorno);
    setDescripcion("");
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
    const caracteresFormula = Enum.values(CaracteresFormula).reduce(
      (res, cur) =>
        cur.key !== CaracteresFormula.NUMERO.key ? res + cur.key : res,
      ""
    );
    const regexString = `[${caracteresFormula}](\\w*)`;
    const regex = new RegExp(regexString, "g");
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
      const caracterSugerencia = ultimoMatch.textoCompleto[0];
      let fullMatch;
      switch (caracterSugerencia) {
        case CaracteresFormula.FUNCION.key:
          fullMatch = funcionesSugerencias.some(
            (item) => item.codigo.toLowerCase() === query
          );
          break;
        case CaracteresFormula.PARAMETRO.key:
          fullMatch = parametrosSugerencias.some(
            (item) => item.codigo.toLowerCase() === query
          );
          break;
        case CaracteresFormula.FORMULA.key:
          fullMatch = formulas.some(
            (formula) => formula.cod_formula.toLowerCase() === query
          );
          break;
        default:
          break;
      }
      if (!fullMatch) {
        let filtradas = [];
        switch (caracterSugerencia) {
          case CaracteresFormula.FUNCION.key:
            setLabelSugerencias("Funciones");
            filtradas = funcionesSugerencias.filter((item) =>
              item.nombre.toLowerCase().includes(query)
            );
            break;
          case CaracteresFormula.PARAMETRO.key:
            setLabelSugerencias("Parámetros");
            filtradas = parametrosSugerencias.filter((item) =>
              item.nombre.toLowerCase().includes(query)
            );
            break;
          case CaracteresFormula.FORMULA.key:
            setLabelSugerencias("Fórmulas");
            filtradas = formulas
              .filter(
                (formula) =>
                  formula.nombre.toLowerCase().includes(query) &&
                  formula.cod_formula.toLowerCase() !== codFormula.toLowerCase()
              )
              .map((formula) => ({
                ...formula,
                codigo: formula.cod_formula,
              }));
            break;
          default:
            setLabelSugerencias("");
            break;
        }
        filtradas = filtradas.filter((item) => item.estado);
        setSugerencias(filtradas);
        setMostrarSugerencias(true);
        setMatchActual({ ...ultimoMatch, cursor });
      } else {
        setLabelSugerencias("");
        setMostrarSugerencias(false);
        setMatchActual(null);
      }
    } else {
      setLabelSugerencias("");
      setMostrarSugerencias(false);
      setMatchActual(null);
    }
  };

  const insertarSugerencia = (texto) => {
    if (!matchActual) return;
    const { start, end } = matchActual;
    const antes = definicion.slice(0, start);
    const despues = definicion.slice(end);
    const caracterSugerencia = matchActual.textoCompleto[0];
    const nuevoTexto = `${antes}${caracterSugerencia}${texto} ${despues}`;
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
      options: createTooltipCustomBodyRender(),
    },
    {
      name: "tipo_retorno",
      label: "Retorno",
      options: createFunctionCustomBodyRender(obtenerNombreTipoRetorno),
    },
    {
      name: "definicion",
      label: "Definición",
    },
    {
      name: "descripcion",
      label: "Descripción",
      options: createTooltipCustomBodyRender(),
    },
    {
      name: "estado",
      label: "Estado",
      options: createFunctionCustomBodyRender(formatearEstado, "a"),
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

  const selectRetorno = (
    <CustomSelect
      label="Tipo retorno"
      options={TiposRetorno}
      value={retorno}
      onChange={createDefaultSetter(setRetorno)}
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
      id={labelSugerencias}
      value={shapeSugerencia}
      optionId="codigo"
      shape={shapeSugerencia}
      options={sugerencias}
      optionLabel="nombre"
      onChange={(e, value) => {
        if (value) {
          insertarSugerencia(value.codigo);
        }
      }}
    />
  );

  const createContentItems = [
    createTextFieldItem(
      3,
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
    createCustomComponentItem(3, "retorno", selectRetorno),
    createTextFieldItem(
      12,
      "descripcion",
      "Descripción",
      descripcion,
      createDefaultSetter(setDescripcion),
      false,
      undefined,
      undefined,
      undefined,
      3
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      onChangeDefinicion
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
    createCustomComponentItem(12, "retorno", selectRetorno),
    createTextFieldItem(
      12,
      "descripcion",
      "Descripción",
      descripcion,
      createDefaultSetter(setDescripcion),
      false,
      undefined,
      undefined,
      undefined,
      3
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      onChangeDefinicion
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
    getFuncionesSugerencias();
    getParmetrosSugerencias();
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
