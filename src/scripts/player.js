import Gameboard from './gameboard.js';

export default class Player {
  constructor () {
    this.gameboard = new Gameboard();
    this.isCurrentTurn = false;
    
    this.gameboard.randomizeShips();
  }
}