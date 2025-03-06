import Events from './events.js';
import Player from './player.js';

export default class Display {
  constructor () {
    this.start = document.querySelector('.start');
    this.startSolo = document.querySelector('.start-solo');
    this.startVersus = document.querySelector('.start-versus');
    this.match = document.querySelector('.match');
    this.boardOne = document.querySelector('.board-one');
    this.boardTwo = document.querySelector('.board-two');
    this.boardTwoTitle = document.querySelector('.board-two-title');
    this.playerOne = new Player();
    this.playerTwo = new Player();

    this.start.style.display = 'flex';
    this.match.style.display = 'none';

    this.startSolo.addEventListener('click', () => { this.startGame('solo'); });
    this.startVersus.addEventListener('click', () => { this.startGame('versus'); });

    Events.subscribe('boxClicked', this.attackBox.bind(this));
  }

  startGame (gameMode) {
    this.#toggleScreens();

    if (gameMode === 'solo') {
      this.boardTwoTitle.textContent = 'CPU';
    } else if (gameMode === 'versus') {
      this.boardTwoTitle.textContent = 'PLAYER 2';
    }

    this.#renderBoard(this.boardOne, this.playerOne);
    this.#renderBoard(this.boardTwo, this.playerTwo);
  }

  attackBox(boxData) {
    if (!boxData.hit) {
      boxData.hit = true;
      if (boxData.ship) {
        boxData.ship.hit();
      }
    }
  }

  #renderBoard (board, player) {
    const boardGrid = board.querySelector('.board-grid');
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
      letterBox.textContent = letters[i];
      row.append(letterBox);

      for (let j = 0; j < boardSize; j++) {
        const box = document.createElement('div');
        box.className = 'box';
        box.classList.add('inside-grid');
        box.classList.add(`BOX${j}-${i}`);
        box.addEventListener('click', () => {
          box.textContent = 'X';
          Events.trigger('boxClicked', player.gameboard.board[i][j]);
        });

        row.append(box);
      }
      
      boardGrid.append(row);
    }

    // Add color to represent ships
    const ships = player.gameboard.ships;
    const colors = ['purple', 'green', 'orange', 'royalblue', 'pink'];
    for (let i = 0; i < ships.length; i++) {
      const shipCoords = ships[i].getCoords();
      for (let j = 0; j < shipCoords.length; j++) {
        const coordString = `${shipCoords[j][0]}-${shipCoords[j][1]}`;
        const coordBox = boardGrid.querySelector(`.BOX${coordString}`);

        if (coordBox) {
          coordBox.style.backgroundColor = colors[i % 5];
        } else {
          console.error(`Element with class ${coordString} not found.`);
        }
      }
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

// TEMP
// if (player.gameboard.board[i][j].ship !== null) {
//   box.textContent = 'O';
// }
//