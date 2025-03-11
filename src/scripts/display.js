import eyeOpenImage from '../images/eye-outline.svg';
import eyeClosedImage from '../images/eye-closed.svg';

import Events from './events.js';

export default class Display {
  constructor () {
    this.start = document.querySelector('.start');
    this.startSolo = document.querySelector('.start-solo');
    this.startVersus = document.querySelector('.start-versus');
    this.match = document.querySelector('.match');
    this.boardOne = document.querySelector('.board-one');
    this.boardTwo = document.querySelector('.board-two');

    this.start.style.display = 'flex';
    this.match.style.display = 'none';
  }

  renderBoard (player) {
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
        box.addEventListener('click', () => {
          if (player.isCPU && this.gameMode === 'solo') {
            Events.trigger('attackBox', player, [i, j]); 
          } else if (this.gameMode === 'versus') {
            Events.trigger('attackBox', player, [i, j]); 
          }
        });
        row.append(box);
      }

      boardGrid.append(row);
    }
  }

  showBoard (player) {
    const colors = ['purple', 'green', 'orange', 'royalblue', 'pink'];
    this.colorAllShips(player, colors);
  }

  hideBoard (player) {
    const colors = ['white'];
    this.colorAllShips(player, colors);
  }

  updateTurn (playerOne, playerTwo) {
    if (playerOne.isCurrentTurn) {
      playerOne.gameboardDOM.querySelector('.ferry').style.left = '605px';
      playerOne.gameboardDOM.querySelector('.target').style.top = '0px';
      playerTwo.gameboardDOM.querySelector('.target').style.top = '200px';
      playerOne.gameboardDOM.querySelector('.board-title').style.color = 'darkred';
      playerTwo.gameboardDOM.querySelector('.board-title').style.color = 'green';
      playerOne.gameboardDOM.querySelector('.board-grid').style.boxShadow = '0px 0px 50px red';
      playerTwo.gameboardDOM.querySelector('.board-grid').style.boxShadow = 'revert';
      playerOne.gameboardDOM.querySelector('.eye').style.bottom = '100px';
      playerTwo.gameboardDOM.querySelector('.eye').style.bottom = '0px';
    } else {
      playerOne.gameboardDOM.querySelector('.ferry').style.left = '25px';
      playerOne.gameboardDOM.querySelector('.target').style.top = '200px';
      playerTwo.gameboardDOM.querySelector('.target').style.top = '0px';
      playerOne.gameboardDOM.querySelector('.board-title').style.color = 'green';
      playerTwo.gameboardDOM.querySelector('.board-title').style.color = 'darkred';
      playerOne.gameboardDOM.querySelector('.board-grid').style.boxShadow = 'revert';
      playerTwo.gameboardDOM.querySelector('.board-grid').style.boxShadow = '0px 0px 50px red';
      playerOne.gameboardDOM.querySelector('.eye').style.bottom = '0px';
      playerTwo.gameboardDOM.querySelector('.eye').style.bottom = '100px';
    }
  }

  getShipBoxDOM (player, coords) {
    const [row, col] = coords;
    const coordString = `${col}-${row}`;
    return player.gameboardDOM.querySelector(`.BOX${coordString}`);
  }

  // 'force' will color the ships regardless of hit/sunk status
  colorAllShips (player, colors, force = false) {
    const ships = player.gameboard.ships;
    for (let i = 0; i < ships.length; i++) {
      const shipCoords = ships[i].getCoords();
      for (let j = 0; j < shipCoords.length; j++) {
        const [row, col] = shipCoords[j];
        const shipBox = player.gameboard.board[col][row];
        if (shipBox.hit && !force) {
          if (shipBox.ship.isSunk()) this.colorShip(player, shipCoords[j], 'darkred');
          else this.colorShip(player, shipCoords[j], 'red');
        } else this.colorShip(player, shipCoords[j], colors[i % colors.length]);
      }
    }
  }

  colorShip (player, coords, color) {
    const [row, col] = coords;
    const shipBox = this.getShipBoxDOM(player, coords);
    if (shipBox) {
      shipBox.style.backgroundColor = color;
    } else {
      throw new Error(`Element with class BOX${col}-${row} not found.`);
    }
  }

  toggleScreens () {
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