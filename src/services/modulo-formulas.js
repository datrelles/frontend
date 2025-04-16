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

export const addProceso = errorHandler(async function addProceso(jwt, enterprise, data) {
    return (await axios.post(`${API}/${enterprise}/procesos`, data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const getProcesos = errorHandler(async function getProcesos(jwt, enterprise) {
    return (await axios.get(`${API}/${enterprise}/procesos`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const updateProceso = errorHandler(async function updateProceso(jwt, enterprise, proceso, data) {
    return (await axios.put(`${API}/${enterprise}/procesos/${proceso}`, data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const deleteProceso = errorHandler(async function deleteProceso(jwt, enterprise, proceso) {
    return (await axios.delete(`${API}/${enterprise}/procesos/${proceso}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const addFormula = errorHandler(async function addFormula(jwt, enterprise, data) {
    return (await axios.post(`${API}/${enterprise}/formulas`, data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const getFormulas = errorHandler(async function getFormulas(jwt, enterprise) {
    return (await axios.get(`${API}/${enterprise}/formulas`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const updateFormula = errorHandler(async function updateFormula(jwt, enterprise, formula, data) {
    return (await axios.put(`${API}/${enterprise}/formulas/${formula}`, data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const deleteFormula = errorHandler(async function deleteFormula(jwt, enterprise, formula) {
    return (await axios.delete(`${API}/${enterprise}/formulas/${formula}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
    })).data;
});

export const getParametrosPorProceso = errorHandler(async function getParametrosPorProceso(jwt, enterprise, proceso) {
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

export const getFactores = errorHandler(async function getFactores(jwt, enterprise, proceso, parametro) {
    return (await axios.get(`${API}/${enterprise}/procesos/${proceso}/parametros/${parametro}/factores`, {
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
});