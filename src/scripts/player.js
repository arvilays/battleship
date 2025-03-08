import Gameboard from './gameboard.js';

export default class Player {
  constructor (name, gameboardDOM) {
    this.name = name;
    this.gameboard = new Gameboard();
    this.gameboardDOM = gameboardDOM;
    this.isCurrentTurn = false;
  }
}