"use strict";

import Game from "../modules/Game.class.js";

const game = new Game();

const startButton = document.querySelector("button.start");

startButton.addEventListener("click", () => {
  if (game.getStatus() === "idle") {
    startButton.classList.remove("start");
    startButton.classList.add("restart");
    startButton.textContent = "Restart";
    game.start();
  } else {
    startButton.classList.remove("start");
    startButton.classList.add("restart");
    startButton.textContent = "Restart";
    game.restart();
  }
});
