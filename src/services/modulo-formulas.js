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
    this.#URL = `${this.#BASE_URL}/modulo-formulas/empresas/${
      this.#enterprise
    }`;
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

  getProceso = this.#errorHandler(async (proceso) => {
    return await axios.get(`${this.#URL}/procesos/${proceso}`, this.#headers);
  });

  getProcesos = this.#errorHandler(async () => {
    return await axios.get(`${this.#URL}/procesos`, this.#headers);
  });

  createProceso = this.#errorHandler(async (data) => {
    return await axios.post(`${this.#URL}/procesos`, data, this.#headers);
  });

  updateProceso = this.#errorHandler(async (proceso, data) => {
    return await axios.put(
      `${this.#URL}/procesos/${proceso}`,
      data,
      this.#headers
    );
  });

  deleteProceso = this.#errorHandler(async (proceso) => {
    return await axios.delete(
      `${this.#URL}/procesos/${proceso}`,
      this.#headers
    );
  });

  getFormulas = this.#errorHandler(async () => {
    return await axios.get(`${this.#URL}/formulas`, this.#headers);
  });

  createFormula = this.#errorHandler(async (data) => {
    return await axios.post(`${this.#URL}/formulas`, data, this.#headers);
  });

  updateFormula = this.#errorHandler(async (formula, data) => {
    return await axios.put(
      `${this.#URL}/formulas/${formula}`,
      data,
      this.#headers
    );
  });

  deleteFormula = this.#errorHandler(async (formula) => {
    return await axios.delete(
      `${this.#URL}/formulas/${formula}`,
      this.#headers
    );
  });

  getParametro = this.#errorHandler(async (parametro) => {
    return await axios.get(
      `${this.#URL}/parametros/${parametro}`,
      this.#headers
    );
  });

  getParametros = this.#errorHandler(async () => {
    return await axios.get(`${this.#URL}/parametros`, this.#headers);
  });

  createParametro = this.#errorHandler(async (data) => {
    return await axios.post(`${this.#URL}/parametros`, data, this.#headers);
  });

  updateParametro = this.#errorHandler(async (parametro, data) => {
    return await axios.put(
      `${this.#URL}/parametros/${parametro}`,
      data,
      this.#headers
    );
  });

  deleteParametro = this.#errorHandler(async (parametro) => {
    return await axios.delete(
      `${this.#URL}/parametros/${parametro}`,
      this.#headers
    );
  });

  getParametrosPorProceso = this.#errorHandler(async (proceso) => {
    return await axios.get(
      `${this.#URL}/procesos/${proceso}/parametros`,
      this.#headers
    );
  });

  addParametroPorProceso = this.#errorHandler(
    async (proceso, parametro, data) => {
      return await axios.post(
        `${this.#URL}/procesos/${proceso}/parametros/${parametro}`,
        data,
        this.#headers
      );
    }
  );

  updateParametroPorProceso = this.#errorHandler(
    async (proceso, parametro, data) => {
      return await axios.put(
        `${this.#URL}/procesos/${proceso}/parametros/${parametro}`,
        data,
        this.#headers
      );
    }
  );

  deleteParametroPorProceso = this.#errorHandler(async (proceso, parametro) => {
    return await axios.delete(
      `${this.#URL}/procesos/${proceso}/parametros/${parametro}`,
      this.#headers
    );
  });

  getFactores = this.#errorHandler(async (proceso, parametro) => {
    return await axios.get(
      `${this.#URL}/procesos/${proceso}/parametros/${parametro}/factores`,
      this.#headers
    );
  });

  createFactor = this.#errorHandler(async (proceso, parametro, data) => {
    return await axios.post(
      `${this.#URL}/procesos/${proceso}/parametros/${parametro}/factores`,
      data,
      this.#headers
    );
  });

  deleteFactor = this.#errorHandler(async (proceso, parametro, orden) => {
    return await axios.delete(
      `${
        this.#URL
      }/procesos/${proceso}/parametros/${parametro}/factores/${orden}`,
      this.#headers
    );
  });

  getModulos = this.#errorHandler(async () => {
    return await axios.get(
      `${this.#BASE_URL}/modulo-formulas/modulos`,
      this.#headers
    );
  });

  getFuncion = this.#errorHandler(async (modulo, funcion) => {
    return await axios.get(
      `${this.#URL}/modulos/${modulo}/funciones/${funcion}`,
      this.#headers
    );
  });

  getFunciones = this.#errorHandler(async () => {
    return await axios.get(`${this.#URL}/funciones`, this.#headers);
  });

  createFuncion = this.#errorHandler(async (data) => {
    return await axios.post(`${this.#URL}/funciones`, data, this.#headers);
  });

  updateFuncion = this.#errorHandler(async (funcion, data) => {
    return await axios.put(
      `${this.#URL}/funciones/${funcion}`,
      data,
      this.#headers
    );
  });

  deleteFuncion = this.#errorHandler(async (funcion) => {
    return await axios.delete(
      `${this.#URL}/funciones/${funcion}`,
      this.#headers
    );
  });

  getParametrosFuncion = this.#errorHandler(async (funcion) => {
    return await axios.get(
      `${this.#URL}/funciones/${funcion}/parametros`,
      this.#headers
    );
  });

  createParametroFuncion = this.#errorHandler(async (funcion, data) => {
    return await axios.post(
      `${this.#URL}/funciones/${funcion}/parametros`,
      data,
      this.#headers
    );
  });

  updateParametroFuncion = this.#errorHandler(
    async (funcion, secuencia, data) => {
      return await axios.put(
        `${this.#URL}/funciones/${funcion}/parametros/${secuencia}`,
        data,
        this.#headers
      );
    }
  );

  deleteParametroFuncion = this.#errorHandler(async (funcion, secuencia) => {
    return await axios.delete(
      `${this.#URL}/funciones/${funcion}/parametros/${secuencia}`,
      this.#headers
    );
  });

  executeFuncionBD = this.#errorHandler(async (funcion) => {
    return await axios.get(
      `${this.#URL}/funciones-bd/${funcion}`,
      this.#headers
    );
  });

  executeFormulaBD = this.#errorHandler(async (formula) => {
    return await axios.get(
      `${this.#URL}/formulas-bd/${formula}`,
      this.#headers
    );
  });

  executeFactoresBD = this.#errorHandler(async (proceso, parametro) => {
    return await axios.get(
      `${this.#URL}/procesos/${proceso}/parametros/${parametro}/factores-bd`,
      this.#headers
    );
  });

  getCliente = this.#errorHandler(async (cliente) => {
    return await axios.get(`${this.#URL}/clientes/${cliente}`, this.#headers);
  });

  getClientes = this.#errorHandler(async () => {
    return await axios.get(`${this.#URL}/clientes`, this.#headers);
  });

  createCliente = this.#errorHandler(async (data) => {
    return await axios.post(`${this.#URL}/clientes`, data, this.#headers);
  });

  updateCliente = this.#errorHandler(async (cliente, data) => {
    return await axios.put(
      `${this.#URL}/clientes/${cliente}`,
      data,
      this.#headers
    );
  });

  deleteCliente = this.#errorHandler(async (cliente) => {
    return await axios.delete(
      `${this.#URL}/clientes/${cliente}`,
      this.#headers
    );
  });

  getNuevoCliente = this.#errorHandler(async (cliente) => {
    return await axios.get(
      `${this.#URL}/nuevo-cliente/${cliente}`,
      this.#headers
    );
  });
}
