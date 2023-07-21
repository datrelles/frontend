import Navbar0 from "./Navbar0";
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import React, { useState, useEffect} from "react";
import { Link, useLocation } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@mui/material/LinearProgress';


import { SnackbarProvider, useSnackbar } from 'notistack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format } from 'date-fns'
import moment from "moment";

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

const API = process.env.REACT_APP_API;

function Menus(props) {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [fromDate, setFromDate] = useState(moment().subtract(3,"months"));
  const [toDate, setToDate] = useState(moment);
  const [statusList, setStatusList] = useState([])
  const [menus, setMenus] = useState([])
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sistemaValue = queryParams.get('sistema');




  const getMenus = async () => {
    try {
      const res = await fetch(`${API}/menus/${sessionStorage.getItem('currentUser')}/${sessionStorage.getItem('currentEnterprise')}/${sistemaValue}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + props.token
          }
        });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sesión caducada.');
        }
      } else {
        const data = await res.json();
        setMenus(data)
        console.log(data)
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    getMenus();
  }, [])



  return (
    <SnackbarProvider>
      <div>
        <Navbar0 menus={menus}/>
      </div>
    </SnackbarProvider>
  )
}

export default Menus