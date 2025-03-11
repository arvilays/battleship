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
    this.playerOne.isCurrentTurn = gameMode === 'solo' ? false : this.#getRandomInt(2) === 0;

    // Setup Player 2 (either CPU in solo mode or Player 2 in versus mode)
    if (gameMode === 'solo') {
      this.display.gameMode = 'solo';
      this.cpuShipHits = [];
      this.playerTwo = setupPlayer('CPU', this.display.boardTwo);
      this.playerTwo.gameboard.randomizeShips(); // REMOVE LATER
      this.playerTwo.isCurrentTurn = true;
      this.playerTwo.isCPU = true;
      this.playerOne.gameboardDOM.querySelector('.eye').style.visibility = 'hidden';
      this.playerTwo.gameboardDOM.querySelector('.eye').style.visibility = 'hidden';
    } else { // versus
      this.display.gameMode = 'versus';
      this.playerTwo = setupPlayer('Player 2', this.display.boardTwo);
      this.playerTwo.gameboard.randomizeShips();
      this.playerTwo.isCurrentTurn = this.playerOne.isCurrentTurn ? false : true;
      this.playerOne.gameboardDOM.querySelector('.eye').style.visibility = 'visible';
      this.playerTwo.gameboardDOM.querySelector('.eye').style.visibility = 'visible';
    }

    // Render and show the boards
    this.display.updateTurn(this.playerOne, this.playerTwo);
    this.display.renderBoard(this.playerOne);
    this.display.renderBoard(this.playerTwo);
    this.display.showBoard(this.playerOne);
    if (gameMode === 'versus') this.display.showBoard(this.playerTwo);
    this.display.toggleScreens(); // Switch from title screen to game screen
  }

  attackBox (player, coords) {
    if (player.isCurrentTurn && this.gameStarted) {
      const [row, col] = coords;
      const shipBox = player.gameboard.board[col][row];
      if (!shipBox.hit) {
        const shipBoxDOM = this.display.getShipBoxDOM(player, coords);
        shipBox.hit = true;
        shipBoxDOM.textContent = '❌';

        if (shipBox.ship) {
          shipBox.ship.hit();
          if (shipBox.ship.isSunk()) { // Recolor entire ship when sunk
            const shipCoords = shipBox.ship.getCoords();
            for (let i = 0; i < shipCoords.length; i++) {
              this.display.colorShip(player, shipCoords[i], 'black');
            }
          } else {
            shipBoxDOM.style.backgroundColor = 'darkred';
          }

          // Check if all of player's ships are sunken
          if (player.gameboard.checkLoss()) {
            Events.trigger('endGame', player);
          }
        }
        Events.trigger('endTurn');
      }
      return shipBox;
    } else return null;
  }

  canAttackBox (player, coords) {
    const [row, col] = coords;
    try {
      return !player.gameboard.board[col][row].hit;
    } catch {
      return false;
    }
  }

  cpuAttack(player) {
    let boardSize = player.gameboard.boardSize;
    let randomCoords = this.#getRandomCoords(boardSize);

    // Generate a random coordinate (repeat until attack can hit)
    let attempts = 0;
    while (!this.canAttackBox(player, randomCoords) && attempts <= 100) {
      randomCoords = this.#getRandomCoords(boardSize);
      attempts += 1;
    }
    if (attempts > 100) throw new Error('Unable to attack box as CPU after 100 attempts');

    let hitBox = null;
    if (this.cpuShipHits.length > 0) {
      console.log('checking cpuShipHits');
      let foundValidHit = false;

      while (this.cpuShipHits.length > 0 && !foundValidHit) {
        let recentHit = this.cpuShipHits[this.cpuShipHits.length - 1].coords;

        // Directions to check: right, left, bottom, top
        const directions = [
          { dx: 1, dy: 0, direction: 'right' },
          { dx: -1, dy: 0, direction: 'left' },
          { dx: 0, dy: 1, direction: 'bottom' },
          { dx: 0, dy: -1, direction: 'top' }
        ];

        // Shuffle the directions array to randomize order
        for (let i = directions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [directions[i], directions[j]] = [directions[j], directions[i]]; // Swap
        }

        // Iterate over the shuffled directions and check for valid hits
        for (const direction of directions) {
          const newCoords = [recentHit[0] + direction.dx, recentHit[1] + direction.dy];
          if (this.canAttackBox(player, newCoords)) {
            hitBox = this.attackBox(player, newCoords);
            foundValidHit = true;
            break; // Exit loop once a valid hit is found
          }
        }

        if (!foundValidHit) {
          console.log('no adjacent boxes available');
          this.cpuShipHits.pop(); // Remove the current ship from the array if no valid adjacent box
        }
      }

      if (!foundValidHit) {
        // If no valid hit was found on any ship, attack randomly
        hitBox = this.attackBox(player, randomCoords);
      }
    } else {
      // If no ships left in cpuShipHits, attack randomly
      hitBox = this.attackBox(player, randomCoords);
    }

    // If a ship is hit, add it to the cpuShipHits array
    if (hitBox.ship) {
      if (hitBox.ship !== null) this.cpuShipHits.push(hitBox);
    }

    // Clear cpuShipHits of any sunken ships
    this.cpuShipHits = this.cpuShipHits.filter(hit => !hit.ship.isSunk());
  }

  #endTurn () {
    this.playerOne.isCurrentTurn = !this.playerOne.isCurrentTurn;
    this.playerTwo.isCurrentTurn = !this.playerTwo.isCurrentTurn;
    this.display.updateTurn(this.playerOne, this.playerTwo);
    
    if (this.playerOne.isCurrentTurn && this.gameMode === 'solo' && this.gameStarted) {
      setTimeout(() => {
        this.cpuAttack(this.playerOne);
      }, 750);
    }
  }

  #endGame (loser) {
    this.gameStarted = false;
    loser.gameboardDOM.style.backgroundColor = 'darkred'; //temp
    this.playerOne.isCurrentTurn = false;
    this.playerTwo.isCurrentTurn = false;
  }

  #getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  #getRandomCoords(max) {
    return [this.#getRandomInt(max), this.#getRandomInt(max)];
  }
}