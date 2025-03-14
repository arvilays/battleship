import Events from "./events.js";

export default class Display {
  constructor() {
    this.start = document.querySelector(".start");
    this.startSolo = document.querySelector(".start-solo");
    this.startVersus = document.querySelector(".start-versus");
    this.match = document.querySelector(".match");
    this.gamePrep = document.querySelector(".game-prep");
    this.startGame = document.querySelector(".start-game");
    this.boardOne = document.querySelector(".board-one");
    this.ferry = document.querySelector(".ferry");
    this.eyeOne = this.boardOne.querySelector(".eye-image");
    this.messageOne = this.boardOne.querySelector(".message");
    this.randomizeOne = this.boardOne.querySelector(".randomize");
    this.boardTwo = document.querySelector(".board-two");
    this.eyeTwo = this.boardTwo.querySelector(".eye-image");
    this.messageTwo = this.boardTwo.querySelector(".message");
    this.randomizeTwo = this.boardTwo.querySelector(".randomize");
    this.reminder = document.querySelector(".reminder");

    this.boardOneVisible = true;
    this.boardTwoVisible = true;
    this.start.style.display = "flex";
    this.match.style.display = "none";

    this.startSolo.addEventListener("click", () => { Events.trigger("initializeGame", "solo"); });
    this.startVersus.addEventListener("click", () => { Events.trigger("initializeGame", "versus"); });
    this.startGame.addEventListener("click", () => { Events.trigger("startGame"); });
    this.eyeOne.addEventListener("click", () => { Events.trigger("toggleBoardVisibility", 1); });
    this.eyeTwo.addEventListener("click", () => { Events.trigger("toggleBoardVisibility", 2); });
    this.randomizeOne.addEventListener("click", () => { Events.trigger("randomizeBoard", 1) });
    this.randomizeTwo.addEventListener("click", () => { Events.trigger("randomizeBoard", 2) });
  }

  renderBoard(player) {
    const board = player.position === 1 ? this.boardOne : this.boardTwo;
    const boardGrid = board.querySelector(".board-grid");
    const boardSize = player.gameboard.boardSize;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const createBox = (classNames = [], textContent = "") => {
      const box = document.createElement("div");
      box.className = "box noselect"; // Default class

      // Add additional classes if any
      classNames.forEach((className) => box.classList.add(className));

      // Set the text content if provided
      if (textContent) box.textContent = textContent;

      return box;
    };

    // Create top row (numbers only)
    const topRow = document.createElement("div");
    topRow.className = "row";
    topRow.append(createBox()); // Blank top-left corner box
    for (let i = 1; i <= boardSize; i++) {
      topRow.append(createBox([], i));
    }
    boardGrid.append(topRow);

    // Create the rest of the rows (letters and boxes)
    for (let y = 0; y < boardSize; y++) {
      const row = document.createElement("div");
      row.className = "row";

      // Letter box for the row
      row.append(createBox([], letters[y % 26]));

      // Empty clickable boxes for inside the grid
      for (let x = 0; x < boardSize; x++) {
        const box = createBox(["inside-grid", `BOX${x}-${y}`], "");
        box.addEventListener("click", () => {
          if (
            (player.isCPU && this.gameMode === "solo") ||
            this.gameMode === "versus"
          ) {
            Events.trigger("attackBox", player, [y, x]);
          }
        });
        row.append(box);
      }
      boardGrid.append(row);
    }
  }

  getShipBoxDOM(player, [y, x]) {
    const board = player.position === 1 ? this.boardOne : this.boardTwo;
    return board.querySelector(`.BOX${x}-${y}`);
  }

  showBoardShips(player) {
    this.colorAllShips(player, [
      "purple",
      "green",
      "orange",
      "royalblue",
      "pink",
    ]);
  }

  hideBoardShips(player) {
    this.colorAllShips(player, ["white"]);
  }

  colorAllBoxes(player, color = "white") {
    const boardSize = player.gameboard.boardSize;
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const box = this.getShipBoxDOM(player, [x, y]);
        box.style.backgroundColor = color;
      }
    }
  }

  // 'force' will color all the player's ships regardless of hit/sunk status
  colorAllShips(player, colors, force = false) {
    const ships = player.gameboard.ships;

    ships.forEach((ship, i) => {
      const shipCoords = ship.getCoords();

      shipCoords.forEach(([x, y]) => {
        const shipBox = player.gameboard.board[y][x];

        if (shipBox.hit && !force) {
          if (shipBox.ship.isSunk()) this.colorShip(player, [x, y], "black");
          else this.colorShip(player, [x, y], "darkred");
        } else this.colorShip(player, [x, y], colors[i % colors.length]);
      });
    });
  }

  colorShip(player, [x, y], color) {
    const shipBox = this.getShipBoxDOM(player, [x, y]);

    if (shipBox) shipBox.style.backgroundColor = color;
    else throw new Error(`Element with class BOX${x}-${y} not found.`);
  }

  styleTurn(playerOne, playerTwo) {
    const currentPlayer = playerOne.isCurrentTurn ? playerOne : playerTwo;
    const otherPlayer = playerOne.isCurrentTurn ? playerTwo : playerOne;

    const setPlayerStyles = (player, targetTop, boardTitleColor, gridBoxShadow, eyeBottom) => {
      const board = player.position === 1 ? this.boardOne : this.boardTwo;
      board.querySelector(".target").style.top = targetTop;
      board.querySelector(".board-title").style.color = boardTitleColor;
      board.querySelector(".board-grid").style.boxShadow = gridBoxShadow;
      board.querySelector(".eye-image").style.bottom = eyeBottom;
    };

    setPlayerStyles(currentPlayer, "0px", "darkred", "0px 0px 50px red", "100px");
    setPlayerStyles(otherPlayer, "200px", "green", "revert", "0px");

    // The ferry icon is located only on playerOne's DOM
    const ferryLeft = playerOne.isCurrentTurn ? "605px" : "25px";
    this.ferry.style.left = ferryLeft;
  }

  // Toggle between title screen and game screen
  toggleScreens() {
    const transitionScreens = (
      outElement,
      inElement,
      outOpacity,
      inOpacity,
      fadeDuration = 250,
    ) => {
      outElement.style.opacity = outOpacity;
      setTimeout(() => {
        outElement.style.display = "none";
        inElement.style.display = "flex";

        setTimeout(() => {
          inElement.style.opacity = inOpacity;
        }, fadeDuration);
      }, fadeDuration);
    };

    const isStartScreenVisible = this.start.style.display === "flex";

    if (isStartScreenVisible) {
      transitionScreens(this.start, this.match, "0%", "100%");
    } else {
      transitionScreens(this.match, this.start, "0%", "100%");
    }
  }

  setEyeState(eye, state) {
    eye.classList.toggle('eye-closed', state === "closed");
    eye.classList.toggle('eye-opened', state === "opened");
  }

  closeAllEyes() {
    this.setEyeState(this.eyeOne, 'closed');
    this.setEyeState(this.eyeTwo, 'closed');
    this.hideBoardShips(this.playerOne);
    this.hideBoardShips(this.playerTwo);
    this.boardOneVisible = true;
    this.boardTwoVisible = true;
  }

  showEyes() {
    document.querySelectorAll(".eye-image").forEach(eye => {
      eye.style.visibility = 'visible';
    });
  }

  hideEyes() {
    document.querySelectorAll(".eye-image").forEach(eye => {
      eye.style.visibility = 'hidden';
    });
  }

  showMessages() {
    document.querySelectorAll(".message").forEach(message => {
      message.style.visibility = 'visible';
    });
  } 
}
