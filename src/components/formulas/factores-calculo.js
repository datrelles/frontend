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
  createCustomListItem,
  createDefaultSetter,
} from "./common/generators";
import CustomList from "./common/custom-list";
import CustomSelect from "./common/custom-select";
import AutocompleteObject from "./common/autocomplete-objects";
import MainComponent from "./common/main-component";
import BoxCenter from "./common/box-center";
import BtnCancelar from "./common/btn-cancelar";
import CustomTypography from "./common/custom-typography";
import { Enum, Operadores, TiposFactor } from "./common/enum";

const shapeParametroTipo = {
  cod_parametro: "",
  nombre: "Seleccione",
};

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
  const [tipoFactor, setTipoFactor] = useState("Seleccione");
  const [parametroTipo, setParametroTipo] = useState(shapeParametroTipo);
  const [numero, setNumero] = useState("");
  const [operador, setOperador] = useState("");

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
      tipo_factor: tipoFactor,
      cod_parametro_tipo: parametroTipo.cod_parametro,
      numero: numero,
      operador,
    })
      .then((res) => {
        toast.success(res);
        setTipoFactor("Seleccione");
        setOperador("Seleccione");
        setNumero("");
        setParametroTipo(shapeParametroTipo);
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

  const handleTest = async () => {
    try {
      toast.success(
        "Resultado: " +
          (await APIService.executeFactoresBD(codProceso, codParametro)).mensaje
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const checkUltimoTipoOperador = (clave) => {
    if (!factores || factores.length === 0) {
      return clave === TiposFactor.OPERADOR.key;
    }
    const ultimoTipo = factores[factores.length - 1].tipo_factor;
    if (
      ultimoTipo === TiposFactor.PARAMETRO.key ||
      ultimoTipo === TiposFactor.VALOR.key
    )
      return clave !== TiposFactor.OPERADOR.key;
    else return clave === TiposFactor.OPERADOR.key;
  };

  const checkTipoOperador = (tipo) => {
    switch (tipo) {
      case TiposFactor.PARAMETRO.key:
        setNumero("");
        setOperador("Seleccione");
        break;
      case TiposFactor.VALOR.key:
        setParametroTipo(shapeParametroTipo);
        setOperador("Seleccione");
        break;
      case TiposFactor.OPERADOR.key:
        setParametroTipo(shapeParametroTipo);
        setNumero("");
        break;
      default:
        setNumero("");
        setOperador("Seleccione");
        setParametroTipo(shapeParametroTipo);
        return;
    }
  };

  const factoresListItem = factores.map((item, index) =>
    createCustomListItem(`factor_${item.orden}`, [
      createTextFieldItem({
        xs: 3,
        id: `orden_${item.orden}`,
        label: "Orden",
        value: item.orden,
        type: "number",
      }),
      createCustomComponentItem(
        3,
        `select_tipo_op_${item.orden}`,
        <CustomSelect
          label="Tipo operador"
          options={TiposFactor}
          value={item.tipo_factor}
        />
      ),
      createCustomComponentItem(
        1,
        `select_operador_${item.orden}`,
        item.operador ? (
          <CustomSelect
            label="Operador"
            options={Operadores}
            value={item.operador}
          />
        ) : (
          <></>
        )
      ),
      item.numero
        ? createTextFieldItem({
            xs: 2,
            id: `numero_${item.orden}`,
            label: "Número",
            value: item.numero,
            type: "number",
          })
        : createEmptyItem(2, `numero_${item.orden}`),
      item.cod_parametro_tipo
        ? createTextFieldItem({
            xs: 2,
            id: `cod_parametro_operador_${item.orden}`,
            label: "Parámetro",
            value:
              parametros.find(
                (p) => p.cod_parametro === item.cod_parametro_tipo
              )?.parametro?.nombre ?? "",
          })
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
    ])
  );

  const nuevoFactorListItem = createCustomListItem("nuevo_factor", [
    createTextFieldItem({
      xs: 3,
      id: "n_f_orden",
      label: "Orden",
      value: orden,
      required: true,
      disabled: true,
    }),
    createCustomComponentItem(
      3,
      "n_f_tipo_operador",
      <CustomSelect
        label="Tipo operador"
        options={Enum.values(TiposFactor).map((item) =>
          item.addProp("disabled", checkUltimoTipoOperador(item.key))
        )}
        value={tipoFactor}
        onChange={(e) => {
          const nuevoTipo = e.target.value ?? "";
          checkTipoOperador(nuevoTipo);
          setTipoFactor(nuevoTipo);
        }}
      />
    ),
    createCustomComponentItem(
      1,
      "n_f_operador",
      <CustomSelect
        label="Operador"
        options={Operadores}
        value={operador}
        onChange={createDefaultSetter({ setter: setOperador })}
        required={false}
        disabled={tipoFactor !== TiposFactor.OPERADOR.key}
      />
    ),
    createTextFieldItem({
      xs: 2,
      id: "n_f_numero",
      label: "Número",
      value: numero,
      setValue: createDefaultSetter({ setter: setNumero }),
      required: false,
      placeholder: "",
      disabled: tipoFactor !== TiposFactor.VALOR.key,
      type: "number",
    }),
    createCustomComponentItem(
      3,
      "n_f_parametro",
      <AutocompleteObject
        id="Parámetro"
        value={parametroTipo}
        optionId="cod_parametro"
        shape={shapeParametroTipo}
        options={parametros}
        optionLabel="nombre"
        onChange={(e, value) => {
          setParametroTipo(value ?? shapeParametroTipo);
        }}
        disabled={tipoFactor !== TiposFactor.PARAMETRO.key}
      />
    ),
  ]);

  const btnTest = (
    <BtnNuevo onClick={handleTest} texto="Evaluar" icon={false} />
  );

  const btnAdd = (
    <BoxCenter
      components={[
        <BtnNuevo onClick={handleCreate} texto="Agregar" />,
        <BtnCancelar onClick={() => setCreateFactor(false)} />,
      ]}
    />
  );

  const btnAddListItem = createCustomListItem("btn_add", [
    createCustomComponentItem(12, "n_f_botones", btnAdd),
  ]);

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
      btnTest
    );

  const factoresList = (
    <CustomList
      items={
        createFactor
          ? [...factoresListItem, nuevoFactorListItem, btnAddListItem]
          : factoresListItem
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

  return (
    <MainComponent
      components={[header, titulo, texto, factoresList, btnNuevo]}
    />
  );
}
