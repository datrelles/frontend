import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/modulo-formulas";
import Header from "../formulas/common/header";
import MainComponent from "../formulas/common/main-component";
import CustomSelect from "../formulas/common/custom-select";
import {
  DefaultMesesProyeccion,
  MesesProyeccion,
  TiposSeleccionTabla,
} from "../formulas/common/enum";
import {
  createDefaultSetter,
  createMTColumn,
  createTableFeatures,
  createTableOptions,
} from "../formulas/common/generators";
import BtnNuevo from "../formulas/common/btn-nuevo";
import Tabla from "../formulas/common/tabla";
import MultiLevelTable from "../formulas/common/multilevel-table";

export default function PresupuestoCantidades() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );

  const columnasFijas = [
    {
      name: "cod_cliente",
      options: {
        display: "excluded",
      },
    },
    {
      name: "cliente",
      label: "Cliente",
    },
    {
      name: "cod_modelo",
      options: {
        display: "excluded",
      },
    },
    {
      name: "modelo",
      label: "Modelo",
    },
  ];

  const options = createTableOptions(
    undefined,
    undefined,
    TiposSeleccionTabla.NONE.key,
    undefined,
    undefined,
    createTableFeatures(false, false, false, false, false, false)
  );

  const [menus, setMenus] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [mesesProyeccion, setMesesProyeccion] = useState(
    DefaultMesesProyeccion
  );
  const [productoTabla, setProductoTabla] = useState([]);
  const [columnasTabla, setColumnasTabla] = useState(columnasFijas);

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleProyectar = () => {
    const columnasProyeccion = [
      {
        name: "ventas_cli",
        label: "Ventas Clientes",
      },
      {
        name: "ventas_mass",
        label: "Ventas MASSLINE",
      },
    ];
    const curYear = new Date().getFullYear();
    const iter = mesesProyeccion / 12;
    let producto = [];
    for (const modelo of modelos) {
      for (const cliente of clientes) {
        producto.push({
          cod_cliente: cliente.cod_cliente,
          cliente: cliente.agrupa_cliente
            ? cliente.nombre_agrupacion
            : cliente.nombre_imprime,
          cod_modelo: modelo.codigo,
          modelo: modelo.nombre,
        });
      }
    }
    console.log("prod mod cli", producto);
    let columnas = columnasFijas.map((item) => ({ ...item }));
    for (let i = 1; i <= iter; i++) {
      const proyYear = curYear + i - 1;
      for (let mes = 1; mes <= 12; mes++) {
        const nuevasColumnas = columnasProyeccion.map((col) => ({
          name: `${col.name}_${proyYear}_${mes}`,
          label: `${col.label} ${proyYear} ${mes}`,
        }));
        console.log("new cols", nuevasColumnas);
        console.log("col a", columnas);
        columnas = columnas.concat(nuevasColumnas);
        console.log("col b", columnas);
        console.log("prod a", producto);
        producto = producto.map((fila) => {
          const filaActualizada = { ...fila };
          nuevasColumnas.forEach((col) => {
            filaActualizada[col.name] = "-";
          });
          return filaActualizada;
        });
        console.log("prod b", producto);
      }
    }
    setColumnasTabla(columnas);
    setProductoTabla(producto);
  };

  async function getClientesModelos() {
    try {
      const [resClientes, resModelos] = await Promise.all([
        APIService.getClientesProyecciones(),
        APIService.getModelosMotosProyecciones(),
      ]);
      setClientes(resClientes);
      setModelos(resModelos);
    } catch (err) {
      toast.error(err.message);
    }
  }

  const header = <Header menus={menus} />;

  const selectMeses = (
    <CustomSelect
      label="Meses proyección"
      options={MesesProyeccion}
      value={mesesProyeccion}
      onChange={createDefaultSetter(setMesesProyeccion)}
    />
  );

  const btnNuevo = (
    <BtnNuevo onClick={handleProyectar} texto="Proyectar" icon={false} />
  );

  const tabla = (
    <Tabla
      title="Tabla"
      data={productoTabla}
      columns={columnasTabla}
      options={options}
    />
  );

  /*****************
   *****************
  TEST
  ****************** 
  ******************/

  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@example.com",
      phone: "123-456-7890",
      age: 30,
      city: "Madrid",
      country: "España",
      occupation: "Ingeniero",
      company: "Tech Solutions",
      salary: 75000,
      status: "Activo",
      notes: "Excelente desempeño.",
      hireDate: "2020-01-15",
    },
    {
      id: 2,
      firstName: "María",
      lastName: "García",
      email: "maria.garcia@example.com",
      phone: "987-654-3210",
      age: 25,
      city: "Barcelona",
      country: "España",
      occupation: "Diseñadora",
      company: "Creative Hub",
      salary: 60000,
      status: "Inactivo",
      notes: "De baja temporal.",
      hireDate: "2021-03-01",
    },
    {
      id: 3,
      firstName: "Carlos",
      lastName: "Rodríguez",
      email: "carlos.r@example.com",
      phone: "555-123-4567",
      age: 40,
      city: "Sevilla",
      country: "España",
      occupation: "Arquitecto",
      company: "Build Masters",
      salary: 85000,
      status: "Activo",
      notes: "Líder de proyecto.",
      hireDate: "2019-07-20",
    },
    {
      id: 4,
      firstName: "Ana",
      lastName: "López",
      email: "ana.l@example.com",
      phone: "111-222-3333",
      age: 28,
      city: "Valencia",
      country: "España",
      occupation: "Marketing",
      company: "Global Brands",
      salary: 55000,
      status: "Activo",
      notes: "Recién incorporada.",
      hireDate: "2023-11-10",
    },
    {
      id: 5,
      firstName: "Pedro",
      lastName: "Sánchez",
      email: "pedro.s@example.com",
      phone: "444-555-6666",
      age: 35,
      city: "Bilbao",
      country: "España",
      occupation: "Ventas",
      company: "Sales Force",
      salary: 70000,
      status: "Inactivo",
      notes: "En proceso de reasignación.",
      hireDate: "2018-05-22",
    },
    // ¡Añade más objetos para probar el scroll horizontal!
  ]);

  // Funciones para manejar eventos de la tabla
  const handleUpdateCell = (newValue, rowData, columnDefinition) => {
    console.log(
      `Actualizando ID: ${rowData.id}, Campo: ${columnDefinition.field}, Nuevo Valor: ${newValue}`
    );
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === rowData.id
          ? { ...emp, [columnDefinition.field]: newValue }
          : emp
      )
    );
  };

  const handleCellClick = (rowData, columnDefinition) => {
    console.log(
      `Clic en la celda del campo: ${columnDefinition.field}, Valor: ${
        rowData[columnDefinition.field]
      }`
    );
  };

  // Ejemplo de definición de columnas
  const tableColumnsDefinition = [
    {
      header: "Información General",
      bgColor: "#C2E0FF", // Un azul claro
      children: [
        {
          header: "Identificación",
          children: [
            { header: "ID", field: "id" },
            {
              header: "Nombre",
              field: "firstName",
              onUpdateCell: handleUpdateCell,
            },
            {
              header: "Apellido",
              field: "lastName",
              onUpdateCell: handleUpdateCell,
              bgColor: "#FFFFD4",
            }, // Amarillo muy claro
          ],
        },
        {
          header: "Contacto",
          children: [
            { header: "Email", field: "email", onUpdateCell: handleUpdateCell },
            {
              header: "Teléfono",
              field: "phone",
              onUpdateCell: handleUpdateCell,
            },
          ],
        },
      ],
    },
    {
      header: "Detalles Empleado",
      bgColor: "#E0FFE0", // Un verde claro
      children: [
        { header: "Edad", field: "age", onUpdateCell: handleUpdateCell },
        { header: "Ciudad", field: "city", onUpdateCell: handleUpdateCell },
        { header: "País", field: "country", onUpdateCell: handleUpdateCell },
        {
          header: "Ocupación",
          field: "occupation",
          onUpdateCell: handleUpdateCell,
        },
        { header: "Empresa", field: "company" }, // Esta columna no es editable
        {
          header: "Salario",
          field: "salary",
          onUpdateCell: handleUpdateCell,
          bgColor: "#FFDDC1",
        }, // Naranja claro
        { header: "Estado", field: "status", onClickCell: handleCellClick }, // Solo es clickeable
      ],
    },
    { header: "Notas", field: "notes", onUpdateCell: handleUpdateCell }, // Columna adicional para scroll
    // {
    //   header: "Fecha Contratación",
    //   field: "hireDate",
    //   onUpdateCell: handleUpdateCell,
    // },
    createMTColumn("Fecha Contratación", "hireDate", handleUpdateCell),
  ];

  const test = (
    <div
      style={{
        maxWidth: "95%",
        margin: "20px auto",
        border: "1px solid #ccc",
        padding: "15px",
      }}
    >
      <MultiLevelTable
        data={employees}
        columns={tableColumnsDefinition}
        fixedColumnsCount={1}
      />
    </div>
  );

  useEffect(() => {
    document.title = "Presupuesto de Cantidades";
    getMenus();
    getClientesModelos();
  }, []);

  return (
    <MainComponent components={[header, selectMeses, btnNuevo, tabla, test]} />
  );
}
