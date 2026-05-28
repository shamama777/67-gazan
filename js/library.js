/**
 * Модуль Библиотеки Игр Vapor
 */
import { audio } from './audio.js';
import { gamesData } from './store.js';
import { SpaceDefender } from './games/shooter.js';
import { NeonSnake } from './games/snake.js';
import { MazeEscaper } from './games/maze.js';
import { VaporMario } from './games/mario.js';
import { NeonSonic } from './games/sonic.js';

// Achievements Database per game
export const achievementsData = {
    shooter: [
        { id: 'shoot_100', title: 'Космический Пехотинец', desc: 'Сделать 100 лазерных выстрелов' },
        { id: 'score_5000', title: 'Мастер Ас', desc: 'Набрать 5000 очков в игре' },
        { id: 'triple_shot', title: 'Максимум огня', desc: 'Активировать тройной лазерный выстрел' },
        { id: 'die_first', title: 'Космический мусор', desc: 'Разбиться в космическом пространстве' }
    ],
    snake: [
        { id: 'snake_10', title: 'Юный питон', desc: 'Достичь длины змейки в 10 звеньев' },
        { id: 'snake_30', title: 'Мировой Змей', desc: 'Достичь длины змейки в 30 звеньев' },
        { id: 'speed_up', title: 'Гипердрайв', desc: 'Скушать скоростной неон-фрукт' },
        { id: 'snake_die', title: 'Самопожирание', desc: 'Столкнуться с собственным телом' }
    ],
    maze: [
        { id: 'maze_key', title: 'Медвежатник', desc: 'Подобрать ключ в лабиринте' },
        { id: 'maze_escape', title: 'Великий побег', desc: 'Успешно найти выход из подземелья' },
        { id: 'maze_stealth', title: 'Призрак', desc: 'Пройти лабиринт без единого повреждения' }
    ],
    mario: [
        { id: 'mario_coin', title: 'Грибное золото', desc: 'Собрать 10 монет в мире Vapor Mario' },
        { id: 'mario_crush', title: 'Король прыжков', desc: 'Раздавить гриба Goomba точным прыжком сверху' },
        { id: 'mario_win', title: 'Спаситель принцессы', desc: 'Пройти ретро-уровень платформера и взять флаг' }
    ],
    sonic: [
        { id: 'sonic_rings', title: 'Кольценосец', desc: 'Собрать и удерживать 20 золотых колец в забеге' },
        { id: 'sonic_speed', title: 'Звуковой барьер', desc: 'Продержаться в живых более 20 секунд во время ускорения' },
        { id: 'sonic_spike', title: 'Острые ощущения', desc: 'Напороться на шипы с кольцами в запасе и спастись' }
    ]
};

export class LibraryModule {
    constructor(state, app) {
        this.state = state;
        this.app = app;
        this.selectedGameId = null;

        // Play session tracking
        this.activeGameInstance = null;
        this.playTimeTrackerInterval = null;
        this.activeSessionGameId = null;

        this.init();
    }

