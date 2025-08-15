import Navbar0 from "./Navbar0";
import { toast } from "react-toastify";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SnackbarProvider } from "notistack";
import { useAuthContext } from "../context/authContext";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import "../styles/PowerBI.css";


const API = process.env.REACT_APP_API;

function Reports34() {
    const [menus, setMenus] = useState([]);
    const [embed, setEmbed] = useState(null); // { token, embedUrl, reportId, cedula_vendedor, expiration }
    const { jwt, userShineray, enterpriseShineray, systemShineray } = useAuthContext();

    const iframeStyle = {
        width: '100%',
        height: '500vh',
        border: 0,
    };

    const tokenTimerRef = useRef(null);

    const getMenus = async () => {
        try {
            const res = await fetch(
                `${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + jwt,
                    },
                }
            );
            if (!res.ok) {
                if (res.status === 401) toast.error("Sesión caducada.");
            } else {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("No se pudieron cargar los menús.");
        }
    };

    const fetchEmbedToken = async () => {
        try {
            const res = await fetch(`${API}/bi/embed-token/${userShineray}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + jwt,
                }
            });
            if (!res.ok) {
                if (res.status === 401) toast.error("Sesión caducada.");
                const err = await res.text();
                throw new Error(err || "Fallo al obtener el embed token.");
            }
            const data = await res.json();
            setEmbed(data);
            if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current);
            if (data.expiration) {
                const ms = Math.max(
                    0,
                    new Date(data.expiration).getTime() - Date.now() - 5 * 60 * 1000
                );
                tokenTimerRef.current = setTimeout(fetchEmbedToken, ms);
            }
        } catch (e) {
            console.error(e);
            toast.error("No se pudo cargar el reporte.");
        }
    };

    useEffect(() => {
        document.title = "Ventas Repuestos";
        getMenus();
        fetchEmbedToken();
        return () => {
            if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Filtro básico (equivalente a Django) ---
    // Si su modelo usa NOMBRE del vendedor:
    const basicFilterByNombre = useMemo(
        () => ({
            $schema: "http://powerbi.com/product/schema#basic",
            target: {
                table: "VENDEDORES",
                column: "COD_USUARIO",
            },
            operator: "In",
            values: [userShineray], // asegúrese que coincida EXACTO con el dato del modelo
            filterType: models.FilterType.BasicFilter,
        }),
        [userShineray]
    );


    return (
        <div style={{ marginTop: '150px', top: 0, width: "100%", zIndex: 1000 }}>
            <Navbar0 menus={menus} />
            {embed && (

                <div className="embed-wrapper">
                    <PowerBIEmbed
                        style={{}}
                        cssClassName="pbi-embed pbi-embed--long"
                        embedConfig={{
                            type: "report",
                            id: embed.reportId,
                            embedUrl: embed.embedUrl,
                            accessToken: embed.token,
                            tokenType: models.TokenType.Embed,

                            filters: [basicFilterByNombre],

                            settings: {
                                panes: {
                                    filters: { visible: false },
                                    pageNavigation: { visible: true },
                                },
                            },
                        }}

                        eventHandlers={new Map([
                            ["loaded", () => {
                                document.querySelector(".pbi-embed")?.classList.add("is-loaded");
                            }],
                            ["error", () => {
                                const el = document.querySelector(".pbi-embed");
                                el?.classList.remove("is-loading");
                                el?.classList.add("is-error");
                            }],
                        ])}
                    />
                </div>

            )}
        </div>
    );
}



export default Reports34;