import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css'
import logo from '../../img/logo_massline.png';
import logo1 from '../../img/Logo-Shineray-Blanco.png';
import SportsMotorsportsTwoToneIcon from '@mui/icons-material/SportsMotorsportsTwoTone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import { useAuthContext } from "../../context/authContext";
import LoadingCircle from './loader';


const API = process.env.REACT_APP_API;

function LoginAuth() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { secondAuth, setSecondAuthInit, setAuthToken, login, setSecondAuthFinish } = useAuthContext();
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [alert, setAlert] = useState('')
    const [pin, setPin] = useState('')
    const [email, setEmail] = useState('')
    const [mensajeError, setMensajeError] = useState('');

    ////Validacion de PIN

    useEffect(() => {
        setSecondAuthFinish()
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const res = await fetch(`${API}/auth/set_authorization/${name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: name,
                    password
                })
            });

            if (!res.ok) {
                setLoading(false);
                throw new Error(`Error al realizar la solicitud: ${res.status}`);

            }
            const data = await res.json();
            if (data.auth2) {
                setLoading(false);
                setAlert('');
                const firstChar = data.email.charAt(0);
                const domainSuffix = data.email.slice(data.email.indexOf('@'));
                const maskedChars = '*'.repeat(data.email.length - (domainSuffix.length+1));
                const prelastchart = data.email.split('@')[0];
                const lastchart = prelastchart[prelastchart.length-1];
                const maskedEmail = `${firstChar}${maskedChars}${lastchart}${domainSuffix}`;
                setEmail(maskedEmail)
                setSecondAuthInit(data.user)

            } else {
                setLoading(false);
                setAlert('Usuario o contraseña incorrectos');
                navigate('/auth');
            }

            setName('');
            setPassword('');
        } catch (error) {
            console.error('Error en la solicitud:', error.message);
            setLoading(false);
            setAlert('Error al procesar la solicitud, por favor intenta nuevamente.');
        }
    };


    const pinSubmit = async () => {
        setAlert('')
        if (/^\d{6}[a-zA-Z]$/.test(pin)) {
            try {
                const res = await fetch(`${API}/auth/verify_authorization/${secondAuth}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: pin,
                    })
                })
                const data = await res.json();
                if (data.access_token) {
                    setAuthToken(data.access_token)
                    login(secondAuth, 'empresa', 'rama')
                    navigate('/saveDevice')
                    setName('');
                    setPin('');
                } else {
                    console.log(data.error)
                    if(data.error='Token expirado')
                        setAlert('Token expirado')       
                    else    
                        setAlert('Pin Incorrecto')
                    setPin('');
                }
               

            } catch (error) {
                setAlert(error)
            }

        } else {
            setAlert('PIN no válido');
        }

    }




    return (
        <>
            <div>
                {loading ? <LoadingCircle /> :
                    <>
                        {secondAuth ?
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
                                                                <p style={{ textAlign: 'center', color: 'blue' }}>{email}</p>
                                                                <div className="form-outline mb-4">
                                                                    <input type="text"
                                                                        onChange={e => setPin(e.target.value)}
                                                                        value={pin}
                                                                        className="form-control"
                                                                        placeholder="Introducir PIN "
                                                                    />

                                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                                        <div>
                                                                            <VpnKeyIcon style={{ marginRight: '10px' }} /> PIN
                                                                        </div>

                                                                    </div>


                                                                </div>
                                                                <div>
                                                                    {(() => {
                                                                        if (alert !== '') {
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
                                                                        {'Ingresar '} <TwoWheelerRoundedIcon />
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
                                                            <h4 className="mb-4 text-center align-middle" style={{ color: "black" }}>Bienvenido al Sistema Empresarial Massline</h4>
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
                            :
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
                                                                        <SportsMotorsportsTwoToneIcon />  Usuario
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
                                                                        <VpnKeyIcon />    Contraseña
                                                                    </label>
                                                                </div>
                                                                <div>
                                                                    {(() => {
                                                                        if (alert !== '') {
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
                                                                        {'Ingresar '} <TwoWheelerRoundedIcon />
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
                                                            <h4 className="mb-4 text-center align-middle" style={{ color: "black" }}>Bienvenido al Sistema Empresarial Massline</h4>
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
                        }

                    </>
                }
            </div>


        </>

    );
}
export default LoginAuth;
