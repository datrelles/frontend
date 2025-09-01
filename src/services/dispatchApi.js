import axios from "axios";

// =====================
// Instancia base de axios
// =====================
const api = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 15000,
});

// Setter del token
export const setAuthToken = (jwt) => {
  if (jwt) api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
  else delete api.defaults.headers.common.Authorization;
};

// Interceptor de respuesta: errores uniformes
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    let msg =
      data?.error?.errorMessage ||
      data?.mensaje ||
      err.message ||
      "Error de red";

    if (status === 401) {
      msg = "Sesión caducada. Por favor, inicia sesión nuevamente.";
    }

    return Promise.reject(new Error(msg));
  }
);

// =====================
// Funciones de la API
// =====================

// MENÚS
export const getMenus = async ({ user, enterprise, system }) => {
  const { data } = await api.get(
    `/menus/${encodeURIComponent(user)}/${encodeURIComponent(enterprise)}/${encodeURIComponent(system)}`
  );
  return data;
};

// LISTADO DE PEDIDOS
export const getDispatchs = async ({ fromDateISO, toDateISO, enterprise }) => {
  const { data } = await api.get("/log/pedidos_get", {
    params: {
      pd_fecha_inicial: fromDateISO, // YYYY-MM-DD
      pd_fecha_final: toDateISO,     // YYYY-MM-DD
      pn_empresa: String(enterprise ?? ""),
    },
  });
  return data;
};

// DETALLE DEL PEDIDO
export const getDetallePedido = async (payload) => {
  // payload debe contener:
  // { pn_empresa, pv_cod_tipo_pedido, pedido, pn_cod_agencia,
  //   bodega_consignacion, cod_direccion, p_tipo_orden, orden }
  const { data } = await api.post("/log/listado_pedido", payload);
  return data;
};

export const sendCode = async (payload) => {
  // payload debe contener:
  // { pn_empresa, pv_cod_tipo_pedido, pedido, pn_cod_agencia,}
  const { data } = await api.post("/log/info_moto", payload);
  return data;
};

export default {
  setAuthToken,
  getMenus,
  getDispatchs,
  getDetallePedido,
  sendCode
};
