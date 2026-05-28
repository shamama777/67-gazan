/**
 * Модуль Корзины Vapor
 */
import { audio } from './audio.js';
import { gamesData } from './store.js';

export class CartModule {
    constructor(state, app) {
        this.state = state;
        this.app = app;
        
        this.init();
    }

    init() {
        this.updateBadge();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const purchaseBtn = document.getElementById('btn-purchase');
        if (purchaseBtn) {
            purchaseBtn.addEventListener('click', () => this.purchase());
        }

        const clearBtn = document.getElementById('btn-clear-cart');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCart());
        }
    }

    updateBadge() {
        const badge = document.querySelector('.cart-badge');
        if (!badge) return;

        const count = this.state.cart.length;
        badge.textContent = count;
        
        if (count > 0) {
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }

    toggleCartItem(gameId) {
        if (this.state.purchasedGames.includes(gameId)) return;

        const inCartIdx = this.state.cart.indexOf(gameId);
        if (inCartIdx === -1) {
            // Add to cart
            this.state.cart.push(gameId);
            this.app.showToast("Корзина", "Игра добавлена в корзину!", "success");
            audio.playSuccess();
        } else {
            // Remove from cart
            this.state.cart.splice(inCartIdx, 1);
            this.app.showToast("Корзина", "Игра удалена из корзины.", "success");
            audio.playClick();
        }

        this.app.saveState();
        this.updateBadge();
        this.app.storeModule.renderCatalog(); // update catalog button styles
        this.renderCart();
    }

    clearCart() {
        if (this.state.cart.length === 0) return;
        this.state.cart = [];
        this.app.saveState();
        this.updateBadge();
        this.app.storeModule.renderCatalog();
        this.renderCart();
        this.app.showToast("Корзина", "Корзина успешно очищена.", "success");
        audio.playClick();
    }

    renderCart() {
        const container = document.getElementById('cart-items-container');
        const totalVal = document.getElementById('cart-total-price');
        const checkoutTotal = document.getElementById('cart-checkout-total');
        const itemsCount = document.getElementById('cart-items-count');

        if (!container) return;

        const count = this.state.cart.length;
        itemsCount.textContent = count;

        if (count === 0) {
            container.innerHTML = `
                <div class="empty-cart-message">
                    <svg class="empty-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3>Ваша корзина пуста</h3>
                    <p>В магазине вас ждут десятки захватывающих приключений!</p>
                    <button class="btn btn-primary nav-redirect-btn" data-target="store" style="margin-top: 10px;">В Магазин</button>
                </div>
            `;
            
            // Register redirect inside empty cart
            const redirectBtn = container.querySelector('.nav-redirect-btn');
            if (redirectBtn) {
                redirectBtn.addEventListener('click', () => {
                    this.app.switchTab('store');
                });
            }

            totalVal.textContent = '₽0.00';
            checkoutTotal.textContent = '₽0.00';
            return;
        }

        // Get actual games in cart
        let total = 0;
        const cartGames = this.state.cart.map(id => {
            const game = gamesData.find(g => g.id === id);
            if (game) {
                total += game.price;
            }
            return game;
        }).filter(Boolean);

        container.innerHTML = cartGames.map(game => `
            <div class="cart-item">
                <img src="${game.coverImg}" class="cart-item-img" alt="${game.title}">
                <div class="cart-item-meta">
                    <h4 class="cart-item-title">${game.title}</h4>
                    <span class="cart-item-genre">${game.genreLabel}</span>
                </div>
                <div class="cart-item-price-section">
                    <span class="cart-item-price">${game.price === 0 ? 'Бесплатно' : `₽${game.price.toFixed(2)}`}</span>
                    <button class="cart-item-remove" data-id="${game.id}">Удалить</button>
                </div>
            </div>
        `).join('');

        totalVal.textContent = `₽${total.toFixed(2)}`;
        checkoutTotal.textContent = `₽${total.toFixed(2)}`;

        // Remove item binders
        container.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.toggleCartItem(id);
            });
        });
    }

    purchase() {
        if (this.state.cart.length === 0) return;

        // Calc total
        let total = 0;
        this.state.cart.forEach(id => {
            const game = gamesData.find(g => g.id === id);
            if (game) total += game.price;
        });

        // Balance validation
        if (this.state.balance < total) {
            audio.playError();
            this.app.showToast("Покупка отклонена", "Недостаточно средств на балансе кошелька!", "error");
            return;
        }

        // Deduct money
        this.state.balance -= total;
        
        // Add games to library
        this.state.cart.forEach(id => {
            if (!this.state.purchasedGames.includes(id)) {
                this.state.purchasedGames.push(id);
                // Initialize game stats in state
                if (!this.state.gameStats[id]) {
                    this.state.gameStats[id] = {
                        playTime: 0, // seconds
                        achievementsUnlocked: []
                    };
                }
            }
        });

        this.state.cart = [];
        this.app.saveState();
        audio.playCash();
        this.app.showToast("Спасибо за покупку!", `Игры успешно добавлены в вашу Библиотеку. Списано: ₽${total.toFixed(2)}`, "success");

        // Rerender all
        this.updateBadge();
        this.renderCart();
        this.app.updateWalletDisplay();
        this.app.storeModule.renderCatalog();
        this.app.libraryModule.renderLibrary();
        this.app.profileModule.renderProfileData();

        // Redirect to library tab
        setTimeout(() => {
            this.app.switchTab('library');
        }, 800);
    }
}
