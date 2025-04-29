export class Enum {
  constructor(key, label = key) {
    this.key = key;
    this.label = label;
  }

  addProp(key, value) {
    this[key] = value;
    return this;
  }

  static values(obj) {
    return Object.values(obj).filter((item) => item instanceof Enum);
  }
}

export const tiposOperador = {
  PARAMETRO: new Enum("PAR", "PARÁMETRO"),
  VALOR: new Enum("VAL", "VALOR FIJO"),
  OPERADOR: new Enum("OPE", "OPERADOR"),
};

export const operadores = {
  SUMA: new Enum("+"),
  RESTA: new Enum("-"),
  MULTIPLICACION: new Enum("*"),
  DIVISION: new Enum("/"),
};

export const tiposRetorno = {
  NUMBER: new Enum("NUMBER"),
  VARCHAR: new Enum("VARCHAR2"),
};

export const defaultTipoRetorno = tiposRetorno.NUMBER.key;

export const tiposParametro = {
  VARIABLE: new Enum("VARIABLE"),
  CARACTER: new Enum("CARACTER"),
  NUMERO: new Enum("NUMERO", "NÚMERO"),
};

export const defaultTipoParametro = tiposParametro.VARIABLE.key;

export const tiposSeleccionTabla = {
  MULTIPLE: new Enum("multiple"),
  SINGLE: new Enum("single"),
  NONE: new Enum("none"),
};
