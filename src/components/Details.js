import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import { SnackbarProvider, useSnackbar } from 'notistack';
import moment from "moment";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Functions from "../helpers/Functions"; 
import { useAuthContext } from "../context/authContext";

const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
});

function Details() {
    const {jwt, userShineray, enterpriseShineray, systemShineray}=useAuthContext();
    const [details, setDetails] = useState([])
    const [container, setContainer] = useState('')
    const [excelData, setExcelData] = useState(['']);
    const [authorizedSystems, setAuthorizedSystems] = useState([]);
    const [containerList, setContainerList] = useState([])
    const [statusList, setStatusList] = useState([])
    const [statusListPo, setStatusListPo] = useState([])
    const [menus, setMenus] = useState([])
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();

    const checkAuthorization = async () => {
        try {
            const res = await fetch(`${API}/modules/${userShineray}/${enterpriseShineray}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            });
            const data = await res.json();
            setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
        } catch (error) {
            console.error('Error en la solicitud:', error);
            enqueueSnackbar('Falla de Conexion. Vuelva a iniciar sesion.', { variant: 'error' });
        }
    };



    const getDetails = async () => {
        try {
            const res = await fetch(`${API}/detalles_general`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setDetails(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${userShineray}/${enterpriseShineray}/${systemShineray}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                setMenus(data)
                console.log(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    useEffect(() => {
        document.title = 'Detalles Orden Compra';
        getDetails();
        getStatusList();
        getStatusListPo();
        checkAuthorization();
        getMenus();
    }, [])

    const handleRowClick = async (rowData) => {
        try {
            const res = await fetch(`${API}/container_by_nro?nro_contenedor=${rowData}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                navigate('/editContainer', { state: data[0] });
                console.log(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }

    }

    const handleRowClick2 = async (rowData) => {
        try {
            const res = await fetch(`${API}/orden_compra_cab_param?empresa=${enterpriseShineray}&cod_po=${rowData}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                navigate('/editPostSales', { state: data[0] });
                console.log(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }

    }
    const handleRowClick3 = async (rowData) => {
        try {
            const res = await fetch(`${API}/embarque_param?empresa=${enterpriseShineray}&codigo_bl_house=${rowData}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Sesión caducada.');
                }
            } else {
                const data = await res.json();
                navigate('/editShipment', { state: data[0] });
                console.log(data)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }

    }

    const getStatusList = async () => {
        try {
            const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=BL`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            })
            const data = await res.json();
            setStatusList(data.map((item) => ({
                nombre: item.nombre,
                cod: item.cod_item,
            })));
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    const getStatusListPo = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${enterpriseShineray}&cod_modelo=IMPR`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        })
        const data = await res.json();
        setStatusListPo(data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_item,
        })));
    }

    const columns = [
        {
            name: "cod_producto",
            label: "Codigo"
        },
        {
            name: "nombre",
            label: "Producto"
        },
        {
            name: "cantidad_pedido",
            label: "Cant. Orden",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "right" }}>
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: "costo_sistema",
            label: "Costo Sistema",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "costo_cotizado",
            label: "Precio Cotizado",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "cod_po",
            options: {
                customBodyRender: (value, tableMeta) => (
                    <span
                        style={{ cursor: 'pointer' }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'blue';
                            e.target.style.textDecoration = 'underline'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'black';
                            e.target.style.textDecoration = 'none'
                        }}
                        onClick={() => handleRowClick2(value)}
                    >
                        {value}
                    </span>
                ),
            },
            label: "Orden Compra"
        },
        {
            name: "proforma",
            label: "Proforma"
        },
        {
            name: "estado_orden",
            label: "Estado Orden",
            options: {
                customBodyRender:  (value) => Functions.StatusRender(value, statusListPo),
            },
        },
        {
            name: "modelo",
            label: "Modelo"
        },
        {
            name: "proveedor",
            label: "Proveedor"
        },
        {
            name: "fecha_estimada_produccion",
            label: "Fecha Estimada Produccion"
        },
        {
            name: "fecha_estimada_puerto",
            label: "Fecha Estimada Puerto"
        },
        {
            name: "fecha_estimada_llegada",
            label: "Fecha Estimada Llegada"
        },
        {
            name: "nro_contenedor",
            options: {
                customBodyRender: (value, tableMeta) => (
                    <span
                        style={{ cursor: 'pointer' }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'blue';
                            e.target.style.textDecoration = 'underline'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'black';
                            e.target.style.textDecoration = 'none'
                        }}
                        onClick={() => handleRowClick(value)}
                    >
                        {value}
                    </span>
                )
            },
            label: "Contenedor"
        },
        {
            name: "codigo_bl_house",
            options: {
                customBodyRender: (value, tableMeta) => (
                    <span
                        style={{ cursor: 'pointer' }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'blue';
                            e.target.style.textDecoration = 'underline'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'black';
                            e.target.style.textDecoration = 'none'
                        }}
                        onClick={() => handleRowClick3(value)}
                    >
                        {value}
                    </span>
                )
            },
            label: "Embarque"
        },
        {
            name: "estado_embarque",
            label: "Estado Embarque",
            options: {
                customBodyRender: (value) => Functions.StatusRender(value, statusList),
            },
        },
        {
            name: "cantidad",
            label: "Cant. Pack.",
            options: {
                customBodyRender: (value) => {
                    return (
                        <div style={{ textAlign: "right" }}>
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: "saldo_producto",
            label: "Saldo Producto",
            options: {
                customBodyRender: (value) => {
                  if (value === null || value === "") {
                    return <div style={{ textAlign: "right" }}>
                    {"0"}
                  </div>
                  } else {
                    return <div style={{ textAlign: "right" }}>
                      {value}
                    </div>
                  }
                },
              },
        },
        {
            name: "fob",
            label: "Fob",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "fob_total",
            label: "Fob Total",
            options: {
                customBodyRender: Functions.NumericRender
            },
        },
        {
            name: "fecha_embarque",
            label: "Fecha Embarque"
        },
        {
            name: "fecha_llegada",
            label: "Fecha Llegada"
        },
        {
            name: "fecha_bodega",
            label: "Fecha Bodega"
        },
    ]

    const options = {
        responsive: 'standard',
        selectableRows: "none",
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

    const getMuiTheme = () =>
        createTheme({
            components: {
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            paddingLeft: '3px',
                            paddingRight: '3px',
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            backgroundColor: '#00000',
                            whiteSpace: 'normal', // Cambiamos 'nowrap' a 'normal'
                            overflowWrap: 'break-word', // Agregamos esta propiedad para dividir el texto
                            flex: 1,
                            borderBottom: '1px solid #ddd',
                            borderRight: '1px solid #ddd',
                            fontSize: '12px',
                            minWidth: '150px', // Aumenta el valor del ancho mínimo
                        },
                        head: {
                            backgroundColor: 'firebrick',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            fontSize: '12px',
                        },
                    },
                },
                MuiTable: {
                    styleOverrides: {
                        root: {
                            borderCollapse: 'collapse',
                        },
                    },
                },
                MuiTableHead: {
                    styleOverrides: {
                        root: {
                            borderBottom: '5px solid #ddd',
                        },
                    },
                },
                MuiToolbar: {
                    styleOverrides: {
                        regular: {
                            minHeight: '10px',
                        },
                    },
                },
            },
        });

    return (
        <div style={{ marginTop: '150px' }}>
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
            <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Listado Total de Repuestos"}
                    data={details}
                    columns={columns}
                    options={options}
                />
            </ThemeProvider>
        </div>
    )
}

export default function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <Details />
        </SnackbarProvider>
    );
}