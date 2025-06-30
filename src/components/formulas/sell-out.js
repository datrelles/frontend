import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import MainComponent from "./common/main-component";
import Header from "./common/header";
import { toast } from "react-toastify";
import {
  createDefaultSetter,
  createTableOptions,
  createTextFieldItem,
} from "./common/generators";
import Tabla from "./common/tabla";
import CustomDialog from "./common/custom-dialog";
import CustomGrid from "./common/custom-grid";
import BtnNuevo from "./common/btn-nuevo";

export default function SellOut({}) {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );

  const [menus, setMenus] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [presupuestosTipoCli, setPresupuestosTipoCli] = useState([]);
  const [codCliente, setCodCliente] = useState("");
  const [codTipoCliente, setCodTipoCliente] = useState("");
  const [codModelo, setCodModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [unidades, setUnidades] = useState("");
  const [sellOut, setSellOut] = useState("");
  const [codLinea, setCodLinea] = useState("");
  const [codTipoLinea, setCodTipoLinea] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateTipoCli, setOpenCreateTipoCli] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openUpdateTipoCli, setOpenUpdateTipoCli] = useState(false);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPresupuestos = async () => {
    try {
      setPresupuestos(await APIService.getPresupuestos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPresupuestosTipoCli = async () => {
    try {
      setPresupuestosTipoCli(await APIService.getPresupuestosTipoCli());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createPresupuesto(codCliente, codModelo, anio, mes, {
      unidades,
      sell_out: sellOut,
      cod_linea: codLinea,
      cod_tipo_linea: codTipoLinea,
    })
      .then((res) => {
        toast.success(res);
        handleClickCloseCreate();
        getPresupuestos();
      })
      .catch((err) => toast.error(err.message));
  };

  const handleCreateTipoCli = (e) => {
    e.preventDefault();
    APIService.createPresupuestoTipoCli(codTipoCliente, codModelo, anio, mes, {
      unidades,
      sell_out: sellOut,
    })
      .then((res) => {
        toast.success(res);
        handleClickCloseCreateTipoCli();
        getPresupuestosTipoCli();
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updatePresupuesto(codCliente, codModelo, anio, mes, {
      unidades,
      sell_out: sellOut,
      cod_linea: codLinea,
      cod_tipo_linea: codTipoLinea,
    })
      .then((res) => {
        toast.success(res);
        handleClickCloseUpdate();
        getPresupuestos();
      })
      .catch((err) => toast.error(err.message));
  };

  const handleUpdateTipoCli = (e) => {
    e.preventDefault();
    APIService.updatePresupuestoTipoCli(codTipoCliente, codModelo, anio, mes, {
      unidades,
      sell_out: sellOut,
    })
      .then((res) => {
        toast.success(res);
        handleClickCloseUpdateTipoCli();
        getPresupuestosTipoCli();
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar el presupuesto?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = presupuestos[deletedRowIndex];
    const newItems = presupuestos.filter(
      (item, index) => index !== deletedRowIndex
    );
    setPresupuestos(newItems);
    APIService.deletePresupuesto(
      deletedRowValue.cod_cliente,
      deletedRowValue.cod_modelo,
      deletedRowValue.anio,
      deletedRowValue.mes
    )
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getPresupuestos();
      });
    return true;
  };

  const handleDeleteTipoCli = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar el presupuesto?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = presupuestosTipoCli[deletedRowIndex];
    const newItems = presupuestosTipoCli.filter(
      (item, index) => index !== deletedRowIndex
    );
    setPresupuestosTipoCli(newItems);
    APIService.deletePresupuestoTipoCli(
      deletedRowValue.cod_tipo_cliente,
      deletedRowValue.cod_modelo,
      deletedRowValue.anio,
      deletedRowValue.mes
    )
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getPresupuestosTipoCli();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    const item = presupuestos.find(
      (item) =>
        item.cod_cliente === rowData[0] &&
        item.cod_modelo === rowData[1] &&
        item.anio === rowData[2] &&
        item.mes === rowData[3]
    );
    setCodCliente(item.cod_cliente);
    setCodModelo(item.cod_modelo);
    setAnio(item.anio);
    setMes(item.mes);
    setUnidades(item.unidades);
    setSellOut(item.sell_out ?? "");
    setCodLinea(item.cod_linea ?? "");
    setCodTipoLinea(item.cod_tipo_linea ?? "");
    setOpenUpdate(true);
  };

  const handleRowClickTipoCli = (rowData, rowMeta) => {
    const item = presupuestosTipoCli.find(
      (item) =>
        item.cod_tipo_cliente === rowData[0] &&
        item.cod_modelo === rowData[1] &&
        item.anio === rowData[2] &&
        item.mes === rowData[3]
    );
    setCodTipoCliente(item.cod_tipo_cliente);
    setCodModelo(item.cod_modelo);
    setAnio(item.anio);
    setMes(item.mes);
    setUnidades(item.unidades);
    setSellOut(item.sell_out ?? "");
    setOpenUpdateTipoCli(true);
  };

  const handleClickCloseUpdate = () => {
    setOpenUpdate(false);
    setCodCliente("");
    setCodModelo("");
    setAnio("");
    setMes("");
    setUnidades("");
    setSellOut("");
    setCodLinea("");
    setCodTipoLinea("");
  };

  const handleClickCloseUpdateTipoCli = () => {
    setOpenUpdateTipoCli(false);
    setCodTipoCliente("");
    setCodModelo("");
    setAnio("");
    setMes("");
    setUnidades("");
    setSellOut("");
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleClickOpenCreateTipoCli = () => {
    setOpenCreateTipoCli(true);
  };

  const handleClickCloseCreate = () => {
    setOpenCreate(false);
    setCodCliente("");
    setCodModelo("");
    setAnio("");
    setMes("");
    setUnidades("");
    setSellOut("");
    setCodLinea("");
    setCodTipoLinea("");
  };

  const handleClickCloseCreateTipoCli = () => {
    setOpenCreateTipoCli(false);
    setCodTipoCliente("");
    setCodModelo("");
    setAnio("");
    setMes("");
    setUnidades("");
    setSellOut("");
  };

  const columns = [
    {
      name: "cod_cliente",
      label: "Código cliente",
    },
    {
      name: "cod_modelo",
      label: "Código modelo",
    },
    {
      name: "anio",
      label: "Año",
    },
    {
      name: "mes",
      label: "Mes",
    },
    {
      name: "unidades",
      label: "Unidades",
    },
    {
      name: "sell_out",
      label: "Sell Out",
    },
    {
      name: "cod_linea",
      label: "Línea",
    },
    {
      name: "cod_tipo_linea",
      label: "Tipo línea",
    },
  ];

  const columnsTipoCli = [
    {
      name: "cod_tipo_cliente",
      label: "Código tipo cliente",
    },
    {
      name: "cod_modelo",
      label: "Código modelo",
    },
    {
      name: "anio",
      label: "Año",
    },
    {
      name: "mes",
      label: "Mes",
    },
    {
      name: "unidades",
      label: "Unidades",
    },
    {
      name: "sell_out",
      label: "Sell Out",
    },
  ];

  const options = createTableOptions(handleRowClick, handleDelete);

  const optionsTipoCli = createTableOptions(
    handleRowClickTipoCli,
    handleDeleteTipoCli
  );

  const createContentItems = [
    createTextFieldItem(
      6,
      "cod_cliente",
      "Cliente",
      codCliente,
      createDefaultSetter(setCodCliente, undefined),
      true
    ),
    createTextFieldItem(
      6,
      "cod_modelo",
      "Modelo",
      codModelo,
      createDefaultSetter(setCodModelo)
    ),
    createTextFieldItem(
      3,
      "anio",
      "Año",
      anio,
      createDefaultSetter(setAnio),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "mes",
      "Mes",
      mes,
      createDefaultSetter(setMes),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "unidades",
      "Unidades",
      unidades,
      createDefaultSetter(setUnidades),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "sell_out",
      "Sell out",
      sellOut,
      createDefaultSetter(setSellOut),
      false,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      6,
      "cod_linea",
      "Código línea",
      codLinea,
      createDefaultSetter(setCodLinea),
      false
    ),
    createTextFieldItem(
      6,
      "cod_tipo_linea",
      "Código tipo línea",
      codTipoLinea,
      createDefaultSetter(setCodTipoLinea),
      false
    ),
  ];

  const createContentItemsTipoCli = [
    createTextFieldItem(
      6,
      "cod_tipo_cliente",
      "Tipo Cliente",
      codTipoCliente,
      createDefaultSetter(setCodTipoCliente, undefined),
      true
    ),
    createTextFieldItem(
      6,
      "cod_modelo",
      "Modelo",
      codModelo,
      createDefaultSetter(setCodModelo)
    ),
    createTextFieldItem(
      3,
      "anio",
      "Año",
      anio,
      createDefaultSetter(setAnio),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "mes",
      "Mes",
      mes,
      createDefaultSetter(setMes),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "unidades",
      "Unidades",
      unidades,
      createDefaultSetter(setUnidades),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "sell_out",
      "Sell out",
      sellOut,
      createDefaultSetter(setSellOut),
      false,
      undefined,
      false,
      "number"
    ),
  ];

  const updateContentItems = [
    createTextFieldItem(6, "cod_cliente", "Cliente", codCliente),
    createTextFieldItem(6, "cod_modelo", "Modelo", codModelo),
    createTextFieldItem(3, "anio", "Año", anio),
    createTextFieldItem(3, "mes", "Mes", mes),
    createTextFieldItem(
      3,
      "unidades",
      "Unidades",
      unidades,
      createDefaultSetter(setUnidades),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "sell_out",
      "Sell out",
      sellOut,
      createDefaultSetter(setSellOut),
      false,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      6,
      "cod_linea",
      "Código línea",
      codLinea,
      createDefaultSetter(setCodLinea),
      false
    ),
    createTextFieldItem(
      6,
      "cod_tipo_linea",
      "Código tipo línea",
      codTipoLinea,
      createDefaultSetter(setCodTipoLinea),
      false
    ),
  ];

  const updateContentItemsTipoCli = [
    createTextFieldItem(6, "cod_tipo_cliente", "Tipo Cliente", codTipoCliente),
    createTextFieldItem(6, "cod_modelo", "Modelo", codModelo),
    createTextFieldItem(3, "anio", "Año", anio),
    createTextFieldItem(3, "mes", "Mes", mes),
    createTextFieldItem(
      3,
      "unidades",
      "Unidades",
      unidades,
      createDefaultSetter(setUnidades),
      true,
      undefined,
      false,
      "number"
    ),
    createTextFieldItem(
      3,
      "sell_out",
      "Sell out",
      sellOut,
      createDefaultSetter(setSellOut),
      false,
      undefined,
      false,
      "number"
    ),
  ];

  const createContent = <CustomGrid items={createContentItems} />;

  const createContentTipoCli = <CustomGrid items={createContentItemsTipoCli} />;

  const updateContent = <CustomGrid items={updateContentItems} />;

  const updateContentTipoCli = <CustomGrid items={updateContentItemsTipoCli} />;

  const header = <Header menus={menus} modulos={false} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} />;

  const tabla = (
    <Tabla
      title="Presupuestos"
      data={presupuestos}
      columns={columns}
      options={options}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Presupuesto"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Presupuesto"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
      handleConfirm={handleUpdate}
      confirmText="Actualizar"
    />
  );

  const btnNuevoTipoCli = <BtnNuevo onClick={handleClickOpenCreateTipoCli} />;

  const tablaTipoCli = (
    <Tabla
      title="Presupuestos Tipo Cliente"
      data={presupuestosTipoCli}
      columns={columnsTipoCli}
      options={optionsTipoCli}
    />
  );

  const createDialogTipoCli = (
    <CustomDialog
      titulo="Registrar Presupuesto"
      contenido={createContentTipoCli}
      open={openCreateTipoCli}
      handleClose={handleClickCloseCreateTipoCli}
      handleCancel={handleClickCloseCreateTipoCli}
      handleConfirm={handleCreateTipoCli}
    />
  );

  const updateDialogTipoCli = (
    <CustomDialog
      titulo="Actualizar Presupuesto"
      contenido={updateContentTipoCli}
      open={openUpdateTipoCli}
      handleClose={handleClickCloseUpdateTipoCli}
      handleCancel={handleClickCloseUpdateTipoCli}
      handleConfirm={handleUpdateTipoCli}
      confirmText="Actualizar"
    />
  );

  useEffect(() => {
    document.title = "Sell Out";
    getMenus();
    getPresupuestos();
    getPresupuestosTipoCli();
  }, []);

  return (
    <MainComponent
      components={[
        header,
        btnNuevo,
        tabla,
        createDialog,
        updateDialog,
        btnNuevoTipoCli,
        tablaTipoCli,
        createDialogTipoCli,
        updateDialogTipoCli,
      ]}
    />
  );
}
