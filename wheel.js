/* ========== CIAN GIFT — КОЛЕСО ФОРТУНЫ ========== */

// Сектора колеса
const WHEEL_SEGMENTS = [
    { label: '10', value: 10, color: '#8b1a1a', weight: 25 },
    { label: '25', value: 25, color: '#2a4a8a', weight: 20 },
    { label: '50', value: 50, color: '#2a6a3a', weight: 18 },
    { label: '100', value: 100, color: '#5a4a0a', weight: 15 },
    { label: '250', value: 250, color: '#8b6914', weight: 10 },
    { label: '500', value: 500, color: '#3a1a3a', weight: 7 },
    { label: '1000', value: 1000, color: '#0d5c3b', weight: 3 },
    { label: '💎', value: 5000, color: '#1a1a1a', weight: 1, isJackpot: true },
    { label: '0', value: 0, color: '#333333', weight: 1 },
];

// Состояние
let wheelState = {
    isSpinning: false,
    canSpinFree: false,
    paidSpinsLeft: 0,
    spinCost: 100,
    lastResult: null,
};

// Инициализация
function initWheel() {
    const container = document.getElementById('wheel-container');
    if (!container || container.children.length > 0) return;
    
    wheelState.canSpinFree = canClaimDailyBonus();
    
    container.innerHTML = `
        <div id="wheel-game">
            <!-- Декоративная арка -->
            <div id="wheel-arch">
                <div id="wheel-arch-text">Колесо Фортуны</div>
            </div>
            
            <!-- Колесо -->
            <div id="wheel-wrapper">
                <div id="wheel-pointer"></div>
                <canvas id="wheel-canvas" width="320" height="320"></canvas>
                <div id="wheel-center">
                    <div id="wheel-center-text">🎰</div>
                </div>
            </div>
            
            <!-- Результат -->
            <div id="wheel-result"></div>
            
            <!-- Управление -->
            <div id="wheel-controls">
                <button id="wheel-spin-free" class="btn-gold" ${!wheelState.canSpinFree ? 'disabled' : ''}>
                    🎁 БЕСПЛАТНО
                </button>
                <button id="wheel-spin-paid" class="btn-gold">
                    🎡 КРУТИТЬ (100 🪙)
                </button>
                <div id="wheel-info">
                    ${wheelState.canSpinFree ? '🟢 Доступно бесплатное вращение!' : 'Следующий бесплатный бонус через 24 часа'}
                </div>
            </div>
            
            <!-- История -->
            <div id="wheel-history-title">История выигрышей</div>
            <div id="wheel-history"></div>
        </div>
    `;
    
    addWheelStyles();
    drawWheelCanvas(0);
    
    // Кнопки
    document.getElementById('wheel-spin-free').addEventListener('click', () => spinWheel('free'));
    document.getElementById('wheel-spin-paid').addEventListener('click', () => spinWheel('paid'));
}

