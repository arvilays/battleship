import Events from './events.js';
import Player from './player.js';

export default class Battleship {
  constructor(display) {
    this.gameStarted = false;
    this.display = display;

    this.display.startSolo.addEventListener('click', () => { if (!this.gameStarted) this.startGame('solo'); });
    this.display.startVersus.addEventListener('click', () => { if (!this.gameStarted) this.startGame('versus'); });

    Events.subscribe('attackBox', this.attackBox.bind(this));
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
    this.playerOne = setupPlayer('Player 1', this.display.boardOne);
    this.playerOne.gameboard.randomizeShips(); // REMOVE LATER
    this.playerOne.isCurrentTurn = gameMode === 'solo' ? false : Math.random() < 0.5;

    // Setup Player 2 (either CPU in solo mode or Player 2 in versus mode)
    if (gameMode === 'solo') {
      this.playerTwo = setupPlayer('CPU', this.display.boardTwo);
      this.playerTwo.gameboard.randomizeShips(); // REMOVE LATER
      this.playerTwo.isCurrentTurn = true;
    } else { // versus
      this.playerTwo = setupPlayer('Player 2', this.display.boardTwo);
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
    this.display.renderBoard(this.playerOne);
    this.display.renderBoard(this.playerTwo);
    this.display.showBoard(this.playerOne);
    if (gameMode === 'versus') this.display.showBoard(this.playerTwo);
    this.display.toggleScreens(); // Switch from title screen to game screen
  }

  attackBox (player, coords) {
    if (player.isCurrentTurn) {
      const [row, col] = coords;
      const shipBox = player.gameboard.board[col][row];
      if (!shipBox.hit) {
        const shipBoxDOM = this.display.getShipBoxDOM(player, coords);
        shipBox.hit = true;
        shipBoxDOM.textContent = 'X';

        if (shipBox.ship) {
          shipBox.ship.hit();
          if (shipBox.ship.isSunk()) { // Recolor entire ship when sunk
            const shipCoords = shipBox.ship.getCoords();
            for (let i = 0; i < shipCoords.length; i++) {
              this.display.colorShip(player, shipCoords[i], 'darkred');
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
}