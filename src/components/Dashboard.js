import Navbar0 from "./Navbar0";
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API;

function Dashboard(props) {

  const [moduleList, setModuleList] = useState([])
  const [menus, setMenus] = useState([])
  const getModules = async () => {

    const res = await fetch(`${API}/modules/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
    })

    const data = await res.json();
    console.log(data)
    setModuleList(data)
  }

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
      borderRadius: '25%',
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

  useEffect(() => {
    getModules();
  }, [])

  const listaElementos = moduleList.map((module) => (
    <div className="col-lg-2 col-md-3 col-sm-5 pb-3">
      <div className="avatar white text-center">
        <Link to={`${module.RUTA}?sistema=${module.COD_SISTEMA}`}>
          <HoverImage src={require(`../img/${module.PATH_IMAGEN}`)} alt={module.SISTEMA} style={{ marginBottom: '10px' }} />
        </Link>
      </div>
      <div className="text-center mt-2">
        <h6 className="font-weight-bold pt-2 mb-0">{module.SISTEMA}</h6>
        <p className="text-muted mb-0">
          <small>Empresa: {sessionStorage.getItem('currentEnterprise')}</small>
        </p>
      </div>
    </div>
  ));

  return (
    <div>
      <Navbar0 menus={menus}/>
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
            <div className="row pt-4">{listaElementos}</div>
            </div>
            <div className="card-footer white text-center py-3">
              <a href="#!">Modulos Empresariales</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard;