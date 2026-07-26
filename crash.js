/* ========== CIAN GIFT — КРАШ-ИГРА ========== */

// Состояние краш-игры
let crashState = {
    isRunning: false,
    isBetting: false,
    currentMultiplier: 1.00,
    crashPoint: 1.00,
    betAmount: 100,
    autoCashout: 2.00,
    hasCashedOut: false,
    history: [],
    gameStartTime: null,
};

// Инициализация краш-игры
function initCrash() {
    const container = document.getElementById('crash-container');
    if (!container || container.children.length > 0) return;
    
    container.innerHTML = `
        <div id="crash-game">
            <!-- График -->
            <div id="crash-graph-container">
                <canvas id="crash-canvas"></canvas>
                <div id="crash-multiplier">1.00×</div>
                <div id="crash-status">Ожидание ставок...</div>
            </div>
            
            <!-- История раундов -->
            <div id="crash-history"></div>
            
            <!-- Панель ставок -->
            <div id="crash-bet-panel">
                <div id="crash-bet-section">
                    <label>Сумма ставки</label>
                    <div class="bet-chips" id="crash-chips">
                        <div class="chip chip-10" data-value="10">10</div>
                        <div class="chip chip-50" data-value="50">50</div>
                        <div class="chip chip-100 selected" data-value="100">100</div>
                        <div class="chip chip-500" data-value="500">500</div>
                        <div class="chip chip-1000" data-value="1000">1K</div>
                    </div>
                    <input type="number" id="crash-bet-input" value="100" min="10" max="5000" step="10">
                </div>
                
                <div id="crash-auto-section">
                    <label>Автовывод на</label>
                    <div id="crash-auto-chips">
                        <div class="auto-chip" data-value="1.5">×1.5</div>
                        <div class="auto-chip selected" data-value="2.0">×2.0</div>
                        <div class="auto-chip" data-value="3.0">×3.0</div>
                        <div class="auto-chip" data-value="5.0">×5.0</div>
                        <div class="auto-chip" data-value="10.0">×10</div>
                    </div>
                </div>
                
                <button id="crash-place-bet" class="btn-gold">🚀 СТАВКА</button>
                <button id="crash-cashout" class="btn-gold" style="display:none; background: #8b1a1a;">💨 ВЫВОД</button>
            </div>
        </div>
    `;
    
    addCrashStyles();
    
    // Чипы ставки
    document.querySelectorAll('#crash-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#crash-chips .chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            crashState.betAmount = parseInt(chip.dataset.value);
            document.getElementById('crash-bet-input').value = crashState.betAmount;
            AudioEngine.chip();
        });
    });
    
    // Ручной ввод ставки
    const betInput = document.getElementById('crash-bet-input');
    betInput.addEventListener('input', () => {
        crashState.betAmount = Math.min(Math.max(parseInt(betInput.value) || 10, 10), 5000);
        document.querySelectorAll('#crash-chips .chip').forEach(c => c.classList.remove('selected'));
    });
    
    // Автовывод
    document.querySelectorAll('.auto-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.auto-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            crashState.autoCashout = parseFloat(chip.dataset.value);
            AudioEngine.click();
        });
    });
    
    // Кнопка ставки
    document.getElementById('crash-place-bet').addEventListener('click', placeCrashBet);
    
    // Кнопка вывода
    document.getElementById('crash-cashout').addEventListener('click', cashoutCrash);
    
    // Запускаем первый раунд
    setTimeout(startCrashRound, 2000);
}

// Стили краша
function addCrashStyles() {
    if (document.getElementById('crash-styles')) return;
    const style = document.createElement('style');
    style.id = 'crash-styles';
    style.textContent = `
        #crash-game {
            display: flex;
            flex-direction: column;
            padding: 70px 10px 20px;
            min-height: 100%;
            gap: 12px;
        }
        #crash-graph-container {
            position: relative;
            width: 100%;
            height: 250px;
            background: #0a0f0c;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #c9a96e33;
        }
        #crash-canvas {
            width: 100%;
            height: 100%;
        }
        #crash-multiplier {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 700;
            color: #fff;
            text-shadow: 0 0 30px rgba(255,255,255,0.5);
            transition: color 0.1s;
            pointer-events: none;
        }
        #crash-status {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #9a9484;
            pointer-events: none;
        }
        #crash-history {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        .crash-history-item {
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            color: #fff;
        }
        .crash-history-item.low { background: #8b1a1a; }
        .crash-history-item.mid { background: #8b6914; }
        .crash-history-item.high { background: #0d5c3b; }
        #crash-bet-panel {
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            padding: 15px;
            border: 1px solid #c9a96e22;
        }
        #crash-bet-section, #crash-auto-section {
            margin-bottom: 10px;
        }
        #crash-bet-section label, #crash-auto-section label {
            font-size: 12px;
            color: #9a9484;
            display: block;
            margin-bottom: 6px;
        }
        #crash-bet-input {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid #c9a96e33;
            color: #fff;
            padding: 8px;
            border-radius: 8px;
            font-size: 16px;
            text-align: center;
            margin-top: 8px;
        }
        #crash-auto-chips {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .auto-chip {
            padding: 6px 12px;
            border-radius: 15px;
            border: 1px solid #444;
            color: #999;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .auto-chip.selected {
            border-color: #c9a96e;
            color: #c9a96e;
            background: rgba(201,169,110,0.1);
        }
        #crash-place-bet, #crash-cashout {
            width: 100%;
            padding: 14px;
            font-size: 16px;
            margin-top: 8px;
        }
    `;
    document.head.appendChild(style);
}

