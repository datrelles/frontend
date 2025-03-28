import React, { useState, useEffect } from 'react'
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
    IconButton
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
    postPostventasObs
} from '../../../services/api'

// Limitar a 10 resultados en Autocomplete
const filterOptions = createFilterOptions({
    limit: 10
})

export const PedidoDialog = ({
    openPedido,
    handleClosePedido,
    dataCasoPostventaEdit
}) => {
    const { jwt, enterpriseShineray, userShineray } = useAuthContext()

    // -------------------------------------------
    // 1) Variables de encabezado / cliente
    // -------------------------------------------
    const [identificationNumber, setIdentificationNumber] = useState('')
    const [identificationType, setIdentificationType] = useState('')
    const [clientName, setClientName] = useState('')
    const [orderCode, setOrderCode] = useState('') // cod_pedido si existe, sino 'NO PEDIDO'
    const [policyName, setPolicyName] = useState('')

    // -------------------------------------------
    // 2) Combos: Agencia, Vendedor => cod_agente
    // -------------------------------------------
    const [agencies, setAgencies] = useState([])
    const [selectedAgency, setSelectedAgency] = useState(null)
    const [vendors, setVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState(null)

    // -------------------------------------------
    // 3) Detalle de productos
    // -------------------------------------------
    const [tableRows, setTableRows] = useState([])
    // Obtenemos el cod_comprobante del caso
    const codComprobante = dataCasoPostventaEdit?.cod_comprobante || ''

    // Lista de productos con despiece
    const [productsList, setProductsList] = useState([])

    // -------------------------------------------
    // 4) Diálogo de confirmación "Generar Pedido"
    // -------------------------------------------
    const [openConfirm, setOpenConfirm] = useState(false)
    const [obsText, setObsText] = useState('')

    //
    const hasExistingOrder = orderCode !== 'NO PEDIDO'

    // ----------------------------------------------------------------
    // useEffect: al abrir el diálogo -> cargar info
    // ----------------------------------------------------------------
    useEffect(() => {
        if (!openPedido) return

        if (dataCasoPostventaEdit) {
            // Rellenar encabezado
            setClientName(dataCasoPostventaEdit.nombre_cliente || '')
            setIdentificationNumber(dataCasoPostventaEdit.identificacion_cliente || '')

            let tipoIdText = 'N/A'
            switch (dataCasoPostventaEdit.cod_tipo_identificacion) {
                case 1: tipoIdText = 'Cédula'; break
                case 2: tipoIdText = 'RUC'; break
                case 3: tipoIdText = 'Pasaporte'; break
                default: break
            }
            setIdentificationType(tipoIdText)

            if (dataCasoPostventaEdit.cod_pedido) {
                setOrderCode(dataCasoPostventaEdit.cod_pedido)
            } else {
                setOrderCode('NO PEDIDO')
            }

            // Combos
            fetchAgencies()
            fetchPolicy()
            fetchVendors()

            // Detalles del caso
            loadExistingProducts(codComprobante)

            // Cargar lista productos
            loadAllProducts()
        }
    }, [openPedido, dataCasoPostventaEdit])

    // ----------------------------------------------------------------
    // Fetch combos y productos
    // ----------------------------------------------------------------
    const fetchAgencies = async () => {
        try {
            const data = await getActiveAgencies(jwt, enterpriseShineray)
            setAgencies(data)
            setSelectedAgency(null)
        } catch (error) {
            console.log('Error al obtener agencias:', error)
        }
    }

    const fetchPolicy = async () => {
        try {
            const codPolitica = 17 // "GARANTIAS"
            const result = await getPoliticaCredito(jwt, enterpriseShineray, codPolitica)
            if (result && result.length > 0) {
                setPolicyName(result[0].NOMBRE)
            } else {
                setPolicyName('N/A')
            }
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
            const data = await getCasosProductosByArgs(jwt, codComprobante_)
            const rows = data.map((item) => ({
                secuencia: item.secuencia,
                cod_producto: item.cod_producto,
                productoInfo: { COD_PRODUCTO: item.cod_producto, NOMBRE: '(Desde BD)' },
                existencia: 0,
                lote: item.cod_comprobante_lote || null,
                lotesDisponibles: [],
                existenciaLote: 0,
                cantidad: item.cantidad,
                precio: item.precio
            }))
            setTableRows(rows)
        } catch (error) {
            console.log('Error al cargar casos_productos:', error)
            setTableRows([])
        }
    }

    const loadAllProducts = async () => {
        try {
            const data = await getProductosWithDespiece(jwt, enterpriseShineray, 'S')
            setProductsList(data)
        } catch (error) {
            console.log('Error al cargar productos:', error)
        }
    }

    // ------------------------------------------------------------
    // Añadir fila nueva al detalle
    // ------------------------------------------------------------
    const handleAddRow = () => {
        setTableRows((prev) => [
            ...prev,
            {
                secuencia: -1,
                cod_producto: null,
                productoInfo: null,
                existencia: 0,
                lote: null,
                lotesDisponibles: [],
                existenciaLote: 0,
                cantidad: 1,
                precio: 0
            }
        ])
    }

    // ------------------------------------------------------------
    // Cambiar producto
    // ------------------------------------------------------------
    const handleChangeProduct = async (rowIndex, newValue) => {
        const newRows = [...tableRows]
        const row = { ...newRows[rowIndex] }

        row.cod_producto = newValue?.COD_PRODUCTO || null
        row.productoInfo = newValue || null
        row.cantidad = 1
        row.precio = 0
        row.lote = null
        row.lotesDisponibles = []
        row.existencia = 0
        row.existenciaLote = 0

        if (selectedAgency && row.cod_producto) {
            // 1) existenceByAgency
            try {
                const r = await getExistenceByAgency(jwt, enterpriseShineray, selectedAgency.COD_AGENCIA, row.cod_producto)
                row.existencia = r.existencia_lote ?? 0
            } catch (err) {
                row.existencia = 0
                console.log('Error existenceByAgency:', err)
            }

            // 2) lotesWithInventory
            try {
                const lotesData = await getLotesWithInventory(jwt, enterpriseShineray, selectedAgency.COD_AGENCIA, row.cod_producto)
                row.lotesDisponibles = lotesData
            } catch (err) {
                row.lotesDisponibles = []
                console.log('Error getLotesWithInventory:', err)
            }
        }

        newRows[rowIndex] = row
        setTableRows(newRows)
    }

    // ------------------------------------------------------------
    // Cambiar lote
    // ------------------------------------------------------------
    const handleChangeLote = async (rowIndex, newValue) => {
        const newRows = [...tableRows]
        const row = { ...newRows[rowIndex] }

        row.lote = newValue || null
        row.cantidad = 1
        row.precio = 0
        row.existenciaLote = 0

        if (row.cod_producto && selectedAgency && row.lote) {
            // 1) getExistenciaLote
            try {
                const eLote = await getExistenciaLote(
                    jwt,
                    enterpriseShineray,
                    selectedAgency.COD_AGENCIA,
                    row.cod_producto,
                    row.lote.tipo,
                    row.lote.cod_comprobante_lote
                )
                row.existenciaLote = eLote.existencia_lote ?? 0
            } catch (err) {
                row.existenciaLote = 0
                console.log('Error getExistenciaLote:', err)
            }

            // 2) getCosto
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

    // ------------------------------------------------------------
    // Cambiar cantidad
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // Eliminar fila (solo si es nueva: secuencia === -1)
    // ------------------------------------------------------------
    const handleDeleteRow = (rowIndex) => {
        const newRows = [...tableRows]
        newRows.splice(rowIndex, 1)
        setTableRows(newRows)
    }

    // ------------------------------------------------------------
    // Render icono exist
    // ------------------------------------------------------------
    const renderExistenceIcon = (exist) => {
        if (exist > 0) {
            return <CheckCircleIcon style={{ color: 'green' }} fontSize="small" />
        }
        return <CancelIcon style={{ color: 'red' }} fontSize="small" />
    }

    // ------------------------------------------------------------
    // Calcular total
    // ------------------------------------------------------------
    const total = tableRows.reduce((acc, item) => {
        const sub = (Number(item.cantidad) || 0) * (Number(item.precio) || 0)
        return acc + sub
    }, 0)

    // ------------------------------------------------------------
    // Al presionar "Generar Pedido" => abrir confirm
    // ------------------------------------------------------------
    const handleOpenConfirm = () => {
        if (!selectedVendor) {
            alert('Por favor seleccione un Vendedor (cod_agente) antes de generar el pedido.')
            return
        }
        setObsText('')
        setOpenConfirm(true)
    }
    const handleCloseConfirm = () => setOpenConfirm(false)

    // ------------------------------------------------------------
    // Generar Pedido (final) con confirmación
    // ------------------------------------------------------------
    const handleGenerateOrderFinal = async () => {
        try {
            // 1) Crear POST en st_casos_productos (para secuencia === -1)
            for (const row of tableRows) {
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

            // 2) Generar pedido con generateOrderWarranty
            //    Ojo: definimos las propiedades tal como las espera
            //    generateOrderWarranty => ( { tipoComprobante, codComprobante, codAgente, etc... } )
            const codAgenteInt = selectedVendor.COD_PERSONA

            const payload = {
                empresa: enterpriseShineray,
                tipoComprobante: 'CP', // forzamos CP
                codComprobante: codComprobante, // OJO: NO undefined
                codAgencia: selectedAgency?.COD_AGENCIA || '',
                codPolitica: 17,
                todos: 0,
                codAgente: codAgenteInt
            }
            const respPedido = await generateOrderWarranty(jwt, payload)
            console.log('Pedido generado ->', respPedido)

            // 3) Guardar observación
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

            alert('Pedido generado con éxito.')
        } catch (error) {
            console.log('Error generando pedido:', error)
            alert('No se pudo generar el pedido: ' + error.message)
        } finally {
            // Cerrar diálogos
            setOpenConfirm(false)
            handleClosePedido()
        }
    }

    // ------------------------------------------------------------
    // Render principal
    // ------------------------------------------------------------
    return (
        <div>
            <Dialog
                open={openPedido}
                onClose={handleClosePedido}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle>Generar Pedido</DialogTitle>
                <DialogContent dividers>
                    {/* ENCABEZADO */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Identificación"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={identificationNumber}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Tipo Identificación"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={identificationType}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Cliente"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={clientName}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Código Pedido"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                value={orderCode}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* COMBOS DE AGENCIA / VENDEDOR / POLITICA */}
                    <Grid container spacing={2} style={{ marginTop: 10 }}>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                options={agencies}
                                value={selectedAgency}
                                onChange={(e, newVal) => setSelectedAgency(newVal)}
                                getOptionLabel={(o) => o.AGENCIA || ''}
                                isOptionEqualToValue={(opt, val) => opt.COD_AGENCIA === (val?.COD_AGENCIA || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Agencia"
                                        variant="outlined"
                                        margin="dense"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
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

                        <Grid item xs={12} sm={4}>
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

                    {/* DETALLE DE PRODUCTOS (TABLA) */}
                    <Typography variant="h6" style={{ marginTop: 20, marginBottom: 10 }}>
                        Detalle de Productos
                    </Typography>

                    <Paper variant="outlined" style={{ padding: 10 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Sec</TableCell>
                                        <TableCell style={{ fontWeight: 'bold', width: '330px' }}>
                                            Producto
                                        </TableCell>
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
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    {row.secuencia > 0 ? row.secuencia : 'NEW'}
                                                </TableCell>

                                                <TableCell>
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        sx={{
                                                            '& .MuiAutocomplete-listbox': {
                                                                fontSize: '0.5rem'
                                                            }
                                                        }}
                                                        value={row.productoInfo}
                                                        filterOptions={filterOptions}
                                                        onChange={async (e, newVal) => handleChangeProduct(idx, newVal)}
                                                        options={productsList}
                                                        getOptionLabel={(opt) =>
                                                            opt.COD_PRODUCTO
                                                                ? `${opt.COD_PRODUCTO} - ${opt.NOMBRE}`
                                                                : ''
                                                        }
                                                        isOptionEqualToValue={(opt, val) =>
                                                            opt.COD_PRODUCTO === (val?.COD_PRODUCTO || '')
                                                        }
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                placeholder="Producto"
                                                            />
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell style={{ textAlign: 'center' }}>
                                                    {renderExistenceIcon(row.existencia)}
                                                </TableCell>

                                                <TableCell style={{ width: '150px' }}>
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        sx={{
                                                            '& .MuiAutocomplete-listbox': {
                                                                fontSize: '0.7rem'
                                                            }
                                                        }}
                                                        value={row.lote}
                                                        onChange={async (e, newVal) => handleChangeLote(idx, newVal)}
                                                        options={row.lotesDisponibles}
                                                        getOptionLabel={(opt) =>
                                                            opt.cod_comprobante_lote
                                                                ? `${opt.tipo}-${opt.cod_comprobante_lote}`
                                                                : ''
                                                        }
                                                        isOptionEqualToValue={(opt, val) =>
                                                            opt.cod_comprobante_lote ===
                                                            (val?.cod_comprobante_lote || '')
                                                        }
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                placeholder="Lote"
                                                            />
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell style={{ textAlign: 'center' }}>
                                                    {row.existenciaLote}
                                                </TableCell>

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
                                                    {row.secuencia === -1 && (
                                                        <IconButton size="small" onClick={() => handleDeleteRow(idx)}>
                                                            <CancelIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Button
                            variant="outlined"
                            onClick={handleAddRow}
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
                    <Button
                        onClick={handleOpenConfirm}
                        variant="contained"
                        color="primary"
                        disabled={hasExistingOrder}
                    >
                        Generar Pedido
                    </Button>
                    <Button onClick={handleClosePedido} variant="outlined">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --------- DIALOGO DE CONFIRMACIÓN ---------- */}
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
                    <Button onClick={handleCloseConfirm}>Cancelar</Button>
                    <Button onClick={handleGenerateOrderFinal} variant="contained" color="primary">
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