// Стили
function addWheelStyles() {
    if (document.getElementById('wheel-styles')) return;
    const style = document.createElement('style');
    style.id = 'wheel-styles';
    style.textContent = `
        #wheel-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 70px 10px 20px;
            min-height: 100%;
            gap: 12px;
        }
        #wheel-arch {
            text-align: center;
            margin-bottom: 5px;
        }
        #wheel-arch-text {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #c9a96e;
            text-shadow: 0 0 20px rgba(201,169,110,0.4);
            letter-spacing: 2px;
        }
        #wheel-wrapper {
            position: relative;
            width: 320px;
            height: 320px;
        }
        #wheel-canvas {
            border-radius: 50%;
            box-shadow: 
                0 0 40px rgba(201,169,110,0.3),
                0 0 80px rgba(0,0,0,0.6),
                0 0 0 8px #2a1f0a,
                0 0 0 12px #8b6914,
                0 0 0 14px #3a2a0a;
        }
        #wheel-pointer {
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 5;
            width: 0;
            height: 0;
            border-left: 14px solid transparent;
            border-right: 14px solid transparent;
            border-top: 28px solid #c9a96e;
            filter: drop-shadow(0 0 6px #c9a96e) drop-shadow(0 3px 3px rgba(0,0,0,0.5));
        }
        #wheel-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: radial-gradient(circle, #c9a96e 0%, #8b6914 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(201,169,110,0.5);
            z-index: 3;
            cursor: pointer;
        }
        #wheel-center:active {
            transform: translate(-50%, -50%) scale(0.9);
        }
        #wheel-center-text {
            font-size: 24px;
        }
        #wheel-result {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            min-height: 30px;
            color: #c9a96e;
            text-align: center;
        }
        #wheel-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        #wheel-controls .btn-gold {
            width: 220px;
            padding: 12px;
        }
        #wheel-spin-free:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        #wheel-info {
            font-size: 11px;
            color: #9a9484;
            text-align: center;
        }
        #wheel-history-title {
            font-size: 13px;
            color: #9a9484;
            margin-top: 10px;
        }
        #wheel-history {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 300px;
        }
        .wheel-history-item {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .wheel-history-item.jackpot {
            background: #0d5c3b;
            border-color: #c9a96e;
            color: #ffd700;
            animation: jackpot-glow 1s ease-in-out infinite;
        }
        @keyframes jackpot-glow {
            0%, 100% { box-shadow: 0 0 5px #c9a96e; }
            50% { box-shadow: 0 0 20px #ffd700; }
        }
    `;
    document.head.appendChild(style);
}

// Рисование колеса
function drawWheelCanvas(rotationAngle) {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 148;
    
    // Сумма весов для расчёта углов
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Сектора
    let currentAngle = rotationAngle;
    
    WHEEL_SEGMENTS.forEach((segment) => {
        const sliceAngle = (segment.weight / totalWeight) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        
        // Заливка
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, currentAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        
        // Граница сектора
        ctx.strokeStyle = '#c9a96e33';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Текст
        const textAngle = currentAngle + sliceAngle / 2;
        const textRadius = radius * 0.65;
        const textX = cx + Math.cos(textAngle) * textRadius;
        const textY = cy + Math.sin(textAngle) * textRadius;
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = segment.isJackpot ? 'bold 16px Montserrat' : 'bold 13px Montserrat';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(segment.label, 0, 0);
        ctx.restore();
        
        // Лампочки на ободе
        const bulbCount = Math.floor((sliceAngle / (2 * Math.PI)) * 48);
        for (let i = 0; i < bulbCount; i++) {
            const bulbAngle = currentAngle + (i / bulbCount) * sliceAngle;
            const bulbX = cx + Math.cos(bulbAngle) * (radius + 6);
            const bulbY = cy + Math.sin(bulbAngle) * (radius + 6);
            
            ctx.beginPath();
            ctx.arc(bulbX, bulbY, 3, 0, Math.PI * 2);
            ctx.fillStyle = (Math.floor(Date.now() / 300 + i) % 2 === 0) ? '#ffeebb' : '#887744';
            ctx.fill();
        }
        
        currentAngle = endAngle;
    });
    
    // Внутренний обод
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.3, 0, 2 * Math.PI);
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Вращение колеса
function spinWheel(type) {
    if (wheelState.isSpinning) return;
    
    if (type === 'free') {
        if (!wheelState.canSpinFree) return;
        wheelState.canSpinFree = false;
        document.getElementById('wheel-spin-free').disabled = true;
    } else {
        if (PlayerState.balance < wheelState.spinCost) {
            showWinToast(0);
            return;
        }
        updateBalance(-wheelState.spinCost);
    }
    
    wheelState.isSpinning = true;
    document.getElementById('wheel-spin-free').disabled = true;
    document.getElementById('wheel-spin-paid').disabled = true;
    document.getElementById('wheel-result').textContent = 'Вращается...';
    
    // Выбор результата (с учётом весов)
    const result = selectWeightedSegment();
    wheelState.lastResult = result;
    
    // Расчёт угла
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let segmentStartAngle = 0;
    let resultAngle = 0;
    
    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
        if (WHEEL_SEGMENTS[i] === result) {
            resultAngle = segmentStartAngle + (result.weight / totalWeight) * Math.PI;
            break;
        }
        segmentStartAngle += (WHEEL_SEGMENTS[i].weight / totalWeight) * 2 * Math.PI;
    }
    
    // Целевой угол (указатель сверху, так что нужный сектор должен быть напротив указателя)
    const targetAngle = 2 * Math.PI - resultAngle + Math.PI;
    const fullSpins = 6 * 2 * Math.PI;
    const finalAngle = fullSpins + targetAngle;
    
    AudioEngine.spin();
    
    // Анимация
    let startTime = null;
    const spinDuration = 5000;
    
    function animateWheelSpin(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Замедление в конце
        const eased = 1 - Math.pow(1 - progress, 4);
        const currentAngle = finalAngle * eased;
        
        drawWheelCanvas(currentAngle);
        
        if (progress < 1) {
            requestAnimationFrame(animateWheelSpin);
        } else {
            onWheelStop(result);
        }
    }
    
    requestAnimationFrame(animateWheelSpin);
}

