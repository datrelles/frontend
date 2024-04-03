import Navbar0 from '../../Navbar0'
import React, { useState, useEffect, Children } from 'react'
import { useAuthContext } from '../../../context/authContext'
import { getMenus, getInfoDespiece } from '../../../services/api'
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
    //"From" "to" selector
    const [fromYear, setFromYear] = useState('');
    const [toYear, setToYear] = useState('');
    //DIALOG
    const [open, setOpen] = useState(false);

    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()

    const updateCodeSubsistemaSelected = (newCode, name, resultChildren) => {
        setNameSusbsistemaSelected(null)
        setOnlyOneSubsystem(null)
        setCodeSubsistemaSelected(newCode)
        setCompleteSubsystem(newCode)
        setNameSelected(name)
        setGroupCodeSubsystem(resultChildren)

    }
    const getDataDespieceRepuestos = async (jwt, enterpriseShineray) => {
        try {
            const response = await getInfoDespiece(jwt, enterpriseShineray, codeSubsistemaSelected);
            const dataArray = Object.entries(response).map(([id, name]) => ({ id, name }));
            setDescription(dataArray)
        } catch (error) {
            console.log(error)
        }
    }
    const handleItemClick = (id, name, kindOfParts) => {
        if (kindOfParts == 'singleParts') {
            setCompleteSubsystem(null)
            setSelectedId(id);
            setNameSusbsistemaSelected(name);
            setNameSelected(id)
            setOnlyOneSubsystem(id)

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
    const handleClose=()=>{
        console.log('cerrado')
    }
    const handleClickOpenNew=()=>{
        console.log('open')
    }
    const handleSave=()=>{
        console.log('save')
    }
    const years = Array.from({ length: 101 }, (_, i) => 2000 + i);
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
    }, [codeSubsistemaSelected])
    //children of motocycle subssystem 
    console.log(groupCodeSubsystem)
    //code subsystem
    console.log(completeSubsystem)
    //one part
    console.log(onlyOneSubsystem)


    return (
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
                                <div className="scroll-container">
                                    <div className="scroll-content">
                                        <ul>
                                            {description.map(item => (
                                                <li key={item.id}
                                                    onClick={() => handleItemClick(item.id, item.name, 'singleParts')}
                                                    className={selectedId === item.id ? 'selected' : ''}
                                                >
                                                    Id: {item.id} - {item.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className='controlYears'>

                                    <div className='controlYearsSelector'>
                                        <TextField
                                            select
                                            label="From Year"
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
                                            label="To Year"
                                            value={toYear}
                                            onChange={handleChangeToYear}
                                            fullWidth
                                            variant="outlined"
                                            margin="normal"
                                            sx={{ fontSize: '12px' }}
                                        >
                                            {years.map((year) => (
                                                <MenuItem key={year} value={year} sx={{ fontSize: '14px' }}>
                                                    {year}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </div>
                                    <Button onClick={() => handleClickOpenNew(value)} color="primary" style={{ marginLeft: '20px', marginTop: '5px', backgroundColor: 'firebrick', color: 'white', height: '30px', width: '120px', borderRadius: '5px', marginRight: '15px' }}>
                                        ACTUALIZAR
                                    </Button>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* --DIALOGO LIST-- */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth >
                <div style={{ display: "flex" }}>
                    <div>
                        <DialogContent >
                            <Grid container spacing={2}>
                                <>HOLA</>
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
    )
}
