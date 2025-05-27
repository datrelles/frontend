import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import {
  obtenerNombreColorHex,
  formatearEstado,
  obtenerValorColorHex,
} from "../../helpers/modulo-formulas";
import Header from "./common/header";
import BtnNuevo from "./common/btn-nuevo";
import Tabla from "./common/tabla";
import CustomDialog from "./common/custom-dialog";
import Check from "./common/check";
import CustomGrid from "./common/custom-grid";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createFunctionCustomBodyRender,
  createTableOptions,
  createTextFieldItem,
  createTooltipCustomBodyRender,
} from "./common/generators";
import MainComponent from "./common/main-component";
import CustomTooltip from "./common/custom-tooltip";
import AutocompleteObject from "./common/autocomplete-objects";
import { ColoresHex, DefaultColorHex, Enum } from "./common/enum";

export default function Parametros() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [parametros, setParametros] = useState([]);
  const [menus, setMenus] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [codParametro, setCodParametro] = useState("");
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState(DefaultColorHex);
  const [descripcion, setDescripcion] = useState("");
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
    APIService.createParametro({
      empresa: enterpriseShineray,
      cod_parametro: codParametro,
      nombre,
      color: color.key,
      descripcion,
    })
      .then((res) => {
        toast.success(res);
        setOpenCreate(false);
        setCodParametro("");
        setNombre("");
        setDescripcion("");
        setEstado(true);
      })
      .catch((err) => toast.error(err.message));
  };

  const getParametros = async () => {
    try {
      setParametros(await APIService.getParametros());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    APIService.updateParametro(codParametro, {
      nombre,
      color: color.key,
      descripcion,
      estado,
    })
      .then((res) => {
        toast.success(res);
        setOpenUpdate(false);
        setCodParametro("");
        setNombre("");
        setColor(DefaultColorHex);
        setDescripcion("");
        setEstado(true);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = (rowsDeleted) => {
    if (!window.confirm("¿Estás seguro de eliminar el parámetro?")) {
      return false;
    }
    const { data: deletedData } = rowsDeleted;
    const deletedRowIndex = deletedData[0].index;
    const deletedRowValue = parametros[deletedRowIndex];
    const newParametros = parametros.filter(
      (_, index) => index !== deletedRowIndex
    );
    setParametros(newParametros);
    APIService.deleteParametro(deletedRowValue.cod_parametro)
      .then((res) => toast.success(res))
      .catch((err) => {
        toast.error(err.message);
        getParametros();
      });
    return true;
  };

  const handleRowClick = (rowData, rowMeta) => {
    const row = parametros.find((item) => item.cod_parametro === rowData[0]);
    setCodParametro(row.cod_parametro);
    setNombre(row.nombre);
    const color =
      Enum.values(ColoresHex).find((item) => item.key === row.color) ??
      DefaultColorHex;
    setColor(color);
    setDescripcion(row.descripcion ?? "");
    setEstado(row.estado === 1);
    handleClickOpenUpdate();
  };

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
    setCodParametro("");
    setNombre("");
    setDescripcion("");
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

  const columns = [
    {
      name: "cod_parametro",
      label: "Código",
    },
    {
      name: "nombre",
      label: "Nombre",
    },
    {
      name: "color",
      label: "Color",
      options: {
        customBodyRender: (value) => {
          const style = {
            backgroundColor: obtenerValorColorHex(value),
            padding: "8px",
            borderRadius: "4px",
          };
          return <div style={style}>{obtenerNombreColorHex(value)}</div>;
        },
      },
    },
    {
      name: "descripcion",
      label: "Descripción",
      options: createTooltipCustomBodyRender(),
    },
    {
      name: "estado",
      label: "Estado",
      options: createFunctionCustomBodyRender(formatearEstado),
    },
  ];

  const options = createTableOptions(handleRowClick, handleDelete);

  const checkboxEstado = (
    <Check
      label="Activo"
      checked={estado}
      onChange={createDefaultSetter(setEstado, true)}
    />
  );

  const autocompleteColores = (
    <AutocompleteObject
      id="Colores"
      value={color}
      optionId="key"
      shape={DefaultColorHex}
      options={Enum.values(ColoresHex)}
      optionLabel="label"
      onChange={(e, value) => {
        setColor(value ?? DefaultColorHex);
      }}
    />
  );

  const createContentItems = [
    createTextFieldItem(
      4,
      "cod_parametro",
      "Código",
      codParametro,
      createDefaultSetter(setCodParametro, undefined, true),
      true,
      "PARAM###"
    ),
    createTextFieldItem(
      8,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createCustomComponentItem(12, "color", autocompleteColores),
    createTextFieldItem(
      12,
      "descripcion",
      "Descripción",
      descripcion,
      createDefaultSetter(setDescripcion),
      false,
      undefined,
      undefined,
      undefined,
      3
    ),
  ];

  const updateContentItems = [
    createTextFieldItem(4, "cod_parametro", "Código", codParametro),
    createTextFieldItem(
      8,
      "nombre",
      "Nombre",
      nombre,
      createDefaultSetter(setNombre)
    ),
    createCustomComponentItem(12, "color", autocompleteColores),
    createTextFieldItem(
      12,
      "descripcion",
      "Descripción",
      descripcion,
      createDefaultSetter(setDescripcion),
      false,
      undefined,
      undefined,
      undefined,
      3
    ),
    createCustomComponentItem(12, "checkboxEstado", checkboxEstado),
  ];

  const createContent = <CustomGrid items={createContentItems} />;

  const updateContent = <CustomGrid items={updateContentItems} />;

  const header = <Header menus={menus} />;

  const btnNuevo = <BtnNuevo onClick={handleClickOpenCreate} />;

  const tabla = (
    <Tabla
      title="Parámetros"
      data={parametros}
      columns={columns}
      options={options}
    />
  );

  const createDialog = (
    <CustomDialog
      titulo="Registrar Parámetro"
      contenido={createContent}
      open={openCreate}
      handleClose={handleClickCloseCreate}
      handleCancel={handleClickCloseCreate}
      handleConfirm={handleCreate}
    />
  );

  const updateDialog = (
    <CustomDialog
      titulo="Actualizar Parámetro"
      contenido={updateContent}
      open={openUpdate}
      handleClose={handleClickCloseUpdate}
      handleCancel={handleClickCloseUpdate}
      handleConfirm={handleUpdate}
      confirmText="Actualizar"
    />
  );

  useEffect(() => {
    document.title = "Parámetros";
    getMenus();
    getParametros();
  }, []);

  useEffect(() => {
    getParametros();
  }, [openCreate, openUpdate]);

  return (
    <MainComponent
      components={[header, btnNuevo, tabla, createDialog, updateDialog]}
    />
  );
}
