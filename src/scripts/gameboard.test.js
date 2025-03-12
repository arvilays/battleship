import Gameboard from "./gameboard.js";

describe("gameboard", () => {
  test("place horizontal length-4 ship at [0,0]", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "horizontal");
    expect(gameboard.toString()).toBe(
      "o o o o . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n",
    );
  });

  test("place vertical length-4 ship at [0,0]", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    expect(gameboard.toString()).toBe(
      "o . . . . . . . . . \no . . . . . . . . . \no . . . . . . . . . \no . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n",
    );
  });

  test("place horizontal length-4 ship at [0,0] and vertical length-4 ship at [2,0]", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    gameboard.placeShip([2, 0], 4, "horizontal");
    expect(gameboard.toString()).toBe(
      "o . o o o o . . . . \no . . . . . . . . . \no . . . . . . . . . \no . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n",
    );
  });

  test("sink vertical length-4 ship at [0,0]", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([0, 1]);
    gameboard.receiveAttack([0, 2]);
    gameboard.receiveAttack([0, 3]);
    expect(gameboard.ships[0].isSunk()).toBe(true);
  });

  test("lose game when 1 out of 1 ships are sunk", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([0, 1]);
    gameboard.receiveAttack([0, 2]);
    gameboard.receiveAttack([0, 3]);
    expect(gameboard.checkLoss()).toBe(true);
  });

  test("do not lose game when 1 out of 2 ships are sunk", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    gameboard.placeShip([2, 0], 4, "horizontal");
    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([0, 1]);
    gameboard.receiveAttack([0, 2]);
    gameboard.receiveAttack([0, 3]);
    expect(gameboard.checkLoss()).toBe(false);
  });

  test("lose game when 2 out of 2 ships are sunk", () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    gameboard.placeShip([2, 0], 4, "horizontal");
    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([0, 1]);
    gameboard.receiveAttack([0, 2]);
    gameboard.receiveAttack([0, 3]);
    gameboard.receiveAttack([2, 0]);
    gameboard.receiveAttack([3, 0]);
    gameboard.receiveAttack([4, 0]);
    gameboard.receiveAttack([5, 0]);
    expect(gameboard.checkLoss()).toBe(true);
  });

  test("randomize ship placement using default values [5, 4, 3, 3, 2]", () => {
    let gameboard = new Gameboard();
    gameboard.randomizeShips();
    expect(gameboard.ships.length).toBe(5);
  });
});
