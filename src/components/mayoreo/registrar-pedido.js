import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
import Header from "../../components/formulas/common/header";
import MainComponent from "../../components/formulas/common/main-component";
import { toast } from "react-toastify";
import {
  createCustomComponentItem,
  createDefaultSetter,
  createTextFieldItem,
} from "../formulas/common/generators";
import AutocompleteObject from "../formulas/common/autocomplete-objects";
import CustomGrid from "../formulas/common/custom-grid";
import LoadingModal from "../formulas/common/loading-modal";
import BtnNuevo from "../formulas/common/btn-nuevo";
import CustomDialog from "../formulas/common/custom-dialog";
import {
  Paper,
  TableHead,
  TableCell,
  TableContainer,
  Typography,
  Table,
  TableBody,
  TableRow,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const shapePolitica = {
  cod_politica: "",
  nombre: "Seleccione",
};
const shapeVendedor = {
  cod_persona_vendor: "",
  nombre: "Seleccione",
};
const shapeCliente = {
  cod_persona: "",
  nombre: "Seleccione",
};

const getMuiTheme = () =>
  createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            paddingLeft: "3px",
            paddingRight: "3px",
            paddingTop: "0px",
            paddingBottom: "0px",
            backgroundColor: "#00000",
            whiteSpace: "nowrap",
            flex: 1,
            borderBottom: "1px solid #ddd",
            borderRight: "1px solid #ddd",
            fontSize: "14px",
          },
          head: {
            backgroundColor: "firebrick",
            color: "#ffffff",
            fontWeight: "bold",
            paddingLeft: "0px",
            paddingRight: "0px",
            fontSize: "12px",
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: "collapse",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            borderBottom: "5px solid #ddd",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          regular: {
            minHeight: "10px",
          },
        },
      },
    },
  });

const filtrarCampo = (obj, campo, valor) => {
  const campoValor = obj[campo];
  return (
    typeof campoValor === "string" &&
    campoValor.toLowerCase().includes(valor.toLowerCase())
  );
};

