// Game Constants
const PLAYER_SIZE = 40;
const TILE_SIZE = Math.floor(PLAYER_SIZE * 1.25);
const WORLD_SIZE = 9;
const RENDER_DISTANCE = 13;
const BASE_PLAYER_SPEED = 200;
const SPRINT_MULTIPLIER = 3;
const SPRINT_DURATION = 1;
const SPRINT_COOLDOWN = 3;

// Colors
const COLOR_PLAYER = 'green';
const COLOR_WALL = '#DB571C';
const COLOR_WHITE_TILE = 'white';
const COLOR_BLACK_TILE = 'black';
const COLOR_END_SQUARE = 'red';
const COLOR_ENEMY = 'purple';

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Screen dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player Setup
let player_x = 4 * TILE_SIZE;
let player_y = 4 * TILE_SIZE;
let player_speed = BASE_PLAYER_SPEED;
let is_sprinting = false;
let sprint_end_time = 0;
let cooldown_end_time = 0;

// Maze generation
let walls = new Set();
let end_square = { x: WORLD_SIZE - 2, y: WORLD_SIZE - 2 }; // Bottom-right corner

function gridToIso(x, y) {
    const tileWidth = 64;
    const tileHeight = 32;
    const screenX = (x - y) * (tileWidth / 2);
    const screenY = (x + y) * (tileHeight / 2);
    return { x: screenX, y: screenY };
}

// Maze generation
function generateMaze() {
    walls.clear();
    const maze = Array.from({ length: WORLD_SIZE }, () => Array(WORLD_SIZE).fill(1));

    function carvePassages(cx, cy) {
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
        directions.sort(() => Math.random() - 0.5); // Shuffle directions
        for (let [dx, dy] of directions) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx > 0 && ny > 0 && nx < WORLD_SIZE && ny < WORLD_SIZE && maze[ny][nx] === 1) {
                maze[cy + dy / 2][cx + dx / 2] = 0;
                maze[ny][nx] = 0;
                carvePassages(nx, ny);
            }
        }
    }

    maze[1][1] = 0; // Start point
    carvePassages(1, 1);

    // Expand maze to a 3x3 cell grid
    const expandedMaze = Array.from({ length: WORLD_SIZE * 3 }, () => Array(WORLD_SIZE * 3).fill(1));
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            if (maze[y][x] === 0) {
                const cx = x * 3;
                const cy = y * 3;
                for (let i = 1; i < 4; i++) {
                    for (let j = 1; j < 4; j++) {
                        expandedMaze[cy + i - 1][cx + j - 1] = 0;
                    }
                }
            }
        }
    }

    // Store walls for collision detection
    for (let y = 0; y < WORLD_SIZE * 3; y++) {
        for (let x = 0; x < WORLD_SIZE * 3; x++) {
            if (expandedMaze[y][x] === 1) {
                walls.add(`${x},${y}`);
            }
        }
    }

    end_square = { x: WORLD_SIZE * 3 - 4, y: WORLD_SIZE * 3 - 4 }; // Adjust end square
}

// Enemy Setup (for simplicity, we'll leave it empty for now)
let enemies = [];

function movePlayer(dt) {
    const speed = is_sprinting ? player_speed * SPRINT_MULTIPLIER : player_speed;
    const movement = speed * dt;
    if (keys['up']) player_y -= movement;
    if (keys['down']) player_y += movement;
    if (keys['left']) player_x -= movement;
    if (keys['right']) player_x += movement;
}

// Game Loop
function gameLoop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderWorld();
    movePlayer(dt);

    requestAnimationFrame(gameLoop);
}

function renderWorld() {
    const startX = Math.floor(player_x / TILE_SIZE) - RENDER_DISTANCE;
    const startY = Math.floor(player_y / TILE_SIZE) - RENDER_DISTANCE;

    for (let y = -RENDER_DISTANCE; y <= RENDER_DISTANCE; y++) {
        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            const gridX = startX + x;
            const gridY = startY + y;

            const screenX = (x + RENDER_DISTANCE) * TILE_SIZE;
            const screenY = (y + RENDER_DISTANCE) * TILE_SIZE;

            if (walls.has(`${gridX},${gridY}`)) {
                ctx.fillStyle = COLOR_WALL;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else if (gridX === end_square.x && gridY === end_square.y) {
                ctx.fillStyle = COLOR_END_SQUARE;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = (gridX + gridY) % 2 === 0 ? COLOR_WHITE_TILE : COLOR_BLACK_TILE;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw Player
    ctx.fillStyle = COLOR_PLAYER;
    ctx.fillRect(player_x, player_y, PLAYER_SIZE, PLAYER_SIZE);
}

// Event Listeners for Movement
let keys = { up: false, down: false, left: false, right: false };
document.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys['up'] = true;
    if (e.key === 's') keys['down'] = true;
    if (e.key === 'a') keys['left'] = true;
    if (e.key === 'd') keys['right'] = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys['up'] = false;
    if (e.key === 's') keys['down'] = false;
    if (e.key === 'a') keys['left'] = false;
    if (e.key === 'd') keys['right'] = false;
});

// Initialize the Game
generateMaze();
let lastTime = performance.now();
gameLoop();
