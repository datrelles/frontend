import { toast } from "react-toastify";
import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import Header from "../formulas/common/header";
import MainComponent from "../formulas/common/main-component";
import CustomSelect from "../formulas/common/custom-select";
import {
  CARACTER_RELLENO,
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
  createTextFieldItem,
} from "../formulas/common/generators";
import BtnNuevo from "../formulas/common/btn-nuevo";
import BtnCancelar from "../formulas/common/btn-cancelar";
import MultiLevelTable, {
  getFlatDataColumns,
} from "../formulas/common/multilevel-table";
import CustomGrid from "../formulas/common/custom-grid";
import { validarTipoRetornoYConvertir } from "../../helpers/modulo-formulas";
import AutocompleteObject from "../formulas/common/autocomplete-objects";
import LoadingModal from "../formulas/common/loading-modal";

const COD_PROCESO_PRESUP_CANT = "PRESCANT";
const shapeVersion = {
  cod_version: "",
  nombre: "Seleccione",
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
          .reduce((acum, actual) => {
            let valor = 0;
            try {
              valor = validarTipoRetornoYConvertir(
                TiposRetorno.NUMERO,
                actual[col.field]
              );
            } catch (err) {}
            return acum + valor;
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

  const [cargando, setCargando] = useState(false);
  const [crearNuevaVersion, setCrearNuevaVersion] = useState(false);
  const [nuevaVersion, setNuevaVersion] = useState("");
  const [versiones, setVersiones] = useState([]);
  const [version, setVersion] = useState(shapeVersion);
  const codVersionRef = useRef("");
  const [datosCargados, setDatosCargados] = useState(false);
  const [menus, setMenus] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [mesesProyeccion, setMesesProyeccion] = useState(
    DefaultMesesProyeccion
  );
  const [parametrosProceso, setParametrosProceso] = useState([]);
  const [proyeccionCargada, setProyeccionCargada] = useState(false);
  const [columnasTabla, setColumnasTabla] = useState([]);
  const [filasTabla, setFilasTabla] = useState([]);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCrearVersion = (e) => {
    e.preventDefault();
    APIService.createVersion({
      nombre: nuevaVersion,
    })
      .then((res) => {
        toast.success(res);
        setNuevaVersion("");
        setCrearNuevaVersion(false);
        getVersiones();
        setVersion(shapeVersion);
      })
      .catch((err) => toast.error(err.message));
  };

  const getVersiones = async () => {
    try {
      setVersiones(await APIService.getVersiones());
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

  async function handleEliminarVersion() {
    const eliminar = window.confirm("¿Deseas eliminar la versión?");
    if (!eliminar) return;
    try {
      await APIService.deleteVersion(version.cod_version);
      setVersion(shapeVersion);
      getVersiones();
      toast.success("Versión eliminada");
    } catch (err) {
      toast.error(err.message);
    }
  }

  const handleUpdateCell = createOnUpdateCell({
    fn: (newValue, rowData, columnDefinition) => {
      setCargando(true);
      APIService.updateProyeccion(
        codVersionRef.current,
        COD_PROCESO_PRESUP_CANT,
        columnDefinition.context.cod_parametro,
        rowData.cod_modelo,
        rowData.cod_marca,
        rowData.cod_cliente,
        columnDefinition.context.anio,
        columnDefinition.context.mes,
        {
          numero: validarTipoRetornoYConvertir(TiposRetorno.NUMERO, newValue),
        }
      )
        .then((_) => {
          cargarProyeccion(codVersionRef.current);
        })
        .catch((err) => {
          setCargando(false);
          toast.error(err.message);
        });
    },
  });

  const getProyeccion = async (version) => {
    try {
      return await APIService.getProyeccion(version, COD_PROCESO_PRESUP_CANT);
    } catch (err) {
      toast.error(err.message);
      return;
    }
  };

  const proyectar = (anioInicio, mesInicio, anioFin, mesFin, datos) => {
    let filas = [];
    for (const modelo of modelos) {
      for (const cliente of clientes) {
        filas.push({
          cod_cliente: cliente.cod_cliente,
          cliente: cliente.agrupa_cliente
            ? cliente.nombre_agrupacion
            : cliente.nombre_imprime,
          cod_marca: modelo.codigo_marca,
          cod_modelo: modelo.codigo,
          modelo: modelo.nombre,
        });
      }
      filas.push({
        es_consolidado: true,
        es_editable: false,
        cod_marca: modelo.codigo_marca,
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
    for (let anio = anioInicio; anio <= anioFin; anio++) {
      const mesInicioAnio = anio === anioInicio ? mesInicio : 1;
      const mesFinAnio = anio === anioFin ? mesFin : 12;
      for (let mes = mesInicioAnio; mes <= mesFinAnio; mes++) {
        const nuevasColumnas = parametrosProceso.map((col) =>
          createMTColumn({
            header: `${col.header}`,
            field: `${col.field}_${anio}_${mes}`,
            bgColor: col.bgColor,
            onUpdateCell: handleUpdateCell,
            context: { cod_parametro: col.cod_parametro, anio, mes },
            es_vertical: col.es_vertical,
            tooltip: col.tooltip,
          })
        );
        const colGrupo = createMTColumn({
          header: `${Enum.getLabel(Meses, `${mes}`)}-${anio}`,
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
              const celda =
                datos.get(
                  `${col.context.cod_parametro}${filaActualizada.cod_modelo}${filaActualizada.cod_marca}${filaActualizada.cod_cliente}${col.context.anio}${col.context.mes}`
                ) || {};
              const valor = celda.numero || celda.texto || celda.fecha;
              filaActualizada[col.field] = valor || CARACTER_RELLENO;
            }
          });
          return filaActualizada;
        });
      }
    }
    setColumnasTabla(columnas);
    setFilasTabla(obtenerFilasConsolidadas(columnas, filas));
    setProyeccionCargada(true);
  };

  const cargarProyeccion = async (version) => {
    setCargando(true);
    const proyeccion = await getProyeccion(version);
    if (!proyeccion) {
      toast.warn("Proyección sin datos");
      setColumnasTabla([]);
      setFilasTabla([]);
      setProyeccionCargada(false);
      setCargando(false);
      return;
    }
    const { anio_inicio, mes_inicio, anio_fin, mes_fin, datos } = proyeccion;
    proyectar(
      anio_inicio,
      mes_inicio,
      anio_fin,
      mes_fin,
      new Map(
        datos.map((dato) => [
          `${dato.cod_parametro}${dato.cod_modelo_comercial}${dato.cod_marca}${dato.cod_cliente}${dato.anio}${dato.mes}`,
          dato,
        ])
      )
    );
    setProyeccionCargada(true);
    setCargando(false);
  };

  const handleProyectar = async () => {
    const anioInicio = new Date().getFullYear();
    const mesInicio = 1;
    const anioFin = anioInicio + Math.floor(mesesProyeccion / 12) - 1;
    const mesFin = 12;
    setCargando(true);
    try {
      await APIService.createProyeccion(
        version.cod_version,
        COD_PROCESO_PRESUP_CANT,
        {
          anio_inicio: anioInicio,
          mes_inicio: mesInicio,
          anio_fin: anioFin,
          mes_fin: mesFin,
        }
      );
      cargarProyeccion(version.cod_version);
    } catch (err) {
      setCargando(false);
      toast.error(err.message);
    }
  };

  const handleEliminarProyeccion = async () => {
    const eliminar = window.confirm("¿Deseas eliminar la proyección?");
    if (!eliminar) return;
    try {
      await APIService.deleteProyeccion(
        version.cod_version,
        COD_PROCESO_PRESUP_CANT
      );
      setColumnasTabla([]);
      setFilasTabla([]);
      setProyeccionCargada(false);
      toast.success("Proyección eliminada");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const header = <Header menus={menus} modulos={false} />;

  const btnNuevaVersion = (
    <BtnNuevo
      onClick={() => {
        setCrearNuevaVersion(true);
      }}
      texto="Nueva versión"
      disabled={cargando}
    />
  );

  const btnCancelarVersion = (
    <BtnCancelar
      onClick={() => {
        setCrearNuevaVersion(false);
      }}
    />
  );

  const autocompleteVersiones = (
    <AutocompleteObject
      id="Versión"
      disabled={cargando}
      value={version}
      optionId="cod_version"
      shape={shapeVersion}
      options={versiones}
      optionLabel="nombre"
      onChange={(e, value) => {
        if (value) {
          setVersion(value);
          cargarProyeccion(value.cod_version);
        } else {
          setProyeccionCargada(false);
          setVersion(value ?? shapeVersion);
        }
      }}
    />
  );

  const btnEliminarVersion = (
    <BtnNuevo
      onClick={handleEliminarVersion}
      texto="Eliminar"
      icon={false}
      disabled={cargando || version.cod_version === ""}
    />
  );

  const btnCrearVersion = (
    <BtnNuevo
      onClick={handleCrearVersion}
      texto="Crear versión"
      icon={false}
      disabled={cargando || nuevaVersion === ""}
    />
  );

  const selectMeses = (
    <CustomSelect
      label="Meses proyección"
      options={MesesProyeccion}
      value={mesesProyeccion}
      onChange={createDefaultSetter(setMesesProyeccion)}
      disabled={cargando || proyeccionCargada}
    />
  );

  const btnProyectar = (
    <BtnNuevo
      onClick={handleProyectar}
      texto="Proyectar"
      icon={false}
      disabled={
        cargando ||
        !datosCargados ||
        version.cod_version === "" ||
        proyeccionCargada
      }
    />
  );

  const btnEliminarProyeccion = (
    <BtnNuevo
      onClick={handleEliminarProyeccion}
      texto="Eliminar"
      icon={false}
      disabled={cargando || !proyeccionCargada}
    />
  );

  const itemsCrearVersion = [
    createTextFieldItem(
      6,
      "nueva_version",
      "Nombre versión",
      nuevaVersion,
      createDefaultSetter(setNuevaVersion, undefined, true)
    ),
    createCustomComponentItem(2, "btnCrearVersion", btnCrearVersion),
    createCustomComponentItem(2, "btnCancelarVersion", btnCancelarVersion),
    createEmptyItem(2, "relleno_proyeccion"),
  ];

  const itemsOpcionesProyeccion = [
    createCustomComponentItem(2, "btnNuevaVersion", btnNuevaVersion),
    createCustomComponentItem(3, "autocomplete_version", autocompleteVersiones),
    createCustomComponentItem(1, "btnEliminarVersion", btnEliminarVersion),
    createCustomComponentItem(2, "meses", selectMeses),
    createCustomComponentItem(2, "btnProyectar", btnProyectar),
    createCustomComponentItem(
      2,
      "btnEliminarProyeccion",
      btnEliminarProyeccion
    ),
  ];

  const itemsProyeccion = [
    ...(crearNuevaVersion ? itemsCrearVersion : itemsOpcionesProyeccion),
  ];

  const opcionesProyeccion = <CustomGrid items={itemsProyeccion} />;

  const tabla = (
    <MultiLevelTable
      data={filasTabla}
      columns={columnasTabla}
      fixedColumnsCount={2}
    />
  );

  const modalCargando = <LoadingModal esVisible={cargando} />;

  useEffect(() => {
    document.title = "Presupuesto de Cantidades";
    getMenus();
    getVersiones();
    getDatosIniciales();
  }, []);

  useEffect(() => {
    codVersionRef.current = version.cod_version;
  }, [version]);

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

  return (
    <MainComponent
      components={[header, opcionesProyeccion, tabla, modalCargando]}
    />
  );
}
