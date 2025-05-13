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

export const TiposFactor = {
  PARAMETRO: new Enum("PAR", "PARÁMETRO"),
  VALOR: new Enum("VAL", "VALOR FIJO"),
  OPERADOR: new Enum("OPE", "OPERADOR"),
};

export const Operadores = {
  SUMA: new Enum("+"),
  RESTA: new Enum("-"),
  MULTIPLICACION: new Enum("*"),
  DIVISION: new Enum("/"),
};

export const TiposRetorno = {
  NUMBER: new Enum("NUMBER"),
  VARCHAR: new Enum("VARCHAR2"),
};

export const DefaultTipoRetorno = TiposRetorno.NUMBER.key;

export const TiposParametro = {
  VARIABLE: new Enum("VARIABLE"),
  CARACTER: new Enum("CARACTER"),
  NUMERO: new Enum("NUMERO", "NÚMERO"),
};

export const DefaultTipoParametro = TiposParametro.VARIABLE.key;

export const TiposSeleccionTabla = {
  MULTIPLE: new Enum("multiple"),
  SINGLE: new Enum("single"),
  NONE: new Enum("none"),
};

export const ColoresFondo = {
  SUCCESS: new Enum("bg-success"),
  DANGER: new Enum("bg-danger"),
  WARNING: new Enum("bg-warning"),
  INFO: new Enum("bg-info"),
  PRIMARY: new Enum("bg-primary"),
  SECONDARY: new Enum("bg-secondary"),
  LIGHT: new Enum("bg-light"),
  DARK: new Enum("bg-dark"),
};

export const CaracteresFormula = {
  NUMERO: new Enum("#"),
  FUNCION: new Enum("&"),
  PARAMETRO: new Enum("$"),
  FORMULA: new Enum("@"),
};
