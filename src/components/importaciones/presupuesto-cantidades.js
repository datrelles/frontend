import { toast } from "react-toastify";
import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import Header from "../formulas/common/header";
import MainComponent from "../formulas/common/main-component";
import CustomSelect from "../formulas/common/custom-select";
import {
  DefaultMesesProyeccion,
  Enum,
  Meses,
  MesesProyeccion,
} from "../formulas/common/enum";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createEmptyItem,
  createMTColumn,
  createOnUpdateCell,
} from "../formulas/common/generators";
import BtnNuevo from "../formulas/common/btn-nuevo";
import MultiLevelTable from "../formulas/common/multilevel-table";
import CustomGrid from "../formulas/common/custom-grid";

const columnasProyeccion = [
  createMTColumn({ header: "Ventas Clientes", field: "ventas_cli" }),
  createMTColumn({ header: "Ventas MASSLINE", field: "ventas_mass" }),
];

const getFlatDataColumns = (headerDefs) => {
  let flatColumns = [];
  headerDefs.forEach((def) => {
    if (def.field) {
      if (!def.hidden) {
        flatColumns.push(def);
      }
    } else if (def.children) {
      flatColumns = flatColumns.concat(getFlatDataColumns(def.children));
    }
  });
  return flatColumns;
};

const obtenerFilasConsolidadas = (columnas, filas) => {
  let consolidados = filas.filter((fila) => fila.es_consolidado);
  const filasDatos = filas.filter((fila) => !fila.es_consolidado);
  consolidados = consolidados.map((con) => {
    const conActualizado = { ...con };
    getFlatDataColumns(columnas)
      .filter((col) => col.field !== "cliente" && col.field !== "modelo")
      .forEach((col) => {
        conActualizado[col.field] = filasDatos
          .filter((fila) => fila.cod_modelo === con.cod_modelo)
          .reduce((acum, actual) => acum + parseFloat(actual[col.field]), 0);
      });
    return conActualizado;
  });
  return filas.map((fila) => {
    if (fila.es_consolidado) {
      return consolidados.find((con) => con.cod_modelo === fila.cod_modelo);
    } else {
      return fila;
    }
  });
};

export default function PresupuestoCantidades() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );

  const [menus, setMenus] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [mesesProyeccion, setMesesProyeccion] = useState(
    DefaultMesesProyeccion
  );
  const [columnasTabla, setColumnasTabla] = useState([]);
  const columnasTablaRef = useRef(columnasTabla);
  const [filasTabla, setFilasTabla] = useState([]);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateCell = createOnUpdateCell(
    (newValue, rowData, columnDefinition) => {
      setFilasTabla((prev) => {
        const filasActualizadas = prev.map((fila) => ({
          ...fila,
          ...(fila.cod_cliente === rowData.cod_cliente &&
          fila.cod_modelo === rowData.cod_modelo
            ? { [columnDefinition.field]: newValue }
            : {}),
        }));
        return obtenerFilasConsolidadas(
          columnasTablaRef.current,
          filasActualizadas
        );
      });
    }
  );

  const handleProyectar = () => {
    const curYear = new Date().getFullYear();
    const iter = mesesProyeccion / 12;
    let filas = [];
    for (const modelo of modelos) {
      for (const cliente of clientes) {
        filas.push({
          cod_cliente: cliente.cod_cliente,
          cliente: cliente.agrupa_cliente
            ? cliente.nombre_agrupacion
            : cliente.nombre_imprime,
          cod_modelo: modelo.codigo,
          modelo: modelo.nombre,
        });
      }
      filas.push({
        es_consolidado: true,
        es_editable: false,
        cod_modelo: modelo.codigo,
        modelo: modelo.nombre,
        cliente: "CONSOLIDADO",
      });
    }
    let columnas = [
      createMTColumn({ field: "cod_cliente", hidden: true }),
      createMTColumn({ header: "Cliente", field: "cliente" }),
      createMTColumn({ header: "Modelo", field: "modelo" }),
      createMTColumn({ field: "cod_modelo", hidden: true }),
    ];
    for (let i = 1; i <= iter; i++) {
      const proyYear = curYear + i - 1;
      for (let mes = 1; mes <= 12; mes++) {
        const nuevasColumnas = columnasProyeccion.map((col) =>
          createMTColumn({
            header: `${col.header} ${proyYear}`,
            field: `${col.field}_${proyYear}_${mes}`,
            onUpdateCell: handleUpdateCell,
            context: { proyYear, mes },
          })
        );
        const colGrupo = createMTColumn({
          header: `${Enum.getLabel(Meses, `${mes}`)}-${proyYear}`,
          children: nuevasColumnas,
        });
        columnas = columnas.concat(colGrupo);
        filas = filas.map((fila) => {
          const filaActualizada = { ...fila };
          nuevasColumnas.forEach((col) => {
            if (fila.es_consolidado) {
              filaActualizada[col.field] = 0;
            } else {
              filaActualizada[col.field] = Math.floor(Math.random() * 1000 - 1); //"-" al inicio y en caso de no tener valor
            }
          });
          return filaActualizada;
        });
      }
    }
    setColumnasTabla(columnas);
    setFilasTabla(obtenerFilasConsolidadas(columnas, filas));
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

  const header = <Header menus={menus} modulos={false} />;

  const selectMeses = (
    <CustomSelect
      label="Meses proyección"
      options={MesesProyeccion}
      value={mesesProyeccion}
      onChange={createDefaultSetter(setMesesProyeccion)}
    />
  );

  const btnProyectar = (
    <BtnNuevo onClick={handleProyectar} texto="Proyectar" icon={false} />
  );

  const itemsOpcionesProyeccion = [
    createCustomComponentItem(2, "meses", selectMeses),
    createCustomComponentItem(2, "btnProyectar", btnProyectar),
    createEmptyItem(8, "relleno_proyeccion"),
  ];

  const opcionesProyeccion = <CustomGrid items={itemsOpcionesProyeccion} />;

  const tabla = (
    <div
      style={{
        maxWidth: "95%",
        margin: "20px auto",
        border: "1px solid #ccc",
        padding: "15px",
      }}
    >
      <MultiLevelTable
        data={filasTabla}
        columns={columnasTabla}
        fixedColumnsCount={2}
      />
    </div>
  );

  useEffect(() => {
    document.title = "Presupuesto de Cantidades";
    getMenus();
    getClientesModelos();
  }, []);

  useEffect(() => {
    columnasTablaRef.current = columnasTabla;
  }, [columnasTabla]);

  return <MainComponent components={[header, opcionesProyeccion, tabla]} />;
}
