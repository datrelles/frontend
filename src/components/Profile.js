import { useState, useEffect } from 'react'
import BootstrapSelect from 'react-bootstrap-select-dropdown';
import Header from "./Header";
import useToken from "./useToken";
import '../styles/Profile.css'
import { useNavigate } from 'react-router-dom';
import { ContactSupportOutlined } from '@material-ui/icons';





const API = process.env.REACT_APP_API;


function Profile(props) {
  const { removeToken } = useToken();
  const navigate = useNavigate();

  const [enterprises, setEnterprises] = useState([])
  const [branches, setBranches] = useState([])
  const [defaultEnterprise, setDefaultEnterprise] = useState("")


  const getEnterprises = async () => {

    const res = await fetch(`${API}/enterprise/${sessionStorage.getItem('currentUser')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + props.token
      }
    })

    const data = await res.json();
    const newData = data.map(item => ({
      key: item.EMPRESA,
      value: item.NOMBRE
    }));
    setEnterprises(newData)
  }

  const getDefaultEnterprise = async () => {
    if (sessionStorage.getItem('currentUser')){
      const res = await fetch(`${API}/enterprise_default/${sessionStorage.getItem('currentUser')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + props.token
        }
      })

    const data = await res.json();
    sessionStorage.setItem('currentEnterprise', data[0].EMPRESA_DEFECTO);
    setDefaultEnterprise(data[0].EMPRESA_DEFECTO)

  }}

  const getBranches = async (selectedKey) => {
    if (selectedKey){
      const res = await fetch(`${API}/branch/${sessionStorage.getItem('currentUser')}/${selectedKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + props.token
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
    getEnterprises();
    getDefaultEnterprise();
  }, [])


  const handleChange = async (selectedOptions) => {
    console.log(selectedOptions.selectedValue);
    const selectedOption = enterprises.find((enterprise) => enterprise.value == selectedOptions.selectedValue);
    const selectedKey = selectedOption ? selectedOption.key : defaultEnterprise;
    console.log(selectedKey);
    sessionStorage.setItem('currentEnterprise', selectedKey);
    sessionStorage.setItem('currentBranch', 0);
    getBranches(selectedKey);

  }

  const handleChange1 = async (selectedOptions) => {
    console.log(selectedOptions.selectedValue);
    const selectedOption = branches.find((branch) => branch.value == selectedOptions.selectedValue); 
    const selectedKey = selectedOption ? selectedOption.key : branches[0].key;
    console.log(selectedKey);
    sessionStorage.setItem('currentBranch', selectedKey);
  }

  const handleChange2 = () => {
    navigate('/dashboard')
  }


  return (
    <section className="h-100 gradient-form" >
      <Header token={removeToken} />
      <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="card-body p-md-5 mx-md-4">
          <div className="text-center pt-1 mb-5 pb-1">
            <h5 className="mb-4">Seleccione Empresa</h5>
            <BootstrapSelect options={enterprises} onChange={handleChange} placeholder="Empresas" />
          </div>
          <div className="text-center pt-1 mb-5 pb-1">
            <h5 className="mb-4">Seleccione Agencia</h5>
            <BootstrapSelect options={branches} onChange={handleChange1} placeholder="Agencias" />
            <div className="text-center pt-1 mb-5 pb-1">
              <button
                className="btn btn-primary btn-block"
                type="button"
                style={{ backgroundColor: 'firebrick' }}
                onClick={handleChange2}
              >
                {'Ingresar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;