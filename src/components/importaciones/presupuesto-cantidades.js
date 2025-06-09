import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import Header from "../formulas/common/header";
import MainComponent from "../formulas/common/main-component";
import CustomSelect from "../formulas/common/custom-select";
import {
  DefaultMesesProyeccion,
  MesesProyeccion,
} from "../formulas/common/enum";
import { createDefaultSetter } from "../formulas/common/generators";
import BtnNuevo from "../formulas/common/btn-nuevo";

export default function PresupuestoCantidades() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [menus, setMenus] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mesesProyeccion, setMesesProyeccion] = useState(
    DefaultMesesProyeccion
  );

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleProyectar = async () => {
    console.log("handleProyectar");
  };

  const getClientesProyecciones = async () => {
    try {
      setClientes(await APIService.getClientesProyecciones());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const header = <Header menus={menus} />;

  const selectMeses = (
    <CustomSelect
      label="Meses proyección"
      options={MesesProyeccion}
      value={mesesProyeccion}
      onChange={createDefaultSetter(setMesesProyeccion)}
    />
  );

  const btnNuevo = (
    <BtnNuevo onClick={handleProyectar} texto="Proyectar" icon={false} />
  );

  const lista = (
    <ul>
      {clientes.map((cliente, index) => (
        <li key={index}>
          {cliente.agrupa_cliente
            ? cliente.nombre_agrupacion
            : cliente.nombre_imprime}
        </li>
      ))}
    </ul>
  );

  useEffect(() => {
    document.title = "Presupuesto de Cantidades";
    getMenus();
    getClientesProyecciones();
  }, []);

  return <MainComponent components={[header, selectMeses, btnNuevo, lista]} />;
}
