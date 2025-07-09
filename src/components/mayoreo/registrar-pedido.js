import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
import Header from "../../components/formulas/common/header";
import MainComponent from "../../components/formulas/common/main-component";
import { toast } from "react-toastify";
import { createCustomComponentItem } from "../formulas/common/generators";
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

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPoliticas = async () => {
    try {
      setPoliticas(await APIService.getPoliticas(branchShineray));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getVendedores = async () => {
    try {
      setVendedores(await APIService.getVendedores(branchShineray));
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

  return (
    <MainComponent components={[modalCargando, header, createOrderContent]} />
  );
}
