import Events from "./events.js";
import Player from "./player.js";

export default class Battleship {
  constructor(display) {
    this.display = display;
    this.gameMode = "solo";
    this.gameStarted = false;
    this.cpuShipHits = [];

    this.display.startSolo.addEventListener("click", () => {
      if (!this.gameStarted) this.startGame("solo");
    });
    this.display.startVersus.addEventListener("click", () => {
      if (!this.gameStarted) this.startGame("versus");
    });

    Events.subscribe("attackBox", this.attackBox.bind(this));
    Events.subscribe("endTurn", this.#endTurn.bind(this));
    Events.subscribe("endGame", this.#endGame.bind(this));
  }

  // // Game Modes: 'solo', 'versus'
  // // If a player hits a ship, they get an additional attack
  // startGame(gameMode) {
  //   this.gameMode = gameMode;
  //   this.gameStarted = true;
  //   const setupPlayer = (name, board) => {
  //     const player = new Player(name, board);
  //     player.gameboardDOM.querySelector(".board-title").textContent =
  //       player.name;
  //     return player;
  //   };

  //   // Setup Player 1
  //   this.playerOne = setupPlayer("Player 1", this.display.boardOne);
  //   this.playerOne.gameboard.randomizeShips(); // REMOVE LATER
  //   this.playerOne.isCurrentTurn =
  //     gameMode === "solo" ? false : this.#getRandomInt(2) === 0;

  //   // Setup Player 2 (either CPU in solo mode or Player 2 in versus mode)
  //   if (gameMode === "solo") {
  //     this.display.gameMode = "solo";
  //     this.cpuShipHits = [];
  //     this.playerTwo = setupPlayer("CPU", this.display.boardTwo);
  //     this.playerTwo.gameboard.randomizeShips(); // REMOVE LATER
  //     this.playerTwo.isCurrentTurn = true;
  //     this.playerTwo.isCPU = true;
  //     this.playerOne.gameboardDOM.querySelector(".eye").style.visibility =
  //       "hidden";
  //     this.playerTwo.gameboardDOM.querySelector(".eye").style.visibility =
  //       "hidden";
  //   } else {
  //     // versus
  //     this.display.gameMode = "versus";
  //     this.playerTwo = setupPlayer("Player 2", this.display.boardTwo);
  //     this.playerTwo.gameboard.randomizeShips();
  //     this.playerTwo.isCurrentTurn = this.playerOne.isCurrentTurn
  //       ? false
  //       : true;
  //     this.playerOne.gameboardDOM.querySelector(".eye").style.visibility =
  //       "visible";
  //     this.playerTwo.gameboardDOM.querySelector(".eye").style.visibility =
  //       "visible";
  //   }

  //   // Render and show the boards
  //   this.display.renderBoard(this.playerOne);
  //   this.display.renderBoard(this.playerTwo);
  //   this.display.showBoard(this.playerOne);
  //   if (gameMode === "versus") this.display.showBoard(this.playerTwo);
  //   this.display.toggleScreens(); // Switch from title screen to game screen
  //   this.display.updateTurn(this.playerOne, this.playerTwo);
  // }

  // Game Modes: 'solo', 'versus'
  startGame(gameMode) {
    this.gameMode = gameMode;
    this.gameStarted = true;

    const setupPlayer = (name, board) => {
      const player = new Player(name, board);
      player.gameboardDOM.querySelector(".board-title").textContent =
        player.name;
      return player;
    };

    // Setup Player 1
    this.playerOne = setupPlayer("Player 1", this.display.boardOne);
    this.playerOne.gameboard.randomizeShips(); // REMOVE LATER
    this.playerOne.isCurrentTurn =
      gameMode === "solo" ? false : this.#getRandomInt(2) === 0;

    // Start the appropriate game mode
    if (gameMode === "solo") {
      this.startSoloGame();
    } else {
      this.startVersusGame();
    }

    // Render and show the boards
    this.display.renderBoard(this.playerOne);
    this.display.renderBoard(this.playerTwo);
    if (gameMode === "solo") this.display.showBoard(this.playerOne); // CHANGE LATER
    //if (gameMode === "versus") this.display.showBoard(this.playerTwo);
    this.display.updateTurn(this.playerOne, this.playerTwo);
    this.display.toggleScreens(); // Switch from title screen to game screen
  }

  startSoloGame() {
    this.display.gameMode = "solo";

    // Setup Player 2 (CPU)
    this.playerTwo = new Player("CPU", this.display.boardTwo);
    this.playerTwo.gameboard.randomizeShips(); // REMOVE LATER
    this.playerTwo.isCurrentTurn = true;
    this.playerTwo.isCPU = true;

    // Hide the eye indicators for the solo mode
    this.playerOne.gameboardDOM.querySelector(".eye").style.visibility =
      "hidden";
    this.playerTwo.gameboardDOM.querySelector(".eye").style.visibility =
      "hidden";
  }

  startVersusGame() {
    this.display.gameMode = "versus";

    // Setup Player 2 (Player 2 in versus mode)
    this.playerTwo = new Player("Player 2", this.display.boardTwo);
    this.playerTwo.gameboard.randomizeShips();
    this.playerTwo.isCurrentTurn = !this.playerOne.isCurrentTurn;

    // Show the eye indicators for the versus mode
    this.playerOne.gameboardDOM.querySelector(".eye").style.visibility =
      "visible";
    this.playerTwo.gameboardDOM.querySelector(".eye").style.visibility =
      "visible";
  }

  attackBox(player, [x, y]) {
    if (!player.isCurrentTurn || !this.gameStarted) return null;

    const shipBox = player.gameboard.board[y][x];

    if (shipBox.hit) return shipBox;

    // Process attack
    const shipBoxDOM = this.display.getShipBoxDOM(player, [x, y]);
    shipBox.hit = true;
    shipBoxDOM.textContent = "❌";

    if (shipBox.ship) {
      shipBox.ship.hit();

      if (shipBox.ship.isSunk()) {
        const shipCoords = shipBox.ship.getCoords();
        shipCoords.forEach((coords) => {
          this.display.colorShip(player, coords, "black");
        });
      } else {
        shipBoxDOM.style.backgroundColor = "darkred";
      }
    }

    // Check for loss
    if (player.gameboard.checkLoss()) {
      // End game
      Events.trigger("endGame", player);
    } else {
      // End turn
      Events.trigger("endTurn");
    }

    return shipBox;
  }

  #cpuAttack(player) {
    const boardSize = player.gameboard.boardSize;
    let randomCoords = this.#getRandomCoords(boardSize);
    let attempts = 0;

    // Ensure random coordinates are valid
    while (!this.#canAttackBox(player, randomCoords) && attempts <= 100) {
      randomCoords = this.#getRandomCoords(boardSize);
      attempts++;
    }

    if (attempts > 100)
      throw new Error("Unable to attack box as CPU after 100 attempts.");

    let hitBox = this.#getHitBox(player);

    // If no valid hit was found, attack randomly
    if (!hitBox) hitBox = this.attackBox(player, randomCoords);

    // Add the hit box to cpuShipHits if a ship was hit
    if (hitBox.ship) this.cpuShipHits.push(hitBox);

    // Filter out any sunken ships from cpuShipHits
    this.cpuShipHits = this.cpuShipHits.filter((hit) => !hit.ship.isSunk());
  }

  #canAttackBox(player, [x, y]) {
    try {
      return !player.gameboard.board[y][x].hit;
    } catch {
      return false;
    }
  }

