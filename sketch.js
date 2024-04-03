// zabojeb. 2024
// [!] Project is WIP now

/*
At this stage the code is very bad, it is confusing,
unoptimized and probably violates all OOP principles.

Don't scold me, I wrote this at night.

So I would be very happy if someone could make it
prettier and more convenient.
*/

let startTime;
let elapsedTime = 0;
let timerStopped = true;

let player;
let exit;
let gridSize = 13;
let playerSpeed = 3;
let playerVelocityX = 0;
let playerVelocityY = 0;

let accelerationBase = 2;
let acceleration = 2;

let emptySpacePlayer = 2;
let emptySpaceExit = 1;

let shiftUsed = false;
let shiftActivated = false;
let shiftDuration = 25;
let shiftTimer = 0;

let losed = false;
let won = false;

let firstTimePlay = true;
let countWins = 0;

let walls = [];

let speedBySize = {
  9: 1.4,
  10: 1.45,
  11: 1.5,
  12: 1.55,
  13: 1.65,
  14: 1.75,
  15: 1.85,
  16: 1.95,
  17: 2.05,
  18: 2.15,
  19: 2.25,
  20: 2.35,
  21: 2.5,
  22: 2.5
}

// Game is non-optimized, so i added a POTATO mode.
// And yeah, it's true by default.
// But you can make it false and it will be very funnier to play! Really.
const potatoMode = true;
if (potatoMode) {
  gridSize = 13;
}

function preload() {
  loadStats();
  mediumFont = loadFont("PixelifySans-Medium.ttf");
  regularFont = loadFont("PixelifySans-Regular.ttf");
}

function setup() {
  // Timer
  elapsedTime = 0;

  textFont(mediumFont);

  createCanvas(windowWidth, windowHeight);

  drawGridFirst();

  player = createVector(random(width), random(height));
  exit = createVector(random(width), random(height));

  // Generation fix
  while (isWallMany(player.x, player.y, emptySpacePlayer)) {
    player = createVector(random(width), random(height));
  }
  while (isWallMany(exit.x, exit.y, emptySpaceExit)) {
    exit = createVector(random(width), random(height));
  }

  startTime = millis(); // Timer
  saveStats(); // Cookies for score statistics
}

function draw() {
  if (firstTimePlay) {
    drawMenu()
  }

  else if (losed) {
    afterLose();
  }
  else if (won) {
    afterWin();
  }
  else {
    noStroke();
    background(255);
    if (shiftActivated) {
      background(0)
    }

    // Drawing a game field
    drawGrid();

    // Wall checking
    if (!shiftActivated && isRealWall(player.x, player.y)) {
      textSize(32);
      textAlign(CENTER, CENTER);
      fill(255, 0, 0);
      background(0);

      // Lose
      losed = true;
      Lose();
    }

    // Exit checking
    if (dist(player.x, player.y, exit.x, exit.y) < gridSize) {
      textSize(32);
      textAlign(CENTER, CENTER);
      fill(0);

      // Win
      won = true;
      countWins += 1;
      Win();
    }

    // Drawing an exit
    exitColor = color(random(255), random(255), random(255));
    if (losed) {
      exitColor = color(255, 0, 0);
    }

    // Line from exit to player
    stroke(exitColor);
    line(
      player.x + gridSize / 2,
      player.y + gridSize / 2,
      exit.x + gridSize / 2,
      exit.y + gridSize / 2
    );
    noStroke();

    // Drawing an exit v2
    fill(255, 0, 0);
    if (shiftActivated) {
      fill(exitColor);
    }
    if (won) {
      fill(exitColor);
      noStroke();
    }

    stroke(exitColor);
    strokeWeight(2.5);
    rect(exit.x, exit.y, gridSize, gridSize);

    // Drawing a player
    fill(exitColor);
    if (won) {
      fill(exitColor);
    }

    noStroke();

    if (shiftActivated) {
      stroke(exitColor);
      fill(0);
    }

    rect(player.x, player.y, gridSize, gridSize);

    // Updating a player's position
    player.x += playerVelocityX;
    player.y += playerVelocityY;

    // Making funny things
    playerVelocityX *= 0.99;
    playerVelocityY *= 0.99;

    // Shift power updating
    if (shiftActivated) {
      shiftTimer++;
      if (shiftTimer >= shiftDuration) {
        shiftActivated = false;
        shiftTimer = 0;
      }
    }

    fill(255);
    stroke(0);
    textSize(20);
    text("Time: " + formatTime(elapsedTime), width - 70, height - 25);

    if (!timerStopped) {
      elapsedTime = millis() - startTime;
    }
  }
}

// This is needed for optimization
function drawGridFirst() {
  for (let x = 0; x < width; x += gridSize) {
    let row = [];

    for (let y = 0; y < height; y += gridSize) {
      if (isWall(x, y)) {
        fill(0);
        rect(x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);

        row.push(1);
      } else {
        fill(255);
        rect(x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);

        row.push(0);
      }
    }
    walls.push(row);
  }

  print(walls.length);
}

