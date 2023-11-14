import React, { useState, useEffect } from "react";
import { useNavigate, Route, Routes } from 'react-router-dom';
import '../../styles/Login.css'
import logo from '../../img/logo_massline.png';
import logo1 from '../../img/Logo-Shineray-Blanco.png';
import SportsMotorsportsTwoToneIcon from '@mui/icons-material/SportsMotorsportsTwoTone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import { useAuthContext } from "../../context/authContext";


const API = process.env.REACT_APP_API;

function SaveDevice() {

    const navigate = useNavigate();
    const {setAuthToken, login, jwt, userShineray}=useAuthContext()
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [alert, setAlert] = useState('')
    
   

    const handleSubmit = async (e) => {

        e.preventDefault();

        const res = await fetch(`${API}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: name,
                password
            })
        })
        const data = await res.json(); 
        console.log(data)   

        if (data.access_token) {
            setAuthToken(data.access_token)
            login(name,'empresa','rama')
            navigate('/profile')
        } else {
            setAlert('Usuario o contraseña incorrectos')
            navigate('/')
        }

        setName('');
        setPassword('');
    }


    return (
        <section className="h-100 gradient-form" >
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-xl-10">
                        <div className="card rounded-3 text-black">
                            <div className="row g-0">
                                <div className="col-lg-6">
                                    <div className="card-body p-md-5 mx-md-4">
                                        <div className="text-center">
                                            <img
                                                src={logo}
                                                style={{ width: 280 }}
                                                alt="logo"
                                            />
                                            <h4 className="mt-1 mb-5 pb-1"> </h4>
                                        </div>
                                        <form>
                                        <p style={{ textAlign: 'justify' }}>
                                            Deseas mantener la sesión activa en este dispositivo:
                                            </p>
                                            <p style={{ textAlign: 'center', color: 'blue' }}>{'Navegador Google Chrome-Windows'}</p>
                                            <div className="form-outline mb-4">
         
                                                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%'}}>
                                                    <div>
                                                    <LaptopChromebookIcon style={{marginRight:'10px'}}/>
                                                    </div>
                                                    
                                                </div>
                                             
                                               
                                            </div>
                                            <div>
                                                {(() => {
                                                    if (alert != '') {
                                                        return (
                                                            <div class="alert alert-danger" role="alert">
                                                                {alert}
                                                            </div>
                                                        )
                                                    }
                                                }
                                                )()
                                                }
                                            </div>
                                            <div className=" text-center pt-1 mb-5 pb-1">
                                                <button
                                                   className="mx-1 btn btn-primary btn-block"
                                                    type="button"
                                                    style={{ backgroundColor: 'firebrick' }}
                                                    onClick={handleSubmit}
                                                >
                                                    {'Guardar'} 
                                                </button>

                                                <button
                                                   className="mx-1 btn btn-primary btn-block"
                                                    type="button"
                                                    style={{ backgroundColor: 'silver' }}
                                                    onClick={handleSubmit}
                                                >
                                                    {'NO GUARDAR'} 
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-lg-6 d-flex align-items-center gradient-custom-2">
                                    <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                                        <div className="text-center">
                                            <img
                                                src={logo1}
                                                style={{ width: 280 }}
                                                alt="logo"
                                            />
                                            <h4 className="mt-1 mb-5 pb-1"> </h4>
                                        </div>
                                        <h4 className="mb-4 text-center align-middle" style={{ color: "black"}}>Bienvenido al Sistema Empresarial Massline</h4>
                                        <p className="small mb-0">
                                
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
}
export default SaveDevice;
