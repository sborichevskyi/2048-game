"use strict";
import {
  BOARD_SIZE,
  INITIAL_TILES,
  RARE_INITIAL_TILES,
  WIN_VALUE,
  MATRIX,
} from "../constants/game.config.js";

class Game {
  constructor(initialState = MATRIX) {
    this.board = initialState;
    this.score = 0;
    this.newTile = null;
    this.mergedTiles = [];

    this.field = document.querySelector(".game-field");

    if (!this.field) {
      throw new Error("Не знайдено елемент .game-field в DOM!");
    }

    this.initBoard();
    this.renderBoard();
  }

  filterZero(row) {
    return row.filter((num) => num !== 0);
  }

  initBoard() {
    this.cells = [];
    this.field.innerHTML = "";

    for (let row = 0; row < BOARD_SIZE; row++) {
      this.cells[row] = [];

      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = document.createElement("div");

        cell.classList.add("field-cell");
        this.field.appendChild(cell);
        this.cells[row][col] = cell;
      }
    }
  }

  renderBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = this.cells[row][col];
        const value = this.board[row][col];

        cell.textContent = value || "";
        cell.className = `field-cell${value ? ` field-cell--${value}` : ""}`;

        if (
          this.newTile &&
          this.newTile.row === row &&
          this.newTile.col === col
        ) {
          cell.classList.add("field-cell--new");

          cell.addEventListener(
            "animationend",
            () => cell.classList.remove("field-cell--new"),
            { once: true },
          );
        }
      }
    }

    const scoreEl = document.querySelector(".game-score");

    if (scoreEl) {
      scoreEl.textContent = String(this.score);
    }
  }

  spawnNumber() {
    const emptyCells = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (this.board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const randCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const numberToSpawn =
      Math.random() < 0.1 ? RARE_INITIAL_TILES : INITIAL_TILES;

    this.board[randCell.row][randCell.col] = numberToSpawn;
    this.newTile = randCell;
    this.renderBoard();
    this.newTile = null;
  }

  isGameOver() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (this.board[row][col] === WIN_VALUE) {
          return "win";
        }
      }
    }

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (this.board[row][col] === 0) {
          return "playing";
        }

        if (
          col < BOARD_SIZE - 1 &&
          this.board[row][col] === this.board[row][col + 1]
        ) {
          return "playing";
        }

        if (
          row < BOARD_SIZE - 1 &&
          this.board[row][col] === this.board[row + 1][col]
        ) {
          return "playing";
        }
      }
    }

    return "lose";
  }

  boardsAreEqual(board1, board2) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board1[i][j] !== board2[i][j]) {
          return false;
        }
      }
    }

    return true;
  }

  moveLeft() {
    const prevBoard = JSON.parse(JSON.stringify(this.board));

    for (let i = 0; i < BOARD_SIZE; i++) {
      let row = this.board[i];

      row = this.filterZero(row);

      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          row[j + 1] = 0;
          this.score += row[j];
          this.mergedTiles.push({ row: i, col: j });
        }
      }
      row = this.filterZero(row);

      while (row.length < BOARD_SIZE) {
        row.push(0);
      }
      this.board[i] = row;
    }
    this.renderBoard();

    if (!this.boardsAreEqual(prevBoard, this.board)) {
      this.spawnNumber();
    }
    this.checkGameStatus();
  }

  moveRight() {
    const prevBoard = JSON.parse(JSON.stringify(this.board));

    for (let i = 0; i < BOARD_SIZE; i++) {
      let row = this.board[i].reverse();

      row = this.filterZero(row);

      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          row[j + 1] = 0;
          this.score += row[j];

          this.mergedTiles.push({
            row: i,
            col: 3 - j,
          });
        }
      }
      row = this.filterZero(row);

      while (row.length < BOARD_SIZE) {
        row.push(0);
      }
      this.board[i] = row.reverse();
    }
    this.renderBoard();

    if (!this.boardsAreEqual(prevBoard, this.board)) {
      this.spawnNumber();
    }
    this.checkGameStatus();
  }

  moveUp() {
    const prevBoard = JSON.parse(JSON.stringify(this.board));

    this.mergedTiles = [];

    for (let col = 0; col < BOARD_SIZE; col++) {
      let column = [];

      for (let row = 0; row < BOARD_SIZE; row++) {
        column.push(this.board[row][col]);
      }

      column = this.filterZero(column);

      for (let i = 0; i < column.length - 1; i++) {
        if (column[i] === column[i + 1]) {
          column[i] *= 2;
          column[i + 1] = 0;
          this.score += column[i];

          this.mergedTiles.push({
            row: i,
            col: col,
          });
        }
      }

      column = this.filterZero(column);

      while (column.length < BOARD_SIZE) {
        column.push(0);
      }

      for (let row = 0; row < BOARD_SIZE; row++) {
        this.board[row][col] = column[row];
      }
    }

    this.renderBoard();

    if (!this.boardsAreEqual(prevBoard, this.board)) {
      this.spawnNumber();
    }

    this.checkGameStatus();
  }

  moveDown() {
    const prevBoard = JSON.parse(JSON.stringify(this.board));

    this.mergedTiles = [];

    for (let col = 0; col < BOARD_SIZE; col++) {
      let column = [];

      for (let row = 0; row < BOARD_SIZE; row++) {
        column.push(this.board[row][col]);
      }

      column = this.filterZero(column);
      column.reverse();

      for (let i = 0; i < column.length - 1; i++) {
        if (column[i] === column[i + 1]) {
          column[i] *= 2;
          column[i + 1] = 0;
          this.score += column[i];

          this.mergedTiles.push({
            row: 3 - i,
            col: col,
          });
        }
      }

      column = this.filterZero(column);

      while (column.length < BOARD_SIZE) {
        column.push(0);
      }

      column.reverse();

      for (let row = 0; row < BOARD_SIZE; row++) {
        this.board[row][col] = column[row];
      }
    }

    this.renderBoard();

    if (!this.boardsAreEqual(prevBoard, this.board)) {
      this.spawnNumber();
    }

    this.checkGameStatus();
  }

  getScore() {
    return this.score;
  }

  getState() {
    return this.board;
  }

  getStatus() {
    const messageContainer = document.querySelector(".message-container");
    const visibleMessage = messageContainer.querySelector("p:not(.hidden)");

    if (visibleMessage) {
      if (visibleMessage.classList.contains("message-start")) {
        return "idle";
      }

      if (visibleMessage.classList.contains("message-win")) {
        return "win";
      }

      if (visibleMessage.classList.contains("message-lose")) {
        return "lose";
      }
    } else {
      return `playing`;
    }
  }

  checkGameStatus() {
    const curStatus = this.isGameOver();

    if (curStatus === "win" || curStatus === "lose") {
      this.showMessage(curStatus);
    }
  }

  showMessage(type) {
    const message = document.querySelector(`.message.message-${type}`);

    message.classList.remove("hidden");
    document.removeEventListener("keydown", this.boundKeyDown);
  }

  start() {
    this.initBoard();

    this.spawnNumber();
    this.spawnNumber();

    const footerMessage = document.querySelectorAll(".message");

    footerMessage.forEach((element) => element.classList.add("hidden"));

    this.boundKeyDown = this.keyDown.bind(this);
    document.addEventListener("keydown", this.boundKeyDown);
  }

  restart() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        this.board[row][col] = 0;

        const cell = this.cells[row][col];

        cell.textContent = "";
        cell.className = "field-cell";
      }
    }

    document.querySelector(".message.message-lose")?.classList.add("hidden");
    document.querySelector(".message.message-win")?.classList.add("hidden");
    document.querySelector(".message.message-start")?.classList.add("hidden");
    document.removeEventListener("keydown", this.boundKeyDown);

    this.newTile = null;
    this.score = 0;
    this.renderBoard();
    this.spawnNumber();
    this.spawnNumber();
    this.boundKeyDown = this.keyDown.bind(this);
    document.addEventListener("keydown", this.boundKeyDown);
  }

  keyDown(e) {
    e.preventDefault();

    switch (e.key) {
      case "ArrowUp":
        this.moveUp();
        break;
      case "ArrowDown":
        this.moveDown();
        break;
      case "ArrowLeft":
        this.moveLeft();
        break;
      case "ArrowRight":
        this.moveRight();
        break;
    }
    this.checkGameStatus();
  }
}

export default Game;