  #getHitBox(player) {
    if (this.cpuShipHits.length === 0) {
      return null; // No previous hits, attack randomly
    }

    let foundValidHit = false;
    let hitBox = null;

    // Try to find a valid adjacent hit based on previous hits
    while (this.cpuShipHits.length > 0 && !foundValidHit) {
      const recentHit = this.cpuShipHits[this.cpuShipHits.length - 1].coords;
      const directions = this.#shuffleDirections();

      for (const direction of directions) {
        const adjacentCoords = [
          recentHit[0] + direction.dx,
          recentHit[1] + direction.dy,
        ];
        if (this.#canAttackBox(player, adjacentCoords)) {
          hitBox = this.attackBox(player, adjacentCoords);
          foundValidHit = true;
          break;
        }
      }

      // If no valid adjacent hit found, remove the current hit
      if (!foundValidHit) {
        this.cpuShipHits.pop();
      }
    }

    return hitBox;
  }

  #shuffleDirections() {
    const directions = [
      { dx: 1, dy: 0 }, // right
      { dx: -1, dy: 0 }, // left
      { dx: 0, dy: 1 }, // bottom
      { dx: 0, dy: -1 }, // top
    ];

    // Shuffle the directions array to randomize the order
    for (let i = directions.length - 1; i > 0; i--) {
      const j = this.#getRandomInt(i + 1);
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    return directions;
  }

  #endTurn() {
    // Toggle turns between Player 1 and Player 2
    this.playerOne.isCurrentTurn = !this.playerOne.isCurrentTurn;
    this.playerTwo.isCurrentTurn = !this.playerTwo.isCurrentTurn;

    // Update display with current turn
    this.display.updateTurn(this.playerOne, this.playerTwo);

    // If it's Player 1's turn and game mode is solo, let the CPU attack
    if (
      this.playerOne.isCurrentTurn &&
      this.gameMode === "solo" &&
      this.gameStarted
    ) {
      setTimeout(() => {
        this.#cpuAttack(this.playerOne);
      }, 750);
    }
  }

  #endGame(loser) {
    loser.gameboardDOM.style.backgroundColor = "darkred"; //temp
    this.playerOne.isCurrentTurn = false;
    this.playerTwo.isCurrentTurn = false;
    this.gameStarted = false;
  }

  #getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  #getRandomCoords(max) {
    return [this.#getRandomInt(max), this.#getRandomInt(max)];
  }
}
