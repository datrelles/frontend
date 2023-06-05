import React from "react";
import axios from "axios";
import { NavDropdown, Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo_massline.png';
import ListItemIcon from '@mui/material/ListItemIcon';
import Settings from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';




const API = process.env.REACT_APP_API;

function Navbar0(props) {

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
        props.token()
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentEnterprise');
    sessionStorage.removeItem('currentBranch');
    sessionStorage.removeItem("token");
    navigate('/')
  }



  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand onClick={handleClick}>
          <img
            src={logo}
            alt="Logo Empresarial"
            style={{ height: '70px' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#action/4.1">Menu</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <NavDropdown title={sessionStorage.getItem('currentUser')} id="basic-nav-dropdown">
              <NavDropdown.Item onClick={handleClick3} style={{ display: 'flex', alignItems: 'left' }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>Ajustes</NavDropdown.Item>
              <NavDropdown.Item href="http://192.168.30.7" target="_blank">
                <ListItemIcon>
                  <SupportAgentIcon fontSize="small" />
                </ListItemIcon>
                Soporte</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleClick2}>Cambiar Empresa</NavDropdown.Item>
              <NavDropdown.Item onClick={logMeOut}>Cerrar Sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )

}

export default Navbar0;