// Выбор сегмента по весу
function selectWeightedSegment() {
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const segment of WHEEL_SEGMENTS) {
        random -= segment.weight;
        if (random <= 0) return segment;
    }
    
    return WHEEL_SEGMENTS[0];
}

// Колесо остановилось
function onWheelStop(result) {
    wheelState.isSpinning = false;
    document.getElementById('wheel-spin-paid').disabled = false;
    
    // Обновление бесплатного вращения
    wheelState.canSpinFree = canClaimDailyBonus();
    document.getElementById('wheel-spin-free').disabled = !wheelState.canSpinFree;
    document.getElementById('wheel-info').textContent = wheelState.canSpinFree ? 
        '🟢 Доступно бесплатное вращение!' : 
        'Следующий бесплатный бонус через 24 часа';
    
    // Результат
    const resultEl = document.getElementById('wheel-result');
    if (result.value > 0) {
        resultEl.textContent = `🎉 +${result.value.toLocaleString()} 🪙`;
        resultEl.style.color = '#ffd700';
        
        updateBalance(result.value);
        showWinToast(result.value);
        
        if (result.isJackpot) {
            AudioEngine.bigWin();
            const wrapper = document.getElementById('wheel-wrapper');
            if (wrapper) {
                const rect = wrapper.getBoundingClientRect();
                spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
            }
        } else {
            AudioEngine.win();
        }
        
        // Частицы
        const wrapper = document.getElementById('wheel-wrapper');
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
        }
    } else {
        resultEl.textContent = '😔 0 — повезёт в следующий раз';
        resultEl.style.color = '#9a9484';
        AudioEngine.lose();
    }
    
    // Сохраняем факт использования бонуса
    if (!canClaimDailyBonus() && wheelState.canSpinFree === false) {
        wheelState.lastResult = result;
    }
    
    // Добавляем в историю
    addWheelHistory(result);
}

// Добавление в историю
function addWheelHistory(result) {
    const container = document.getElementById('wheel-history');
    if (!container) return;
    
    const item = document.createElement('span');
    item.className = 'wheel-history-item';
    if (result.isJackpot) item.classList.add('jackpot');
    item.textContent = result.value > 0 ? `+${result.value}` : '0';
    
    container.prepend(item);
    
    if (container.children.length > 15) {
        container.removeChild(container.lastChild);
    }
}

// Клик по центру колеса тоже запускает
document.addEventListener('click', (e) => {
    if (e.target.closest('#wheel-center') && !wheelState.isSpinning) {
        if (wheelState.canSpinFree) {
            spinWheel('free');
        } else {
            spinWheel('paid');
        }
    }
});

// Анимация лампочек (обновление каждые 300мс)
setInterval(() => {
    if (document.getElementById('wheel-canvas') && !wheelState.isSpinning) {
        drawWheelCanvas(0);
    }
}, 300);
