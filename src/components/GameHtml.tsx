import React, {useState} from "react";
import {Game, Player} from "../backend/game";
import {CardsHTML} from "./CardHtml";
import {Card, Combinations} from "../backend/types";

import './game.css';


export function GameHtml({game}: { game: Game }) {

  const stageTitle = ["Pre Flop", "Flop", "Turn", "River"][game.stage]
  const stageDeskCardsCount = [0, 3, 4, 5][game.stage]
  const stageDeskCards = game.desk.slice(0, stageDeskCardsCount)

  return (
    <div>
      {
        game.isRoundOver &&
          <button onClick={() => game.newRound()}>NEXT</button>
      }

      <h1>{stageTitle}</h1>

      <CardsHTML cards={stageDeskCards}/>

      <hr/>

      {
        game.players.map((player) =>
          <PlayerHTML key={player.index} player={player}/>
        )
      }

    </div>
  );
}


function PlayerHTML({player}: { player: Player }) {

  const myTurn = player.isMyTurn();
  const isFold = player.isFold;

  const isGameEnded = player.game.isRoundOver

  return (
    <div className={`player 
  ${myTurn ? 'player-turn' : ''}
  ${isFold ? 'player-fold' : ''}
  `}>

      <div className={"player-left"}>
        <PlayerInfo player={player}/>
      </div>

      <div className={"player-center"}>
        <PlayerShowableCards cards={player.hand} defaultIsShow={isGameEnded}/>
      </div>

      <div className={"player-right"}>
        {
          isGameEnded ?
            <PlayerWinnings player={player}/> :
            myTurn && <PlayerControls player={player}/>
        }
      </div>

    </div>
  );
}

function PlayerControls({player}: { player: Player }) {
  const callValue = player.getCallValue();
  const minRaise = player.getMinRaise();
  const maxRaise = player.balance;

  const [raiseValue, setRaiseValue] = useState(Math.min(maxRaise, minRaise))

  const fold = () => player.fold();
  const check = () => player.bet(0);
  const call = () => player.bet(callValue);
  const raise = () => player.bet(raiseValue);

  const handleRaiseChange = (e: any) => setRaiseValue(+e.target.value)
  const handleRaiseUnfocus = () => setRaiseValue(value => Math.min(Math.max(value, minRaise), maxRaise))

  return <div className={"player-controls"}>
    <button onClick={fold}>Fold</button>


    {
      callValue > 0 ?
        <button onClick={call}>Call +{callValue} </button> :
        <button onClick={check}>Check</button>
    }

    <br/>

    <button onClick={raise}>
      {raiseValue >= maxRaise ? `All In +${maxRaise}` : `Raise +${raiseValue}`}
    </button>

    <input
      value={raiseValue}
      onChange={handleRaiseChange}
      onBlur={handleRaiseUnfocus}
      style={{width: 40}}
    />
  </div>
}

function PlayerShowableCards({cards, defaultIsShow}: { cards: Card[]; defaultIsShow: boolean }) {
  const [showingCards, setShowingCards] = useState(false);
  const handleShow = (status: boolean) => () => setShowingCards(status)

  const isShowing = (defaultIsShow || showingCards);

  return <>
    <CardsHTML cards={cards} isHidden={!isShowing}/>
    {
      !defaultIsShow &&
        <button onMouseDown={handleShow(true)}
                onMouseUp={handleShow(false)}>
            Show cards
        </button>
    }
  </>
}

function PlayerInfo({player}: { player: Player }) {
  return <>
    <div><strong>Player {player.index + 1}</strong></div>
    <div>Balance: {player.balance}</div>
    <div>Round Bet: {player.roundBet}</div>
    <div>Stage Bet: {player.stageBet}</div>
    <div className={"player-info-blind"}>
      {player.index === player.game.dealerIndex && "D "}
      {player.index === player.game.smallBlindIndex() && "S "}
      {player.index === player.game.bigBlindIndex() && "B "}
    </div>
  </>;
}


function PlayerWinnings({player}: { player: Player }) {
  return <div>
    {Combinations[player.combination!.combination]}
    <br/>
    Win: {player.roundReward}
  </div>
}
