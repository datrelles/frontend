import React from 'react';
import { useDrop } from 'react-dnd';

const DroppableArea = ({ onDrop, children, areaName }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ITEM',
    drop: (item) => onDrop(item, areaName),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isOver ? '#f0f0f0' : '#fff',
        border: canDrop ? '2px solid #b22222' : '',
        minHeight: '150px',
        padding: '0px',
        position: 'relative',
        borderRadius:'10px',
        marginLeft: '2vw'
      }}
    >
      {children}
    </div>
  );
};

export default DroppableArea;