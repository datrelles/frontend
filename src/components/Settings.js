import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Navbar0 from "./Navbar0";
import { styled } from '@mui/system';
import { useState, useEffect } from "react";



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const StyledTab = styled(Tab)(({ theme }) => ({
  backgroundColor: 'firebrick',
  color: 'white',
  height: 90,
  width: 200,
  '&:hover': {
    backgroundColor: 'darkred',
  },
  '&.Mui-selected': {
    color: 'black',
  },
}));

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);
  const [menus, setMenus] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ marginTop: '150px'}}>
      <Navbar0 menus={menus}/>
      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', maxHeight: '100%' }}
      >
        <Tabs
          orientation="vertical"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tab"
          sx={{ borderRight: 2, borderColor: 'divider' }}
        >
          <StyledTab label="Usuario" {...a11yProps(0)} />
          <StyledTab label="opcion 2" {...a11yProps(1)} />
          <StyledTab label="opcion 3" {...a11yProps(2)} />
          <StyledTab label="opcion 4" {...a11yProps(3)} />
          <StyledTab label="opcion 5" {...a11yProps(4)} />
          <StyledTab label="opcion 6" {...a11yProps(5)} />

        </Tabs>
        <TabPanel value={value} index={0}>
          Item
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>
        <TabPanel value={value} index={3}>
          Item Four
        </TabPanel>
        <TabPanel value={value} index={4}>
          Item Five
        </TabPanel>
        <TabPanel value={value} index={5}>
          Item Six
        </TabPanel>
      </Box>
    </div>
  );
}