import axios from "axios";

// =====================
// Instancia base de axios
// =====================
const api = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 150000,
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
  const { data } = await api.get("/logistica/pedidos_get", {
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
  const { data } = await api.post("/logistica/listado_pedido", payload);
  return data;
};

//  CAPTURA DE CÓDIGO (motor/serie)
export const sendCode = async (payload) => {
  // payload debe contener:
  // { empresa, cod_comprobante, tipo_comprobante, cod_producto,
  //   cod_bodega, current_identification, cod_motor }
  const { data } = await api.post("/logistica/info_moto", payload);
  return data;
};

// SERIES ASIGNADAS
export const getSeriesAsignadas = async ({ cod_comprobante, cod_tipo_comprobante, empresa, cod_producto }) => {
  const { data } = await api.get("/logistica/transferencias", {
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
  const { data } = await api.post("/logistica/info_moto_des", payload);
  return data;
};

// SERIES MÁS ANTIGUAS (comparativa por serie)
export const getSeriesAntiguasPorSerie = async ({ numero_serie, empresa,bodega }) => {
  if (!numero_serie || !String(numero_serie).trim()) {
    throw new Error("El parámetro 'numero_serie' es requerido.");
  }

  const { data } = await api.get("/logistica/series_antiguas_por_serie", {
  
    params: {
      numero_serie: String(numero_serie).trim(),
      empresa: Number(empresa),
      bodega: Number(bodega),
    },
  });

  return data;
};

// COMENTARIOS DE TRANSFERENCIA - CONSULTA POR RANGO
export const getComentariosTransferenciaPorRango = async ({
  empresa,
  desde,
  hasta,
  cod_comprobante,
  cod_tipo_comprobante,
  secuencia,
  cod_producto,
  numero_serie,
  usuario_creacion,
  origen,
  tipo_comentario,
  es_activo,
  buscar,
}) => {
  const { data } = await api.get("/logistica/transferencias/comentarios/rango", {
    params: {
      empresa,
      desde,
      hasta,
      cod_comprobante,
      cod_tipo_comprobante,
      secuencia,
      cod_producto,
      numero_serie,
      usuario_creacion,
      origen,
      tipo_comentario,
      es_activo,
      buscar,
    },
  });
  return data;
};


// COMENTARIOS DE TRANSFERENCIA - CREAR COMENTARIO
export const crearComentarioTransferencia = async (payload) => {
  /**
   * payload debe incluir al menos:
   * - cod_comprobante
   * - cod_tipo_comprobante
   * - empresa
   * - secuencia
   * - cod_producto
   * - comentario
   * 
   * Opcionales:
   * - secuencia_comentario
   * - numero_serie
   * - usuario_creacion
   * - origen
   * - tipo_comentario
   * - es_activo
   */
  const { data } = await api.post("/logistica/transferencias/comentarios", payload);
  return data;
};

// COMENTARIOS DE TRANSFERENCIA - ELIMINAR POR PK
export const eliminarComentarioTransferencia = async ({
  cod_comprobante,
  cod_tipo_comprobante,
  empresa,
  secuencia,
  secuencia_comentario,
}) => {
  const { data } = await api.delete("/logistica/transferencias/comentarios", {
    params: {
      cod_comprobante,
      cod_tipo_comprobante,
      empresa,
      secuencia,
      secuencia_comentario,
    },
  });
  return data;
};

// STOCK DE PRODUCTOS (MOTOS)
export const getStockProductosMotos1 = async () => {
  const { data } = await api.get("/logistica/stock_productos_motos", {});
  console.log(data);
  return data;
};

export const getStockProductosMotos = async () => {
  const { data } = await api.get("/logistica/stock_productos_motos", {
  });
  console.log(data);
  return data;
};

// ==========================
// RESERVAS DE PRODUCTOS
// ==========================

// GET /reservas — listado paginado + filtros
export const getReservas = async (params = {}) => {
  /**
   * Ejemplo de `params` posibles:
   * {
   *   page: 1,
   *   page_size: 20,
   *   ordering: "-fecha_ini",
   *   empresa: 20,
   *   cod_bodega: 1,
   *   cod_producto: "MPA12345678",
   *   fecha_ini__gte: "2025-09-01",
   *   fecha_fin__lte: "2025-09-30",
   *   es_inactivo: 0
   * }
   */
  const { data } = await api.get("/logistica/reservas", { params });
  return data;
};

// POST /reservas — crear nueva reserva
export const createReserva = async (payload) => {
  /**
   * payload debe incluir:
   * {
   *   empresa: 20,
   *   cod_producto: "MPA12345678",
   *   cod_bodega: 1,
   *   cod_cliente: "CLI001",
   *   fecha_ini: "2025-09-11",
   *   fecha_fin: "2025-10-11",
   *   cantidad: 5,
   *   cod_bodega_destino: 2,
   *   observacion: "Reserva preventiva",
   *   cantidad_utilizada: 0,
   *   es_inactivo: 0
   * }
   */
  const { data } = await api.post("/logistica/reservas", payload);
  return data;
};

// PUT /reservas/:empresa/:cod_reserva — actualizar reserva existente
export const updateReserva = async (empresa, cod_reserva, payload) => {
  /**
   * payload puede ser parcial (campos actualizables):
   * {
   *   fecha_fin: "2025-12-01",
   *   cantidad: 10,
   *   observacion: "Extensión por demanda"
   * }
   */
  const { data } = await api.put(`/logistica/reservas/${empresa}/${cod_reserva}`, payload);
  return data;
};

