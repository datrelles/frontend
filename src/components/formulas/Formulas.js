import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import { formatearEstado, formatearFecha } from "../../helpers/modulo-formulas";
import Header from "./common/header";
import Tabla from "./common/tabla";
import BtnNuevo from "./common/btn-nuevo";
import CustomDialog from "./common/custom-dialog";
import {
  createCustomComponentItem,
  createTextFieldItem,
} from "./common/form-generators";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import MainComponent from "./common/main-component";

export default function Formulas() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [formulas, setFormulas] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codFormula, setCodFormula] = useState("");
  const [nombre, setNombre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState(true);
  const [definicion, setDefinicion] = useState("");

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createFormula({
      empresa: enterpriseShineray,
      cod_formula: codFormula,
      nombre,
      observaciones,
      definicion,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodFormula("");
        setNombre("");
        setObservaciones("");
        setEstado(true);
        setDefinicion("");
      })
      .catch((err) => toast.error(err.mensaje));
  };

  const getFormulas = async () => {
    try {
      setFormulas(await APIService.getFormulas());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateFormula(codFormula, {
      nombre,
      estado,
      observaciones: observaciones,
      definicion,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdate(false);
        setCodFormula("");
        setNombre("");
        setObservaciones("");
        setEstado(true);
        setDefinicion("");
      })
      .catch((err) => toast.error(err.mensaje));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar la fórmula?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = formulas[deletedRowIndex];
    const newFormulas = formulas.filter(
      (_, index) => index !== deletedRowIndex
    );
    setFormulas(newFormulas);
    APIService.deleteFormula(deletedRowValue.cod_formula)
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getFormulas();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    const row = formulas.filter((item) => item.cod_formula === rowData[0])[0];
    setCodFormula(row.cod_formula);
    setNombre(row.nombre);
    setEstado(row.estado === 1);
    setDefinicion(row.definicion);
    setObservaciones(row.observaciones ?? "");
    handleClickOpenUpdate();
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodFormula("");
    setNombre("");
    setObservaciones("");
    setEstado(true);
    setDefinicion("");
  };

  const handleClickCloseCreate = () => {
    setOpenCreate(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const columns = [
    {
      name: "cod_formula",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "definicion",
      label: "Definición",
    },
    {
      name: "observaciones",
      label: "Observaciones",
    },
    {
      name: "estado",
      label: "Estado",
      options: {
        customBodyRender: (value) => formatearEstado(value, "a"),
      },
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: {
        customBodyRender: (value) => formatearFecha(value),
      },
    },
  ];

  const options = {
    responsive: "standard",
    selectableRows: "single",
    onRowClick: handleRowClick,
    onRowsDelete: handleDelete,
    textLabels: {
      body: {
        noMatch: "Lo siento, no se encontraron registros",
        toolTip: "Ordenar",
        columnHeaderTooltip: (column) => `Ordenar por ${column.label}`,
      },
      pagination: {
        next: "Siguiente",
        previous: "Anterior",
        rowsPerPage: "Filas por página:",
        displayRows: "de",
      },
      toolbar: {
        search: "Buscar",
        downloadCsv: "Descargar CSV",
        print: "Imprimir",
        viewColumns: "Ver columnas",
        filterTable: "Filtrar tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "REINICIAR",
      },
      viewColumns: {
        title: "Mostrar columnas",
        titleAria: "Mostrar/Ocultar columnas de tabla",
      },
      selectedRows: {
        text: "fila(s) seleccionada(s)",
        delete: "Borrar",
        deleteAria: "Borrar fila seleccionada",
      },
    },
  };

  const checkboxEstado = (
    <Check label="Activa" checked={estado} setChecked={setEstado} />
  );

  const createContentItems = [
    createTextFieldItem(
      6,
      "cod_formula",
      "Código",
      codFormula,
      setCodFormula,
      true,
      "FORMU###"
    ),
    createTextFieldItem(6, "nombre", "Nombre", nombre, setNombre),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      setObservaciones
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      setDefinicion
    ),
  ];

  const updateContentItems = [
    createTextFieldItem(6, "cod_formula", "Código", codFormula),
    createTextFieldItem(6, "nombre", "Nombre", nombre, setNombre),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      setObservaciones
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      setDefinicion
    ),
    createCustomComponentItem(12, "checkboxEstado", checkboxEstado),
  ];

  const createContent = <CustomGrid items={createContentItems} />;

  const updateContent = <CustomGrid items={updateContentItems} />;

  const header = <Header menus={menus} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} />;

  const tabla = (
    <Tabla
      title="Fórmulas"
      data={formulas}
      columns={columns}
      options={options}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Fórmula"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Fórmula"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
      handleConfirm={handleUpdate}
      confirmText="Actualizar"
    />
  );

  useEffect(() => {
    document.title = "Fórmulas";
    getMenus();
    getFormulas();
  }, []);

  useEffect(() => {
    getFormulas();
  }, [openCreate, openUpdate]);

  return (
    <MainComponent
      components={[header, btnNuevo, tabla, createDialog, updateDialog]}
    />
  );
}
