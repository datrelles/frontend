import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Settings from "./components/Settings";
import Menus from "./components/Menus";
import Details from "./components/Details";
import Reports4 from "./components/Reports4";

const API = process.env.REACT_APP_API;



function App() {
  const {  removeToken, setToken } = useToken();
  const [authorizedSystems, setAuthorizedSystems] = useState(['IMP', 'REP', 'GAR', 'PBI']);
  const {jwt}=useAuthContext();
  const token=jwt

  const checkAuthorization = async () => {
    const res = await fetch(`${API}/modules/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}`, {
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
    if (sessionStorage.getItem('currentEnterprise')) {
      checkAuthorization();
    }
  }, [token]);



  return (
    <div style={{ width: '99%', minHeight: '100vh', marginLeft: '10px' }}>
        <Router>
          {!token && token !== "" && token == undefined ?
            <Login setToken={setToken} />
            : (
              <>
                <Routes>
                  <Route path="/" element={<Login/>} />
                  <Route path="/users" element={<Users/>} />
                  <Route exact path="/profile" element={<Profile/>}></Route>
                  <Route exact path="/dashboard" element={<Dashboard />}></Route>
                  <Route exact path="/postSales" element={<Protected isLoggedIn={authorizedSystems.includes('REP')}><PostSales  /></Protected>}></Route>
                  <Route exact path="/editPostSales" element={<EditPostSales token={token} setToken={setToken} />}></Route>
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
                  <Route exact path="/reports" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports /></Protected>} />
                  <Route exact path="/reports2" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports2 /></Protected>} />
                  <Route exact path="/reports3" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports3/></Protected>} />
                  <Route exact path="/reports4" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports4 token={token} setToken={setToken} /></Protected>}/>
                  <Route exact path="/settings" element={<Settings token={token} setToken={setToken} />}></Route>
                </Routes>
              </>
            )}
        </Router>
      <ToastContainer />
    </div>
  );
}

export default App;