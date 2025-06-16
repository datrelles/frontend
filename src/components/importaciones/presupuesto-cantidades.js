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
  TiposRetorno,
} from "../formulas/common/enum";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createEmptyItem,
  createMTColumn,
  createOnUpdateCell,
} from "../formulas/common/generators";
import BtnNuevo from "../formulas/common/btn-nuevo";
import MultiLevelTable, {
  getFlatDataColumns,
} from "../formulas/common/multilevel-table";
import CustomGrid from "../formulas/common/custom-grid";
import { validarTipoRetornoYConvertir } from "../../helpers/modulo-formulas";

const COD_PROCESO_PRESUP_CANT = "PRESCANT";

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
          .reduce((acum, actual) => {
            try {
              return (
                acum +
                validarTipoRetornoYConvertir(
                  TiposRetorno.NUMERO,
                  actual[col.field]
                )
              );
            } catch (err) {
              return 0;
            }
          }, 0);
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

  const [datosCargados, setDatosCargados] = useState(false);
  const [menus, setMenus] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [mesesProyeccion, setMesesProyeccion] = useState(
    DefaultMesesProyeccion
  );
  const [parametrosProceso, setParametrosProceso] = useState([]);
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

  async function getDatosIniciales() {
    try {
      const [resClientes, resModelos, resParametrosProceso] = await Promise.all(
        [
          APIService.getClientesProyecciones(),
          APIService.getModelosMotosProyecciones(),
          APIService.getParametrosPorProceso(COD_PROCESO_PRESUP_CANT),
        ]
      );
      setClientes(resClientes);
      setModelos(resModelos);
      const parametrosProceso = resParametrosProceso
        .filter((par) => par.estado && par.parametro.estado)
        .map((par) => ({
          ...par,
          bgColor: par.parametro.color,
          header: par.parametro.nombre,
          field: par.cod_parametro,
          tooltip: par.parametro.descripcion,
        }));
      setParametrosProceso(parametrosProceso);
    } catch (err) {
      toast.error(err.message);
    }
  }

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
      createMTColumn({
        header: "Cliente",
        field: "cliente",
        es_vertical: false,
      }),
      createMTColumn({ field: "cod_modelo", hidden: true }),
      createMTColumn({ header: "Modelo", field: "modelo", es_vertical: false }),
    ];
    for (let i = 1; i <= iter; i++) {
      const proyYear = curYear + i - 1;
      for (let mes = 1; mes <= 12; mes++) {
        const nuevasColumnas = parametrosProceso.map((col) =>
          createMTColumn({
            header: `${col.header}`,
            field: `${col.field}_${proyYear}_${mes}`,
            bgColor: col.bgColor,
            onUpdateCell: handleUpdateCell,
            context: { proyYear, mes },
            es_vertical: col.es_vertical,
            tooltip: col.tooltip,
          })
        );
        const colGrupo = createMTColumn({
          header: `${Enum.getLabel(Meses, `${mes}`)}-${proyYear}`,
          children: nuevasColumnas,
          es_vertical: false,
        });
        columnas = columnas.concat(colGrupo);
        filas = filas.map((fila) => {
          const filaActualizada = { ...fila };
          nuevasColumnas.forEach((col) => {
            if (fila.es_consolidado) {
              filaActualizada[col.field] = 0;
            } else {
              filaActualizada[col.field] = "-";
            }
          });
          return filaActualizada;
        });
      }
    }
    setColumnasTabla(columnas);
    setFilasTabla(obtenerFilasConsolidadas(columnas, filas));
  };

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
    <BtnNuevo
      onClick={handleProyectar}
      texto="Proyectar"
      icon={false}
      disabled={!datosCargados}
    />
  );

  const itemsOpcionesProyeccion = [
    createCustomComponentItem(2, "meses", selectMeses),
    createCustomComponentItem(2, "btnProyectar", btnProyectar),
    createEmptyItem(8, "relleno_proyeccion"),
  ];

  const opcionesProyeccion = <CustomGrid items={itemsOpcionesProyeccion} />;

  const tabla = (
    <MultiLevelTable
      data={filasTabla}
      columns={columnasTabla}
      fixedColumnsCount={2}
    />
  );

  useEffect(() => {
    document.title = "Presupuesto de Cantidades";
    getMenus();
    getDatosIniciales();
  }, []);

  useEffect(() => {
    columnasTablaRef.current = columnasTabla;
  }, [columnasTabla]);

  useEffect(() => {
    if (
      clientes.length > 0 &&
      modelos.length > 0 &&
      parametrosProceso.length > 0
    ) {
      setDatosCargados(true);
    } else {
      setDatosCargados(false);
    }
  }, [clientes, modelos, parametrosProceso]);

  return <MainComponent components={[header, opcionesProyeccion, tabla]} />;
}
