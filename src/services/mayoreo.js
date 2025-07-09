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

  getPoliticas = this.#errorHandler(async (agencia) => {
    return await axios.get(
      `${this.#URL}/credit_policies?empresa=${
        this.#enterprise
      }&cod_agencia=${agencia}`,
      this.#headers
    );
  });
}
