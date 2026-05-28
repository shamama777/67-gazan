/**
 * Главный модуль платформы Vapor - Координатор
 */
import { audio } from './audio.js';
import { StoreModule } from './store.js';
import { CartModule } from './cart.js';
import { LibraryModule } from './library.js';
import { ProfileModule } from './profile.js';

class VaporApp {
    constructor() {
        this.state = {
            username: 'VaporPlayer',
            avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer',
            balance: 1500.00,
            purchasedGames: ['shooter'], // Space Defender is free and in library by default!
            cart: [],
            reviewsWritten: [],
            gameStats: {
                shooter: { playTime: 0, achievementsUnlocked: [] },
                snake: { playTime: 0, achievementsUnlocked: [] },
                maze: { playTime: 0, achievementsUnlocked: [] }
            }
        };

        this.storeModule = null;
        this.cartModule = null;
        this.libraryModule = null;
        this.profileModule = null;

        this.init();
    }

    init() {
        this.loadState();
        this.initSounds();
        this.initAmbientCanvas();
        this.initModules();
        this.setupNavigation();
        this.updateWalletDisplay();

        // Initial pill sync
        document.getElementById('header-username').textContent = this.state.username;
        document.getElementById('header-avatar').src = this.state.avatarUrl;

        console.log("Vapor platform initialized successfully!");
    }

    loadState() {
        const saved = localStorage.getItem('vapor_user_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Deep merge defaults to avoid breaks on schema updates
                this.state = { ...this.state, ...parsed };
                // Ensure sub-objects are also merged safely
                this.state.gameStats = { ...this.state.gameStats, ...parsed.gameStats };
            } catch (e) {
                console.error("Failed to parse vapor state, resetting to default:", e);
            }
        } else {
            this.saveState();
        }
    }

    saveState() {
        localStorage.setItem('vapor_user_state', JSON.stringify(this.state));
    }

    initSounds() {
        const soundBtn = document.getElementById('sound-toggle');
        if (!soundBtn) return;

        soundBtn.addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            
            // Toggle icon visual
            if (isMuted) {
                soundBtn.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                `;
                this.showToast("Аудио", "Звуки выключены", "success");
            } else {
                soundBtn.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                `;
                audio.playSuccess();
                this.showToast("Аудио", "Звуки включены!", "success");
            }
        });
    }

    initAmbientCanvas() {
        const canvas = document.getElementById('ambient-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles = [];
        const maxParticles = 40;

        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 40 + 20,
                color: Math.random() > 0.5 ? 'rgba(102, 192, 244, 0.05)' : 'rgba(27, 60, 90, 0.04)'
            });
        }

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        function animate() {
            ctx.fillStyle = '#171a21';
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wall bouncing
                if (p.x < -p.radius) p.x = width + p.radius;
                if (p.x > width + p.radius) p.x = -p.radius;
                if (p.y < -p.radius) p.y = height + p.radius;
                if (p.y > height + p.radius) p.y = -p.radius;

                // Draw glows
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    initModules() {
        this.storeModule = new StoreModule(this.state, this);
        this.cartModule = new CartModule(this.state, this);
        this.libraryModule = new LibraryModule(this.state, this);
        this.profileModule = new ProfileModule(this.state, this);
    }

    setupNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = tab.dataset.target;
                this.switchTab(target);
                audio.playClick();
            });
        });

        // Cart Nav Icon Trigger
        const cartBtn = document.getElementById('cart-nav-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.switchTab('cart');
                audio.playClick();
            });
        }

        // Wallet Display click redirects to Profile
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            walletBtn.addEventListener('click', () => {
                this.switchTab('profile');
                audio.playClick();
            });
        }

        // Top-right pill redirects to Profile
        const userPill = document.getElementById('user-pill-btn');
        if (userPill) {
            userPill.addEventListener('click', () => {
                this.switchTab('profile');
                audio.playClick();
            });
        }

        // Logo click redirects to Store
        const logo = document.getElementById('logo-btn');
        if (logo) {
            logo.addEventListener('click', () => {
                this.switchTab('store');
                audio.playClick();
            });
        }
    }

    switchTab(tabId) {
        // Toggle view visibility
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${tabId}-view`).classList.add('active');

        // Toggle nav active states
        document.querySelectorAll('.nav-tab').forEach(tab => {
            if (tab.dataset.target === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Specific sub-module triggers on select
        if (tabId === 'store') {
            this.storeModule.renderCatalog();
        } else if (tabId === 'library') {
            this.libraryModule.renderLibrary();
        } else if (tabId === 'cart') {
            this.cartModule.renderCart();
        } else if (tabId === 'profile') {
            this.profileModule.renderProfileData();
        }

        // Scroll to top smooth
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateWalletDisplay() {
        const val = document.getElementById('wallet-val');
        if (val) {
            val.textContent = `₽${this.state.balance.toFixed(2)}`;
        }
    }

    showToast(title, description, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '🔔';
        if (type === 'achievement') icon = '🏆';
        else if (type === 'error') icon = '⚠️';
        else if (type === 'success') icon = '✅';

        toast.innerHTML = `
            <div class="toast-icon-box">${icon}</div>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${description}</div>
            </div>
        `;

        container.appendChild(toast);

        // Slide in
        setTimeout(() => toast.classList.add('show'), 50);

        // Slide out and destroy after 4.5s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }
}

// Global Launcher
window.addEventListener('DOMContentLoaded', () => {
    window.app = new VaporApp();
});
