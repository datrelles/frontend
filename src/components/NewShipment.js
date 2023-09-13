import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import Grid from '@mui/material/Grid';
import moment from 'moment';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Tabs, Tab } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import SendIcon from '@material-ui/icons/Send';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns'

const API = process.env.REACT_APP_API;
const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '310px'
    },
});


function NewShipment(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [excelData, setExcelData] = useState(['']);
    const [menus, setMenus] = useState([])

    const [agente, setAgente] = useState("")
    const [buque, setBuque] = useState("")
    const [codAforo, setCodAforo] = useState("")
    const [codItem, setCodItem] = useState("")
    const [codModelo, setCodModelo] = useState("")
    const [codProveedor, setCodProveedor] = useState("")
    const [codPuertoDesembarque, setCodPuertoDesembarque] = useState("")
    const [codPuertoEmbarque, setCodPuertoEmbarque] = useState("")
    const [codigoBlHouse, setCodigoBlHouse] = useState("")
    const [codigoBlMaster, setCodigoBlMaster] = useState("")
    const [costoContenedor, setCostoContenedor] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [fechaBodega, setFechaBodega] = useState("")
    const [fechaEmbarque, setFechaEmbarque] = useState("")
    const [fechaLlegada, setFechaLlegada] = useState("")
    const [modificadoPor, setModificadoPor] = useState("")
    const [naviera, setNaviera] = useState("")
    const [numeroTracking, setNumeroTracking] = useState("")
    const [tipoFlete, setTipoFlete] = useState("")
    const [codRegimen, setCodRegimen] = useState("") //Falta enviar desde el get de embarque este campo
    const [nroMrn, setNroMrn] = useState("") //Falta enviar desde el get de embarque este campo

    const [estado, setEstado] = useState("");
    const [authorizedSystems, setAuthorizedSystems] = useState([]);
    const [nombreProveedor, setNombreProveedor] = useState("");
    const [nombreAforo, setNombreAforo] = useState("");
    const [aforoList, setAforoList] = useState([])
    const [puertoNombre, setPuertoNombre] = useState("");
    const [puertoDesNombre, setPuertoDesNombre] = useState("");
    const [puertoList, setPuertoList] = useState([])
    const [navieraList, setNavieraList] = useState([])
    const [navieraNombre, setNavieraNombre] = useState("")
    const [statusList, setStatusList] = useState([])
    const [fleteList, setFleteList] = useState([{ cod: "C", nombre: "AL COBRO" }, { cod: "P", nombre: "PREPAGADO" }])
    const [fleteNombre, setFleteNombre] = useState("")
    const [packingList, setPackingList] = useState([])
    const [providerList, setProviderList] = useState([])
    const [regimenList, setRegimenList] = useState([])
    const [regimenNombre, setRegimenNombre] = useState("")

    const { enqueueSnackbar } = useSnackbar();


    const checkAuthorization = async () => {
        const res = await fetch(`${API}/modules/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        });
        const data = await res.json();
        setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
    };


    const getShipment = async () => {
        if (codigoBlHouse) {
            try {
                const res = await fetch(`${API}/embarque_param?empresa=${sessionStorage.getItem('currentEnterprise')}&codigo_bl_house=${codigoBlHouse}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                        }
                    });

                if (!res.ok) {
                    if (res.status === 401) {
                        toast.error('Sesión caducada.');
                    }
                } else {
                    const data = await res.json();
                    setAgente(data[0].agente)

                }
            } catch (error) {
            }
        }
    }



    const getPackingList = async () => {
        if (codigoBlHouse) {
            try {
                const res = await fetch(`${API}/packinglist_param?empresa=${sessionStorage.getItem('currentEnterprise')}&codigo_bl_house=${codigoBlHouse}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                })
                if (!res.ok) {
                    if (res.status === 401) {
                        toast.error('Sesión caducada.');
                    }
                } else {
                    const data = await res.json();
                    setPackingList(data)
                }
            } catch (error) {
                toast.error('Sesión caducada. Por favor, inicia sesión nuevamente.');
            }
        }
    }

    const getStatusList = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_modelo=BL`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        const list = data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_item,
        }));
        if (codItem) {
            setEstado(list.find((objeto) => objeto.cod === codItem).nombre)
        }
        setStatusList(list)
    }

    const getProviderList = async () => {
        const res = await fetch(`${API}/proveedores_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_proveedor=${codProveedor}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        setProviderList(data)
    }

    const getAforoList = async () => {
        const res = await fetch(`${API}/tipo_aforo_param?empresa=${sessionStorage.getItem('currentEnterprise')}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        const list = data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_aforo,
        }))
        setAforoList(list)

    }

    const getPuertoList = async () => {
        const res = await fetch(`${API}/puertos_embarque`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        if (codPuertoEmbarque) {
            setPuertoNombre(data.find((objeto) => objeto.cod_puerto === codPuertoEmbarque).descripcion)
        }
        if (codPuertoDesembarque) {
            setPuertoDesNombre(data.find((objeto) => objeto.cod_puerto === codPuertoDesembarque).descripcion)
        }

        setPuertoList(data)

    }

    const getNavieralist = async () => {
        const res = await fetch(`${API}/naviera`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        if (naviera) {
            setNavieraNombre(data.find((objeto) => objeto.codigo === naviera).nombre)
        }
        setNavieraList(data)

    }

    const getRegimenList = async () => {
        const res = await fetch(`${API}/regimen_aduana`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        if (codRegimen) {
            setRegimenNombre(data.find((objeto) => objeto.cod_regimen === codRegimen).descripcion)
        }
        setRegimenList(data)

    }

    const getAforoNombre = async () => {

        const res = await fetch(`${API}/tipo_aforo_param?empresa=${sessionStorage.getItem('currentEnterprise')}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        const list = data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_aforo,
        }));
    }


    const handleDeleteRows = async (rowsDeleted) => {
        const userResponse = window.confirm('¿Está seguro de eliminar estos registros?')
        if (userResponse) {
            await rowsDeleted.data.forEach((deletedRow) => {
                const deletedRowIndex = deletedRow.dataIndex;
                const deletedRowValue = packingList[deletedRowIndex];
                console.log(deletedRowValue.secuencia);

                fetch(`${API}/orden_compra_packinglist?codigo_bl_house=${codigoBlHouse}&empresa=${sessionStorage.getItem('currentEnterprise')}&secuencia=${deletedRowValue.secuencia}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la llamada a la API');
                        }
                        console.log('Elemento eliminado exitosamente');
                        enqueueSnackbar('¡Elementos eliminados exitosamente!', { variant: 'success' });
                    })
                    .catch(error => {
                        console.error(error);
                        enqueueSnackbar(error, { variant: 'error' });
                    });
            });
        }
    };

    const handleProviderChange = (event, value) => {
        if (value) {
            const proveedorSeleccionado = providerList.find((proveedor) => proveedor.nombre === value);
            if (proveedorSeleccionado) {
                setCodProveedor(proveedorSeleccionado.cod_proveedor);
                setNombreProveedor(proveedorSeleccionado.nombre);
            }
        } else {
            setCodProveedor('');
            setNombreProveedor('');
        }
    };

    const handleAforoChange = (event, value) => {
        if (value) {
            const aforoSeleccionado = aforoList.find((aforo) => aforo.nombre === value);
            if (aforoSeleccionado) {
                setCodAforo(aforoSeleccionado.cod);
                setNombreAforo(aforoSeleccionado.nombre)
            }
        } else {
            setCodAforo('');
            setNombreAforo('')
        }
    };
    const handlePuertoChange = (event, value) => {
        if (value) {
            const puertoSeleccionado = puertoList.find((puerto) => puerto.descripcion === value);
            if (puertoSeleccionado) {
                setCodPuertoEmbarque(puertoSeleccionado.cod_puerto);
                setPuertoNombre(puertoSeleccionado.descripcion)
            }
        } else {
            setCodPuertoEmbarque('');
            setPuertoNombre('')
        }
    };

    const handlePuertoDesChange = (event, value) => {
        if (value) {
            const puertoSeleccionado = puertoList.find((puerto) => puerto.descripcion === value);
            if (puertoSeleccionado) {
                setCodPuertoDesembarque(puertoSeleccionado.cod_puerto);
                setPuertoDesNombre(puertoSeleccionado.descripcion)
            }
        } else {
            setCodPuertoDesembarque('');
            setPuertoDesNombre('')
        }
    };

    const handleNavieraChange = (event, value) => {
        if (value) {
            const navieraSeleccionado = navieraList.find((naviera) => naviera.nombre === value);
            if (navieraSeleccionado) {
                setNaviera(navieraSeleccionado.codigo);
                setNavieraNombre(navieraSeleccionado.nombre)
            }
        } else {
            setNaviera('');
            setNavieraNombre('')
        }
    };

    const handleRegimenChange = (event, value) => {
        if (value) {
            const regimenSeleccionado = regimenList.find((regimen) => regimen.descripcion === value);
            if (regimenSeleccionado) {
                setCodRegimen(regimenSeleccionado.cod_regimen);
                setRegimenNombre(regimenSeleccionado.descripcion)
            }
        } else {
            setCodRegimen('');
            setRegimenNombre('')
        }
    };


    const handleStatusChange = (event, value) => {
        if (value) {
            const statusSeleccionado = statusList.find((status) => status.nombre === value);
            if (statusSeleccionado) {
                setCodItem(statusSeleccionado.cod);
                setEstado(statusSeleccionado.nombre)
            }
        } else {
            setCodItem('');
            setEstado('')
        }
    };

    const handleFleteChange = (event, value) => {
        if (value) {
            const fleteSeleccionado = fleteList.find((status) => status.nombre === value);
            if (fleteSeleccionado) {
                setTipoFlete(fleteSeleccionado.cod);
                setFleteNombre(fleteSeleccionado.nombre)
            }
        } else {
            setTipoFlete('');
            setFleteNombre('')
        }
    };


    useEffect(() => {
        getAforoNombre();
        getShipment();
        getAforoList();
        getPackingList();
        getStatusList();
        checkAuthorization();
        getProviderList();
        getMenus();
        getPuertoList();
        getNavieralist();
        getRegimenList();
    }, [])

    const columns = [
        {
            name: "secuencia",
            label: "Secuencia"
        },
        {
            name: "cod_producto",
            label: "Codigo Producto"
        },
        {
            name: "cantidad",
            label: "Cantidad"
        },
        {
            name: "fob",
            label: "Fob"
        },
        {
            name: "cod_po",
            label: "Orden Compra"
        },
        {
            name: "cod_liquidacion",
            label: "Codigo Liquidacion"
        },

    ]

    const options = {
        filterType: 'dropdown',
        onRowsDelete: handleDeleteRows,
        textLabels: {
            body: {
                noMatch: "Lo siento, no se encontraron registros",
                toolTip: "Ordenar",
                columnHeaderTooltip: column => `Ordenar por ${column.label}`
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por página:",
                displayRows: "de"
            },
            toolbar: {
                search: "Buscar",
                downloadCsv: "Descargar CSV",
                print: "Imprimir",
                viewColumns: "Ver columnas",
                filterTable: "Filtrar tabla"
            },
            filter: {
                all: "Todos",
                title: "FILTROS",
                reset: "REINICIAR"
            },
            viewColumns: {
                title: "Mostrar columnas",
                titleAria: "Mostrar/Ocultar columnas de tabla"
            },
            selectedRows: {
                text: "fila(s) seleccionada(s)",
                delete: "Borrar",
                deleteAria: "Borrar fila seleccionada"
            }
        }
    }


    const handleChange2 = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API}/embarque`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            },
            body: JSON.stringify({
                fecha_embarque: fechaEmbarque,
                fecha_llegada: fechaLlegada,
                fecha_bodega: fechaBodega,
                empresa: sessionStorage.getItem('currentEnterprise'),
                codigo_bl_master: codigoBlMaster,
                codigo_bl_house: codigoBlHouse,
                cod_proveedor: codProveedor,
                numero_tracking: numeroTracking,
                estado: 0,
                agente,
                naviera,
                buque,
                cod_puerto_embarque: codPuertoEmbarque,
                cod_puerto_desembarque: codPuertoDesembarque,
                costo_contenedor: parseFloat(costoContenedor),
                descripcion,
                tipo_flete: tipoFlete,
                adicionado_por: sessionStorage.getItem('currentUser'),
                cod_modelo: codModelo,
                cod_item: codItem,
                cod_aforo: codAforo,
                cod_regimen: codRegimen,
                nro_mrn: nroMrn
            })
        })
        const data = await res.json();
        console.log(data)
        if (!data.error) {
            enqueueSnackbar('¡Guardado exitosamente!', { variant: 'success' });
        } else {
            enqueueSnackbar(data.error, { variant: 'error' });
        }
    }

    const handleChange3 = async (e) => {
        e.preventDefault();
        navigate('/newPostSaleDetail', { state: codigoBlHouse, orden: location.state });
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const properties = jsonData[0];

            const newExcelData = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];

                const obj = {};
                for (let j = 0; j < properties.length; j++) {
                    const property = properties[j];
                    obj[property] = row[j];
                }

                newExcelData.push(obj);
            }
            setExcelData(newExcelData)
            setPackingList((prevDetails) => [...prevDetails, ...newExcelData])
            console.log(newExcelData)
        };
        reader.readAsArrayBuffer(file);

    };

    const TabPanel = ({ value, index, children }) => (
        <div hidden={value !== index}>
            {value === index && children}
        </div>
    );

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sessionStorage.getItem('currentSystem')}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setMenus(data)
            }
        } catch (error) {
        }
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
                    <Button style={{ width: `100px`, marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate('/dashboard') }}>Módulos</Button>
                    <Button style={{ marginTop: '10px', marginRight: '10px', color: '#1976d2' }} onClick={() => { navigate(-1) }}>Embarques</Button>
                </ButtonGroup>
            </Box>
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '30ch' },
                    width: '100%'
                }}
                noValidate
                autoComplete="off"
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '20px' }}>
                        <h5 style={{ marginTop: '20px', marginRight: '700px' }}>Editar Embarque</h5>
                        <button
                            className="btn btn-primary btn-block"
                            type="button"
                            style={{ marginTop: '20px', backgroundColor: 'firebrick', borderRadius: '5px', marginRight: '15px' }}
                            onClick={handleChange2}>
                            <SaveIcon /> Guardar
                        </button>
                    </div>
                    <Grid container spacing={3}>
                        <Grid item xs={3}>
                            <TextField
                                id="id"
                                label="BL House"
                                type="text"
                                onChange={(e) => setCodigoBlHouse(e.target.value)}
                                value={codigoBlHouse}
                                className="form-control"
                                style={{ width: `130px` }}
                            />
                            <TextField
                                required
                                id="codigo-bl-master"
                                label="BL Master"
                                type="text"
                                onChange={(e) => setCodigoBlMaster(e.target.value)}
                                value={codigoBlMaster}
                                className="form-control"
                                style={{ width: `140px` }}
                            />
                            <Autocomplete
                                id="estado"
                                options={statusList.map((status) => status.nombre)}
                                value={estado}
                                onChange={handleStatusChange}
                                style={{ width: `200px` }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Estado"
                                        type="text"
                                        className="form-control"
                                        style={{ width: `100%` }}
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <TextField
                                disabled
                                id="codProveedor"
                                label="Codigo Proveedor"
                                type="text"
                                onChange={(e) => setCodProveedor(e.target.value)}
                                value={codProveedor}
                                className="form-control"
                            />
                            <Autocomplete
                                id="nombre-proveedor"
                                options={providerList.map((proveedor) => proveedor.nombre)}
                                onChange={handleProviderChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        multiline
                                        rows={2}
                                        label="Proveedor"
                                        type="text"
                                        value={nombreProveedor}
                                        className="form-control"
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Segunda Columna */}
                        <Grid item xs={3}>
                            <TextField
                                required
                                id="agente"
                                label="Agente"
                                type="text"
                                onChange={(e) => setAgente(e.target.value)}
                                value={agente}
                                className="form-control"
                            />
                            <Autocomplete
                                id="naviera"
                                options={navieraList.map((naviera) => naviera.nombre)}
                                value={navieraNombre}
                                onChange={handleNavieraChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        multiline
                                        rows={2}
                                        label="Naviera"
                                        type="text"
                                        className="form-control"
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <Autocomplete
                                id="puerto-embarque"
                                options={puertoList.map((puerto) => puerto.descripcion)}
                                value={puertoNombre}
                                onChange={handlePuertoChange}
                                style={{ width: `200px` }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Puerto Embarque"
                                        type="text"
                                        className="form-control"
                                        style={{ width: `100%` }}
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <Autocomplete
                                id="puerto-desembarque"
                                options={puertoList.map((puerto) => puerto.descripcion)}
                                value={puertoDesNombre}
                                onChange={handlePuertoDesChange}
                                style={{ width: `200px` }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Puerto Desembarque"
                                        type="text"
                                        className="form-control"
                                        style={{ width: `100%` }}
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Tercera Columna */}
                        <Grid item xs={3}>
                            <Autocomplete
                                id="regimen"
                                options={regimenList.map((regimen) => regimen.descripcion)}
                                value={regimenNombre}
                                onChange={handleRegimenChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        multiline
                                        rows={2}
                                        label="Regimen"
                                        type="text"
                                        className="form-control"
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <TextField
                                required
                                id="nro-mrn"
                                label="Nro Mrn"
                                type="text"
                                onChange={(e) => setNroMrn(e.target.value)}
                                value={nroMrn}
                                className="form-control"
                            />
                            <Autocomplete
                                id="flete"
                                options={fleteList.map((flete) => flete.nombre)}
                                value={fleteNombre}
                                onChange={handleFleteChange}
                                style={{ width: `200px` }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Tipo Flete"
                                        type="text"
                                        className="form-control"
                                        style={{ width: `100%` }}
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                            <TextField
                                required
                                id="numero-tracking"
                                label="Numero Tracking"
                                type="text"
                                onChange={(e) => setNumeroTracking(e.target.value)}
                                value={numeroTracking}
                                className="form-control"
                            />
                            <TextField
                                required
                                multiline
                                rows={4}
                                id="descripcion"
                                label="Descripcion"
                                type="text"
                                onChange={(e) => setDescripcion(e.target.value)}
                                value={descripcion}
                                className="form-control"
                            />
                        </Grid>

                        {/* Cuarta Columna */}
                        <Grid item xs={3}>

                            <div className={classes.datePickersContainer}>
                                <div>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker', 'DatePicker']}>
                                            <DatePicker
                                                label="Fecha Embarque"
                                                value={dayjs(fechaEmbarque, "DD/MM/YYYY")}
                                                onChange={(newValue) =>
                                                    setFechaEmbarque(format(new Date(newValue), "dd/MM/yyyy"))
                                                }
                                                format={"DD/MM/YYYY"}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>
                                <div>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker', 'DatePicker']}>
                                            <DatePicker
                                                label="Fecha Llegada"
                                                value={dayjs(fechaLlegada, "DD/MM/YYYY")}
                                                onChange={(newValue) =>
                                                    setFechaLlegada(format(new Date(newValue), "dd/MM/yyyy"))
                                                }
                                                format={"DD/MM/YYYY"}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>
                                <div>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker', 'DatePicker']}>
                                            <DatePicker
                                                label="Fecha Bodega"
                                                value={dayjs(fechaBodega, "DD/MM/YYYY")}
                                                onChange={(newValue) =>
                                                    setFechaBodega(format(new Date(newValue), "dd/MM/yyyy"))
                                                }
                                                format={"DD/MM/YYYY"}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <TextField
                                required
                                id="buque"
                                label="Buque"
                                type="text"
                                onChange={(e) => setBuque(e.target.value)}
                                value={buque}
                                className="form-control"
                                style={{ width: `140px` }}
                            />
                            <TextField
                                required
                                id="Costo"
                                label="Costo Contenedor"
                                type="text"
                                onChange={(e) => setCostoContenedor(e.target.value)}
                                value={costoContenedor}
                                className="form-control"
                                style={{ width: `140px` }}
                            />
                            <Autocomplete
                                id="aforo"
                                options={aforoList.map((aforo) => aforo.nombre)}
                                value={nombreAforo}
                                onChange={handleAforoChange}
                                style={{ width: `200px` }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Aforo"
                                        type="text"
                                        className="form-control"
                                        style={{ width: `100%` }}
                                        InputProps={{
                                            ...params.InputProps,
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>;


                </div>


            </Box >
        </div >
    );
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <NewShipment />
        </SnackbarProvider>
    );
}