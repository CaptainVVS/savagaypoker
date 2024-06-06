export interface Card {
  suit: number;
  value: number;
}

export enum Combinations {
  GreaterCard,
  Pair,
  TwoPairs,
  Set,
  Straight,
  Flush,
  FullHouse,
  Quads,
  StraightFlush,
  FlashRoyal,
}


export interface Combination {
  combination: Combinations;
  cards: Card[];
  score: number;
}
