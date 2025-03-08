import Events from './events.js';
import Player from './player.js';

export default class Battleship {
  constructor () {
    this.start = document.querySelector('.start');
    this.startSolo = document.querySelector('.start-solo');
    this.startVersus = document.querySelector('.start-versus');
    this.match = document.querySelector('.match');
    this.boardOne = document.querySelector('.board-one');
    this.boardTwo = document.querySelector('.board-two');
    this.boardTwoTitle = document.querySelector('.board-two-title'); // remove
    this.playerOne = new Player('Player 1', this.boardOne); // change later
    this.playerTwo = new Player('Player 2', this.boardTwo); // change later

    this.start.style.display = 'flex';
    this.match.style.display = 'none';

    this.startSolo.addEventListener('click', () => { this.startSoloGame(); });
    this.startVersus.addEventListener('click', () => { this.startVersusGame(); });

    Events.subscribe('gameLoss', this.gameLoss.bind(this));
  }

  // Game Modes: 'solo', 'versus'
  startGame(gameMode) {
    this.playerOne = new Player('Player 1', this.boardOne);
    if (gameMode === 'solo') this.playerTwo = new Player('CPU', this.boardTwo);
    else if (gameMode === 'versus') this.playerTwo = new Player('Player 2', this.boardTwo);

    this.#renderBoard(this.playerOne);
    this.#renderBoard(this.playerTwo);

    this.#showBoard(this.playerOne);
    this.#showBoard(this.playerTwo);

    this.#toggleScreens();




  }


  startSoloGame () {
    this.#toggleScreens();
    this.boardTwoTitle.textContent = 'CPU';

    this.#renderBoard(this.playerOne);
    this.#renderBoard(this.playerTwo);

    this.#showBoard(this.playerOne);
  }

  startVersusGame () {
    this.#toggleScreens();
    this.boardTwoTitle.textContent = 'PLAYER 2';

    this.#renderBoard(this.playerOne);
    this.#renderBoard(this.playerTwo);

    this.#showBoard(this.playerOne);
    this.#showBoard(this.playerTwo);
  }

  gameLoss (player) {
    player.gameboardDOM.style.backgroundColor = 'darkred'; //temp
    this.#showBoard(player);
    this.#hideBoard(player);
  }

  getShipBoxDOM(player, coords) {
    const [row, col] = coords;
    const coordString = `${col}-${row}`;
    return player.gameboardDOM.querySelector(`.BOX${coordString}`);
  }

  attackBox(player, coords) {
    const [row, col] = coords;
    const shipBox = player.gameboard.board[col][row];
    const shipBoxDOM = this.getShipBoxDOM(player, coords);
    if (!shipBox.hit) {
      shipBox.hit = true;
      shipBoxDOM.textContent = 'X';

      if (shipBox.ship) {
        shipBox.ship.hit();
        if (shipBox.ship.isSunk()) { // Recolor entire ship when sunk
          const shipCoords = shipBox.ship.getCoords();
          for (let i = 0; i < shipCoords.length; i++) {
            this.#colorShip(player, shipCoords[i], 'darkred');
          }
        } else {
          shipBoxDOM.style.backgroundColor = 'red';   
        }           

        // Check if all of player's ships are sunken
        if (player.gameboard.checkLoss()) {
          Events.trigger('gameLoss', player);
        }
      }
    }
  }

  #renderBoard (player) {
    const boardGrid = player.gameboardDOM.querySelector('.board-grid');
    const boardSize = player.gameboard.boardSize;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Generate top row (numbers only)
    const topRow = document.createElement('div');
    topRow.className = 'row';
    const blankBox = document.createElement('div');
    blankBox.className = 'box';
    topRow.append(blankBox);
    for (let i = 1; i <= boardSize; i++) {
      const box = document.createElement('div');
      box.className = 'box';
      box.textContent = i;
      topRow.append(box);
    }
    boardGrid.append(topRow);

    // Generate other rows (letters and ship squares)
    for (let i = 0; i < boardSize; i++) {
      const row = document.createElement('div');
      row.className = 'row';

      const letterBox = document.createElement('div');
      letterBox.className = 'box';
      letterBox.textContent = letters[i % 26];
      row.append(letterBox);

      for (let j = 0; j < boardSize; j++) {
        const box = document.createElement('div');
        box.className = 'box';
        box.classList.add('inside-grid');
        box.classList.add(`BOX${j}-${i}`);
        box.addEventListener('click', () => { this.attackBox(player, [i, j]); });
        row.append(box);
      }
      
      boardGrid.append(row);
    }
  }

  #showBoard (player) {
    const colors = ['purple', 'green', 'orange', 'royalblue', 'pink'];
    this.#colorAllShips(player, colors);
  }

  #hideBoard (player) {
    const colors = ['white'];
    this.#colorAllShips(player, colors, true);
  }

  // 'force' will color the ships regardless of hit/sunk status
  #colorAllShips (player, colors, force = false) {
    const ships = player.gameboard.ships;
    for (let i = 0; i < ships.length; i++) {
      const shipCoords = ships[i].getCoords();
      for (let j = 0; j < shipCoords.length; j++) {
        const [row, col] = shipCoords[j];
        const shipBox = player.gameboard.board[col][row];
        if (shipBox.hit && !force) {  
          if (shipBox.ship.isSunk()) this.#colorShip(player, shipCoords[j], 'darkred');
          else this.#colorShip(player, shipCoords[j], 'red');
        } else this.#colorShip(player, shipCoords[j], colors[i % colors.length]);
      }
    }
  }

  #colorShip (player, coords, color) {
    const [row, col] = coords;
    const shipBox = this.getShipBoxDOM(player, coords);
    if (shipBox) {
      shipBox.style.backgroundColor = color;
    } else {
      throw new Error(`Element with class BOX${col}-${row} not found.`);
    }
  }

  #toggleScreens () {
    console.log(this.start.style.display);
    if (this.start.style.display === 'flex') {
      this.start.style.display = 'none';
      this.match.style.display = 'flex';
    } else {
      this.start.style.display = 'flex';
      this.match.style.display = 'none';
    }
  }
}