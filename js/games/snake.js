/**
 * Кибер-Змейка (Neon Snake) - Retro Canvas Arcade Game
 */
import { audio } from '../audio.js';

export class NeonSnake {
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

        // Grid parameters
        this.gridSize = 25; // 25px per cell
        this.cols = this.canvas.width / this.gridSize;
        this.rows = this.canvas.height / this.gridSize;

        // Game state
        this.snake = [];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.food = null;
        this.specialFood = null;
        this.particles = [];

        // Tuning timers
        this.gameSpeed = 100; // ms per update step
        this.speedTimer = 0;
        this.specialFoodTimer = 0;
        this.lastTime = 0;

        this.stats = {
            applesEaten: 0,
            specialFruitsEaten: 0
        };

        this.setupInput();
    }

    setupInput() {
        this.keyHandler = (e) => {
            if (!this.running) return;

            const curDir = this.dir;
            
            // Avoid 180 degree instant suicide reversals
            if ((e.code === 'ArrowUp' || e.code === 'KeyW') && curDir.y === 0) {
                e.preventDefault();
                this.nextDir = { x: 0, y: -1 };
            } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && curDir.y === 0) {
                e.preventDefault();
                this.nextDir = { x: 0, y: 1 };
            } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && curDir.x === 0) {
                e.preventDefault();
                this.nextDir = { x: -1, y: 0 };
            } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && curDir.x === 0) {
                e.preventDefault();
                this.nextDir = { x: 1, y: 0 };
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
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.particles = [];
        this.gameSpeed = 100;
        this.speedTimer = 0;
        this.specialFoodTimer = 0;
        this.lastTime = performance.now();

        this.stats = {
            applesEaten: 0,
            specialFruitsEaten: 0
        };

        // Spawn central snake
        const startX = Math.floor(this.cols / 3);
        const startY = Math.floor(this.rows / 2);
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        this.spawnFood();
        this.specialFood = null;

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

    spawnFood() {
        let x, y, onSnake;
        do {
            x = Math.floor(Math.random() * this.cols);
            y = Math.floor(Math.random() * this.rows);
            onSnake = this.snake.some(segment => segment.x === x && segment.y === y);
        } while (onSnake);

        this.food = { x, y, color: '#ff007f', glow: '#ff007f' }; // Glowing pink apple
    }

    spawnSpecialFood() {
        let x, y, onSnake;
        do {
            x = Math.floor(Math.random() * this.cols);
            y = Math.floor(Math.random() * this.rows);
            onSnake = this.snake.some(segment => segment.x === x && segment.y === y);
        } while (onSnake || (this.food && this.food.x === x && this.food.y === y));

        // Speed fruit (yellow) or Shield extra fruit (cyan)
        const isSpeed = Math.random() > 0.5;
        this.specialFood = {
            x, y,
            color: isSpeed ? '#ffff00' : '#00ffff',
            glow: isSpeed ? '#ffff00' : '#00ffff',
            type: isSpeed ? 'speed' : 'double',
            life: 6000 // lives for 6 seconds
        };
    }

    createExplosion(x, y, color, count = 12) {
        audio.playSnakeEat();
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1.5;
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2.5 + 1.5,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.03
            });
        }
    }

    update(dt) {
        // Handle special food timer
        if (this.specialFood) {
            this.specialFood.life -= dt;
            if (this.specialFood.life <= 0) {
                this.specialFood = null;
            }
        } else {
            this.specialFoodTimer += dt;
            if (this.specialFoodTimer >= 8000) { // Check every 8s
                this.specialFoodTimer = 0;
                if (Math.random() < 0.4) {
                    this.spawnSpecialFood();
                }
            }
        }

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

    moveSnake() {
        if (!this.running) return;

        this.dir = this.nextDir;
        
        // Head positioning
        const head = this.snake[0];
        const nextHead = {
            x: head.x + this.dir.x,
            y: head.y + this.dir.y
        };

        // 1. Check self collision
        if (this.snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)) {
            this.onAchievement('snake_die', 'Самопожирание', 'Укусить себя за хвост');
            this.gameOver();
            return;
        }

        // 2. Check walls collision
        if (nextHead.x < 0 || nextHead.x >= this.cols || nextHead.y < 0 || nextHead.y >= this.rows) {
            this.gameOver();
            return;
        }

        // Add next head
        this.snake.unshift(nextHead);

        // 3. Check regular food eating
        if (nextHead.x === this.food.x && nextHead.y === this.food.y) {
            this.stats.applesEaten++;
            this.score += 150;
            this.onScore(this.score);

            this.createExplosion(this.food.x, this.food.y, this.food.color);
            this.spawnFood();

            // Check achievements
            if (this.snake.length === 10) {
                this.onAchievement('snake_10', 'Юный питон', 'Нарастить длину змейки до 10 сегментов');
            }
            if (this.snake.length === 30) {
                this.onAchievement('snake_30', 'Мировой Змей', 'Нарастить длину змейки до 30 сегментов!');
            }

            // Gradually speed up
            this.gameSpeed = Math.max(50, 100 - (this.snake.length * 1.5));
        }
        // 4. Check special food eating
        else if (this.specialFood && nextHead.x === this.specialFood.x && nextHead.y === this.specialFood.y) {
            this.stats.specialFruitsEaten++;
            this.createExplosion(this.specialFood.x, this.specialFood.y, this.specialFood.color, 20);

            if (this.specialFood.type === 'speed') {
                this.score += 300;
                this.gameSpeed = Math.max(40, this.gameSpeed - 20); // speed up step
                this.onAchievement('speed_up', 'Гипердрайв', 'Скушать золотой неоновый фрукт для разгона');
            } else {
                this.score += 500; // Double bonus score
            }

            this.onScore(this.score);
            this.specialFood = null;
        }
        // Just move ahead, remove tail
        else {
            this.snake.pop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#06050b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw glowing grid mesh background
        this.ctx.strokeStyle = '#120f26';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let j = 0; j <= this.rows; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * this.gridSize);
            this.ctx.lineTo(this.canvas.width, j * this.gridSize);
            this.ctx.stroke();
        }

        // 2. Draw Food
        if (this.food) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.food.glow;
            this.ctx.fillStyle = this.food.color;
            this.ctx.beginPath();
            
            // Draw apple shape
            const r = this.gridSize / 2 - 3;
            const cx = this.food.x * this.gridSize + this.gridSize / 2;
            const cy = this.food.y * this.gridSize + this.gridSize / 2;
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 3. Draw Special Food
        if (this.specialFood) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.specialFood.glow;
            this.ctx.fillStyle = this.specialFood.color;
            
            const r = this.gridSize / 2 - 2;
            const cx = this.specialFood.x * this.gridSize + this.gridSize / 2;
            const cy = this.specialFood.y * this.gridSize + this.gridSize / 2;
            
            // Star or Diamond shape
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy - r);
            this.ctx.lineTo(cx + r, cy);
            this.ctx.lineTo(cx, cy + r);
            this.ctx.lineTo(cx - r, cy);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0; // Reset

        // 4. Draw Neon Snake
        this.snake.forEach((segment, idx) => {
            const isHead = idx === 0;
            const size = this.gridSize - 4;
            const pad = 2;
            const x = segment.x * this.gridSize + pad;
            const y = segment.y * this.gridSize + pad;

            this.ctx.shadowBlur = isHead ? 15 : 8;
            this.ctx.shadowColor = isHead ? '#00ffff' : '#00bfff';
            this.ctx.fillStyle = isHead ? '#00ffff' : 'rgba(0, 191, 255, 0.85)';

            this.ctx.beginPath();
            this.ctx.roundRect(x, y, size, size, 6);
            this.ctx.fill();

            // Head details (eyes)
            if (isHead) {
                this.ctx.fillStyle = '#06050b';
                this.ctx.beginPath();
                
                // Draw small dots for retro eyes based on movement dir
                if (this.dir.x !== 0) {
                    this.ctx.arc(x + size / 2, y + 5, 2, 0, Math.PI * 2);
                    this.ctx.arc(x + size / 2, y + size - 5, 2, 0, Math.PI * 2);
                } else {
                    this.ctx.arc(x + 5, y + size / 2, 2, 0, Math.PI * 2);
                    this.ctx.arc(x + size - 5, y + size / 2, 2, 0, Math.PI * 2);
                }
                this.ctx.fill();
            }
        });
        this.ctx.shadowBlur = 0;

        // 5. Draw Explosion particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0; // Reset alpha
    }

    gameOver() {
        this.running = false;
        audio.playSnakeDie();

        if (this.score > this.highscore) {
            this.highscore = this.score;
        }

        this.onGameOver(this.score, this.highscore);
    }

    gameLoop(time) {
        if (!this.running) return;

        const dt = time - this.lastTime;

        // Snake moves based on speed interval
        this.speedTimer += dt;
        if (this.speedTimer >= this.gameSpeed) {
            this.speedTimer = 0;
            this.moveSnake();
        }

        this.update(dt);
        this.draw();

        this.lastTime = time;
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }
}
