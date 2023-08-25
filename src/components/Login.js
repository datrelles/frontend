import React, { useState, useEffect } from "react";
import { useNavigate, Route, Routes } from 'react-router-dom';
import '../styles/Login.css'
import logo from '../img/logo_massline.png';
import logo1 from '../img/Logo-Shineray-Blanco.png';
import SportsMotorsportsTwoToneIcon from '@mui/icons-material/SportsMotorsportsTwoTone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';


const API = process.env.REACT_APP_API;

function Login(props) {

    const navigate = useNavigate();

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
        props.setToken(data.access_token)

        if (data.access_token) {
            sessionStorage.setItem('currentUser', name);
            navigate('/profile')
        } else {
            setAlert('Usuario o contraseña incorrectos')
            navigate('/')
            sessionStorage.removeItem('token');

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
                                            <p>Por favor, ingrese sus credenciales</p>
                                            <div className="form-outline mb-4">
                                                <input type="text"
                                                    onChange={e => setName(e.target.value)}
                                                    value={name}
                                                    className="form-control"
                                                    placeholder="Usuario"
                                                    autoFocus />
                                                <label className="form-label" htmlFor="form2Example11">
                                                <SportsMotorsportsTwoToneIcon/>  Usuario
                                                </label>
                                            </div>
                                            <div className="form-outline mb-4">
                                                <input type="password"
                                                    onChange={e => setPassword(e.target.value)}
                                                    value={password}
                                                    className="form-control"
                                                    placeholder="Contraseña"
                                                />
                                                <label className="form-label" htmlFor="form2Example22">
                                                <VpnKeyIcon/>    Contraseña
                                                </label>
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
                                                    onClick={handleSubmit}
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
                                        <h4 className="mb-4">Bienvenido al Sistema Empresarial Massline</h4>
                                        <p className="small mb-0">
                                            MultiEmpresa. MultiAgencia.
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
export default Login;
