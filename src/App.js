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
import Fideicomiso from "./components/Fideicomiso";
import Negociacion from "./components/Negociacion";
import NewNegociacion from "./components/NewNegociacion";
import Costumer from "./components/Costumer";
import EditCabecera from "./components/EditCabecera";
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
import Reports6 from "./components/Reports6";
import Reports7 from "./components/Reports7";
import Reports8 from "./components/Reports8";
import Reports9 from "./components/Reports9";
import Reports10 from "./components/Reports10";
import Reports11 from "./components/Reports11";
import Reports12 from "./components/Reports12";
import Reports13 from "./components/Reports13";
import Reports14 from "./components/Reports14";
import Reports15 from "./components/Reports15";
import Reports16 from "./components/Reports16";
import Reports17 from "./components/Reports17";
import Reports18 from "./components/Reports18";
import Reports19 from "./components/Reports19";
import Reports20 from "./components/Reports20";
import Reports21 from "./components/Reports21";
import Reports22 from "./components/Reports22";
import Reports23 from "./components/Reports23";
import Reports24 from "./components/Reports24";
import Reports25 from "./components/Reports25";
import Reports26 from "./components/Reports26";
import Reports27 from "./components/Reports27";
import Reports28 from "./components/Reports28";
import Reports29 from "./components/Reports29";
import Reports30 from "./components/Reports30";

import Settings from "./components/Settings";
import Menus from "./components/Menus";
import Details from "./components/Details";
import Dispatch from "./components/Dispatch"
import Asignacion from "./components/Asignacion"
import Presupuesto from "./components/Presupuesto"
import Formule from "./components/Formule";
import NewFormule from "./components/NewFormule";
import NewAsignacion from "./components/NewAsignacion";
import EditFormule from "./components/EditFormule";
import LoginAuth from "./components/loginSecondAuth/Login";
import SecondAuth from "./components/loginSecondAuth/secondAuth";
import SaveDevice from "./components/loginSecondAuth/saveDevice";
import { ElectronicFilesSri } from "./components/contabilidad/filesSri";
import { CaseManager } from "./components/garantias/caseManager/caseManager";
import { OpenCase } from "./components/garantias/openCase/openCase";
import { UpdateYear } from "./components/repuestos/updateYear";
import { SellManager } from "./components/ventas/caseManager/caseManager";
import { TransEcommerce } from "./components/ventas/transportistas";
import { UpdateImage } from "./components/repuestos/updateImages";
import { ParametrizacionModelosDespiece } from "./components/inventario/updateModelDespiece";
import { ParametrizacionModelosDespieceAnio } from "./components/inventario/updateModelDespieceYearBI";
import { CreditoDirectoManager } from "./components/ventas/approveCredit";
import { SellManagerB2B } from "./components/ventas/b2bCaseManager";
import { AdminTallerUsuarios } from "./components/garantias/adminTallerUsuarios/adminTallerUsuarios";

