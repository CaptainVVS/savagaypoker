import {Card} from "../backend/types";
import React from "react";


const CARD_SUITS = ["♣", "♦", "♥", "♠"];
const CARD_VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
// 0="2", ..., 9="J", 10="Q", 11="K", 12="A"



export function CardsHTML({cards, isHidden}: { cards: Card[], isHidden?: boolean }) {
  return <div className={"cards"}>
    {cards.map((card, i) =>
        (isHidden) ?
          <HiddenCardHTML/> :
          <CardHTML key={i} card={card}/>
)}
  </div>
}

export function CardHTML({card}: { card: Card }) {
  return <div className={`suit-${card.suit} card`}>
  {CARD_SUITS[card.suit]}
  {CARD_VALUES[card.value]}
  </div>
}

export function HiddenCardHTML() {
  return <div className={"card"}>? ?</div>
}
