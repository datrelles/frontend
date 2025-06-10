export function customFilterLogic(statusList) {
    return (value, filter) => {
      const estado = statusList.find(item => item.nombre === filter);
      return estado ? value === estado.cod : false;
    };
  }
  
  export function NumericRender(value) {
    return Number(value).toLocaleString("es-EC", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  