    init() {
        this.renderLibrary();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Launch Game
        const playBtn = document.getElementById('btn-play-game');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.launchActiveGame());
        }

        // Close Arcade Cabinet
        const exitArcadeBtn = document.getElementById('exit-arcade-btn');
        if (exitArcadeBtn) {
            exitArcadeBtn.addEventListener('click', () => this.closeArcadeCabinet());
        }

        // Keyboard support inside arcade cabinet overlay
        window.addEventListener('keydown', (e) => {
            if (this.activeGameInstance && e.code === 'Escape') {
                this.closeArcadeCabinet();
            }
        });
    }

    renderLibrary() {
        const sidebarList = document.getElementById('library-games-list');
        const countSpan = document.getElementById('library-count');
        const emptyPrompt = document.getElementById('empty-library');
        const activePanel = document.getElementById('library-active-game');

        if (!sidebarList) return;

        const count = this.state.purchasedGames.length;
        countSpan.textContent = count;

        if (count === 0) {
            sidebarList.innerHTML = '';
            emptyPrompt.style.display = 'flex';
            activePanel.style.display = 'none';
            return;
        }

        emptyPrompt.style.display = 'none';

        // Load actual games owned
        const ownedGames = gamesData.filter(g => this.state.purchasedGames.includes(g.id));

        sidebarList.innerHTML = ownedGames.map(game => `
            <li class="lib-list-item ${this.selectedGameId === game.id ? 'active' : ''}" data-id="${game.id}">
                <img src="${game.coverImg}" class="lib-item-icon" alt="${game.title}">
                <span class="lib-item-name">${game.title}</span>
                <span class="lib-item-status-dot"></span>
            </li>
        `).join('');

        // Bind clicks
        sidebarList.querySelectorAll('.lib-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.selectGame(id);
            });
        });

        // Set default selection if none
        if (!this.selectedGameId && ownedGames.length > 0) {
            this.selectGame(ownedGames[0].id);
        } else if (this.selectedGameId) {
            this.selectGame(this.selectedGameId);
        }
    }

    selectGame(gameId) {
        this.selectedGameId = gameId;

        // Set active sidebar item class
        const listItems = document.querySelectorAll('.lib-list-item');
        listItems.forEach(item => {
            if (item.dataset.id === gameId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const activePanel = document.getElementById('library-active-game');
        const game = gamesData.find(g => g.id === gameId);
        if (!game) return;

        activePanel.style.display = 'block';

        // Set game banners & specs
        document.getElementById('lib-banner-bg').style.backgroundImage = `url('${game.coverImg}')`;
        document.getElementById('lib-game-title').textContent = game.title;
        document.getElementById('lib-game-desc').textContent = game.description;
        document.getElementById('lib-game-dev').textContent = game.developer;
        document.getElementById('lib-game-genre').textContent = game.genreLabel;

        document.getElementById('lib-game-tags').innerHTML = game.tags.map(t => `<span class="tag">${t}</span>`).join('');

        // Stats loading
        const stats = this.state.gameStats[gameId] || { playTime: 0, achievementsUnlocked: [] };
        
        // Time format
        const totalMinutes = Math.floor(stats.playTime / 60);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        document.getElementById('lib-stat-time').textContent = `${hours} ч. ${mins} мин.`;

        // Achievements setup
        const achs = achievementsData[gameId] || [];
        const unlockedCount = stats.achievementsUnlocked.length;
        
        document.getElementById('lib-stat-achievements').textContent = `${unlockedCount} / ${achs.length}`;

        const progressPct = achs.length > 0 ? (unlockedCount / achs.length) * 100 : 0;
        document.getElementById('lib-achievements-progress').style.width = `${progressPct}%`;

        // Render achievements list
        const achList = document.getElementById('lib-achievements-list');
        if (achs.length === 0) {
            achList.innerHTML = `<li class="empty-state-text">Для этой игры нет достижений.</li>`;
        } else {
            achList.innerHTML = achs.map(ach => {
                const isUnlocked = stats.achievementsUnlocked.includes(ach.id);
                return `
                    <li class="ach-item ${isUnlocked ? 'unlocked' : ''}">
                        <div class="ach-badge-box">
                            ${isUnlocked ? '🏆' : '🔒'}
                        </div>
                        <div class="ach-meta">
                            <div class="ach-name">${ach.title}</div>
                            <div class="ach-desc">${ach.desc}</div>
                        </div>
                    </li>
                `;
            }).join('');
        }

        // Playability checker (Cyberpunk is mock AAA)
        const playBtn = document.getElementById('btn-play-game');
        if (gameId === 'cyberpunk') {
            playBtn.style.background = 'linear-gradient(to bottom, #555, #333)';
            playBtn.style.cursor = 'not-allowed';
            playBtn.style.boxShadow = 'none';
            playBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
                    <circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                НЕДОСТУПНО ДЛЯ ЗАПУСКА
            `;
        } else {
            playBtn.removeAttribute('style');
            playBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                ИГРАТЬ
            `;
        }
    }

    launchActiveGame() {
        if (this.selectedGameId === 'cyberpunk') {
            this.app.showToast("Cyberpunk 2088", "Недостаточно видеопамяти на холсте браузера для запуска AAA игры!", "error");
            audio.playError();
            return;
        }

        const game = gamesData.find(g => g.id === this.selectedGameId);
        if (!game) return;

        audio.playSuccess();

        // 1. Show Arcade cabinet screen overlay
        const cabinet = document.getElementById('arcade-cabinet');
        cabinet.style.display = 'flex';
        document.getElementById('arcade-game-title').textContent = game.title.toUpperCase();
        document.getElementById('arcade-overlay-game-title').textContent = game.title.toUpperCase();

        const canvas = document.getElementById('game-canvas');
        
        // Reset overlay messages
        document.getElementById('arcade-start-screen').style.display = 'flex';
        document.getElementById('arcade-gameover-screen').style.display = 'none';
        
        // Update highscore display on arcade screen
        const gameStats = this.state.gameStats[this.selectedGameId] || { highscore: 0 };
        const hiVal = gameStats.highscore || 0;
        document.getElementById('arcade-hud-score').textContent = '00000';
        document.getElementById('arcade-hud-highscore').textContent = String(hiVal).padStart(5, '0');

        // Set Controls Guides
        const controlsGuide = document.getElementById('arcade-controls-guide');
        if (this.selectedGameId === 'shooter') {
            controlsGuide.innerHTML = `УПРАВЛЕНИЕ:<br><strong>Движение корабля</strong> — Мышка или клавиши Стрелки / WASD.<br><strong>Выстрел</strong> — Левый клик мыши или ПРОБЕЛ.<br>Сбивайте метеориты и врагов, собирайте бонусы!`;
        } else if (this.selectedGameId === 'snake') {
            controlsGuide.innerHTML = `УПРАВЛЕНИЕ:<br><strong>Поворот</strong> — Клавиши Стрелки или WASD.<br>Кушайте светящиеся неоновые ядра и золотые звезды, не врезайтесь в стены и собственный хвост!`;
        } else if (this.selectedGameId === 'maze') {
            controlsGuide.innerHTML = `УПРАВЛЕНИЕ:<br><strong>Шаг</strong> — Клавиши Стрелки или WASD.<br>Держитесь подальше от красных роботов! Сначала возьмите желтый ключ, затем сбегите в мерцающий выход!`;
        } else if (this.selectedGameId === 'mario') {
            controlsGuide.innerHTML = `УПРАВЛЕНИЕ:<br><strong>Движение</strong> — Клавиши Влево/Вправо (A/D).<br><strong>Прыжок</strong> — ПРОБЕЛ или клавиша Вверх (W).<br>Выбивайте головой монеты из блоков, прыгайте сверху на грибы Goomba, захватите флаг в конце!`;
        } else if (this.selectedGameId === 'sonic') {
            controlsGuide.innerHTML = `УПРАВЛЕНИЕ:<br><strong>Прыжок / Двойной прыжок</strong> — ПРОБЕЛ, клавиша Вверх (W) или клик по экрану.<br>Неоновый Соник бежит сам! Собирайте кольца, отскакивайте от пружин и перепрыгивайте шипы!`;
        }

        // Initialize Game Instance
        const config = {
            highscore: hiVal,
            onScore: (score) => {
                document.getElementById('arcade-hud-score').textContent = String(score).padStart(5, '0');
            },
            onAchievement: (id, title, desc) => {
                this.unlockAchievement(this.selectedGameId, id, title, desc);
            },
            onGameOver: (score, highscore) => {
                // Game ended
                document.getElementById('gameover-score-val').textContent = score;
                document.getElementById('arcade-hud-highscore').textContent = String(highscore).padStart(5, '0');
                
                // Show game over overlay screen
                document.getElementById('arcade-gameover-screen').style.display = 'flex';

                // Save highscore
                const stats = this.state.gameStats[this.selectedGameId];
                if (!stats.highscore || score > stats.highscore) {
                    stats.highscore = score;
                    this.app.saveState();
                }
            }
        };

        // Instantiate
        if (this.selectedGameId === 'shooter') {
            this.activeGameInstance = new SpaceDefender(canvas, config);
        } else if (this.selectedGameId === 'snake') {
            this.activeGameInstance = new NeonSnake(canvas, config);
        } else if (this.selectedGameId === 'maze') {
            this.activeGameInstance = new MazeEscaper(canvas, config);
        } else if (this.selectedGameId === 'mario') {
            this.activeGameInstance = new VaporMario(canvas, config);
        } else if (this.selectedGameId === 'sonic') {
            this.activeGameInstance = new NeonSonic(canvas, config);
        }

        // Game enter start binder
        this.gameEnterBinder = (e) => {
            if (e.code === 'Enter') {
                e.preventDefault();
                if (this.activeGameInstance && !this.activeGameInstance.running) {
                    document.getElementById('arcade-start-screen').style.display = 'none';
                    document.getElementById('arcade-gameover-screen').style.display = 'none';
                    this.activeGameInstance.start();
                    audio.playSuccess();
                }
            }
        };
        window.addEventListener('keydown', this.gameEnterBinder);

        // Start active play time log ticks
        this.activeSessionGameId = this.selectedGameId;
        this.playTimeTrackerInterval = setInterval(() => {
            if (this.state.gameStats[this.activeSessionGameId]) {
                this.state.gameStats[this.activeSessionGameId].playTime++;
                this.state.totalPlayTimeMinutes = Math.floor(
                    Object.values(this.state.gameStats).reduce((sum, current) => sum + (current.playTime || 0), 0) / 60
                );
                
                // Dynamic rerender live details if we are viewing the game
                if (this.selectedGameId === this.activeSessionGameId) {
                    const stats = this.state.gameStats[this.selectedGameId];
                    const totalMinutes = Math.floor(stats.playTime / 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const mins = totalMinutes % 60;
                    document.getElementById('lib-stat-time').textContent = `${hours} ч. ${mins} мин.`;
                }

                this.app.saveState();
            }
        }, 1000);
    }

    unlockAchievement(gameId, achId, title, desc) {
        const stats = this.state.gameStats[gameId];
        if (!stats) return;

        if (stats.achievementsUnlocked.includes(achId)) return; // already unlocked

        stats.achievementsUnlocked.push(achId);
        
        // Save
        this.app.saveState();
        
        // Sounds & Toasts
        audio.playSuccess();
        this.app.showToast("Достижение Разблокировано!", `🏆 ${title}: ${desc}`, "achievement");

        // Rerender checklists if we are looking at this game
        if (this.selectedGameId === gameId) {
            this.selectGame(gameId);
        }

        this.app.profileModule.renderProfileData(); // update stats total unlocked
    }

    closeArcadeCabinet() {
        if (!this.activeGameInstance) return;

        // 1. Shutdown game loops
        this.activeGameInstance.destroy();
        this.activeGameInstance = null;

        // 2. Remove enter key listeners
        if (this.gameEnterBinder) {
            window.removeEventListener('keydown', this.gameEnterBinder);
            this.gameEnterBinder = null;
        }

        // 3. Clear sessions timer
        if (this.playTimeTrackerInterval) {
            clearInterval(this.playTimeTrackerInterval);
            this.playTimeTrackerInterval = null;
        }
        this.activeSessionGameId = null;

        // 4. Hide cabinet
        document.getElementById('arcade-cabinet').style.display = 'none';
        
        audio.playClick();
        
        // Rerender detail views (hours/minutes could have changed)
        this.selectGame(this.selectedGameId);
        this.app.profileModule.renderProfileData();
    }
}
