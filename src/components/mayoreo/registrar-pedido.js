import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
import Header from "../../components/formulas/common/header";
import MainComponent from "../../components/formulas/common/main-component";
import { toast } from "react-toastify";
import { createCustomComponentItem } from "../formulas/common/generators";
import AutocompleteObject from "../formulas/common/autocomplete-objects";
import CustomGrid from "../formulas/common/custom-grid";

const shapePolitica = {
  cod_politica: "",
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
  const [politicas, setPoliticas] = useState([]);
  const [politica, setPolitica] = useState(shapePolitica);

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
      required={false}
    />
  );

  const createOrderItems = [
    createCustomComponentItem(4, "politica", autocompletePoliticas),
  ];

  const header = <Header menus={menus} />;

  const createOrderContent = <CustomGrid items={createOrderItems} />;

  useEffect(() => {
    document.title = "Registrar pedido";
    getMenus();
    getPoliticas();
  }, []);

  return <MainComponent components={[header, createOrderContent]} />;
}
