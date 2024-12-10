import Navbar0 from '../../Navbar0';
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/authContext';
import { getMenus, postImageMaterialDespiece, getProductDetailsWithoutImages } from '../../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import './images.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MUIDataTable from "mui-datatables";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as XLSX from 'xlsx'; // Importamos la librería xlsx
import LoadingCircle from '../../contabilidad/loader';

export const UpdateImage = () => {
    const [menus, setMenus] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadResults, setUploadResults] = useState([]);
    const [imageList, setImageList] = useState([]);
    const navigate = useNavigate();
    const { jwt, userShineray, enterpriseShineray } = useAuthContext();

    const getMuiTheme = () =>
        createTheme({
            components: {
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            paddingLeft: '1px', // Relleno a la izquierda
                            paddingRight: '1px',
                            paddingTop: '0px', // Ajusta el valor en el encabezado si es necesario
                            paddingBottom: '0px',
                            backgroundColor: '#00000',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            borderBottom: '1px solid #ddd',
                            borderRight: '1px solid #ddd',
                            fontSize: '12px',
                        },
                        head: {
                            backgroundColor: 'firebrick', // Color de fondo para las celdas de encabezado
                            color: '#ffffff', // Color de texto para las celdas de encabezado
                            fontWeight: 'bold', // Añadimos negrita para resaltar el encabezado
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            fontSize: '8px'
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

    // Dialog
    const handleClose = () => {
        setOpen(false);
    };
    const handleClickOpenNew = () => {
        setOpen(true);
    };

    // Menu
    useEffect(() => {
        const menu = async () => {
            try {
                const data = await getMenus(userShineray, enterpriseShineray, 'REP', jwt);
                setMenus(data);
            } catch (error) {
                console.log(error);
                toast.error(error);
            }
        };
        menu();
    }, [userShineray, enterpriseShineray, jwt]);

    const columns = [
        {
            name: "name_image",
            label: "Codigo Producto"
        },
        {
            name: "status",
            label: "Estado"
        }
    ];

    const options = {
        filterType: 'dropdown',
        rowsPerPage: 100, // Most
        selectableRows: 'none',
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
        },
    };

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const extractCodMaterial = (filename) => {
        const match = filename.match(/^[^\s]+/);
        return match ? match[0] : null;
    };

    const handleSubmit = async () => {
        setOpen(false);
        const results = [];
        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const codMaterial = extractCodMaterial(file.name);
                if (!codMaterial) {
                    toast.error(`Invalid filename format: ${file.name}`);
                    results.push({ name: file.name, status: 'Error imagen no cargada' });
                    continue;
                }

                const formData = new FormData();
                formData.append('imagen', file);
                formData.append('cod_material', codMaterial); // Extracted from the filename
                formData.append('user_shineray', userShineray);

                try {
                    await postImageMaterialDespiece(jwt, formData);
                    results.push({ name: file.name, status: 'ok' });
                    setImageList(prevList => [...prevList, { name_image: codMaterial, status: 'ok' }]);
                } catch (error) {
                    console.log(error);
                    results.push({ name: file.name, status: 'fail' });
                    setImageList(prevList => [...prevList, { name_image: codMaterial, status: 'fail' }]);
                }
            }
            setUploadResults(results);
            toast.success("Carga de imagenes completa");
            handleClose();
        } catch (error) {
            console.log(error);
            toast.error("Error en la carga de imagenes");
        }
    };

    const exportToExcel = async () => {
        try {
            // Llama a la función para obtener los datos
            const data = await getProductDetailsWithoutImages(jwt);

            if (!data || data.length === 0) {
                toast.info("No hay datos disponibles para exportar.");
                return;
            }

            // Convierte los datos en una hoja de trabajo
            const worksheet = XLSX.utils.json_to_sheet(data);

            // Crea un libro de trabajo y agrega la hoja
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "ProductDetails");

            // Genera un archivo Excel y lo descarga
            const excelFileName = "ProductDetails.xlsx";
            XLSX.writeFile(workbook, excelFileName);

            toast.success("El archivo Excel se ha descargado con éxito.");
        } catch (error) {
            console.error("Error exportando los datos a Excel:", error);
            toast.error("Ocurrió un error al exportar los datos.");
        }
    };

    return (
        <>
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
                    <ButtonGroup variant="text" aria-label="text button group">
                        <Button onClick={() => { navigate('/dashboard') }}>Módulos</Button>
                    </ButtonGroup>
                </Box>

                <h5 style={{ marginTop: '20px', marginLeft: '10vw' }}>SUBIR IMAGENES REPUESTOS</h5>

                <div className='content-1ImagesParts'>
                    <div>
                        <p>Formato: RXXX-XXXXXX NOMBREPRODUCTO.png</p>
                    </div>
                </div>


                <div style={{ width: "100vw", display: "flex", justifyContent: 'left', alignItems: 'center', marginLeft: '10vw' }}>
                    <div>
                        <div>
                            <div className='controlYears'>
                                <label htmlFor="file-upload" style={{ marginLeft: '0px', marginTop: '5px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '120px', borderRadius: '5px', marginRight: '15px', display: 'inline-block', textAlign: 'center', lineHeight: '30px', cursor: 'pointer' }}>
                                    CARGA
                                </label>
                                <input id="file-upload" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                                {selectedFiles.length > 0 && (
                                    <div style={{ marginTop: '10px', marginLeft: '0px', color: 'green', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleIcon style={{ marginRight: '5px' }} />
                                        <span>{selectedFiles.length} imágenes seleccionadas</span>
                                    </div>
                                )}
                                <Button onClick={handleClickOpenNew} color="primary" style={{ marginLeft: '20px', marginTop: '5px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '120px', borderRadius: '5px', marginRight: '15px' }}>
                                    GUARDAR
                                </Button>

                                <Button onClick={exportToExcel} style={{ marginLeft: '20px', marginTop: '5px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '120px', borderRadius: '5px', marginRight: '15px' }}>
                                    Exportar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='containerDataTableMui'>
                    <ThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable title={"CARGA DE IMAGENES"} data={imageList} columns={columns} options={options} />
                    </ThemeProvider>
                </div>

                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                    <div style={{ display: "flex", justifyContent: 'center' }}>
                        <div>
                            <DialogContent>
                                <Grid container spacing={2}>
                                    <p className='poppins-regular'>Subir las imágenes Seleccionadas?</p>
                                </Grid>
                            </DialogContent>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <DialogActions>
                                    <Button onClick={handleSubmit} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }}>Guardar</Button>
                                </DialogActions>
                                <DialogActions>
                                    <Button onClick={handleClose}>Cerrar</Button>
                                </DialogActions>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    );
};