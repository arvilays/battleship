import Ship from './ship.js';

export default class Gameboard {
  constructor (size = 10) {
    this.board = [];
    this.boardSize = size;
    this.ships = [];

    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = { hit: false, ship: null, coords: [j, i] };
      }
    }
  }

  receiveAttack (coords) {
    const [col, row] = coords;
    if (col < 0 || col > this.boardSize - 1 || row < 0 || row > this.boardSize - 1) {
      throw new Error('Invalid coordinate: out of bounds.');
    }

    const target = this.board[row][col];
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
      if (col < 0 || col >= this.boardSize || col + shipSize > this.boardSize) {
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
      if (row < 0 || row >= this.boardSize || row + shipSize > this.boardSize) {
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
    
    newShip.orientation = orientation;
    newShip.origin = coords;
    this.ships.push(newShip);
  }

  // ex. ships = [5, 4, 3, 3, 2]
  // 1 length-5 ship
  // 1 length-4 ship
  // 2 length-3 ships
  // 1 length-2 ship
  randomizeShips(ships = [5, 4, 3, 3, 2]) {
    for (let i = 0; i < ships.length; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) { // Retry up to 100 times
        attempts++;
        
        // Get a random position and orientation
        const x = this.#getRandomInt(this.boardSize);
        const y = this.#getRandomInt(this.boardSize);
        const orientation = this.#getRandomInt(2) === 0 ? 'horizontal' : 'vertical';
      
        // Check if the ship can be placed without overlapping
        placed = true;
        try {
          this.placeShip([x, y], ships[i], orientation);
        } catch {
          placed = false;
        }
      }

      if (!placed) {
        throw new Error(`Cound not place ship of size ${ships[i]} after 100 attempts`);
      }
    }
  }

  checkLoss () {
    return this.ships.every(item => item && item.isSunk());
  }

  reset() {
    this.board = [];
    this.ships = [];
  }

  toString () {
    let string = "";
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const hit = this.board[i][j].hit;
        const ship = this.board[i][j].ship;
        if (hit === true && ship !== null) string += 'x ';
        else if (hit === false && ship !== null) string += 'o ';
        else if (hit === true && ship === null) string += '* ';
        else string += ". ";
      }
      string += "\n";
    }
    return string;
  }

  #getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}