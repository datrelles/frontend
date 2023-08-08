import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import EditShipment from "./components/EditShipment";
import PackingList from "./components/PackingList";
import Settings from "./components/Settings";
import Menus from "./components/Menus";

const API = process.env.REACT_APP_API;



function App() {
  const { token, removeToken, setToken } = useToken();
  const [authorizedSystems, setAuthorizedSystems] = useState(['IMP', 'REP', 'GAR']);

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
    <div>
      <Router>
        <div className="container-sm">
          {!token && token !== "" && token == undefined ?
            <Login setToken={setToken} />
            : (
              <>
                <Routes>
                  <Route path="/" element={<Login setToken={setToken} />} />
                  <Route path="/users" element={<Users token={token} setToken={setToken} />} />
                  <Route exact path="/profile" element={<Profile token={token} setToken={setToken} />}></Route>
                  <Route exact path="/dashboard" element={<Dashboard token={token} setToken={setToken} />}></Route>
                  <Route exact path="/postSales" element={<Protected isLoggedIn={authorizedSystems.includes('REP')}><PostSales token={token} setToken={setToken} /></Protected>}></Route>
                  <Route exact path="/editPostSales" element={<EditPostSales token={token} setToken={setToken} />}></Route>
                  <Route exact path="/menus" element={<Menus token={token} setToken={setToken} />}></Route>
                  <Route exact path="/newPostSales" element={<NewPostSales token={token} setToken={setToken} />}></Route>
                  <Route exact path="/postSaleDetails" element={<PostSaleDetails token={token} setToken={setToken} />}></Route>
                  <Route exact path="/newPostSaleDetail" element={<NewPostSaleDetail token={token} setToken={setToken} />}></Route>
                  <Route exact path="/imports" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><Imports token={token} setToken={setToken} /></Protected>}/>
                  <Route exact path="/shipment" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><Shipment token={token} setToken={setToken} /></Protected>}/>
                  <Route exact path="/editShipment" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><EditShipment token={token} setToken={setToken} /></Protected>}/>
                  <Route exact path="/packingList" element={<Protected isLoggedIn={authorizedSystems.includes('IMP')}><PackingList token={token} setToken={setToken} /></Protected>}/>
                  <Route exact path="/settings" element={<Settings token={token} setToken={setToken} />}></Route>
                </Routes>
              </>
            )}
        </div>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;