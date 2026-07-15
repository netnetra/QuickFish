const hook = document.getElementById("hook");
const line = document.getElementById("line");
const scoreEl = document.getElementById("score");
const fishLayer = document.getElementById("fish-layer");

const hookState = { x: 360, y: 170 };
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let score = 0;
let lastTime = 0;
let spawnTimer = 0;

const fishTypes = [
  { name: "small", points: -5, width: 56, height: 36, speed: 1.2 },
  { name: "medium", points: 10, width: 84, height: 42, speed: 1.0 },
  { name: "large", points: -5, width: 110, height: 48, speed: 0.8 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateHook() {
  if (keys.ArrowUp) hookState.y -= 7;
  if (keys.ArrowDown) hookState.y += 7;
  if (keys.ArrowLeft) hookState.x -= 7;
  if (keys.ArrowRight) hookState.x += 7;

  hookState.x = clamp(hookState.x, 40, 700);
  hookState.y = clamp(hookState.y, 110, 450);

  hook.style.left = `${hookState.x}px`;
  hook.style.top = `${hookState.y}px`;
  line.style.height = `${Math.max(0, hookState.y - 112)}px`;
}

function spawnFish() {
  if (fishLayer.children.length >= 6) return;

  const config = fishTypes[Math.floor(Math.random() * fishTypes.length)];
  const fish = document.createElement("div");
  fish.className = `fish ${config.name}`;
  fish.dataset.size = config.name;
  fish.dataset.points = config.points;
  fish.dataset.speed = config.speed;

  const direction = Math.random() > 0.5 ? 1 : -1;
  const startX = direction === 1 ? -140 : 760;
  const startY = 140 + Math.random() * 220;
  fish.dataset.x = startX;
  fish.dataset.y = startY;
  fish.dataset.direction = direction;

  fish.style.left = `${startX}px`;
  fish.style.top = `${startY}px`;
  fish.style.width = `${config.width}px`;
  fish.style.height = `${config.height}px`;

  fishLayer.appendChild(fish);
}

function updateFish(delta) {
  const fishList = Array.from(fishLayer.children);

  fishList.forEach((fish) => {
    const direction = Number(fish.dataset.direction);
    const speed = Number(fish.dataset.speed) * (delta / 16);
    let x = Number(fish.dataset.x) + direction * speed;
    const y = Number(fish.dataset.y);

    if (x < -180 || x > 760) {
      fish.remove();
      return;
    }

    fish.dataset.x = x;
    fish.style.left = `${x}px`;
    fish.style.top = `${y}px`;

    const hookRect = hook.getBoundingClientRect();
    const fishRect = fish.getBoundingClientRect();
    const overlap = !(
      hookRect.right < fishRect.left ||
      hookRect.left > fishRect.right ||
      hookRect.bottom < fishRect.top ||
      hookRect.top > fishRect.bottom
    );

    if (overlap) {
      score += Number(fish.dataset.points);
      scoreEl.textContent = score;
      fish.remove();
    }
  });
}

function animate(time) {
  if (!lastTime) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;

  updateHook();
  spawnTimer += delta;
  if (spawnTimer > 900) {
    spawnTimer = 0;
    spawnFish();
  }

  updateFish(delta);
  requestAnimationFrame(animate);
}

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    keys[event.key] = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keys[event.key] = false;
  }
});

requestAnimationFrame(animate);
