import axios from 'axios';

const BASE_API = process.env.REACT_APP_API;
const API = `${BASE_API}/modulo-formulas/empresas`;

const errorHandler = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (err) {
            console.log(`Error en fn ${fn.name}`);
            let mensaje = `Ocurrió un error en la llamada a la API: ${fn.name}`;
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

export const getMenus = errorHandler(async function getMenus(jwt, user, enterprise, system) {
    return (await axios.get(`${BASE_API}/menus/${user}/${enterprise}/${system}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        })).data;
});

export const getFactores = errorHandler(async function getFactores(jwt, enterprise, proceso, parametro) {
    return (await axios.get(`${API}/${enterprise}/procesos/${proceso}/parametros/${parametro}/factores`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const getParametros = errorHandler(async function getParametros(jwt, enterprise, proceso) {
    return (await axios.get(`${API}/${enterprise}/procesos/${proceso}/parametros`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const addFactor = errorHandler(async function addFactor(jwt, enterprise, proceso, parametro, data) {
    return (await axios.post(`${API}/${enterprise}/procesos/${proceso}/parametros/${parametro}/factores`, data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const deleteFactor = errorHandler(async function deleteFactor(jwt, enterprise, proceso, parametro, orden) {
    return (await axios.delete(`${API}/${enterprise}/procesos/${proceso}/parametros/${parametro}/factores/${orden}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
})