// Рисование графика краша
function drawCrashGraph() {
    const canvas = document.getElementById('crash-canvas');
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 20, right: 40, bottom: 30, left: 50 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    
    ctx.clearRect(0, 0, w, h);
    
    // Сетка
    ctx.strokeStyle = '#ffffff08';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = pad.top + (plotH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff22';
        ctx.font = '10px Montserrat';
        ctx.textAlign = 'right';
        ctx.fillText((5 - i).toFixed(0) + '×', pad.left - 8, y + 3);
    }
    
    // Если игра не идёт — просто оси
    if (!crashState.isRunning && !crashState.isBetting) {
        return;
    }
    
    // Кривая роста
    const elapsed = (Date.now() - crashState.gameStartTime) / 1000;
    const multiplier = crashState.isRunning ? 
        Math.pow(Math.E, 0.08 * elapsed) : 
        crashState.currentMultiplier;
    
    // Точки для графика
    ctx.beginPath();
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#c9a96e';
    ctx.shadowBlur = 8;
    
    const totalPoints = 200;
    let firstPoint = true;
    
    for (let i = 0; i < totalPoints; i++) {
        const t = (i / totalPoints) * Math.min(elapsed, 10);
        const m = Math.pow(Math.E, 0.08 * t);
        
        const x = pad.left + (t / 10) * plotW;
        const y = pad.top + plotH - (m / 5) * plotH;
        
        if (y < pad.top) break;
        
        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Текущая точка
    const currentX = pad.left + (Math.min(elapsed, 10) / 10) * plotW;
    const currentY = pad.top + plotH - (multiplier / 5) * plotH;
    
    if (currentY >= pad.top) {
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#c9a96e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Свечение
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,169,110,0.2)';
        ctx.fill();
    }
}

// Начало раунда
function startCrashRound() {
    if (crashState.isRunning) return;
    
    // Генерируем точку краша
    // Используем распределение: большинство крашей до ×3, редкие выше
    const r = Math.random();
    let crashPoint;
    if (r < 0.40) crashPoint = 1 + Math.random() * 0.5;      // 40%: 1×–1.5×
    else if (r < 0.70) crashPoint = 1.5 + Math.random() * 1;  // 30%: 1.5×–2.5×
    else if (r < 0.88) crashPoint = 2.5 + Math.random() * 3;  // 18%: 2.5×–5.5×
    else if (r < 0.96) crashPoint = 5.5 + Math.random() * 5;  // 8%: 5.5×–10.5×
    else crashPoint = 10.5 + Math.random() * 15;               // 4%: 10.5×–25.5×
    
    crashPoint = Math.round(crashPoint * 100) / 100;
    
    crashState.crashPoint = crashPoint;
    crashState.isBetting = true;
    crashState.isRunning = false;
    crashState.hasCashedOut = false;
    crashState.currentMultiplier = 1.00;
    
    document.getElementById('crash-multiplier').textContent = '1.00×';
    document.getElementById('crash-multiplier').style.color = '#fff';
    document.getElementById('crash-status').textContent = 'Делайте ставки!';
    document.getElementById('crash-place-bet').style.display = 'block';
    document.getElementById('crash-cashout').style.display = 'none';
    document.getElementById('crash-place-bet').disabled = false;
    document.getElementById('crash-place-bet').textContent = '🚀 СТАВКА';
    
    // Таймер до начала (5 секунд)
    let countdown = 5;
    const statusEl = document.getElementById('crash-status');
    const countdownInterval = setInterval(() => {
        if (!crashState.isBetting) {
            clearInterval(countdownInterval);
            return;
        }
        countdown--;
        if (countdown > 0) {
            statusEl.textContent = `Старт через ${countdown}...`;
        } else {
            clearInterval(countdownInterval);
            if (crashState.isBetting) {
                beginCrashFlight();
            }
        }
    }, 1000);
}

