import {Card} from "./types";


export const SORTED_DECK = createDeck();


export function createDeck() {
  const cardsDeck: Card[] = [];

  for (let suit = 0; suit < 4; suit++) {
    for (let value = 0; value < 13; value++) {
      const card: Card = {suit, value}
      cardsDeck.push(card);
    }
  }

  return cardsDeck;
}


export function sortCards(cards: Card[]): Card[] {
  cards.sort((a, b) => b.value - a.value)
  return cards
}

export function randomCardsGetter() {
  const shuffledDeck = shuffled(SORTED_DECK);
  return (count: number): Card[] => {
    const res = [];
    for (let i=0; i<count; i++)
      res.push(shuffledDeck.pop()!)
    return res;
  }
}

function shuffled(list: any[]) {
  const listCopy = [...list];
  const result = [];
  while (listCopy.length > 0) {
    const elemIndex = randomInt(listCopy.length);
    result.push(listCopy[elemIndex])
    listCopy[elemIndex] = listCopy[listCopy.length - 1]
    listCopy.pop()
  }
  return result;
}


function randomInt(max: number) {
  return Math.floor(Math.random() * max)
}
