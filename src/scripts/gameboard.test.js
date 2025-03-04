import Gameboard from './gameboard.js';

describe('gameboard', () => {
  test('place horizontal length-4 ship at [0,0]', () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0,0], 4, "horizontal");
    expect(gameboard.toString()).toBe('◯ ◯ ◯ ◯ . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n');
  });

  test('place vertical length-4 ship at [0,0]', () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0, 0], 4, "vertical");
    expect(gameboard.toString()).toBe('◯ . . . . . . . . . \n◯ . . . . . . . . . \n◯ . . . . . . . . . \n◯ . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n. . . . . . . . . . \n');
  });

  test('sink vertical length-4 ship at [0,0]', () => {
    let gameboard = new Gameboard();
    gameboard.placeShip([0,0], 4, "vertical");
    gameboard.receiveAttack([0,0]);
    gameboard.receiveAttack([1,0]);
    gameboard.receiveAttack([2,0]);
    gameboard.receiveAttack([3,0]);
    expect(gameboard.ships[0].isSunk()).toBe(true);
  })
});

