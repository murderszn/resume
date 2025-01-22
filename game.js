// Select the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
let tileSize, rows, cols;

// Cyberpunk color palette
const colors = {
    wall: '#00ff41',      // Matrix green
    wallGlow: '#003B00',  // Darker green for glow effect
    pellet: '#ff00ff',    // Bright magenta
    player: '#00ffff',    // Cyan
    background: '#000033', // Dark blue background
    text: '#ff00ff'       // Magenta text`
};

// Extended vertical map (1 = wall, 2 = pellet)
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1],
    [1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const player = {
    x: 1,
    y: 1,
    direction: '',
    size: 0,
    speed: 0.05,
};

let startTime, elapsedTime;

// Constants for game setup
const TILE_SIZE = 32; // Size of each tile in pixels
const PLAYER_SIZE = 30; // Slightly smaller than tile size for visual clarity

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.map = map;
        this.tileSize = 32;
        this.player = {
            x: 1.5,  // Keep these as is - they represent the center of the tile
            y: 1.5,
            size: this.tileSize * 0.35,  // Slightly smaller for better visual fit
            speed: 0.15
        };
        
        this.startTime = Date.now();
        this.score = 0;
        this.particles = [];
        this.pelletValue = 10;
        this.trail = [];
        this.maxTrailLength = 10;
        this.setupCanvas();
        this.setupControls();
    }

    setupCanvas() {
        // Set canvas size based on map dimensions
        this.canvas.width = this.map[0].length * this.tileSize;
        this.canvas.height = this.map.length * this.tileSize;
    }

    // Improved collision detection
    checkCollision(newX, newY) {
        // Check more points around the player for better collision
        const checkPoints = [
            { x: newX - 0.45, y: newY - 0.45 }, // Top-left
            { x: newX + 0.45, y: newY - 0.45 }, // Top-right
            { x: newX - 0.45, y: newY + 0.45 }, // Bottom-left
            { x: newX + 0.45, y: newY + 0.45 }, // Bottom-right
            { x: newX, y: newY },               // Center
            { x: newX - 0.45, y: newY },        // Left
            { x: newX + 0.45, y: newY },        // Right
            { x: newX, y: newY - 0.45 },        // Top
            { x: newX, y: newY + 0.45 }         // Bottom
        ];

        for (let point of checkPoints) {
            const tileX = Math.floor(point.x);
            const tileY = Math.floor(point.y);
            
            // Check if position is within bounds and is a wall
            if (tileY < 0 || tileY >= this.map.length || 
                tileX < 0 || tileX >= this.map[0].length || 
                this.map[tileY][tileX] === 1) {
                return true; // Collision detected
            }
        }
        return false;
    }

    // Improved movement handling
    movePlayer(dx, dy) {
        const speed = this.player.speed;
        
        // Calculate new position
        const newX = this.player.x + dx * speed;
        const newY = this.player.y + dy * speed;
        
        // Add a small buffer to prevent wall clipping
        const buffer = 0.01;
        
        // Check X and Y movements separately for better wall sliding
        if (!this.checkCollision(newX + (dx * buffer), this.player.y)) {
            this.player.x = newX;
        }
        if (!this.checkCollision(this.player.x, newY + (dy * buffer))) {
            this.player.y = newY;
        }

        // Update pellet collection with particles and score
        const currentTileX = Math.floor(this.player.x);
        const currentTileY = Math.floor(this.player.y);
        if (this.map[currentTileY][currentTileX] === 2) {
            this.map[currentTileY][currentTileX] = 0;
            this.score += this.pelletValue;
            this.createCollectParticles(currentTileX, currentTileY);
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePlayer(1, 0);
                    break;
            }
        });
    }

    drawMap() {
        // Fill background
        this.ctx.fillStyle = colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add time-based animation for holographic effect
        const time = Date.now() / 1000;
        
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[0].length; col++) {
                const tile = this.map[row][col];
                if (tile === 1) {
                    // Wall with glow effect
                    this.ctx.shadowColor = colors.wall;
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = colors.wallGlow;
                    this.ctx.fillRect(
                        col * this.tileSize, 
                        row * this.tileSize, 
                        this.tileSize, 
                        this.tileSize
                    );
                    
                    this.ctx.shadowBlur = 5;
                    this.ctx.fillStyle = colors.wall;
                    this.ctx.fillRect(
                        col * this.tileSize + 2, 
                        row * this.tileSize + 2, 
                        this.tileSize - 4, 
                        this.tileSize - 4
                    );
                } else if (tile === 2) {
                    // Enhanced pellet with holographic effect
                    const pulseSize = Math.sin(time * 3 + row + col) * 0.3 + 1;
                    const hueShift = Math.sin(time * 2 + row * 0.5 + col * 0.5) * 30;
                    
                    // Outer glow
                    this.ctx.shadowColor = `hsl(${320 + hueShift}, 100%, 50%)`;
                    this.ctx.shadowBlur = 15;
                    
                    // Main pellet
                    this.ctx.fillStyle = `hsl(${320 + hueShift}, 100%, 50%)`;
                    this.ctx.beginPath();
                    this.ctx.arc(
                        col * this.tileSize + this.tileSize / 2,
                        row * this.tileSize + this.tileSize / 2,
                        (this.tileSize / 6) * pulseSize,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    
                    // Inner highlight
                    this.ctx.fillStyle = `hsla(${320 + hueShift}, 100%, 75%, 0.5)`;
                    this.ctx.beginPath();
                    this.ctx.arc(
                        col * this.tileSize + this.tileSize / 2 - 1,
                        row * this.tileSize + this.tileSize / 2 - 1,
                        (this.tileSize / 12) * pulseSize,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        }
        this.ctx.shadowBlur = 0;
    }

    drawPlayer() {
        // Update trail
        this.trail.unshift({ x: this.player.x, y: this.player.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (1 - i / this.maxTrailLength) * 0.5;
            this.ctx.shadowColor = colors.player;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(
                this.trail[i].x * this.tileSize,
                this.trail[i].y * this.tileSize,
                this.player.size * (1 - i / this.maxTrailLength),
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }

        // Draw player
        this.ctx.shadowColor = colors.player;
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = colors.player;
        this.ctx.beginPath();
        this.ctx.arc(
            this.player.x * this.tileSize,
            this.player.y * this.tileSize,
            this.player.size,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    checkWin() {
        for (let row of this.map) {
            if (row.includes(2)) return false;
        }
        return true;
    }

    createCollectParticles(x, y) {
        const numParticles = 8;
        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 * i) / numParticles;
            this.particles.push({
                x: x * this.tileSize,
                y: y * this.tileSize,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1.0,
                hue: 320 + Math.random() * 30
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        for (const p of this.particles) {
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawScanlines() {
        const scanlineHeight = 4;
        const scanlineAlpha = 0.1;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${scanlineAlpha})`;
        
        for (let i = 0; i < this.canvas.height; i += scanlineHeight * 2) {
            this.ctx.fillRect(0, i, this.canvas.width, scanlineHeight);
        }
    }

    gameLoop = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.drawMap();
        this.drawParticles();
        this.drawPlayer();
        this.drawScanlines();

        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Draw score and time with glow effect
        this.ctx.shadowColor = colors.text;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = colors.text;
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`TIME: ${elapsedTime}s`, 10, 30);
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 60);

        if (this.checkWin()) {
            this.ctx.fillStyle = colors.text;
            this.ctx.font = '30px "Press Start 2P"';
            const text = 'SYSTEM HACKED!';
            const textWidth = this.ctx.measureText(text).width;
            this.ctx.fillText(text, this.canvas.width / 2 - textWidth / 2, this.canvas.height / 2);
            return;
        }

        requestAnimationFrame(this.gameLoop);
    }

    start() {
        this.startTime = Date.now();
        this.gameLoop();
    }
}

// Initialize and start the game
const game = new Game('gameCanvas');
game.start();

// Resize and scale game to fit viewport
function resizeGame() {
    const width = window.innerWidth;
    const height = window.innerHeight * 0.9;

    rows = map.length;
    cols = map[0].length;
    
    // Calculate tile size based on both width and height constraints
    const tileWidth = Math.floor(width / cols);
    const tileHeight = Math.floor(height / rows);
    tileSize = Math.min(tileWidth, tileHeight);

    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;

    player.size = tileSize / 2;
}

// Draw the map with cyberpunk effects
function drawMap() {
    // Fill background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add time-based animation for holographic effect
    const time = Date.now() / 1000;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tile = map[row][col];
            if (tile === 1) {
                // Wall with glow effect
                ctx.shadowColor = colors.wall;
                ctx.shadowBlur = 10;
                ctx.fillStyle = colors.wallGlow;
                ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
                
                ctx.shadowBlur = 5;
                ctx.fillStyle = colors.wall;
                ctx.fillRect(
                    col * tileSize + 2, 
                    row * tileSize + 2, 
                    tileSize - 4, 
                    tileSize - 4
                );
            } else if (tile === 2) {
                // Enhanced pellet with holographic effect
                const pulseSize = Math.sin(time * 3 + row + col) * 0.3 + 1;
                const hueShift = Math.sin(time * 2 + row * 0.5 + col * 0.5) * 30;
                
                // Outer glow
                ctx.shadowColor = `hsl(${320 + hueShift}, 100%, 50%)`;
                ctx.shadowBlur = 15;
                
                // Main pellet
                ctx.fillStyle = `hsl(${320 + hueShift}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(
                    col * tileSize + tileSize / 2,
                    row * tileSize + tileSize / 2,
                    (tileSize / 6) * pulseSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Inner highlight
                ctx.fillStyle = `hsla(${320 + hueShift}, 100%, 75%, 0.5)`;
                ctx.beginPath();
                ctx.arc(
                    col * tileSize + tileSize / 2 - 1,
                    row * tileSize + tileSize / 2 - 1,
                    (tileSize / 12) * pulseSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    // Reset shadow effects
    ctx.shadowBlur = 0;
}

// Draw the player with cyberpunk effect
function drawPlayer() {
    ctx.shadowColor = colors.player;
    ctx.shadowBlur = 20;
    ctx.fillStyle = colors.player;
    ctx.beginPath();
    ctx.arc(
        player.x * tileSize + tileSize / 2,
        player.y * tileSize + tileSize / 2,
        player.size,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Move player
function movePlayer() {
    const directions = {
        ArrowUp: { dx: 0, dy: -1 },
        ArrowDown: { dx: 0, dy: 1 },
        ArrowLeft: { dx: -1, dy: 0 },
        ArrowRight: { dx: 1, dy: 0 },
    };

    const move = directions[player.direction];
    if (move) {
        const newX = player.x + move.dx * player.speed;
        const newY = player.y + move.dy * player.speed;
        if (map[Math.floor(newY)][Math.floor(newX)] !== 1) {
            player.x = newX;
            player.y = newY;

            // Collect pellets
            const tileX = Math.floor(player.x);
            const tileY = Math.floor(player.y);
            if (map[tileY][tileX] === 2) {
                map[tileY][tileX] = 0;
            }
        }
    }
}

// Check for win condition
function checkWin() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (map[row][col] === 2) {
                return false;
            }
        }
    }
    return true;
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawPlayer();
    movePlayer();

    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    // Draw time with glow effect
    ctx.shadowColor = colors.text;
    ctx.shadowBlur = 10;
    ctx.fillStyle = colors.text;
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(`TIME: ${elapsedTime}s`, 10, 30);

    if (checkWin()) {
        ctx.fillStyle = colors.text;
        ctx.font = '30px "Press Start 2P"';
        const text = 'SYSTEM HACKED!';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Input handling
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        player.direction = e.key;
    }
});

// Adjust the game viewport on resize
window.addEventListener('resize', resizeGame);

// Start the game
function startGame() {
    resizeGame();
    startTime = Date.now();
    gameLoop();
}

startGame();