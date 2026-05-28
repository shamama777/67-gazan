/**
 * Модуль Профиля Пользователя Vapor
 */
import { audio } from './audio.js';
import { gamesData } from './store.js';
import { achievementsData } from './library.js';

// Pre-defined pixel art avatars from Dicebear for profile choice customization
const avatarSeeds = ['Gamer', 'Ninja', 'Ghost', 'Alien', 'Knight', 'Retro', 'Vapor', 'Matrix', 'Arcade', 'Pixel', 'Space', 'Dungeon'];

export class ProfileModule {
    constructor(state, app) {
        this.state = state;
        this.app = app;

        this.init();
    }

    init() {
        this.renderProfileData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Username edit
        const nameInput = document.getElementById('profile-username-input');
        if (nameInput) {
            nameInput.addEventListener('change', (e) => {
                const newName = e.target.value.trim() || 'VaporPlayer';
                this.state.username = newName;
                
                // Update top-right header pill username
                document.getElementById('header-username').textContent = newName;
                
                this.app.saveState();
                this.app.showToast("Профиль обновлен", `Никнейм успешно изменен на ${newName}`, "success");
                audio.playSuccess();
            });
        }

        // Wallet deposits
        const depositBtns = document.querySelectorAll('.btn-deposit');
        depositBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.state.balance += amount;
                
                this.app.saveState();
                this.app.updateWalletDisplay();
                this.renderProfileData(); // update stats total balance
                
                audio.playCash();
                this.app.showToast("Баланс пополнен", `На ваш счет зачислено виртуальных ₽${amount}!`, "success");
            });
        });

        // Profile Tab switches (Achievements vs Reviews)
        const tabBtns = document.querySelectorAll('.p-tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.dataset.target;
                document.querySelectorAll('.p-tab-panel').forEach(p => p.classList.remove('active'));
                document.getElementById(target).classList.add('active');
                
                audio.playClick();
            });
        });

        // Avatar Modal selectors
        const avatarImg = document.getElementById('profile-avatar-img');
        const avatarModal = document.getElementById('avatar-modal');
        const changeBtn = document.getElementById('change-avatar-btn');

        if (changeBtn && avatarModal) {
            changeBtn.addEventListener('click', () => {
                this.openAvatarModal();
            });
            avatarImg.addEventListener('click', () => {
                this.openAvatarModal();
            });
        }

        const closeAvatarBtn = document.getElementById('close-avatar-modal');
        if (closeAvatarBtn) {
            closeAvatarBtn.addEventListener('click', () => {
                avatarModal.style.display = 'none';
                audio.playClick();
            });
        }
    }

    openAvatarModal() {
        const modal = document.getElementById('avatar-modal');
        const grid = document.getElementById('avatar-options');
        if (!modal || !grid) return;

        grid.innerHTML = avatarSeeds.map(seed => {
            const url = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
            const isSelected = this.state.avatarUrl === url;
            return `
                <img src="${url}" 
                     class="avatar-opt ${isSelected ? 'selected' : ''}" 
                     data-seed="${seed}" 
                     alt="Avatar">
            `;
        }).join('');

        modal.style.display = 'flex';
        audio.playClick();

        // Bind options click
        grid.querySelectorAll('.avatar-opt').forEach(img => {
            img.addEventListener('click', () => {
                const seed = img.dataset.seed;
                const newUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
                
                this.state.avatarUrl = newUrl;
                
                // Update views
                document.getElementById('profile-avatar-img').src = newUrl;
                document.getElementById('header-avatar').src = newUrl;

                this.app.saveState();
                modal.style.display = 'none';
                this.app.showToast("Профиль", "Аватар успешно обновлен!", "success");
                audio.playSuccess();
            });
        });
    }

    renderProfileData() {
        // Sync inputs
        const nameInput = document.getElementById('profile-username-input');
        if (nameInput) nameInput.value = this.state.username;

        const avatarImg = document.getElementById('profile-avatar-img');
        if (avatarImg) avatarImg.src = this.state.avatarUrl;

        // Calculate statistics
        const gamesCount = this.state.purchasedGames.length;
        document.getElementById('profile-games-count').textContent = gamesCount;

        let totalUnlocked = 0;
        let totalTimeSeconds = 0;

        Object.values(this.state.gameStats).forEach(stat => {
            totalUnlocked += (stat.achievementsUnlocked || []).length;
            totalTimeSeconds += (stat.playTime || 0);
        });

        const totalTimeMinutes = Math.floor(totalTimeSeconds / 60);
        
        document.getElementById('profile-total-ach').textContent = totalUnlocked;
        document.getElementById('profile-total-time').textContent = `${totalTimeMinutes}м`;

        // Render Achievements Showcase tab
        this.renderAchievementsTab();

        // Render Reviews written tab
        this.renderReviewsTab();
    }

    renderAchievementsTab() {
        const grid = document.getElementById('profile-ach-grid');
        if (!grid) return;

        const ownedGameIds = this.state.purchasedGames;
        const unlockedList = [];

        ownedGameIds.forEach(gid => {
            const game = gamesData.find(g => g.id === gid);
            const stats = this.state.gameStats[gid];
            const allGameAchs = achievementsData[gid] || [];

            if (game && stats && stats.achievementsUnlocked.length > 0) {
                stats.achievementsUnlocked.forEach(aid => {
                    const ach = allGameAchs.find(a => a.id === aid);
                    if (ach) {
                        unlockedList.push({
                            gameTitle: game.title,
                            achTitle: ach.title,
                            achDesc: ach.desc
                        });
                    }
                });
            }
        });

        if (unlockedList.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-text" style="grid-column: 1 / -1;">
                    <h3>Нет открытых достижений</h3>
                    <p>Запускайте игры из библиотеки и выполняйте игровые условия для открытия достижений!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = unlockedList.map(a => `
            <div class="profile-ach-card">
                <div class="p-ach-icon">🏆</div>
                <div class="p-ach-meta">
                    <div class="p-ach-name">${a.achTitle}</div>
                    <div class="p-ach-game">${a.gameTitle}</div>
                    <div class="p-ach-desc">${a.achDesc}</div>
                </div>
            </div>
        `).join('');
    }

    renderReviewsTab() {
        const container = document.getElementById('profile-reviews-list');
        if (!container) return;

        const reviews = this.state.reviewsWritten;

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state-text">
                    <h3>Отзывов пока нет</h3>
                    <p>Напишите ваш первый отзыв на детальной странице игры в магазине!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map(r => `
            <div class="profile-review-card">
                <div class="p-rev-header">
                    <span class="p-rev-game">${r.gameTitle}</span>
                    <div class="p-rev-recommendation ${r.rating === 'positive' ? 'recommended' : 'not-recommended'}">
                        ${r.rating === 'positive' ? '👍 РЕКОМЕНДУЕТСЯ' : '👎 НЕ РЕКОМЕНДУЕТСЯ'}
                    </div>
                </div>
                <p class="p-rev-body">« ${r.text} »</p>
            </div>
        `).join('');
    }
}
