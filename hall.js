/* ========== CIAN GIFT — ХОЛЛ КАЗИНО ========== */

// Параллакс эффект
const parallaxLayer1 = document.getElementById('parallax-layer-1');
const parallaxLayer2 = document.getElementById('parallax-layer-2');
const hall = document.getElementById('hall');

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

// Отслеживание движения (мышь или тач)
hall.addEventListener('mousemove', (e) => {
    const rect = hall.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
});

hall.addEventListener('touchmove', (e) => {
    const rect = hall.getBoundingClientRect();
    const touch = e.touches[0];
    targetX = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
}, { passive: true });

// Плавное обновление параллакса
function updateParallax() {
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;
    
    if (parallaxLayer1) {
        parallaxLayer1.style.transform = `translate(${mouseX * 8}px, ${mouseY * 8}px)`;
    }
    if (parallaxLayer2) {
        parallaxLayer2.style.transform = `translate(${mouseX * 15}px, ${mouseY * 15}px)`;
    }
    
    requestAnimationFrame(updateParallax);
}

// Свечение столов (случайные мерцания)
const tableSpots = document.querySelectorAll('.table-spot');
function animateTableGlow() {
    tableSpots.forEach((spot, index) => {
        const glow = spot.querySelector('.table-glow');
        if (glow) {
            const delay = index * 0.7;
            const intensity = 0.4 + Math.sin(Date.now() / 2000 + delay) * 0.3;
            glow.style.opacity = intensity;
        }
    });
    requestAnimationFrame(() => setTimeout(animateTableGlow, 100));
}

// Навигация по столам
tableSpots.forEach(spot => {
    spot.addEventListener('click', () => {
        const game = spot.dataset.game;
        AudioEngine.click();
        navigateTo(game);
    });
});

// Подсветка столов при наведении
tableSpots.forEach(spot => {
    spot.addEventListener('mouseenter', () => {
        spot.style.filter = 'brightness(1.2)';
        spot.style.transform = 'scale(1.03)';
    });
    spot.addEventListener('mouseleave', () => {
        spot.style.filter = 'brightness(0.8)';
        spot.style.transform = 'scale(1)';
    });
});

// Анимированные фишки на полу (декоративные)
function createFloorChips() {
    const floor = document.getElementById('hall-floor');
    if (!floor) return;
    
    for (let i = 0; i < 15; i++) {
        const chip = document.createElement('div');
        chip.style.cssText = `
            position: absolute;
            bottom: ${Math.random() * 30 + 5}%;
            left: ${Math.random() * 90 + 5}%;
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
            border-radius: 50%;
            background: ${['#c9a96e', '#8b1a1a', '#2a4a8a', '#2a6a3a'][Math.floor(Math.random() * 4)]};
            opacity: ${0.15 + Math.random() * 0.2};
            box-shadow: 0 0 3px rgba(201,169,110,0.3);
        `;
        floor.appendChild(chip);
    }
}

// Частицы пыли в свете люстр
function createDustParticles() {
    const hallEl = document.getElementById('hall');
    if (!hallEl) return;
    
    for (let i = 0; i < 30; i++) {
        const dust = document.createElement('div');
        const size = 1 + Math.random() * 2;
        dust.style.cssText = `
            position: absolute;
            top: ${Math.random() * 40}%;
            left: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: #c9a96e;
            opacity: 0;
            pointer-events: none;
            animation: dust-float ${5 + Math.random() * 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 10}s;
        `;
        hallEl.appendChild(dust);
    }
    
    // Добавляем ключевые кадры для пыли
    const style = document.createElement('style');
    style.textContent = `
        @keyframes dust-float {
            0% { opacity: 0; transform: translateY(0) translateX(0); }
            20% { opacity: 0.6; }
            80% { opacity: 0.3; }
            100% { opacity: 0; transform: translateY(-100px) translateX(${Math.random() * 40 - 20}px); }
        }
    `;
    document.head.appendChild(style);
}

