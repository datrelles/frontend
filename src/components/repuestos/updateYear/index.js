import Navbar0 from '../../Navbar0'
import React, { useState, useEffect, Children } from 'react'
import { useAuthContext } from '../../../context/authContext'
import { getMenus, getInfoDespiece, putChangeYearForSubsystem, getYearOfPartsMotocycle } from '../../../services/api'
import LoadingCircle from '../../contabilidad/loadermd';
import { toast } from 'react-toastify';
import { TreeDespiece } from './treeDespiece';
import './ArbolComponente.css';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';

export const UpdateYear = () => {
    const [menus, setMenus] = useState([]);
    const [codeSubsistemaSelected, setCodeSubsistemaSelected] = useState(null)
    const [nameSubsistemaSelected, setNameSusbsistemaSelected] = useState(null)
    const [description, setDescription] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [nameSelected, setNameSelected] = useState('')
    const [groupCodeSubsystem, setGroupCodeSubsystem] = useState(null)
    const [onlyOneSubsystem, setOnlyOneSubsystem] = useState(null)
    const [completeSubsystem, setCompleteSubsystem] = useState(null)
    const [flagIdLevel, setFlagIdLevel] = useState(null)
    const [loading, setLoading] = useState(false);
    const [auxUpdateYear, setAuxUpdateYear] = useState(false)

    //Aux for years
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentYearTypeNumber = currentYear % 100;
    //"From" "to" selector
    const [fromYear, setFromYear] = useState('');
    const [toYear, setToYear] = useState('');
    //DIALOG
    const [preFromYear, setPreFromYear] = useState(null);
    const [preToYear, setPreToYear] = useState(null);
    //

    const [open, setOpen] = useState(false);

    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()

    const updateCodeSubsistemaSelected = (newCode, name, resultChildren) => {
        setNameSusbsistemaSelected(null)
        setOnlyOneSubsystem(null)
        setCodeSubsistemaSelected(newCode)
        setCompleteSubsystem(newCode)
        setNameSelected(name)
        setGroupCodeSubsystem(resultChildren)
        setFlagIdLevel(1)

    }
    const getDataDespieceRepuestos = async (jwt, enterpriseShineray) => {
        try {
            setLoading(true)
            const response = await getInfoDespiece(jwt, enterpriseShineray, codeSubsistemaSelected);
            const dataArray = Object.entries(response).map(([id, name]) => ({ id, name }));

            const newData = await Promise.all(dataArray.map(async item => {
                const { id, name } = item;
                const { from, to } = await getIndividualYearForParts(jwt, enterpriseShineray, id)
                return {
                    id,
                    name,
                    from,
                    to
                };
            }))
            setDescription(newData)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    const putDataDespieceRepuestosAnio = async (jwt, fromYear, toYear, flag_id_level, empresa, userShineray, data) => {
        try {
            
            const response = await putChangeYearForSubsystem(jwt, fromYear, toYear, flag_id_level, empresa, userShineray, data);
            toast.success(response.succes)
            toggleAuxUpdateYear()

        } catch (error) {
            toast.error(error.message)
            console.log(error.message)
           
        }
    }
    const getIndividualYearForParts = async (jwt, empresa, cod_Producto) => {
        console.log(jwt, empresa, cod_Producto)
        try {
            const response = await getYearOfPartsMotocycle(jwt, empresa, cod_Producto);
            return response
        } catch (error) {
            console.log(error)
        }
    }

    const toggleAuxUpdateYear = () => {
        setAuxUpdateYear(prevState => !prevState);
      };
    const handleItemClick = (id, name, kindOfParts) => {
        if (kindOfParts == 'singleParts') {
            setCompleteSubsystem(null)
            setSelectedId(id);
            setNameSusbsistemaSelected(name);
            setNameSelected(id)
            setOnlyOneSubsystem(id)
            setFlagIdLevel(2)

        } else {
            console.log('only single parts')
        }
    };
    const handleChangeFromYear = (event) => {
        setFromYear(event.target.value);
    };
    const handleChangeToYear = (event) => {
        setToYear(event.target.value);
    };


    //DIALOG
    const handleClose = () => {
        setOpen(false)
    }
    const handleClickOpenNew = () => {
        setOpen(true)
    }
    const handleSave = () => {
        
        let data = []
        if (groupCodeSubsystem != null) {
            data = {
                "cod_subsystem": groupCodeSubsystem
            }
        } else if (completeSubsystem != null) {
            data = {
                "cod_subsystem": [completeSubsystem]
            }
        } else if (onlyOneSubsystem) {
            data = {
                "cod_producto": [onlyOneSubsystem]
            }
        }

        putDataDespieceRepuestosAnio(jwt, fromYear, toYear, flagIdLevel, enterpriseShineray, userShineray, data)
        setOpen(false)

    }

    const years = Array.from({ length: currentYearTypeNumber + 4 }, (_, i) => 2000 + i);
    //Menu
    useEffect(() => {
        const menu = async () => {
            try {
                const data = await getMenus(userShineray, enterpriseShineray, 'REP', jwt)
                setMenus(data)

            }
            catch (error) {
                console.log(error)
                toast.error(error)
            }

        }
        menu();
    }, [])

    useEffect(() => {
        getDataDespieceRepuestos(jwt, enterpriseShineray, codeSubsistemaSelected)
    }, [codeSubsistemaSelected, auxUpdateYear])
    //children of motocycle subssystem 
    //console.log(groupCodeSubsystem)
    //code subsystem
    //console.log(completeSubsystem)
    //one part
    //console.log(onlyOneSubsystem)


    return (
        <>
            <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
                <Navbar0 menus={menus} />
                <div style={{ width: "100vw", display: "flex" }}>
                    <div style={{ width: "30vw", marginLeft: "25px" }}>
                        <TreeDespiece updateCodeSubsistemaSelected={updateCodeSubsistemaSelected} />
                    </div>
                    <div>
                        <div className='app-container'>
                            <div style={{ width: "60vw", marginRight: "5vw" }} className='fixed-div' >
                                <div className='content'>
                                    <p className='poppins-regular'> Conjunto seleccionado: {nameSelected} {nameSubsistemaSelected ? ('  -' + nameSubsistemaSelected) : (null)} </p>
                                </div>
                                <div className='content-1'>
                                    Descripcion:
                                    {loading ? (<LoadingCircle />) : (
                                        <div className="scroll-container">
                                            <div className="scroll-content">
                                                <ul>
                                                    {description.map(item => (
                                                        <li
                                                            key={item.id}
                                                            onClick={() => handleItemClick(item.id, item.name, 'singleParts')}
                                                            className={selectedId === item.id ? 'selected' : ''}
                                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                        >
                                                            <span>Id: {item.id} - {item.name}</span>
                                                            <span style={{ marginLeft: 'auto' }}>{item.from}-{item.to} &nbsp;</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    <div className='controlYears'>

                                        <div className='controlYearsSelector'>
                                            <TextField
                                                select
                                                label="Desde"
                                                value={fromYear}
                                                onChange={handleChangeFromYear}
                                                fullWidth
                                                variant="outlined"
                                                margin="normal"
                                            >
                                                {years.map((year) => (
                                                    <MenuItem key={year} value={year} sx={{ fontSize: '14px' }}>
                                                        {year}
                                                    </MenuItem>
                                                ))}
                                            </TextField>

                                        </div>
                                        <div className='controlYearsSelector'>
                                            <TextField
                                                select
                                                label="Hasta"
                                                value={toYear}
                                                onChange={handleChangeToYear}
                                                fullWidth
                                                variant="outlined"
                                                margin="normal"
                                            >
                                                {years.map((year) => (
                                                    <MenuItem key={year} value={year} sx={{ fontSize: '14px' }}>
                                                        {year}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </div>
                                        <Button onClick={() => handleClickOpenNew()} color="primary" style={{ marginLeft: '20px', marginTop: '5px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '120px', borderRadius: '5px', marginRight: '15px' }}>
                                            ACTUALIZAR
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {/* --DIALOGO LIST-- */}
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth >
                    <div style={{ display: "flex", justifyContent: 'center' }}>
                        <div>
                            <DialogContent >
                                <Grid container spacing={2}>
                                    <p className='poppins-regular'> <br></br> <br></br> Se actualizará el año de la siguiente sección:  {nameSelected} {nameSubsistemaSelected ? ('  = ' + nameSubsistemaSelected) : (null)} </p>
                                </Grid>

                                <Grid container spacing={2}>
                                    <p className='poppins-regular'> <br></br> <br></br> Rango seleccionado:  {fromYear + '-' + toYear}  </p>
                                </Grid>

                            </DialogContent>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <DialogActions>
                                    <Button onClick={handleSave} style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '100px', borderRadius: '5px', marginRight: '15px' }} >Guardar</Button>
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
    )
}
