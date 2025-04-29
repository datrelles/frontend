import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  formatearEstado,
  formatearFechaHora,
} from "../../helpers/modulo-formulas";
import Header from "./common/header";
import Tabla from "./common/tabla";
import BtnNuevo from "./common/btn-nuevo";
import CustomDialog from "./common/custom-dialog";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createTableOptions,
  createTextFieldItem,
} from "./common/generators";
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

  const getFormulas = async () => {
    try {
      setFormulas(await APIService.getFormulas());
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
      .catch((err) => toast.error(err.message));
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
      .catch((err) => toast.error(err.message));
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
    const row = formulas.find((item) => item.cod_formula === rowData[0]);
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
        customBodyRender: (value) => formatearFechaHora(value),
      },
    },
  ];

  const options = createTableOptions(handleRowClick, handleDelete);

  const checkboxEstado = (
    <Check
      label="Activa"
      checked={estado}
      onChange={createDefaultSetter(setEstado, true)}
    />
  );

  const createContentItems = [
    createTextFieldItem(
      6,
      "cod_formula",
      "Código",
      codFormula,
      createDefaultSetter(setCodFormula),
      true,
      "FORMU###"
    ),
    createTextFieldItem(
      6,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      createDefaultSetter(setObservaciones),
      false
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      createDefaultSetter(setDefinicion)
    ),
  ];

  const updateContentItems = [
    createTextFieldItem(6, "cod_formula", "Código", codFormula),
    createTextFieldItem(
      6,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createTextFieldItem(
      12,
      "observaciones",
      "Observaciones",
      observaciones,
      createDefaultSetter(setObservaciones),
      false
    ),
    createTextFieldItem(
      12,
      "definicion",
      "Definición",
      definicion,
      createDefaultSetter(setDefinicion)
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
