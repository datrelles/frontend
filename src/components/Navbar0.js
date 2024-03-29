import React from "react";
import axios from "axios";
import { NavDropdown, Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo_massline1.png';
import ListItemIcon from '@mui/material/ListItemIcon';
import Settings from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MeetingRoomTwoToneIcon from '@mui/icons-material/MeetingRoomTwoTone';
import HolidayVillageTwoToneIcon from '@mui/icons-material/HolidayVillageTwoTone';
import '../styles/Navbar0.css';
import { useAuthContext } from "../context/authContext";

const API = process.env.REACT_APP_API;

function Navbar0(props) {
  const {userShineray, logout }=useAuthContext()
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  const handleClick2 = () => {
    navigate('/profile');
  };

  const handleClick3 = () => {
    navigate('/settings');
  };

  function logMeOut() {
    axios({
      method: "POST",
      url: `${API}/logout`,
    })
      .then((response) => {
        
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
      logout()
    navigate('/');
  }

  const options = props.menus;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000}}>
      <Navbar bg="light" expand="lg" className="navbar0 navbar0-bg">
        <Container fluid>
          <Navbar.Brand onClick={handleClick}>
            <img src={logo} alt="Logo Empresarial" style={{ height: '70px' }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              {options.map((option, index) => (
                <NavDropdown key={index} title={option.title} id="basic-nav-dropdown">
                  {option.items.map((item, itemIndex) => (
                    <NavDropdown.Item key={itemIndex} href={item.RUTA}>
                      {item.NOMBRE}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              ))}
            </Nav>
            <Nav>
              <NavDropdown title={userShineray} id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleClick3} style={{ display: 'flex', alignItems: 'left' }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Ajustes
                </NavDropdown.Item>
                <NavDropdown.Item href="http://192.168.30.7" target="_blank">
                  <ListItemIcon>
                    <SupportAgentIcon fontSize="small" />
                  </ListItemIcon>
                  Soporte
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleClick2}>
                  <HolidayVillageTwoToneIcon /> Cambiar Empresa
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logMeOut}>
                  <MeetingRoomTwoToneIcon /> Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navbar0;