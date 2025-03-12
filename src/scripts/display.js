import eyeOpenImage from "../images/eye-outline.svg";
import eyeClosedImage from "../images/eye-closed.svg";

import Events from "./events.js";

export default class Display {
  constructor() {
    this.gameMode = "solo";

    this.playerOne = null;
    this.playerTwo = null;

    this.start = document.querySelector(".start");
    this.startSolo = document.querySelector(".start-solo");
    this.startVersus = document.querySelector(".start-versus");
    this.match = document.querySelector(".match");
    this.boardOne = document.querySelector(".board-one");
    this.boardTwo = document.querySelector(".board-two");
    this.boardOneEye = this.boardOne.querySelector(".eye-image");
    this.boardTwoEye = this.boardTwo.querySelector(".eye-image");

    this.start.style.display = "flex";
    this.match.style.display = "none";

    this.boardOneEye.addEventListener("click", () => { this.toggleEye(this.playerOne, this.boardOneEye); });
    this.boardTwoEye.addEventListener("click", () => { this.toggleEye(this.playerTwo, this.boardTwoEye); });
  }

  renderBoard(player) {
    const boardGrid = player.gameboardDOM.querySelector(".board-grid");
    const boardSize = player.gameboard.boardSize;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const createBox = (classNames = [], textContent = "") => {
      const box = document.createElement("div");
      box.className = "box"; // Default class

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

  showBoard(player) {
    this.colorAllShips(player, [
      "purple",
      "green",
      "orange",
      "royalblue",
      "pink",
    ]);
  }

  hideBoard(player) {
    this.colorAllShips(player, ["white"]);
  }

  updateTurn(playerOne, playerTwo) {
    const currentPlayer = playerOne.isCurrentTurn ? playerOne : playerTwo;
    const otherPlayer = playerOne.isCurrentTurn ? playerTwo : playerOne;

    this.setPlayerStyles(
      currentPlayer,
      "0px",
      "darkred",
      "0px 0px 50px red",
      "100px",
    );
    this.setPlayerStyles(otherPlayer, "200px", "green", "revert", "0px");

    // The ferry icon is located only on playerOne's gameboardDOM
    const ferryLeft = playerOne.isCurrentTurn ? "605px" : "25px";
    playerOne.gameboardDOM.querySelector(".ferry").style.left = ferryLeft;

    if (this.gameMode === 'versus') this.closeAllEyes();
  }

  setPlayerStyles(
    player,
    targetTop,
    boardTitleColor,
    gridBoxShadow,
    eyeBottom,
  ) {
    const DOM = player.gameboardDOM;
    DOM.querySelector(".target").style.top = targetTop;
    DOM.querySelector(".board-title").style.color = boardTitleColor;
    DOM.querySelector(".board-grid").style.boxShadow = gridBoxShadow;
    DOM.querySelector(".eye").style.bottom = eyeBottom;
  }

  getShipBoxDOM(player, [y, x]) {
    return player.gameboardDOM.querySelector(`.BOX${x}-${y}`);
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

  toggleEye(player, eye) {
    const isEyeClosed = eye.classList.contains('eye-closed');

    if (isEyeClosed) {
      this.setEyeState(eye, 'opened');
      this.showBoard(player);
    } else {
      this.setEyeState(eye, 'closed');
      this.hideBoard(player);
    }
  }

  setEyeState(eye, state) {
    eye.classList.remove('eye-closed', 'eye-opened');
    eye.classList.add(`eye-${state}`);
  }

  closeAllEyes() {
    this.setEyeState(this.boardOneEye, 'closed');
    this.setEyeState(this.boardTwoEye, 'closed');
    this.hideBoard(this.playerOne);
    this.hideBoard(this.playerTwo);
  }
}
