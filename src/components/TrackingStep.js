import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import HouseboatIcon from '@mui/icons-material/Houseboat';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #1c0101, #e71106fa, #d8363a)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #1c0101, #e71106fa, #d8363a)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      'linear-gradient(95deg, #e71106fa, #d8363a)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient(95deg, #e71106fa, #79181a, #1c0101)',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <DirectionsBoatIcon />,
    2: <HouseboatIcon/>,
    3: <AssuredWorkloadIcon />,
    4: <DepartureBoardIcon/>,
    5: <WarehouseIcon/>
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {

  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.node,
};

export default function TrackingStep(value, steps, dates) {
  return (
    <Stack sx={{ width: '100%' }} spacing={4} marginBottom={'15px'}>
    <Stepper alternativeLabel activeStep={value} connector={<ColorlibConnector />}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel StepIconComponent={ColorlibStepIcon}>
            {label}
          </StepLabel>
          <div style={{ textAlign: 'center'}}>
            {dates[index]}
          </div>
        </Step>
      ))}
    </Stepper>
  </Stack>
  );
}