import Events from './events.js';
import Player from './player.js';

export default class Battleship {
  constructor () {
    this.gameStarted = false;
    this.start = document.querySelector('.start');
    this.startSolo = document.querySelector('.start-solo');
    this.startVersus = document.querySelector('.start-versus');
    this.match = document.querySelector('.match');
    this.boardOne = document.querySelector('.board-one');
    this.boardTwo = document.querySelector('.board-two');

    this.start.style.display = 'flex';
    this.match.style.display = 'none';

    this.startSolo.addEventListener('click', () => { if (!this.gameStarted) this.startGame('solo'); });
    this.startVersus.addEventListener('click', () => { if (!this.gameStarted) this.startGame('versus'); });

    Events.subscribe('endGame', this.#endGame.bind(this));
    Events.subscribe('endTurn', this.#endTurn.bind(this));
  }

  // Game Modes: 'solo', 'versus'
  // If a player hits a ship, they get an additional attack
  startGame (gameMode) {
    this.gameMode = gameMode;
    this.gameStarted = true;
    const setupPlayer = (name, board) => {
      const player = new Player(name, board);
      player.gameboardDOM.querySelector('.board-title').textContent = player.name;
      return player;
    };

    // Setup Player 1
    this.playerOne = setupPlayer('Player 1', this.boardOne);
    this.playerOne.gameboard.randomizeShips(); // REMOVE LATER
    this.playerOne.isCurrentTurn = gameMode === 'solo' ? false : Math.random() < 0.5;

    // Setup Player 2 (either CPU in solo mode or Player 2 in versus mode)
    if (gameMode === 'solo') {
      this.playerTwo = setupPlayer('CPU', this.boardTwo);
      this.playerTwo.gameboard.randomizeShips(); // REMOVE LATER
      this.playerTwo.isCurrentTurn = true;
    } else { // versus
      this.playerTwo = setupPlayer('Player 2', this.boardTwo);
      this.playerTwo.gameboard.randomizeShips();
      this.playerTwo.isCurrentTurn = this.playerOne.isCurrentTurn ? false : true;
    }

    // Color board depending on who goes first
    if (this.playerOne.isCurrentTurn) {
      this.playerOne.gameboardDOM.querySelector('.board-grid').style.boxShadow = '0px 0px 50px red';
    } else {
      this.playerTwo.gameboardDOM.querySelector('.board-grid').style.boxShadow = '0px 0px 50px red';
    }

    // Render and show the boards
    this.#renderBoard(this.playerOne);
    this.#renderBoard(this.playerTwo);
    this.#showBoard(this.playerOne);
    if (gameMode === 'versus') this.#showBoard(this.playerTwo);
    this.#toggleScreens(); // Switch from title screen to game screen
  }

  attackBox (player, coords) {
    if (player.isCurrentTurn) {
      const [row, col] = coords;
      const shipBox = player.gameboard.board[col][row];
      if (!shipBox.hit) {
        const shipBoxDOM = this.#getShipBoxDOM(player, coords);
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
            Events.trigger('endGame', player);
          }
        } else Events.trigger('endTurn');
      } 
    }
  }

  #endTurn () {
    this.playerOne.isCurrentTurn = !this.playerOne.isCurrentTurn;
    this.playerTwo.isCurrentTurn = !this.playerTwo.isCurrentTurn;
    if (this.playerOne.isCurrentTurn) {
      this.playerOne.gameboardDOM.querySelector('.board-grid').style.boxShadow = '0px 0px 50px red';
      this.playerTwo.gameboardDOM.querySelector('.board-grid').style.boxShadow = 'revert';
    } else {
      this.playerOne.gameboardDOM.querySelector('.board-grid').style.boxShadow = 'revert';
      this.playerTwo.gameboardDOM.querySelector('.board-grid').style.boxShadow = '0px 0px 50px red';
    }
  }

  #endGame (loser) {
    loser.gameboardDOM.style.backgroundColor = 'darkred'; //temp
    this.playerOne.isCurrentTurn = false;
    this.playerTwo.isCurrentTurn = false;
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
    this.#colorAllShips(player, colors);
  }

  #getShipBoxDOM(player, coords) {
    const [row, col] = coords;
    const coordString = `${col}-${row}`;
    return player.gameboardDOM.querySelector(`.BOX${coordString}`);
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
    const shipBox = this.#getShipBoxDOM(player, coords);
    if (shipBox) {
      shipBox.style.backgroundColor = color;
    } else {
      throw new Error(`Element with class BOX${col}-${row} not found.`);
    }
  }

  #toggleScreens() {
    const fadeDuration = 250;
    if (this.start.style.display === 'flex') {
      this.start.style.opacity = "0%";
      setTimeout(() => {
        this.start.style.display = "none";
        this.match.style.display = "flex";

        setTimeout(() => {
          this.match.style.opacity = "100%";
        }, fadeDuration);
      }, fadeDuration);
    } else {
      this.match.style.opacity = "0%";
      setTimeout(() => {
        this.match.style.display = "none";
        this.start.style.display = "flex";

        setTimeout(() => {
          this.start.style.opacity = "100%";
        }, fadeDuration);
      }, fadeDuration);
    }
  }
}

// #toggleScreens () {
//   console.log(this.start.style.display);
//   if (this.start.style.display === 'flex') {
//     this.start.style.display = 'none';
//     this.match.style.display = 'flex';
//   } else {
//     this.start.style.display = 'flex';
//     this.match.style.display = 'none';
//   }
// }