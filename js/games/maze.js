/**
 * Побег из Лабиринта (Maze Escaper) - Procedural Maze Dungeon Canvas Game
 */
import { audio } from '../audio.js';

export class MazeEscaper {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onScore = config.onScore || (() => {});
        this.onAchievement = config.onAchievement || (() => {});
        this.onGameOver = config.onGameOver || (() => {});

        this.score = 0;
        this.highscore = config.highscore || 0;
        this.running = false;
        this.loopId = null;

        // Maze Grid Dimensions
        this.cols = 16;
        this.rows = 12;
        this.cellSize = 50; // 16 * 50 = 800 width, 12 * 50 = 600 height

        // Game state
        this.grid = []; // 2D array of cells: { x, y, walls: [top, right, bottom, left], visited }
        this.player = null;
        this.key = null;
        this.exit = null;
        this.hasKey = false;
        this.guards = [];
        this.particles = [];

        this.lastTime = 0;
        this.stats = {
            levelsEscaped: 0,
            livesLost: 0
        };

        this.setupInput();
    }

    setupInput() {
        this.keyHandler = (e) => {
            if (!this.running || !this.player) return;

            let nextX = this.player.x;
            let nextY = this.player.y;
            let wallIndex = -1; // 0: top, 1: right, 2: bottom, 3: left

            if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                nextY--;
                wallIndex = 0;
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                e.preventDefault();
                nextX++;
                wallIndex = 1;
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                e.preventDefault();
                nextY++;
                wallIndex = 2;
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                e.preventDefault();
                nextX--;
                wallIndex = 3;
            }

            if (wallIndex !== -1) {
                this.tryMove(nextX, nextY, wallIndex);
            }
        };

        window.addEventListener('keydown', this.keyHandler);
    }

    destroy() {
        window.removeEventListener('keydown', this.keyHandler);
        this.stop();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.score = 0;
        this.hasKey = false;
        this.particles = [];
        this.lastTime = performance.now();
        this.stats = {
            levelsEscaped: 0,
            livesLost: 0
        };

        this.player = {
            x: 0,
            y: 0,
            hp: 3,
            maxHp: 3
        };

        this.generateMaze();
        this.placeItems();
        this.spawnGuards();

        this.onScore(this.score);
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    stop() {
        this.running = false;
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
    }

    generateMaze() {
        // 1. Initialize grid cells
        this.grid = [];
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                row.push({
                    x: x,
                    y: y,
                    walls: [true, true, true, true], // Top, Right, Bottom, Left
                    visited: false
                });
            }
            this.grid.push(row);
        }

        // 2. DFS Maze Generation algorithm
        const stack = [];
        const current = this.grid[0][0];
        current.visited = true;
        stack.push(current);

        while (stack.length > 0) {
            const curr = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(curr.x, curr.y);

            if (neighbors.length > 0) {
                // Pick random neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove walls between curr and next
                this.removeWalls(curr, next);
                
                next.visited = true;
                stack.push(next);
            } else {
                stack.pop();
            }
        }
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const dirs = [
            { x: 0, y: -1, wall: 0 }, // Top
            { x: 1, y: 0, wall: 1 },  // Right
            { x: 0, y: 1, wall: 2 },  // Bottom
            { x: -1, y: 0, wall: 3 }  // Left
        ];

        dirs.forEach(d => {
            const nx = x + d.x;
            const ny = y + d.y;
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                const neighbor = this.grid[ny][nx];
                if (!neighbor.visited) {
                    neighbors.push(neighbor);
                }
            }
        });

        return neighbors;
    }

    removeWalls(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        if (dx === 1) {
            a.walls[3] = false; // a Left wall open
            b.walls[1] = false; // b Right wall open
        } else if (dx === -1) {
            a.walls[1] = false; // a Right wall open
            b.walls[3] = false; // b Left wall open
        }

        if (dy === 1) {
            a.walls[0] = false; // a Top wall open
            b.walls[2] = false; // b Bottom wall open
        } else if (dy === -1) {
            a.walls[2] = false; // a Bottom wall open
            b.walls[0] = false; // b Top wall open
        }
    }

    placeItems() {
        // Place key in bottom-right corner or opposite
        this.key = {
            x: this.cols - 1,
            y: this.rows - 1
        };

        // Place exit hatch in top-right or center
        this.exit = {
            x: this.cols - 1,
            y: 0
        };
    }

    spawnGuards() {
        this.guards = [];
        // Spawn 3 patrolling guards
        const spawnPoints = [
            { x: 4, y: 4, dx: 1, dy: 0 },
            { x: 8, y: 8, dx: 0, dy: 1 },
            { x: 12, y: 2, dx: -1, dy: 0 }
        ];

        spawnPoints.forEach((sp, idx) => {
            this.guards.push({
                id: idx,
                x: sp.x,
                y: sp.y,
                dx: sp.dx,
                dy: sp.dy,
                speed: 0.05, // Grid steps per update frame
                moveTimer: 0,
                moveInterval: 800, // ms per step
                color: '#ff3b30'
            });
        });
    }

    tryMove(nextX, nextY, wallIdx) {
        if (!this.player) return;

        const currentCell = this.grid[this.player.y][this.player.x];
        
        // Check if wall blocks movement in current cell
        if (currentCell.walls[wallIdx]) {
            audio.playTone(180, 'sine', 0.08, 0.03); // hit wall feedback
            return;
        }

        // Apply movement
        this.player.x = nextX;
        this.player.y = nextY;
        audio.playClick();

        // Check key pickup
        if (!this.hasKey && this.player.x === this.key.x && this.player.y === this.key.y) {
            this.hasKey = true;
            audio.playMazeKey();
            this.createExplosion(this.key.x, this.key.y, '#ffcc00', 15);
            this.onAchievement('maze_key', 'Медвежатник', 'Подобрать светящийся ключ от ворот в лабиринте');
        }

        // Check exit escape
        if (this.hasKey && this.player.x === this.exit.x && this.player.y === this.exit.y) {
            this.escapeLevel();
        }
    }

    createExplosion(gx, gy, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            this.particles.push({
                x: gx * this.cellSize + this.cellSize / 2,
                y: gy * this.cellSize + this.cellSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2 + 1,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    escapeLevel() {
        audio.playMazeWin();
        this.stats.levelsEscaped++;
        this.score += 1000;
        this.onScore(this.score);

        // Escape particles
        this.createExplosion(this.exit.x, this.exit.y, '#39ff14', 30);

        this.onAchievement('maze_escape', 'Великий побег', 'Успешно найти выход из процедурного лабиринта');

        if (this.stats.livesLost === 0) {
            this.onAchievement('maze_stealth', 'Призрак', 'Сбежать из лабиринта, не потеряв ни одной жизни');
        }

        // Load next harder level automatically!
        setTimeout(() => {
            if (!this.running) return;
            this.hasKey = false;
            this.player.x = 0;
            this.player.y = 0;
            this.generateMaze();
            this.placeItems();
            this.spawnGuards();
        }, 1500);
    }

    update(dt) {
        // Update Guard Movements
        this.guards.forEach(guard => {
            guard.moveTimer += dt;
            if (guard.moveTimer >= guard.moveInterval) {
                guard.moveTimer = 0;
                this.moveGuard(guard);
            }

            // Check dynamic distance collision with player
            const pX = this.player.x;
            const pY = this.player.y;
            if (guard.x === pX && guard.y === pY) {
                // Guard caught player
                this.stats.livesLost++;
                this.player.hp--;
                audio.playTone(110, 'sawtooth', 0.4, 0.1);
                this.createExplosion(this.player.x, this.player.y, '#ff3b30', 15);
                
                // Bounce player back to start
                this.player.x = 0;
                this.player.y = 0;

                if (this.player.hp <= 0) {
                    this.gameOver();
                }
            }
        });

        // Update particle physics
        this.particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(idx, 1);
            }
        });
    }

    moveGuard(guard) {
        // Guards pace in their direction, if hit wall they reverse
        const curCell = this.grid[guard.y][guard.x];
        
        let wallIndex = -1; // 0: top, 1: right, 2: bottom, 3: left
        if (guard.dx === 1) wallIndex = 1;
        else if (guard.dx === -1) wallIndex = 3;
        else if (guard.dy === 1) wallIndex = 2;
        else if (guard.dy === -1) wallIndex = 0;

        if (curCell.walls[wallIndex]) {
            // Reverse direction!
            guard.dx = -guard.dx;
            guard.dy = -guard.dy;
        } else {
            // Move forward
            guard.x += guard.dx;
            guard.y += guard.dy;
        }
    }

    draw() {
        this.ctx.fillStyle = '#0a0912';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Maze Walls
        this.ctx.strokeStyle = '#2d2554';
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = '#2d2554';

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.grid[y][x];
                const cx = x * this.cellSize;
                const cy = y * this.cellSize;

                // Top wall
                if (cell.walls[0]) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(cx, cy);
                    this.ctx.lineTo(cx + this.cellSize, cy);
                    this.ctx.stroke();
                }
                // Right wall
                if (cell.walls[1]) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(cx + this.cellSize, cy);
                    this.ctx.lineTo(cx + this.cellSize, cy + this.cellSize);
                    this.ctx.stroke();
                }
                // Bottom wall
                if (cell.walls[2]) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(cx, cy + this.cellSize);
                    this.ctx.lineTo(cx + this.cellSize, cy + this.cellSize);
                    this.ctx.stroke();
                }
                // Left wall
                if (cell.walls[3]) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(cx, cy);
                    this.ctx.lineTo(cx, cy + this.cellSize);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.shadowBlur = 0; // Reset

        // 2. Draw Exit Hatch
        if (this.exit) {
            const ex = this.exit.x * this.cellSize + 6;
            const ey = this.exit.y * this.cellSize + 6;
            const size = this.cellSize - 12;

            this.ctx.strokeStyle = this.hasKey ? '#39ff14' : '#ff3b30';
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = this.hasKey ? '#39ff14' : '#ff3b30';
            this.ctx.lineWidth = 3;

            this.ctx.strokeRect(ex, ey, size, size);
            
            // Draw crossbars inside gate
            this.ctx.beginPath();
            this.ctx.moveTo(ex, ey);
            this.ctx.lineTo(ex + size, ey + size);
            this.ctx.moveTo(ex + size, ey);
            this.ctx.lineTo(ex, ey + size);
            this.ctx.stroke();
        }

        // 3. Draw Key (if not picked up)
        if (this.key && !this.hasKey) {
            const kx = this.key.x * this.cellSize + this.cellSize / 2;
            const ky = this.key.y * this.cellSize + this.cellSize / 2;

            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ffff00';
            this.ctx.fillStyle = '#ffff00';

            this.ctx.beginPath();
            this.ctx.arc(kx, ky, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw loop handle
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect(kx - 12, ky - 3, 8, 6);
        }
        this.ctx.shadowBlur = 0;

        // 4. Draw Guards
        this.guards.forEach(guard => {
            const gx = guard.x * this.cellSize + this.cellSize / 2;
            const gy = guard.y * this.cellSize + this.cellSize / 2;

            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = guard.color;
            this.ctx.fillStyle = guard.color;

            this.ctx.beginPath();
            this.ctx.arc(gx, gy, 12, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw glowing core inside robotic guard
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(gx, gy, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;

        // 5. Draw Player Character
        if (this.player && this.player.hp > 0) {
            const px = this.player.x * this.cellSize + this.cellSize / 2;
            const py = this.player.y * this.cellSize + this.cellSize / 2;

            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#39ff14';
            this.ctx.fillStyle = '#39ff14';

            this.ctx.beginPath();
            this.ctx.arc(px, py, 14, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw backpack details or helmet
            this.ctx.fillStyle = '#0a0912';
            this.ctx.beginPath();
            this.ctx.arc(px + 4, py - 3, 2.5, 0, Math.PI * 2);
            this.ctx.arc(px - 4, py - 3, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 6. Draw HUD Interface (inside canvas)
        this.drawHUD();

        // 7. Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }

    drawHUD() {
        // Hearts in Canvas
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(15, 15, 120, 25);
        this.ctx.strokeStyle = '#2d2554';
        this.ctx.strokeRect(15, 15, 120, 25);

        for (let i = 0; i < this.player.maxHp; i++) {
            this.ctx.fillStyle = i < this.player.hp ? '#ff3b30' : '#222';
            this.ctx.beginPath();
            this.ctx.arc(30 + i * 16, 27, 4.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Key indicator
        this.ctx.fillStyle = this.hasKey ? '#ffff00' : 'rgba(255,255,255,0.06)';
        this.ctx.font = '8px "Inter"';
        this.ctx.fillText(this.hasKey ? "КЛЮЧ НАЙДЕН" : "НУЖЕН КЛЮЧ", 84, 30);
    }

    gameOver() {
        this.running = false;

        if (this.score > this.highscore) {
            this.highscore = this.score;
        }

        this.onGameOver(this.score, this.highscore);
    }

    gameLoop(time) {
        if (!this.running) return;

        const dt = time - this.lastTime;
        this.lastTime = time;

        this.update(Math.min(dt, 50));
        this.draw();

        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }
}