// Literally, function to draw a grid
function drawGrid() {
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      if (isWall(x, y)) {
        fill(0)
        if (shiftActivated) {
          fill(exitColor)
          rect((x - gridSize / 2) * random(0.997, 1 / 0.997), (y - gridSize / 2) * random(0.997, 1 / 0.997), gridSize, gridSize);
        }
        else {
          rect(x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);
        }
        // Debug Mode
        /*
        stroke(255,0,0);
        circle(x, y, 2);
        noStroke();
        */
      }
    }
  }

  // Ultra Debug Mode
  /*
  for (let i = 0; i < width; i+=3) {
    for (let j = 0; j < height; j+=3) {
      if (isWall(i, j)) {
        stroke(255, 0, 0);
        point(i, j);
      }
    }
  }
  */
}

// Wall checking for normal people
function isRealWall(x, y) {
  try {
    let status =
      walls[round((x + gridSize / 2) / gridSize)][
      round((y + gridSize / 2) / gridSize)
      ];

    if (status == 1) {
      return true;
    } else {
      return false;
    }
  } catch {
    print("catched error!");
    losed = true;
    Lose();
  }
}

// Wall checking
function isWall(x, y) {
  return noise(x * 0.025, y * 0.025) > 0.525;
}

// Many points wall checking
function isWallMany(x, y, r) {
  for (let i = x - r * gridSize; i < x + r * gridSize; i += gridSize) {
    for (let j = y - r * gridSize; j < y + r * gridSize; j += gridSize) {
      if (isWall(i, j) == true) {
        return true;
      }
    }
  }

  return false;
}

// Controls
function keyPressed() {
  // Таймер запускается при нажатии любой кнопки
  if (timerStopped & !losed & !won) {
    timerStopped = false;
    startTime = millis();
  }

  if (keyCode === UP_ARROW || keyCode === 87) {
    playerVelocityY -= acceleration;
  } else if (keyCode === DOWN_ARROW || keyCode === 83) {
    playerVelocityY += acceleration;
  } else if (keyCode === LEFT_ARROW || keyCode === 65) {
    playerVelocityX -= acceleration;
  } else if (keyCode === RIGHT_ARROW || keyCode === 68) {
    playerVelocityX += acceleration;
  } else if (keyCode === ENTER || keyCode === 32) {
    if (losed || won) {
      restartGame();
    }
  } else if (keyCode === SHIFT) {
    if (!shiftActivated && !shiftUsed) {
      // Проверка, активирована ли уже суперспособность
      activateSuperPower();
    }
  }
}

function keyReleased() {
  if (
    keyCode === UP_ARROW ||
    keyCode === DOWN_ARROW ||
    keyCode === 87 ||
    keyCode === 83
  ) {
    playerVelocityY *= 0.5;
  } else if (
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW ||
    keyCode === 65 ||
    keyCode === 68
  ) {
    playerVelocityX *= 0.5;
  }
}

// Shift superpower management
function activateSuperPower() {
  playerVelocityY *= 1.2;
  playerVelocityX *= 1.2;

  shiftUsed = true;
  shiftActivated = true;
}

// Win
let winColor;
let winColor2;
function Win() {
  noLoop();

  winColor = color(random(255), random(255), random(255));
  background(winColor);

  winColor2 = color(random(255), random(255), random(255));
  fill(winColor2);
  text("WIN", width / 2, height / 2);

  loop();
}

function afterWin() {
  timerStopped = true;

  let speed = 0.5;
  let foo = 25;

  let targetExitX = min(width, max(0, exit.x + random(-foo, foo)));
  let targetExitY = min(height, max(0, exit.y + random(-foo, foo)));
  let targetPlayerX = min(width, max(0, player.x + random(-foo, foo)));
  let targetPlayerY = min(height, max(0, player.y + random(-foo, foo)));

  exit.x = lerp(exit.x, targetExitX, speed);
  exit.y = lerp(exit.y, targetExitY, speed);

  player.x = lerp(player.x, targetPlayerX, speed);
  player.y = lerp(player.y, targetPlayerY, speed);

  background(winColor);

  textSize(50);
  textFont(mediumFont);
  text(
    "WIN",
    (width / 2) * random(0.99, 1 / 0.99),
    (height / 2.1) * random(0.99, 1 / 0.99)
  );

  textSize(30);
  textFont(regularFont);
  text("click to do it again!", width / 2, height / 1.85);

  text(
    "time: " + formatTime(elapsedTime),
    (width / 2) * random(0.995, 1 / 0.995),
    (height / 1.85 + 40) * random(0.995, 1 / 0.995)
  );

  text(
    "wins: " + str(countWins),
    (width / 2) * random(0.99, 1 / 0.99),
    (height / 1.85 + 80) * random(0.99, 1 / 0.99)
  );

  drawPlayerAndExitWon();
}

