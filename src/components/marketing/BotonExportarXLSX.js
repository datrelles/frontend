import { IconButton, Tooltip } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import * as XLSX from "xlsx";

const BotonExportarXLSX = ({ datos, camposPlantilla, nombreArchivo = "exportacion.xlsx", camposBooleanos = [] }) => {
    const exportar = () => {
        const datosFiltrados = datos.map((registro) => {
            const nuevoRegistro = {};

            camposPlantilla.forEach((campo) => {
                let valor = registro[campo];

                if (camposBooleanos.includes(campo)) {
                    valor = valor === 1 ? "ACTIVO" : valor === 0 ? "INACTIVO" : valor;
                }

                nuevoRegistro[campo] = valor ?? '';
            });

            return nuevoRegistro;
        });

        const hoja = XLSX.utils.json_to_sheet(datosFiltrados);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Plantilla');

        XLSX.writeFile(libro, nombreArchivo);
    };

    return (
        <Tooltip title="Exportar XLSX">
            <IconButton onClick={exportar}>
                <GetAppIcon />
            </IconButton>
        </Tooltip>
    );
};


export default BotonExportarXLSX;
