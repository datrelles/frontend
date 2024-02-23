import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { useAuthContext } from "./context/authContext";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Users from "./components/Users";
import Login from "./components/Login";
import Protected from "./components/Protected";
import useToken from "./components/useToken";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import PostSales from "./components/PostSales";
import EditPostSales from "./components/EditPostSales";
import NewPostSales from "./components/NewPostSale";
import PostSaleDetails from "./components/PostSaleDetails";
import NewPostSaleDetail from "./components/NewPostSaleDetail";
import Imports from "./components/Imports";
import Shipment from "./components/Shipment";
import Container from "./components/Container";
import EditContainer from "./components/EditContainer";
import NewContainer from "./components/NewContainer";
import EditShipment from "./components/EditShipment";
import NewShipment from "./components/NewShipment";
import PackingList from "./components/PackingList";
import PackingListTotal from "./components/PackingListTotal";
import Reports from "./components/Reports";
import Reports2 from "./components/Reports2";
import Reports3 from "./components/Reports3";
import Reports4 from "./components/Reports4";
import Reports5 from "./components/Reports5";
import Settings from "./components/Settings";
import Menus from "./components/Menus";
import Details from "./components/Details";
import Formule from "./components/Formule";
import NewFormule from "./components/NewFormule";
import EditFormule from "./components/EditFormule";
import LoginAuth from "./components/loginSecondAuth/Login";
import SecondAuth from "./components/loginSecondAuth/secondAuth";
import SaveDevice from "./components/loginSecondAuth/saveDevice";
import { ElectronicFilesSri } from "./components/contabilidad/filesSri";
import { CaseManager } from "./components/garantias/caseManager/caseManager";

const API = process.env.REACT_APP_API;
function App() {
  const {  removeToken, setToken } = useToken();
  const [authorizedSystems, setAuthorizedSystems] = useState(['IMP', 'REP', 'GAR', 'PBI','CON', 'IN']);

  const {jwt, userShineray,enterpriseShineray, flag, temporalFlag, logout}=useAuthContext();
  const token=jwt

  const checkAuthorization = async () => {
    const res = await fetch(`${API}/modules/${userShineray}/${enterpriseShineray}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await res.json();
    setAuthorizedSystems(data.map(row => row.COD_SISTEMA));
  };


  useEffect(() => {
    if (enterpriseShineray) {
      checkAuthorization();

    }  
  }, [jwt]);

  
  useEffect(() => {
    if (flag === null && temporalFlag === null) {
      logout();
      
    } else {
      // Determina cuál  no es nulo
      const valorNoNulo = flag !== null ? flag : temporalFlag;
      
      // Compara el valor no nulo con jwt
      if (valorNoNulo === 'yarenyhs'+jwt+'_'+userShineray) {
        // Ejecuta la acción si el valor no nulo es igual a c
       
      } else{
        logout();
      }
    }
  }, []);




  return (
    <div style={{ width: '99%', minHeight: '100vh', marginLeft: '10px' }}>
        <Router>
          {!jwt && jwt !== "" && jwt == undefined ?
            (        
            <Routes>
              <>
              <Route path="/" element={<LoginAuth/>} />
              <Route path="/auth" element={<LoginAuth/>} />
              <Route path="/2auth" element={<SecondAuth/>} />
              <Route path="*" element={<LoginAuth/>}/>
              </>
            </Routes>
                )
            : (
              <>
                <Routes>
                  <Route exact path="*" element={<Profile />}></Route>
                  <Route path="/saveDevice" element={<SaveDevice/>} />
                  <Route path="/users" element={<Users/>} />
                  <Route exact path="/profile" element={<Profile/>}></Route>
                  <Route exact path="/dashboard" element={<Dashboard />}></Route>
                  <Route exact path="/postSales" element={<Protected isLoggedIn={authorizedSystems.includes('REP')}><PostSales  /></Protected>}></Route>
                  <Route exact path="/editPostSales" element={<EditPostSales/>}></Route>
                  <Route exact path="/menus" element={<Menus/>}></Route>
                  <Route exact path="/newPostSales" element={<NewPostSales />}></Route>
                  <Route exact path="/postSaleDetails" element={<PostSaleDetails/>}></Route>
                  <Route exact path="/newPostSaleDetail" element={<NewPostSaleDetail/>}></Route>
                  <Route exact path="/imports" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><Imports/></Protected>} />
                  <Route exact path="/shipment" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><Shipment/></Protected>} />
                  <Route exact path="/container" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><Container/></Protected>} />
                  <Route exact path="/editContainer" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><EditContainer /></Protected>} />
                  <Route exact path="/newContainer" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><NewContainer /></Protected>} />
                  <Route exact path="/editShipment" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><EditShipment/></Protected>} />
                  <Route exact path="/newShipment" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><NewShipment /></Protected>} />
                  <Route exact path="/packingList" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><PackingList  /></Protected>} />
                  <Route exact path="/packinglistTotal" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><PackingListTotal /></Protected>} />
                  <Route exact path="/details" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><Details/></Protected>} />
                  <Route exact path="/formule" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}><Formule/></Protected>} />
                  <Route exact path="/newFormule" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}><NewFormule/></Protected>} />
                  <Route exact path="/EditFormule" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}><EditFormule/></Protected>} />
                  <Route exact path="/reports" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports /></Protected>} />
                  <Route exact path="/reports2" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports2 /></Protected>} />
                  <Route exact path="/reports3" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports3/></Protected>} />
                  <Route exact path="/reports4" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports4 /></Protected>}/>
                  <Route exact path="/reports5" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports5 /></Protected>}/>
                  <Route exact path="/electronicFile" element={<Protected isLoggedIn={authorizedSystems.includes('CON')}><ElectronicFilesSri/></Protected>}/>
                  <Route exact path="/warranty" element={<Protected isLoggedIn={authorizedSystems.includes('GAR')}><CaseManager/></Protected>}/>
                  <Route exact path="/settings" element={<Settings/>}></Route>
                </Routes>
              </>            
            )}
        </Router>
      <ToastContainer />
    </div>
  );
}

export default App;