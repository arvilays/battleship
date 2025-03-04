import Ship from './ship.js';

export default class Gameboard {
  constructor (size = 10) {
    this.board = [];
    this.boardSize = size;
    this.ships = [];

    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = { hit: false, ship: null };
      }
    }
  }

  receiveAttack (coords) {
    const [col, row] = coords;
    if (col < 0 || col > this.board.length - 1 || row < 0 || row > this.board[0].length - 1) {
      throw new Error('Invalid coordinate: out of bounds.');
    }

    let target = this.board[col][row];
    if (target.hit === false) {
      if (target.ship !== null) target.ship.hit();
      target.hit = true;
    } else {
      throw new Error('Target already hit.');
    }
  }

  // coords: [0,0] (in array form)
  // orientation: horizontal, vertical
  placeShip (coords, shipSize, orientation = 'horizontal') {
    const [col, row] = coords;
    const newShip = new Ship(shipSize);

    // Validate ship placement based on orientation
    if (orientation === 'horizontal') {
      // Check if ship can fit horizontally on board
      if (col < 0 || col >= this.board[0].length || col + shipSize > this.board[0].length) {
        throw new Error('Invalid horizontal placement.');
      }

      // Check if there are conflicts with other ships
      for (let i = 0; i < shipSize; i++) {
        if (this.board[row][col + i].ship) {
          throw new Error('Square already occupied.');
        }
      }

      // Assign squares with new ship
      for (let i = 0; i < shipSize; i++) {
        this.board[row][col + i].ship = newShip;
      }
    } else if (orientation === 'vertical') {
      // Check if ship can fit vertically on board
      if (row < 0 || row >= this.board.length || row + shipSize > this.board.length) {
        throw new Error('Invalid vertical placement.');
      }

      // Check if there are conflicts with other ships
      for (let i = 0; i < shipSize; i++) {
        if (this.board[row + i][col].ship) {
          throw new Error('Square already occupied.');
        }
      }
      // Assign squares with new ship
      for (let i = 0; i < shipSize; i++) {
        this.board[row + i][col].ship = newShip;
      }
    } else {
      throw new Error('Invalid orientation, choose either "horizontal" or "vertical".');
    }
    
    this.ships.push(newShip);
  }

  toString () {
    let string = "";
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        let hit = this.board[i][j].hit;
        let ship = this.board[i][j].ship;
        if (hit === true && ship !== null) string += '✗ ';
        else if (hit === false && ship !== null) string += '◯ ';
        else if (hit === true && ship === null) string += '* ';
        else string += ". ";
      }
      string += "\n";
    }
    return string;
  }
}