import React, { useState, useEffect, useRef } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress
} from '@mui/material'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import { useAuthContext } from '../../../context/authContext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import {
    getActiveAgencies,
    getPoliticaCredito,
    getVendorsByEmpresaAndActivo,
    getCasosProductosByArgs,
    getProductosWithDespiece,
    getExistenceByAgency,
    getLotesWithInventory,
    getExistenciaLote,
    getCosto,
    generateOrderWarranty,
    createCasosProductos,
    postPostventasObs,
    deleteCasosProductos
} from '../../../services/api'

// Limitar a 10 resultados en Autocomplete
const filterOptions = createFilterOptions({
    limit: 10
})

export const PedidoDialog = ({
    openPedido,
    handleClosePedido,
    dataCasoPostventaEdit,
    modeloMot
}) => {
    const { jwt, enterpriseShineray, userShineray } = useAuthContext()

    // --- Encabezado / Cliente (se elimina Código Pedido de la cabecera) ---
    const [identificationNumber, setIdentificationNumber] = useState('')
    const [identificationType, setIdentificationType] = useState('')
    const [clientName, setClientName] = useState('')
    const [policyName, setPolicyName] = useState('')

    // --- Combos: Selección de Agente/Vendedor ---
    const [vendors, setVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState(null)

    // --- Lista global de agencias ---
    const [agencies, setAgencies] = useState([])

    // --- Detalle de productos (tabla de visualización) ---
    // Cada row incluye, si viene de BD, el campo cod_pedido.
    const [tableRows, setTableRows] = useState([])
    const codComprobante = dataCasoPostventaEdit?.cod_comprobante || ''
    const [productsList, setProductsList] = useState([])

    // --- Estados para diálogo de selección de producto ---
    const [openProductDialog, setOpenProductDialog] = useState(false)
    const [productSearch, setProductSearch] = useState({ codigo: '', nombre: '' })
    const [selectedProductForDialog, setSelectedProductForDialog] = useState(null)
    const [agenciesForProduct, setAgenciesForProduct] = useState([]) // Agencias con existencia para el producto
    const [selectedAgencyForProduct, setSelectedAgencyForProduct] = useState(null)
    const [lotesForProduct, setLotesForProduct] = useState([]) // Lotes disponibles para la agencia y producto
    const [selectedLote, setSelectedLote] = useState(null)
    const [availableUnits, setAvailableUnits] = useState(0)
    const [selectedQuantity, setSelectedQuantity] = useState(1)

    // --- Estados de carga específicos para cada API en el diálogo ---
    const [loadingAgenciesForProduct, setLoadingAgenciesForProduct] = useState(false)
    const [loadingLotesForProduct, setLoadingLotesForProduct] = useState(false)
    const [loadingLoteExistence, setLoadingLoteExistence] = useState(false)
    const [loadingCost, setLoadingCost] = useState(false)

    // --- Loader para la generación del pedido ---
    const [loadingGenerateOrder, setLoadingGenerateOrder] = useState(false)

    // --- Diálogo de confirmación para generar pedido ---
    const [openConfirm, setOpenConfirm] = useState(false)
    const [obsText, setObsText] = useState('')


    const [stockStatus, setStockStatus] = useState({})  // { [COD_PRODUCTO]: 'idle'|'loading'|'ok'|'none' }
    const radarStopRef = useRef(false)
    const currentResultsRef = useRef(new Set())   // ⬅️ IDs que siguen en pantalla
    const radarAbortRef = useRef(false);
    



    /*  Reinicia el radar cada vez que se abre el diálogo de productos.  */
    useEffect(() => {
        if (openProductDialog) {
            radarStopRef.current = false
            setStockStatus({})
        }

    }, [openProductDialog])



    // --- Carga inicial de datos ---
    useEffect(() => {
        if (!openPedido) return
        loadAllProducts()
        if (dataCasoPostventaEdit) {
            setClientName(dataCasoPostventaEdit.nombre_cliente || '')
            setIdentificationNumber(dataCasoPostventaEdit.identificacion_cliente || '')
            let tipoIdText = 'N/A'
            switch (dataCasoPostventaEdit.cod_tipo_identificacion) {
                case 1:
                    tipoIdText = 'Cédula'
                    break
                case 2:
                    tipoIdText = 'RUC'
                    break
                case 3:
                    tipoIdText = 'Pasaporte'
                    break
                default:
                    break
            }
            setIdentificationType(tipoIdText)

            fetchVendors()
            fetchPolicy()
            fetchAgencies()
            loadExistingProducts(codComprobante)

        }
    }, [openPedido, dataCasoPostventaEdit])

    useEffect(() => {
        if (openPedido && dataCasoPostventaEdit && productsList.length > 0) {
            loadExistingProducts(codComprobante);
        }
    }, [openPedido, dataCasoPostventaEdit, productsList]);

    const filtroProductos = productsList.filter((p) => {
        radarStopRef.current = true
        const { codigo, nombre, modelo } = productSearch
    
        const searchWords = (text) =>
            text.trim().toLowerCase().split(/\s+/).filter(Boolean)
    
        const matchesField = (field = '', words) =>
            words.every((w) => field.toLowerCase().includes(w))
    
        const matchesModelo = (modeloText = '', words) => {
            const modelos = modeloText.toLowerCase().split('/').map(m => m.trim())
            return words.every((w) => modelos.some(m => m.includes(w)))
        }
    
        if (!codigo && !nombre && !modelo) return false
    
        const codeMatch = codigo ? matchesField(p.COD_PRODUCTO, searchWords(codigo)) : true
        const nameMatch = nombre ? matchesField(p.NOMBRE, searchWords(nombre)) : true
        const modelMatch = modelo ? matchesModelo(p.MODELO, searchWords(modelo)) : true
    
        radarStopRef.current = false
        return codeMatch && nameMatch && modelMatch
    }).slice(0, 10)


    useEffect(() => {
        currentResultsRef.current = new Set(filtroProductos.map(p => p.COD_PRODUCTO))
    }, [filtroProductos])

    const fetchAgencies = async () => {
        try {
            const data = await getActiveAgencies(jwt, enterpriseShineray)
            setAgencies(data)
        } catch (error) {
            console.log('Error al obtener agencias:', error)
        }
    }

    const fetchPolicy = async () => {
        try {
            const codPolitica = 17 // "GARANTIAS"
            const result = await getPoliticaCredito(jwt, enterpriseShineray, codPolitica)
            setPolicyName(result && result.length > 0 ? result[0].NOMBRE : 'N/A')
        } catch (error) {
            console.log('Error al obtener política:', error)
            setPolicyName('')
        }
    }

    const fetchVendors = async () => {
        try {
            const data = await getVendorsByEmpresaAndActivo(jwt, enterpriseShineray, 'S')
            setVendors(data)
            setSelectedVendor(null)
        } catch (error) {
            console.log('Error al obtener vendedores:', error)
        }
    }

    const loadExistingProducts = async (codComprobante_) => {
        try {
            const data = await getCasosProductosByArgs(jwt, codComprobante_);
            const rows = data.map((item) => {
                // Buscar el producto en productsList
                const productInfo = productsList.find(
                    (product) => product.COD_PRODUCTO === item.cod_producto
                );

                return {
                    secuencia: item.secuencia,
                    cod_pedido: item.cod_pedido, // Desde BD
                    cod_producto: item.cod_producto,
                    productoInfo: {
                        COD_PRODUCTO: item.cod_producto,
                        NOMBRE: productInfo ? productInfo.NOMBRE : 'Cargando..',
                    },
                    existencia: 0,
                    lote: item.cod_comprobante_lote || null,
                    lotesDisponibles: [],
                    existenciaLote: 0,
                    cantidad: item.cantidad,
                    precio: item.precio,
                    selectedAgency: item.agencia || null,
                    readOnly: true,
                };
            });
            setTableRows(rows);
        } catch (error) {
            console.log('Error al cargar casos_productos:', error);
            setTableRows([]);
        }
    };
    const loadAllProducts = async () => {
        try {
            const data = await getProductosWithDespiece(jwt, enterpriseShineray, 'S')
            setProductsList(data)
        } catch (error) {
            console.log('Error al cargar productos:', error)
        }
    }

    // --- Funciones para el diálogo de selección de producto ---

    // Al seleccionar un producto, se carga la lista de agencias con existencia
    // Función para cargar las agencias con existencia para el producto seleccionado
    const handleSelectProduct = async (prod) => {
        radarStopRef.current = true
        radarAbortRef.current = true;
        setLoadingAgenciesForProduct(true)
        setSelectedProductForDialog(prod)
        const agenciasConExistencia = []
        for (const agency of agencies) {
            try {
                const r = await getExistenceByAgency(jwt, enterpriseShineray, agency.COD_AGENCIA, prod.COD_PRODUCTO)
                if (r.existencia_lote > 0) {
                    // Se agrega la propiedad "existencia" para almacenar la cantidad disponible
                    agenciasConExistencia.push({
                        ...agency,
                        existencia: r.existencia_lote
                    })
                }
            } catch (error) {
                console.log('Error al obtener existencia para agencia', agency.COD_AGENCIA, error)
            }
        }
        setAgenciesForProduct(agenciasConExistencia)
        setLoadingAgenciesForProduct(false)
    }

    // Al seleccionar una agencia se cargan los lotes disponibles para ese producto y agencia
    const handleAgencySelection = async (value) => {
        setSelectedAgencyForProduct(value)
        setLoadingLotesForProduct(true)
        try {
            const lotesData = await getLotesWithInventory(
                jwt,
                enterpriseShineray,
                value.COD_AGENCIA,
                selectedProductForDialog.COD_PRODUCTO
            )
            setLotesForProduct(lotesData)
        } catch (error) {
            console.log('Error al obtener lotes:', error)
            setLotesForProduct([])
        } finally {
            setLoadingLotesForProduct(false)
        }
    }

    // Al seleccionar un lote, se consulta la existencia de unidades disponibles
    const handleLoteSelection = async (lote) => {
        setSelectedLote(lote)
        setLoadingLoteExistence(true)
        try {
            const result = await getExistenciaLote(
                jwt,
                enterpriseShineray,
                selectedAgencyForProduct.COD_AGENCIA,
                selectedProductForDialog.COD_PRODUCTO,
                lote.tipo,
                lote.cod_comprobante_lote
            )
            setAvailableUnits(result.existencia_lote || 0)
        } catch (error) {
            console.log('Error al obtener existencia de lote:', error)
            setAvailableUnits(0)
        } finally {
            setLoadingLoteExistence(false)
        }
    }

    // Al agregar el producto, se consulta el costo unitario y se agrega el row a la tabla
    const handleAddRowFromDialog = async () => {
        setLoadingCost(true)
        try {
            let cost = 0
            try {
                const costResponse = await getCosto(
                    jwt,
                    enterpriseShineray,
                    selectedProductForDialog.COD_PRODUCTO,
                    selectedLote.cod_comprobante_lote,
                    selectedLote.tipo
                )
                cost = costResponse?.costo || 0
            } catch (error) {
                console.log('Error al obtener costo:', error)
            }
            const newRow = {
                secuencia: -1,
                cod_pedido: '',
                cod_producto: selectedProductForDialog?.COD_PRODUCTO || null,
                productoInfo: selectedProductForDialog,
                existencia: availableUnits,
                lote: selectedLote || null,
                lotesDisponibles: lotesForProduct,
                existenciaLote: availableUnits,
                cantidad: selectedQuantity,
                precio: cost,
                selectedAgency: selectedAgencyForProduct,
                readOnly: false
            }
            setTableRows(prev => [...prev, newRow])
            // Reiniciar estados del diálogo
            setSelectedProductForDialog(null)
            setAgenciesForProduct([])
            setSelectedAgencyForProduct(null)
            setLotesForProduct([])
            setSelectedLote(null)
            setAvailableUnits(0)
            setSelectedQuantity(1)
            setProductSearch({ codigo: '', nombre: '' })
            setOpenProductDialog(false)
        } finally {
            setLoadingCost(false)
        }
    }

    // --- Funciones para la tabla de detalle (cambiar lote, cantidad, eliminar row) ---
    const handleChangeLote = async (rowIndex, newValue) => {
        const newRows = [...tableRows]
        const row = { ...newRows[rowIndex] }
        row.lote = newValue || null
        row.cantidad = 1
        row.precio = 0
        row.existenciaLote = 0

        if (row.cod_producto && row.selectedAgency && row.lote) {
            try {
                const eLote = await getExistenciaLote(
                    jwt,
                    enterpriseShineray,
                    row.selectedAgency.COD_AGENCIA,
                    row.cod_producto,
                    row.lote.tipo,
                    row.lote.cod_comprobante_lote
                )
                row.existenciaLote = eLote.existencia_lote ?? 0
            } catch (err) {
                row.existenciaLote = 0
                console.log('Error getExistenciaLote:', err)
            }
            try {
                const c = await getCosto(
                    jwt,
                    enterpriseShineray,
                    row.cod_producto,
                    row.lote.cod_comprobante_lote,
                    row.lote.tipo
                )
                row.precio = c.costo ?? 0
            } catch (err) {
                row.precio = 0
                console.log('Error getCosto:', err)
            }
        }
        newRows[rowIndex] = row
        setTableRows(newRows)
    }

    const handleChangeCantidad = (rowIndex, newValue) => {
        const newRows = [...tableRows]
        const row = { ...newRows[rowIndex] }
        let val = Number(newValue)
        if (val < 1) val = 1
        if (val > row.existenciaLote) val = row.existenciaLote
        row.cantidad = val
        newRows[rowIndex] = row
        setTableRows(newRows)
    }

    const handleDeleteRow = async (rowIndex) => {
        try {
            const row = tableRows[rowIndex]

            // Llamar a deleteCasosProductos solo si el registro existe en la BD
            // y no tiene cod_pedido (nulo o vacío)
            if (row.secuencia > 0 && (!row.cod_pedido || row.cod_pedido.trim() === '')) {
                await deleteCasosProductos(jwt, codComprobante, row.secuencia)
                console.log(`Registro (secuencia=${row.secuencia}) eliminado en la BD`)
            }

            // Eliminar siempre la fila a nivel local (estado)
            const newRows = [...tableRows]
            newRows.splice(rowIndex, 1)
            setTableRows(newRows)

        } catch (error) {
            console.error('Error al eliminar casos_productos:', error)
            alert('No se pudo eliminar el registro en la BD.')
        }
    }

    const renderExistenceIcon = (exist) => {
        return exist > 0 ? (
            <CheckCircleIcon style={{ color: 'green' }} fontSize="small" />
        ) : (
            <CancelIcon style={{ color: 'red' }} fontSize="small" />
        )
    }

    const total = tableRows.reduce((acc, item) => {
        return acc + ((Number(item.cantidad) || 0) * (Number(item.precio) || 0))
    }, 0)

    const handleOpenConfirm = () => {
        if (!selectedVendor) {
            alert('Por favor seleccione un Vendedor (cod_agente) antes de generar el pedido.')
            return
        }
        setObsText('')
        setOpenConfirm(true)
    }
    const handleCloseConfirm = () => setOpenConfirm(false)

    const handleGenerateOrderFinal = async () => {
        setLoadingGenerateOrder(true)
        try {
            // 1) Agrupar las filas por agencia
            const agrupacion = {}
            tableRows.forEach(row => {
                if (row.selectedAgency && !row.readOnly) {
                    const agencyCode = row.selectedAgency.COD_AGENCIA
                    if (!agrupacion[agencyCode]) {
                        agrupacion[agencyCode] = []
                    }
                    agrupacion[agencyCode].push(row)
                }
            })

            // 2) Para cada agencia, insertar las filas nuevas y luego generar el pedido
            for (const agencyCode in agrupacion) {
                const rowsForAgency = agrupacion[agencyCode]

                // Primero creamos los registros nuevos de casos_productos
                for (const row of rowsForAgency) {
                    if (row.secuencia === -1) {
                        const body = {
                            tipo_comprobante: 'CP',
                            empresa: enterpriseShineray,
                            cod_comprobante: codComprobante,
                            cod_producto: row.cod_producto,
                            cantidad: row.cantidad,
                            precio: row.precio,
                            adicionado_por: userShineray,
                            tipo_comprobante_lote: row.lote?.tipo || '',
                            cod_comprobante_lote: row.lote?.cod_comprobante_lote || ''
                        }
                        await createCasosProductos(jwt, body)
                        console.log('Producto creado en BD:', body.cod_producto)
                    }
                }

                // Después generamos el pedido para esa agencia
                const payload = {
                    empresa: enterpriseShineray,
                    tipoComprobante: 'CP',
                    codComprobante: codComprobante,
                    codAgencia: agencyCode,
                    codPolitica: 17,
                    todos: 0,
                    codAgente: selectedVendor.COD_PERSONA
                }
                const respPedido = await generateOrderWarranty(jwt, payload)
                console.log('Pedido generado para agencia', agencyCode, '->', respPedido)
                alert(`Pedido generado para la agencia ${agencyCode}`)
            }

            // 3) Guardar observación, si existe texto
            if (obsText.trim() !== '') {
                const obsBody = {
                    tipo_comprobante: 'CP',
                    empresa: enterpriseShineray,
                    cod_comprobante: codComprobante,
                    usuario: userShineray,
                    observacion: obsText.trim(),
                    tipo: 'PE'
                }
                await postPostventasObs(jwt, obsBody)
                console.log('Observación guardada.')
            }
        } catch (error) {
            console.log('Error generando pedido:', error)
            const backendMessage = error?.response?.data?.error
            alert(
                backendMessage
                    ? 'Error del sistema:\n' + backendMessage
                    : 'No se pudo generar el pedido: ' + error.message
            )
        } finally {
            setLoadingGenerateOrder(false)
            setOpenConfirm(false)
            handleClosePedido()
        }
    }

    const radarExistencia = async (prod) => {
        // si ya no aparece en la pantalla, no hagas nada
        if (!currentResultsRef.current.has(prod.COD_PRODUCTO)) return;
    
        // si ya tiene estado o el radar está detenido, salir
        if (stockStatus[prod.COD_PRODUCTO] || radarStopRef.current) return;
    
        setStockStatus((p) => ({ ...p, [prod.COD_PRODUCTO]: 'loading' }));
    
        let tieneStock = false;
    
        for (const agency of agencies) {
            // salir si ya no está en pantalla o se detuvo el radar
            if (!currentResultsRef.current.has(prod.COD_PRODUCTO) || radarStopRef.current || radarAbortRef.current) return;
            
            try {
                const r = await getExistenceByAgency(jwt, enterpriseShineray, agency.COD_AGENCIA, prod.COD_PRODUCTO);
                if (r.existencia_lote > 0) {
                    tieneStock = true;
                    break; // ¡ENCONTRADO! salimos del loop inmediatamente
                }
            } catch (_) {
                // ignorar errores individuales
            }
        }
        if (radarAbortRef.current) return;
    
        if (currentResultsRef.current.has(prod.COD_PRODUCTO) && !radarStopRef.current) {
            setStockStatus((prev) => ({
                ...prev,
                [prod.COD_PRODUCTO]: tieneStock ? 'ok' : 'none'
            }));
        }
    };
    

    const ProductoItem = ({ prod }) => {
        const status = stockStatus[prod.COD_PRODUCTO]
        return (
            <Paper
                key={prod.COD_PRODUCTO}
                style={{
                    padding: 10,
                    marginBottom: 5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: '16px'
                }}
            >
                <div
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => handleSelectProduct(prod)}
                >
                    <Typography variant="body2" >
                        {`${prod.COD_PRODUCTO} - ${prod.NOMBRE}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Modelos: {prod.MODELO}
                    </Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {status === 'loading' && <CircularProgress size={18} />}
                    {status === 'ok' && <CheckCircleIcon color="success" fontSize="small" />}
                    {status === 'none' && <CancelIcon color="error" fontSize="small" />}
                </div>
            </Paper>
        )
    }

    // Dentro de PedidoDialog, antes del return:
    const resetProductDialog = () => {
        radarStopRef.current = false;
        radarAbortRef.current = false; //
        setSelectedProductForDialog(null);
        setAgenciesForProduct([]);
        setSelectedAgencyForProduct(null);
        setLotesForProduct([]);
        setSelectedLote(null);
        setAvailableUnits(0);
        setSelectedQuantity(1);
        setStockStatus({})
    };



    return (
        <div>
            <Dialog open={openPedido} onClose={handleClosePedido} maxWidth="xl" fullWidth>
                <DialogTitle>Generar Pedido</DialogTitle>
                <DialogContent dividers>
                    {/* ENCABEZADO (sin Código Pedido) */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Identificación"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={identificationNumber}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Tipo Identificación"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={identificationType}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Cliente"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={clientName}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* COMBOS: Selección de Agente y visualización de la Política */}
                    <Grid container spacing={2} style={{ marginTop: 10 }}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={vendors}
                                value={selectedVendor}
                                onChange={(e, newVal) => setSelectedVendor(newVal)}
                                getOptionLabel={(o) => `${o.COD_PERSONA} - ${o.NOMBRE}`}
                                isOptionEqualToValue={(opt, val) =>
                                    opt.COD_PERSONA === (val?.COD_PERSONA || '')
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Agente (Obligatorio)"
                                        variant="outlined"
                                        margin="dense"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Política"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={policyName}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* TABLA de detalle de productos (solo para visualizar) */}
                    <Typography variant="h6" style={{ marginTop: 20, marginBottom: 10 }}>
                        Detalle de Productos
                    </Typography>
                    <Paper variant="outlined" style={{ padding: 10 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Sec</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Cod Pedido</TableCell>
                                        <TableCell style={{ fontWeight: 'bold', width: '300px' }}>Producto</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Agencia</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Exist.</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Lote</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Exist.Lote</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Cant.</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>P.Unit</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableRows.map((row, idx) => {
                                        const lineTotal = (row.cantidad || 0) * (row.precio || 0)
                                        return (
                                            <TableRow key={idx} style={row.readOnly ? { opacity: 0.5 } : {}}>
                                                <TableCell>{row.secuencia > 0 ? row.secuencia : 'NEW'}</TableCell>
                                                <TableCell>{row.cod_pedido || ''}</TableCell>
                                                <TableCell>
                                                    {row.productoInfo
                                                        ? `${row.productoInfo.COD_PRODUCTO} - ${row.productoInfo.NOMBRE}`
                                                        : <em>Seleccione producto</em>}
                                                </TableCell>
                                                <TableCell>
                                                    {row.readOnly
                                                        ? row.selectedAgency ? row.selectedAgency.AGENCIA : ''
                                                        : row.selectedAgency && row.selectedAgency.AGENCIA}
                                                </TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>
                                                    {renderExistenceIcon(row.existencia)}
                                                </TableCell>
                                                <TableCell style={{ width: '150px' }}>
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        value={row.lote}
                                                        onChange={(e, newVal) => handleChangeLote(idx, newVal)}
                                                        options={row.lotesDisponibles}
                                                        getOptionLabel={(opt) =>
                                                            opt.cod_comprobante_lote
                                                                ? `${opt.tipo}-${opt.cod_comprobante_lote}`
                                                                : ''
                                                        }
                                                        isOptionEqualToValue={(opt, val) =>
                                                            opt.cod_comprobante_lote === (val?.cod_comprobante_lote || '')
                                                        }
                                                        renderInput={(params) => (
                                                            <TextField {...params} variant="outlined" placeholder="Lote" />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{row.existenciaLote}</TableCell>
                                                <TableCell style={{ width: '100px' }}>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={row.cantidad}
                                                        onChange={(e) => handleChangeCantidad(idx, e.target.value)}
                                                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                        sx={{ width: '100%' }}
                                                    />
                                                </TableCell>
                                                <TableCell style={{ textAlign: 'right' }}>
                                                    {row.precio.toFixed(2)}
                                                </TableCell>
                                                <TableCell style={{ textAlign: 'right' }}>
                                                    {lineTotal.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleDeleteRow(idx)}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenProductDialog(true)}
                            style={{ marginTop: 10 }}
                        >
                            Agregar Producto
                        </Button>
                    </Paper>
                    <Typography variant="h6" align="right" style={{ marginTop: 15 }}>
                        Total: {total.toFixed(2)}
                    </Typography>
                </DialogContent>

                {/* BOTONES FINALES */}
                <DialogActions>
                    <Button onClick={handleOpenConfirm} variant="contained" color="primary">
                        Generar Pedido
                    </Button>
                    <Button onClick={handleClosePedido} variant="outlined">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOGO DE CONFIRMACIÓN */}
            <Dialog open={openConfirm} onClose={handleCloseConfirm}>
                <DialogTitle>¿Está seguro de generar el pedido?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Por favor ingrese una observación:
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        value={obsText}
                        onChange={(e) => setObsText(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} disabled={loadingGenerateOrder}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGenerateOrderFinal}
                        variant="contained"
                        color="primary"
                        disabled={loadingGenerateOrder}
                    >
                        {loadingGenerateOrder ? <CircularProgress size={24} /> : 'Aceptar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOGO PARA SELECCIÓN DE PRODUCTO Y COMPLETAR DATOS */}
            <Dialog
                open={openProductDialog}
                onClose={() => {
                    resetProductDialog()
                    setOpenProductDialog(false)
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle disableTypography>
                    <Typography variant="h6" component="div">
                        Seleccionar Producto
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {modeloMot}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers style={{ position: 'relative' }}>
                    {selectedProductForDialog === null ? (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Código Producto"
                                    variant="outlined"
                                    fullWidth
                                    margin="dense"
                                    value={productSearch.codigo}
                                    onChange={(e) =>
                                        setProductSearch({ ...productSearch, codigo: e.target.value })
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Nombre Producto"
                                    variant="outlined"
                                    fullWidth
                                    margin="dense"
                                    value={productSearch.nombre}
                                    onChange={(e) =>
                                        setProductSearch({ ...productSearch, nombre: e.target.value })
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Modelo"
                                    variant="outlined"
                                    fullWidth
                                    margin="dense"
                                    value={productSearch.modelo}
                                    onChange={(e) =>
                                        setProductSearch({ ...productSearch, modelo: e.target.value })
                                    }
                                />
                            </Grid>

                            {filtroProductos.length > 0 && (
                                <Button
                                    variant="outlined"
                                    style={{
                                        marginBottom: '10px',
                                        marginTop: '10px',
                                        backgroundColor: 'firebrick',
                                        color: 'white',
                                        height: '30px',
                                        width: '100px',
                                        borderRadius: '5px',
                                        marginLeft: '16px'
                                    }}
                                    onClick={() => {
                                        filtroProductos.forEach(radarExistencia)
                                    }}
                                >
                                    Existencia
                                </Button>
                            )}
                            <div style={{ marginTop: 10, width: '100%' }}>
                                {filtroProductos.map((prod) => (
                                    <ProductoItem key={prod.COD_PRODUCTO} prod={prod} />
                                ))}
                            </div>
                        </Grid>
                    ) : (
                        // Vista del formulario para seleccionar agencia, lote y cantidad
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">
                                    Producto seleccionado: {selectedProductForDialog.COD_PRODUCTO} - {selectedProductForDialog.NOMBRE}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                {loadingAgenciesForProduct ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Autocomplete
                                        options={agenciesForProduct}
                                        value={selectedAgencyForProduct}
                                        onChange={(e, newVal) => handleAgencySelection(newVal)}
                                        // Se muestra el nombre de la agencia seguido de la cantidad entre paréntesis
                                        getOptionLabel={(option) =>
                                            option.AGENCIA ? `${option.AGENCIA} (${option.existencia})` : ''
                                        }
                                        isOptionEqualToValue={(opt, val) => opt.COD_AGENCIA === (val?.COD_AGENCIA || '')}
                                        renderInput={(params) => (
                                            <TextField {...params} variant="outlined" label="Agencia" margin="dense" />
                                        )}
                                    />
                                )}
                            </Grid>
                            {selectedAgencyForProduct && (
                                <Grid item xs={12}>
                                    {loadingLotesForProduct ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <Autocomplete
                                            options={lotesForProduct}
                                            value={selectedLote}
                                            onChange={(e, newVal) => handleLoteSelection(newVal)}
                                            getOptionLabel={(opt) =>
                                                opt.cod_comprobante_lote ? `${opt.tipo}-${opt.cod_comprobante_lote}` : ''
                                            }
                                            isOptionEqualToValue={(opt, val) =>
                                                opt.cod_comprobante_lote === (val?.cod_comprobante_lote || '')
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} variant="outlined" label="Lote" margin="dense" />
                                            )}
                                        />
                                    )}
                                </Grid>
                            )}
                            {selectedLote && (
                                <>
                                    <Grid item xs={12}>
                                        {loadingLoteExistence ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <Typography variant="body2">
                                                Unidades disponibles: {availableUnits}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            type="number"
                                            label="Cantidad a seleccionar"
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                            value={selectedQuantity}
                                            onChange={(e) => {
                                                let qty = Number(e.target.value)
                                                if (qty < 1) qty = 1
                                                if (qty > availableUnits) qty = availableUnits
                                                setSelectedQuantity(qty)
                                            }}
                                            inputProps={{ max: availableUnits, min: 1 }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedProductForDialog !== null ? (
                        <>
                            <Button onClick={resetProductDialog}>
                                Volver
                            </Button>
                            <Button
                                onClick={handleAddRowFromDialog}
                                variant="contained"
                                color="primary"
                                disabled={!selectedAgencyForProduct || !selectedLote || availableUnits < 1 || loadingCost}
                            >
                                {loadingCost ? <CircularProgress size={24} /> : "Agregar"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => {
                            resetProductDialog()
                            setOpenProductDialog(false)
                        }}>Cancelar</Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    )
}
