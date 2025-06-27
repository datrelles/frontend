import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import MainComponent from "./common/main-component";
import Header from "./common/header";
import { toast } from "react-toastify";

export default function SellOut({}) {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );

  const [menus, setMenus] = useState([]);
  const [registros, setRegistros] = useState([]);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getRegistros = async () => {
    try {
      setRegistros(await APIService.getSellOut());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const header = <Header menus={menus} modulos={false} />;

  useEffect(() => {
    document.title = "Sell Out";
    getMenus();
    getRegistros();
  }, []);

  return <MainComponent components={[header]} />;
}
