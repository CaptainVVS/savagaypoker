import {Card, Combination, Combinations} from "./types";
import {sortCards} from "./utils";

const ROYAL_VALUES_SET = new Set([12, 11, 10, 9, 8])


export function getCombination(cards7: Card[]): Combination {
  const flush = findFlush(cards7)
  const straight = findStraight(cards7)
  const {quad, set, pairs} = getQuadsSetAndPairs(cards7)

  // flush royal
  if (flush) {
    const royalCards = flush.filter((card) => ROYAL_VALUES_SET.has(card.value))

    if (royalCards.length === 5) {
      return createCombination(Combinations.FlashRoyal, royalCards)
    }
  }

  // straight flush
  if (flush) {
    const straightFlushes = findStraight(flush)
    if (straightFlushes) {
      return createCombination(Combinations.StraightFlush, straightFlushes)
    }
  }

  // quads
  if (quad) {
    return createCombination(Combinations.Quads, takeUpTo5(quad, cards7))
  }

  // full house
  if (set && pairs[0]) {
    const cards = sortCards([...set, ...pairs[0]]);
    return createCombination(Combinations.FullHouse, cards)
  }

  // flush
  if (flush) {
    return createCombination(Combinations.Flush, flush.slice(0, 5))
  }

  // straight
  if (straight) {
    return createCombination(Combinations.Straight, straight)
  }

  // set
  if (set) {
    return createCombination(Combinations.Set, takeUpTo5(set, cards7))
  }

  // two pairs
  if (pairs.length >= 2) {
    const cards = [...pairs[0], ...pairs[1]]
    return createCombination(Combinations.TwoPairs, takeUpTo5(cards, cards7))
  }

  // pair
  if (pairs[0]) {
    return createCombination(Combinations.Pair, takeUpTo5(pairs[0], cards7))
  }

  // higher card
  return createCombination(Combinations.GreaterCard, takeUpTo5([], cards7))

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

  const straightValues = find5StraightValues(cardValues);

  if (straightValues.length === 0)
    return undefined;

  const straightCards = straightValues.map((key) => cardsMappedByValue.get(key)!)
  return straightCards.slice(0, 5);
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
      return sortCards(bucket)

}


function getQuadsSetAndPairs(cards7: Card[]) {
  // different buckets for different card values
  // card.value => Card[]

  const cardsBuckets = groupBy(cards7, (card) => card.value)
    .reverse();

  const quad = cardsBuckets.find((bucket) => bucket.length === 4)
  const set = cardsBuckets.find((bucket) => bucket.length === 3)
  const pairs = cardsBuckets.filter((bucket) => bucket.length === 2)

  // sort pairs array descending
  pairs.sort((a, b) => b[0].value - a[0].value)

  return {quad, set, pairs}
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


function createCombination(combination: Combinations, cards: Card[]): Combination {
  if (cards.length !== 5) throw new Error("not 5 cards combination")
  const score = calcCombinationScore(combination, cards);
  return {combination, cards, score}
}


function calcCombinationScore(combination: Combinations, cards: Card[]) {
  const cardValues = cards.map(card => card.value)

  return [combination, ...cardValues]
    .reverse()
    .reduce(
      (acc, e, i) => acc + e * 12 ** i,
      0
    )
}
