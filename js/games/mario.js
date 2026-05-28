/**
 * Супер Марио (Vapor Mario) - NES-Style Side-Scrolling Canvas Platformer
 * Pixel-art sprites drawn procedurally on canvas — classic 1-1 feel!
 */
import { audio } from '../audio.js';

// ─── Pixel-art sprite data (8×8 tiles, colour palette indices) ──────────────
// Each entry is a 2D array of colour indices; 0 = transparent
// Palette:
const PAL = {
    0: null,           // transparent
    1: '#e52521',      // Mario red (hat / shirt)
    2: '#fcc082',      // Skin peach
    3: '#002080',      // Blue overalls
    4: '#c27c38',      // Tan/brown shoes
    5: '#000000',      // Black outline
    6: '#ffffff',      // White
    7: '#ffcc00',      // Coin yellow
    8: '#d4af37',      // Gold dark
    9: '#3cb043',      // Pipe green
    A: '#2d8a2d',      // Pipe dark green
    B: '#8B4513',      // Ground dirt brown
    C: '#b87333',      // Brick copper
    D: '#6e7a8a',      // Castle grey
    E: '#555555',      // Castle dark grey
    F: '#39ff14',      // Neon green (flag)
    G: '#c24b38',      // Goomba red-brown
    H: '#f5c58a',      // Goomba light skin
    I: '#ff6b35',      // Goomba mouth
};

// Mario standing right (16×16 conceptual, drawn as pixel blocks)
const MARIO_PIXELS = [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,1,1,1,1],
    [0,0,2,2,5,2,0,0],
    [0,2,2,5,2,2,2,0],
    [0,1,3,3,3,1,1,0],
    [1,1,3,3,3,1,1,1],
    [0,3,3,3,3,3,3,0],
    [0,4,4,0,0,4,4,0],
];

// Mario jumping (arms raised)
const MARIO_JUMP_PIXELS = [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,1,1,1,1],
    [0,0,2,2,5,2,0,0],
    [0,2,2,5,2,2,2,0],
    [1,1,3,3,3,1,1,1],
    [0,3,3,3,3,3,0,0],
    [0,0,4,3,3,4,0,0],
    [0,4,4,0,0,4,4,0],
];

// Goomba sprite (8×8)
const GOOMBA_PIXELS = [
    [0,0,G,G,G,G,0,0],
    [0,G,G,G,G,G,G,0],
    [G,G,H,5,H,5,G,G],
    [G,G,H,H,H,H,G,G],
    [G,G,G,I,I,G,G,G],
    [G,H,G,G,G,G,H,G],
    [G,H,H,H,H,H,H,G],
    [0,H,H,0,0,H,H,0],
].map(row => row.map(c => {
    if (c === undefined || c === 0) return 0;
    if (c === 'G') return 'G';
    if (c === 'H') return 'H';
    if (c === 'I') return 'I';
    return c;
}));

// Coin sprite (8×8)
const COIN_PIXELS = [
    [0,0,8,7,7,8,0,0],
    [0,8,7,7,7,7,8,0],
    [0,7,7,6,7,7,7,0],
    [0,7,7,7,7,7,7,0],
    [0,7,7,6,7,7,7,0],
    [0,8,7,7,7,7,8,0],
    [0,0,8,7,7,8,0,0],
    [0,0,0,0,0,0,0,0],
];

// Question block sprite (8×8) - bumped or normal
const QBLOCK_NORMAL = [
    [8,7,7,7,7,7,7,8],
    [7,5,0,7,7,0,5,7],
    [7,0,7,7,7,7,0,7],
    [7,7,7,7,7,7,7,7],
    [7,7,7,0,0,7,7,7],
    [7,7,7,0,0,7,7,7],
    [7,5,7,7,7,7,5,7],
    [8,7,7,7,7,7,7,8],
];
const QBLOCK_BUMPED = [
    [E,D,D,D,D,D,D,E],
    [D,5,0,D,D,0,5,D],
    [D,0,D,D,D,D,0,D],
    [D,D,D,D,D,D,D,D],
    [D,D,D,5,5,D,D,D],
    [D,D,D,5,5,D,D,D],
    [D,5,D,D,D,D,5,D],
    [E,D,D,D,D,D,D,E],
].map(row => row.map(c => {
    if (c === undefined) return 0;
    if (c === 'E') return 'E';
    if (c === 'D') return 'D';
    return c;
}));

