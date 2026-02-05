export type CurrencyValue = 0.01 | 0.02 | 0.05 | 0.1 | 0.2 | 0.5 | 1 | 2;

export interface Coin {
  id: string;
  value: CurrencyValue;
  x: number;
  y: number;
}

export interface Level {
  id: number;
  title: string;
  instruction: string;
  targetAmount: number;
  allowedCoins: CurrencyValue[];
  pacoMessage: string;
  concept: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'El Efectivo',
    instruction: 'Recoge las monedas exactas de la mesa.',
    targetAmount: 3,
    allowedCoins: [1, 2],
    pacoMessage: '¡Cuac! La nutria nos debe 3.00€ por el alquiler del nido. ¿Puedes contar el dinero?',
    concept: 'Contar monedas de 1€ y 2€'
  },
  {
    id: 2,
    title: 'Los Céntimos',
    instruction: 'Suma los decimales para llegar al total.',
    targetAmount: 0.70,
    allowedCoins: [0.5, 0.2, 0.1, 0.05],
    pacoMessage: '¡Interesante! Algunos clientes pagan con calderilla. Necesitamos 0.70€.',
    concept: 'Introducción de decimales'
  },
  {
    id: 3,
    title: 'Activo vs. Pasivo',
    instruction: 'Identifica los ingresos y gastos.',
    targetAmount: 5.00, // Balance goal
    allowedCoins: [1, 2, 0.5],
    pacoMessage: '¡Cuidado! Ese gasto es un pasivo, resta de tu caja. Separa las ganancias.',
    concept: 'Diferenciar Ingresos (+) de Gastos (-)'
  },
  {
    id: 4,
    title: 'El Balance',
    instruction: 'Calcula el saldo neto del día.',
    targetAmount: 2.50,
    allowedCoins: [1, 0.5, 0.2, 0.1],
    pacoMessage: '¿Hemos ganado o perdido hoy? Calcula el saldo final.',
    concept: 'Ingresos - Gastos = Saldo'
  }
];
