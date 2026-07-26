/* ========== CIAN GIFT — ОСНОВНОЙ СКРИПТ ========== */

// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Цветовая схема Telegram
    document.documentElement.style.setProperty('--tg-bg', tg.backgroundColor || '#0a0c0b');
}

// ========== МАГАЗИН ==========
function initShop() {
    const container = document.getElementById('shop-container');
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = 'true';
    
    container.innerHTML = `
        <div id="shop-screen">
            <h2 id="shop-title">🛒 Магазин скинов</h2>
            <div id="shop-balance">Баланс: ${PlayerState.balance.toLocaleString()} 🪙</div>
            <div id="shop-items"></div>
        </div>
    `;
    
    addShopStyles();
    renderShopItems();
}

function addShopStyles() {
    if (document.getElementById('shop-styles')) return;
    const style = document.createElement('style');
    style.id = 'shop-styles';
    style.textContent = `
        #shop-screen {
            padding: 70px 15px 20px;
            text-align: center;
        }
        #shop-title {
            font-family: 'Playfair Display', serif;
            color: #c9a96e;
            margin-bottom: 10px;
        }
        #shop-balance {
            color: #9a9484;
            margin-bottom: 20px;
            font-size: 14px;
        }
        #shop-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
            margin: 0 auto;
        }
        .shop-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,0.02);
            border: 1px solid #c9a96e22;
            border-radius: 12px;
            padding: 12px 15px;
            gap: 12px;
        }
        .shop-item.owned {
            border-color: #0d5c3b55;
            background: rgba(13,92,59,0.1);
        }
        .shop-item.active-skin {
            border-color: #c9a96e;
            box-shadow: 0 0 15px rgba(201,169,110,0.2);
        }
        .shop-item-icon {
            font-size: 30px;
        }
        .shop-item-info {
            flex: 1;
            text-align: left;
        }
        .shop-item-name {
            font-weight: 600;
            color: #ddd;
        }
        .shop-item-status {
            font-size: 11px;
            color: #9a9484;
        }
        .shop-item-btn {
            padding: 8px 16px;
            border-radius: 20px;
            border: 1px solid #c9a96e;
            background: transparent;
            color: #c9a96e;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .shop-item-btn:active {
            background: rgba(201,169,110,0.2);
        }
        .shop-item-btn.owned-btn {
            border-color: #0d5c3b;
            color: #0d5c3b;
        }
        .shop-item-btn.active-btn {
            background: #c9a96e;
            color: #1a1005;
        }
    `;
    document.head.appendChild(style);
}

function renderShopItems() {
    const container = document.getElementById('shop-items');
    if (!container) return;
    
    container.innerHTML = SHOP_ITEMS.map(item => {
        const owned = PlayerState.inventory.includes(item.id);
        const isActive = PlayerState.activeSkin === item.id;
        
        let btnText, btnClass;
        if (isActive) {
            btnText = '✅ Выбрано';
            btnClass = 'active-btn';
        } else if (owned) {
            btnText = 'Выбрать';
            btnClass = 'owned-btn';
        } else {
            btnText = `${item.price.toLocaleString()} 🪙`;
            btnClass = '';
        }
        
        return `
            <div class="shop-item ${owned ? 'owned' : ''} ${isActive ? 'active-skin' : ''}">
                <span class="shop-item-icon">${item.icon}</span>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-status">${isActive ? 'Активен' : owned ? 'Куплен' : ''}</div>
                </div>
                <button class="shop-item-btn ${btnClass}" data-skin="${item.id}" data-owned="${owned}" data-price="${item.price}">
                    ${btnText}
                </button>
            </div>
        `;
    }).join('');
    
    // Обработчики кнопок
    container.querySelectorAll('.shop-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const skinId = btn.dataset.skin;
            const owned = btn.dataset.owned === 'true';
            const price = parseInt(btn.dataset.price);
            
            if (PlayerState.activeSkin === skinId) return;
            
            if (!owned) {
                if (PlayerState.balance < price) {
                    showWinToast(0);
                    return;
                }
                updateBalance(-price);
                PlayerState.inventory.push(skinId);
                saveState();
            }
            
            PlayerState.activeSkin = skinId;
            saveState();
            AudioEngine.click();
            renderShopItems();
            updateChipSkin();
        });
    });
}

