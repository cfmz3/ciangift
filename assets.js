/* ========== CIAN GIFT — АССЕТЫ И КОНФИГУРАЦИЯ ========== */

// Конфигурация приложения
const CONFIG = {
    casinoName: 'Cian Gift',
    startingBalance: 1000,
    dailyBonus: 500,
    dailyBonusInterval: 86400000, // 24 часа
    currency: 'фишек',
    currencyIcon: '🪙',
    maxBet: 10000,
    minBet: 10,
};

// Состояние игрока
const PlayerState = {
    balance: CONFIG.startingBalance,
    totalWagered: 0,
    totalWon: 0,
    gamesPlayed: 0,
    level: 1,
    xp: 0,
    vipTier: 'bronze', // bronze, silver, gold, platinum, diamond
    lastDailyBonus: null,
    activeSkin: 'classic',
    inventory: ['classic'],
};

// VIP уровни
const VIP_TIERS = {
    bronze: { name: 'Бронза', color: '#cd7f32', icon: '🥉', cashback: 0, xpRequired: 0 },
    silver: { name: 'Серебро', color: '#c0c0c0', icon: '🥈', cashback: 2, xpRequired: 5000 },
    gold: { name: 'Золото', color: '#ffd700', icon: '🥇', cashback: 5, xpRequired: 25000 },
    platinum: { name: 'Платина', color: '#e5e4e2', icon: '💎', cashback: 8, xpRequired: 100000 },
    diamond: { name: 'Алмаз', color: '#b9f2ff', icon: '👑', cashback: 12, xpRequired: 500000 },
};

// Конфигурация игр
const GAMES = {
    roulette: {
        name: 'Рулетка',
        icon: '🎡',
        minBet: 10,
        maxBet: 5000,
        rtp: 0.973, // 97.3%
    },
    crash: {
        name: 'Краш',
        icon: '🚀',
        minBet: 10,
        maxBet: 5000,
        rtp: 0.97,
    },
    slots: {
        name: 'Слоты',
        icon: '🎰',
        minBet: 10,
        maxBet: 1000,
        rtp: 0.96,
    },
    higherlower: {
        name: 'Больше-Меньше',
        icon: '🃏',
        minBet: 10,
        maxBet: 5000,
        rtp: 0.98,
    },
    wheel: {
        name: 'Колесо Фортуны',
        icon: '🎁',
        minBet: 0, // бесплатно раз в день
        maxBet: 0,
        rtp: 1.0,
    },
};

// Символы слота
const SLOT_SYMBOLS = [
    { id: 'cherry', name: 'Вишня', emoji: '🍒', value: [0, 0, 2, 5, 10] },
    { id: 'lemon', name: 'Лимон', emoji: '🍋', value: [0, 0, 3, 8, 15] },
    { id: 'bell', name: 'Колокол', emoji: '🔔', value: [0, 2, 5, 15, 30] },
    { id: 'seven', name: 'Семёрка', emoji: '7️⃣', value: [0, 5, 10, 30, 50] },
    { id: 'emerald', name: 'Изумруд', emoji: '💎', value: [0, 10, 25, 50, 100] },
    { id: 'crown', name: 'Корона', emoji: '👑', value: [0, 20, 50, 100, 200] },
    { id: 'wild', name: 'Wild', emoji: '🌟', value: [0, 50, 100, 200, 500], isWild: true },
    { id: 'bonus', name: 'Бонус', emoji: '🎁', value: [0, 0, 0, 0, 0], isBonus: true },
];

// Звуки (используем Web Audio API для генерации звуков без файлов)
const AudioEngine = {
    ctx: null,
    
    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    playTone(freq, duration, type = 'sine', volume = 0.3) {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    chip() {
        this.playTone(800, 0.08, 'square', 0.2);
        setTimeout(() => this.playTone(600, 0.06, 'square', 0.15), 50);
    },

    spin() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playTone(200 + Math.random() * 400, 0.05, 'triangle', 0.15);
            }, i * 80);
        }
    },

    win() {
        this.playTone(523, 0.15, 'sine', 0.4);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.4), 150);
        setTimeout(() => this.playTone(784, 0.3, 'sine', 0.5), 300);
    },

    bigWin() {
        const notes = [523, 659, 784, 1047, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.4);
                this.playTone(freq / 2, 0.3, 'triangle', 0.2);
            }, i * 120);
        });
    },

    lose() {
        this.playTone(300, 0.2, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.1), 200);
    },

    click() {
        this.playTone(1000, 0.03, 'square', 0.15);
    },

    card() {
        this.playTone(400, 0.06, 'triangle', 0.2);
        setTimeout(() => this.playTone(500, 0.04, 'triangle', 0.15), 60);
    },
};

