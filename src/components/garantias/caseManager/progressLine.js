import React from 'react';

export const ProgressBar = ({ percentage }) => {
  // Determinar el color basado en el porcentaje
  let color = '';
  if (percentage <= 25) {
    color = 'red';
  } else if (percentage <= 50) {
    color = 'orange';
  } else if (percentage <= 75) {
    color = 'yellow';
  } else if (percentage <= 95) {
    color = 'blue';
  } else {
    color = 'green';
  }

  // Estilo dinámico para la barra de progreso
  const progressStyle = {
    width: `${percentage}%`,
    backgroundColor: color,
    height: '5px',
    transition: 'width 0.5s ease',
    borderRadius: '2px',
  };

  return (
    <div>
      <div style={progressStyle}></div>
      <span>{percentage}%</span>
    </div>
  );
};

