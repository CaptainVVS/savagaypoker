import {Card, Combination} from "./types";
import {randomCardsGetter} from "./utils";
import {getCombination} from "./combinations";


// stages:
// 0 - preflop
// 1 - flop
// 2 - turn
// 3 - river


export class Game {
  update: () => void;

  round: number = 0;
  smallBlind: number = 10;

  // current round
  players: Player[] = [];
  desk: Card[] = [];
  isRoundOver: boolean = false;
  stage: number = 0;
  dealerIndex: number = -1;
  roundTotalBet: number = 0;

  // current stage
  stagePlayerIndex: number = 0;
  maxStageBet: number = 0;

  
  smallBlindIndex = () => (this.dealerIndex+1) % this.players.length;
  bigBlindIndex = () => (this.dealerIndex+2) % this.players.length;
  currentPlayer = () => this.players[this.stagePlayerIndex];
  bigBlind = () => this.smallBlind * 2;
  

  constructor(players: number, defaultBalance: number, update: () => void) {
    this.update = update;
    for (let i = 0; i < players; i++)
      this.players.push(new Player(this, defaultBalance))
    this.newRound()
  }
  
  newRound() {
    this.players = this.players.filter(p => p.balance > 0)
    this.dealerIndex = (this.dealerIndex+1) % this.players.length;
    this.stagePlayerIndex = this.dealerIndex;
    this.round++;
    this.isRoundOver = false;
    this.stage = 0;
    this.maxStageBet = 0;
    this.roundTotalBet = 0;

    const getFromDeck = randomCardsGetter();

    this.desk = getFromDeck(5)
    this.players.forEach((player, index) => {
      player.newRound(index, getFromDeck(2));
    })

    // todo blinds are not balance aware
    this.players[this.smallBlindIndex()].blindBet(this.smallBlind)
    this.players[this.bigBlindIndex()].blindBet(this.bigBlind())
    this.maxStageBet = this.bigBlind();

    this.update();
  }

  endRound() {
    this.isRoundOver = true;
    this.distributeRewards()
    this.update();
  }


  nextStage() {
    this.stage++;
    this.stagePlayerIndex = this.dealerIndex;
    this.maxStageBet = 0;
    this.players.forEach(p => p.newStage())

    if (this.stage >= 4)
      return this.endRound();

    this.update();
  }


  playerFinishTurn() {
    if (this.isWalkover())
      return this.endRound();

    if (this.isAllBetsDone())
      return this.nextStage();

    // find next player that can do something
    for (let i = 0; i < this.players.length; i++) {
      this.stagePlayerIndex = (this.stagePlayerIndex + 1) % this.players.length;
      const player = this.currentPlayer();
      if (player.isFold || player.isAllIn()) continue;
      break;
    }

    this.update();
  }

  
  isAllBetsDone() {
    for (const player of this.players) {
      if (player.balance === 0) continue;
      if (player.isFold) continue;
      if (!player.finishedStage) return false;
      if (player.stageBet < this.maxStageBet) return false;
    }
    return true;
  }

  isWalkover() {
    const activePlayers = this.players.filter(player => !player.isFold);
    return activePlayers.length <= 1;

  }

  playerBet(value: number, stageBet: number) {
    this.maxStageBet = Math.max(this.maxStageBet, stageBet);
    this.roundTotalBet += value;
  }

  distributeRewards() {
    this.players.forEach(p => p.calcCombination(this.desk))
    const sortedPlayers = [...this.players]
    sortedPlayers.sort((a, b) => b.combination!.score - a.combination!.score)
    console.log(sortedPlayers)


    for (let i=0; i<sortedPlayers.length; i++) {
      const currentPlayer = sortedPlayers[i];
      if (currentPlayer.isFold) continue;

      // transfer bets of all players with lower cards to current player balance
      // note: can't take more than `player.roundBet` from each looser
      for (let j=i+1; j<sortedPlayers.length; j++) {
        const looser = sortedPlayers[j];
        const canTake = Math.min(looser.roundReward, currentPlayer.roundBet);
        looser.roundReward -= canTake;
        currentPlayer.roundReward += canTake;
      }

    }

    this.players.forEach(p => p.balance += p.roundReward);
  }
}

export class Player {
  public game: Game;
  public index: number = 0;
  public balance: number;
  public hand: Card[] = [];
  public stageBet: number = 0;
  public roundBet: number = 0;

  public isFold: boolean = false;
  public finishedStage: boolean = false;

  public combination?: Combination;
  public roundReward: number = 0;

  isMyTurn = () => this.game.stagePlayerIndex === this.index;
  isAllIn = () => this.balance === 0;
  getCallValue = () => Math.min(this.balance, this.game.maxStageBet - this.stageBet);
  getMinRaise = () => Math.min(this.balance, this.game.maxStageBet + this.game.bigBlind());


  constructor(game: Game, balance: number) {
    this.game = game;
    this.balance = balance;
  }

  newRound(index: number, hand: Card[]) {
    this.index = index;
    this.hand = hand;
    this.stageBet = 0;
    this.roundBet = 0;
    this.roundReward = 0;
    this.isFold = false;
    this.finishedStage = false;
  }

  newStage() {
    this.stageBet = 0;
    this.finishedStage = false;
  }

  
  fold() {
    this.isFold = true;
    this.finishedStage = true;
    this.game.playerFinishTurn();
  }


  bet(value: number) {
    const callValue = this.getCallValue();
    const minRaiseValue = this.getMinRaise();

    if (value > this.balance)
      throw new Error("Not enough balance")
    if (value < callValue)
      throw new Error("Bet too low")
    if (value > callValue && value < minRaiseValue)
      throw new Error(`Minimum raise is ${minRaiseValue}`);


    this.finishedStage = true;
    this.balance -= value;
    this.stageBet += value;
    this.roundBet += value;


    this.game.playerBet(value, this.stageBet);
    this.game.playerFinishTurn();
  }

  blindBet(value: number) {
    this.balance -= value;
    this.stageBet += value;
    this.roundBet += value;
  }

  calcCombination(desk: Card[]) {
    // this value will be increased or decreased during winners check
    this.roundReward = this.roundBet;

    if (this.isFold) {
      this.combination = {
        cards: [],
        combination: -1,
        score: 0,
      }
      return;
    }
    this.combination = getCombination([...this.hand, ...desk])
  }

}