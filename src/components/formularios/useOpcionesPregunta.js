import { useEffect, useState } from "react";

export default function useOpcionesPregunta(APIService, codPregunta) {
    const [opciones, setOpciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpciones = async () => {
            try {
                const resp = await APIService.getOpcionesPregunta(codPregunta);

                if (Array.isArray(resp)) {
                    setOpciones(
                        resp.map((opt) => ({
                            codigo: opt.orden,
                            texto: opt.opcion
                        }))
                    );
                } else {
                    setOpciones([]);
                }
            } catch (e) {
                setOpciones([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOpciones();
    }, [APIService, codPregunta]);

    return { opciones, loading };
}
