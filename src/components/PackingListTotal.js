import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';
import AddIcon from '@material-ui/icons/Add';

import { SnackbarProvider, useSnackbar } from 'notistack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';



const API = process.env.REACT_APP_API;

const useStyles = makeStyles({
    datePickersContainer: {
        display: 'flex',
        gap: '15px',
    },
});

function PackingListTotal(props) {
    const [packingList, setPackingList] = useState([])
    const [fromDate, setFromDate] = useState(moment().subtract(3, "months"));
    const [toDate, setToDate] = useState(moment);
    const [statusList, setStatusList] = useState([])
    const [menus, setMenus] = useState([])
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();


    const getPackingList = async () => {
        try {
            const res = await fetch(`${API}/packinglist_total?empresa=${sessionStorage.getItem('currentEnterprise')}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + props.token
                    }
                });

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

    const getMenus = async () => {
        try {
            const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sessionStorage.getItem('currentSystem')}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + props.token
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
        }
    }

    useEffect(() => {
        getPackingList();
        getStatusList();
        getMenus();
        setToDate(null);
        setFromDate(null);
    }, [])

    const handleChange2 = async (e) => {
        e.preventDefault();
        navigate('/newShipment');
    }

    const handleRowClick = async (rowData) => {
        const res = await fetch(`${API}/embarque_param?empresa=${sessionStorage.getItem('currentEnterprise')}&codigo_bl_house=${rowData}`,
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
            navigate('/editShipment', { state: data[0] });
            console.log(data)
        }

    }

    const handleRowClick2 = async (rowData) => {
        const res = await fetch(`${API}/orden_compra_cab_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_po=${rowData}`,
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
            navigate('/editPostSales', { state: data[0] });
            console.log(data)
        }

    }

    const handleChangeDate = async (e) => {
        e.preventDefault();
        getPackingList()
    }

    function getBackgroundColor(progress) {
        if (progress <= 20) {
            return "#FF3F33";
        } else if (progress <= 40) {
            return "#FF9333";
        } else if (progress <= 60) {
            return "#F0FF33";
        } else if (progress <= 80) {
            return "#ACFF33";
        } else if (progress <= 100) {
            return "#33FF39";
        } else
            return "silver"
    }

    const getStatusList = async () => {
        const res = await fetch(`${API}/estados_param?empresa=${sessionStorage.getItem('currentEnterprise')}&cod_modelo=BL`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }
        })
        const data = await res.json();
        setStatusList(data.map((item) => ({
            nombre: item.nombre,
            cod: item.cod_item,
        })));
    }

    const columns = [
        {
            name: "secuencia",
            label: "Secuencia",
            options: {
                display: false, // Oculta la columna
            },
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
                        onClick={() => handleRowClick(value)}
                    >
                        {value}
                    </span>
                )
            },
            label: "Embarque"
        },
        {
            name: "proforma",
            label: "Proforma"
        },
        {
            name: "producto",
            label: "Producto"
        },
        {
            name: "cantidad",
            label: "Cant."
        },
        {
            name: "fob",
            label: "Fob"
        },
        {
            name: "estado",
            label: "Estado",
            options: {
                customBodyRender: (value) => {
                    const progress = parseInt(value * 100 / (statusList.length - 1), 10);
                    let name = '';
                    if (statusList.find((objeto) => objeto.cod === value)) {
                        name = statusList.find((objeto) => objeto.cod === value).nombre
                    }
                    const backgroundColor = getBackgroundColor(progress);
                    return (
                        <div>
                            <LinearProgress
                                sx={{
                                    backgroundColor: 'silver',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: backgroundColor
                                    }
                                }}

                                variant="determinate" value={progress} />
                            <span>{name}</span>
                        </div>
                    );
                }
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
            name: "cod_liquidacion",
            label: "Codigo Liquidacion"
        },
    ]

    const options = {
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
                            paddingLeft: '3px', // Relleno a la izquierda
                            paddingRight: '3px',
                            paddingTop: '0px', // Ajusta el valor en el encabezado si es necesario
                            paddingBottom: '0px',
                            backgroundColor: '#00000',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            borderBottom: '1px solid #ddd',
                            borderRight: '1px solid #ddd',
                            fontSize: '12px'
                        },
                        head: {
                            backgroundColor: 'firebrick', // Color de fondo para las celdas de encabezado
                            color: '#ffffff', // Color de texto para las celdas de encabezado
                            fontWeight: 'bold', // Añadimos negrita para resaltar el encabezado
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            fontSize: '12px'
                        },
                    }
                },
                MuiTable: {
                    styleOverrides: {
                        root: {
                            borderCollapse: 'collapse', // Fusionamos los bordes de las celdas
                        },
                    },
                },
                MuiTableHead: {
                    styleOverrides: {
                        root: {
                            borderBottom: '5px solid #ddd', // Línea inferior más gruesa para el encabezado
                        },
                    },
                },
                MuiToolbar: {
                    styleOverrides: {
                        regular: {
                            minHeight: '10px',
                        }
                    }
                }
            }
        });


    return (
        <SnackbarProvider>
            <div style={{ marginTop: '150px'}}>
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
                {/* <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
                    <div className={classes.datePickersContainer}>
                        <div>
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
                        </div>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DemoContainer components={['DatePicker']} >
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
                        <div>
                            <button
                                className="btn btn-primary btn-block"
                                type="button"
                                style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', borderRadius: '5px' }}
                                onClick={handleChangeDate} >
                                <SearchIcon /> Buscar
                            </button>
                        </div>
                    </div>
                </div> */}
                <ThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Packinglist general"}
                        data={packingList}
                        columns={columns}
                        options={options}
                    />
                </ThemeProvider>
            </div>
        </SnackbarProvider>
    )
}

export default PackingListTotal