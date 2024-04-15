let game = null;
const handleAddPlayer = () => {
  const player = new Player("p" + (game.players.length + 1));
  game.addPlayer(player);
};

const startGame = () => {
  const gridSizeInput = document.createElement("input");
  gridSizeInput.setAttribute("id", "grid-size");
  gridSizeInput.setAttribute("min", 1);
  gridSizeInput.setAttribute("max", 7);
  gridSizeInput.setAttribute("type", "number");
  gridSizeInput.setAttribute("placeholder", "Size of the grid");
  const btn = document.createElement("button");
  btn.innerText = "Create";

  btn.setAttribute("id", "create");
  document.getElementById("app").innerHTML = null;
  const inputContainer = document.createElement("div");
  inputContainer.append(gridSizeInput);
  inputContainer.append(btn);
  inputContainer.classList.add("input-container");

  document.getElementById("app").append(inputContainer);

  const addPlayerBtn = document.getElementById("add-player");
  const restartBtn = document.getElementById("restart");

  restartBtn.style.display = "none";
  addPlayerBtn.style.display = "none";
  addPlayerBtn.addEventListener("click", handleAddPlayer);
  document.getElementById("navigation").setAttribute("data-enable", "0");

  btn.onclick = () => {
    if (!gridSizeInput.value) {
      alert("Please add some value to play the game");
      return;
    }
    if (Number(gridSizeInput.value) <= 1 || Number(gridSizeInput.value) > 7) {
      alert("The grid size must be between in 1 and 7");
      return;
    }
    document.getElementById("navigation").setAttribute("data-enable", "1");

    game = new Game(gridSizeInput.value);
    const player1 = new Player("p1");

    game.addPlayer(player1);
    game.draw();
    addPlayerBtn.style.display = "flex";
    restartBtn.style.display = "flex";
  };
};

const sleep = () => {
  const currPlayer = game.players[game.currentPlayerIdx];

  game.announce(`The next turn of ${currPlayer.getName()} is in 5 sec`);

  let count = 1;
  const id = setInterval(() => {
    game.announce(
      `The next turn of ${currPlayer.getName()} is in  ${5 - count} sec`
    );

    if (count === 5) {
      clearInterval(id);
      document.getElementById("navigation").onclick = handleNavigation;

      document.addEventListener("keydown", handlePlayerMovement);
    }
    count += 1;
  }, 1000);
};
const handlePlayerMovement = (ev) => {
  const currPlayer = game.players[game.currentPlayerIdx];
  const [x, y] = currPlayer.getPosition();

  switch (ev.code) {
    case "ArrowUp":
      currPlayer.setPosition([Math.max(x - 1, 0), y]);
      break;
    case "ArrowDown":
      currPlayer.setPosition([Math.min(x + 1, game.grid[0].length - 1), y]);
      break;
    case "ArrowLeft":
      currPlayer.setPosition([x, Math.max(y - 1, 0)]);
      break;
    case "ArrowRight":
      currPlayer.setPosition([x, Math.min(y + 1, game.grid[0].length - 1)]);
      break;
    case "KeyR":
      currPlayer.setPosition([Math.max(x - 1, 0), Math.max(y - 1, 0)]);
      break;
    case "KeyB":
      currPlayer.setPosition([
        Math.min(x + 1, game.grid[0].length - 1),
        Math.min(y + 1, game.grid[0].length - 1),
      ]);
      break;
    case "KeyC":
      currPlayer.setPosition([
        Math.min(x + 1, game.grid[0].length - 1),
        Math.max(y - 1, 0),
      ]);
      break;
    case "KeyY":
      currPlayer.setPosition([
        Math.max(x - 1, 0),
        Math.min(y + 1, game.grid[0].length - 1),
      ]);
      break;
  }
  if (
    [
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "KeyR",
      "KeyY",
      "KeyC",
      "KeyB",
    ].includes(ev.code)
  ) {
    document.removeEventListener("keydown", handlePlayerMovement);
    document.getElementById("navigation").onclick = () => {};
    game.draw();
  }
};
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("add-player");

  btn.style.display = "none";
  startGame();
});

