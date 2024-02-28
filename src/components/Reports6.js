import Navbar0 from "./Navbar0";
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import { SnackbarProvider} from 'notistack';
import { useAuthContext } from "../context/authContext";
const API = process.env.REACT_APP_API;

function Reports6() {
    const [menus, setMenus] = useState([])
    const {jwt, userShineray, enterpriseShineray, systemShineray}=useAuthContext();
    const iframeStyle = {
        width: '100%',
        height: '100vh',
        border: 0,
    };

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`,
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
                console.log(data)
            }
        } catch (error) {
        }
    }

    useEffect(() => {
        document.title = 'Gastos Mercadeo';
        getMenus();
    }, [])

    return (
        <SnackbarProvider>
            <div style={{ marginTop: '150px', top: 0, width: "100%", zIndex: 1000 }}>
                <Navbar0 menus={menus} />
                <iframe title="Gastos Mercadeo" 
                src="https://app.powerbi.com/reportEmbed?reportId=dd68ff50-474e-4926-a46e-9754288965b1&autoAuth=true&ctid=592efd1e-0d60-483c-975c-7279b5872b49" 
                frameborder="0" 
                style={iframeStyle}
                allowFullScreen={true}>
                </iframe>
            </div>
        </SnackbarProvider>
    )
}

export default Reports6