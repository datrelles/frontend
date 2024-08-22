export const ProcessData = (data) => {
    let result = {
        id: 'root',
        name: 'MODELOS DESPIECE',
        children: [],
      };
    
      for (let brand in data) {
        let brandObj = {
          id: brand,
          name: brand,
          children: [],
        };
    
        for (let model in data[brand]) {
          let modelObj = {
            id: model,
            name: model,
            children: [],
          };
    
          let components        = data[brand][model];
    
          let componentArray = Object.keys(components).map((key) => ({

            id: key,
            name: key,
            children: components[key],
          }));
    
          modelObj.children = componentArray;
    
          brandObj.children.push(modelObj);
        }
    
        result.children.push(brandObj);
      }
    
      return result;
  };
  
  // Tu data original

  
  // Transformar la data
  //const transformedData = processData(originalData);
  //console.log(transformedData);
  