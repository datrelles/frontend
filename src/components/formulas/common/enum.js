const createKeyValue = (key, label = key) => ({
  key,
  label,
});

export const insertProp = (object, key, value) => ({
  ...object,
  [key]: value,
});

export const tiposOperadores = {
  PARAMETRO: createKeyValue("PAR", "PARÁMETRO"),
  VALOR: createKeyValue("VAL", "VALOR FIJO"),
  OPERADOR: createKeyValue("OPE", "OPERADOR"),
};

export const operadores = {
  SUMA: createKeyValue("+"),
  RESTA: createKeyValue("-"),
  MULTIPLICACION: createKeyValue("*"),
  DIVISION: createKeyValue("/"),
};

export const tiposRetorno = {
  NUMBER: createKeyValue("NUMBER"),
  VARCHAR: createKeyValue("VARCHAR2"),
};

export const defaultTipoRetorno = tiposRetorno.NUMBER.key;

export const tiposParametro = {
  VARIABLE: createKeyValue("VARIABLE"),
  CARACTER: createKeyValue("CARACTER"),
  NUMERO: createKeyValue("NUMERO", "NÚMERO"),
};

export const defaultTipoParametro = tiposParametro.VARIABLE.key;
