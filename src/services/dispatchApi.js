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
export const getMenus = async (userShineray, enterpriseShineray, systemShineray) => {

  const { data } = await api.get(
    `/menus/${encodeURIComponent(userShineray)}/${encodeURIComponent(enterpriseShineray)}/${encodeURIComponent(systemShineray)}`
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
export const getSeriesAntiguasPorSerie = async ({ numero_serie, empresa, bodega }) => {
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



// =====================
// RUTAS (catálogo maestro)
// =====================

// GET /rutas — listar con filtros y paginación
export const listRutas = async ({ empresa, id, nombre, page = 1, page_size = 50 } = {}) => {
  const { data } = await api.get("/logistica/rutas", {
    params: {
      empresa,
      id,
      nombre,
      page,
      page_size,
    },
  });
  return data; // { count, next, previous, results: [...] }
};

// GET /rutas/{empresa}/{cod_ruta} — detalle
export const getRuta = async ({ empresa, cod_ruta }) => {
  if (empresa == null || cod_ruta == null) throw new Error("empresa y cod_ruta son requeridos");
  const { data } = await api.get(`/logistica/rutas/${encodeURIComponent(empresa)}/${encodeURIComponent(cod_ruta)}`);
  return data;
};

// POST /rutas — crear
// payload: { empresa:number, nombre?:string }
export const createRuta = async (payload) => {
  console.log("createRuta payload:", payload);
  const { data } = await api.post("/logistica/rutas", payload);
  return data; // { cod_ruta, empresa, id, nombre }
};

// PUT /rutas/{empresa}/{cod_ruta} — actualizar
// payload permitido: { nombre?:string }
export const updateRuta = async ({ empresa, cod_ruta, ...payload }) => {
  if (empresa == null || cod_ruta == null) throw new Error("empresa y cod_ruta son requeridos");
  const { data } = await api.put(
    `/logistica/rutas/${encodeURIComponent(empresa)}/${encodeURIComponent(cod_ruta)}`,
    payload
  );
  return data;
};

// =====================
// DIRECCIÓN–RUTA (ST_DIRECCION_RUTA)
// =====================

// POST /direccion-rutas/search — paginado y filtros
// payload: { empresa?, cod_cliente?, cod_ruta?, page?, page_size? }
export const searchDirRutas = async (payload) => {
  const { data } = await api.post("/logistica/direccion-rutas/search", payload);
  return data; // { count, next, previous, results: [...] }
};

// POST /direccion-rutas/detail — detalle por PK compuesta
// payload: { empresa, cod_cliente, cod_direccion, cod_ruta }
export const detailDirRuta = async (payload) => {
  const { data } = await api.post("/logistica/direccion-rutas/detail", payload);
  return data;
};

// POST /direccion-rutas — crear vínculo
// payload: { empresa, cod_cliente, cod_direccion, cod_ruta }
export const createDirRuta = async (payload) => {
  const { data } = await api.post("/logistica/direccion-rutas", payload);
  return data;
};

// POST /direccion-rutas/delete — eliminar vínculo (idempotente)
// payload: { empresa, cod_cliente, cod_direccion, cod_ruta }
export const deleteDirRuta = async (payload) => {
  const { status } = await api.post("/logistica/direccion-rutas/delete", payload);
  return status; // 204 esperado
};

// =====================
// TRANSPORTISTA–RUTA (ST_TRANSPORTISTA_RUTA)
// =====================

// POST /transportista-ruta/search — paginado y filtros
// payload: { empresa?, cod_transportista?, cod_ruta?, page?, page_size? }
export const searchTRuta = async (payload = {}) => {
  const { data } = await api.post("/logistica/transportista-ruta/search", payload);
  console.log(data);
  return data; // { count, next, previous, results: [...] }
};

// POST /transportista-ruta/detail — detalle por (codigo, empresa)
// payload: { empresa, codigo }
export const detailTRuta = async (payload) => {
  const { data } = await api.post("/logistica/transportista-ruta/detail", payload);
  return data;
};

// POST /transportista-ruta — crear vínculo
// payload: { empresa, cod_transportista, cod_ruta }
export const createTRuta = async (payload) => {
  const { data } = await api.post("/logistica/transportista-ruta", payload);
  return data; // { empresa, codigo, cod_transportista, cod_ruta, ... }
};

// POST /transportista-ruta/update — actualizar vínculo
// payload: { empresa, codigo, cod_transportista?, cod_ruta? }
export const updateTRuta = async (payload) => {
  const { data } = await api.post("/logistica/transportista-ruta/update", payload);
  return data;
};

// POST /transportista-ruta/delete — eliminar vínculo (idempotente)
// payload: { empresa, codigo }
export const deleteTRuta = async (payload) => {
  const { status } = await api.post("/logistica/transportista-ruta/delete", payload);
  return status; // 204 esperado
};

//GET CLIENTES CON DIRECCIONES

export const getClientesConDirecciones = async ({
  empresa,
  page = 1,
  page_size = 2000,
  cod_cliente_like,
  nombre_like,
} = {}) => {
  const { data } = await api.get("/logistica/clientes_con_direcciones", {
    params: {
      empresa,
      page,
      page_size,
      cod_cliente_like,
      nombre_like,
    },
  });
  return data;
};

export const getDireccionesCliente = async ({
  cod_cliente,
  empresa,
  page = 1,
  page_size = 2000,
} = {}) => {
  if (!cod_cliente || !String(cod_cliente).trim()) {
    throw new Error("El parámetro 'cod_cliente' es requerido.");
  }

  const { data } = await api.get("/logistica/clientes_direcciones", {
    params: {
      cod_cliente: String(cod_cliente).trim(),
      empresa,
      page,
      page_size,
    },
  });
  return data;
};

//Transportistas activos
// Función para obtener la lista de transportistas de una empresa
// GET /get_transportistas_moto?empresa=20
export const getTransportistas = async (empresa) => {
  // Acepta number | string. Forzamos a número si es posible.
  const pnEmpresa = empresa != null ? Number(empresa) : undefined;

  const { data } = await api.get("/get_transportistas_moto", {
    params: { empresa: pnEmpresa },
  });

  return data; // arreglo de transportistas activos
};


// =====================
// >>> NUEVO: DESPACHOS FINAL (VT_DESPACHO_FINAL)
// =====================

/**
 * POST /despachos/search
 * Busca en la vista VT_DESPACHO_FINAL con filtros y paginación.
 * @param {Object} payload - Campos según DespachoSearchIn:
 * {
 *   empresa: number (requerido),
 *   cod_ruta?: number,
 *   cod_tipo_pedido?: string,
 *   cod_pedido?: string,
 *   cod_tipo_orden?: string,
 *   cod_orden?: string,
 *   cod_cliente?: string,
 *   cod_producto?: string,
 *   cadena?: "RETAIL"|"MAYOREO",
 *   fac_con?: "CONSIGNACION"|"FACTURACION",
 *   transportista?: string,
 *   destino?: string,
 *   ruta?: string,
 *   bod_destino?: string,
 *   modelo?: string,
 *   numero_serie?: string,
 *   en_despacho?: 0|1,
 *   despachada?: 0|1,
 *   date_field?: "fecha_est_desp"|"fecha_despacho"|"fecha_envio"|"fecha_entrega",
 *   fecha_desde?: string|Date, // se normaliza a YYYY-MM-DD
 *   fecha_hasta?: string|Date, // se normaliza a YYYY-MM-DD
 *   page?: number,
 *   page_size?: number,
 *   ordering?: string // ej: "-fecha_est_desp,cod_orden"
 * }
 * @returns {Promise<{count:number,next:number|null,previous:number|null,results:Array}>}
 */
export const searchDespachos = async (payload = {}) => {
  // Normaliza fechas si vienen como Date
  const body = {
    ...payload
  };
  const { data } = await api.post("/logistica/despachos/search", body);
  return data;
};

// =====================
// >>> NUEVO: CDE (Cabecera Despacho-Entrega)
// =====================

/**
 * POST /cdespacho-entrega
 * Crea una cabecera CDE.
 * payload: { empresa:number, cod_transportista:string, cod_ruta:number, ...opcionales }
 */
export const createCDE = async (payload) => {
  
  console.log("Creating CDE with payload:", payload);
  const { data } = await api.post("/logistica/cdespacho-entrega", payload);
  return data; // { empresa, cde_codigo, cod_transportista, cod_ruta, ... }
};

/**
 * PATCH /cdespacho-entrega/:empresa/:cde_codigo
 * Actualiza parcialmente una cabecera CDE.
 * payload: { fecha?, usuario?, cod_ruta?, observacion?, cod_persona?, cod_tipo_persona?, cod_transportista?, finalizado? }
 */
export const updateCDE = async (empresa, cde_codigo, payload) => {
  const { data } = await api.patch(
    `/logistica/cdespacho-entrega/${encodeURIComponent(empresa)}/${encodeURIComponent(cde_codigo)}`,
    {
      ...payload,
      // Si envías fecha como Date, normaliza:
      ...(payload?.fecha ? { fecha: toISODate(payload.fecha) } : {}),
    }
  );
  return data;
};

/**
 * POST /cdespacho-entrega/search
 * Lista/pagina CDE con filtros.
 * payload: { page?, page_size?, empresa?, cde_codigo?, cod_ruta?, cod_persona?, cod_tipo_persona?, cod_transportista?, finalizado? }
 */
export const searchCDE = async (payload = {}) => {
  const { data } = await api.post("/logistica/cdespacho-entrega/search", payload);
  return data; // { count,next,previous,results:[...] }
};

// =====================
// >>> NUEVO: DDE (Detalle Despacho-Entrega)
// =====================

/**
 * POST /ddespacho-entrega
 * Crea un detalle de CDE.
 * payload: { empresa:number, cde_codigo:number, cod_ddespacho?:number, cod_producto?:string, numero_serie?:string, fecha?:string|Date, observacion?:string }
 */
export const createDDE = async (payload) => {
  console.log("Creating DDE:", payload);
  const body = {
    ...payload,
    ...(payload?.fecha ? { fecha: toISODate(payload.fecha) } : {}),
  };
  const { data } = await api.post("/logistica/ddespacho-entrega", body);
  return data; // { empresa,cde_codigo,secuencia,cod_ddespacho,cod_producto,numero_serie,fecha,observacion }
};

/**
 * POST /ddespacho-entrega/list
 * Lista detalles por CDE con paginación.
 * payload: { empresa:number, cde_codigo:number, page?:number, per_page?:number }
 */
export const listDDE = async (payload) => {
  const { data } = await api.post("/logistica/ddespacho-entrega/list", payload);
  return data; // { page, per_page, total, pages, data:[...] }
};

/**
 * PATCH /ddespacho-entrega/:empresa/:cde_codigo/:secuencia
 * Actualiza parcialmente un detalle DDE.
 * payload: { cod_ddespacho?, cod_producto?, numero_serie?, fecha?, observacion? }
 */
export const updateDDE = async (empresa, cde_codigo, secuencia, payload) => {
  const body = {
    ...payload,
    ...(payload?.fecha ? { fecha: toISODate(payload.fecha) } : {}),
  };
  const { data } = await api.patch(
    `/logistica/ddespacho-entrega/${encodeURIComponent(empresa)}/${encodeURIComponent(cde_codigo)}/${encodeURIComponent(secuencia)}`,
    body
  );
  return data;
};

// =====================
// GENERAR GUÍAS (PROC KS_DESPACHOS.GENERAR_GUIAS_FINALES)
// =====================
/**
 * POST /despachos/generar-guias
 * payload: { empresa: number, despacho: number }
 * Respuesta: { empresa, despacho, guias: string[], out_raw: string }
 */
export const generarGuiasDespacho = async ({ empresa, despacho }) => {
  if (empresa == null || despacho == null) {
    throw new Error("empresa y despacho son requeridos");
  }
  const { data } = await api.post("logistica/despachos/generar-guias", {
    empresa: Number(empresa),
    despacho: Number(despacho),
  });
  return data;
};

// =====================
// TG_USUARIO_VEND (usuarios-vend)
// =====================
/**
 * Crear usuario-vendedor
 * POST /usuarios-vend
 */
export const tguvCreate = async (payload) => {
  const { data } = await api.post("/usuarios-vend", payload);
  return data;
};

/**
 * Buscar usuarios-vend (paginado/filtros)
 * POST /usuarios-vend/search
 * Respuesta: { page, per_page, total, pages, data: [...] }
 */
export const tguvSearch = async (payload = {}) => {
  const { data } = await api.post("/usuarios-vend/search", payload);
  return data;
};

/**
 * Actualizar (PUT/PATCH) un registro específico por PK compuesta
 * /usuarios-vend/:cod_persona/:cod_tipo_persona/:cod_agencia/:empresa/:usuario_oracle
 */
export const tguvUpdate = async (
  { cod_persona, cod_tipo_persona, cod_agencia, empresa, usuario_oracle },
  payload,
  { method = "PATCH" } = {}
) => {
  if (
    !cod_persona ||
    !cod_tipo_persona ||
    cod_agencia == null ||
    empresa == null ||
    !usuario_oracle
  ) {
    throw new Error(
      "cod_persona, cod_tipo_persona, cod_agencia, empresa y usuario_oracle son requeridos"
    );
  }

  const url = `/usuarios-vend/${encodeURIComponent(cod_persona)}/${encodeURIComponent(
    cod_tipo_persona
  )}/${encodeURIComponent(cod_agencia)}/${encodeURIComponent(empresa)}/${encodeURIComponent(
    usuario_oracle
  )}`;

  const m = String(method).toUpperCase() === "PUT" ? "put" : "patch";
  const { data } = await api[m](url, payload);
  return data;
};

// =====================
// ST_CDESPACHO UPDATE
// =====================
/**
 * PUT/PATCH /cdespacho/:empresa/:cod_despacho
 */
export const updateCDespacho = async (empresa, cod_despacho, payload, { method = "PATCH" } = {}) => {
  if (empresa == null || cod_despacho == null) {
    throw new Error("empresa y cod_despacho son requeridos");
  }

  const url = `/cdespacho/${encodeURIComponent(empresa)}/${encodeURIComponent(cod_despacho)}`;

  const norm = (d) => (typeof toISODate === "function" ? toISODate(d) : d);
  const body = { ...payload };
  if (body?.fecha_agrega instanceof Date) body.fecha_agrega = norm(body.fecha_agrega);
  if (body?.fecha_est_desp instanceof Date) body.fecha_est_desp = norm(body.fecha_est_desp);
  if (body?.fecha_entrega instanceof Date) body.fecha_entrega = norm(body.fecha_entrega);

  const m = String(method).toUpperCase() === "PUT" ? "put" : "patch";
  const { data } = await api[m](url, body);
  return data;
};

// =====================
// ST_DDESPACHO UPDATE
// =====================
/**
 * PUT/PATCH /ddespacho/:empresa/:cod_despacho/:cod_ddespacho
 */
export const updateDDespacho = async (
  empresa,
  cod_despacho,
  cod_ddespacho,
  payload,
  { method = "PATCH" } = {}
) => {
  if (empresa == null || cod_despacho == null || cod_ddespacho == null) {
    throw new Error("empresa, cod_despacho y cod_ddespacho son requeridos");
  }

  const url = `/ddespacho/${encodeURIComponent(empresa)}/${encodeURIComponent(
    cod_despacho
  )}/${encodeURIComponent(cod_ddespacho)}`;

  const body = { ...payload };
  if (body?.fecha_despacho instanceof Date) {
    body.fecha_despacho =
      typeof toISODate === "function" ? toISODate(body.fecha_despacho) : body.fecha_despacho;
  }

  const m = String(method).toUpperCase() === "PUT" ? "put" : "patch";
  const { data } = await api[m](url, body);
  return data;
};


// =====================
// DDE: DELETE /ddespacho-entrega/:empresa/:cde_codigo/:secuencia
// =====================
export const deleteDDE = async (empresa, cde_codigo, secuencia) => {
  if (empresa == null || cde_codigo == null || secuencia == null) {
    throw new Error("empresa, cde_codigo y secuencia son requeridos");
  }

  try {
    const { data } = await api.delete(
      `/logistica/ddespacho-entrega/${encodeURIComponent(empresa)}/${encodeURIComponent(
        cde_codigo
      )}/${encodeURIComponent(secuencia)}`
    );
    return data; // { detail: "Eliminado" }
  } catch (err) {
    // El backend devuelve { detail: "..."} en 404/409. Lo exponemos como mensaje.
    const detail = err?.response?.data?.detail;
    if (detail) throw new Error(detail);
    throw err;
  }
};


export const getListOfVendors = async (empresa, cod_agencia, userShineray) => {
  if (empresa == null || cod_agencia == null) {
    throw new Error("empresa y cod_agencia son requeridos");
  }
  const { data } = await api.get("/order_mot/vendedores_agencia", {
    params: {
      empresa: Number(empresa),
      cod_agencia: Number(cod_agencia),
      user_shineray: String(userShineray || ""),
    },
  });
  return data;
};
