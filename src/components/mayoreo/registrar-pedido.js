import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/authContext";
import API from "../../services/mayoreo";
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
  IconButton,
  TextField,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import OpacityIcon from "@mui/icons-material/Opacity";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  CuotasPedido,
  DefaultCuotas,
  DefaultFormaPago,
  Enum,
  FormasPago,
  TiposRetorno,
} from "../formulas/common/enum";
import CustomSelect from "../formulas/common/custom-select";
import {
  formatearFechaInput,
  validarTipoRetornoYConvertir,
} from "../../helpers/modulo-formulas";

const shapePolitica = {
  cod_politica: "",
  label_politica: "Seleccione",
};
const shapeVendedor = {
  cod_persona_vendor: "",
  label_vendedor: "Seleccione",
};
const shapeCliente = {
  cod_persona: "",
  label_cliente: "Seleccione",
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
            textAlign: "center",
          },
          head: {
            backgroundColor: "firebrick",
            color: "#ffffff",
            fontWeight: "bold",
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

const filtrarProductos = (productos, codigo, nombre, codItemCat) =>
  codigo === "" && nombre === "" && codItemCat === ""
    ? []
    : productos.filter(
        (prod) =>
          filtrarCampo(prod, "cod_producto", codigo) &&
          filtrarCampo(prod, "nombre", nombre) &&
          filtrarCampo(prod, "cod_item_cat", codItemCat)
      );

const COD_AGENCIA = 25;
const COD_TIPO_PEDIDO = "PE";
const COD_TIPO_PERSONA_CLI = "CLI";
const COD_MODELO_CAT = "PRO2";
const COD_ITEM_CAT = "Y,E,T,L";
const COD_MODELO = "PRO1";
const COD_TIPO_CLIENTE_H = "MY";
const COD_UNIDAD = "U";
const COD_DIVISA = "DOLARES";
const TIENE_IVA = "S";
const TIENE_ICE = "S";
const COD_PEDIDO = 0;
const COD_TIPO_PERSONA_VEN = "VEN";
const COD_BODEGA_DESPACHO = 25;
const TIPO_CANTIDAD = "P";
const COD_TIPO_PRODUCTO = "A";
const DIAS_VALIDEZ = 30;
const PLAZO = 60;

export default function RegistrarPedido() {
  const { jwt, userShineray, enterpriseShineray, systemShineray } =
    useAuthContext();
  const APIService = useMemo(
    () => new API(jwt, userShineray, enterpriseShineray, systemShineray),
    [jwt]
  );
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [mensajeCargando, setMensajeCargando] = useState("");
  const [politicas, setPoliticas] = useState([]);
  const [politica, setPolitica] = useState(shapePolitica);
  const [nombrePolitica, setNombrePolitica] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [vendedor, setVendedor] = useState(shapeVendedor);
  const [nombreVendedor, setNombreVendedor] = useState("");
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(shapeCliente);
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [cuotas, setCuotas] = useState(DefaultCuotas);
  const [formaPago, setFormaPago] = useState(DefaultFormaPago);
  const [porcentajeInteres, setPorcentajeInteres] = useState(0);
  const [factorCredito, setFactorCredito] = useState(0);
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [zona, setZona] = useState("");
  const [credito, setCredito] = useState(0);
  const [disponible, setDisponible] = useState(0);
  const [categoria, setCategoria] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [carteraVencida, setCarteraVencida] = useState(0);
  const [codigoProducto, setCodigoProducto] = useState("");
  const [nombreProducto, setNombreProducto] = useState("");
  const [codItemCatProducto, setCodItemCatProducto] = useState("");
  const [productosPedido, setProductosPedido] = useState([]);
  const [agregarProducto, setAgregarProducto] = useState(false);
  const [ICEPedido, setICEPedido] = useState(0);
  const [financiamientoPedido, setFinanciamientoPedido] = useState(0);
  const [valorPedido, setValorPedido] = useState(0);

  const [observacion, setObservacion] = useState("");

  const getPoliticas = async () => {
    try {
      setPoliticas(
        (await APIService.getPoliticas(COD_AGENCIA)).map((pol) => ({
          ...pol,
          label_politica: `${pol.cod_politica} - ${pol.nombre}`,
        }))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getVendedores = async () => {
    try {
      setVendedores(
        (await APIService.getVendedores(COD_AGENCIA)).map((ven) => ({
          ...ven,
          label_vendedor: `${ven.cod_persona_vendor} - ${ven.nombre}`,
        }))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProductos = async () => {
    try {
      setProductos(
        await APIService.getProductos(COD_MODELO_CAT, COD_ITEM_CAT, COD_MODELO)
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getClientes = async (politica) => {
    try {
      setMensajeCargando("Cargando clientes");
      setCargando(true);
      setClientes(
        (
          await APIService.getClientes(COD_AGENCIA, politica, COD_TIPO_PEDIDO)
        ).map((cli) => ({
          ...cli,
          label_cliente: `${cli.cod_persona} - ${cli.nombre}`,
        }))
      );
      setMensajeCargando("");
      setCargando(false);
    } catch (err) {
      setMensajeCargando("");
      setCargando(false);
      toast.error(err.message);
    }
  };

  const setearPagina = (pagina) => () => {
    setPagina(pagina);
  };

  const calcularValorPedido = () => {
    const valor =
      productosPedido.length === 0
        ? 0
        : productosPedido.reduce((accum, item) => accum + item.subtotal, 0);
    setValorPedido(valor);
  };

  const calcularICEPedido = () => {
    const valor =
      productosPedido.length === 0
        ? 0
        : productosPedido.reduce((accum, item) => accum + item.ice, 0);
    setICEPedido(valor);
  };

  const calcularFinanciamientoPedido = () => {
    const valor =
      productosPedido.length === 0
        ? 0
        : productosPedido.reduce(
            (accum, item) => accum + item.financiamiento,
            0
          );
    setFinanciamientoPedido(valor);
  };

  const handleSelectProduct = async (prod) => {
    setMensajeCargando("Agregando producto");
    setCargando(true);
    const newProd = { ...prod };
    newProd.secuencia = (productosPedido.at(-1)?.secuencia ?? 0) + 1;
    newProd.cantidad_pedida = 1;
    let descuentoProd, precioProd;
    try {
      descuentoProd = await APIService.getDescuentoProducto(
        COD_AGENCIA,
        politica.cod_politica,
        COD_MODELO_CAT,
        newProd.cod_item_cat,
        newProd.cod_producto,
        cuotas,
        cliente.cod_persona,
        COD_PEDIDO,
        COD_TIPO_PEDIDO,
        newProd.secuencia
      );
      newProd.descuento = descuentoProd.descuento;
      precioProd = await APIService.getPrecioProducto(
        COD_AGENCIA,
        politica.cod_politica,
        COD_MODELO_CAT,
        newProd.cod_item_cat,
        newProd.cod_producto,
        cuotas,
        cliente.cod_persona,
        COD_TIPO_PEDIDO,
        newProd.cantidad_pedida,
        COD_TIPO_PEDIDO,
        COD_UNIDAD,
        newProd.cantidad_pedida,
        COD_UNIDAD,
        formaPago,
        COD_DIVISA,
        formatearFechaInput(new Date()),
        formaPago,
        null,
        null,
        newProd.descuento,
        factorCredito,
        TIENE_IVA,
        TIENE_ICE,
        new Date().getFullYear()
      );
    } catch (err) {
      setCargando(false);
      setMensajeCargando("");
      toast.error(err.message);
      return;
    }
    newProd.financiamiento = precioProd.financiamiento;
    newProd.ice = precioProd.ice;
    newProd.precio = precioProd.precio;
    newProd.precio_lista = precioProd.precio_lista;
    newProd.precio_descontado = precioProd.precio_descontado;
    newProd.subtotal = newProd.cantidad_pedida * newProd.precio_descontado;
    newProd.valor_iva = precioProd.valor_iva;
    newProd.valor_linea = precioProd.valor_linea;
    const primeraDireccion = Object.keys(direccionesCliente)[0];
    if (!primeraDireccion) {
      setCargando(false);
      setMensajeCargando("");
      toast.warn("El cliente no tiene direcciones para asignar al producto");
      return;
    }
    newProd.cod_direccion = primeraDireccion;
    setProductosPedido((prev) => {
      if (prev.find((prod) => prod.cod_producto === newProd.cod_producto)) {
        setCargando(false);
        setMensajeCargando("");
        toast.warn("El producto ya fue agregado");
        return prev;
      }
      setAgregarProducto(false);
      setCodigoProducto("");
      setNombreProducto("");
      setProductosFiltrados([]);
      setCargando(false);
      setMensajeCargando("");
      return prev.concat(newProd);
    });
  };

  const handleQuitarProducto = (indice) => {
    setProductosPedido((prev) => {
      return prev.filter((prod, idx) => idx !== indice);
    });
  };

  const handleCambiarCantidad = (idx, cantidad) => {
    const productoPedido = { ...productosPedido[idx] };
    productoPedido.cantidad_pedida = cantidad;
    productoPedido.subtotal =
      productoPedido.cantidad_pedida * productoPedido.precio_descontado;
    setProductosPedido((prev) => {
      prev[idx] = productoPedido;
      return [...prev];
    });
  };

  const handleCambiarDescuento = async (idx, descuento) => {
    setMensajeCargando("Calculando descuento");
    setCargando(true);
    const productoPedido = { ...productosPedido[idx] };
    productoPedido.descuento = descuento;
    let precioProd;
    try {
      precioProd = await APIService.getPrecioProducto(
        COD_AGENCIA,
        politica.cod_politica,
        COD_MODELO_CAT,
        productoPedido.cod_item_cat,
        productoPedido.cod_producto,
        cuotas,
        cliente.cod_persona,
        COD_TIPO_PEDIDO,
        productoPedido.cantidad,
        COD_TIPO_PEDIDO,
        COD_UNIDAD,
        productoPedido.cantidad_pedida,
        COD_UNIDAD,
        formaPago,
        COD_DIVISA,
        formatearFechaInput(new Date()),
        formaPago,
        null,
        null,
        productoPedido.descuento,
        factorCredito,
        TIENE_IVA,
        TIENE_ICE,
        new Date().getFullYear()
      );
    } catch (err) {
      toast.error(err.message);
      setMensajeCargando("");
      setCargando(false);
      return;
    }
    productoPedido.precio_descontado = precioProd.precio_descontado;
    productoPedido.subtotal =
      productoPedido.cantidad_pedida * productoPedido.precio_descontado;
    setProductosPedido((prev) => {
      setMensajeCargando("");
      setCargando(false);
      prev[idx] = productoPedido;
      return [...prev];
    });
  };

  const autocompletePoliticas = (
    <AutocompleteObject
      id="Política"
      value={politica}
      optionId="cod_politica"
      shape={shapePolitica}
      options={politicas}
      optionLabel="label_politica"
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
      optionLabel="label_vendedor"
      onChange={(e, value) => {
        if (value) {
          setVendedor(value);
          setNombreVendedor(value.nombre);
        } else {
          setVendedor(shapeVendedor);
          setNombreVendedor("");
        }
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
      optionLabel="label_cliente"
      onChange={(e, value) => {
        if (value) {
          setCliente(value);
          setNombreCliente(value.nombre);
        } else {
          setCliente(shapeCliente);
          setNombreCliente("");
        }
      }}
      disabled={politica.cod_politica === ""}
    />
  );

  const selectCuotas = (
    <CustomSelect
      label="Cuotas"
      disabled={politica.cod_politica === "" || cliente.cod_persona === ""}
      options={CuotasPedido}
      value={cuotas}
      blankOption={false}
      onChange={(e) => {
        setMensajeCargando("Calculando valores");
        setCargando(true);
        const nuevasCuotas = e.target.value;
        APIService.getDetallePolitica(
          COD_AGENCIA,
          politica.cod_politica,
          COD_TIPO_PEDIDO,
          cliente.cod_persona,
          COD_TIPO_PERSONA_CLI,
          nuevasCuotas,
          COD_TIPO_CLIENTE_H
        )
          .then((res) => {
            const interes = res.por_interes_final ?? 0;
            const factor = res.factor_credito_final ?? 0;
            if (interes === 0 && factor === 0)
              throw new Error("La política está inactiva");
            setCuotas(nuevasCuotas);
            setFormaPago(
              res.cod_forma_pago_final ??
                (nuevasCuotas === 0 ? FormasPago.EFE.key : FormasPago.CRE.key)
            );
            setPorcentajeInteres(interes);
            setFactorCredito(factor);
          })
          .catch((err) => {
            toast.error(err.message);
            setCuotas(cuotas);
            setFormaPago(formaPago);
            setPorcentajeInteres(porcentajeInteres);
            setFactorCredito(factorCredito);
          })
          .finally(() => {
            setMensajeCargando("");
            setCargando(false);
          });
      }}
    />
  );

  const selectFormaPago = (
    <CustomSelect label="Forma pago" options={FormasPago} value={formaPago} />
  );

  const SelectDirecciones = ({ idx, valor }) => (
    <CustomSelect
      label="Direcciones"
      options={direccionesCliente}
      value={valor}
      blankOption={false}
      onChange={(e) => {
        const nuevaDireccion = e.target.value;
        const nuevosProductos = [...productosPedido];
        const nuevoProducto = nuevosProductos[idx];
        nuevoProducto.cod_direccion = nuevaDireccion;
        setProductosPedido(nuevosProductos);
      }}
    />
  );

  const itemsCabeceraPedido = [
    createCustomComponentItem(3, "politica", autocompletePoliticas),
    createTextFieldItem({
      xs: 3,
      id: "nombre-politica",
      label: "Nombre política",
      value: nombrePolitica,
    }),
    createCustomComponentItem(3, "agente", autocompleteVendedores),
    createTextFieldItem({
      xs: 3,
      id: "nombre-agente",
      label: "Nombre agente",
      value: nombreVendedor,
    }),
    createCustomComponentItem(4, "cliente", autocompleteClientes),
    createTextFieldItem({
      xs: 8,
      id: "nombre-cliente",
      label: "Nombre cliente",
      value: nombreCliente,
    }),
    createCustomComponentItem(3, "cuotas", selectCuotas),
    createCustomComponentItem(3, "forma-pago", selectFormaPago),
    createTextFieldItem({
      xs: 3,
      id: "porcentajeInteres",
      label: "% Interés",
      value: porcentajeInteres,
      type: "number",
    }),
    createTextFieldItem({
      xs: 3,
      id: "factor",
      label: "Factor crédito",
      value: factorCredito,
      type: "number",
    }),
    createTextFieldItem({
      xs: 6,
      id: "direccion",
      label: "Dirección de envío",
      value: direccionEnvio,
      setValue: createDefaultSetter({ setter: setDireccionEnvio }),
    }),
    createTextFieldItem({
      xs: 3,
      id: "telefono",
      label: "Teléfono",
      value: telefono,
      setValue: createDefaultSetter({ setter: setTelefono }),
    }),
    createTextFieldItem({
      xs: 3,
      id: "ciudad",
      label: "Ciudad",
      value: ciudad,
      setValue: createDefaultSetter({ setter: setCiudad }),
    }),
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
      xs: 3,
      id: "codigo-prod",
      label: "Código",
      value: codigoProducto,
      setValue: (e) => {
        const nuevoCod = e.target.value ?? "";
        setCodigoProducto(nuevoCod);
        setProductosFiltrados(
          filtrarProductos(
            productos,
            nuevoCod,
            nombreProducto,
            codItemCatProducto
          )
        );
      },
    }),
    createTextFieldItem({
      xs: 5,
      id: "nombre-prod",
      label: "Nombre",
      value: nombreProducto,
      setValue: (e) => {
        const nuevoNombre = e.target.value ?? "";
        setNombreProducto(nuevoNombre);
        setProductosFiltrados(
          filtrarProductos(
            productos,
            codigoProducto,
            nuevoNombre,
            codItemCatProducto
          )
        );
      },
    }),
    createCustomComponentItem(
      1,
      "filtro-moto",
      <div style={{ textAlign: "center" }}>
        <IconButton
          size="small"
          onClick={() => {
            let nuevoCodItemCat = "T";
            if (codItemCatProducto === nuevoCodItemCat) {
              nuevoCodItemCat = "";
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            } else {
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            }
          }}
          color={codItemCatProducto === "T" ? "error" : "default"}
        >
          <TwoWheelerIcon />
        </IconButton>
      </div>
    ),
    createCustomComponentItem(
      1,
      "filtro-electrica",
      <div style={{ textAlign: "center" }}>
        <IconButton
          size="small"
          onClick={() => {
            let nuevoCodItemCat = "E";
            if (codItemCatProducto === nuevoCodItemCat) {
              nuevoCodItemCat = "";
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            } else {
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            }
          }}
          color={codItemCatProducto === "E" ? "error" : "default"}
        >
          <FlashOnIcon />
        </IconButton>
      </div>
    ),
    createCustomComponentItem(
      1,
      "filtro-lubricante",
      <div style={{ textAlign: "center" }}>
        <IconButton
          size="small"
          onClick={() => {
            let nuevoCodItemCat = "L";
            if (codItemCatProducto === nuevoCodItemCat) {
              nuevoCodItemCat = "";
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            } else {
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            }
          }}
          color={codItemCatProducto === "L" ? "error" : "default"}
        >
          <OpacityIcon />
        </IconButton>
      </div>
    ),
    createCustomComponentItem(
      1,
      "filtro-direccion-envio",
      <div style={{ textAlign: "center" }}>
        <IconButton
          size="small"
          onClick={() => {
            let nuevoCodItemCat = "Y";
            if (codItemCatProducto === nuevoCodItemCat) {
              nuevoCodItemCat = "";
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            } else {
              setCodItemCatProducto(nuevoCodItemCat);
              setProductosFiltrados(
                filtrarProductos(
                  productos,
                  codigoProducto,
                  nombreProducto,
                  nuevoCodItemCat
                )
              );
            }
          }}
          color={codItemCatProducto === "Y" ? "error" : "default"}
        >
          <LocalShippingIcon />
        </IconButton>
      </div>
    ),
  ];

  const modalCargando = (
    <LoadingModal esVisible={cargando} mensaje={mensajeCargando} />
  );

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
                <TableCell style={{ width: "10%" }}>Código</TableCell>
                <TableCell style={{ width: "20%" }}>Producto</TableCell>
                <TableCell style={{ width: "10%" }}>Precio</TableCell>
                <TableCell style={{ width: "10%" }}>% Desc</TableCell>
                <TableCell style={{ width: "10%" }}>P Desc</TableCell>
                <TableCell style={{ width: "10%" }}>Cantidad</TableCell>
                <TableCell style={{ width: "10%" }}>Subtotal</TableCell>
                <TableCell style={{ width: "10%" }}>Dirección</TableCell>
                <TableCell style={{ width: "10%" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosPedido.map((prod, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell>{prod.cod_producto}</TableCell>
                    <TableCell>{prod.nombre}</TableCell>
                    <TableCell>{prod.precio.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={prod.descuento}
                        onChange={(e) => {
                          let descuento = e.target.value;
                          try {
                            descuento = validarTipoRetornoYConvertir(
                              TiposRetorno.NUMERO,
                              descuento
                            );
                            if (descuento > 100) {
                              toast.error(
                                "El descuento debe ser máximo del 100%"
                              );
                              descuento = 0;
                            }
                          } catch (err) {
                            descuento = 0;
                          }
                          handleCambiarDescuento(idx, descuento);
                        }}
                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                        sx={{ width: "100%" }}
                      />
                    </TableCell>
                    <TableCell>{prod.precio_descontado.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={prod.cantidad_pedida}
                        onChange={(e) => {
                          let cantidad = e.target.value;
                          try {
                            cantidad = validarTipoRetornoYConvertir(
                              TiposRetorno.NUMERO,
                              cantidad
                            );
                          } catch (err) {
                            cantidad = 1;
                          }
                          handleCambiarCantidad(idx, cantidad);
                        }}
                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                        sx={{ width: "100%" }}
                      />
                    </TableCell>
                    <TableCell>{prod.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <SelectDirecciones idx={idx} valor={prod.cod_direccion} />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleQuitarProducto(idx)}
                      >
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ marginTop: "1%", textAlign: "center" }}>
          <BtnNuevo
            onClick={() => setAgregarProducto(true)}
            texto="Agregar producto"
            icon={false}
          />
        </div>
      </Paper>
      <Typography
        variant="h6"
        align="right"
        style={{ fontWeight: "bold", marginTop: 15, marginRight: "2%" }}
      >
        Total: {valorPedido.toFixed(2)}
      </Typography>
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

  const contenidoResumenPedido = (
    <ThemeProvider theme={getMuiTheme()}>
      <Typography variant="h6" style={{ marginTop: 20, marginBottom: 10 }}>
        Resumen de Productos
      </Typography>
      <Paper variant="outlined" style={{ padding: 10 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Secuencia</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>% Desc</TableCell>
                <TableCell>P Desc</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>Dirección</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosPedido.map((prod, idx) => {
                return (
                  <TableRow key={idx} style={{ opacity: 0.5 }}>
                    <TableCell style={{ width: "10%" }}>
                      {prod.secuencia}
                    </TableCell>
                    <TableCell style={{ width: "30%" }}>
                      {prod.nombre}
                    </TableCell>
                    <TableCell style={{ width: "10%" }}>
                      {prod.descuento}
                    </TableCell>
                    <TableCell style={{ width: "15%" }}>
                      {prod.precio_descontado.toFixed(2)}
                    </TableCell>
                    <TableCell style={{ width: "10%" }}>
                      {prod.cantidad_pedida}
                    </TableCell>
                    <TableCell style={{ width: "15%" }}>
                      {prod.subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell style={{ width: "10%" }}>
                      {direccionesCliente[prod.cod_direccion].label}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Typography
        variant="h6"
        align="right"
        style={{ fontWeight: "bold", marginTop: 15, marginRight: "2%" }}
      >
        Total: {valorPedido.toFixed(2)}
      </Typography>
      <Typography variant="body1" align="center" color={"red"} marginTop={"2%"}>
        <b>Importante:</b> verifique que los datos sean correctos antes de
        grabar el pedido
      </Typography>
    </ThemeProvider>
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
        setPagina(2);
      }}
      confirmText="Siguiente"
      maxWidth="xl"
    />
  );

  const dialogo2RegistrarPedido = (
    <CustomDialog
      titulo="Registrar Pedido - Detalle"
      contenido={contenidoDetallePedido}
      open={pagina === 2}
      handleClose={setearPagina(1)}
      handleCancel={setearPagina(1)}
      handleConfirm={() => {
        if (productosPedido.length === 0) {
          toast.warn(
            "Para continuar al menos debe agregar un producto al pedido"
          );
          return;
        }
        setPagina(3);
      }}
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
        setCodItemCatProducto("");
      }}
      handleCancel={() => {
        setAgregarProducto(false);
        setCodItemCatProducto("");
        setCodigoProducto("");
        setNombreProducto("");
        setProductosFiltrados([]);
      }}
      maxWidth="md"
    />
  );

  const dialogo3RegistrarPedido = (
    <CustomDialog
      titulo="Registrar Pedido - Resumen"
      contenido={contenidoResumenPedido}
      open={pagina === 3}
      handleClose={setearPagina(2)}
      handleCancel={setearPagina(2)}
      handleConfirm={async () => {
        setMensajeCargando("Grabando pedido");
        setCargando(true);
        try {
          const codPedido = await APIService.getCodPedido(
            COD_AGENCIA,
            COD_TIPO_PEDIDO
          );
          const codLiquidacion = await APIService.getCodLiquidacion(
            COD_AGENCIA
          );
          const fechaActual = new Date().toISOString().slice(0, 19);
          const cabecera = {
            COD_TIPO_PERSONA_VEN,
            TIENE_ICE: "S",
            ES_PENDIENTE: "S",
            OBSERVACIONES: observacion,
            COD_TIPO_PEDIDO: "PE",
            CIUDAD: ciudad,
            COD_LIQUIDACION: codLiquidacion.cod_liquidacion,
            COD_PEDIDO: codPedido.cod_pedido,
            ES_APROBADO_VEN: "N",
            ES_APROBADO_CAR: "N",
            ES_BLOQUEADO: "N",
            REVISADO: "N",
            ES_FACTURADO: "N",
            ES_ANULADO: "N",
            ES_PEDIDO_REPUESTOS: "N",
            ADICIONADO_POR: userShineray,
            MODIFICADO_POR: userShineray,
            COD_PERSONA_VEN: vendedor.cod_persona_vendor,
            COD_FORMA_PAGO: formaPago,
            COD_TIPO_PERSONA_CLI,
            COD_TIPO_PERSONA_GAR: COD_TIPO_PERSONA_CLI,
            DIRECCION_ENVIO: direccionEnvio,
            TIPO_PEDIDO: "A",
            COD_POLITICA: politica.cod_politica,
            ICE: ICEPedido,
            TELEFONO: telefono,
            DIAS_VALIDEZ,
            COD_BODEGA_DESPACHO,
            COD_AGENCIA,
            EMPRESA: enterpriseShineray,
            NUM_CUOTAS: cuotas,
            COD_PERSONA_CLI: cliente.cod_persona,
            VALOR_PEDIDO: valorPedido,
            FECHA_MODIFICACION: fechaActual,
            FECHA_ADICION: fechaActual,
            FECHA_PEDIDO: fechaActual,
            FINANCIAMIENTO: financiamientoPedido,
            COMPROBANTE_MANUAL: "0",
            ES_FACTURA_CONSIGNACION: 0,
          };
          const detalles = productosPedido.map((prod) => ({
            ES_PENDIENTE: "S",
            COD_TIPO_PEDIDO,
            TIPO_CANTIDAD,
            COD_PEDIDO: codPedido.cod_pedido,
            ES_ANULADO: "N",
            COD_PRODUCTO: prod.cod_producto,
            COD_TIPO_PRODUCTO,
            VALOR_LINEA: prod.valor_linea,
            PLAZO,
            ICE: prod.ice,
            COD_AGENCIA,
            EMPRESA: enterpriseShineray,
            NUM_CUOTAS: cuotas,
            VALOR_IVA: prod.valor_iva,
            COD_CLIENTE: cliente.cod_persona,
            PRECIO_LISTA: prod.precio_lista,
            PRECIO_DESCONTADO: prod.precio_descontado,
            PRECIO: prod.precio,
            CANTIDAD_PEDIDA: prod.cantidad_pedida,
            SECUENCIA: prod.secuencia,
            COD_DIRECCION: prod.cod_direccion,
            DESCUENTO: prod.descuento,
            CANTIDAD_DESPACHADA: 0,
            FINANCIAMIENTO: prod.financiamiento,
            PORCENTAJE_INTERES: porcentajeInteres,
            CANTIDAD_PRODUCIDA: 0,
            ES_CONFIRMADO_BOD: 0,
            CANTIDAD_A_ENVIAR: 0,
          }));
          const pedido = { cabecera, detalles };
          await APIService.postPedido(pedido);
          toast.success(`Pedido ${codPedido.cod_pedido} grabado`);
          setPagina(0);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setCargando(false);
          setMensajeCargando("");
        }
      }}
      confirmText="Grabar"
      cancelText="Atrás"
      maxWidth="xl"
    />
  );

  useEffect(() => {
    getPoliticas();
    getVendedores();
    getProductos();
  }, []);

  useEffect(() => {
    setCliente(shapeCliente);
    if (politica.cod_politica !== "") {
      setNombrePolitica(politica.nombre);
      getClientes(politica.cod_politica);
    } else {
      setClientes([]);
      setNombrePolitica("");
    }
  }, [politica]);

  useEffect(() => {
    if (cliente.cod_persona !== "") {
      setMensajeCargando("Cargando datos del cliente");
      setCargando(true);
      setProductosPedido([]);
      APIService.getCliente(
        COD_AGENCIA,
        politica.cod_politica,
        COD_TIPO_PEDIDO,
        cliente.cod_persona,
        COD_TIPO_PERSONA_CLI
      )
        .then((cliente) => {
          setDireccionEnvio(cliente.direccion_envio);
          setTelefono(cliente.telefono);
          setCiudad(cliente.ciudad);
          setZona(cliente.zona_geografica);
          setCredito(cliente.cupo_credito);
          setDisponible(cliente.cupo_disponible);
          setCategoria(cliente.cod_cat_cliente);
          setTipoCliente(cliente.cod_tipo_clienteh);
          setCarteraVencida(cliente.cartera_vencida);
          setMensajeCargando("Cargando direcciones del cliente");
          APIService.getDireccionesCliente(cliente.cod_persona_cli)
            .then((res) => {
              if (!res || res.length === 0) {
                toast.error("El cliente no tiene direcciones");
                setNombreCliente("");
                setDireccionEnvio("");
                setTelefono("");
                setCiudad("");
                return;
              }
              const enumDirs = res.reduce(
                (accum, cur) => ({
                  ...accum,
                  [`${cur.cod_direccion}`]: new Enum(
                    cur.cod_direccion,
                    `${cur.cod_direccion} - ${cur.direccion}`
                  ),
                }),
                {}
              );
              setDireccionesCliente(enumDirs);
            })
            .catch((err) => {
              toast.error(
                "Ocurrió un error al consultar las direcciones del cliente"
              );
              setNombreCliente("");
              setDireccionEnvio("");
              setTelefono("");
              setCiudad("");
            })
            .finally(() => {
              setCargando(false);
              setMensajeCargando("");
            });
        })
        .catch((err) => {
          setCargando(false);
          setMensajeCargando("");
          setNombreCliente("");
          setDireccionEnvio("");
          setTelefono("");
          setCiudad("");
          toast.error("Ocurrió un error al consultar el cliente");
        });
    } else {
      setNombreCliente("");
      setDireccionEnvio("");
      setTelefono("");
      setCiudad("");
    }
  }, [cliente]);

  useEffect(() => {
    if (
      politica.cod_politica === "" ||
      vendedor.cod_persona_vendor === "" ||
      cliente.cod_persona === ""
    ) {
      setCuotas(DefaultCuotas);
      setFormaPago(DefaultFormaPago);
      setPorcentajeInteres(0);
      setFactorCredito(0);
    }
  }, [politica, vendedor, cliente]);

  useEffect(() => {
    calcularValorPedido();
    calcularICEPedido();
    calcularFinanciamientoPedido();
  }, [productosPedido]);

  return (
    <>
      {btnRegistrar}
      {dialogo1RegistrarPedido}
      {modalCargando}
      {dialogo2RegistrarPedido}
      {dialogoAgregarProducto}
      {dialogo3RegistrarPedido}
    </>
  );
}
