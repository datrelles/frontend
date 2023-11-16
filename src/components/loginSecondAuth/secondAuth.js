import React, { useState, useEffect } from "react";
import { useNavigate, Route, Routes } from 'react-router-dom';
import '../../styles/Login.css'
import logo from '../../img/logo_massline.png';
import logo1 from '../../img/Logo-Shineray-Blanco.png';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import { useAuthContext } from "../../context/authContext";


const API = process.env.REACT_APP_API;

function SecondAuth() {

    const navigate = useNavigate();
    const {setAuthToken, login}=useAuthContext()
    const [name, setName] = useState('')
    const [pin, setpin] = useState('')
    const [alert, setAlert] = useState('')
    
   

    const pinSubmit = async (e) => {

        e.preventDefault();

        const res = await fetch(`${API}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: name,
                pin
            })
        })
        const data = await res.json();   

        if (data.access_token) {
            setAuthToken(data.access_token)
            login(name,'empresa','rama')
            navigate('/profile')
        } else {
            setAlert('Usuario o contraseña incorrectos')
            navigate('/')
        }

        setName('');
        setpin('');
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
                                                Se requiere autenticación de dos factores. Se ha enviado un código al correo electrónico correspondiente.
                                            </p>
                                            <p style={{ textAlign: 'center', color: 'blue' }}>{'d******3@massline.com.ec'}</p>
                                            <div className="form-outline mb-4">
                                                <input type="password"
                                                    onChange={e => setpin(e.target.value)}
                                                    value={pin}
                                                    className="form-control"
                                                    placeholder="Introducir PIN "
                                                />
                                              
                                                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%'}}>
                                                    <div>
                                                    <VpnKeyIcon style={{marginRight:'10px'}}/> PIN
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
                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <button
                                                   className="btn btn-primary btn-block"
                                                    type="button"
                                                    style={{ backgroundColor: 'firebrick' }}
                                                    onClick={pinSubmit}
                                                >
                                                    {'Ingresar '} <TwoWheelerRoundedIcon/>
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
export default SecondAuth;