const G = 'G', H = 'H', I = 'I', E = 'E', D = 'D';

function drawSprite(ctx, pixels, x, y, scale = 4) {
    for (let row = 0; row < pixels.length; row++) {
        for (let col = 0; col < pixels[row].length; col++) {
            const idx = pixels[row][col];
            if (!idx && idx !== 0) continue;
            const color = PAL[idx];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
        }
    }
}

export class VaporMario {
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

        // Physics constants
        this.gravity = 0.45;
        this.friction = 0.85;

        // Controls
        this.keys = {};

        // Camera scrolling
        this.cameraX = 0;
        this.worldWidth = 2800;

        // Animation counters
        this.frameCount = 0;

        // Cloud positions (static bg decorations)
        this.clouds = [];
        this.hills = [];

        // Game objects
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.particles = [];
        this.flagpole = null;

        this.stats = {
            coinsCollected: 0,
            goombasSquished: 0
        };

        this.setupInput();
    }

    setupInput() {
        this.keyHandler = (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = e.type === 'keydown';
        };

        window.addEventListener('keydown', this.keyHandler);
        window.addEventListener('keyup', this.keyHandler);
    }

    destroy() {
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('keyup', this.keyHandler);
        this.stop();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.score = 0;
        this.cameraX = 0;
        this.particles = [];
        this.frameCount = 0;
        this.stats = {
            coinsCollected: 0,
            goombasSquished: 0
        };

        this.player = {
            x: 100,
            y: 300,
            vx: 0,
            vy: 0,
            width: 32,
            height: 32,
            speed: 4.2,
            jumpForce: 11,
            grounded: false,
            hp: 1,
            isInvincible: 0,
            facing: 1, // 1=right, -1=left
            walkFrame: 0,
            walkTimer: 0
        };

        // Generate decorative bg elements
        this.clouds = [];
        for (let i = 0; i < 12; i++) {
            this.clouds.push({ x: i * 230 + 50, y: 40 + Math.random() * 80, w: 80 + Math.random() * 60 });
        }
        this.hills = [];
        for (let i = 0; i < 8; i++) {
            this.hills.push({ x: i * 360 + 80, r: 70 + Math.random() * 40 });
        }

        this.buildLevel();
        this.onScore(this.score);

        this.lastTime = performance.now();
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    stop() {
        this.running = false;
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
    }

    buildLevel() {
        this.platforms = [];
        this.coins = [];
        this.enemies = [];

        const groundY = 510;

        const groundChunks = [
            { from: 0, to: 820 },
            { from: 970, to: 1520 },
            { from: 1680, to: 2800 }
        ];

        groundChunks.forEach(c => {
            this.platforms.push({
                x: c.from, y: groundY,
                width: c.to - c.from, height: 100,
                type: 'ground'
            });
        });

        // Pipes
        const pipes = [
            { x: 320, h: 64 },
            { x: 620, h: 96 },
            { x: 1120, h: 80 },
            { x: 1880, h: 72 }
        ];
        pipes.forEach(p => {
            this.platforms.push({
                x: p.x, y: groundY - p.h,
                width: 56, height: p.h,
                type: 'pipe'
            });
        });

        // Floating brick / question blocks
        const blockRows = [
            { x: 240, y: 370, items: [false, true, false] },
            { x: 460, y: 330, items: [true] },
            { x: 700, y: 370, items: [false, false, true, false] },
            { x: 1210, y: 350, items: [true, false, true] },
            { x: 1360, y: 250, items: [false, true] },
        ];

        blockRows.forEach(b => {
            b.items.forEach((hasItem, i) => {
                this.platforms.push({
                    id: Math.random().toString(),
                    x: b.x + i * 40, y: b.y,
                    width: 40, height: 40,
                    type: 'brick',
                    bumped: false,
                    hasCoin: hasItem,
                    bumpAnim: 0
                });
            });
        });

        // Stair blocks near end
        for (let s = 0; s < 4; s++) {
            this.platforms.push({
                x: 2020 + s * 40,
                y: 470 - s * 40,
                width: 40,
                height: groundY - (470 - s * 40),
                type: 'stair'
            });
        }

        // Coins
        const coinPos = [
            { x: 260, y: 320 }, { x: 300, y: 320 },
            { x: 500, y: 240 }, { x: 540, y: 240 },
            { x: 1040, y: 440 }, { x: 1090, y: 440 },
            { x: 1250, y: 290 }, { x: 1400, y: 190 }
        ];
        coinPos.forEach(cp => {
            this.coins.push({ x: cp.x, y: cp.y, collected: false, anim: Math.random() * Math.PI * 2 });
        });

        // Goombas
        const goombas = [
            { x: 420, minX: 370, maxX: 600 },
            { x: 770, minX: 670, maxX: 920 },
            { x: 1260, minX: 1170, maxX: 1460 },
            { x: 1760, minX: 1710, maxX: 1840 },
            { x: 2210, minX: 2160, maxX: 2360 }
        ];
        goombas.forEach(gp => {
            this.enemies.push({
                id: Math.random().toString(),
                x: gp.x, y: groundY - 32,
                width: 32, height: 32,
                vx: -1.2,
                minX: gp.minX, maxX: gp.maxX,
                walkFrame: 0, walkTimer: 0
            });
        });

        // Flagpole
        this.flagpole = {
            x: 2460, y: 160,
            width: 8, height: 350,
            flagY: 180,
            triggered: false
        };

        // Castle end
        this.platforms.push({ x: 2550, y: groundY - 130, width: 140, height: 130, type: 'castle-end' });
    }

    tryJump() {
        if (this.player.grounded) {
            this.player.vy = -this.player.jumpForce;
            this.player.grounded = false;
            audio.playTone(400, 'sine', 0.15, 0.05, 800);
        }
    }

    createExplosion(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1.5,
                color,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.02
            });
        }
    }

    update(dt) {
        if (!this.player) return;
        this.frameCount++;

        if (this.player.isInvincible > 0) this.player.isInvincible--;

        // Move
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.player.vx = -this.player.speed;
            this.player.facing = -1;
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.player.vx = this.player.speed;
            this.player.facing = 1;
        } else {
            this.player.vx *= this.friction;
        }

        if (this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.tryJump();
        }

        // Walk animation
        if (Math.abs(this.player.vx) > 0.5 && this.player.grounded) {
            this.player.walkTimer++;
            if (this.player.walkTimer > 8) {
                this.player.walkTimer = 0;
                this.player.walkFrame = (this.player.walkFrame + 1) % 2;
            }
        } else if (this.player.grounded) {
            this.player.walkFrame = 0;
        }

        this.player.vy += this.gravity;

        const oldX = this.player.x;
        const oldY = this.player.y;
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;

        this.player.x = Math.max(0, Math.min(this.worldWidth - this.player.width, this.player.x));

        if (this.player.y > this.canvas.height + 40) {
            this.gameOver();
            return;
        }

        this.player.grounded = false;

        this.platforms.forEach(platform => {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {

                const overlapX = Math.min(this.player.x + this.player.width, platform.x + platform.width) - Math.max(this.player.x, platform.x);
                const overlapY = Math.min(this.player.y + this.player.height, platform.y + platform.height) - Math.max(this.player.y, platform.y);

                if (overlapX < overlapY) {
                    if (oldX + this.player.width <= platform.x) {
                        this.player.x = platform.x - this.player.width;
                    } else if (oldX >= platform.x + platform.width) {
                        this.player.x = platform.x + platform.width;
                    }
                    this.player.vx = 0;
                } else {
                    if (oldY + this.player.height <= platform.y) {
                        this.player.y = platform.y - this.player.height;
                        this.player.vy = 0;
                        this.player.grounded = true;
                    } else if (oldY >= platform.y + platform.height) {
                        this.player.y = platform.y + platform.height;
                        this.player.vy = 1;

                        if (platform.type === 'brick' && !platform.bumped) {
                            audio.playTone(300, 'sine', 0.1, 0.05);
                            platform.bumpAnim = 8;
                            this.createExplosion(platform.x + 20, platform.y, '#c27c38', 4);

                            if (platform.hasCoin) {
                                platform.bumped = true;
                                this.stats.coinsCollected++;
                                this.score += 200;
                                this.onScore(this.score);
                                audio.playSnakeEat();
                                this.createExplosion(platform.x + 20, platform.y - 20, '#d4af37', 8);

                                if (this.stats.coinsCollected >= 10) {
                                    this.onAchievement('mario_coin', 'Грибное золото', 'Собрать 10 монет в мире Vapor Mario');
                                }
                            }
                        }
                    }
                }
            }

            // Bump animation countdown
            if (platform.bumpAnim > 0) platform.bumpAnim--;
        });

        // Coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.anim += 0.05;
                const dist = Math.hypot((coin.x + 8) - (this.player.x + 16), (coin.y + 8) - (this.player.y + 16));
                if (dist < 28) {
                    coin.collected = true;
                    this.stats.coinsCollected++;
                    this.score += 100;
                    this.onScore(this.score);
                    audio.playSnakeEat();
                    this.createExplosion(coin.x + 8, coin.y + 8, '#ffcc00', 8);
                    if (this.stats.coinsCollected >= 10) {
                        this.onAchievement('mario_coin', 'Грибное золото', 'Собрать 10 монет в мире Vapor Mario');
                    }
                }
            }
        });

        // Goombas
        this.enemies.forEach((goomba, gIdx) => {
            goomba.x += goomba.vx;
            if (goomba.x < goomba.minX || goomba.x > goomba.maxX) goomba.vx = -goomba.vx;

            // Walk animation
            goomba.walkTimer = (goomba.walkTimer || 0) + 1;
            if (goomba.walkTimer > 12) {
                goomba.walkTimer = 0;
                goomba.walkFrame = (goomba.walkFrame + 1) % 2;
            }

            if (this.player.x < goomba.x + goomba.width &&
                this.player.x + this.player.width > goomba.x &&
                this.player.y < goomba.y + goomba.height &&
                this.player.y + this.player.height > goomba.y) {

                if (oldY + this.player.height <= goomba.y + 14 && this.player.vy > 0) {
                    this.createExplosion(goomba.x + 16, goomba.y + 16, '#c24b38', 14);
                    this.enemies.splice(gIdx, 1);
                    this.player.vy = -8;
                    this.stats.goombasSquished++;
                    this.score += 300;
                    this.onScore(this.score);
                    this.onAchievement('mario_crush', 'Король прыжков', 'Раздавить вредного гриба точным прыжком сверху');
                } else if (this.player.isInvincible <= 0) {
                    this.player.hp--;
                    this.player.isInvincible = 60;
                    audio.playTone(180, 'sawtooth', 0.3, 0.1);
                    if (this.player.hp <= 0) {
                        this.createExplosion(this.player.x + 16, this.player.y + 16, '#ff3b30', 30);
                        this.gameOver();
                    }
                }
            }
        });

        // Flagpole
        if (this.flagpole && !this.flagpole.triggered) {
            const dist = Math.hypot(this.flagpole.x - (this.player.x + 16), 300 - (this.player.y + 16));
            if (dist < 30) {
                this.flagpole.triggered = true;
                this.player.vx = 0;
                this.player.vy = 2;
                this.keys = {};
                audio.playMazeWin();

                let slideFlag = setInterval(() => {
                    if (!this.running) { clearInterval(slideFlag); return; }
                    this.flagpole.flagY += 5;
                    if (this.flagpole.flagY >= 490) {
                        clearInterval(slideFlag);
                        this.winLevel();
                    }
                }, 30);
            }
        }

        // Camera
        const targetCamX = this.player.x - this.canvas.width / 3;
        this.cameraX += (targetCamX - this.cameraX) * 0.1;
        this.cameraX = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.cameraX));

        // Particles
        this.particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) this.particles.splice(idx, 1);
        });
    }

    winLevel() {
        this.score += 2000;
        this.onScore(this.score);
        this.createExplosion(this.player.x, this.player.y, '#39ff14', 40);
        this.onAchievement('mario_win', 'Спаситель принцессы', 'Пройти ретро-уровень и захватить флагшток!');

        setTimeout(() => {
            if (!this.running) return;
            this.player.x = 100;
            this.player.y = 300;
            this.player.vx = 0;
            this.player.vy = 0;
            this.cameraX = 0;
            this.buildLevel();
        }, 1500);
    }

    // ── Drawing helpers ────────────────────────────────────────────────────────

    /** Draw pixel cloud */
    drawCloud(ctx, cx, cy, w) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.28, 0, Math.PI * 2);
        ctx.arc(cx + w * 0.22, cy - w * 0.12, w * 0.22, 0, Math.PI * 2);
        ctx.arc(cx + w * 0.5, cy, w * 0.25, 0, Math.PI * 2);
        ctx.arc(cx + w * 0.28, cy + w * 0.08, w * 0.18, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Draw NES-style green hill */
    drawHill(ctx, hx, groundY, r) {
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(hx, groundY, r, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // spots
        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.arc(hx - r * 0.25, groundY - r * 0.55, r * 0.18, 0, Math.PI * 2);
        ctx.arc(hx + r * 0.3, groundY - r * 0.65, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Draw a ground tile strip with NES brick tiling */
    drawGround(ctx, x, y, w, h) {
        const tileW = 40, tileH = 20;
        // base fill
        ctx.fillStyle = '#c27c38';
        ctx.fillRect(x, y, w, h);

        // top dirt row
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, w, tileH);

        // brick pattern
        ctx.fillStyle = '#b06820';
        for (let tx = 0; tx < w; tx += tileW) {
            for (let ty = tileH; ty < h; ty += tileH) {
                const offset = (Math.floor(ty / tileH) % 2 === 0) ? 0 : tileW / 2;
                ctx.fillRect(x + tx + offset, y + ty, tileW - 2, tileH - 2);
            }
        }

        // top grass strip
        ctx.fillStyle = '#5a9e3a';
        ctx.fillRect(x, y, w, 6);
    }

    /** Draw NES-style green pipe */
    drawPipe(ctx, x, y, w, h) {
        // Main shaft
        const grad = ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, '#2d8a2d');
        grad.addColorStop(0.3, '#4caf50');
        grad.addColorStop(0.7, '#3cb043');
        grad.addColorStop(1, '#1e5e1e');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 4, y + 18, w - 8, h - 18);

        // Pipe lip (wider top)
        const lipGrad = ctx.createLinearGradient(x, 0, x + w + 8, 0);
        lipGrad.addColorStop(0, '#1e6b1e');
        lipGrad.addColorStop(0.3, '#4caf50');
        lipGrad.addColorStop(0.7, '#3cb043');
        lipGrad.addColorStop(1, '#1a4d1a');
        ctx.fillStyle = lipGrad;
        ctx.fillRect(x, y, w + 0, 18);

        // Dark outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 4, y + 18, w - 8, h - 18);
        ctx.strokeRect(x, y, w, 18);

        // Highlight line inside shaft
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 20);
        ctx.lineTo(x + 10, y + h - 2);
        ctx.stroke();
    }

    /** Draw a brick / question block (NES style) */
    drawBlock(ctx, platform) {
        const { x, y, width, height, type, bumped, hasCoin, bumpAnim } = platform;
        const bumpOffset = bumpAnim ? -Math.sin((bumpAnim / 8) * Math.PI) * 6 : 0;

        if (type === 'brick') {
            if (bumped && hasCoin) {
                // used block
                ctx.fillStyle = '#888';
                ctx.fillRect(x, y + bumpOffset, width, height);
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y + bumpOffset, width, height);
                ctx.fillStyle = '#777';
                ctx.fillRect(x + 1, y + 1 + bumpOffset, 8, 3);
                ctx.fillRect(x + width - 9, y + 1 + bumpOffset, 8, 3);
                ctx.fillRect(x + 1, y + height - 4 + bumpOffset, 8, 3);
            } else if (hasCoin) {
                // question block
                const qGrad = ctx.createLinearGradient(x, y, x, y + height);
                qGrad.addColorStop(0, '#ffe066');
                qGrad.addColorStop(0.5, '#ffcc00');
                qGrad.addColorStop(1, '#c8a000');
                ctx.fillStyle = qGrad;
                ctx.fillRect(x, y + bumpOffset, width, height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y + bumpOffset, width, height);

                // "?" character pixel art
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${height * 0.6}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', x + width / 2, y + height / 2 + bumpOffset);
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
            } else {
                // normal brick
                const brickGrad = ctx.createLinearGradient(x, y, x, y + height);
                brickGrad.addColorStop(0, '#d4874a');
                brickGrad.addColorStop(1, '#b06820');
                ctx.fillStyle = brickGrad;
                ctx.fillRect(x, y + bumpOffset, width, height);
                ctx.strokeStyle = '#7a4510';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y + bumpOffset, width, height);
                // mortar lines
                ctx.strokeStyle = '#7a4510';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y + height / 2 + bumpOffset);
                ctx.lineTo(x + width, y + height / 2 + bumpOffset);
                ctx.moveTo(x + width / 2, y + bumpOffset);
                ctx.lineTo(x + width / 2, y + height / 2 + bumpOffset);
                ctx.moveTo(x + width / 4, y + height / 2 + bumpOffset);
                ctx.lineTo(x + width / 4, y + height + bumpOffset);
                ctx.moveTo(x + width * 3 / 4, y + height / 2 + bumpOffset);
                ctx.lineTo(x + width * 3 / 4, y + height + bumpOffset);
                ctx.stroke();
            }
        } else if (type === 'stair') {
            ctx.fillStyle = '#c27c38';
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = '#7a4510';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
        } else if (type === 'castle-end') {
            ctx.fillStyle = '#6e7a8a';
            ctx.fillRect(x, y, width, height);
            // Battlements
            const merlonW = 20, merlonH = 18;
            for (let bx = x; bx < x + width - merlonW; bx += merlonW * 2) {
                ctx.fillStyle = '#888';
                ctx.fillRect(bx, y - merlonH, merlonW, merlonH);
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1;
                ctx.strokeRect(bx, y - merlonH, merlonW, merlonH);
            }
            // Gate arch
            ctx.fillStyle = '#000';
            ctx.fillRect(x + width / 2 - 16, y + height - 50, 32, 50);
            ctx.fillStyle = '#5c4a24';
            ctx.fillRect(x + width / 2 - 14, y + height - 48, 28, 40);
            // Castle stone pattern
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            for (let sy = y; sy < y + height; sy += 15) {
                for (let sx = x; sx < x + width; sx += 20) {
                    ctx.strokeRect(sx, sy, 18, 13);
                }
            }
        }
    }

    /** Draw classic Mario character (pixel-art style) */
    drawMario(ctx, player) {
        const { x, y, width, height, facing, isInvincible, grounded, vy, walkFrame } = player;

        if (isInvincible > 0 && Math.floor(isInvincible / 4) % 2 === 1) return;

        const px = x;
        const py = y;
        const S = 4; // pixel scale

        ctx.save();
        if (facing === -1) {
            // Mirror horizontally
            ctx.translate(px + width, py);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(px, py);
        }

        const isJumping = !grounded || vy < -0.5;

        // Hat (red)
        ctx.fillStyle = '#e52521';
        ctx.fillRect(1 * S, 0, 6 * S, 2 * S);   // brim
        ctx.fillRect(2 * S, -2 * S, 4 * S, 2 * S); // top of hat

        // Hair / back of head (brown)
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(0, 0, 1 * S, 3 * S);

        // Face skin
        ctx.fillStyle = '#fcc082';
        ctx.fillRect(1 * S, 2 * S, 6 * S, 3 * S);

        // Eyes (black) + white
        ctx.fillStyle = '#fff';
        ctx.fillRect(2 * S, 3 * S, 2 * S, 1 * S);
        ctx.fillStyle = '#000';
        ctx.fillRect(2 * S, 3 * S, 1 * S, 1 * S);

        // Moustache
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(1 * S, 5 * S, 3 * S, 1 * S);
        ctx.fillRect(4 * S, 5 * S, 2 * S, 1 * S);

        // Body / Shirt (red)
        ctx.fillStyle = '#e52521';
        ctx.fillRect(0, 5 * S, 8 * S, 3 * S);

        // Overalls (blue)
        ctx.fillStyle = '#002080';
        ctx.fillRect(1 * S, 8 * S, 6 * S, 4 * S);

        // Suspenders
        ctx.fillStyle = '#002080';
        ctx.fillRect(0, 5 * S, 2 * S, 4 * S);
        ctx.fillRect(6 * S, 5 * S, 2 * S, 4 * S);

        // Arms (skin)
        ctx.fillStyle = '#fcc082';
        if (isJumping) {
            // Arms up
            ctx.fillRect(-1 * S, 5 * S, 2 * S, 2 * S);
            ctx.fillRect(7 * S, 5 * S, 2 * S, 2 * S);
        } else {
            ctx.fillRect(-1 * S, 7 * S, 2 * S, 2 * S);
            ctx.fillRect(7 * S, 7 * S, 2 * S, 2 * S);
        }

        // Gloves (white)
        ctx.fillStyle = '#fff';
        if (isJumping) {
            ctx.fillRect(-1 * S, 3 * S, 2 * S, 2 * S);
            ctx.fillRect(7 * S, 3 * S, 2 * S, 2 * S);
        } else {
            ctx.fillRect(-1 * S, 9 * S, 2 * S, 2 * S);
            ctx.fillRect(7 * S, 9 * S, 2 * S, 2 * S);
        }

        // Legs
        const legOff = grounded ? (walkFrame === 0 ? 0 : 1) : 0;
        ctx.fillStyle = '#e52521';
        ctx.fillRect(1 * S, 12 * S, 2 * S, 2 * S + legOff);
        ctx.fillRect(5 * S, 12 * S, 2 * S, 2 * S + (1 - legOff));

        // Shoes (brown)
        ctx.fillStyle = '#4a2800';
        ctx.fillRect(0 * S, 14 * S, 3 * S, 2 * S);
        ctx.fillRect(5 * S, 14 * S, 3 * S, 2 * S);

        ctx.restore();
    }

    /** Draw NES-style Goomba */
    drawGoomba(ctx, goomba) {
        const { x, y, width, height, walkFrame } = goomba;
        const S = 4;
        const px = x;
        const py = y;

        // Body (brown mushroom)
        ctx.fillStyle = '#c24b38';
        ctx.beginPath();
        ctx.ellipse(px + width / 2, py + height * 0.45, width * 0.46, height * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cap / top dome
        ctx.fillStyle = '#8B3224';
        ctx.beginPath();
        ctx.ellipse(px + width / 2, py + height * 0.3, width * 0.4, height * 0.3, 0, Math.PI, 0);
        ctx.fill();

        // Eyes (white sclera)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(px + width * 0.3, py + height * 0.4, 5, 6, -0.3, 0, Math.PI * 2);
        ctx.ellipse(px + width * 0.7, py + height * 0.4, 5, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (black)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(px + width * 0.28, py + height * 0.42, 3, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(px + width * 0.72, py + height * 0.42, 3, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + width * 0.18, py + height * 0.28);
        ctx.lineTo(px + width * 0.42, py + height * 0.34);
        ctx.moveTo(px + width * 0.58, py + height * 0.34);
        ctx.lineTo(px + width * 0.82, py + height * 0.28);
        ctx.stroke();

        // Fang teeth
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + width * 0.25, py + height * 0.6, 5, 5);
        ctx.fillRect(px + width * 0.65, py + height * 0.6, 5, 5);

        // Feet (walking animation)
        ctx.fillStyle = '#8B3224';
        const footOff = walkFrame === 0 ? -2 : 2;
        ctx.beginPath();
        ctx.ellipse(px + width * 0.25 - footOff, py + height * 0.88, 6, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(px + width * 0.75 + footOff, py + height * 0.88, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // ── Sky background ─────────────────────────────────────────────────
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#5c94fc');
        skyGrad.addColorStop(0.7, '#87b5ff');
        skyGrad.addColorStop(1, '#b8d0fc');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // ── Camera transform ───────────────────────────────────────────────
        ctx.save();
        ctx.translate(-this.cameraX, 0);

        // 1. Hills (background layer, no parallax for simplicity)
        const camParallax = this.cameraX * 0.4;
        this.hills.forEach(h => {
            this.drawHill(ctx, h.x - camParallax, 510, h.r);
        });

        // 2. Clouds (slow parallax)
        const cloudParallax = this.cameraX * 0.2;
        ctx.save();
        this.clouds.forEach(c => {
            this.drawCloud(ctx, c.x - cloudParallax, c.y, c.w);
        });
        ctx.restore();

        // 3. Ground
        this.platforms.forEach(p => {
            if (p.type === 'ground') {
                this.drawGround(ctx, p.x, p.y, p.width, p.height);
            }
        });

        // 4. Pipes
        this.platforms.forEach(p => {
            if (p.type === 'pipe') {
                this.drawPipe(ctx, p.x, p.y, p.width, p.height);
            }
        });

        // 5. Bricks / Q-blocks
        this.platforms.forEach(p => {
            if (p.type === 'brick' || p.type === 'stair' || p.type === 'castle-end') {
                this.drawBlock(ctx, p);
            }
        });

        // 6. Coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const bob = Math.sin(coin.anim) * 3;
                // Draw spinning coin
                ctx.fillStyle = '#ffcc00';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffee00';
                ctx.beginPath();
                ctx.arc(coin.x + 8, coin.y + 8 + bob, 8, 0, Math.PI * 2);
                ctx.fill();
                // Inner highlight
                ctx.fillStyle = '#fff9';
                ctx.beginPath();
                ctx.arc(coin.x + 5, coin.y + 5 + bob, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // 7. Flagpole
        if (this.flagpole) {
            const fp = this.flagpole;
            // Pole
            ctx.fillStyle = '#b8b8b8';
            const polGrad = ctx.createLinearGradient(fp.x - 4, 0, fp.x + fp.width + 4, 0);
            polGrad.addColorStop(0, '#888');
            polGrad.addColorStop(0.4, '#ddd');
            polGrad.addColorStop(1, '#999');
            ctx.fillStyle = polGrad;
            ctx.fillRect(fp.x, fp.y, fp.width, fp.height);

            // Ball on top
            ctx.fillStyle = '#39ff14';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#39ff14';
            ctx.beginPath();
            ctx.arc(fp.x + fp.width / 2, fp.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Flag
            ctx.fillStyle = '#ff0055';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff0055';
            ctx.beginPath();
            ctx.moveTo(fp.x, fp.flagY);
            ctx.lineTo(fp.x - 34, fp.flagY + 12);
            ctx.lineTo(fp.x, fp.flagY + 24);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // 8. Goombas
        this.enemies.forEach(goomba => {
            this.drawGoomba(ctx, goomba);
        });

        // 9. Mario player
        if (this.player && this.player.hp > 0) {
            this.drawMario(ctx, this.player);
        }

        // 10. Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        ctx.restore(); // end camera

        // ── HUD ────────────────────────────────────────────────────────────
        // Score panel (NES style black box with white pixel font)
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(10, 10, 200, 36);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10, 10, 200, 36);

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillText(`MARIO`, 20, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText(`МОНЕТЫ: ${this.stats.coinsCollected}`, 20, 40);

        ctx.fillStyle = '#fff';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`ВРАГИ: ${this.stats.goombasSquished}`, 204, 40);
        ctx.textAlign = 'left';

        // Controls hint
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('← → двигаться   ↑/Пробел прыжок', this.canvas.width - 10, this.canvas.height - 10);
        ctx.textAlign = 'left';
    }

    gameOver() {
        this.running = false;
        audio.playSnakeDie();
        if (this.score > this.highscore) this.highscore = this.score;
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
