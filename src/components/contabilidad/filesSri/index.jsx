import React, { useState, useEffect } from 'react'
import Navbar0 from '../../Navbar0'
import { getMenus } from '../../../services/api'
import { useAuthContext } from '../../../context/authContext'
import { toast } from 'react-toastify';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { postDocumentsSri } from '../../../services/api';

import * as XLSX from 'xlsx'
import Papa from 'papaparse';
export const ElectronicFilesSri = () => {
  const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState(null);
  const [data, setData] = useState(null);
  const [newJsonData, setNewJsonData] = useState(null);
  const [newFile, setNewFile]= useState(null);

  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'CON', jwt)
        setMenus(data)

      }
      catch (error) {
        toast.error(error)
      }

    }
    menu();
  }, [])


// Función para realizar la búsqueda y reemplazo
const buscarYReemplazar = (cadena) => {
        const mapeoReemplazos = {
          'Retenci�n': 'Retencion',
          'Cr�dito': 'Credito',
          'D�bito': 'Debito',
        };
  
        // Realizar el reemplazo utilizando expresiones regulares
        return cadena.replace(/Retenci�n|Cr�dito|D�bito/g, (match) => mapeoReemplazos[match]);
      };


const handleSaveData =async () => {
    const datosActualizados = data.map((item) => ({
      ...item,
      COMPROBANTE: buscarYReemplazar(item.COMPROBANTE),
    }));
    const dataSri={
      dataSri:datosActualizados
    }
   const response= await postDocumentsSri(dataSri);
   console.log(response)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setName(file.name)
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;

        // Divide el contenido en líneas
        const lines = fileContent.split('\n');

        // Divide cada línea en campos y crea objetos JSON
        const jsonData = lines.slice(1).map((line) => {
          const fields = line.split('\t');
          return {
            COMPROBANTE: fields[0],
            SERIE_COMPROBANTE: fields[1],
            RUC_EMISOR: fields[2],
            RAZON_SOCIAL_EMISOR: fields[3],
            FECHA_EMISION: fields[4],
            FECHA_AUTORIZACION: fields[5],
            TIPO_EMISION: fields[6],
            NUMERO_DOCUMENTO_MODIFICADO: fields[7],
            IDENTIFICACION_RECEPTOR: fields[8],
            CLAVE_ACCESO: fields[9],
            NUMERO_AUTORIZACION: fields[10],
            IMPORTE_TOTAL: fields[11],
          };
        });

        setData(jsonData);
      };

      reader.readAsText(file);
    }
  };

  if(data !== null){
    
    // console.log(data)
    
  }

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <Navbar0 menus={menus} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'right',
          '& > *': {
            m: 1,
          },
        }}
      >
        <ButtonGroup variant="text" aria-label="text button group" >
          <Button onClick={() => { navigate('/dashboard') }}>Módulos</Button>
        </ButtonGroup>
      </Box>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <input
          accept=".txt"
          id="file-upload"
          multiple
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '45px', width: '170px', borderRadius: '5px', marginRight: '15px' }}>
            CARGAR
          </Button>
        </label>
        <div>
          {name === null ? null :
            <>
              <p className=''>
                {name}</p>
            </>
          }
        </div>
        <div>
          <div>
            {name === null ? null :
              <>
                <Button onClick={()=>handleSaveData()} variant="contained" component="span" style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '45px', width: '170px', borderRadius: '5px', marginRight: '15px', marginLeft: '32px' }}>
                  GUARDAR
                </Button>
              </>
            }
          </div>

        </div>

      </div>
      ElectronicFilesSri
    </div>
  )
}
