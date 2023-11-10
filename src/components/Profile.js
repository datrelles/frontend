import { useState, useEffect } from 'react'
import BootstrapSelect from 'react-bootstrap-select-dropdown';
import { useAuthContext } from "../context/authContext";
import Header from "./Header";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import useToken from "./useToken";
import '../styles/Profile.css'
import { useNavigate } from 'react-router-dom';


const API = process.env.REACT_APP_API;


function Profile() {
  const {jwt, userShineray, setHandleenterprise, setHandleBranch, setHandleSystemShineray}=useAuthContext();
  const { removeToken } = useToken();
  const navigate = useNavigate();

  const [enterprises, setEnterprises] = useState([])
  const [enterprise, setEnterprise] = useState("")
  const [branches, setBranches] = useState([])
  const [branch, setBranch] = useState("")


  const getEnterprises = async () => {
    

    const res = await fetch(`${API}/enterprise/${userShineray}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      }
    })

    const data = await res.json();
    const newData = data.map(item => ({
      key: item.EMPRESA,
      value: item.NOMBRE
    }));
    setEnterprises(newData)



    if (userShineray) {
      const res1 = await fetch(`${API}/enterprise_default/${userShineray}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        }
      })

      const data1 = await res1.json();
       setHandleenterprise(data1[0].EMPRESA_ACTUAL);
       setHandleBranch(data1[0].AGENCIA_ACTUAL);
      setEnterprise(newData.find((objeto) => objeto.key === data1[0].EMPRESA_ACTUAL).value)

      const res2 = await fetch(`${API}/branch/${userShineray}/${data1[0].EMPRESA_ACTUAL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        }
      })

      const data2 = await res2.json();
      const newData2 = data2.map(item => ({
        key: item.COD_AGENCIA,
        value: item.NOMBRE
      }));
      setBranch(newData2.find((objeto) => objeto.key === data1[0].AGENCIA_ACTUAL).value)
      setBranches(newData2)
    }


  }


  const getBranches = async (selectedKey) => {
    if (selectedKey) {
      const res = await fetch(`${API}/branch/${userShineray}/${selectedKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        }
      })

      const data = await res.json();
      const newData = data.map(item => ({
        key: item.COD_AGENCIA,
        value: item.NOMBRE
      }));
      setBranches(newData)
    }
  }

  useEffect(() => {
    document.title = 'Seleccion Empresa';
    getEnterprises();
    setHandleSystemShineray('');
  }, [])


  const handleChange = (event, value) => {
    if (value) {
      const statusSeleccionado = enterprises.find((enterprise) => enterprise.value === value);
      if (statusSeleccionado) {
        setHandleenterprise(statusSeleccionado.key);
        setEnterprise(statusSeleccionado.value)
        getBranches(statusSeleccionado.key);
      }
    }
  };

  const handleChange1 = (event, value) => {
    if (value) {
      const statusSeleccionado = branches.find((branch) => branch.value === value);
      if (statusSeleccionado) {
        setHandleBranch(statusSeleccionado.key);
        setBranch(statusSeleccionado.value)
      }
    }
  }

  const handleChange2 = () => {
    navigate('/dashboard')
  }


  return (
    <div className="profile-container">
      <div className="profile-content">
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <h5 className="mb-4">Seleccione Empresa</h5>
            <Autocomplete
              id="empresa"
              options={enterprises.map((enterprise) => enterprise.value)}
              value={enterprise}
              style={{ marginBottom: '20px'}}
              onChange={handleChange}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Empresa"
                  type="text"
                  className="form-control"
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
            />
            <h5 className="mb-4">Seleccione Agencia</h5>
            <Autocomplete
              id="agencia"
              options={branches.map((branch) => branch.value)}
              value={branch}
              style={{ marginBottom: '20px'}}
              onChange={handleChange1}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Agencia"
                  type="text"
                  className="form-control"
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
            />
            <button
              className="btn btn-primary btn-block rounded"
              type="button"
              style={{ backgroundColor: 'firebrick' }}
              onClick={handleChange2}
            >
              {'Ingresar'}
            </button>
            <Header/>
          </Grid>
        </Grid>
        </div>
      </div>


      );
}

      export default Profile;