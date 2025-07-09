import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
import Header from "../../components/formulas/common/header";
import MainComponent from "../../components/formulas/common/main-component";
import { toast } from "react-toastify";

export default function RegistrarPedido() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [menus, setMenus] = useState([]);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const header = <Header menus={menus} />;

  useEffect(() => {
    document.title = "Procesos";
    getMenus();
  }, []);

  return <MainComponent components={[header]} />;
}
