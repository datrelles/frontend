import Navbar0 from "./Navbar0";
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import repuestos from '../img/icon_repuestos.PNG';
import garantias from '../img/icon_warranty.PNG';
import contabilidad from '../img/icon_contable.png';
import massline from '../img/default.png';


function Dashboard(props) {

  function HoverImage(props) {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
      setIsHovered(true);
    };

    const handleMouseOut = () => {
      setIsHovered(false);
    };

    const imageStyle = {
      width: '100%',
      borderRadius: '50%',
      boxShadow: isHovered ? '0 0 10px rgba(0, 0, 0, 0.6)' : 'none',
      transform: isHovered ? 'scale(1.1)' : 'none',
      transition: 'all 0.3s ease-in-out',
    };

    return (
      <img
        src={props.src}
        alt={props.alt}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        style={props.style ? { ...imageStyle, ...props.style } : imageStyle}
      />
    );
  }

  return (
    <div>
      <Navbar0 />
      <div className="container my-5">

        <section className="team-section">
          <div className="card">
            <div className="card-header white d-flex justify-content-between">
              <p className="h5-responsive font-weight-bold mb-0">Módulos</p>
              <ul className="list-unstyled d-flex align-items-center mb-0">
                <li>
                  <span className="badge badge-danger">Dashboard</span>
                </li>
                <li>
                  <i className="far fa-window-minimize fa-sm pl-3" />
                </li>
                <li>
                  <i className="fas fa-times fa-sm pl-3" />
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="row pt-4">
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <Link to="/postSales">
                      <HoverImage src={repuestos} alt="Repuestos" style={{ marginBottom: '10px' }} />
                    </Link>
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Repuestos</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={garantias} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Garantías</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={contabilidad} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Contabilidad</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
                  <div className="avatar white text-center">
                    <HoverImage src={massline} alt="Repuestos" style={{ marginBottom: '10px' }} />
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="font-weight-bold pt-2 mb-0">Modulo Empresarial</h6>
                    <p className="text-muted mb-0">
                      <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer white text-center py-3">
              <a href="#!">View All Users</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard;