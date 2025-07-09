import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
import Header from "../../components/formulas/common/header";
import MainComponent from "../../components/formulas/common/main-component";
import { toast } from "react-toastify";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createTextFieldItem,
} from "../formulas/common/generators";
import AutocompleteObject from "../formulas/common/autocomplete-objects";
import CustomGrid from "../formulas/common/custom-grid";
import LoadingModal from "../formulas/common/loading-modal";

const shapePolitica = {
  cod_politica: "",
  nombre: "Seleccione",
};
const shapeVendedor = {
  cod_persona_vendor: "",
  nombre: "Seleccione",
};
const shapeCliente = {
  cod_persona: "",
  nombre: "Seleccione",
};

export default function RegistrarPedido() {
  const {
    jwt,
    userShineray,
    enterpriseShineray,
    systemShineray,
    branchShineray,
  } = useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [menus, setMenus] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [politicas, setPoliticas] = useState([]);
  const [politica, setPolitica] = useState(shapePolitica);
  const [vendedores, setVendedores] = useState([]);
  const [vendedor, setVendedor] = useState(shapeVendedor);
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(shapeCliente);
  const [cuotas, setCuotas] = useState(0);
  const [interes, setInteres] = useState(0);
  const [envio, setEnvio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [zona, setZona] = useState("");
  const [credito, setCredito] = useState(0);
  const [disponible, setDisponible] = useState(0);
  const [categoria, setCategoria] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [carteraVencida, setCarteraVencida] = useState(0);

  const [observacion, setObservacion] = useState("");

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPoliticas = async () => {
    try {
      setPoliticas(await APIService.getPoliticas(/*branchShineray*/));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getVendedores = async () => {
    try {
      setVendedores(await APIService.getVendedores(/*branchShineray*/));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getClientes = async (politica) => {
    try {
      setCargando(true);
      setClientes(await APIService.getClientes(branchShineray, politica));
      setCargando(false);
    } catch (err) {
      setCargando(false);
      toast.error(err.message);
    }
  };

  const autocompletePoliticas = (
    <AutocompleteObject
      id="Política"
      value={politica}
      optionId="cod_politica"
      shape={shapePolitica}
      options={politicas}
      optionLabel="nombre"
      onChange={(e, value) => {
        setPolitica(value ?? shapePolitica);
      }}
    />
  );

  const autocompleteVendedores = (
    <AutocompleteObject
      id="Agente"
      value={vendedor}
      optionId="cod_persona_vendor"
      shape={shapeVendedor}
      options={vendedores}
      optionLabel="nombre"
      onChange={(e, value) => {
        setVendedor(value ?? shapeVendedor);
      }}
    />
  );

  const autocompleteClientes = (
    <AutocompleteObject
      id="Cliente"
      value={cliente}
      optionId="cod_persona"
      shape={shapeCliente}
      options={clientes}
      optionLabel="nombre"
      onChange={(e, value) => {
        setCliente(value ?? shapeCliente);
      }}
      disabled={politica.cod_politica === ""}
    />
  );

  const createOrderItems = [
    createCustomComponentItem(4, "politica", autocompletePoliticas),
    createCustomComponentItem(4, "agente", autocompleteVendedores),
    createCustomComponentItem(4, "cliente", autocompleteClientes),
    createTextFieldItem({
      xs: 6,
      id: "cuotas",
      label: "Cuotas",
      value: cuotas,
      setValue: createDefaultSetter({ setter: setCuotas }),
      type: "number",
    }),
    createTextFieldItem({
      xs: 6,
      id: "interes",
      label: "% Interés",
      value: interes,
      setValue: createDefaultSetter({ setter: setInteres }),
      type: "number",
    }),
    createTextFieldItem({
      xs: 6,
      id: "direccion",
      label: "Dirección de envío",
      value: envio,
      setValue: createDefaultSetter({ setter: setEnvio }),
    }),
    createTextFieldItem({
      xs: 2,
      id: "telefono",
      label: "Teléfono",
      value: telefono,
      setValue: createDefaultSetter({ setter: setTelefono }),
    }),
    createTextFieldItem({
      xs: 2,
      id: "ciudad",
      label: "Ciudad",
      value: ciudad,
      setValue: createDefaultSetter({ setter: setCiudad }),
    }),
    createTextFieldItem({
      xs: 2,
      id: "zona",
      label: "Zona geográfica",
      value: zona,
    }),
    createTextFieldItem({
      xs: 2,
      id: "credito",
      label: "Cupo crédito",
      value: credito,
    }),
    createTextFieldItem({
      xs: 2,
      id: "saldo",
      label: "Saldo actual",
      value: disponible,
    }),
    createTextFieldItem({
      xs: 2,
      id: "categoria",
      label: "Categoría",
      value: categoria,
    }),
    createTextFieldItem({
      xs: 2,
      id: "tipo",
      label: "Tipo cliente",
      value: tipoCliente,
    }),
    createTextFieldItem({
      xs: 3,
      id: "cartera_vencida",
      label: "Cartera Vencida",
      value: carteraVencida,
    }),

    createTextFieldItem({
      xs: 12,
      id: "observacion",
      label: "Observaciones",
      value: observacion,
      setValue: createDefaultSetter({ setter: setObservacion }),
      required: false,
      rows: 3,
    }),
  ];

  const modalCargando = <LoadingModal esVisible={cargando} />;

  const header = <Header menus={menus} />;

  const createOrderContent = <CustomGrid items={createOrderItems} />;

  useEffect(() => {
    document.title = "Registrar pedido";
    getMenus();
    getPoliticas();
    getVendedores();
  }, []);

  useEffect(() => {
    setClientes([]);
    if (politica.cod_politica !== "") {
      getClientes(politica.cod_politica);
    }
  }, [politica]);

  useEffect(() => {
    if (cliente.cod_persona !== "") {
      APIService.getCliente(
        branchShineray,
        politica.cod_politica,
        cliente.cod_persona
      )
        .then((cliente) => {
          setEnvio(cliente.direccion_envio);
          setTelefono(cliente.telefono);
          setCiudad(cliente.ciudad);
          setZona(cliente.zona_geografica);
          setCredito(cliente.cupo_credito);
          setDisponible(cliente.cupo_disponible);
          setCategoria(cliente.cod_cat_cliente);
          setTipoCliente(cliente.cod_tipo_clienteh);
          setCarteraVencida(cliente.cartera_vencida);
        })
        .catch((err) =>
          toast.error("Ocurrió un error al consultar el cliente")
        );
    }
  }, [cliente]);

  return (
    <MainComponent components={[modalCargando, header, createOrderContent]} />
  );
}
