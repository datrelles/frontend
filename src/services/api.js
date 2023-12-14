import axios from 'axios';

const API = process.env.REACT_APP_API;

export  const getMenus = async (user,enterprise,system,jwt) => {
  try {
    const res = await fetch(`${API}/menus/${user}/${enterprise}/${system}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        }
      });
      const data =  await res.json();
      return data    
  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw error
  }
}

export const postDocumentsSri= async(data, jwt)=>{
  try {
     const response = await axios.post(`${API}/comprobante/electronico`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
     return response.data
  } catch (error) {
    const errorMessage= error
    throw new Error(errorMessage)
  }
}

export const getDocumentsSri = async (start, end, jwt) => {
  
  try {
    const response = await axios.get(`${API}/doc_elec_recibidos?start_date=${start}&end_date=${end}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      }})
    return response.data;
  }
  catch (error) {
    console.log(error)
    const errorMessage = error.response.data.error.errorMessage
    throw new Error(errorMessage);
  }
}




