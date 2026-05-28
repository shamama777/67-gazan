/**
 * Соник (Neon Sonic) - Classic Mega Drive-Style Canvas Endless Runner
 * Pixel-art drawn procedurally — Green Hill Zone vibes!
 */
import { audio } from '../audio.js';

export class NeonSonic {
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

        // Physics
        this.gravity = 0.55;
        this.jumpForce = -12;

        // Game state
        this.player = null;
        this.rings = [];
        this.hazards = [];
        this.springs = [];
        this.particles = [];
        this.trail = [];

        // Parallax bg layers
        this.bgStars = [];
        this.bgClouds = [];
        this.bgHills1 = [];
        this.bgHills2 = [];
        this.bgTrees = [];
        this.checkStripeOffset = 0;

        // Speed
        this.speedX = 5.5;
        this.maxSpeedX = 16.0;
        this.speedIncrement = 0.0008;

        this.spawnTimer = 0;
        this.spawnInterval = 1200;
        this.lastTime = 0;
        this.gameTime = 0;
        this.frameCount = 0;

        this.stats = {
            ringsCollected: 0,
            springsTriggered: 0,
            bossDefeated: false
        };

        // Boss state
        this.boss = null;
        this.bossProjectiles = [];
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.bossSpawnTime = 30; // seconds until boss appears