export default function RegistrarPedido() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [menus, setMenus] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [politicas, setPoliticas] = useState([]);
  const [politica, setPolitica] = useState(shapePolitica);
  const [vendedores, setVendedores] = useState([]);
  const [vendedor, setVendedor] = useState(shapeVendedor);
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(shapeCliente);
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [cuotas, setCuotas] = useState(0);
  const [interes, setInteres] = useState(0);
  const [envio, setEnvio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [zona, setZona] = useState("");
  const [credito, setCredito] = useState(0);
  const [disponible, setDisponible] = useState(0);
  const [categoria, setCategoria] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [carteraVencida, setCarteraVencida] = useState(0);
  const [codigoProd, setCodigoProd] = useState("");
  const [nombreProd, setNombreProd] = useState("");
  const [precioProd, setPrecioProd] = useState("");
  const [descuentoProd, setDescuentoProd] = useState(0);
  const [precioDescuentoProd, setPrecioDescuentoProd] = useState("");
  const [cantidadProd, setCantidadProd] = useState(1);
  const [productosPedido, setProductosPedido] = useState([]);
  const [agregarProducto, setAgregarProducto] = useState(false);

  const [observacion, setObservacion] = useState("");

  const getMenus = async () => {
    try {
      setMenus(await APIService.getMenus());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPoliticas = async () => {
    try {
      setPoliticas(await APIService.getPoliticas());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getVendedores = async () => {
    try {
      setVendedores(await APIService.getVendedores());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProductos = async () => {
    try {
      setProductos(await APIService.getProductos());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getClientes = async (politica) => {
    try {
      setCargando(true);
      setClientes(await APIService.getClientes(politica));
      setCargando(false);
    } catch (err) {
      setCargando(false);
      toast.error(err.message);
    }
  };

  const setearPagina = (pagina) => () => {
    setPagina(pagina);
  };

  const handleSelectProduct = (newProd) => {
    setProductosPedido((prev) => {
      if (prev.find((prod) => prod.cod_producto === newProd.cod_producto)) {
        toast.warn("El producto ya fue agregado");
        return prev;
      }
      setAgregarProducto(false);
      setCodigoProd("");
      setNombreProd("");
      setProductosFiltrados([]);
      return prev.concat(newProd);
    });
  };

  const autocompletePoliticas = (
    <AutocompleteObject
      id="Política"
      value={politica}
      optionId="cod_politica"
      shape={shapePolitica}
      options={politicas}
      optionLabel="nombre"
      onChange={(e, value) => {
        setPolitica(value ?? shapePolitica);
      }}
    />
  );

  const autocompleteVendedores = (
    <AutocompleteObject
      id="Agente"
      value={vendedor}
      optionId="cod_persona_vendor"
      shape={shapeVendedor}
      options={vendedores}
      optionLabel="nombre"
      onChange={(e, value) => {
        setVendedor(value ?? shapeVendedor);
      }}
    />
  );

  const autocompleteClientes = (
    <AutocompleteObject
      id="Cliente"
      value={cliente}
      optionId="cod_persona"
      shape={shapeCliente}
      options={clientes}
      optionLabel="nombre"
      onChange={(e, value) => {
        setCliente(value ?? shapeCliente);
      }}
      disabled={politica.cod_politica === ""}
    />
  );

  const itemsCabeceraPedido = [
    createCustomComponentItem(6, "politica", autocompletePoliticas),
    createCustomComponentItem(6, "agente", autocompleteVendedores),
    createCustomComponentItem(12, "cliente", autocompleteClientes),
    // createTextFieldItem({
    //   xs: 6,
    //   id: "cuotas",
    //   label: "Cuotas",
    //   value: cuotas,
    //   setValue: createDefaultSetter({ setter: setCuotas }),
    //   type: "number",
    // }),
    // createTextFieldItem({
    //   xs: 6,
    //   id: "interes",
    //   label: "% Interés",
    //   value: interes,
    //   setValue: createDefaultSetter({ setter: setInteres }),
    //   type: "number",
    // }),
    // createTextFieldItem({
    //   xs: 6,
    //   id: "direccion",
    //   label: "Dirección de envío",
    //   value: envio,
    //   setValue: createDefaultSetter({ setter: setEnvio }),
    // }),
    // createTextFieldItem({
    //   xs: 2,
    //   id: "telefono",
    //   label: "Teléfono",
    //   value: telefono,
    //   setValue: createDefaultSetter({ setter: setTelefono }),
    // }),
    // createTextFieldItem({
    //   xs: 2,
    //   id: "ciudad",
    //   label: "Ciudad",
    //   value: ciudad,
    //   setValue: createDefaultSetter({ setter: setCiudad }),
    // }),
    // createTextFieldItem({
    //   xs: 2,
    //   id: "zona",
    //   label: "Zona geográfica",
    //   value: zona,
    // }),
    // createTextFieldItem({
    //   xs: 3,
    //   id: "credito",
    //   label: "Cupo crédito",
    //   value: credito,
    // }),
    // createTextFieldItem({
    //   xs: 3,
    //   id: "saldo",
    //   label: "Saldo actual",
    //   value: disponible,
    // }),
    // createTextFieldItem({
    //   xs: 2,
    //   id: "categoria",
    //   label: "Categoría",
    //   value: categoria,
    // }),
    // createTextFieldItem({
    //   xs: 2,
    //   id: "tipo",
    //   label: "Tipo cliente",
    //   value: tipoCliente,
    // }),
    // createTextFieldItem({
    //   xs: 2,
    //   id: "cartera_vencida",
    //   label: "Cartera Vencida",
    //   value: carteraVencida,
    // }),
    createTextFieldItem({
      xs: 12,
      id: "observacion",
      label: "Observaciones",
      value: observacion,
      setValue: createDefaultSetter({ setter: setObservacion }),
      required: false,
      rows: 3,
    }),
  ];

  const itemsAgregarProducto = [
    createTextFieldItem({
      xs: 2,
      id: "codigo-prod",
      label: "Código",
      value: codigoProd,
      setValue: (e) => {
        const nuevoCod = e.target.value ?? "";
        setCodigoProd(nuevoCod);
        setProductosFiltrados(
          productos.filter(
            (prod) =>
              filtrarCampo(prod, "cod_producto", nuevoCod) &&
              productos.filter((prod) =>
                filtrarCampo(prod, "nombre", nombreProd)
              )
          )
        );
      },
    }),
    createTextFieldItem({
      xs: 3,
      id: "nombre-prod",
      label: "Nombre",
      value: nombreProd,
      setValue: (e) => {
        const nuevoNombre = e.target.value ?? "";
        setNombreProd(nuevoNombre);
        setProductosFiltrados(
          productos.filter(
            (prod) =>
              filtrarCampo(prod, "nombre", nuevoNombre) &&
              filtrarCampo(prod, "cod_producto", codigoProd)
          )
        );
      },
    }),
  ];

  const modalCargandoClientes = (
    <LoadingModal esVisible={cargando} mensaje="Cargando clientes" />
  );

  const header = <Header menus={menus} />;

  const btnRegistrar = (
    <div style={{ textAlign: "center" }}>
      <BtnNuevo onClick={setearPagina(1)} texto="Registrar pedido" />
    </div>
  );

  const contenidoCabeceraPedido = <CustomGrid items={itemsCabeceraPedido} />;

  const contenidoDetallePedido = (
    <ThemeProvider theme={getMuiTheme()}>
      <Typography variant="h6" style={{ marginTop: 20, marginBottom: 10 }}>
        Detalle de Productos
      </Typography>
      <Paper variant="outlined" style={{ padding: 10 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: "bold" }}>Sec</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Cod Pedido</TableCell>
                <TableCell style={{ fontWeight: "bold", width: "300px" }}>
                  Producto
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Agencia</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Exist.</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Lote</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Exist.Lote</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Cant.</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>P.Unit</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Subtotal</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosPedido.map((prod, idx) => {
                return (
                  <TableRow
                    key={idx}
                    style={prod.readOnly ? { opacity: 0.5 } : {}}
                  >
                    <TableCell>{prod.cod_producto || ""}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <BtnNuevo
          onClick={() => setAgregarProducto(true)}
          texto="Agregar producto"
          icon={false}
        />
      </Paper>
    </ThemeProvider>
  );

  const contenidoAgregarProducto = (
    <>
      <CustomGrid items={itemsAgregarProducto} />
      <ThemeProvider theme={getMuiTheme()}>
        {productosFiltrados.map((prod) => (
          <Paper
            key={prod.cod_producto}
            style={{
              padding: 10,
              marginBottom: 5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginLeft: "16px",
            }}
          >
            <div
              style={{ flex: 1, cursor: "pointer" }}
              onClick={() => handleSelectProduct(prod)}
            >
              <Typography variant="body2">
                {`${prod.cod_producto} - ${prod.nombre}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Modelos: {prod.cod_modelo}
              </Typography>
            </div>
          </Paper>
        ))}
      </ThemeProvider>
    </>
  );

  const dialogo1RegistrarPedido = (
    <CustomDialog
      titulo="Registrar Pedido - Cabecera"
      contenido={contenidoCabeceraPedido}
      open={pagina === 1}
      handleClose={setearPagina(0)}
      handleCancel={setearPagina(0)}
      handleConfirm={() => {
        if (
          politica.cod_politica === "" ||
          vendedor.cod_persona_vendor === "" ||
          cliente.cod_persona === ""
        ) {
          toast.warn(
            "Debe seleccionar: política, agente y cliente para avanzar"
          );
          return;
        }
        setearPagina(2)();
      }}
      confirmText="Siguiente"
      maxWidth="md"
    />
  );

  const dialogo2RegistrarPedido = (
    <CustomDialog
      titulo="Registrar Pedido - Detalle"
      contenido={contenidoDetallePedido}
      open={pagina === 2}
      handleClose={setearPagina(1)}
      handleCancel={setearPagina(1)}
      handleConfirm={setearPagina(3)}
      confirmText="Siguiente"
      cancelText="Atrás"
      maxWidth="xl"
    />
  );

  const dialogoAgregarProducto = (
    <CustomDialog
      titulo="Agregar Producto"
      contenido={contenidoAgregarProducto}
      open={agregarProducto}
      handleClose={() => {
        setAgregarProducto(false);
      }}
      handleCancel={() => {
        setAgregarProducto(false);
        setCodigoProd("");
        setNombreProd("");
        setProductosFiltrados([]);
      }}
      maxWidth="md"
    />
  );

  useEffect(() => {
    document.title = "Registrar pedido";
    getMenus();
    getPoliticas();
    getVendedores();
    getProductos();
  }, []);

  useEffect(() => {
    setClientes([]);
    if (politica.cod_politica !== "") {
      getClientes(politica.cod_politica);
    }
  }, [politica]);

  useEffect(() => {
    if (cliente.cod_persona !== "") {
      APIService.getCliente(politica.cod_politica, cliente.cod_persona)
        .then((cliente) => {
          setEnvio(cliente.direccion_envio);
          setTelefono(cliente.telefono);
          setCiudad(cliente.ciudad);
          setZona(cliente.zona_geografica);
          setCredito(cliente.cupo_credito);
          setDisponible(cliente.cupo_disponible);
          setCategoria(cliente.cod_cat_cliente);
          setTipoCliente(cliente.cod_tipo_clienteh);
          setCarteraVencida(cliente.cartera_vencida);
        })
        .catch((err) =>
          toast.error("Ocurrió un error al consultar el cliente")
        );
    }
  }, [cliente]);

  return (
    <MainComponent
      components={[
        header,
        btnRegistrar,
        dialogo1RegistrarPedido,
        modalCargandoClientes,
        dialogo2RegistrarPedido,
        dialogoAgregarProducto,
      ]}
    />
  );
}
