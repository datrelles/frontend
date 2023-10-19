import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EngineeringIcon from '@mui/icons-material/Engineering';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
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
    1: <EditNoteIcon />,
    2: <ForwardToInboxIcon />,
    3: <RequestQuoteIcon />,
    4: <PriceCheckIcon />,
    5: <ReceiptIcon />,
    6: <EngineeringIcon />,
    7: <DirectionsBoatIcon />,
    8: <CheckCircleOutlineIcon />,
    9: <HighlightOffIcon />
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

export default function TrackingStepOrder(value, steps, dates) {
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

