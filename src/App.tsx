import React, {useCallback, useEffect, useState} from 'react';
import {Game} from "./backend/game";
import {GameHtml} from "./components/GameHtml";



export default function App() {
  const [game, setGame] = useState<Game>();

  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  function newGame(players: number, defaultBalance: number) {
    const game_ = new Game(players, defaultBalance, forceUpdate);
    setGame(game_)
  }

  if (!game) {
    return <GameSetup callback={newGame}/>
  }

  return <GameHtml game={game}/>

}


function GameSetup({callback}: {callback: (players: number, defaultBalance: number) => void}) {
  const [playersNum, setPlayersNum] = useState(2);
  const [defaultBalance, setDefaultBalance] = useState(500);

  function startGame() {
    callback(playersNum, defaultBalance)
  }

  return (
    <div>
      Players:
      <input value={playersNum}
             onChange={(e) => setPlayersNum(+e.target.value)}
      />
      <br/>
      Default balance:
      <input value={defaultBalance}
             onChange={(e) => setDefaultBalance(+e.target.value)}
      />
      <br/>
      <button onClick={startGame}>Start game</button>
    </div>
  )
}