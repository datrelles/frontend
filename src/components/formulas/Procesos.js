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
  createTextFieldItem,
} from "./common/form-generators";
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
    const row = procesos.filter((item) => item.cod_proceso === rowData[0])[0];
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
      options: {
        customBodyRender: (value) => formatearEstado(value),
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
        viewColumns: "Ver columns",
        filterTable: "Filtrar tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "REINICIAR",
      },
      viewColumns: {
        title: "Mostrar columns",
        titleAria: "Mostrar/Ocultar columns de tabla",
      },
      selectedRows: {
        text: "fila(s) seleccionada(s)",
        delete: "Borrar",
        deleteAria: "Borrar fila seleccionada",
      },
    },
  };

  const checkboxEstado = (
    <Check label="Activo" checked={estado} setChecked={setEstado} />
  );

  const createContentItems = [
    createTextFieldItem(
      6,
      "cod_proceso",
      "Código",
      codProceso,
      setCodProceso,
      true,
      "PROCE###"
    ),
    createTextFieldItem(6, "nombre", "Nombre", nombre, setNombre),
  ];

  const updateContentItems = [
    createTextFieldItem(6, "cod_proceso", "Código", codProceso),
    createTextFieldItem(6, "nombre", "Nombre", nombre, setNombre),
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
