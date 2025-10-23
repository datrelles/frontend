import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const ActivacionPDFButton = ({ activacion, logos = {} }) => {

    const getBase64Image = (imgPath) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imgPath;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
        });
    };


    const generarPDF = async (activacion, logos) => {
        const doc = new jsPDF("p", "pt");

        const logo1 = await getBase64Image(logos.shineray);

        doc.setFillColor(180, 0, 0);
        doc.rect(0, 0, doc.internal.pageSize.width, 60, "F");

        const pageWidth = doc.internal.pageSize.width;
        const logoWidth = 120;
        const logoHeight = 40;
        const x = (pageWidth - logoWidth) / 2;
        const y = 10;

        // Insertar logo centrado
        doc.addImage(logo1, "PNG", x, y, logoWidth, logoHeight);

        doc.setFontSize(14);
        doc.setFont("Helvetica-Bold");
        doc.text("SOLICITUD DE ACTIVACIÓN", doc.internal.pageSize.width / 2, 90, {
            align: "center",
        });

        const fechaIngreso = activacion.audit_fecha_ing;
        let fechaFormateada = "";

        if (fechaIngreso) {
            const parsed = dayjs(fechaIngreso);
            if (parsed.isValid()) {
                fechaFormateada = parsed.locale("es").format("D [de] MMMM [de] YYYY");
            } else {
                fechaFormateada = fechaIngreso;
            }
        }

        if (fechaFormateada) {
            doc.setFontSize(11);
            doc.setFont("Helvetica");
            doc.text(fechaFormateada, doc.internal.pageSize.width - 40, 120, { align: "right" });
        }

        const texto = `Por medio de la presente, se solicita la autorización para realizar la siguiente activación en punto de venta, con el objetivo de fortalecer la presencia de marca, impulsar las ventas y generar mayor acercamiento con los clientes finales. A continuación, se detallan los datos de la actividad planificada:`;

        doc.setFontSize(12);
        doc.text(texto, 40, 190, { maxWidth: doc.internal.pageSize.width - 80 });


        const detalles = [
            ["Tipo Activación", activacion.tipoActivacion],
            ["Promotor", activacion.promotor],
            ["Distribuidor", activacion.distribuidor],
            ["Canal", activacion.canal],
            ["Ciudad", activacion.ciudad],
            ["Tienda", activacion.tienda],
            ["Fecha", activacion.fecha],
            ["Hora Inicio", activacion.horaInicio],
            ["Hora Final", activacion.horaFinal],
            ["Horas Totales", activacion.horas],
            ["# Motos Exhibición", activacion.motos],
            ["Proveedor", activacion.proveedor],
            ["Estado", activacion.estado],
        ];

        doc.autoTable({
            startY: 280,
            head: [["Campo", "Valor"]],
            body: detalles,
            theme: "grid",
            headStyles: { fillColor: [200, 0, 0], textColor: 255 },
            styles: { fontSize: 10 },
        });

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(12);
        doc.text("Aprobado por:", 40, pageHeight - 190); // antes -120

        doc.line(100, pageHeight - 100, 240, pageHeight - 100);
        doc.text("Coordinador Mercadeo", 130, pageHeight - 80);

        doc.line(320, pageHeight - 100, 460, pageHeight - 100);
        doc.text("Coordinador Promotoría", 350, pageHeight - 80);

        window.open(doc.output("bloburl"), "_blank");
    };

    return (
        <Tooltip title="Descargar PDF (Frontend)">
            <IconButton color="secondary" onClick={() => generarPDF(activacion,logos)}
            >
                <PictureAsPdfIcon />
            </IconButton>
        </Tooltip>
    );
};

export default ActivacionPDFButton;