///SellManagerB2B
const API = process.env.REACT_APP_API;
function App() {
  const {  removeToken, setToken } = useToken();

  const [authorizedSystems, setAuthorizedSystems] = useState(['IMP', 'REP', 'GAR', 'PBI','CON', 'IN', 'FIN', 'VE', 'LOG', 'RET']);


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
                  <Route exact path="/parts" element={<Protected isLoggedIn={authorizedSystems.includes('REP')}> <UpdateYear/></Protected>}></Route>
                  <Route exact path="/parametrizacion_modelos_motos" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}> <ParametrizacionModelosDespiece/></Protected>}></Route>
                  <Route exact path="/parametrizacion_modelos_motos_anio" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}> <ParametrizacionModelosDespieceAnio/></Protected>}></Route>
                  <Route exact path="/img_parts" element={<Protected isLoggedIn={authorizedSystems.includes('REP')}> <UpdateImage/></Protected>}></Route>
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
                  <Route exact path="/fideicomiso" element={<Protected isLoggedIn={authorizedSystems.includes('FIN')}><Fideicomiso/></Protected>} />
                  <Route exact path="/negociacion" element={<Protected isLoggedIn={authorizedSystems.includes('FIN')}><Negociacion/></Protected>} />
                  <Route exact path="/asignacion" element={<Protected isLoggedIn={authorizedSystems.includes('RET')}><Asignacion/></Protected>} />
                  <Route exact path="/newAsignacion" element={<Protected isLoggedIn={authorizedSystems.includes('RET')}><NewAsignacion/></Protected>} />
                  <Route exact path="/presupuesto" element={<Protected isLoggedIn={authorizedSystems.includes('RET')}><Presupuesto/></Protected>} />
                  <Route exact path="/dispatch" element={<Protected isLoggedIn={authorizedSystems.includes('LOG')}><Dispatch/></Protected>} />
                  <Route exact path="/newNegociacion" element={<Protected isLoggedIn={authorizedSystems.includes('FIN')}><NewNegociacion/></Protected>} />
                  <Route exact path="/costumer" element={<Protected isLoggedIn={authorizedSystems.includes('FIN')}><Costumer/></Protected>} />
                  <Route exact path="/editCabecera" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}><EditCabecera/></Protected>} />
                  <Route exact path="/newFormule" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}><NewFormule/></Protected>} />
                  <Route exact path="/EditFormule" element={<Protected isLoggedIn={authorizedSystems.includes('IN')}><EditFormule/></Protected>} />
                  <Route exact path="/reports" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports /></Protected>} />
                  <Route exact path="/reports2" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports2 /></Protected>} />
                  <Route exact path="/reports3" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports3/></Protected>} />
                  <Route exact path="/reports4" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports4 /></Protected>}/>
                  <Route exact path="/reports5" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports5 /></Protected>}/>
                  <Route exact path="/reports6" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports6 /></Protected>}/>
                  <Route exact path="/reports7" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports7 /></Protected>}/>
                  <Route exact path="/reports8" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports8 /></Protected>}/>
                  <Route exact path="/reports9" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports9 /></Protected>}/>
                  <Route exact path="/reports10" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports10 /></Protected>}/>
                  <Route exact path="/reports11" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports11 /></Protected>}/>
                  <Route exact path="/reports12" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports12 /></Protected>}/>
                  <Route exact path="/reports13" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports13 /></Protected>}/>
                  <Route exact path="/reports14" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports14 /></Protected>}/>
                  <Route exact path="/reports15" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports15 /></Protected>}/>
                  <Route exact path="/reports16" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports16 /></Protected>}/>
                  <Route exact path="/reports17" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports17 /></Protected>}/>
                  <Route exact path="/reports18" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports18 /></Protected>}/>
                  <Route exact path="/reports19" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports19 /></Protected>}/>
                  <Route exact path="/reports20" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports20 /></Protected>}/>
                  <Route exact path="/reports21" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports21 /></Protected>}/>
                  <Route exact path="/reports22" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports22 /></Protected>}/>
                  <Route exact path="/reports23" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports23 /></Protected>}/>
                  <Route exact path="/reports24" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports24 /></Protected>}/>
                  <Route exact path="/reports25" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports25 /></Protected>}/>
                  <Route exact path="/reports26" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports26 /></Protected>}/>
                  <Route exact path="/reports27" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports27 /></Protected>}/>
                  <Route exact path="/reports28" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports28 /></Protected>}/>
                  <Route exact path="/reports29" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports29 /></Protected>}/>
                  <Route exact path="/reports30" element={<Protected isLoggedIn={authorizedSystems.includes('PBI')}><Reports30 /></Protected>}/>

                  <Route exact path="/electronicFile" element={<Protected isLoggedIn={authorizedSystems.includes('CON')}><ElectronicFilesSri/></Protected>}/>
                  <Route exact path="/warranty" element={<Protected isLoggedIn={authorizedSystems.includes('GAR')}><CaseManager/></Protected>}/>
                  <Route exact path="/warranty/openCaseWarranty" element={<Protected isLoggedIn={authorizedSystems.includes('GAR')}><OpenCase/></Protected>}/>
                  <Route exacth path="/warranty/manageAdministradorTaller" element={<Protected isLoggedIn={authorizedSystems.includes('GAR')}><AdminTallerUsuarios/></Protected>}/>
                  <Route exact path="/invoice" element={<Protected isLoggedIn={authorizedSystems.includes('VE')}><SellManager/></Protected>}/>
                  <Route exact path="/transEcommerce" element={<Protected isLoggedIn={authorizedSystems.includes('VE')}><TransEcommerce/></Protected>}/>
                  <Route exact path="/approve_credit" element={<Protected isLoggedIn={authorizedSystems.includes('VE')}><CreditoDirectoManager/></Protected>}/>
                  <Route exact path="/invoice_b2b" element={<Protected isLoggedIn={authorizedSystems.includes('VE')}><SellManagerB2B/></Protected>}/>
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