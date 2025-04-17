import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { FormControlLabel, Checkbox } from "@mui/material";
import { useAuthContext } from "../../context/authContext";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import API from "../../services/modulo-formulas";
import { formatearEstado, formatearFecha } from "../../helpers/modulo-formulas";
import Header from "./common/Header";
import BtnNuevo from "./common/BtnNuevo";
import Tabla from "./common/Tabla";
import CustomDialog from "./common/CustomDialog";

export default function Procesos() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = new API(
    jwt,
    userShineray,
    enterpriseShineray,
    systemShineray
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

  const createContent = (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          margin="dense"
          id="cod_proceso"
          label="Código"
          type="text"
          placeholder="PROCE###"
          fullWidth
          value={codProceso}
          onChange={(e) => setCodProceso(e.target.value)}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          margin="dense"
          id="nombre"
          label="Nombre"
          type="text"
          fullWidth
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const updateContent = (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            disabled
            margin="dense"
            id="cod_proceso"
            label="Código"
            type="text"
            placeholder="COD###"
            fullWidth
            value={codProceso}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin="dense"
            id="nombre"
            label="Nombre"
            type="text"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Grid>
      </Grid>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              label="Estado"
              checked={estado}
              onChange={(e) => {
                setEstado(e.target.checked);
              }}
            />
          }
          label="Activo"
        />
      </div>
    </>
  );

  useEffect(() => {
    document.title = "Procesos";
    getProcesos();
    getMenus();
  }, [openCreate, openUpdate]);

  return (
    <div
      style={{
        marginTop: "150px",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <Header menus={menus} />
      <BtnNuevo onClick={handleClickOpenCreate} />
      <Tabla
        title="Procesos"
        data={procesos}
        columns={columns}
        options={options}
      />
      <CustomDialog
        titulo="Registrar Proceso"
        contenido={createContent}
        open={openCreate}
        handleClose={handleClickCloseCreate}
        handleCancel={handleClickCloseCreate}
        handleConfirm={handleCreate}
      />
      <CustomDialog
        titulo="Actualizar Proceso"
        contenido={updateContent}
        open={openUpdate}
        handleClose={handleClickCloseUpdate}
        handleCancel={handleClickCloseUpdate}
        handleConfirm={handleUpdate}
        confirmText="Actualizar"
      />
    </div>
  );
}
