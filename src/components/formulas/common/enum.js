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
  PROCESOS: new Enum("PK_PROCESOS", "PROCESOS"),
};

export const DefaultPaqueteBD = PaquetesBD.PROCESOS.key;

export const ColoresHex = {
  GRIS: new Enum("c6c6c6", "GRIS"),
  VERDE: new Enum("a0ff7f", "VERDE"),
  MENTA: new Enum("9fffbc", "MENTA"),
  ROJO: new Enum("ff907f", "ROJO"),
  ROSA: new Enum("ff80ab", "ROSA"),
  AMARILLO: new Enum("fdfc80", "AMARILLO"),
  NARANJA: new Enum("ffad68", "NARANJA"),
  DURAZNO: new Enum("ffcf91", "DURAZNO"),
  AZUL: new Enum("2196F3", "AZUL"),
  CELESTE: new Enum("99f3ff", "CELESTE"),
  MORADO: new Enum("f098ff", "MORADO"),
  CAFE: new Enum("b58e80", "CAFE"),
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

export const Meses = {
  ENERO: new Enum("1", "ENERO"),
  FEBRERO: new Enum("2", "FEBRERO"),
  MARZO: new Enum("3", "MARZO"),
  ABRIL: new Enum("4", "ABRIL"),
  MAYO: new Enum("5", "MAYO"),
  JUNIO: new Enum("6", "JUNIO"),
  JULIO: new Enum("7", "JULIO"),
  AGOSTO: new Enum("8", "AGOSTO"),
  SEPTIEMBRE: new Enum("9", "SEPTIEMBRE"),
  OCTUBRE: new Enum("10", "OCTUBRE"),
  NOVIEMBRE: new Enum("11", "NOVIEMBRE"),
  DICIEMBRE: new Enum("12", "DICIEMBRE"),
};

export const MesesProyeccion = {
  "12_MESES": new Enum("12", "12 MESES"),
  "24_MESES": new Enum("24", "24 MESES"),
  "36_MESES": new Enum("36", "36 MESES"),
  "48_MESES": new Enum("48", "48 MESES"),
};

export const DefaultMesesProyeccion = MesesProyeccion["12_MESES"].key;

export const ModelosCliente = {
  CLI1: new Enum("CLI1"),
};

export const DefaultModeloCliente = ModelosCliente.CLI1.key;

export const FormasPago = {
  CRE: new Enum("CRE", "CRÉDITO"),
  EFE: new Enum("EFE", "EFECTIVO"),
};

export const DefaultFormaPago = FormasPago.EFE.key;

export const CuotasPedido = {
  1: new Enum("1"),
  2: new Enum("2"),
  3: new Enum("3"),
  4: new Enum("4"),
  5: new Enum("5"),
  6: new Enum("6"),
  7: new Enum("7"),
  8: new Enum("8"),
  9: new Enum("9"),
  10: new Enum("10"),
};

export const CARACTER_RELLENO = "-";
