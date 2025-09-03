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

// Interceptor de respuesta: errores uniformes y robusto
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    let msg =
      data?.error ||
      data?.mensaje ||
      err?.message ||
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

//  CAPTURA DE CÓDIGO (motor/serie): SOLO AQUÍ
export const sendCode = async (payload) => {
  // payload debe contener:
  // { empresa, cod_comprobante, tipo_comprobante, cod_producto,
  //   cod_bodega, current_identification, cod_motor }
  const { data } = await api.post("/log/info_moto", payload);
  return data;
};

// SERIES ASIGNADAS
export const getSeriesAsignadas = async ({ cod_comprobante, cod_tipo_comprobante, empresa, cod_producto }) => {
  const { data } = await api.get("/log/transferencias", {
    params: {
      cod_comprobante,
      cod_tipo_comprobante,
      empresa,
      cod_producto, // opcional
    },
  });
  return data;
};

// ELIMINAR / REVERTIR TRANSFERENCIA (POST)
export const revertirSerieAsignada = async (payload) => {
  // payload debe contener:
  // empresa, cod_comprobante, tipo_comprobante, cod_producto,
  // numero_serie, numero_agencia, empresa_g, cod_estado_producto
  const { data } = await api.post("/log/info_moto_des", payload);
  return data;
};
