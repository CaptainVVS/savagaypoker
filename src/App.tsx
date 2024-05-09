import React from 'react';
import './App.css';


const CARD_SUITS = ["♣", "♦", "♥", "♠"];
const CARD_VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

//9=J,10=Q,11=K,12=A

const ROYAL_VALUES_SET = new Set([12, 11, 10, 9, 8])


enum Combinations {
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


interface Card {
  suit: number;
  value: number;
}


function App() {

  let combination;
  let desk: Card[] = [];
  let hand: Card[] = [];


  const cardsDeck = createDeck();


  desk = [cardsDeck.pop()!, cardsDeck.pop()!, cardsDeck.pop()!, cardsDeck.pop()!, cardsDeck.pop()!,]
  hand = [cardsDeck.pop()!, cardsDeck.pop()!]

  combination = findCombination([...desk, ...hand])



  function CardsHTML({cards}: {cards: Card[]}) {
    return <div className={"cards"}>
      {cards.map((card, i) =>
          <CardHTML key={i} card={card}/>
      )}
    </div>
  }

  function CardHTML({card}: { card: Card }) {
    return <div className={`suit-${card.suit} card`}>
      {CARD_SUITS[card.suit]}
      {CARD_VALUES[card.value]}
    </div>
  }

  return (
    <div className="App">
      <CardsHTML cards={desk}/>
      <hr/>
      <CardsHTML cards={hand}/>
      <hr/>
      <div className={"combinationName"}>{Combinations[combination.combination]}</div>
      <br/>
      <CardsHTML cards={combination.cards}/>
    </div>
  );
}

function findCombination(cards7: Card[]) {
  const flush = findFlush(cards7)
  const straight = findStraight(cards7)
  const {quad, set, pairs} = getQuadsSetAndPairs(cards7)

  // todo flush royal
  if (flush) {
    const royalCards = flush.filter((card) => ROYAL_VALUES_SET.has(card.value))

    if (royalCards.length === 5) {
      return {
        combination: Combinations.FlashRoyal,
        cards: royalCards
      }
    }
  }


  // todo straight flush
  if (flush) {
    const straightFlushes = findStraight(flush)
    if (straightFlushes) {
      return {
        combination: Combinations.StraightFlush,
        cards: straightFlushes
      }
    }
  }

  // todo quads
  if (quad) {
    return {
      combination: Combinations.Quads,
      cards: takeUpTo5(quad, cards7)
    }
  }


  // todo full house
  if (set && pairs[0]) {
    const cards = [...set, ...pairs[0]]
    return {
      combination: Combinations.FullHouse,
      cards: cards.slice(0, 5)
    }
  }

  // todo flush
  if (flush) {
    return {
      combination: Combinations.Flush,
      cards: flush.slice(0, 5)
    }
  }

  // todo straight
  if (straight) {
    return {
      combination: Combinations.Straight,
      cards: straight.slice(0, 5)
    }
  }
  // todo set
  if (set) {
    return {
      combination: Combinations.Set,
      cards: takeUpTo5(set, cards7)
    }
  }

  // todo two pairs
  if (pairs.length >= 2) {
    const cards = [...pairs[0], ...pairs[1]]
    return {
      combination: Combinations.TwoPairs,
      cards: takeUpTo5(cards, cards7)
    }
  }

  // todo pair
  if (pairs[0]) {
    return {
      combination: Combinations.Pair,
      cards: takeUpTo5(pairs[0], cards7)
    }
  }

  // todo higher card
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

  const straight = find5StraightValues(cardValues);

  const straightCards = straight.map(
    (key) => cardsMappedByValue.get(key)!
  )

  return straightCards.length === 0 ? undefined : straightCards;

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


function createDeck() {
  const cardsDeck: Card[] = [];

  for (let suit = 0; suit < CARD_SUITS.length; suit++)
    for (let value = 0; value < CARD_VALUES.length; value++) {
      const card: Card = {suit, value}
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


export default App;
