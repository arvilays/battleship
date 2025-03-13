import Ship from "./ship.js";

export default class Gameboard {
  constructor(size = 10) {
    this.boardSize = size;
    this.ships = [];
    this.board = this.#createEmptyBoard(size);
  }

  receiveAttack([x, y]) {
    if (x < 0 || x > this.boardSize - 1 || y < 0 || y > this.boardSize - 1) {
      throw new Error("Invalid coordinate: out of bounds.");
    }

    const target = this.board[y][x];
    if (target.hit) throw new Error("Target already hit.");

    if (target.ship) target.ship.hit();
    target.hit = true;
  }

  placeShip([x, y], size, orientation = "horizontal") {
    const newShip = new Ship(size);

    const isOutOfBounds =
      x < 0 ||
      y < 0 ||
      (orientation === "horizontal"
        ? x + size > this.boardSize
        : y + size > this.boardSize);
    if (isOutOfBounds) throw new Error(`Invalid ${orientation} placement.`);

    const checkConflict = (i) =>
      orientation === "horizontal"
        ? this.board[y][x + i].ship
        : this.board[y + i][x].ship;
    for (let i = 0; i < size; i++) {
      if (checkConflict(i)) throw new Error("Box already occupied.");
    }

    for (let i = 0; i < size; i++) {
      if (orientation === "horizontal") this.board[y][x + i].ship = newShip;
      else this.board[y + i][x].ship = newShip;
    }

    newShip.orientation = orientation;
    newShip.origin = [x, y];
    this.ships.push(newShip);
  }

  randomizeShips(ships = [5, 4, 3, 3, 2]) {
    ships.forEach((size) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts += 1;
        const x = this.#getRandomInt(this.boardSize);
        const y = this.#getRandomInt(this.boardSize);
        const orientation =
          this.#getRandomInt(2) === 0 ? "horizontal" : "vertical";

        try {
          this.placeShip([x, y], size, orientation);
          placed = true;
        } catch {
          placed = false;
        }
      }

      if (!placed) {
        throw new Error(
          `Could not place ship of size ${size} after 100 attempts.`,
        );
      }
    });
  }

  checkLoss() {
    return this.ships.every((item) => item && item.isSunk());
  }

  reset() {
    this.board = this.#createEmptyBoard(this.boardSize);
    this.ships = [];
  }

  toString() {
    let result = "";
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const { hit, ship } = this.board[y][x];
        if (hit) result += ship ? "x " : "* ";
        else result += ship ? "o " : ". ";
      }
      result += "\n";
    }
    return result;
  }

  #createEmptyBoard(size) {
    return Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => ({
        hit: false,
        ship: null,
        coords: [x, y],
      })),
    );
  }

  #getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}
