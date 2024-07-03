import Navbar0 from "./Navbar0";
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import { SnackbarProvider} from 'notistack';
import { useAuthContext } from "../context/authContext";
const API = process.env.REACT_APP_API;

function Reports13() {
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
        document.title = 'Negociacion Massline';
        getMenus();
    }, [])

    return (
        <SnackbarProvider>
            <div style={{ marginTop: '150px', top: 0, width: "100%", zIndex: 1000 }}>
                <Navbar0 menus={menus} />
                <iframe title="Negociacion Massline" 
                src="https://app.powerbi.com/reportEmbed?reportId=b5ffbf20-8184-4885-876a-3ea0fb89fae1&autoAuth=true&ctid=0b687f0f-ff25-42fd-a1db-30e2fe823e5d"
                frameborder="0" 
                style={iframeStyle}
                allowFullScreen={true}>
                </iframe>
            </div>
        </SnackbarProvider>
    )
}

export default Reports13