// Начало полёта
function beginCrashFlight() {
    if (!crashState.isBetting && !crashState.isRunning) return;
    
    crashState.isBetting = false;
    crashState.isRunning = true;
    crashState.gameStartTime = Date.now();
    crashState.hasCashedOut = false;
    
    document.getElementById('crash-place-bet').style.display = 'none';
    document.getElementById('crash-cashout').style.display = 'block';
    document.getElementById('crash-cashout').disabled = false;
    document.getElementById('crash-cashout').textContent = '💨 ВЫВОД';
    document.getElementById('crash-status').textContent = 'Взлетаем!';
    
    AudioEngine.spin();
    
    // Игровой цикл
    function gameLoop() {
        if (!crashState.isRunning) return;
        
        const elapsed = (Date.now() - crashState.gameStartTime) / 1000;
        crashState.currentMultiplier = Math.pow(Math.E, 0.08 * elapsed);
        crashState.currentMultiplier = Math.round(crashState.currentMultiplier * 100) / 100;
        
        // Обновление множителя на экране
        document.getElementById('crash-multiplier').textContent = crashState.currentMultiplier.toFixed(2) + '×';
        
        // Цвет множителя
        if (crashState.currentMultiplier < 2) {
            document.getElementById('crash-multiplier').style.color = '#fff';
        } else if (crashState.currentMultiplier < 5) {
            document.getElementById('crash-multiplier').style.color = '#ffd700';
        } else {
            document.getElementById('crash-multiplier').style.color = '#ff4444';
        }
        
        // Проверка автовывода
        if (!crashState.hasCashedOut && crashState.currentMultiplier >= crashState.autoCashout) {
            cashoutCrash();
        }
        
        // Проверка краша
        if (crashState.currentMultiplier >= crashState.crashPoint) {
            crashRocket();
            return;
        }
        
        drawCrashGraph();
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
}

// Крах ракеты
function crashRocket() {
    crashState.isRunning = false;
    
    document.getElementById('crash-multiplier').textContent = crashState.crashPoint.toFixed(2) + '×';
    document.getElementById('crash-multiplier').style.color = '#ff2222';
    document.getElementById('crash-status').textContent = 'КРАХ!';
    document.getElementById('crash-cashout').disabled = true;
    document.getElementById('crash-cashout').textContent = '💥 КРАХ';
    
    AudioEngine.lose();
    
    // Эффект тряски
    const graphContainer = document.getElementById('crash-graph-container');
    graphContainer.style.animation = 'shake 0.5s ease';
    setTimeout(() => graphContainer.style.animation = '', 500);
    
    // Добавляем в историю
    addCrashHistory(crashState.crashPoint);
    
    // Сброс ставки
    if (!crashState.hasCashedOut && crashState.isBetting === false) {
        // Игрок поставил но не вывел
    }
    
    // Новый раунд через 3 секунды
    setTimeout(() => {
        crashState.isBetting = true;
        startCrashRound();
    }, 3000);
}

// Вывод денег
function cashoutCrash() {
    if (!crashState.isRunning || crashState.hasCashedOut) return;
    
    crashState.hasCashedOut = true;
    
    const winAmount = Math.floor(crashState.betAmount * crashState.currentMultiplier);
    updateBalance(winAmount - crashState.betAmount); // возвращаем ставку + выигрыш
    
    showWinToast(winAmount);
    AudioEngine.win();
    
    document.getElementById('crash-cashout').disabled = true;
    document.getElementById('crash-cashout').textContent = `✅ ${crashState.currentMultiplier.toFixed(2)}×`;
    document.getElementById('crash-status').textContent = `Выведено: ${winAmount.toLocaleString()} 🪙`;
    
    // Частицы
    const btn = document.getElementById('crash-cashout');
    const rect = btn.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top, 25);
}

// Размещение ставки
function placeCrashBet() {
    if (!crashState.isBetting) return;
    if (PlayerState.balance < crashState.betAmount) {
        showWinToast(0);
        return;
    }
    
    updateBalance(-crashState.betAmount);
    crashState.hasCashedOut = false;
    
    document.getElementById('crash-place-bet').textContent = '✅ СТАВКА ПРИНЯТА';
    document.getElementById('crash-place-bet').disabled = true;
    
    AudioEngine.chip();
}

// Добавление в историю
function addCrashHistory(point) {
    crashState.history.unshift(point);
    if (crashState.history.length > 20) crashState.history.pop();
    
    const container = document.getElementById('crash-history');
    if (!container) return;
    
    const item = document.createElement('span');
    item.className = 'crash-history-item';
    item.textContent = point.toFixed(2) + '×';
    
    if (point < 1.5) item.classList.add('low');
    else if (point < 5) item.classList.add('mid');
    else item.classList.add('high');
    
    container.prepend(item);
    
    if (container.children.length > 20) {
        container.removeChild(container.lastChild);
    }
}

// Обновление графика (вызывается из основного цикла)
setInterval(() => {
    if (crashState.isRunning) {
        drawCrashGraph();
    }
}, 50);

// Добавляем анимацию тряски
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);
