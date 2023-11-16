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
    const {jwt, userShineray, setHandleFlag, flag, setHandleFlagTemporal, temporalFlag}=useAuthContext()
    const [alert, setAlert] = useState('')
    
    useEffect(() => {
        // Verifica si al menos uno de los dos (a o b) no es nulo
        if (flag !== null || temporalFlag !== null) {
          // Ejecuta la acción si ambas variables no son nulas
          navigate('/profile');
        }
      }, []);

    const handleSubmit = async (save) => {
        try {
          if (save ==='save') {
            const response = await updateSessionStatus(userShineray);
            const data = await response.json();
            const localflag='yarenyhs'+jwt+'_'+userShineray;
            setHandleFlag(localflag)
            navigate('/profile')
          } else if(save === 'no'){
            const localflag='yarenyhs'+jwt+'_'+userShineray;
            setHandleFlagTemporal(localflag);
            navigate('/profile')
          }
        } catch (error) {
          console.error('Error during submission:', error);
        }
      };
      
      const updateSessionStatus = (userId) => {
        return fetch(`${API}/auth/verify_sesion/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
          body: JSON.stringify({
            mantiene_sesion: 1,
          }),
        });
      };
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
                                                    onClick={()=>handleSubmit('save')}
                                                >
                                                    {'Guardar'} 
                                                </button>

                                                <button
                                                   className="mx-1 btn btn-primary btn-block"
                                                    type="button"
                                                    style={{ backgroundColor: 'silver' }}
                                                    onClick={()=>handleSubmit('no')}
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