class Player {
  constructor(name) {
    this.name = name;
    this.x = null;
    this.y = null;
    this.isVisible = true;
  }
  setPosition(arr) {
    const [x, y] = arr;
    this.x = x;
    this.y = y;
  }
  getName() {
    return this.name;
  }
  getPosition() {
    return [this.x, this.y];
  }
}
class Game {
  constructor(rows) {
    this.grid = [];
    for (let i = 0; i < rows; i++) {
      const rowArr = [];
      rowArr.length = rows;
      rowArr.fill(0);
      this.grid.push(rowArr);
    }
    const tgtRow = Math.round(Math.random() * (rows - 1));
    const tgtColumn = Math.round(Math.random() * (rows - 1));
    this.tgtColumn = tgtColumn;
    this.tgtRow = tgtRow;
    this.grid[tgtRow][tgtColumn] = "T";
    this.players = [];
    this.currentPlayerIdx = -1;
  }
  addPlayer(player) {
    if (this.players.length === this.grid.length * this.grid.length - 2) {
      document.getElementById("add-player").setAttribute("disabled", true);
    }
    const [x, y] = this.getRandomPosition();
    player.setPosition([x, y]);
    this.players.push(player);
    if (this.players.length > 1) {
      const box = document.querySelector(`[data-position="${x}_${y}"]`);
      box.classList.add("player");
      box.innerText = player.getName();
    }
  }
  getRandomPosition() {
    let row = Math.round(Math.random() * (this.grid.length - 1));
    let column = Math.round(Math.random() * (this.grid[0].length - 1));
    while (this.grid[row][column] === "T" || this.grid[row][column] === "X") {
      row = Math.round(Math.random() * (this.grid.length - 1));
      column = Math.round(Math.random() * (this.grid[0].length - 1));
    }
    this.grid[row][column] = "X";
    return [row, column];
  }
  removeAnyPlayerIntersecting() {
    for (let i = 0; i < this.players.length; i++) {
      const [x, y] = this.players[i].getPosition();
      let intersectingPlayerIdx = null;
      for (let j = i + 1; j < this.players.length; j++) {
        const [x1, y1] = this.players[j].getPosition();
        if (x === x1 && y === y1) {
          intersectingPlayerIdx = j;
          break;
        }
      }
      if (intersectingPlayerIdx) {
        this.announce(
          `${this.players[i].getName()} and ${this.players[
            intersectingPlayerIdx
          ].getName()} are removed from the game. `,
          true
        );

        this.players = this.players.filter(
          (_, k) => i !== k && intersectingPlayerIdx !== k
        );
        break;
      }
    }
  }
  announce(msg, giveAlert) {
    if (giveAlert) {
      alert(msg);
    } else {
      const h1 = document.getElementById("announcement");
      h1.innerText = msg;
    }
  }
  checkWinnerOrGameOver() {
    if (!this.players.length) {
      this.announce("Game is over no player to play the game", true);
      this.announce("");
      return true;
    }
    for (let i = 0; i < this.players.length; i++) {
      const currPlayer = this.players[i];
      const [x, y] = currPlayer.getPosition();

      if (this.tgtColumn === y && this.tgtRow === x) {
        this.announce(`Game over. ${currPlayer.getName()} won the game`, true);
        this.announce("");
        return true;
      }
    }
  }
  draw() {
    this.removeAnyPlayerIntersecting();
    const showPosition = this.checkWinnerOrGameOver();
    if (showPosition) {
      const restart = confirm("Press ok to restart the game");
      if (restart) {
        return startGame();
      }
    }
    this.currentPlayerIdx = (this.currentPlayerIdx + 1) % this.players.length;

    const gameBoard = document.createElement("div");
    gameBoard.classList.add("game-board");

    const grid = this.grid;
    for (let i = 0; i < this.grid.length; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      const rowState = [];
      for (let j = 0; j < this.grid[i].length; j++) {
        rowState.push(0);
        const box = document.createElement("div");
        box.classList.add("box");
        box.dataset.position = i + "_" + j;
        if (grid[i][j] === "T") {
          box.classList.add("tgt");
          box.innerText = "T";
        }
        if (this.currentPlayerIdx !== -1) {
          const currPlayer = this.players[this.currentPlayerIdx];
          const [x, y] = currPlayer.getPosition();
          if (x === i && j === y) {
            box.classList.add("player");
            box.innerText = currPlayer.getName();
          }
        }

        row.appendChild(box);
      }
      gameBoard.append(row);
    }
    document.getElementById("app").innerHTML = null;
    document.getElementById("app").append(gameBoard);

    sleep();
  }
}
const handleNavigation = (ev) => {
  handlePlayerMovement({ code: ev.target.dataset.nav });
};
