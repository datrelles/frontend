import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import { formatearSiNo, validarCedulaRUC } from "../../helpers/modulo-formulas";
import Header from "./common/header";
import BtnNuevo from "./common/btn-nuevo";
import Tabla from "./common/tabla";
import CustomDialog from "./common/custom-dialog";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createEmptyItem,
  createFunctionCustomBodyRender,
  createTableOptions,
  createTextFieldItem,
} from "./common/generators";
import CustomGrid from "./common/custom-grid";
import Check from "./common/check";
import MainComponent from "./common/main-component";
import CustomSelect from "./common/custom-select";
import { ModelosCliente, DefaultModeloCliente } from "./common/enum";

export default function Clientes() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [clientes, setClientes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codCliente, setCodCliente] = useState("");
  const [codModelo, setCodModelo] = useState(DefaultModeloCliente);
  const [tipoCliente, setTipoCliente] = useState("");
  const [nombre, setNombre] = useState("");
  const [nombreImprime, setNombreImprime] = useState("");
  const [agrupa, setAgrupa] = useState(false);
  const [nombreAgrupacion, setNombreAgrupacion] = useState("");

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    APIService.createCliente({
      cod_cliente: codCliente,
      cod_modelo: codModelo,
      tipo_cliente: tipoCliente,
      nombre_imprime: nombreImprime,
      agrupa_cliente: agrupa,
      nombre_agrupacion: nombreAgrupacion,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodCliente("");
        setCodModelo(DefaultModeloCliente);
        setTipoCliente("");
        setNombreImprime("");
        setAgrupa(false);
        setNombreAgrupacion("");
      })
      .catch((err) => toast.error(err.message));
  };

  const getClientes = async () => {
    try {
      setClientes(await APIService.getClientes());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateCliente(codCliente, {
      cod_modelo: codModelo,
      tipo_cliente: tipoCliente,
      nombre_imprime: nombreImprime,
      agrupa_cliente: agrupa,
      nombre_agrupacion: nombreAgrupacion,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdate(false);
        setCodCliente("");
        setCodModelo(DefaultModeloCliente);
        setTipoCliente("");
        setNombreImprime("");
        setAgrupa(false);
        setNombreAgrupacion("");
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar el cliente?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = clientes[deletedRowIndex];
    const newClientes = clientes.filter(
      (cliente, index) => index !== deletedRowIndex
    );
    setClientes(newClientes);
    APIService.deleteCliente(deletedRowValue.cod_cliente)
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getClientes();
      });
    return true;
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodCliente("");
    setCodModelo(DefaultModeloCliente);
    setTipoCliente("");
    setNombre("");
    setNombreImprime("");
    setAgrupa(false);
    setNombreAgrupacion("");
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
    const row = clientes.find((item) => item.cod_cliente === rowData[0]);
    setCodCliente(row.cod_cliente);
    setCodModelo(row.cod_modelo);
    setTipoCliente(row.tipo_cliente);
    setNombreImprime(row.nombre_imprime);
    setAgrupa(row.agrupa_cliente === 1);
    setNombreAgrupacion(row.nombre_agrupacion);
    handleClickOpenUpdate();
  };

  const columns = [
    {
      name: "cod_cliente",
      label: "Código",
    },
    {
      name: "cod_modelo",
      label: "Modelo",
    },
    {
      name: "tipo_cliente",
      label: "Tipo",
    },
    {
      name: "nombre_imprime",
      label: "Nombre",
    },
    {
      name: "agrupa_cliente",
      label: "Agrupa",
      options: createFunctionCustomBodyRender(formatearSiNo),
    },
    {
      name: "nombre_agrupacion",
      label: "Nombre agrupación",
    },
  ];

  const options = createTableOptions(handleRowClick, handleDelete);

  const selectModelo = (
    <CustomSelect
      label="Modelo"
      options={ModelosCliente}
      value={codModelo}
      onChange={createDefaultSetter(setCodModelo)}
    />
  );

  const checkboxAgrupa = (
    <Check
      label="Agrupa"
      checked={agrupa}
      onChange={(e) => {
        const result = e.target["checked"];
        setAgrupa(result);
        if (!result) {
          setNombreAgrupacion("");
        }
      }}
    />
  );

  const createContentItems = [
    createTextFieldItem({
      xs: 4,
      id: "cod_cliente",
      label: "Código",
      value: codCliente,
      setValue: async (e) => {
        const codigo = e.target.value;
        setCodCliente(codigo);
        if (validarCedulaRUC(codigo)) {
          try {
            const res = (await APIService.getNuevoCliente(codigo)).mensaje;
            const nombre = res.split(",")[0];
            const tipo = res.split(",")[1];
            if (tipo) {
              setNombre(nombre);
              setTipoCliente(tipo);
            } else {
              toast.error("El cliente no tiene un tipo registrado");
            }
          } catch (err) {
            toast.error(err.message);
            setNombre("");
            setTipoCliente("");
          }
        } else {
          setNombre("");
          setTipoCliente("");
        }
      },
      required: true,
      placeholder: "CI / RUC",
    }),
    createTextFieldItem({
      xs: 8,
      id: "nombre",
      label: "Nombre",
      value: nombre,
      required: true,
      disabled: true,
    }),
    createTextFieldItem({
      xs: 2,
      id: "tipo_cliente",
      label: "Tipo",
      value: tipoCliente,
      required: true,
      disabled: true,
    }),
    createCustomComponentItem(2, "cod_modelo", selectModelo),
    createTextFieldItem({
      xs: 8,
      id: "nombre_imprime",
      label: "Nombre",
      value: nombreImprime,
      setValue: createDefaultSetter(setNombreImprime),
    }),
    createCustomComponentItem(4, "checkboxAgrupa", checkboxAgrupa),
    agrupa
      ? createTextFieldItem({
          xs: 8,
          id: "nombre_agrupa",
          label: "Nombre agrupación",
          value: nombreAgrupacion,
          setValue: createDefaultSetter(setNombreAgrupacion),
        })
      : createEmptyItem(8, "nombre_agrupa"),
  ];

  const updateContentItems = [
    createTextFieldItem({
      xs: 4,
      id: "cod_proceso",
      label: "Código",
      value: codCliente,
    }),
    createTextFieldItem({
      xs: 4,
      id: "cod_modelo",
      label: "Modelo",
      value: codModelo,
    }),
    createTextFieldItem({
      xs: 4,
      id: "cod_tipo",
      label: "Tipo cliente",
      value: tipoCliente,
    }),
    createTextFieldItem({
      xs: 12,
      id: "nombre_imprime",
      label: "Nombre",
      value: nombreImprime,
      setValue: createDefaultSetter(setNombreImprime),
    }),
    createCustomComponentItem(4, "checkboxAgrupa", checkboxAgrupa),
    agrupa
      ? createTextFieldItem({
          xs: 8,
          id: "nombre_agrupa",
          label: "Nombre agrupación",
          value: nombreAgrupacion,
          setValue: createDefaultSetter(setNombreAgrupacion),
        })
      : createEmptyItem(8, "nombre_agrupa"),
  ];

  const createContent = <CustomGrid items={createContentItems} />;

  const updateContent = <CustomGrid items={updateContentItems} />;

  const header = <Header menus={menus} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} />;

  const tabla = (
    <Tabla
      title="Clientes"
      data={clientes}
      columns={columns}
      options={options}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Cliente"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Cliente"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
      handleConfirm={handleUpdate}
      confirmText="Actualizar"
    />
  );

  useEffect(() => {
    document.title = "Clientes";
    getMenus();
    getClientes();
  }, []);

  useEffect(() => {
    getClientes();
  }, [openCreate, openUpdate]);

  return (
    <MainComponent
      components={[header, btnNuevo, tabla, createDialog, updateDialog]}
    />
  );
}