// Лёгкое покачивание люстр (тени на стенах)
function addChandelierShadows() {
    const layer1 = document.getElementById('parallax-layer-1');
    if (!layer1) return;
    
    const shadow = document.createElement('div');
    shadow.style.cssText = `
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 120px;
        background: radial-gradient(ellipse, #c9a96e11 0%, transparent 70%);
        border-radius: 50%;
        animation: chandelier-sway 4s ease-in-out infinite;
    `;
    layer1.appendChild(shadow);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes chandelier-sway {
            0%, 100% { transform: translateX(-50%) rotate(-1deg); }
            50% { transform: translateX(-50%) rotate(1deg); }
        }
    `;
    document.head.appendChild(style);
}

// Функция перехода в игру
function navigateTo(game) {
    // Скрываем холл
    document.getElementById('hall').classList.remove('active');
    
    // Закрываем меню если открыто
    closeMenu();
    
    // Показываем нужный экран
    const screenMap = {
        'roulette': 'screen-roulette',
        'crash': 'screen-crash',
        'slots': 'screen-slots',
        'higherlower': 'screen-higherlower',
        'wheel': 'screen-wheel',
        'shop': 'screen-shop',
        'profile': 'screen-profile',
        'settings': 'screen-settings',
        'hall': 'hall',
    };
    
    const targetId = screenMap[game];
    if (!targetId) return;
    
    // Скрываем все экраны
    document.querySelectorAll('.game-screen, .scene').forEach(s => s.classList.remove('active'));
    
    // Показываем целевой
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
    }
    
    // Запускаем игру если нужно
    if (game === 'roulette') initRoulette();
    if (game === 'crash') initCrash();
    if (game === 'slots') initSlots();
    if (game === 'higherlower') initHigherLower();
    if (game === 'wheel') initWheel();
    if (game === 'shop') initShop();
    if (game === 'profile') initProfile();
    if (game === 'settings') initSettings();
    if (game === 'hall') initHall();
}

// Кнопки «Назад» возвращают в холл
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('hall'));
});

// Инициализация холла
function initHall() {
    document.getElementById('hall').classList.add('active');
}

// Кнопка меню
document.getElementById('btn-menu').addEventListener('click', toggleMenu);
document.getElementById('menu-close').addEventListener('click', closeMenu);
document.getElementById('menu-overlay').addEventListener('click', closeMenu);

function toggleMenu() {
    AudioEngine.click();
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeMenu() {
    document.getElementById('side-menu').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('active');
}

// Навигация из меню
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const game = btn.dataset.nav;
        closeMenu();
        navigateTo(game);
    });
});

// Чат
document.getElementById('btn-chat').addEventListener('click', toggleChat);
document.getElementById('chat-close').addEventListener('click', closeChat);

function toggleChat() {
    AudioEngine.click();
    document.getElementById('chat-panel').classList.toggle('open');
}

function closeChat() {
    document.getElementById('chat-panel').classList.remove('open');
}

// Отправка сообщений в чат
document.getElementById('chat-send').addEventListener('click', sendChatMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    addChatMessage('Вы', text);
    input.value = '';
    
    // Симулируем ответ через 1-3 секунды
    setTimeout(() => {
        const demoMsg = DEMO_CHAT_MESSAGES[Math.floor(Math.random() * DEMO_CHAT_MESSAGES.length)];
        addChatMessage(demoMsg.user, demoMsg.text);
    }, 1000 + Math.random() * 2000);
}

function addChatMessage(user, text) {
    const messages = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `<span class="chat-user">${user}:</span> <span class="chat-text">${text}</span>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

// Демо-сообщения в чате каждые 5-15 секунд
function startDemoChat() {
    function addDemoMessage() {
        const msg = DEMO_CHAT_MESSAGES[Math.floor(Math.random() * DEMO_CHAT_MESSAGES.length)];
        addChatMessage(msg.user, msg.text);
        setTimeout(addDemoMessage, 5000 + Math.random() * 15000);
    }
    setTimeout(addDemoMessage, 3000);
}

// Кнопка колеса фортуны в холле
const wheelPedestal = document.getElementById('wheel-pedestal');
if (wheelPedestal) {
    wheelPedestal.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioEngine.click();
        
        // Сначала пробуем получить бесплатный бонус
        if (canClaimDailyBonus()) {
            claimDailyBonus();
            showWinToast(CONFIG.dailyBonus);
            spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 30);
            AudioEngine.bigWin();
        } else {
            navigateTo('wheel');
        }
    });
}

// Запуск
function bootHall() {
    updateParallax();
    animateTableGlow();
    createFloorChips();
    createDustParticles();
    addChandelierShadows();
    startDemoChat();
    startAmbientMusic();
    
    // Первое сообщение в чат
    setTimeout(() => {
        addChatMessage('CianGift', '🎰 Добро пожаловать в Cian Gift! Выберите игру и испытайте удачу.');
    }, 1500);
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', bootHall);
