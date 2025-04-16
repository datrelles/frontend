import axios from 'axios';

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
        this.#URL = `${this.#BASE_URL}/modulo-formulas/empresas/${this.#enterprise}`;
    }

    get #headers() {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.#jwt
            }
        }
    }

    #errorHandler(fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (err) {
                console.log(`Error en ${err.config.url}`);
                let mensaje = "Ocurrió un error en la llamada a la API";
                if (err.response) {
                    const { response: { status, data } } = err;
                    if (status === 401) {
                        mensaje = "Sesión caducada. Por favor, inicia sesión nuevamente.";
                    } else if (data.mensaje) {
                        ({ mensaje } = data);
                    }
                }
                throw new Error(mensaje);
            }
        }
    }

    getMenus = this.#errorHandler(async () => {
        return (await axios.get(`${this.#BASE_URL}/menus/${this.#user}/${this.#enterprise}/${this.#system}`, this.#headers)).data;
    });

    addProceso = this.#errorHandler(async (data) => {
        return (await axios.post(`${this.#URL}/procesos`, data, this.#headers)).data;
    });

    getProcesos = this.#errorHandler(async () => {
        return (await axios.get(`${this.#URL}/procesos`, this.#headers)).data;
    });

    updateProceso = this.#errorHandler(async (proceso, data) => {
        return (await axios.put(`${this.#URL}/procesos/${proceso}`, data, this.#headers)).data;
    });

    deleteProceso = this.#errorHandler(async (proceso) => {
        return (await axios.delete(`${this.#URL}/procesos/${proceso}`, this.#headers)).data;
    });

    addFormula = this.#errorHandler(async (data) => {
        return (await axios.post(`${this.#URL}/formulas`, data, this.#headers)).data;
    });

    getFormulas = this.#errorHandler(async () => {
        return (await axios.get(`${this.#URL}/formulas`, this.#headers)).data;
    });

    updateFormula = this.#errorHandler(async (formula, data) => {
        return (await axios.put(`${this.#URL}/formulas/${formula}`, data, this.#headers)).data;
    });

    deleteFormula = this.#errorHandler(async (formula) => {
        return (await axios.delete(`${this.#URL}/formulas/${formula}`, this.#headers)).data;
    });

    addParametro = this.#errorHandler(async (data) => {
        return (await axios.post(`${this.#URL}/parametros`, data, this.#headers)).data;
    });

    getParametros = this.#errorHandler(async () => {
        return (await axios.get(`${this.#URL}/parametros`, this.#headers)).data;
    });

    updateParametro = this.#errorHandler(async (parametro, data) => {
        return (await axios.put(`${this.#URL}/parametros/${parametro}`, data, this.#headers)).data;
    });

    deleteParametro = this.#errorHandler(async (parametro) => {
        return (await axios.delete(`${this.#URL}/parametros/${parametro}`, this.#headers)).data;
    });

    addParametroPorProceso = this.#errorHandler(async (proceso, parametro, data) => {
        return (await axios.post(`${this.#URL}/procesos/${proceso}/parametros/${parametro}`, data, this.#headers)).data;
    });

    getParametrosPorProceso = this.#errorHandler(async (proceso) => {
        return (await axios.get(`${this.#URL}/procesos/${proceso}/parametros`, this.#headers)).data;
    });

    updateParametroPorProceso = this.#errorHandler(async (proceso, parametro, data) => {
        return (await axios.put(`${this.#URL}/procesos/${proceso}/parametros/${parametro}`, data, this.#headers)).data;
    });

    deleteParametroPorProceso = this.#errorHandler(async (proceso, parametro) => {
        return (await axios.delete(`${this.#URL}/procesos/${proceso}/parametros/${parametro}`, this.#headers)).data;
    });

    addFactor = this.#errorHandler(async (proceso, parametro, data) => {
        return (await axios.post(`${this.#URL}/procesos/${proceso}/parametros/${parametro}/factores`, data, this.#headers)).data;
    });

    getFactores = this.#errorHandler(async (proceso, parametro) => {
        return (await axios.get(`${this.#URL}/procesos/${proceso}/parametros/${parametro}/factores`, this.#headers)).data;
    });

    deleteFactor = this.#errorHandler(async (proceso, parametro, orden) => {
        return (await axios.delete(`${this.#URL}/procesos/${proceso}/parametros/${parametro}/factores/${orden}`, this.#headers)).data;
    });


}