        this.setupInput();
    }

    setupInput() {
        this.keyHandler = (e) => {
            if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
                e.preventDefault();
                if (e.type === 'keydown') this.jump();
            }
        };
        this.pointerHandler = (e) => {
            if (e.type === 'mousedown') this.jump();
        };
        window.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('mousedown', this.pointerHandler);
    }

    destroy() {
        window.removeEventListener('keydown', this.keyHandler);
        this.canvas.removeEventListener('mousedown', this.pointerHandler);
        this.stop();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.score = 0;
        this.speedX = 5.5;
        this.spawnTimer = 0;
        this.gameTime = 0;
        this.frameCount = 0;
        this.rings = [];
        this.hazards = [];
        this.springs = [];
        this.particles = [];
        this.trail = [];
        this.checkStripeOffset = 0;
        this.lastTime = performance.now();

        this.stats = { ringsCollected: 0, springsTriggered: 0, bossDefeated: false };
        this.boss = null;
        this.bossProjectiles = [];
        this.bossSpawned = false;
        this.bossDefeated = false;

        this.player = {
            x: 150,
            y: 380,
            vy: 0,
            width: 36,
            height: 40,
            radius: 18,
            grounded: false,
            jumps: 0,
            maxJumps: 2,
            spinAngle: 0,
            spinning: false,
            ringsOwned: 0,
            isHitInvincible: 0,
            walkFrame: 0,
            walkTimer: 0,
            facing: 1
        };

        this.floorY = 460;

        // Generate parallax backgrounds
        this.generateBg();

        this.onScore(this.score);
        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    generateBg() {
        const W = this.canvas.width;
        // Background clouds
        this.bgClouds = [];
        for (let i = 0; i < 8; i++) {
            this.bgClouds.push({ x: i * (W * 0.4) + Math.random() * 80, y: 30 + Math.random() * 80, w: 60 + Math.random() * 60 });
        }
        // Background hills row 1 (far)
        this.bgHills1 = [];
        for (let i = 0; i < 8; i++) {
            this.bgHills1.push({ x: i * 320 + Math.random() * 60, r: 90 + Math.random() * 50 });
        }
        // Background hills row 2 (near)
        this.bgHills2 = [];
        for (let i = 0; i < 8; i++) {
            this.bgHills2.push({ x: i * 240 + Math.random() * 40, r: 60 + Math.random() * 30 });
        }
        // Background trees
        this.bgTrees = [];
        for (let i = 0; i < 15; i++) {
            this.bgTrees.push({ x: i * 180 + Math.random() * 60, h: 50 + Math.random() * 40, w: 16 + Math.random() * 10 });
        }
    }

    stop() {
        this.running = false;
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
    }

    jump() {
        if (!this.running || !this.player) return;
        if (this.player.grounded) {
            this.player.vy = this.jumpForce;
            this.player.grounded = false;
            this.player.jumps = 1;
            this.player.spinning = true;
            audio.playTone(360, 'sine', 0.12, 0.05, 720);
        } else if (this.player.jumps < this.player.maxJumps) {
            this.player.vy = this.jumpForce * 0.88;
            this.player.jumps++;
            this.player.spinning = true;
            audio.playTone(500, 'sine', 0.1, 0.05, 900);
            this.createExplosion(this.player.x, this.player.y, '#00e5ff', 8);
        }
    }

    spawnObstacles() {
        const rng = Math.random();
        const startX = this.canvas.width + 60;

        if (rng < 0.4) {
            // Ring arch
            const numRings = 5;
            for (let i = 0; i < numRings; i++) {
                const rx = startX + i * 44;
                const ry = this.floorY - 100 - Math.sin((i / (numRings - 1)) * Math.PI) * 90;
                this.rings.push({ x: rx, y: ry, radius: 10, collected: false, anim: Math.random() * Math.PI * 2 });
            }
        } else if (rng < 0.72) {
            // Badnik spikes
            const spikeW = 28;
            const spikeH = 36;
            this.hazards.push({ x: startX, y: this.floorY - spikeH, width: spikeW, height: spikeH, type: 'spike' });

            // Bonus ring above
            this.rings.push({ x: startX + spikeW / 2, y: this.floorY - spikeH - 55, radius: 10, collected: false, anim: 0 });
        } else {
            // Spring + high rings
            this.springs.push({ x: startX, y: this.floorY - 18, width: 36, height: 18, triggered: false, triggerAnim: 0 });
            for (let i = 0; i < 3; i++) {
                this.rings.push({ x: startX + 36 + i * 44, y: this.floorY - 280, radius: 10, collected: false, anim: i * 0.5 });
            }
        }
    }

    createExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    scatterRingsLose() {
        audio.playTone(180, 'sawtooth', 0.4, 0.1);
        this.createExplosion(this.player.x, this.player.y, '#ffcc00', 20);
        this.player.ringsOwned = 0;
        this.player.isHitInvincible = 90;
    }

    update(dt) {
        if (!this.player) return;
        this.frameCount++;
        this.gameTime += dt / 1000;
        this.speedX = Math.min(this.maxSpeedX, this.speedX + this.speedIncrement * dt);

        if (this.player.isHitInvincible > 0) this.player.isHitInvincible--;

        // Physics
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;

        // Spin
        if (this.player.spinning || !this.player.grounded) {
            this.player.spinAngle += this.speedX * 0.06;
        }

        // Ground check
        if (this.player.y + this.player.radius >= this.floorY) {
            this.player.y = this.floorY - this.player.radius;
            this.player.vy = 0;
            this.player.grounded = true;
            this.player.jumps = 0;
            this.player.spinning = false;
            this.player.spinAngle = 0;
        }

        // Walk anim
        if (this.player.grounded) {
            this.player.walkTimer++;
            if (this.player.walkTimer > Math.max(2, 8 - this.speedX / 2)) {
                this.player.walkTimer = 0;
                this.player.walkFrame = (this.player.walkFrame + 1) % 4;
            }
        }

        // Trail
        this.trail.push({ x: this.player.x, y: this.player.y });
        if (this.trail.length > 12) this.trail.shift();

        // Moving checker stripe offset
        this.checkStripeOffset = (this.checkStripeOffset + this.speedX) % 64;

        // Parallax scroll
        this.bgClouds.forEach(c => { c.x -= this.speedX * 0.08; if (c.x + c.w < -20) c.x = this.canvas.width + 20; });
        this.bgHills1.forEach(h => { h.x -= this.speedX * 0.15; if (h.x - h.r < -20) h.x = this.canvas.width + h.r + 20; });
        this.bgHills2.forEach(h => { h.x -= this.speedX * 0.25; if (h.x - h.r < -20) h.x = this.canvas.width + h.r + 20; });
        this.bgTrees.forEach(t => { t.x -= this.speedX * 0.35; if (t.x + t.w < -20) t.x = this.canvas.width + 20; });

        // Rings
        this.rings.forEach((ring, idx) => {
            ring.x -= this.speedX;
            ring.anim = (ring.anim || 0) + 0.08;

            const dist = Math.hypot(ring.x - this.player.x, ring.y - this.player.y);
            if (!ring.collected && dist < this.player.radius + ring.radius + 4) {
                ring.collected = true;
                this.player.ringsOwned++;
                this.stats.ringsCollected++;
                this.score += 100;
                this.onScore(this.score);
                audio.playSnakeEat();
                this.createExplosion(ring.x, ring.y, '#ffcc00', 8);
                if (this.player.ringsOwned >= 20) {
                    this.onAchievement('sonic_rings', 'Кольценосец', 'Удерживать 20 золотых колец одновременно');
                }
            }
            if (ring.x < -40) this.rings.splice(idx, 1);
        });

        // Hazards (spikes)
        this.hazards.forEach((hz, idx) => {
            hz.x -= this.speedX;

            if (this.player.x + this.player.radius - 6 > hz.x &&
                this.player.x - this.player.radius + 6 < hz.x + hz.width &&
                this.player.y + this.player.radius > hz.y) {

                if (this.player.isHitInvincible <= 0) {
                    if (this.player.ringsOwned > 0) {
                        this.scatterRingsLose();
                        this.onAchievement('sonic_spike', 'Острые ощущения', 'Напороться на шипы, но спастись благодаря кольцам');
                    } else {
                        this.gameOver();
                    }
                }
            }

            if (hz.x < -40) this.hazards.splice(idx, 1);
        });

        // Springs
        this.springs.forEach((sp, idx) => {
            sp.x -= this.speedX;
            if (sp.triggerAnim > 0) sp.triggerAnim--;

            if (this.player.x + this.player.radius - 2 > sp.x &&
                this.player.x - this.player.radius + 2 < sp.x + sp.width &&
                this.player.y + this.player.radius >= sp.y &&
                this.player.vy > 0) {

                this.player.vy = this.jumpForce * 1.7;
                this.player.grounded = false;
                this.player.spinning = true;
                sp.triggered = true;
                sp.triggerAnim = 12;
                this.stats.springsTriggered++;
                audio.playTone(600, 'sine', 0.2, 0.06, 1200);
                this.createExplosion(sp.x + sp.width / 2, sp.y, '#ff6b35', 16);
            }

            if (sp.x < -40) this.springs.splice(idx, 1);
        });

        // Spawn
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnObstacles();
            this.spawnInterval = Math.max(700, 1300 - (this.speedX * 45));
        }

        // Achievement: survival
        if (this.gameTime >= 20.0) {
            this.onAchievement('sonic_speed', 'Звуковой барьер', 'Выжить более 20 секунд на полной скорости');
        }

        // Boss spawn check
        if (!this.bossSpawned && !this.bossDefeated && this.gameTime >= this.bossSpawnTime) {
            this.spawnBoss();
        }

        // Boss update
        if (this.boss) {
            this.updateBoss(dt);
        }

        // Boss projectiles
        this.bossProjectiles.forEach((proj, idx) => {
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.vy += 0.18; // gravity
            proj.anim = (proj.anim || 0) + 0.12;

            // Hit floor
            if (proj.y > this.floorY + 10) {
                this.createExplosion(proj.x, this.floorY, '#ff6600', 8);
                this.bossProjectiles.splice(idx, 1);
                return;
            }

            // Hit player
            const dist = Math.hypot(proj.x - this.player.x, proj.y - this.player.y);
            if (dist < this.player.radius + proj.radius) {
                if (this.player.isHitInvincible <= 0) {
                    if (this.player.ringsOwned > 0) {
                        this.scatterRingsLose();
                    } else {
                        this.gameOver();
                        return;
                    }
                }
                this.bossProjectiles.splice(idx, 1);
            }
        });

        // Particles
        this.particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) this.particles.splice(idx, 1);
        });
    }

    spawnBoss() {
        this.bossSpawned = true;
        this.speedX = 0; // Stop scrolling during boss fight!
        this.hazards = [];
        this.rings = [];
        this.springs = [];
        const W = this.canvas.width;
        this.boss = {
            x: W + 80,         // enters from right
            y: 160,
            targetX: W - 180,  // hover position
            hp: 6,
            maxHp: 6,
            phase: 'enter',    // enter → fight → defeated
            hoverT: 0,         // sine wave timer
            hitFlash: 0,       // flash frames on hit
            attackTimer: 0,
            attackInterval: 2200, // ms between attacks
            laserActive: false,
            laserTimer: 0,
            width: 100,
            height: 70
        };
        // Warn the player with a dramatic sound
        audio.playTone(80, 'sawtooth', 0.5, 0.3, 120);
        setTimeout(() => audio.playTone(60, 'sawtooth', 0.5, 0.3, 80), 400);
    }

    updateBoss(dt) {
        const boss = this.boss;
        const W = this.canvas.width;
        const p = this.player;

        boss.hoverT += dt * 0.002;
        if (boss.hitFlash > 0) boss.hitFlash--;

        // ── Phase: Enter ──────────────────────────────────────────────────
        if (boss.phase === 'enter') {
            boss.x += (boss.targetX - boss.x) * 0.04;
            if (Math.abs(boss.x - boss.targetX) < 4) {
                boss.x = boss.targetX;
                boss.phase = 'fight';
                boss.attackTimer = 0;
            }
            return;
        }

        // ── Phase: Fight ──────────────────────────────────────────────────
        if (boss.phase === 'fight') {
            // Hover sine wave (vertical)
            boss.y = 120 + Math.sin(boss.hoverT * 2.2) * 60;

            // Drift left/right menacingly
            boss.x = boss.targetX + Math.sin(boss.hoverT * 0.8) * 40;

            boss.attackTimer += dt;
            if (boss.attackTimer >= boss.attackInterval) {
                boss.attackTimer = 0;
                this.bossAttack();
            }

            // ── Vulnerability check: Sonic hits underside ─────────────────
            const bossBottom = boss.y + boss.height;
            const bossLeft = boss.x;
            const bossRight = boss.x + boss.width;

            if (p.vy < -2 &&                           // Sonic moving up
                p.x + p.radius > bossLeft + 10 &&
                p.x - p.radius < bossRight - 10 &&
                p.y - p.radius < bossBottom &&
                p.y - p.radius > boss.y + boss.height * 0.5) {

                if (boss.hitFlash <= 0) {
                    boss.hp--;
                    boss.hitFlash = 30;
                    p.vy = this.jumpForce * 0.7; // bounce Sonic back down
                    audio.playTone(440, 'square', 0.3, 0.12, 880);
                    this.createExplosion(boss.x + boss.width / 2, boss.y + boss.height, '#ff6600', 16);

                    if (boss.hp <= 0) {
                        this.defeatBoss();
                    }
                }
            }
        }
    }

    bossAttack() {
        const boss = this.boss;
        const type = Math.random();

        if (type < 0.5) {
            // Drop 3 bombs in a spread
            for (let i = -1; i <= 1; i++) {
                this.bossProjectiles.push({
                    x: boss.x + boss.width / 2 + i * 20,
                    y: boss.y + boss.height,
                    vx: i * 1.5 - 1,
                    vy: 1,
                    radius: 9,
                    type: 'bomb',
                    anim: 0
                });
            }
            audio.playTone(200, 'sawtooth', 0.2, 0.1, 100);
        } else {
            // Fire a fast laser ball
            this.bossProjectiles.push({
                x: boss.x,
                y: boss.y + boss.height / 2,
                vx: -5,
                vy: (this.player.y - (boss.y + boss.height / 2)) / 80,
                radius: 7,
                type: 'laser',
                anim: 0
            });
            audio.playTone(600, 'sine', 0.15, 0.08, 1200);
        }
    }

    defeatBoss() {
        const boss = this.boss;
        boss.phase = 'defeated';
        this.bossDefeated = true;
        this.speedX = 5.5; // resume scrolling

        // Big explosion sequence
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (!this.running) return;
                this.createExplosion(
                    boss.x + Math.random() * boss.width,
                    boss.y + Math.random() * boss.height,
                    ['#ff6600', '#ffcc00', '#ff0055', '#fff'][Math.floor(Math.random() * 4)],
                    20
                );
                audio.playTone(100 + i * 60, 'sawtooth', 0.4, 0.15);
            }, i * 200);
        }

        this.score += 5000;
        this.onScore(this.score);
        this.onAchievement('sonic_boss', 'Победитель Эггмана', 'Победить Доктора Эггмана в финальной схватке и спасти зверей!');

        // Remove boss after animation
        setTimeout(() => { this.boss = null; this.bossProjectiles = []; }, 1200);
    }

    // ─── Drawing ────────────────────────────────────────────────────────────

    /** Draw a fluffy white cloud */
    drawCloud(ctx, cx, cy, w) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.28, 0, Math.PI * 2);
        ctx.arc(cx + w * 0.22, cy - w * 0.12, w * 0.22, 0, Math.PI * 2);
        ctx.arc(cx + w * 0.5, cy, w * 0.25, 0, Math.PI * 2);
        ctx.arc(cx + w * 0.28, cy + w * 0.08, w * 0.18, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Draw Green Hill Zone style hill */
    drawGHZHill(ctx, hx, groundY, r, color1, color2) {
        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.arc(hx, groundY, r, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // Checkerboard top band
        ctx.save();
        ctx.beginPath();
        ctx.arc(hx, groundY, r, Math.PI, 0);
        ctx.closePath();
        ctx.clip();
        const tileSize = 16;
        for (let tx = hx - r; tx < hx + r; tx += tileSize) {
            for (let ty = groundY - r; ty < groundY; ty += tileSize) {
                const col = Math.floor((tx - hx + r) / tileSize);
                const row = Math.floor((ty - groundY + r) / tileSize);
                if ((col + row) % 2 === 0) {
                    ctx.fillStyle = color2;
                    ctx.fillRect(tx, ty, tileSize, tileSize);
                }
            }
        }
        ctx.restore();
    }

    /** Draw a GHZ palm tree */
    drawTree(ctx, tx, ty, h, w) {
        // Trunk
        ctx.fillStyle = '#c8a050';
        ctx.fillRect(tx + w / 2 - 3, ty - h, 6, h);

        // Leaves
        ctx.fillStyle = '#2e8b2e';
        ctx.beginPath();
        ctx.ellipse(tx + w / 2, ty - h - 10, w * 0.8, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3cb043';
        ctx.beginPath();
        ctx.ellipse(tx + w / 2 - 8, ty - h - 4, 10, 10, -0.4, 0, Math.PI * 2);
        ctx.ellipse(tx + w / 2 + 8, ty - h - 4, 10, 10, 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Draw classic Sonic character */
    drawSonic(ctx, player) {
        const { x, y, radius, facing, isHitInvincible, grounded, spinning, spinAngle, walkFrame } = player;

        if (isHitInvincible > 0 && Math.floor(isHitInvincible / 4) % 2 === 1) return;

        ctx.save();
        ctx.translate(x, y);

        if (spinning || !grounded) {
            // Spin ball form
            ctx.rotate(spinAngle);

            // Sonic blue ball
            const ballGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
            ballGrad.addColorStop(0, '#4fc3f7');
            ballGrad.addColorStop(0.5, '#0066cc');
            ballGrad.addColorStop(1, '#003d99');
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            // Quill spines (darker stripes inside ball)
            ctx.strokeStyle = '#003080';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-radius + 4, 0);
            ctx.lineTo(radius - 4, 0);
            ctx.moveTo(0, -radius + 4);
            ctx.lineTo(0, radius - 4);
            ctx.moveTo(-radius * 0.7, -radius * 0.7);
            ctx.lineTo(radius * 0.7, radius * 0.7);
            ctx.moveTo(radius * 0.7, -radius * 0.7);
            ctx.lineTo(-radius * 0.7, radius * 0.7);
            ctx.stroke();

            // White shoe highlight
            ctx.fillStyle = '#ffffffcc';
            ctx.beginPath();
            ctx.arc(-radius * 0.25, -radius * 0.28, radius * 0.18, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Standing / running form
            const dir = facing;
            ctx.scale(dir, 1);

            // --- Body ---
            // Main body (blue)
            const bodyGrad = ctx.createRadialGradient(-4, -6, 2, 0, 0, radius);
            bodyGrad.addColorStop(0, '#4fc3f7');
            bodyGrad.addColorStop(0.6, '#0066cc');
            bodyGrad.addColorStop(1, '#003d99');
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, -4, 14, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tummy (skin-coloured front)
            ctx.fillStyle = '#fcc07a';
            ctx.beginPath();
            ctx.ellipse(3, 2, 8, 10, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = '#0066cc';
            ctx.beginPath();
            ctx.arc(2, -16, 13, 0, Math.PI * 2);
            ctx.fill();

            // Muzzle
            ctx.fillStyle = '#fcc07a';
            ctx.beginPath();
            ctx.ellipse(9, -12, 7, 6, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Nose
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(13, -14, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(7, -18, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(9, -18, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(10, -18, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Quill spines (back of head)
            ctx.fillStyle = '#003d99';
            ctx.beginPath();
            ctx.moveTo(-5, -22);
            ctx.lineTo(-16, -30);
            ctx.lineTo(-8, -20);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-8, -17);
            ctx.lineTo(-20, -22);
            ctx.lineTo(-10, -14);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.lineTo(-22, -12);
            ctx.lineTo(-11, -6);
            ctx.closePath();
            ctx.fill();

            // Ear
            ctx.fillStyle = '#0066cc';
            ctx.beginPath();
            ctx.moveTo(-2, -26);
            ctx.lineTo(4, -32);
            ctx.lineTo(8, -26);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.moveTo(0, -27);
            ctx.lineTo(4, -30);
            ctx.lineTo(7, -27);
            ctx.closePath();
            ctx.fill();

            // Leg walking frames
            const legAngles = [
                [0.3, -0.3],   // frame 0
                [0.5, -0.1],   // frame 1
                [0.1, -0.5],   // frame 2
                [-0.1, 0.1]    // frame 3
            ];
            const [la, lb] = grounded ? legAngles[walkFrame % 4] : [0.2, -0.2];

            // White gloves (arms)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-8 + Math.cos(la + 1.2) * 6, 2 + Math.sin(la + 1.2) * 6, 5, 0, Math.PI * 2);
            ctx.fill();

            // Legs
            ctx.save();
            ctx.translate(0, 8);
            ctx.strokeStyle = '#0066cc';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';

            // Left leg
            ctx.beginPath();
            ctx.moveTo(-4, 0);
            ctx.lineTo(-4 + Math.sin(la) * 10, 12 + Math.cos(la) * 3);
            ctx.stroke();

            // Right leg
            ctx.beginPath();
            ctx.moveTo(4, 0);
            ctx.lineTo(4 + Math.sin(lb) * 10, 12 + Math.cos(lb) * 3);
            ctx.stroke();

            // Red sneakers
            ctx.fillStyle = '#cc0000';
            ctx.beginPath();
            ctx.ellipse(-4 + Math.sin(la) * 10, 18 + Math.cos(la) * 3, 8, 4, la, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(4 + Math.sin(lb) * 10, 18 + Math.cos(lb) * 3, 8, 4, lb, 0, Math.PI * 2);
            ctx.fill();

            // White shoe stripe
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-8 + Math.sin(la) * 10, 18 + Math.cos(la) * 3);
            ctx.lineTo(-2 + Math.sin(la) * 10, 18 + Math.cos(la) * 3);
            ctx.moveTo(0 + Math.sin(lb) * 10, 18 + Math.cos(lb) * 3);
            ctx.lineTo(6 + Math.sin(lb) * 10, 18 + Math.cos(lb) * 3);
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }

    /** Draw a classic GHZ-style ring */
    drawRing(ctx, ring) {
        if (ring.collected) return;

        const bobY = Math.sin(ring.anim) * 3;

        // Outer gold ring
        ctx.save();
        ctx.translate(ring.x, ring.y + bobY);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, ring.radius + 2, ring.radius * 0.7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ring body
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#ffee44';
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner highlight
        ctx.strokeStyle = '#fff9';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(-ring.radius * 0.25, -ring.radius * 0.25, ring.radius * 0.5, Math.PI, Math.PI * 1.8);
        ctx.stroke();

        ctx.restore();
    }

    /** Draw GHZ badnik spike (Motobug style) */
    drawSpike(ctx, hz) {
        const { x, y, width, height } = hz;

        // Body (ladybug-like badnik)
        ctx.fillStyle = '#cc1111';
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + height * 0.55, width * 0.45, height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell spots
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + width * 0.35, y + height * 0.5, 3, 0, Math.PI * 2);
        ctx.arc(x + width * 0.65, y + height * 0.5, 3, 0, Math.PI * 2);
        ctx.arc(x + width * 0.5, y + height * 0.62, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (evil yellow)
        ctx.fillStyle = '#ffee00';
        ctx.beginPath();
        ctx.arc(x + width * 0.35, y + height * 0.35, 4, 0, Math.PI * 2);
        ctx.arc(x + width * 0.65, y + height * 0.35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + width * 0.37, y + height * 0.35, 2, 0, Math.PI * 2);
        ctx.arc(x + width * 0.67, y + height * 0.35, 2, 0, Math.PI * 2);
        ctx.fill();

        // Top spike
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.2);
        ctx.lineTo(x + width * 0.5, y);
        ctx.lineTo(x + width * 0.7, y + height * 0.2);
        ctx.closePath();
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + width * 0.25, y + height * 0.85, 5, 0, Math.PI * 2);
        ctx.arc(x + width * 0.75, y + height * 0.85, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + width * 0.25, y + height * 0.85, 5, 0, Math.PI * 2);
        ctx.arc(x + width * 0.75, y + height * 0.85, 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    /** Draw classic GHZ red-orange spring */
    drawSpring(ctx, sp) {
        const { x, y, width, height, triggered, triggerAnim } = sp;
        const squish = triggered && triggerAnim > 0 ? 0.4 : 1.0;

        // Spring coil base
        ctx.fillStyle = '#cc3300';
        ctx.fillRect(x, y + height * (1 - squish), width, height * squish);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + height * (1 - squish), width, height * squish);

        // Coil lines
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const ly = y + height * (1 - squish) + (i + 0.5) * (height * squish / 3);
            ctx.beginPath();
            ctx.moveTo(x + 4, ly);
            ctx.lineTo(x + width - 4, ly);
            ctx.stroke();
        }

        // Orange top button
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + height * (1 - squish), width * 0.5, 5 * squish, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // ── Sky (Green Hill Zone gradient) ─────────────────────────────────
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
        skyGrad.addColorStop(0, '#4bb9fc');
        skyGrad.addColorStop(0.5, '#7dd3fc');
        skyGrad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H * 0.65);

        // ── Parallax far hills ─────────────────────────────────────────────
        this.bgHills1.forEach(h => {
            this.drawGHZHill(ctx, h.x, H * 0.65, h.r, '#80c050', '#68a040');
        });

        // ── Clouds ─────────────────────────────────────────────────────────
        this.bgClouds.forEach(c => {
            this.drawCloud(ctx, c.x, c.y, c.w);
        });

        // ── Near hills ─────────────────────────────────────────────────────
        this.bgHills2.forEach(h => {
            this.drawGHZHill(ctx, h.x, H * 0.72, h.r, '#5da83c', '#4a8c2e');
        });

        // ── Trees ──────────────────────────────────────────────────────────
        this.bgTrees.forEach(t => {
            this.drawTree(ctx, t.x, this.floorY, t.h, t.w);
        });

        // ── Checkerboard floor (Green Hill Zone style) ────────────────────
        const floorH = H - this.floorY;
        // Base floor colour
        const floorGrad = ctx.createLinearGradient(0, this.floorY, 0, H);
        floorGrad.addColorStop(0, '#8b5e1a');
        floorGrad.addColorStop(0.3, '#6b4010');
        floorGrad.addColorStop(1, '#3d2008');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, this.floorY, W, floorH);

        // Checker pattern
        const tileSize = 32;
        for (let tx = -tileSize + ((-this.checkStripeOffset) % tileSize); tx < W + tileSize; tx += tileSize) {
            for (let ty = this.floorY; ty < H; ty += tileSize) {
                const col = Math.floor((tx + this.checkStripeOffset) / tileSize);
                const row = Math.floor((ty - this.floorY) / tileSize);
                if ((col + row) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.fillRect(tx, ty, tileSize, tileSize);
                }
            }
        }

        // Top grass stripe
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(0, this.floorY - 8, W, 8);
        ctx.fillStyle = '#66bb6a';
        ctx.fillRect(0, this.floorY - 5, W, 3);

        // Floor top edge line glow
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#39ff14';
        ctx.beginPath();
        ctx.moveTo(0, this.floorY);
        ctx.lineTo(W, this.floorY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ── Speed trail ────────────────────────────────────────────────────
        if (this.trail.length > 1) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.18)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            this.trail.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
            ctx.restore();
        }

        // ── Rings ──────────────────────────────────────────────────────────
        this.rings.forEach(ring => this.drawRing(ctx, ring));

        // ── Springs ────────────────────────────────────────────────────────
        this.springs.forEach(sp => this.drawSpring(ctx, sp));

        // ── Hazards (Badniks) ──────────────────────────────────────────────
        this.hazards.forEach(hz => this.drawSpike(ctx, hz));

        // ── Particles ─────────────────────────────────────────────────────
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // ── Player (Sonic) ─────────────────────────────────────────────────
        if (this.player) {
            this.drawSonic(ctx, this.player);
        }

        // ── HUD ────────────────────────────────────────────────────────────
        // Rings counter (top-left, retro black box)
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(10, 10, 210, 38);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10, 10, 210, 38);

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillText(`SONIC`, 20, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText(`КОЛЬЦА: ${this.player ? this.player.ringsOwned : 0}`, 20, 42);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#00e5ff';
        ctx.fillText(`ВРЕМЯ: ${Math.floor(this.gameTime)}s`, 214, 42);
        ctx.textAlign = 'left';

        // Speed bar (bottom)
        const barW = 120;
        const speedPct = (this.speedX - 5.5) / (this.maxSpeedX - 5.5);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(10, H - 28, barW + 4, 14);
        const barGrad = ctx.createLinearGradient(12, 0, 12 + barW * speedPct, 0);
        barGrad.addColorStop(0, '#00e5ff');
        barGrad.addColorStop(1, '#ff6b35');
        ctx.fillStyle = barGrad;
        ctx.fillRect(12, H - 26, barW * speedPct, 10);
        ctx.strokeStyle = '#00e5ff55';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, H - 26, barW, 10);
        ctx.fillStyle = '#fff';
        ctx.font = '9px sans-serif';
        ctx.fillText('СКОРОСТЬ', 12, H - 30);

        // Controls hint
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('↑/Пробел — прыжок (двойной прыжок!)', W - 10, H - 10);
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
