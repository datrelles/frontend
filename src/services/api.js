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

export const postDocumentsSri= async(data)=>{
  try {
     const response = await axios.post(`${API}/comprobante/electronico`, data)
     return response.data
  } catch (error) {
    const errorMessage= error.response.data
    throw new Error(errorMessage)
  }
}