// Звуки для музыки фона (простая генерация ambient)
function startAmbientMusic() {
    AudioEngine.init();
    // Тихая ambient дорожка через осцилляторы
    const ctx = AudioEngine.ctx;
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.value = 55; // A1
    osc2.type = 'sine';
    osc2.frequency.value = 82.5; // E2 (квинта)
    
    gain.gain.value = 0.03;
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
}

// Магазин скинов
const SHOP_ITEMS = [
    { id: 'classic', name: 'Классика', price: 0, icon: '🟤', color: '#8b6914', owned: true },
    { id: 'gold', name: 'Золотой', price: 5000, icon: '🟡', color: '#ffd700', owned: false },
    { id: 'emerald', name: 'Изумрудный', price: 10000, icon: '🟢', color: '#0d5c3b', owned: false },
    { id: 'ruby', name: 'Рубиновый', price: 25000, icon: '🔴', color: '#8b1a1a', owned: false },
    { id: 'diamond', name: 'Алмазный', price: 100000, icon: '💠', color: '#b9f2ff', owned: false },
];

// Демо-сообщения для чата
const DEMO_CHAT_MESSAGES = [
    { user: 'Vortex', text: 'Краш сегодня жжёт! 🔥' },
    { user: 'LuckyOne', text: 'Только что ×3.2 взял' },
    { user: 'CianGift', text: 'Добро пожаловать в Cian Gift! 🎰' },
    { user: 'HighRoller', text: 'Ставлю всё на красное' },
    { user: 'EmeraldKing', text: 'Слоты сегодня добрые' },
    { user: 'NewPlayer', text: 'Всем удачи! 🍀' },
];

// Функция сохранения состояния в localStorage
function saveState() {
    try {
        localStorage.setItem('cian_gift_state', JSON.stringify(PlayerState));
    } catch (e) {
        // localStorage недоступен
    }
}

// Функция загрузки состояния
function loadState() {
    try {
        const saved = localStorage.getItem('cian_gift_state');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(PlayerState, data);
        }
    } catch (e) {
        // Игнорируем, используем дефолт
    }
}

// Функция обновления баланса
function updateBalance(amount) {
    PlayerState.balance += amount;
    if (amount > 0) {
        PlayerState.totalWon += amount;
    }
    if (amount < 0) {
        PlayerState.totalWagered += Math.abs(amount);
    }
    PlayerState.xp += Math.abs(amount);
    updateVIPLevel();
    saveState();
    updateBalanceDisplay();
}

// Обновление VIP уровня
function updateVIPLevel() {
    const xp = PlayerState.xp;
    if (xp >= 500000) PlayerState.vipTier = 'diamond';
    else if (xp >= 100000) PlayerState.vipTier = 'platinum';
    else if (xp >= 25000) PlayerState.vipTier = 'gold';
    else if (xp >= 5000) PlayerState.vipTier = 'silver';
    else PlayerState.vipTier = 'bronze';
    
    PlayerState.level = Math.floor(xp / 1000) + 1;
}

// Обновление отображения баланса
function updateBalanceDisplay() {
    const el = document.getElementById('balance-display');
    if (el) {
        el.textContent = `🪙 ${PlayerState.balance.toLocaleString()}`;
    }
}

// Показать сообщение о выигрыше
function showWinToast(amount) {
    const toast = document.createElement('div');
    toast.className = 'win-toast';
    toast.textContent = amount > 0 
        ? `+${amount.toLocaleString()} 🪙` 
        : `-${Math.abs(amount).toLocaleString()} 🪙`;
    toast.style.color = amount > 0 ? 'var(--gold-light)' : '#aa5555';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Частицы выигрыша
function spawnParticles(x, y, count = 20) {
    const container = document.createElement('div');
    container.className = 'win-particles';
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 100;
        particle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1100);
}

// Проверка ежедневного бонуса
function canClaimDailyBonus() {
    if (!PlayerState.lastDailyBonus) return true;
    const now = Date.now();
    return (now - PlayerState.lastDailyBonus) >= CONFIG.dailyBonusInterval;
}

// Получить ежедневный бонус
function claimDailyBonus() {
    if (!canClaimDailyBonus()) return false;
    PlayerState.lastDailyBonus = Date.now();
    updateBalance(CONFIG.dailyBonus);
    saveState();
    return true;
}

// Инициализация
loadState();
updateBalanceDisplay();
