import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  formatearEstado,
  formatearFechaHora,
} from "../../helpers/modulo-formulas";
import Header from "./common/header";
import BtnNuevo from "./common/btn-nuevo";
import Tabla from "./common/tabla";
import CustomDialog from "./common/custom-dialog";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createFunctionCustomBodyRender,
  createTableOptions,
  createTextFieldItem,
} from "./common/generators";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import MainComponent from "./common/main-component";

export default function Procesos() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [procesos, setProcesos] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codProceso, setCodProceso] = useState("");
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState(true);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createProceso({
      cod_proceso: codProceso,
      nombre,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodProceso("");
        setNombre("");
        setEstado(true);
      })
      .catch((err) => toast.error(err.message));
  };

  const getProcesos = async () => {
    try {
      setProcesos(await APIService.getProcesos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateProceso(codProceso, {
      nombre,
      estado,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdate(false);
        setCodProceso("");
        setNombre("");
        setEstado(true);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar el proceso?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = procesos[deletedRowIndex];
    const newProcesos = procesos.filter(
      (proceso, index) => index !== deletedRowIndex
    );
    setProcesos(newProcesos);
    APIService.deleteProceso(deletedRowValue.cod_proceso)
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getProcesos();
      });
    return true;
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodProceso("");
    setNombre("");
    setEstado(true);
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

  const handleRowClick = (rowData, rowMeta) => {
    const row = procesos.find((item) => item.cod_proceso === rowData[0]);
    setCodProceso(row.cod_proceso);
    setNombre(row.nombre);
    setEstado(row.estado === 1);
    handleClickOpenUpdate();
  };

  const columns = [
    {
      name: "cod_proceso",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "estado",
      label: "Estado",
      options: createFunctionCustomBodyRender(formatearEstado),
    },
    {
      name: "audit_fecha_ing",
      label: "Fecha creación",
      options: createFunctionCustomBodyRender(formatearFechaHora),
    },
  ];

  const options = createTableOptions({
    onRowClick: handleRowClick,
    onRowsDelete: handleDelete,
  });

  const checkboxEstado = (
    <Check
      label="Activo"
      checked={estado}
      onChange={createDefaultSetter({ setter: setEstado, isCheck: true })}
    />
  );

  const createContentItems = [
    createTextFieldItem({
      xs: 4,
      id: "cod_proceso",
      label: "Código",
      value: codProceso,
      setValue: createDefaultSetter({ setter: setCodProceso, toUpper: true }),
      placeholder: "PROCE###",
    }),
    createTextFieldItem({
      xs: 8,
      id: "nombre",
      label: "Nombre",
      value: nombre,
      setValue: createDefaultSetter({ setter: setNombre }),
    }),
  ];

  const updateContentItems = [
    createTextFieldItem({
      xs: 4,
      id: "cod_proceso",
      label: "Código",
      value: codProceso,
    }),
    createTextFieldItem({
      xs: 8,
      id: "nombre",
      label: "Nombre",
      value: nombre,
      setValue: createDefaultSetter({ setter: setNombre }),
    }),
    createCustomComponentItem(12, "checkboxEstado", checkboxEstado),
  ];

  const createContent = <CustomGrid items={createContentItems} />;

  const updateContent = <CustomGrid items={updateContentItems} />;

  const header = <Header menus={menus} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} />;

  const tabla = (
    <Tabla
      title="Procesos"
      data={procesos}
      columns={columns}
      options={options}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Proceso"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Proceso"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
      handleConfirm={handleUpdate}
      confirmText="Actualizar"
    />
  );

  useEffect(() => {
    document.title = "Procesos";
    getMenus();
    getProcesos();
  }, []);

  useEffect(() => {
    getProcesos();
  }, [openCreate, openUpdate]);

  return (
    <MainComponent
      components={[header, btnNuevo, tabla, createDialog, updateDialog]}
    />
  );
}
