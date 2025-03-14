import Gameboard from "./gameboard.js";

export default class Player {
  constructor(name, position = 1) {
    this.name = name;
    this.position = position;
    this.gameboard = new Gameboard();
    this.isCurrentTurn = false;
    this.isCPU = false;
  }
}
