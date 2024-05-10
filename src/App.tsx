import React from 'react';
import './App.css';
import { Card, Combinations, createDeck, findCombination } from "./logica";


const CARD_SUITS = ["♣", "♦", "♥", "♠"];
const CARD_VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
// 0="2", ..., 9="J", 10="Q", 11="K", 12="A"

function App() {

  let combination;
  let desk: Card[] = [];
  let hand: Card[] = [];


  const cardsDeck = createDeck();


  desk = [cardsDeck.pop()!, cardsDeck.pop()!, cardsDeck.pop()!, cardsDeck.pop()!, cardsDeck.pop()!,]
  hand = [cardsDeck.pop()!, cardsDeck.pop()!]

  combination = findCombination([...desk, ...hand])


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


export default App;
