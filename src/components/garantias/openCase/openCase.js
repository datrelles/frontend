import React, { useState, useEffect, useMemo } from 'react'
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

import {
  getCheckInfoByEngineCode,
  getInfoActiveTalleres,
  getListTipoProblema,
  postSaveCaseWarranty,
  getMenus,
  getClienteDataForId,
  getIncidencesByMotorYear,
  saveNewDataClient
} from '../../../services/api'


import { useAuthContext } from '../../../context/authContext'
import Navbar0 from '../../Navbar0'
import { DialogAddClient } from './DialogAddClient'  // <--- ajusta la ruta

export const OpenCase = () => {
  // Obtenemos credenciales del contexto
  const { jwt, userShineray, enterpriseShineray } = useAuthContext()

  // ----- ESTADOS DEL FORMULARIO ----- ...
  // (igual que antes)
  const [engineCode, setEngineCode] = useState('')
  const [motorInfo, setMotorInfo] = useState(null)
  const [talleres, setTalleres] = useState([])
  const [selectedTaller, setSelectedTaller] = useState('')
  const [selectedProvincia, setSelectedProvincia] = useState('')
  const [selectedCanton, setSelectedCanton] = useState('')
  const [tipoProblemas, setTipoProblemas] = useState([])
  const [kilometraje, setKilometraje] = useState('')

  // CAMPOS DE CLIENTE
  // Observa que "nombreCliente" no se manipula manualmente 
  // (el user no puede editarlo, se rellena tras la consulta).
  const [nombreCliente, setNombreCliente] = useState('')
  const [identificacionCliente, setIdentificacionCliente] = useState('')
  const [identificacionClienteAux, setIdentificacionClienteAux] = useState('')
  const [tipoIdentificacion, setTipoIdentificacion] = useState('CED')
  const [telefonoContacto1, setTelefonoContacto1] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotificaciones, setEmailNotificaciones] = useState('')
  const [fechaVenta, setFechaVenta] = useState(dayjs())
  const [fechaCaso, setFechaCaso] = useState(dayjs())
  const [descripcionGeneral, setDescripcionGeneral] = useState('')
  const [problemList, setProblemList] = useState([{ tipoProblema: '', descripcion: '' }])
  const [incidencesByYear, setIncidencesByYear] = useState([])
  const [menus, setMenus] = useState([])

  // ----- NUEVO: State para abrir/cerrar el modal de creación de cliente
  const [openAddClient, setOpenAddClient] = useState(false)

  // useEffects para cargar info (igual que antes)...

  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        const response = await getInfoActiveTalleres(jwt, 1, enterpriseShineray)
        setTalleres(response)
      } catch (error) {
        console.error(error)
        toast.error('No se pudo cargar talleres')
      }
    }
    fetchTalleres()
  }, [jwt, enterpriseShineray])

  useEffect(() => {
    const fetchTiposProblema = async () => {
      try {
        const response = await getListTipoProblema(jwt)
        setTipoProblemas(response)
      } catch (error) {
        console.error(error)
        toast.error('No se pudo cargar los tipos de problema')
      }
    }
    fetchTiposProblema()
  }, [jwt])

  useEffect(() => {
    const menu = async () => {
      try {
        const data = await getMenus(userShineray, enterpriseShineray, 'GAR', jwt)
        setMenus(data)
      }
      catch (error) {
        toast.error(error)
      }
    }
    menu()
  }, [userShineray, enterpriseShineray, jwt])

  // useMemos para provincia/cantón/taller (igual)...

  const uniqueProvincias = useMemo(() => {
    return [...new Set(talleres.map(t => t.provincia))]
  }, [talleres])

  const uniqueCantones = useMemo(() => {
    if (!selectedProvincia) return []
    return [...new Set(talleres.filter(t => t.provincia === selectedProvincia).map(t => t.canton))]
  }, [talleres, selectedProvincia])

  const filteredTalleres = useMemo(() => {
    return talleres.filter(t => {
      return (selectedProvincia ? t.provincia === selectedProvincia : true) &&
             (selectedCanton ? t.canton === selectedCanton : true)
    })
  }, [talleres, selectedProvincia, selectedCanton])

  // Handler al "blur" del #Motor (igual)...
  const handleBlurEngineCode = async () => {
    if (!engineCode) return
    try {
      const info = await getCheckInfoByEngineCode(jwt, engineCode)
      setMotorInfo(info)
      toast.success('Información de motor cargada.')

      const incidences = await getIncidencesByMotorYear(jwt, enterpriseShineray, engineCode)
      setIncidencesByYear(incidences)
    } catch (error) {
      console.error(error)
      toast.error('No se encontró información para ese #Motor')
    }
  }

  // Handler para cuando pierda foco la cédula
  const handleBlurIdentificacionCliente = async () => {
    if (!identificacionClienteAux) return
    try {
      const dataCliente = await getClienteDataForId(jwt, identificacionClienteAux, enterpriseShineray)
      setNombreCliente(`${dataCliente.nombre} ${dataCliente.apellido1 || ''}`.trim())
      setTipoIdentificacion(dataCliente.cod_tipo_identificacion)
      setIdentificacionCliente(dataCliente.cod_cliente)
      toast.success('Datos de cliente cargados.')
    } catch (error) {
      console.error(error)
      // Si no encuentra => abrimos modal de creación de cliente
      toast.info("Cliente no encontrado. Regístralo por favor.")
      setOpenAddClient(true)
    }
  }

  // Handler que se llama luego de crear el cliente en el modal
  const handleClientCreated = async (newId) => {
    // Cerramos el modal
    setOpenAddClient(false)
    // Volvemos a buscar con la cédula que acaban de guardar
    try {
      const dataCliente = await getClienteDataForId(jwt, newId, enterpriseShineray)
      setNombreCliente(`${dataCliente.nombre} ${dataCliente.apellido1 || ''}`.trim())
      setTipoIdentificacion(dataCliente.cod_tipo_identificacion)
      setIdentificacionCliente(dataCliente.cod_cliente)
      toast.success('Datos de cliente cargados tras creación.')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cargar el cliente recién creado.')
    }
  }

  // Múltiples problemas...
  const handleProblemChange = (index, field, value) => {
    const newList = [...problemList]
    newList[index][field] = value
    setProblemList(newList)
  }

  const addNewProblem = () => {
    setProblemList([...problemList, { tipoProblema: '', descripcion: '' }])
  }

  // Al guardar el caso
  const handleSubmitCase = async () => {
    // Validación rápida
    if (!engineCode || !selectedTaller) {
      toast.error('Por favor llena los campos obligatorios (#Motor, Taller).')
      return
    }
    try {
      const arrayProblemas = problemList.map(item => ({
        CODIGO_TIPO_PROBLEMA: item.tipoProblema,
        DESCRIPCION_DEL_PROBLEMA: item.descripcion || 'SIN DESCRIPCIÓN'
      }))

      const dataCaso = {
        NOMBRE_CASO: engineCode,
        DESCRIPCION: descripcionGeneral,
        NOMBRE_CLIENTE: nombreCliente,  // Se llena tras la consulta
        COD_TIPO_IDENTIFICACION: tipoIdentificacion,
        IDENTIFICACION_CLIENTE: identificacionCliente,
        COD_MOTOR: engineCode,
        KILOMETRAJE: kilometraje,
        CODIGO_TALLER: selectedTaller,
        COD_TIPO_PROBLEMA: arrayProblemas[0]?.CODIGO_TIPO_PROBLEMA || '',
        FECHA_VENTA: fechaVenta.format('YYYY/MM'),
        FECHA: fechaCaso.format('YYYY/MM/DD HH:mm:ss'),
        PROBLEMAS: JSON.stringify(arrayProblemas),
        TELEFONO_CONTACTO1: telefonoContacto1,
        E_MAIL: email,
        E_MAIL2: emailNotificaciones,
        MANUAL_GARANTIA: "0",
        TELEFONO_CONTACTO2: telefonoContacto1,
      }

      await postSaveCaseWarranty(jwt, dataCaso, userShineray, enterpriseShineray)
      toast.success('Caso creado con éxito!')
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error('Error al crear el caso')
    }
  }

  const resetForm = () => {
    setEngineCode('')
    setMotorInfo(null)
    setSelectedTaller('')
    setKilometraje('')
    setNombreCliente('')
    setIdentificacionCliente('')
    setTipoIdentificacion('CED')
    setFechaVenta(dayjs())
    setFechaCaso(dayjs())
    setDescripcionGeneral('')
    setTelefonoContacto1('')
    setEmail('')
    setEmailNotificaciones('')
    setProblemList([{ tipoProblema: '', descripcion: '' }])
    setSelectedProvincia('')
    setSelectedCanton('')
    setIdentificacionClienteAux('')
  }

  return (
    <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <Navbar0 menus={menus} />
      <Box sx={{ margin: '50px' }}>
        <h2>Ingreso de Casos PostVenta</h2>

        {/* CAMPOS PRINCIPALES */}
        <Box sx={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <TextField
            label="# Motor"
            value={engineCode}
            onChange={(e) => setEngineCode(e.target.value.toUpperCase())}
            onBlur={handleBlurEngineCode}
            sx={{ width: '250px' }}
          />
          <TextField
            label="Kilometraje"
            value={kilometraje}
            onChange={(e) => setKilometraje(e.target.value)}
            sx={{ width: '250px' }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha Caso"
              value={fechaCaso}
              onChange={(newValue) => setFechaCaso(newValue)}
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>
        </Box>

        {/* CAMPOS DE CLIENTE */}
        <Box sx={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          <TextField
            label="Nombre Cliente (auto)"
            value={nombreCliente}
            disabled  // No se puede editar manualmente
            sx={{ width: '250px' }}
          />
          <FormControl sx={{ width: '250px' }}>
            <InputLabel>Tipo ID</InputLabel>
            <Select
              value={tipoIdentificacion}
              label="Tipo ID"
              onChange={(e) => setTipoIdentificacion(e.target.value)}
            >
              <MenuItem value='1'>Cédula</MenuItem>
              <MenuItem value='2'>RUC</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Identificación"
            value={identificacionClienteAux}
            onChange={(e) => setIdentificacionClienteAux(e.target.value)}
            onBlur={handleBlurIdentificacionCliente}
            sx={{ width: '250px' }}
          />
        </Box>

        {/* CONTACTO */}
        <Box sx={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          <TextField
            label="Teléfono"
            value={telefonoContacto1}
            onChange={(e) => setTelefonoContacto1(e.target.value)}
            sx={{ width: '250px' }}
          />
          <TextField
            label="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ width: '250px' }}
          />
          <TextField
            label="E-Mail Notificaciones"
            value={emailNotificaciones}
            onChange={(e) => setEmailNotificaciones(e.target.value)}
            sx={{ width: '250px' }}
          />
        </Box>

        {/* FILTROS TALLER */}
        <Box sx={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          <FormControl sx={{ width: '250px' }}>
            <InputLabel>Provincia</InputLabel>
            <Select
              value={selectedProvincia}
              label="Provincia"
              onChange={(e) => {
                setSelectedProvincia(e.target.value)
                setSelectedCanton('')
                setSelectedTaller('')
              }}
            >
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {uniqueProvincias.map((prov) => (
                <MenuItem key={prov} value={prov}>{prov}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ width: '250px' }}>
            <InputLabel>Cantón</InputLabel>
            <Select
              value={selectedCanton}
              label="Cantón"
              onChange={(e) => {
                setSelectedCanton(e.target.value)
                setSelectedTaller('')
              }}
              disabled={!selectedProvincia}
            >
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {uniqueCantones.map((cant) => (
                <MenuItem key={cant} value={cant}>{cant}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ width: '250px' }}>
            <InputLabel>Taller</InputLabel>
            <Select
              value={selectedTaller}
              label="Taller"
              onChange={(e) => setSelectedTaller(e.target.value)}
            >
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {filteredTalleres.map((t) => (
                <MenuItem key={t.codigo} value={t.codigo}>{t.taller}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha Venta"
              views={['year','month']}
              value={fechaVenta}
              onChange={(newValue) => setFechaVenta(newValue)}
              format="YYYY/MM"
            />
          </LocalizationProvider>
        </Box>

        {/* PROBLEMAS */}
        <Box
          sx={{
            maxHeight: '180px',
            overflowY: 'auto',
            marginTop: '20px',
            border: '1px solid #ccc',
            padding: '10px',
            width: '790px'
          }}
        >
          {problemList.map((item, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap', width: '80%' }}
            >
              <FormControl sx={{ width: '250px' }}>
                <InputLabel>Tipo Problema</InputLabel>
                <Select
                  value={item.tipoProblema}
                  label="Tipo Problema"
                  onChange={(e) => handleProblemChange(index, 'tipoProblema', e.target.value)}
                >
                  <MenuItem value="">-- Seleccionar --</MenuItem>
                  {tipoProblemas.map((tp) => (
                    <MenuItem key={tp.codigo} value={tp.codigo}>
                      {tp.tipo_problema}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Descripción del Problema"
                value={item.descripcion}
                onChange={(e) => handleProblemChange(index, 'descripcion', e.target.value)}
                sx={{ width: '300px' }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ marginTop: '10px' }}>
          <Button variant="outlined" onClick={addNewProblem}>
            + Agregar Problema
          </Button>
        </Box>

        <Box sx={{ marginTop: '20px' }}>
          <TextField
            label="Descripción General"
            value={descripcionGeneral}
            onChange={(e) => setDescripcionGeneral(e.target.value)}
            multiline
            rows={2}
            sx={{ width: '790px' }}
          />
        </Box>

        <Box sx={{ marginTop: '20px' }}>
          <Button variant="contained" color="success" onClick={handleSubmitCase} sx={{ marginRight: '10px' }}>
            Guardar
          </Button>
          <Button variant="outlined" color="error" onClick={resetForm}>
            Limpiar
          </Button>
        </Box>

        {/* Info del motor (opcional) */}
        {motorInfo && (
          <Box sx={{ marginTop: '30px', padding: '10px', border: '1px solid gray' }}>
            <h4>Información del Motor:</h4>
            <p><b>Distribuidor:</b> {motorInfo.NOMBRE_DISTRIBUIDOR}</p>
            <p><b>Código Producto:</b> {motorInfo.COD_PRODUCTO}</p>
            <p><b>Chasis:</b> {motorInfo.COD_CHASIS}</p>
            <p><b>Importación:</b> {motorInfo.IMPORTACION}</p>

            {incidencesByYear.length > 0 && (
              <Box sx={{ marginTop: '20px' }}>
                <h4>Número de incidencias por año:</h4>
                {incidencesByYear.map((item, idx) => (
                  <p key={idx}>
                    Año {item.year}: <strong>{item.incidences}</strong> incidencias
                  </p>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* MODAL PARA CREAR CLIENTE NUEVO */}
      <DialogAddClient 
        open={openAddClient}
        onClose={() => setOpenAddClient(false)}
        jwt={jwt}
        enterprise={enterpriseShineray}
        onClientCreated={handleClientCreated} 
      />
    </div>
  )
}
