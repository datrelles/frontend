import Navbar0 from '../../Navbar0'
import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../../../context/authContext'
import { getMenus, getInfoDespiece } from '../../../services/api'
import { toast } from 'react-toastify';
import { TreeDespiece } from './treeDespiece';
import './ArbolComponente.css'

export const UpdateYear = () => {
    const [menus, setMenus] = useState([]);
    const [codeSubsistemaSelected, setCodeSubsistemaSelected] = useState('')
    const [nameSubsistemaSelected, setNameSusbsistemaSelected]= useState('')
    const [description, setDescription] = useState([])
    const [selectedId, setSelectedId] = useState(null)

    const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()

    const updateCodeSubsistemaSelected = (newCode) => {
        setCodeSubsistemaSelected(newCode)
    }
    

    const getDataDespieceRepuestos = async (jwt, enterpriseShineray) => {

        try {
            const response = await getInfoDespiece(jwt, enterpriseShineray, codeSubsistemaSelected);
            const dataArray = Object.entries(response).map(([id, name]) => ({ id, name }));
            setDescription(dataArray)
            //console.log(dataArray)
            //const newDataProcess= ProcessData(response)
            //setAllDataMotos(newDataProcess)

        } catch (error) {
            console.log(error)
        }
    }
    const handleItemClick = (id, name) => {
        setSelectedId(id);
        setCodeSubsistemaSelected(id);
        setNameSusbsistemaSelected(name)
      };
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


    return (
        <div style={{ marginTop: '150px', top: 0, left: 0, width: "100%", zIndex: 1000 }}>
            <Navbar0 menus={menus} />
            <div style={{ width: "100vw", display: "flex" }}>
                <div style={{ width: "30vw", marginLeft: "25px" }}>
                    <TreeDespiece updateCodeSubsistemaSelected={updateCodeSubsistemaSelected} />
                </div>
                <div className='app-container'>
                    <div style={{ width: "60vw", marginRight: "5vw" }} className='fixed-div' >
                        <div className='content'>
                            <p className='poppins-regular'> Conjunto seleccionado: {codeSubsistemaSelected} - {nameSubsistemaSelected} </p>
                        </div>
                        <div className='content-1'>
                            Descripcion:
                            <div className="scroll-container">
                                <div className="scroll-content">
                                    <ul>
                                        {description.map(item => (
                                            <li key={item.id}
                                                onClick={() => handleItemClick(item.id, item.name)}
                                                className={selectedId === item.id ? 'selected' : ''}
                                            >
                                                Id: {item.id} - {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
