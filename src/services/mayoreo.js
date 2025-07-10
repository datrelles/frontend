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
        }
        throw new Error(mensaje);
      }
    };
  }

  getMenus = this.#errorHandler(async () => {
    return await axios.get(
      `${this.#BASE_URL}/menus/${this.#user}/${this.#enterprise}/${
        this.#system
      }`,
      this.#headers
    );
  });

  getPoliticas = this.#errorHandler(async (agencia = 25) => {
    return await axios.get(
      `${this.#URL}/credit_policies?empresa=${
        this.#enterprise
      }&cod_agencia=${agencia}`,
      this.#headers
    );
  });

  getVendedores = this.#errorHandler(async (agencia = 25) => {
    return await axios.get(
      `${this.#URL}/vendedores_agencia?empresa=${
        this.#enterprise
      }&cod_agencia=${agencia}`,
      this.#headers
    );
  });

  getClientes = this.#errorHandler(
    async (politica, agencia = 25, tipoPedido = "PE") => {
      return await axios.get(
        `${this.#URL}/clientes_mayoreo?empresa=${
          this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&pl_lv_cod_tipo_pedido=${tipoPedido}`,
        this.#headers
      );
    }
  );

  getCliente = this.#errorHandler(
    async (
      politica,
      persona,
      agencia = 25,
      tipoPedido = "PE",
      tipoPersona = "CLI"
    ) => {
      return await axios.get(
        `${this.#URL}/cliente_info?empresa=${
          this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&cod_tipo_pedido=${tipoPedido}&cod_persona_cli=${persona}&cod_tipo_persona_cli=${tipoPersona}`,
        this.#headers
      );
    }
  );

  getProductos = this.#errorHandler(
    async (
      codModeloCat = "PRO2",
      codItemCat = "Y,E,T,L",
      codModelo = "PRO1"
    ) => {
      return await axios.get(
        `${this.#URL}/productos_disponibles?empresa=${
          this.#enterprise
        }&cod_modelo_cat=${codModeloCat}&cod_item_cat=${codItemCat}&cod_modelo=${codModelo}`,
        this.#headers
      );
    }
  );

  getDetallePolitica = this.#errorHandler(
    async (
      politica,
      persona,
      cuotas,
      agencia = 25,
      tipoPedido = "PE",
      tipoPersona = "CLI",
      tipoClienteH
    ) => {
      return await axios.get(
        `${this.#URL}/cliente_info?empresa=${
          this.#enterprise
        }&cod_agencia=${agencia}&cod_politica=${politica}&cod_tipo_pedido=${tipoPedido}&cod_persona_cli=${persona}&cod_tipo_persona_cli=${tipoPersona}`,
        this.#headers
      );
    }
  );
}
