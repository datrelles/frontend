import Navbar0 from "./Navbar0";
import { toast } from 'react-toastify';
import React, { useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API;

function Menus(props) {
  const [menus, setMenus] = useState([])
 
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sistemaValue = queryParams.get('sistema');

  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sistemaValue}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + props.token
          }
        });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setMenus(data)
        console.log(data)
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    getMenus();
  }, [])



  return (
    <div>
        <Navbar0 menus={menus} style={{ marginTop: '70px', top: 0, left:0, width: "100%", zIndex: 1000}}/>
    </div>
  )
}

export default Menus