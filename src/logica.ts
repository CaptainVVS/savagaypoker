const ROYAL_VALUES_SET = new Set([12, 11, 10, 9, 8])


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


export interface Card {
  suit: number;
  value: number;
}


export function findCombination(cards7: Card[]) {
  const flush = findFlush(cards7)
  const straight = findStraight(cards7)
  const { quad, set, pairs } = getQuadsSetAndPairs(cards7)

  // flush royal
  if (flush) {
    const royalCards = flush.filter((card) => ROYAL_VALUES_SET.has(card.value))

    if (royalCards.length === 5) {
      return {
        combination: Combinations.FlashRoyal,
        cards: royalCards
      }
    }
  }

  // straight flush
  if (flush) {
    const straightFlushes = findStraight(flush)
    if (straightFlushes) {
      return {
        combination: Combinations.StraightFlush,
        cards: straightFlushes
      }
    }
  }

  // quads
  if (quad) {
    return {
      combination: Combinations.Quads,
      cards: takeUpTo5(quad, cards7)
    }
  }

  // full house
  if (set && pairs[0]) {
    const cards = [...set, ...pairs[0]]
    return {
      combination: Combinations.FullHouse,
      cards: cards.slice(0, 5)
    }
  }

  // flush
  if (flush) {
    return {
      combination: Combinations.Flush,
      cards: flush.slice(0, 5)
    }
  }

  // straight
  if (straight) {
    return {
      combination: Combinations.Straight,
      cards: straight.slice(0, 5)
    }
  }

  // set
  if (set) {
    return {
      combination: Combinations.Set,
      cards: takeUpTo5(set, cards7)
    }
  }

  // two pairs
  if (pairs.length >= 2) {
    const cards = [...pairs[0], ...pairs[1]]
    return {
      combination: Combinations.TwoPairs,
      cards: takeUpTo5(cards, cards7)
    }
  }

  // pair
  if (pairs[0]) {
    return {
      combination: Combinations.Pair,
      cards: takeUpTo5(pairs[0], cards7)
    }
  }

  // higher card
  return {
    combination: Combinations.GreaterCard,
    cards: takeUpTo5([], cards7)
  }

}


function findStraight(cards7: Card[]) {
  const cardsMappedByValue: Map<number, Card> = new Map();

  for (const card of cards7) {
    cardsMappedByValue.set(card.value, card)
    if (card.value === 12)
      cardsMappedByValue.set(-1, card)
  }

  const cardValues = [...cardsMappedByValue.keys()];
  cardValues.sort((a, b) => b - a);

  const straight = find5StraightValues(cardValues);

  if (straight.length === 0)
    return undefined;

  return straight.map((key) => cardsMappedByValue.get(key)!)
}

function find5StraightValues(cardValues: number[]) {
  let startIndex = 0

  for (let i = 1; i <= cardValues.length; i++) {
    if (cardValues[i] + 1 !== cardValues[i - 1]) {
      startIndex = i
      continue;
    }

    if (i === startIndex + 5)  // straight!
      return cardValues.slice(startIndex, i)

  }
  return [];
}

function findFlush(cards7: Card[]) {
  // different buckets for different card suits
  // card.suit => Card[]
  //"♣", "♦", "♥", "♠"

  const cardsBuckets = groupBy(cards7, (card) => card.suit);

  for (const bucket of cardsBuckets)
    if (bucket.length >= 5)
      return bucket
}


function getQuadsSetAndPairs(cards7: Card[]) {
  // different buckets for different card values
  // card.value => Card[]

  const cardsBuckets = groupBy(cards7, (card) => card.value)
    .reverse();

  const quad = cardsBuckets.find((bucket) => bucket.length === 4)
  const set = cardsBuckets.find((bucket) => bucket.length === 3)
  const pairs = cardsBuckets.filter((bucket) => bucket.length === 2)

  return { quad, set, pairs }
}

function groupBy(cards7: Card[], bucketIndexFunc: (card: Card) => number) {
  const cardsBuckets: (Card[])[] = [];

  for (const card of cards7) {
    const bucketIndex = bucketIndexFunc(card);

    if (cardsBuckets[bucketIndex] === undefined)
      cardsBuckets[bucketIndex] = []

    cardsBuckets[bucketIndex].push(card)
  }

  return cardsBuckets.filter((bucket) => bucket);
}


function takeUpTo5(combination: Card[], cards7: Card[]) {
  const combinationSet = new Set(combination)
  const difference = cards7.filter((x) => !combinationSet.has(x));
  difference.sort(
    (a, b) => b.value - a.value
  )

  const howMuchToAdd = 5 - combination.length
  return [
    ...combination,
    ...difference.slice(0, howMuchToAdd)
  ]
}


export function createDeck() {
  const cardsDeck: Card[] = [];

  for (let suit = 0; suit < 4; suit++)
    for (let value = 0; value < 13; value++) {
      const card: Card = { suit, value }
      cardsDeck.push(card);
    }

  shuffle(cardsDeck)
  shuffle(cardsDeck)
  shuffle(cardsDeck)
  shuffle(cardsDeck)

  return cardsDeck;
}


function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
