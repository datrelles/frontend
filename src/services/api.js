import axios from 'axios';


const API = process.env.REACT_APP_API;

//GET MENUS SHINERAY

export const getMenus = async (user, enterprise, system, jwt) => {
  try {
    const res = await fetch(`${API}/menus/${user}/${enterprise}/${system}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        }
      });
    const data = await res.json();
    return data
  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw error
  }
}

//CONTABILIDAD CARGA_DOC_ELECTRONIC-------------------------------------------------------

export const postDocumentsSri = async (data, jwt) => {
  try {
    const response = await axios.post(`${API}/comprobante/electronico`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    const errorMessage = error
    throw new Error(errorMessage)
  }
}

export const getDocumentsSri = async (start, end, jwt) => {

  try {
    const response = await axios.get(`${API}/doc_elec_recibidos?start_date=${start}&end_date=${end}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      }
    })
    return response.data;
  }
  catch (error) {
    console.log(error)
    const errorMessage = error.response.data.error.errorMessage
    throw new Error(errorMessage);
  }
}
//FORMAS DE PAGO EDITPOSTSALES------------------------------------------------------
export const getDataFormasDePago = async (cod_proforma, jwt) => {
  try {
    const response = await axios.get(`${API}/proformas_por_cod_proforma/${cod_proforma}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })

    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const postDataFormasDePago = async (data, jwt) => {
  try {
    const response = await axios.post(`${API}/crear_anticipo_forma_de_pago_general`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    console.log(response)
    return response

  } catch (error) {
    console.log(error)
    const errorMessage = error
    throw new Error(errorMessage)
  }
}

export const deleteFormasDePago = async (data, jwt) => {
  try {
    const response = await axios.delete(`${API}/proformas_delete_anticipo`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      data: data,
    })
    return response

  } catch (error) {
    const errorMessage = error
    throw new Error(errorMessage)
  }
}

export const updatedFormasPago = async (data, jwt, sec, code_proforma) => {
  try {
    const response = await axios.put(`${API}/actualizar_anticipo_forma_de_pago_general/${sec}/${code_proforma}`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    console.log(response)
    return response
  } catch (error) {
    console.log(error)
    const errorMessage = error
    throw new Error(errorMessage)
  }

}

export const postPagoAnticipo = async (data, jwt) => {
  try {
    const response = await axios.post(`${API}/pagar_anticipo_forma_de_pago_general`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    console.log(response)
    return response

  } catch (error) {
    console.log(error.message)
    const errorMessage = error.message
    throw new Error(errorMessage)
  }
}

//MODULE GARRANTY---------------------------------------------------------------------------------------------

export const getCasesPostVenta = async (jwt, start_date, end_date, statusWarranty, statusProcess, province, city) => {
  function formatNumber(num) {
    if (typeof num === 'number' && num < 10) {
      return num < 10 ? `0${num}` : num;
    } else {
      return num;
    }
  }

  try {
    const response = await axios.get(`${API}/getInfoCasosPostventas?cod_provincia=${formatNumber(province)}&cod_canton=${formatNumber(city)}&start_date=${start_date}&finish_date=${end_date}&case_status=${statusProcess}&warranty_status=${statusWarranty}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getCasesPostVentaSubCases = async (jwt, cod_comprobante) => {
  try {
    const response = await axios.get(`${API}/casosTipo/${cod_comprobante}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const putCasesPostVentaSubCases = async (jwt, cod_comprobante, cod_duracion, status) => {
  try {
    const response = await axios.put(`${API}/update_status_tipo_problema?cod_comprobante=${cod_comprobante}&cod_duracion=${cod_duracion}&status=${status}`, {}, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getCasesPostVentaSubcasesUrl = async (jwt, cod_comprobante) => {
  try {
    const response = await axios.get(`${API}/casosTipoImages/${cod_comprobante}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getDataProvinces = async (jwt) => {
  try {
    const response = await axios.get(`${API}/get_info_provinces`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getDataCityByProvince = async (jwt, codeProvince) => {
  try {
    const response = await axios.get(`${API}/get_info_city_by_province/${codeProvince}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}


/**
 * 1) ENDPOINT: check_info_bye_engine_code
 *    METHOD: GET
 *    PATH: /check_info_bye_engine_code
 *
 *    Descripción: Verifica información de un motor usando el parámetro 'engine_code'.
 */
export const getCheckInfoByEngineCode = async (jwt, engineCode) => {
  try {
    const response = await axios.get(
      `${API}/warranty/check_info_bye_engine_code?engine_code=${engineCode}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * 2) ENDPOINT: get_info_active_talleres
 *    METHOD: GET
 *    PATH: /get_info_active_talleres
 *
 *    Descripción: Retorna lista de talleres autorizados.
 *    Recibe dos query params obligatorios:
 *      - active (1 o 0)
 *      - enterprise (código de empresa)
 */
export const getInfoActiveTalleres = async (jwt, active, enterprise) => {
  try {
    const response = await axios.get(
      `${API}/warranty/get_info_active_talleres?active=${active}&enterprise=${enterprise}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Endpoint to retrieve information of users associated with the 'ASTGAR' role.
 * GET /get_usuarios_rol_astgar
 *
 * Returns an array of objects:
 * [
 *   {
 *     "usuario": "...",
 *     "nombre": "...",
 *     "apellido1": "..."
 *   },
 *   ...
 * ]
 */
export const getUsuariosRolAstgar = async (jwt) => {
  try {
    const response = await axios.get(`${API}/warranty/get_usuarios_rol_astgar`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 3) ENDPOINT: get_cliente_data_for_id
 *    METHOD: GET
 *    PATH: /get_cliente_data_for_id
 *
 *    Descripción: Retorna datos de cliente según 'cod_cliente' y 'enterprise'.
 */

/**
 * 1) Endpoint to create (assign) a new record in AR_TALLER_SERVICIO_USUARIO
 *    POST /assign_taller_usuario
 *
 *    Body JSON example:
 *    {
 *      "empresa": 20,
 *      "codigo_taller": "T123",
 *      "cod_rol": "ASTGAR",
 *      "usuario": "AMENDOZA",
 *      "activo": 1
 *    }
 */
export const postAssignTallerUsuario = async (jwt, data) => {
  try {
    const response = await axios.post(`${API}/warranty/assign_taller_usuario`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 2) Endpoint to update an existing record in AR_TALLER_SERVICIO_USUARIO
 *    PUT /update_taller_usuario
 *
 *    Body JSON example:
 *    {
 *      "empresa": 20,
 *      "codigo_taller": "T123",
 *      "cod_rol": "ASTGAR",
 *      "usuario": "AMENDOZA",
 *      "activo": 0,
 *      "modificado_por": "ASANCHEZ"
 *    }
 */
export const putUpdateTallerUsuario = async (jwt, data) => {
  try {
    const response = await axios.put(`${API}/warranty/update_taller_usuario`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 3) Endpoint to delete a record in AR_TALLER_SERVICIO_USUARIO
 *    DELETE /delete_taller_usuario
 *
 *    Body JSON example:
 *    {
 *      "empresa": 20,
 *      "codigo_taller": "T123",
 *      "cod_rol": "ASTGAR",
 *      "usuario": "AMENDOZA"
 *    }
 */
export const deleteTallerUsuario = async (jwt, data) => {
  try {
    // Note that with DELETE, axios allows sending a "data" key in the config
    // if you need to pass JSON in the body.
    const response = await axios.delete(`${API}/warranty/delete_taller_usuario`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: data,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const getTallerUsuarioRelations = async (jwt, enterprise) => {
  try {
    let url = `${API}/warranty/get_taller_usuario_relations`;
    if (enterprise) {
      // Append query param if we want to filter by a specific empresa
      url += `?empresa=${enterprise}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getClienteDataForId = async (jwt, codCliente, enterprise) => {
  try {
    const response = await axios.get(
      `${API}/warranty/get_cliente_data_for_id?cod_cliente=${codCliente}&enterprise=${enterprise}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * 4) ENDPOINT: get_list_tipo_problema
 *    METHOD: GET
 *    PATH: /get_list_tipo_problema
 *
 *    Descripción: Retorna la lista de tipos de problema.
 */
export const getListTipoProblema = async (jwt) => {
  try {
    const response = await axios.get(`${API}/warranty/get_list_tipo_problema`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * 5) ENDPOINT: save_post_case_warranty
 *    METHOD: POST
 *    PATH: /save_post_case_warranty
 *
 *    Descripción: Guarda un caso de garantía (POST).
 *    Recibe parámetros en el body (JSON) y:
 *      - userShineray y enterpriseShineray por query string.
 */
export const postSaveCaseWarranty = async (jwt, dataCaso, userShineray, enterpriseShineray) => {
  try {
    const response = await axios.post(
      `${API}/warranty/save_post_case_warranty?userShineray=${userShineray}&enterpriseShineray=${enterpriseShineray}`,
      dataCaso,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * 6) ENDPOINT: get_caso_postventa
 *    METHOD: GET
 *    PATH: /get_caso_postventa
 *
 *    Descripción: Retorna la información de un caso postventa por:
 *      - empresa
 *      - tipo_comprobante
 *      - cod_comprobante
 */
export const getCasoPostventa = async (jwt, empresa, tipoComprobante, codComprobante) => {
  try {
    const response = await axios.get(
      `${API}/warranty/get_caso_postventa?empresa=${empresa}&tipo_comprobante=${tipoComprobante}&cod_comprobante=${codComprobante}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}




//PARTS UPDATE YEAR---------------------------------------

export const getDataDespiece = async (jwt, codeEnterprise) => {
  try {
    const response = await axios.get(`${API}/get_info_despiece/motos?empresa=${codeEnterprise}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getInfoDespiece = async (jwt, codeEnterprise, codeSubsystem) => {
  try {
    const response = await axios.get(`${API}/get_info_despiece/parts?empresa=${codeEnterprise}&subsistema=${codeSubsystem}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const putChangeYearForSubsystem = async (jwt, fromYear, toYear, flag_id_level, empresa, userShineray, data) => {
  if (!jwt || !fromYear || !toYear || !flag_id_level || !empresa || !userShineray || !data) {
    throw new Error("Faltan variables de ingreso");
  }

  try {
    const response = await axios.put(`${API}/update_year_parts?from_year=${fromYear}&to_year=${toYear}&flag_id_level=${flag_id_level}&empresa=${empresa}&user_shineray=${userShineray}`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data

  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getYearOfPartsMotocycle = async (jwt, empresa, cod_producto) => {
  try {
    const response = await axios.get(`${API}/get_info_parts_year_by_cod_producto?empresa=${empresa}&cod_producto=${cod_producto}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch(error) {
    console.log(error)
    throw error
  }
}

// ECOMMERCE MANAGER--------------------------------------------
export const getSellEcommerce = async (jwt, start_date, end_date, pay_method, invoiced ) => {
  try {
    const response = await axios.get(`${API}/get_invoice_ecommerce?start_date=${start_date}&finish_date=${end_date}&pay_method=${pay_method}&invoiced=${invoiced}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    console.log(response.data)
    return response.data

  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getBuyPartsEcommerce = async (jwt, id, pay_method) => {
  try {
    const response = await axios.get(`${API}/buy_parts_ecommerce/${id}?pay_method=${pay_method}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const postCodComprobanteEcommerce = async (jwt, payMethod, payId, codComprobante) => {
  try {
    const response = await axios.post(
      `${API}/post_cod_comprobante_ecommerce?pay_method=${payMethod}&pay_id=${payId}&cod_comprobante=${codComprobante}`,
      {}, // Empty body since this is a POST request with parameters in the URL
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const postCodComprobanteEcommerceCreditoDirecto = async (jwt, payMethod, payId, codComprobante) => {
  try {
    const response = await axios.post(
      `${API}/post_cod_comprobante_ecommerce_credito_directo?pay_method=${payMethod}&pay_id=${payId}&cod_comprobante=${codComprobante}`,
      {}, // Empty body since this is a POST request with parameters in the URL
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postImageMaterialDespiece = async (jwt, formData) => {
  try {
      const response = await axios.post(`${API}/post_image_material_imagen_despiece`, formData, {
          headers: {
              Authorization: `Bearer ${jwt}`,
              'Content-Type': 'multipart/form-data'
          }
      });
      return response.data;
  } catch (error) {
      console.log(error);
      throw error;
  }
};

//PARAMETRIZACION MOTOS-MODELOdespiece

export const getListModelMotorcycle = async (jwt, empresa) => {
  try {
    const response = await axios.get(`${API}/get_list_model_motorcycle?empresa=${empresa}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDespieceData = async (jwt, empresa) => {
  try {
    const response = await axios.get(`${API}/get_list_model_despiece_motorcycle?empresa=${empresa}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const postModeloCrecimientoBI = async (jwt, data) => {
  try {
    const response = await axios.post(`${API}/post_modelo_crecimiento_bi`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getModeloCrecimientoBI = async (jwt) => {
  try {
    const response = await axios.get(`${API}/get_modelo_crecimiento_bi`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateModeloCrecimientoBI = async (jwt, data) => {
  try {
    const response = await axios.put(`${API}/update_modelo_crecimiento_bi`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// MANAGE TRANS. ECOMMERCE-------

// Función para crear un transportista
export const createTransportistaEcommerce = async (jwt, data) => {
  try {
    const response = await axios.post(`${API}/create_transportista_ecommerce`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creando transportista:", error);
    throw error;
  }
};

// Función para actualizar un transportista
export const updateTransportistaEcommerce = async (jwt, data) => {
  try {
    const response = await axios.put(`${API}/update_transportista_ecommerce`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando transportista:", error);
    throw error;
  }
};

// Función para eliminar un transportista
export const deleteTransportistaEcommerce = async (jwt, cod_transportista, empresa) => {
  try {
    const response = await axios.delete(`${API}/delete_transportista_ecommerce`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: {
        cod_transportista,
        empresa,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error eliminando transportista:", error);
    throw error;
  }
};

// Función para obtener la lista de transportistas de una empresa
export const getTransportistasEcommerce = async (jwt, empresa) => {
  try {
    const response = await axios.get(`${API}/get_transportistas_ecommerce?empresa=${empresa}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo transportistas:", error);
    throw error;
  }
};

// Aprobacion Credito Directo:

export const getCabCreditoDirecto = async (jwt) => {
  try {
    const response = await axios.get(`${API}/get_cab_credito_directo`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo cabecera de crédito directo:", error);
    throw error;
  }
};

export const updateCabCreditoDirecto = async (jwt, data) => {
  try {
    const response = await axios.put(`${API}/update_cab_credito_directo`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando cabecera de crédito directo:", error);
    throw error;
  }
};

export const getDetCreditoDirecto = async (jwt, id_transaction) => {
  try {
    const response = await axios.get(`${API}/get_det_credito_directo?id_transaction=${id_transaction}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo detalle de crédito directo:", error);
    throw error;
  }
};

// Función para obtener las facturas B2B
export const getInvoiceB2B = async (jwt, start_date, end_date, pay_method, invoiced) => {
  try {
    const response = await axios.get(`${API}/get_invoice_b2b?start_date=${start_date}&finish_date=${end_date}&pay_method=${pay_method}&invoiced=${invoiced}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Función para obtener las partes de la compra B2B
export const getBuyPartsB2B = async (jwt, id_code, pay_method) => {
  try {
    const response = await axios.get(`${API}/buy_parts_b2b/${id_code}?pay_method=${pay_method}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Función para obtener los datos de balance de un cliente B2B
export const getBalanceDataClientB2B = async (jwt, empresa, client_id) => {
  try {
    const response = await axios.get(`${API}/get_balance_data_client_b2b?empresa=${empresa}&client_id=${client_id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo los datos de balance del cliente B2B:", error);
    throw error;
  }
};

export const postChangePriceEcommerce = async (jwt, price) => {
  try {
    const response = await axios.post(
      `${API}/post_change_price_ecommerce?price=${price}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error cambiando el precio en ecommerce:", error);
    throw error;
  }
};
// Función para obtener los detalles del producto sin imágenes
export const getProductDetailsWithoutImages = async (jwt, empresa) => {
  try {
    const response = await axios.get(`${API}/get_product_details_without_images?enterprise=${empresa}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo los detalles del producto sin imágenes:", error);
    throw error;
  }
};