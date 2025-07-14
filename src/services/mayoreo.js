import axios from "axios";

export default class API {
  #BASE_URL;
  #URL;
  #jwt;
  #user;
  #enterprise;
  #system;

  constructor(jwt, user, enterprise, system) {
    this.#jwt = jwt;
    this.#user = user;
    this.#enterprise = enterprise;
    this.#system = system;
    this.#BASE_URL = process.env.REACT_APP_API;
    this.#URL = `${this.#BASE_URL}/order_mot`;
  }

  get #headers() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.#jwt,
      },
    };
  }

  #errorHandler(fn) {
    return async (...args) => {
      try {
        const res = await fn(...args);
        if (!res.data) {
          if (res.status === 204) {
            let mensaje;
            if (res.config.method === "put" || res.config.method === "patch") {
              mensaje = "Actualización exitosa";
            }
            if (res.config.method === "delete") {
              mensaje = "Eliminación exitosa";
            }
            res.data = mensaje;
          }
        } else {
          if (res.config.method !== "get") {
            res.data = res.data.mensaje;
          }
        }
        return res.data;
      } catch (err) {
        console.log(`Error en ${err.config.url}`);
        let mensaje = "Ocurrió un error en la llamada a la API";
        if (err.response) {
          const {
            response: { status, data },
          } = err;
          if (status === 401) {
            mensaje = "Sesión caducada. Por favor, inicia sesión nuevamente.";
          } else if (data.mensaje) {
            ({ mensaje } = data);
          }
          mensaje = data.error ?? mensaje;
        }
        throw new Error(mensaje);
      }
    };
  }

  getMenus = this.#errorHandler(async () => {
    return await axios.get(
      `${this.#BASE_URL}/menus/${this.#user}/${this.#enterprise}/${this.#system
      }`,
      this.#headers
    );
  });

  getPoliticas = this.#errorHandler(async (agencia) => {
    return await axios.get(
      `${this.#URL}/credit_policies?empresa=${this.#enterprise
      }&cod_agencia=${agencia}`,
      this.#headers
    );
  });

  getVendedores = this.#errorHandler(async (agencia) => {
    return await axios.get(
      `${this.#URL}/vendedores_agencia?empresa=${this.#enterprise
      }&cod_agencia=${agencia}`,
      this.#headers
    );
  });

  getClientes = this.#errorHandler(async (agencia, politica, tipoPedido) => {
    return await axios.get(
      `${this.#URL}/clientes_mayoreo?empresa=${this.#enterprise
      }&cod_agencia=${agencia}&cod_politica=${politica}&pl_lv_cod_tipo_pedido=${tipoPedido}`,
      this.#headers
    );
  });

  getCliente = this.#errorHandler(
    async (agencia, politica, tipoPedido, persona, tipoPersona) => {
      return await axios.get(
        `${this.#URL}/cliente_info?empresa=${this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&cod_tipo_pedido=${tipoPedido}&cod_persona_cli=${persona}&cod_tipo_persona_cli=${tipoPersona}`,
        this.#headers
      );
    }
  );

  getDireccionesCliente = this.#errorHandler(async (cliente) => {
    return await axios.get(
      `${this.#URL}/direcciones_cliente?empresa=${this.#enterprise
      }&cod_persona_cli=${cliente}`,
      this.#headers
    );
  });

  getProductos = this.#errorHandler(
    async (codModeloCat, codItemCat, codModelo) => {
      return await axios.get(
        `${this.#URL}/productos_disponibles?empresa=${this.#enterprise
        }&cod_modelo_cat=${codModeloCat}&cod_item_cat=${codItemCat}&cod_modelo=${codModelo}`,
        this.#headers
      );
    }
  );

  getDetallePolitica = this.#errorHandler(
    async (
      agencia,
      politica,
      tipoPedido,
      persona,
      tipoPersona,
      cuotas,
      tipoClienteH
    ) => {
      return await axios.get(
        `${this.#URL}/politica_credito_detalle?empresa=${this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&cod_tipo_pedido=${tipoPedido}&cod_persona_cli=${persona}&cod_tipo_persona_cli=${tipoPersona}&num_cuotas=${cuotas}&cod_tipo_clienteh=${tipoClienteH}`,
        this.#headers
      );
    }
  );

  getDescuentoProducto = this.#errorHandler(
    async (
      agencia,
      politica,
      modeloCat,
      itemCat,
      producto,
      cuotas,
      persona,
      pedido,
      tipoPedido,
      secuencia
    ) => {
      return await axios.get(
        `${this.#URL}/obtener_descuento?empresa=${this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&lv_cod_modelo_cat=${modeloCat}&lv_cod_item_cat=${itemCat}&cod_producto=${producto}&num_cuotas=${cuotas}&cod_persona_cli=${persona}&cod_pedido=${pedido}&cod_tipo_pedido=${tipoPedido}&secuencia=${secuencia}`,
        this.#headers
      );
    }
  );

  getPrecioProducto = this.#errorHandler(
    async (
      agencia,
      politica,
      modeloCat,
      itemCat,
      producto,
      cuotas,
      persona,
      codTipoPedido,
      cantidad,
      tipoPedido,
      lvCodUnidad,
      cantidadCalculo,
      codigoUnidad,
      formaPago,
      divisa,
      fecha,
      formaPago2,
      comprobanteLote,
      tipoComprobante,
      descuento,
      factorCredito,
      iva,
      ice,
      anio
    ) => {
      return await axios.get(
        `${this.#URL}/calcula_precios?empresa=${this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&lv_cod_modelo_cat=${modeloCat}&lv_cod_item_cat=${itemCat}&cod_producto=${producto}&num_cuotas=${cuotas}&cod_persona_cli=${persona}&cod_tipo_pedido=${codTipoPedido}&cantidad_pedida=${cantidad}&tipo_pedido=${tipoPedido}&lv_cod_unidad=${lvCodUnidad}&cantidad_calculo=${cantidadCalculo}&cod_unidad=${codigoUnidad}&cod_forma_pago=${formaPago}&cod_divisa=${divisa}&fecha=${fecha}&cod_forma_pago2=${formaPago2}&cod_comprobante_lote=${comprobanteLote}&tipo_comprobante_lote=${tipoComprobante}&descuento=${descuento}&pc_factor_credito=${factorCredito}&lv_tiene_iva=${iva}&lv_tiene_ice=${ice}&anio_modelo=${anio}`,
        this.#headers
      );
    }
  );

  getCodPedido = this.#errorHandler(async (agencia, tipoPedido) => {
    return await axios.get(
      `${this.#URL}/generar__cod_pedido?empresa=${this.#enterprise
      }&cod_agencia=${agencia}&cod_tipo_pedido=${tipoPedido}`,
      this.#headers
    );
  });

  getCodLiquidacion = this.#errorHandler(async (agencia) => {
    return await axios.get(
      `${this.#URL}/obtener_cod_liquidacion?empresa=${this.#enterprise
      }&cod_agencia=${agencia}`,
      this.#headers
    );
  });

  postPedido = this.#errorHandler(async (data) => {
    return await axios.post(`${this.#URL}/guardar_pedido`, data, this.#headers);
  });


  listarPedidosPorFecha = this.#errorHandler(async ({ fecha_ini, fecha_fin, cod_agencia }) => {
    let params = `fecha_ini=${fecha_ini}&fecha_fin=${fecha_fin}`;
    if (cod_agencia) {
      params += `&cod_agencia=${cod_agencia}`;
    }
    return await axios.get(
      `${this.#URL}/pedidos_list?${params}`,
      this.#headers
    );
  });

  obtenerPedidoConDetalles = this.#errorHandler(async ({ cod_pedido, empresa, cod_tipo_pedido }) => {
    let params = `cod_pedido=${cod_pedido}`;
    if (empresa) params += `&empresa=${empresa}`;
    if (cod_tipo_pedido) params += `&cod_tipo_pedido=${cod_tipo_pedido}`;
    return await axios.get(
      `${this.#URL}/pedido_detalle?${params}`,
      this.#headers
    );
  });
}