function drawPlayerAndExitWon() {
  exitColor = color(random(255), random(255), random(255));

  fill(exitColor);
  stroke(exitColor);
  strokeWeight(2.5);

  let r1 = random(0.5, 2);
  rect(exit.x, exit.y, gridSize * r1, gridSize * r1);

  fill(exitColor);
  if (won) {
    fill(exitColor);
    noStroke();
  }

  let r2 = random(0.5, 2);
  rect(player.x, player.y, gridSize * r2, gridSize * r2);
  noStroke();

  stroke(exitColor);
  line(
    player.x + (gridSize * r2) / 2,
    player.y + (gridSize * r2) / 2,
    exit.x + (gridSize * r1) / 2,
    exit.y + (gridSize * r1) / 2
  );
  noStroke();
}

// Lose
function Lose() {
  noLoop();
  background(0);

  fill(255, 0, 0);
  textSize(50);
  text("LOSE", width / 2, height / 2);

  loop();
}

function afterLose() {
  timerStopped = true;

  let speed = 0.05;
  let foo = 25;

  let targetExitX = exit.x + random(-foo, foo);
  let targetExitY = exit.y + random(-foo, foo);
  let targetPlayerX = player.x + random(-foo, foo);
  let targetPlayerY = player.y + random(-foo, foo);

  exit.x = lerp(exit.x, targetExitX, speed);
  exit.y = lerp(exit.y, targetExitY, speed);

  player.x = lerp(player.x, targetPlayerX, speed);
  player.y = lerp(player.y, targetPlayerY, speed);

  background(0);
  fill(255, 0, 0);

  textSize(50);
  textFont(mediumFont);
  text(
    "LOSE",
    (width / 2) * random(0.995, 1 / 0.995),
    (height / 2) * random(0.995, 1 / 0.995)
  );

  fill(random(180, 280), random(0, 100), random(0, 100));
  textSize(30);
  textFont(regularFont);
  text("click to restart!", width / 2, height / 1.75);

  drawPlayerAndExit();
}

function drawPlayerAndExit() {
  exitColor = color(random(255), random(255), random(255));
  if (losed) {
    exitColor = color(255, 0, 0);
  }

  stroke(exitColor);
  line(
    player.x + gridSize / 2,
    player.y + gridSize / 2,
    exit.x + gridSize / 2,
    exit.y + gridSize / 2
  );
  noStroke();

  fill(255, 0, 0);
  if (won) {
    fill(exitColor);
    noStroke();
  }

  stroke(exitColor);
  strokeWeight(2.5);
  rect(exit.x, exit.y, gridSize, gridSize);

  fill(exitColor);
  if (won) {
    fill(exitColor);
    noStroke();
  }
  rect(player.x, player.y, gridSize, gridSize);
  noStroke();
}

function mousePressed() {
  if (firstTimePlay) {
    firstTimePlay = false;
    restartGame();
  }
  else if (losed || won) {
    restartGame();
  }
  else if (!shiftActivated && !shiftUsed) {
    activateSuperPower();
  }
}

function restartGame() {
  gridSize = int(random(12, 18));
  if (potatoMode) {
    gridSize = int(random(18, 22))
  }
  print("gridSize: " + str(gridSize));

  noiseSeed(randomSeed());
  walls = [];

  losed = false;
  won = false;

  playerVelocityX = 0;
  playerVelocityY = 0;

  accelerationBase = speedBySize[gridSize];
  acceleration = accelerationBase;

  shiftUsed = false;

  rectMode(CORNER);

  setup();
  loop();
}

function drawMenu() {
  textAlign(CENTER, CENTER);

  background(255)

  textSize(30);
  textFont(regularFont);
  fill(0)
  text(
    "click to",
    (width / 2) * random(0.9975, 1 / 0.9975),
    (height / 2.55) * random(0.9975, 1 / 0.9975)
  );

  textSize(50);
  textFont(mediumFont);
  fill(0)
  text(
    "START",
    (width / 2) * random(0.9975, 1 / 0.9975),
    (height / 2.2) * random(0.9975, 1 / 0.9975)
  );
}

// COOKIES
function createCookie(name, value, days) {
  let expires;
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function saveStats() {
  let stats = {
    wins: countWins,
  };
  createCookie("gameStats", JSON.stringify(stats), 30); // Cookie will be stored for 30 days
  console.log('Cookies saved!', countWins)
}

function loadStats() {
  let stats = readCookie("gameStats");
  if (stats !== null) {
    stats = JSON.parse(stats);
    countWins = stats.wins;
  }
  console.log('Cookies loaded!')
}

function formatTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  milliseconds = milliseconds % 1000

  return nf(seconds, 2) + ":" + round(milliseconds)
}