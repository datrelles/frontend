import LinearProgress from '@mui/material/LinearProgress';

class Functions {

    static NumericRender(value) {
      const numericValue = parseFloat(value);
      const formattedValue = !isNaN(numericValue) ? numericValue.toFixed(2) : '0.00';
      return (
        <div style={{ textAlign: "right" }}>
          {formattedValue}
        </div>
      );
    }

    static IntRender(value) {
      return (
        <div style={{ textAlign: "right" }}>
          {value}
        </div>
      );
    }

    static StatusRender(value, statusListPo) {
      const progress = parseInt(value * 100 / (statusListPo.length - 1), 10);
      let name = '';
      if (statusListPo.find((objeto) => objeto.cod === value)) {
        name = statusListPo.find((objeto) => objeto.cod === value).nombre
      }
      const backgroundColor = getBackgroundColor(progress);
      return (
        <div>
          <LinearProgress
            sx={{
              backgroundColor: 'silver',
              '& .MuiLinearProgress-bar': {
                backgroundColor: backgroundColor
              }
            }}
            variant="determinate" value={progress} />
          <span>{name}</span>
        </div>
      );
    }

    static customFilterLogic(statusListPo) {
      return function(status, filterVal) {
          if (filterVal.length === 0) {
              return false;
          }
          const selectedCodes = statusListPo
              .filter(state => filterVal.indexOf(state.nombre) !== -1) 
              .map(state => state.cod);
          const show = selectedCodes.indexOf(status) === -1;
          return show;
      };
  }

  }

  function getBackgroundColor(progress) {
    if (progress <= 20) {
        return "#FF3F33";
    } else if (progress <= 40) {
        return "#FF9333";
    } else if (progress <= 60) {
        return "#F0FF33";
    } else if (progress <= 80) {
        return "#ACFF33";
    } else if (progress <= 100) {
        return "#33FF39";
    } else
        return "silver"
}

  
  
  export default Functions;