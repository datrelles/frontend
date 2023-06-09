import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { About } from "./components/About";
import Users from "./components/Users";
import Login from "./components/Login";
import useToken from "./components/useToken";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import PostSales from "./components/PostSales";
import EditPostSales from "./components/EditPostSales";
import NewPostSales from "./components/NewPostSale";
import PostSaleDetails from "./components/PostSaleDetails";
import NewPostSaleDetail from "./components/NewPostSaleDetail";
import Imports from "./components/Imports";
import Settings from "./components/Settings";

const API = process.env.REACT_APP_API;



function App() {
  const { token, removeToken, setToken } = useToken();

  const [authorized, setAuthorized] = useState(false);

  const checkAuthorization = async () => {
    const res = await fetch(`${API}/modules/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await res.json();
    setAuthorized(data.some((item) => item.COD_SISTEMA.includes('IMP')));
  };


  useEffect(() => {
    if (sessionStorage.getItem('currentEnterprise')){
      checkAuthorization();
  }}, [token]);


  return (
    <div>
      <Router>
        <div className="container-sm">
          {!token && token !== "" && token == undefined ?
            <Login setToken={setToken} />
            : (
              <>
                <Routes>
                  <Route path="/about" element={<About />} />
                  <Route path="/" element={<Login setToken={setToken} />} />
                  <Route path="/users" element={<Users token={token} setToken={setToken} />} />
                  <Route exact path="/profile" element={<Profile token={token} setToken={setToken} />}></Route>
                  <Route exact path="/dashboard" element={<Dashboard token={token} setToken={setToken} />}></Route>
                  <Route exact path="/postSales" element={<PostSales token={token} setToken={setToken} />}></Route>
                  <Route exact path="/editPostSales" element={<EditPostSales token={token} setToken={setToken} />}></Route>
                  <Route exact path="/newPostSales" element={<NewPostSales token={token} setToken={setToken} />}></Route>
                  <Route exact path="/postSaleDetails" element={<PostSaleDetails token={token} setToken={setToken} />}></Route>
                  <Route exact path="/newPostSaleDetail" element={<NewPostSaleDetail token={token} setToken={setToken} />}></Route>
                  {authorized ? 
                    <Route exact path="/imports" element={<Imports token={token} setToken={setToken} />} />
                   : 
                    <Route path="/" element={<Login setToken={setToken} />} />
                  }
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
