/**
 * Космический Защитник (Space Defender) - Retro Arcade Canvas Game
 */
import { audio } from '../audio.js';

export class SpaceDefender {
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

        // Controls
        this.keys = {};

        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        this.powerups = [];

        // Game tuning
        this.spawnTimer = 0;
        this.spawnInterval = 800; // ms
        this.powerupTimer = 0;
        this.lastTime = 0;
        this.shootCooldown = 0;

        // Statistics for achievements
        this.stats = {
            shotsFired: 0,
            enemiesDestroyed: 0
        };

        this.initStars();
        this.setupInput();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1.5 + 0.5
            });
        }
    }

    setupInput() {
        // Prevent default browser scrolls for gaming keys
        this.keyHandler = (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = e.type === 'keydown';
        };

        // Pointer controls support
        this.pointerHandler = (e) => {
            if (!this.running || !this.player) return;
            const rect = this.canvas.getBoundingClientRect();
            const root = document.documentElement;
            
            // Get mouse position relative to canvas
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Set target position for interpolation
            this.player.targetX = mouseX;
            this.player.targetY = mouseY;
        };

        this.clickShootHandler = (e) => {
            if (this.running) {
                this.shoot();
            }
        };

        window.addEventListener('keydown', this.keyHandler);
        window.addEventListener('keyup', this.keyHandler);
        this.canvas.addEventListener('mousemove', this.pointerHandler);
        this.canvas.addEventListener('mousedown', this.clickShootHandler);
    }

    destroy() {
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('keyup', this.keyHandler);
        this.canvas.removeEventListener('mousemove', this.pointerHandler);
        this.canvas.removeEventListener('mousedown', this.clickShootHandler);
        this.stop();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.score = 0;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        this.spawnTimer = 0;
        this.powerupTimer = 0;
        this.lastTime = performance.now();
        this.shootCooldown = 0;

        this.stats = {
            shotsFired: 0,
            enemiesDestroyed: 0
        };

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 80,
            targetX: null,
            targetY: null,
            width: 38,
            height: 38,
            speed: 5.5,
            hp: 3,
            maxHp: 3,
            shield: 0,
            tripleShotTime: 0
        };

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

    spawnEnemy() {
        const size = Math.random() * 30 + 20;
        const isShip = Math.random() > 0.6; // Asteroid vs Alien Ship
        
        this.enemies.push({
            id: Math.random().toString(),
            x: Math.random() * (this.canvas.width - size),
            y: -size - 10,
            width: size,
            height: size,
            speed: Math.random() * 2 + 1.5,
            isShip: isShip,
            hp: isShip ? 2 : 1,
            color: isShip ? '#ff3b30' : '#8e8e93',
            pulse: 0,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.04 - 0.02
        });
    }

    spawnPowerup(x, y) {
        const types = ['shield', 'triple'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerups.push({
            x: x,
            y: y,
            width: 20,
            height: 20,
            type: type,
            speed: 2,
            color: type === 'shield' ? '#00ffff' : '#ffff00'
        });
    }

    shoot() {
        if (!this.player || this.shootCooldown > 0) return;
        
        audio.playLaser();
        this.stats.shotsFired++;

        if (this.stats.shotsFired === 100) {
            this.onAchievement('shoot_100', 'Космический Пехотинец', 'Сделать 100 выстрелов из лазерной пушки');
        }

        if (this.player.tripleShotTime > 0) {
            // Triple Shot
            this.bullets.push({ x: this.player.x, y: this.player.y - 10, vx: 0, vy: -9, width: 4, height: 16, color: '#ffff00' });
            this.bullets.push({ x: this.player.x - 15, y: this.player.y, vx: -2, vy: -8, width: 4, height: 16, color: '#ffff00' });
            this.bullets.push({ x: this.player.x + 15, y: this.player.y, vx: 2, vy: -8, width: 4, height: 16, color: '#ffff00' });
        } else {
            // Regular Single Shot
            this.bullets.push({
                x: this.player.x,
                y: this.player.y - 10,
                vx: 0,
                vy: -9,
                width: 4,
                height: 16,
                color: '#00ffff'
            });
        }

        this.shootCooldown = 15; // 15 frames delay
    }

    createExplosion(x, y, color, count = 15) {
        audio.playExplosion();
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    update(dt) {
        if (!this.player) return;

        // 1. Update shoot cooldown
        if (this.shootCooldown > 0) this.shootCooldown--;

        // 2. Update player triple shot timer
        if (this.player.tripleShotTime > 0) {
            this.player.tripleShotTime -= dt;
        }

        // 3. Move Player (Mouse/Keyboard)
        if (this.player.targetX !== null) {
            // Smooth mouse interpolation
            this.player.x += (this.player.targetX - this.player.x) * 0.15;
            this.player.y += (this.player.targetY - this.player.y) * 0.15;
        } else {
            // Keyboard controls
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.player.x -= this.player.speed;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) this.player.x += this.player.speed;
            if (this.keys['KeyW'] || this.keys['ArrowUp']) this.player.y -= this.player.speed;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) this.player.y += this.player.speed;
        }

        // Keep player in bounds
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));
        this.player.y = Math.max(100, Math.min(this.canvas.height - 40, this.player.y));

        if (this.keys['Space']) {
            this.shoot();
        }

        // 4. Update Stars background
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });

        // 5. Update Bullets
        this.bullets.forEach((bullet, idx) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            if (bullet.y < -20 || bullet.x < 0 || bullet.x > this.canvas.width) {
                this.bullets.splice(idx, 1);
            }
        });

        // 6. Update Powerups
        this.powerups.forEach((pu, idx) => {
            pu.y += pu.speed;
            
            // Check collision with player
            const dist = Math.hypot(pu.x - this.player.x, pu.y - this.player.y);
            if (dist < this.player.width / 2 + 10) {
                audio.playSuccess();
                if (pu.type === 'shield') {
                    this.player.shield = 1;
                } else if (pu.type === 'triple') {
                    this.player.tripleShotTime = 6000; // 6 seconds
                    this.onAchievement('triple_shot', 'Максимум огня', 'Активировать тройной лазерный выстрел');
                }
                this.powerups.splice(idx, 1);
                return;
            }

            if (pu.y > this.canvas.height + 20) {
                this.powerups.splice(idx, 1);
            }
        });

        // 7. Spawning Enemies
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }

        // 8. Update Enemies
        this.enemies.forEach((enemy, eIdx) => {
            enemy.y += enemy.speed;
            enemy.pulse += 0.05;
            enemy.angle += enemy.rotationSpeed;

            // Check collision with bullets
            this.bullets.forEach((bullet, bIdx) => {
                const bDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                if (bDist < enemy.width / 2 + 5) {
                    this.bullets.splice(bIdx, 1);
                    enemy.hp--;

                    // Spawn small hit sparks
                    this.createExplosion(bullet.x, bullet.y, enemy.color, 4);

                    if (enemy.hp <= 0) {
                        this.createExplosion(enemy.x, enemy.y, enemy.color, 12);
                        this.enemies.splice(eIdx, 1);
                        
                        this.stats.enemiesDestroyed++;
                        this.score += enemy.isShip ? 200 : 100;
                        this.onScore(this.score);

                        // Random powerup spawn (10% chance)
                        if (Math.random() < 0.15) {
                            this.spawnPowerup(enemy.x, enemy.y);
                        }

                        // Achievement checks
                        if (this.score >= 5000) {
                            this.onAchievement('score_5000', 'Мастер Ас', 'Набрать 5000 очков в игре Космический Защитник');
                        }
                    }
                }
            });

            // Check collision with Player
            const pDist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (pDist < enemy.width / 2 + this.player.width / 3) {
                this.createExplosion(enemy.x, enemy.y, enemy.color, 12);
                this.enemies.splice(eIdx, 1);

                if (this.player.shield > 0) {
                    this.player.shield = 0;
                    audio.playError();
                } else {
                    this.player.hp--;
                    this.player.tripleShotTime = 0; // Cancel triple shot
                    audio.playTone(100, 'sawtooth', 0.25, 0.1);

                    if (this.player.hp <= 0) {
                        this.createExplosion(this.player.x, this.player.y, '#00ffff', 40);
                        this.gameOver();
                    }
                }
            }

            // Remove out of bounds
            if (enemy.y > this.canvas.height + 40) {
                this.enemies.splice(eIdx, 1);
            }
        });

        // 9. Update particles
        this.particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(idx, 1);
            }
        });
    }

    draw() {
        this.ctx.fillStyle = '#050508';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Parallax Stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, star.speed / 1.5)})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 2. Draw Powerups
        this.powerups.forEach(pu => {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = pu.color;
            this.ctx.fillStyle = pu.color;
            
            this.ctx.beginPath();
            if (pu.type === 'shield') {
                // Draw Hexagon Shield Badge
                this.ctx.arc(pu.x, pu.y, 8, 0, Math.PI * 2);
            } else {
                // Draw Triple Arrow Triangle
                this.ctx.moveTo(pu.x, pu.y - 8);
                this.ctx.lineTo(pu.x - 8, pu.y + 8);
                this.ctx.lineTo(pu.x + 8, pu.y + 8);
                this.ctx.closePath();
            }
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0; // Reset

        // 3. Draw Enemies
        this.enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            this.ctx.rotate(enemy.angle);

            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = enemy.color;
            this.ctx.strokeStyle = enemy.color;
            this.ctx.lineWidth = 2.5;

            if (enemy.isShip) {
                // Glowing triangle alien spaceship
                this.ctx.beginPath();
                this.ctx.moveTo(0, 15);
                this.ctx.lineTo(-15, -15);
                this.ctx.lineTo(0, -5);
                this.ctx.lineTo(15, -15);
                this.ctx.closePath();
                this.ctx.stroke();
                
                // Reactor engine glow
                this.ctx.fillStyle = '#ffcc00';
                this.ctx.beginPath();
                this.ctx.arc(0, -10 + Math.sin(enemy.pulse) * 3, 4, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Glowing asteroid jagged rock
                this.ctx.beginPath();
                const r = enemy.width / 2;
                this.ctx.arc(0, 0, r, 0, Math.PI*2);
                this.ctx.stroke();
                
                // Details
                this.ctx.beginPath();
                this.ctx.arc(-r/3, -r/3, 3, 0, Math.PI*2);
                this.ctx.arc(r/3, r/4, 4, 0, Math.PI*2);
                this.ctx.stroke();
            }
            this.ctx.restore();
        });
        this.ctx.shadowBlur = 0;

        // 4. Draw Bullets
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = bullet.color;
            this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;

        // 5. Draw Player Spaceship
        if (this.player && this.player.hp > 0) {
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);

            // Engine trail particle flames
            this.ctx.fillStyle = Math.random() > 0.5 ? '#ff7f00' : '#ff3300';
            this.ctx.beginPath();
            this.ctx.moveTo(-6, 12);
            this.ctx.lineTo(0, 24 + Math.random() * 8);
            this.ctx.lineTo(6, 12);
            this.ctx.closePath();
            this.ctx.fill();

            // Ship Body
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 2.5;

            // Draw clean futuristic sleek fighter design
            this.ctx.beginPath();
            this.ctx.moveTo(0, -18); // Nose
            this.ctx.lineTo(-14, 12); // Left wing
            this.ctx.lineTo(-6, 6);   // Wing joint Left
            this.ctx.lineTo(6, 6);    // Wing joint Right
            this.ctx.lineTo(14, 12);  // Right wing
            this.ctx.closePath();
            this.ctx.stroke();

            // Cockpit glass capsule
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.ellipse(0, -2, 4, 8, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Shield Bubble Effect
            if (this.player.shield > 0) {
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 20;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 28, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
            this.ctx.shadowBlur = 0;

            // HP / Shield Interface in game screen
            this.drawHUD();
        }

        // 6. Draw Explosion Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(${p.color === '#00ffff' ? '0,255,255' : p.color === '#ffff00' ? '255,255,0' : '255,59,48'}, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawHUD() {
        // Render inside canvas HUD
        // HP bars
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(15, 15, 140, 30);
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.strokeRect(15, 15, 140, 30);

        this.ctx.fillStyle = '#8f98a0';
        this.ctx.font = '10px "Inter"';
        this.ctx.fillText("ЗАЩИТА", 25, 26);

        // Hearts
        for (let i = 0; i < this.player.maxHp; i++) {
            this.ctx.fillStyle = i < this.player.hp ? '#ff3b30' : '#222';
            this.ctx.beginPath();
            this.ctx.arc(75 + i * 16, 22, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // If triple shot active
        if (this.player.tripleShotTime > 0) {
            const pct = this.player.tripleShotTime / 6000;
            this.ctx.fillStyle = 'rgba(255, 204, 0, 0.4)';
            this.ctx.fillRect(15, 55, 140 * pct, 6);
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.font = '8px "Inter"';
            this.ctx.fillText("ТРОЙНОЙ ЛАЗЕР", 15, 50);
        }
    }

    gameOver() {
        this.running = false;
        
        this.onAchievement('die_first', 'Космический мусор', 'Потерпеть крушение в космической бездне');

        if (this.score > this.highscore) {
            this.highscore = this.score;
        }

        this.onGameOver(this.score, this.highscore);
    }

    gameLoop(time) {
        if (!this.running) return;

        const dt = time - this.lastTime;
        this.lastTime = time;

        // Cap dt to prevent massive jumps when tab is inactive
        this.update(Math.min(dt, 50));
        this.draw();

        this.loopId = requestAnimationFrame((t) => this.gameLoop(t));
    }
}
