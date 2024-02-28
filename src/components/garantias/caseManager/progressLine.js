import React from 'react';

export const ProgressBar = ({ percentage }) => {
  // Determinar el color basado en el porcentaje
  let color = '';
  const numericPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  if (numericPercentage  <= 25) {
    color = 'red';
  }else if (numericPercentage  == undefined) {
    color = 'red';
  } else if (numericPercentage  <= 50) {
    color = 'orange';
  } else if (numericPercentage <= 75) {
    color = 'yellow';
  } else if (numericPercentage  <= 95) {
    color = 'blue';
  } else {
    color = 'green';
  }

  // Estilo dinámico para la barra de progreso
  const progressStyle = {
    width: numericPercentage === 0 || numericPercentage === undefined ? '100%' : `${numericPercentage}%`,
    backgroundColor: color,
    height: '5px',
    transition: 'width 0.5s ease',
    borderRadius: '2px',
  };

  return (
    <div>
      <div style={progressStyle}></div>
      <span>{numericPercentage===undefined?'0':numericPercentage}%</span>
    </div>
  );
};

