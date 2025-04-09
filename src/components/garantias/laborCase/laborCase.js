import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MUIDataTable from "mui-datatables";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { Button, TextField, Select, MenuItem } from "@mui/material";
import { toast } from 'react-toastify';
import moment from "moment";
import LoadingCircle from "../../contabilidad/loader"; 


import * as XLSX from "xlsx";

import { getOpagoRecords, getDocElectronicos } from "../../../services/api"; 
import { useAuthContext } from "../../../context/authContext";
import { getMenus } from '../../../services/api';
import Navbar0 from '../../Navbar0'

export const OpagoManager = () => {
  const { jwt, userShineray, enterpriseShineray } = useAuthContext();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  // Se inician con un rango “temporal”. Luego se ponen a null en useEffect.
  const [fromDate, setFromDate] = useState(moment().subtract(1, "months"));
  const [toDate, setToDate] = useState(moment());

  // Opción seleccionada: "PAGOS" o "FACTURAS"
  const [selectedOption, setSelectedOption] = useState("PAGOS");

  // Datos que se muestran en la tabla
  const [dataOpago, setDataOpago] = useState([]);

  // Cargar menús (opcional)
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menusData = await getMenus(userShineray, enterpriseShineray, 'GAR', jwt);
        setMenus(menusData);
      } catch (error) {
        toast.error('Error cargando menús');
        console.error(error);
      }
    };
    fetchMenus();
  }, [jwt]);

  // Al montar, reseteamos fechas para forzar la lógica
  useEffect(() => {
    setFromDate(null);
    setToDate(null);
  }, []);

  // Cuando cambien las fechas o la opción seleccionada, consultamos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Determinar fechas a usar
        let fechaIni = fromDate;
        let fechaFin = toDate;

        // Si alguna es null, usar rango por defecto
        if (fechaIni === null || fechaFin === null) {
          fechaIni = moment().subtract(1, 'months');
          fechaFin = moment();
        }

        const fechaIniStr = fechaIni.format('YYYY-MM-DD');
        const fechaFinStr = fechaFin.format('YYYY-MM-DD');

        if (selectedOption === "PAGOS") {
          // ----- Llamada a getOpagoRecords -----
          const empresa = '20';
          const params = {
            empresa,
            fechaFacturaIni: fechaIniStr,
            fechaFacturaFin: fechaFinStr
          };
          const result = await getOpagoRecords(jwt, params);
          setDataOpago(result);
        } else {
          // ----- Llamada a getDocElectronicos (FACTURAS) -----
          const paramsFact = {
            fechaEmisionIni: fechaIniStr,
            fechaEmisionFin: fechaFinStr,
          };
          const resultFact = await getDocElectronicos(jwt, paramsFact);
          setDataOpago(resultFact);
        }
      } catch (err) {
        if (selectedOption === "PAGOS") {
          toast.error('Error consultando /opago');
        } else {
          toast.error('Error consultando /doc_electronicos');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, jwt, selectedOption]);

  // Columnas para PAGOS (opago)
  const columnsPagos = [
    { name: 'factura_manual', label: 'Factura Manual' },
    { name: 'ruc', label: 'RUC' },
    { name: 'taller_descripcion', label: 'Taller Descripción' },
    { name: 'beneficiario', label: 'Beneficiario' },
    {
      name: 'fecha_factura',
      label: 'Fecha Factura',
      options: {
        customBodyRender: (value) => {
          if (!value) return '';
          return moment(value).format('YYYY-MM-DD');
        },
      },
    },
    {
      name: 'valor_pago',
      label: 'Valor Pago',
      options: {
        customBodyRender: (val) => (val ? Number(val).toFixed(2) : '0.00'),
      },
    },
    {
      name: 'saldo',
      label: 'Saldo',
      options: {
        customBodyRender: (val) => (val ? Number(val).toFixed(2) : '0.00'),
      },
    },
  ];

  // Columnas para FACTURAS (doc_electronicos)
  const columnsFacturas = [
    { name: 'serie_comprobante', label: 'Serie Comprobante' },
    { name: 'identificacion_receptor', label: 'Ident. Receptor' },
    { name: 'importe_total', label: 'Importe Total',
      options: {
        customBodyRender: (val) => (val ? Number(val).toFixed(2) : '0.00'),
      },
    },
    { name: 'iva', label: 'IVA',
      options: {
        customBodyRender: (val) => (val ? Number(val).toFixed(2) : '0.00'),
      },
    },
    { name: 'razon_social_emisor', label: 'Razón Social Emisor' },
    { name: 'ruc_emisor', label: 'RUC Emisor' },
    { name: 'taller_descripcion', label: 'Taller Descripción' },
    { name: 'valor_sin_impuestos', label: 'Valor Sin Impuestos',
      options: {
        customBodyRender: (val) => (val ? Number(val).toFixed(2) : '0.00'),
      },
    },
  ];

  // Elegimos columnas en base a la opción seleccionada
  const columns = selectedOption === "PAGOS" ? columnsPagos : columnsFacturas;

  // Configuración de la tabla
  const options = {
    selectableRows: false,
    responsive: 'standard',
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 50],
    download: false, // Desactivamos el download interno de MUIDataTable
    print: false,
    filter: false,
    viewColumns: false,
  };

  // Tema para la tabla
  const getMuiTheme = () =>
    createTheme({
      components: {
        MuiTableCell: {
          styleOverrides: {
            head: {
              backgroundColor: 'firebrick',
              color: '#ffffff',
              fontWeight: 'bold',
            },
          },
        },
      },
    });

  // Función para exportar a Excel lo que se muestra en la tabla
  const handleExportExcel = () => {
    // Armamos un array de objetos solo con las columnas mostradas en la tabla
    const sheetData = dataOpago.map((row) => {
      const rowData = {};
      columns.forEach((col) => {
        const { name, label, options } = col;
        let cellValue = row[name];
        // Si hay un customBodyRender, lo aplicamos para que salga el valor formateado
        if (options && typeof options.customBodyRender === 'function') {
          cellValue = options.customBodyRender(cellValue);
        }
        rowData[label] = cellValue;
      });
      return rowData;
    });

    // Creamos hoja y libro de Excel
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedOption);

    // Descargamos el archivo
    const fileName = selectedOption === "PAGOS" ? "Pagos.xlsx" : "Facturas.xlsx";
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
      <Navbar0 menus={menus} />

      {/* Selector de "FACTURAS" o "PAGOS" */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '25px' }}>
        <Select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          style={{ marginRight: '15px' }}
        >
          <MenuItem value="PAGOS">PAGOS</MenuItem>
          <MenuItem value="FACTURAS">FACTURAS</MenuItem>
        </Select>

        {/* Filtros de fecha */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                label="Fecha Desde"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                format="DD/MM/YYYY"
              />
            </DemoContainer>
          </LocalizationProvider>

          <div style={{ margin: '0 5px' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label="Fecha Hasta"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                  format="DD/MM/YYYY"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
        </div>

        {/* Botón para exportar a Excel */}
        <Button
          variant="contained"
          style={{ marginLeft: '20px', backgroundColor: 'firebrick' }}
          onClick={handleExportExcel}
        >
          Descargar Excel
        </Button>
      </div>

      {/* Tabla */}
      <div style={{ margin: '25px' }}>
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            title={selectedOption === "PAGOS" ? "Consulta Opago" : "Consulta Facturas"}
            data={dataOpago}
            columns={columns}
            options={options}
          />
        </ThemeProvider>
      </div>

      {/* Loader */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingCircle />
        </div>
      )}
    </div>
  );
};
