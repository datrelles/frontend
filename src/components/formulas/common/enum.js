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
  NUMERO: new Enum("NUM", "NÚMERO"),
  TEXTO: new Enum("TEX", "TEXTO"),
  FECHA: new Enum("FEC", "FECHA"),
};

export const DefaultTipoRetorno = TiposRetorno.NUMERO.key;

export const TiposParametro = {
  NUMERO: new Enum("NUM", "NÚMERO"),
  TEXTO: new Enum("TEX", "TEXTO"),
  VARIABLE: new Enum("VAR", "VARIABLE"),
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
