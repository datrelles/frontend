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

//MODULE GARRANTY-------------------------------------------------------------------------------------
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

// ECOMMERCE MANAGE--------------------------------------------
export const getSellEcommerce = async (jwt, start_date, end_date, statusProcess) => {
  try {
    const response = await axios.get(`${API}/get_invoice_ecommerce?start_date=${start_date}&finish_date=${end_date}&case_status=${statusProcess}`, {
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

export const getBuyPartsEcommerce = async (jwt, id) => {
  try {
    const response = await axios.get(`${API}/buy_parts_ecommerce/${id}`, {
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