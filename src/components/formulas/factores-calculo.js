import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import { toast } from "react-toastify";
import API from "../../services/modulo-formulas";
import Header from "./common/header";
import BtnNuevo from "./common/btn-nuevo";
import {
  createEmptyItem,
  createCustomComponentItem,
  createTextFieldItem,
} from "./common/form-generators";
import CustomList from "./common/custom-list";
import CustomSelect from "./common/custom-select";
import AutocompleteObject from "./common/autocomplete-objects";
import MainComponent from "./common/main-component";
import BoxCenter from "./common/box-center";
import BtnCancelar from "./common/btn-cancelar";
import CustomTypography from "./common/custom-typography";

const shapeParametroOperador = {
  cod_parametro: "",
  nombre: "Seleccione",
};

const tiposOperadores = [
  { value: "PAR", label: "PARÁMETRO" },
  { value: "VAL", label: "VALOR FIJO" },
  { value: "OPE", label: "OPERADOR" },
];

const operadores = [
  { value: "+" },
  { value: "-" },
  { value: "*" },
  { value: "/" },
];

export default function FactoresCalculo() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const codProceso = queryParams.get("proceso");
  const codParametro = queryParams.get("parametro");
  const [menus, setMenus] = useState([]);
  const [proceso, setProceso] = useState({ nombre: "" });
  const [parametro, setParametro] = useState({ nombre: "" });
  const [factores, setFactores] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [createFactor, setCreateFactor] = useState(false);
  const [orden, setOrden] = useState(1);
  const [tipoOperador, setTipoOperador] = useState("Seleccione");
  const [operador, setOperador] = useState("");
  const [valorFijo, setValorFijo] = useState("");
  const [parametroOperador, setParametroOperador] = useState(
    shapeParametroOperador
  );

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProceso = async () => {
    try {
      setProceso(await APIService.getProceso(codProceso));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getParametro = async () => {
    try {
      setParametro(await APIService.getParametro(codParametro));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getParametrosPorProceso = async () => {
    try {
      setParametros(
        (await APIService.getParametrosPorProceso(codProceso)).map((p) => ({
          ...p,
          nombre: p.parametro.nombre,
        }))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createFactor(codProceso, codParametro, {
      orden,
      tipo_operador: tipoOperador,
      operador,
      valor_fijo: valorFijo,
      cod_parametro_operador: parametroOperador.cod_parametro,
    })
      .then((res) => {
        toast.success(res);
        setTipoOperador("Seleccione");
        setOperador("Seleccione");
        setValorFijo("");
        setParametroOperador(shapeParametroOperador);
        getFactores();
      })
      .catch((err) => toast.error(err.message));
  };

  const getFactores = async () => {
    try {
      setFactores(await APIService.getFactores(codProceso, codParametro));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (orden) => {
    if (!window.confirm("¿Estás seguro de eliminar el factor?")) {
      return;
    }
    APIService.deleteFactor(codProceso, codParametro, orden)
      .then((res) => {
        toast.success(res);
        getFactores();
      })
      .catch((err) => toast.error(err.message));
  };

  const checkUltimoTipoOperador = (clave) => {
    if (!factores || factores.length === 0) {
      return clave === "OPE";
    }
    const ultimoTipo = factores[factores.length - 1].tipo_operador;
    if (ultimoTipo === "PAR" || ultimoTipo === "VAL") return clave !== "OPE";
    else return clave === "OPE";
  };

  const checkTipoOperador = (tipo) => {
    switch (tipo) {
      case tiposOperadores.find((o) => o.value === "PAR").value:
        setValorFijo("");
        setOperador("Seleccione");
        break;
      case tiposOperadores.find((o) => o.value === "VAL").value:
        setParametroOperador(shapeParametroOperador);
        setOperador("Seleccione");
        break;
      case tiposOperadores.find((o) => o.value === "OPE").value:
        setParametroOperador(shapeParametroOperador);
        setValorFijo("");
        break;
      default:
        setValorFijo("");
        setOperador("Seleccione");
        setParametroOperador(shapeParametroOperador);
        return;
    }
  };

  const listItems = factores.map((item, index) => ({
    id: `factor_${item.orden}`,
    grid_items: [
      createTextFieldItem(
        3,
        `orden_${item.orden}`,
        "Orden",
        item.orden,
        undefined,
        undefined,
        undefined,
        undefined,
        "number"
      ),
      createCustomComponentItem(
        3,
        `select_tipo_op_${item.orden}`,
        <CustomSelect
          label="Tipo operador"
          options={tiposOperadores}
          value={item.tipo_operador}
        />
      ),
      createCustomComponentItem(
        1,
        `select_operador_${item.orden}`,
        item.operador ? (
          <CustomSelect
            label="Operador"
            options={operadores}
            value={item.operador}
          />
        ) : (
          <></>
        )
      ),
      item.valor_fijo
        ? createTextFieldItem(
            2,
            `valor_fijo_${item.orden}`,
            "Valor fijo",
            item.valor_fijo,
            undefined,
            undefined,
            undefined,
            undefined,
            "number"
          )
        : createEmptyItem(2, `valor_fijo_${item.orden}`),
      item.cod_parametro_operador
        ? createTextFieldItem(
            2,
            `cod_parametro_operador_${item.orden}`,
            "Parámetro",
            parametros.find(
              (p) => p.cod_parametro === item.cod_parametro_operador
            )?.parametro?.nombre ?? ""
          )
        : createEmptyItem(2, `cod_parametro_operador_${item.orden}`),
      createCustomComponentItem(
        1,
        `delete_${item.orden}`,
        item.orden === factores.length ? (
          <BtnNuevo
            onClick={() => {
              handleDelete(item.orden);
            }}
            texto="Quitar"
            icon={false}
          />
        ) : (
          <></>
        )
      ),
    ],
  }));

  const nuevoFactorListItem = {
    id: "nuevo_factor",
    grid_items: [
      createTextFieldItem(
        3,
        "n_f_orden",
        "Orden",
        orden,
        null,
        true,
        null,
        true
      ),
      createCustomComponentItem(
        3,
        "n_f_tipo_operador",
        <CustomSelect
          label="Tipo operador"
          options={tiposOperadores.map((o) => ({
            ...o,
            disabled: checkUltimoTipoOperador(o.value),
          }))}
          value={tipoOperador}
          onChange={(e) => {
            const nuevoTipo = e.target.value ?? "";
            checkTipoOperador(nuevoTipo);
            setTipoOperador(nuevoTipo);
          }}
        />
      ),
      createCustomComponentItem(
        1,
        "n_f_operador",
        <CustomSelect
          label="Operador"
          options={operadores}
          value={operador}
          onChange={(e) => {
            setOperador(e.target.value);
          }}
          required={false}
          disabled={
            tiposOperadores.find((o) => o.value === tipoOperador) !==
            tiposOperadores.find((o) => o.value === "OPE")
          }
        />
      ),
      createTextFieldItem(
        2,
        "n_f_valor_fijo",
        "Valor fijo",
        valorFijo,
        setValorFijo,
        false,
        "",
        tiposOperadores.find((o) => o.value === tipoOperador) !==
          tiposOperadores.find((o) => o.value === "VAL"),
        "number"
      ),
      createCustomComponentItem(
        3,
        "n_f_parametro",
        <AutocompleteObject
          id="Parámetro"
          value={parametroOperador}
          valueId="cod_parametro"
          shape={shapeParametroOperador}
          options={parametros}
          optionLabel="nombre"
          onChange={(e, value) => {
            setParametroOperador(value ?? shapeParametroOperador);
          }}
          disabled={
            tiposOperadores.find((o) => o.value === tipoOperador) !==
            tiposOperadores.find((o) => o.value === "PAR")
          }
        />
      ),
    ],
  };

  const btnAdd = (
    <BoxCenter
      components={[
        <BtnNuevo onClick={handleCreate} texto="Agregar" />,
        <BtnCancelar onClick={() => setCreateFactor(false)} />,
      ]}
    />
  );

  const lastItem = {
    id: "botones",
    grid_items: [createCustomComponentItem(12, "n_f_botones", btnAdd)],
  };

  const list = (
    <CustomList
      mt={2}
      items={
        createFactor ? [...listItems, nuevoFactorListItem, lastItem] : listItems
      }
    />
  );

  const btnNuevo = createFactor ? (
    <></>
  ) : (
    <BoxCenter
      components={[<BtnNuevo onClick={() => setCreateFactor(true)} />]}
    />
  );

  const header = <Header menus={menus} />;

  const titulo = (
    <CustomTypography
      variant="h6"
      texto={`Factores de cálculo de ${proceso.nombre} y de ${parametro.nombre}`}
    />
  );

  const texto =
    factores.length === 0 ? (
      <CustomTypography
        variant="body1"
        texto="Aún no se han registrado factores de cálculo"
      />
    ) : (
      <></>
    );

  useEffect(() => {
    document.title = "Factores de cálculo";
    getMenus();
    if (codProceso && codParametro) {
      getProceso();
      getParametro();
      getFactores();
      getParametrosPorProceso();
    }
  }, []);

  useEffect(() => {
    setOrden(factores.length + 1);
  }, [factores]);

  return <MainComponent components={[header, titulo, texto, list, btnNuevo]} />;
}
