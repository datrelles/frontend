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
  TiposSeleccionTabla,
} from "../formulas/common/enum";
import {
  createDefaultSetter,
  createTableFeatures,
  createTableOptions,
} from "../formulas/common/generators";
import BtnNuevo from "../formulas/common/btn-nuevo";
import Tabla from "../formulas/common/tabla";

export default function PresupuestoCantidades() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );

  const columnasFijas = [
    {
      name: "cod_cliente",
      options: {
        display: "excluded",
      },
    },
    {
      name: "cliente",
      label: "Cliente",
    },
    {
      name: "cod_modelo",
      options: {
        display: "excluded",
      },
    },
    {
      name: "modelo",
      label: "Modelo",
    },
  ];

  const options = createTableOptions(
    undefined,
    undefined,
    TiposSeleccionTabla.NONE.key,
    undefined,
    undefined,
    createTableFeatures(false, false, false, false, false, false)
  );

  const [menus, setMenus] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [mesesProyeccion, setMesesProyeccion] = useState(
    DefaultMesesProyeccion
  );
  const [productoTabla, setProductoTabla] = useState([]);
  const [columnasTabla, setColumnasTabla] = useState(columnasFijas);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleProyectar = async () => {
    const columnasProyeccion = [
      {
        name: "ventas_cli",
        label: "Ventas Clientes",
      },
      {
        name: "ventas_mass",
        label: "Ventas MASSLINE",
      },
    ];
    const curYear = new Date().getFullYear();
    const iter = mesesProyeccion / 12;
    let producto = [];
    for (const modelo of modelos) {
      for (const cliente of clientes) {
        producto.push({
          cod_cliente: cliente.cod_cliente,
          cliente: cliente.agrupa_cliente
            ? cliente.nombre_agrupacion
            : cliente.nombre_imprime,
          cod_modelo: modelo.codigo,
          modelo: modelo.nombre,
        });
      }
    }
    console.log("prod mod cli", producto);
    let columnas = columnasFijas.map((item) => ({ ...item }));
    for (let i = 1; i <= iter; i++) {
      const proyYear = curYear + i - 1;
      for (let mes = 1; mes <= 12; mes++) {
        const nuevasColumnas = columnasProyeccion.map((col) => ({
          name: `${col.name}_${proyYear}_${mes}`,
          label: `${col.label} ${proyYear} ${mes}`,
        }));
        console.log("new cols", nuevasColumnas);
        console.log("col a", columnas);
        columnas = columnas.concat(nuevasColumnas);
        console.log("col b", columnas);
        console.log("prod a", producto);
        producto = producto.map((fila) => {
          const filaActualizada = { ...fila };
          nuevasColumnas.forEach((col) => {
            filaActualizada[col.name] = "-";
          });
          return filaActualizada;
        });
        console.log("prod b", producto);
      }
    }
    setColumnasTabla(columnas);
    setProductoTabla(producto);
  };

  async function getClientesModelos() {
    try {
      const [resClientes, resModelos] = await Promise.all([
        APIService.getClientesProyecciones(),
        APIService.getModelosMotosProyecciones(),
      ]);
      setClientes(resClientes);
      setModelos(resModelos);
    } catch (err) {
      toast.error(err.message);
    }
  }

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

  const tabla = (
    <Tabla
      title="Tabla"
      data={productoTabla}
      columns={columnasTabla}
      options={options}
    />
  );

  useEffect(() => {
    document.title = "Presupuesto de Cantidades";
    getMenus();
    getClientesModelos();
  }, []);

  return <MainComponent components={[header, selectMeses, btnNuevo, tabla]} />;
}
