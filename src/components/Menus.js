import Navbar0 from "./Navbar0";
import { toast } from 'react-toastify';
import React, { useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';
import { useAuthContext } from "../context/authContext";

const API = process.env.REACT_APP_API;

function Menus() {
  const [menus, setMenus] = useState([])
  const {jwt, userShineray, enterpriseShineray, }=useAuthContext();
   
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sistemaValue = queryParams.get('sistema');

  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${sistemaValue}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          }
        });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setMenus(data)
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    document.title = 'Menus';
    getMenus();
  }, [])



  return (
    <div>
        <Navbar0 menus={menus} style={{ marginTop: '70px', top: 0, left:0, width: "100%", zIndex: 1000}}/>
    </div>
  )
}

export default Menus