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
        this.#URL = `${this.#BASE_URL}/modulo-activaciones`;
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
                const resp = await fn(...args);
                if (!resp.data) {
                    if (resp.status === 204) {
                        let mensaje;
                        if (resp.config.method === "put" || resp.config.method === "patch") {
                            mensaje = "Actualización exitosa";
                        }
                        if (resp.config.method === "delete") {
                            mensaje = "Eliminación exitosa";
                        }
                        resp.data = mensaje;
                    }
                } else {
                    if (resp.config.method !== "get") {
                        resp.data = resp.data.mensaje;
                    }
                }
                return resp.data;
            } catch (err) {
                console.log(`Error en ${err.config.url}`);
                let mensaje = "Ocurrió un error interno en la llamada a la API";
                if (err.response) {
                    const {
                        response: {status, data},
                    } = err;
                    if (status === 401) {
                        mensaje = "Sesión caducada. Por favor, inicia sesión nuevamente.";
                    } else if (data.mensaje) {
                        ({mensaje} = data);
                    }
                    mensaje = data.error ?? mensaje;
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

    //----------------------------------------- SERVICIOS PARA FORMULARIO ACTIVACIONES ----------------------------------
    //------------------------------------------------------------------------------------------------------------------

    getPromotores = this.#errorHandler(async () => {
        return axios.get(
            `${this.#URL}/promotores`,
            this.#headers
        );
    });

    getPromotorActual = this.#errorHandler(async () => {
        return axios.get(
            `${this.#URL}/promotores/${encodeURIComponent(this.#user)}`,
            this.#headers
        );
    });

    getTipoActivaciones = this.#errorHandler(async (empresa) => {
        return axios.get(
            `${this.#URL}/empresas/${empresa}/tipos-activacion`,
            this.#headers
        );
    });

    getProveedores = this.#errorHandler(async (empresa) => {
        return axios.get(
            `${this.#URL}/empresas/${empresa}/proveedores`,
            this.#headers
        );
    });

    getClientes = this.#errorHandler(async (cod_promotor) => {
        return axios.get(`${this.#URL}/promotores/${cod_promotor}/clientes`,
            this.#headers
        );
    });

    getCuidades = this.#errorHandler(async (cod_promotor, cod_cliente) => {
        return axios.get(`${this.#URL}/promotores/${cod_promotor}/clientes/${cod_cliente}/direcciones`,
            this.#headers
        );
    });

    postActivaciones = this.#errorHandler(async (empresa, data) => {
        return await axios.post(`${this.#URL}/empresas/${empresa}/activaciones`, data, this.#headers);
    })

    updateActivaciones = this.#errorHandler(async (cod_activacion, data) => {
        return await axios.put(`${this.#URL}/activaciones/${cod_activacion}`, data, this.#headers);
    })

    getActivaciones = this.#errorHandler(async (empresa, params = {}) => {
        return await axios.get(
            `${this.#URL}/empresas/${empresa}/activaciones`,
            {params, ...this.#headers}
        );
    });

    putDireccionGuia = this.#errorHandler(async (empresa, cod_cliente, cod_direccion, data) => {
        return await axios.put(
            `${this.#URL}/empresas/${empresa}/clientes/${cod_cliente}/direcciones-guia/${cod_direccion}`,
            data,
            this.#headers
        );
    });

    getActivacionesPromotor = this.#errorHandler(async (empresa, cod_promotor, params = {}) => {
        return await axios.get(
            `${this.#URL}/empresas/${empresa}/activaciones`,
            {params, ...this.#headers}
        );
    });


    //----------------------------------------- SERVICIOS PARA FORMULARIO DE ENCUESTA ----------------------------------
    //------------------------------------------------------------------------------------------------------------------

    guardarEncuesta = this.#errorHandler(async (empresa, data) => {
        return await axios.post(`${this.#URL}/empresas/${empresa}/encuestas`, data, this.#headers);
    })

    getCanalPromotor = this.#errorHandler(async (usuarioOracle) => {
        return axios.get(`${this.#URL}/canal-promotor/${usuarioOracle}`,
            this.#headers
        );
    })

    // ------------------------- MODULO ADMINISTRACIION (MOSTRAR TODAS LAS ENCUESTAS POR PROMOTOR)

    getEncuestas = this.#errorHandler(async (empresa) => {
        return axios.get(`${this.#URL}/empresas/${empresa}/encuestas`,
            this.#headers
        );
    })
}