import Navbar0 from '../../Navbar0'
import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../../../context/authContext'
import { getMenus } from '../../../services/api'
import { toast } from 'react-toastify';


export const UpdateYear = () => {
    const [menus, setMenus] = useState([]);
    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()

        //Menu
        useEffect(() => {
          const menu = async () => {
              try {
                  const data = await getMenus(userShineray, enterpriseShineray, 'REP', jwt)
                  setMenus(data)
  
              }
              catch (error) {
                  console.log(error)
                  toast.error(error)
              }
  
          }
          menu();
      }, [])
  
    return (
      <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
       <Navbar0 menus={menus} />
      </div>
  )
}