// Обновление цвета фишек в зависимости от скина
function updateChipSkin() {
    const skin = SHOP_ITEMS.find(s => s.id === PlayerState.activeSkin);
    if (!skin) return;
    
    document.documentElement.style.setProperty('--chip-glow', skin.color);
}

// ========== ПРОФИЛЬ ==========
function initProfile() {
    const container = document.getElementById('profile-container');
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = 'true';
    
    const vip = VIP_TIERS[PlayerState.vipTier];
    const xpToNext = getXPToNextLevel();
    
    container.innerHTML = `
        <div id="profile-screen">
            <div id="profile-avatar">${vip.icon}</div>
            <h2 id="profile-name">Игрок</h2>
            <div id="profile-vip" style="color: ${vip.color}">${vip.name} VIP</div>
            <div id="profile-level">Уровень ${PlayerState.level}</div>
            <div id="profile-xp-bar">
                <div id="profile-xp-fill"></div>
            </div>
            <div id="profile-xp-text">XP до следующего уровня</div>
            <div id="profile-stats">
                <div class="stat-item">
                    <span class="stat-label">Баланс</span>
                    <span class="stat-value">${PlayerState.balance.toLocaleString()} 🪙</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Всего поставлено</span>
                    <span class="stat-value">${PlayerState.totalWagered.toLocaleString()} 🪙</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Всего выиграно</span>
                    <span class="stat-value">${PlayerState.totalWon.toLocaleString()} 🪙</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Игр сыграно</span>
                    <span class="stat-value">${PlayerState.gamesPlayed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Кешбек</span>
                    <span class="stat-value">${vip.cashback}%</span>
                </div>
            </div>
        </div>
    `;
    
    addProfileStyles();
    document.getElementById('profile-xp-fill').style.width = getXPPercentage() + '%';
}

function addProfileStyles() {
    if (document.getElementById('profile-styles')) return;
    const style = document.createElement('style');
    style.id = 'profile-styles';
    style.textContent = `
        #profile-screen {
            padding: 70px 15px 20px;
            text-align: center;
            max-width: 350px;
            margin: 0 auto;
        }
        #profile-avatar { font-size: 50px; margin-bottom: 5px; }
        #profile-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #ddd; }
        #profile-vip { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
        #profile-level { color: #9a9484; font-size: 13px; }
        #profile-xp-bar {
            width: 100%;
            height: 8px;
            background: #1a1a1a;
            border-radius: 4px;
            margin: 8px 0;
            overflow: hidden;
        }
        #profile-xp-fill {
            height: 100%;
            background: linear-gradient(90deg, #0d5c3b, #c9a96e);
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        #profile-xp-text { font-size: 11px; color: #9a9484; margin-bottom: 20px; }
        #profile-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            background: rgba(255,255,255,0.02);
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid #ffffff05;
        }
        .stat-label { color: #9a9484; font-size: 13px; }
        .stat-value { color: #ddd; font-size: 13px; font-weight: 600; }
    `;
    document.head.appendChild(style);
}

function getXPToNextLevel() {
    const currentLevelXP = (PlayerState.level - 1) * 1000;
    const nextLevelXP = PlayerState.level * 1000;
    return nextLevelXP - PlayerState.xp;
}

