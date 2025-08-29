import axios from "axios";
import { useNavigate, Route, Routes } from 'react-router-dom';
import '../styles/Profile.css'
import { useAuthContext } from "../context/authContext";


const API = process.env.REACT_APP_API;



function Header(props) {
  const {logout}= useAuthContext()
  const navigate = useNavigate();


  function logMeOut() {
    axios({
      method: "POST",
      url: `${API}/logout`,
    })
      .then((response) => {
       
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
    logout()
    navigate('/')
  }

  return (
    <div className="center-align">
      <button className="btn btn-primary btn-block rounded"
        type="button"
        style={{ backgroundColor: 'firebrick' }} onClick={logMeOut}>
        Cerrar Sesión
      </button>
    </div>
  )
}

export default Header;