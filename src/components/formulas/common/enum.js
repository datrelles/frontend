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

  static getLabel(obj, key) {
    return this.values(obj).find((item) => item.key === key)?.label ?? "N/A";
  }
}

export const TiposFactor = {
  PARAMETRO: new Enum("PAR", "PARÁMETRO"),
  VALOR: new Enum("NUM", "NÚMERO"),
  OPERADOR: new Enum("OPE", "OPERADOR"),
};

export const Operadores = {
  SUMA: new Enum("+"),
  RESTA: new Enum("-"),
  MULTIPLICACION: new Enum("*"),
  DIVISION: new Enum("/"),
};

export const PaquetesBD = {
  FORMULAS: new Enum("PK_FORMULAS", "FÓRMULAS"),
};

export const DefaultPaqueteBD = PaquetesBD.FORMULAS.key;

export const ColoresHex = {
  VERDE: new Enum("4CAF50", "VERDE"),
  AMARILLO: new Enum("FFEB3B", "AMARILLO"),
  ROJO: new Enum("F44336", "ROJO"),
  AZUL: new Enum("2196F3", "AZUL"),
  GRIS: new Enum("9E9E9E", "GRIS"),
  NARANJA: new Enum("FF9800", "NARANJA"),
  CIAN: new Enum("00BCD4", "CIAN"),
  MORADO: new Enum("9C27B0", "MORADO"),
  ROSA: new Enum("E91E63", "ROSA"),
  MENTA: new Enum("8BC34A", "MENTA"),
  AZUL_OSCURO: new Enum("3F51B5", "AZUL OSCURO"),
  CAFE: new Enum("795548", "CAFE"),
};

export const DefaultColorHex = ColoresHex.GRIS;

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

export const DefaultTipoParametro = TiposParametro.NUMERO.key;

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