function getXPPercentage() {
    const currentLevelXP = (PlayerState.level - 1) * 1000;
    const nextLevelXP = PlayerState.level * 1000;
    return Math.min(((PlayerState.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
}

// ========== НАСТРОЙКИ ==========
function initSettings() {
    const container = document.getElementById('settings-container');
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = 'true';
    
    container.innerHTML = `
        <div id="settings-screen">
            <h2 id="settings-title">⚙️ Настройки</h2>
            <div class="setting-item">
                <span>🎵 Музыка</span>
                <button id="toggle-music" class="setting-toggle on">ВКЛ</button>
            </div>
            <div class="setting-item">
                <span>🔊 Звуки</span>
                <button id="toggle-sfx" class="setting-toggle on">ВКЛ</button>
            </div>
            <div class="setting-item">
                <span>💬 Чат</span>
                <button id="toggle-chat-setting" class="setting-toggle on">ВКЛ</button>
            </div>
            <hr>
            <div class="setting-item">
                <span>🗑 Сбросить прогресс</span>
                <button id="reset-progress" class="setting-toggle danger">СБРОС</button>
            </div>
            <div id="settings-version">Cian Gift v1.0</div>
        </div>
    `;
    
    addSettingsStyles();
    
    document.getElementById('toggle-music').addEventListener('click', function() {
        this.classList.toggle('on');
        this.classList.toggle('off');
        this.textContent = this.classList.contains('on') ? 'ВКЛ' : 'ВЫКЛ';
        // TODO: реальное отключение музыки
    });
    
    document.getElementById('toggle-sfx').addEventListener('click', function() {
        this.classList.toggle('on');
        this.classList.toggle('off');
        this.textContent = this.classList.contains('on') ? 'ВКЛ' : 'ВЫКЛ';
        // TODO: реальное отключение звуков
    });
    
    document.getElementById('toggle-chat-setting').addEventListener('click', function() {
        this.classList.toggle('on');
        this.classList.toggle('off');
        this.textContent = this.classList.contains('on') ? 'ВКЛ' : 'ВЫКЛ';
        document.getElementById('chat-panel').style.display = 
            this.classList.contains('on') ? '' : 'none';
    });
    
    document.getElementById('reset-progress').addEventListener('click', () => {
        if (confirm('Точно сбросить весь прогресс? Баланс, уровень, скины — всё пропадёт.')) {
            Object.assign(PlayerState, {
                balance: CONFIG.startingBalance,
                totalWagered: 0,
                totalWon: 0,
                gamesPlayed: 0,
                level: 1,
                xp: 0,
                vipTier: 'bronze',
                lastDailyBonus: null,
                activeSkin: 'classic',
                inventory: ['classic'],
            });
            saveState();
            updateBalanceDisplay();
            showWinToast(CONFIG.startingBalance);
        }
    });
}

function addSettingsStyles() {
    if (document.getElementById('settings-styles')) return;
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
        #settings-screen {
            padding: 70px 15px 20px;
            max-width: 350px;
            margin: 0 auto;
        }
        #settings-title {
            font-family: 'Playfair Display', serif;
            color: #c9a96e;
            text-align: center;
            margin-bottom: 20px;
        }
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid #ffffff08;
            color: #ddd;
            font-size: 14px;
        }
        .setting-toggle {
            padding: 6px 16px;
            border-radius: 15px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            transition: all 0.2s;
        }
        .setting-toggle.on {
            background: #0d5c3b;
            color: #aaf0ba;
        }
        .setting-toggle.off {
            background: #333;
            color: #888;
        }
        .setting-toggle.danger {
            background: transparent;
            border: 1px solid #8b1a1a;
            color: #cf4a4a;
        }
        #settings-version {
            text-align: center;
            color: #9a9484;
            font-size: 11px;
            margin-top: 30px;
        }
        hr {
            border: none;
            border-top: 1px solid #ffffff08;
            margin: 10px 0;
        }
    `;
    document.head.appendChild(style);
}

// ========== ЗАПУСК ПРИЛОЖЕНИЯ ==========
function bootApp() {
    loadState();
    updateBalanceDisplay();
    updateChipSkin();
    
    // Загружаем холл
    initHall();
    
    // Предзагружаем игры (контейнеры)
    initRoulette();
    initCrash();
    initSlots();
    initHigherLower();
    initWheel();
    
    // Обработка кнопки «Назад» в Telegram
    if (tg) {
        tg.BackButton.onClick(() => {
            navigateTo('hall');
        });
    }
    
    console.log('🎰 Cian Gift загружен и готов к игре.');
    console.log('   Холл, Рулетка, Краш, Слоты, Больше-Меньше, Колесо.');
    console.log('   Удачи, Игрок.');
}

// Запуск
document.addEventListener('DOMContentLoaded', bootApp);
