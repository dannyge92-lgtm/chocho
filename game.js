const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart');
const overlay = document.getElementById('overlay');
const message = document.getElementById('message');

const width = canvas.width;
const height = canvas.height;

const keys = {
  left: false,
  right: false,
};

function safeReadBestScore() {
  try {
    return Number(window.localStorage.getItem('chocho-best') || 0);
  } catch {
    return 0;
  }
}

function safeWriteBestScore(value) {
  try {
    window.localStorage.setItem('chocho-best', String(value));
  } catch {
    // Puede fallar en file:// o navegadores con storage bloqueado.
  }
}

function roundedRect(x, y, w, h, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }

  const r = Math.min(radius, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

const state = {
  running: true,
  score: 0,
  best: safeReadBestScore(),
  spawnTimer: 0,
  spawnEvery: 0.8,
  speedBase: 170,
  lastTime: 0,
  player: {
    x: width / 2 - 22,
    y: height - 56,
    width: 44,
    height: 26,
    speed: 320,
  },
  obstacles: [],
};

bestScoreEl.textContent = String(state.best);

function restart() {
  state.running = true;
  state.score = 0;
  state.spawnTimer = 0;
  state.speedBase = 170;
  state.player.x = width / 2 - state.player.width / 2;
  state.obstacles = [];
  scoreEl.textContent = '0';
  overlay.classList.add('hidden');
  message.textContent = 'Perdiste';
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnObstacle() {
  const size = randomRange(26, 58);
  state.obstacles.push({
    x: randomRange(0, width - size),
    y: -size,
    size,
    speed: state.speedBase + randomRange(-30, 60),
    hue: randomRange(345, 360),
  });
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function lose() {
  state.running = false;
  message.textContent = `¡Fin de partida! Puntuación: ${Math.floor(state.score)}`;
  overlay.classList.remove('hidden');
}

function update(dt) {
  if (!state.running) {
    return;
  }

  const direction = Number(keys.right) - Number(keys.left);
  state.player.x += direction * state.player.speed * dt;
  state.player.x = clamp(state.player.x, 0, width - state.player.width);

  state.spawnTimer += dt;
  const difficulty = Math.min(2.6, 1 + state.score / 180);
  const targetEvery = clamp(0.8 / difficulty, 0.22, 0.8);
  state.spawnEvery += (targetEvery - state.spawnEvery) * 0.04;

  if (state.spawnTimer >= state.spawnEvery) {
    state.spawnTimer = 0;
    spawnObstacle();
  }

  state.speedBase = 170 + state.score * 0.45;

  for (const obstacle of state.obstacles) {
    obstacle.y += obstacle.speed * dt;
    const box = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.size,
      height: obstacle.size,
    };
    if (intersects(state.player, box)) {
      lose();
      break;
    }
  }

  state.obstacles = state.obstacles.filter((o) => o.y < height + o.size);

  state.score += dt * 28;
  const rounded = Math.floor(state.score);
  scoreEl.textContent = String(rounded);

  if (rounded > state.best) {
    state.best = rounded;
    bestScoreEl.textContent = String(state.best);
    safeWriteBestScore(state.best);
  }
}

function drawPlayer() {
  const { x, y, width: w, height: h } = state.player;
  ctx.fillStyle = '#5ab1ff';
  ctx.beginPath();
  roundedRect(x, y, w, h, 8);
  ctx.fill();

  ctx.fillStyle = '#d6f3ff';
  ctx.beginPath();
  roundedRect(x + 6, y + 5, w - 12, h - 12, 6);
  ctx.fill();
}

function drawObstacles() {
  for (const obstacle of state.obstacles) {
    ctx.fillStyle = `hsl(${obstacle.hue} 90% 62%)`;
    ctx.beginPath();
    roundedRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size, 8);
    ctx.fill();
  }
}

function drawBackground(time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#090c20');
  gradient.addColorStop(1, '#131a45');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(119, 243, 208, 0.13)';
  for (let i = 0; i < 50; i += 1) {
    const x = ((i * 57.31 + time * 0.03) % width + width) % width;
    const y = (i * 41.73 + time * 0.13) % height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function render(time) {
  drawBackground(time);
  drawObstacles();
  drawPlayer();

  if (!state.running) {
    ctx.fillStyle = 'rgba(5, 8, 30, 0.62)';
    ctx.fillRect(0, 0, width, height);
  }
}

function frame(timestamp) {
  const now = timestamp / 1000;
  const dt = Math.min(0.033, now - (state.lastTime || now));
  state.lastTime = now;

  update(dt);
  render(timestamp);

  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    keys.left = true;
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    keys.right = true;
  }
  if (event.key.toLowerCase() === 'r') {
    restart();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    keys.left = false;
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    keys.right = false;
  }
});

restartBtn.addEventListener('click', restart);
restart();
requestAnimationFrame(frame);
