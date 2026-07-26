/* ========== CIAN GIFT — РУЛЕТКА ========== */

// Европейская рулетка: 37 секторов (0-36)
const ROULETTE_NUMBERS = [
    { num: 0, color: 'green' },
    { num: 32, color: 'red' },
    { num: 15, color: 'black' },
    { num: 19, color: 'red' },
    { num: 4, color: 'black' },
    { num: 21, color: 'red' },
    { num: 2, color: 'black' },
    { num: 25, color: 'red' },
    { num: 17, color: 'black' },
    { num: 34, color: 'red' },
    { num: 6, color: 'black' },
    { num: 27, color: 'red' },
    { num: 13, color: 'black' },
    { num: 36, color: 'red' },
    { num: 11, color: 'black' },
    { num: 30, color: 'red' },
    { num: 8, color: 'black' },
    { num: 23, color: 'red' },
    { num: 10, color: 'black' },
    { num: 5, color: 'red' },
    { num: 24, color: 'black' },
    { num: 16, color: 'red' },
    { num: 33, color: 'black' },
    { num: 1, color: 'red' },
    { num: 20, color: 'black' },
    { num: 14, color: 'red' },
    { num: 31, color: 'black' },
    { num: 9, color: 'red' },
    { num: 22, color: 'black' },
    { num: 18, color: 'red' },
    { num: 29, color: 'black' },
    { num: 7, color: 'red' },
    { num: 28, color: 'black' },
    { num: 12, color: 'red' },
    { num: 35, color: 'black' },
    { num: 3, color: 'red' },
    { num: 26, color: 'black' },
];

// Состояние рулетки
let rouletteState = {
    isSpinning: false,
    currentBet: 100,
    betType: null, // 'red', 'black', 'green', 'even', 'odd', 'low', 'high', number
    betNumber: null,
    lastResults: [],
};

// Инициализация рулетки
function initRoulette() {
    const container = document.getElementById('roulette-container');
    if (!container || container.children.length > 0) return;
    
    container.innerHTML = `
        <div id="roulette-game">
            <!-- Колесо -->
            <div id="wheel-section">
                <div id="wheel-marker"></div>
                <canvas id="wheel-canvas" width="300" height="300"></canvas>
                <div id="last-number">—</div>
            </div>
            
            <!-- История -->
            <div id="history-bar"></div>
            
            <!-- Поле ставок -->
            <div id="bet-field">
                <button class="bet-btn red-bg" data-bet="red">🔴 Красное</button>
                <button class="bet-btn black-bg" data-bet="black">⚫ Чёрное</button>
                <button class="bet-btn green-bg" data-bet="green">🟢 Zero</button>
                <button class="bet-btn" data-bet="even">Чёт</button>
                <button class="bet-btn" data-bet="odd">Нечет</button>
                <button class="bet-btn" data-bet="low">1-18</button>
                <button class="bet-btn" data-bet="high">19-36</button>
            </div>
            
            <!-- Числовое поле -->
            <div id="number-field"></div>
            
            <!-- Управление -->
            <div id="roulette-controls">
                <div class="bet-chips" id="roulette-chips">
                    <div class="chip chip-10" data-value="10">10</div>
                    <div class="chip chip-50" data-value="50">50</div>
                    <div class="chip chip-100 selected" data-value="100">100</div>
                    <div class="chip chip-500" data-value="500">500</div>
                    <div class="chip chip-1000" data-value="1000">1K</div>
                </div>
                <button id="btn-spin" class="btn-gold">🎡 КРУТИТЬ</button>
                <div id="roulette-potential">Выигрыш: — 🪙</div>
            </div>
        </div>
    `;
    
    // Стили рулетки
    addRouletteStyles();
    
    // Рисуем колесо
    drawWheel(0);
    
    // Строим числовое поле
    buildNumberField();
    
    // Чипы выбора ставки
    document.querySelectorAll('#roulette-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#roulette-chips .chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            rouletteState.currentBet = parseInt(chip.dataset.value);
            AudioEngine.chip();
            updatePotentialWin();
        });
    });
    
    // Кнопки типа ставки
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active-bet'));
            btn.classList.add('active-bet');
            rouletteState.betType = btn.dataset.bet;
            rouletteState.betNumber = null;
            AudioEngine.click();
            updatePotentialWin();
        });
    });
    
    // Кнопка спина
    document.getElementById('btn-spin').addEventListener('click', spinRoulette);
}

// Стили рулетки
function addRouletteStyles() {
    if (document.getElementById('roulette-styles')) return;
    const style = document.createElement('style');
    style.id = 'roulette-styles';
    style.textContent = `
        #roulette-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 70px 10px 20px;
            min-height: 100%;
            gap: 15px;
        }
        #wheel-section {
            position: relative;
        }
        #wheel-canvas {
            border-radius: 50%;
            box-shadow: 0 0 40px rgba(201,169,110,0.3), 0 0 80px rgba(0,0,0,0.5);
        }
        #wheel-marker {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 18px solid #c9a96e;
            z-index: 5;
            filter: drop-shadow(0 0 5px #c9a96e);
        }
        #last-number {
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #fff;
            text-shadow: 0 0 15px rgba(255,255,255,0.6);
            z-index: 5;
        }
        #history-bar {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .history-dot {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            border: 2px solid rgba(255,255,255,0.3);
        }
        #bet-field {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .bet-btn {
            padding: 10px 16px;
            border-radius: 20px;
            border: 2px solid #444;
            background: rgba(255,255,255,0.03);
            color: #ccc;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
        }
        .bet-btn.active-bet {
            border-color: #c9a96e;
            color: #c9a96e;
            box-shadow: 0 0 15px rgba(201,169,110,0.3);
        }
        .red-bg.active-bet { background: rgba(200,30,30,0.3); border-color: #c83232; color: #faa; }
        .black-bg.active-bet { background: rgba(30,30,30,0.5); border-color: #888; color: #ddd; }
        .green-bg.active-bet { background: rgba(0,150,80,0.3); border-color: #0a6; color: #afa; }
        #number-field {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 6px;
            max-width: 300px;
        }
        .num-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #444;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            color: #fff;
        }
        .num-btn.red-num { background: #6b1a1a; border-color: #a33; }
        .num-btn.black-num { background: #1a1a1a; border-color: #555; }
        .num-btn.green-num { background: #0a4a2a; border-color: #0a6; }
        .num-btn.active-bet {
            border-color: #c9a96e !important;
            box-shadow: 0 0 15px rgba(201,169,110,0.5);
            transform: scale(1.1);
        }
        #roulette-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        #roulette-potential {
            font-size: 14px;
            color: #9a9484;
        }
        #btn-spin:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}

// Рисование колеса
function drawWheel(rotationAngle) {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 130;
    const segmentAngle = (2 * Math.PI) / 37;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Сектора
    ROULETTE_NUMBERS.forEach((item, i) => {
        const startAngle = i * segmentAngle + rotationAngle;
        const endAngle = startAngle + segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        
        if (item.color === 'red') ctx.fillStyle = '#b82020';
        else if (item.color === 'black') ctx.fillStyle = '#1a1a1a';
        else ctx.fillStyle = '#0a6a3a';
        
        ctx.fill();
        ctx.strokeStyle = '#c9a96e44';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Номер
        const textAngle = startAngle + segmentAngle / 2;
        const textX = cx + Math.cos(textAngle) * (radius * 0.7);
        const textY = cy + Math.sin(textAngle) * (radius * 0.7);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Montserrat';
        ctx.textAlign = 'center';
        ctx.fillText(item.num, 0, 0);
        ctx.restore();
    });
    
    // Обод
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Внешний обод с декором
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 15, 0, 2 * Math.PI);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Винтажные заклёпки на ободе
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * 2 * Math.PI;
        const rivetX = cx + Math.cos(angle) * (radius + 12);
        const rivetY = cy + Math.sin(angle) * (radius + 12);
        ctx.beginPath();
        ctx.arc(rivetX, rivetY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#c9a96e';
        ctx.fill();
    }
    
    // Центр
    const centerGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 25);
    centerGrad.addColorStop(0, '#c9a96e');
    centerGrad.addColorStop(1, '#8b6914');
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = '#fff3';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Построение числового поля
function buildNumberField() {
    const field = document.getElementById('number-field');
    if (!field) return;
    
    field.innerHTML = '';
    ROULETTE_NUMBERS.forEach(item => {
        const btn = document.createElement('button');
        btn.className = `num-btn ${item.color}-num`;
        btn.textContent = item.num;
        btn.dataset.number = item.num;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active-bet'));
            document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active-bet'));
            btn.classList.add('active-bet');
            rouletteState.betType = 'number';
            rouletteState.betNumber = item.num;
            AudioEngine.click();
            updatePotentialWin();
        });
        field.appendChild(btn);
    });
}

// Обновление потенциального выигрыша
function updatePotentialWin() {
    const el = document.getElementById('roulette-potential');
    if (!el || !rouletteState.betType) {
        if (el) el.textContent = 'Выигрыш: — 🪙';
        return;
    }
    
    let multiplier = 0;
    switch (rouletteState.betType) {
        case 'red': case 'black': case 'even': case 'odd': case 'low': case 'high':
            multiplier = 2;
            break;
        case 'green':
            multiplier = 36;
            break;
        case 'number':
            multiplier = 36;
            break;
    }
    
    const win = rouletteState.currentBet * multiplier;
    el.textContent = `Выигрыш: ${win.toLocaleString()} 🪙`;
}

// Запуск рулетки
function spinRoulette() {
    if (rouletteState.isSpinning) return;
    if (!rouletteState.betType) {
        showWinToast(0); // заглушка — показываем что нужна ставка
        return;
    }
    if (PlayerState.balance < rouletteState.currentBet) {
        showWinToast(0); // недостаточно средств
        return;
    }
    
    rouletteState.isSpinning = true;
    const btn = document.getElementById('btn-spin');
    btn.disabled = true;
    btn.textContent = '🎡 ВРАЩАЕТСЯ...';
    
    // Списываем ставку
    updateBalance(-rouletteState.currentBet);
    
    // Генерируем результат
    const resultIndex = Math.floor(Math.random() * 37);
    const result = ROULETTE_NUMBERS[resultIndex];
    
    // Угол поворота для выпадения нужного числа
    const segmentAngle = (2 * Math.PI) / 37;
    const targetAngle = -(resultIndex * segmentAngle);
    const fullSpins = 5 * 2 * Math.PI; // 5 полных оборотов
    const finalAngle = fullSpins + targetAngle;
    
    // Анимация вращения
    let startTime = null;
    const spinDuration = 4000; // 4 секунды
    
    AudioEngine.spin();
    
    function animateSpin(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing: быстрое начало, плавное замедление
        const eased = 1 - Math.pow(1 - progress, 4);
        const currentAngle = finalAngle * eased;
        
        drawWheel(currentAngle);
        
        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            // Конец вращения
            onSpinComplete(result);
        }
    }
    
    requestAnimationFrame(animateSpin);
}

// Завершение спина
function onSpinComplete(result) {
    rouletteState.isSpinning = false;
    const btn = document.getElementById('btn-spin');
    btn.disabled = false;
    btn.textContent = '🎡 КРУТИТЬ';
    
    // Показываем результат
    document.getElementById('last-number').textContent = result.num;
    document.getElementById('last-number').style.color = 
        result.color === 'red' ? '#e04040' : 
        result.color === 'black' ? '#ddd' : '#0a6';
    
    // Добавляем в историю
    addHistoryDot(result);
    
    // Определяем выигрыш
    let win = false;
    let multiplier = 0;
    
    const betType = rouletteState.betType;
    const betNumber = rouletteState.betNumber;
    
    switch (betType) {
        case 'red':
            win = result.color === 'red';
            multiplier = 2;
            break;
        case 'black':
            win = result.color === 'black';
            multiplier = 2;
            break;
        case 'green':
            win = result.num === 0;
            multiplier = 36;
            break;
        case 'even':
            win = result.num !== 0 && result.num % 2 === 0;
            multiplier = 2;
            break;
        case 'odd':
            win = result.num !== 0 && result.num % 2 === 1;
            multiplier = 2;
            break;
        case 'low':
            win = result.num >= 1 && result.num <= 18;
            multiplier = 2;
            break;
        case 'high':
            win = result.num >= 19 && result.num <= 36;
            multiplier = 2;
            break;
        case 'number':
            win = result.num === betNumber;
            multiplier = 36;
            break;
    }
    
    if (win) {
        const winAmount = rouletteState.currentBet * multiplier;
        updateBalance(winAmount);
        showWinToast(winAmount);
        AudioEngine.win();
        
        const wheelEl = document.getElementById('wheel-section');
        if (wheelEl) {
            const rect = wheelEl.getBoundingClientRect();
            spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
        }
    } else {
        showWinToast(-rouletteState.currentBet);
        AudioEngine.lose();
    }
    
    updatePotentialWin();
}

// Добавление точки в историю
function addHistoryDot(result) {
    const bar = document.getElementById('history-bar');
    if (!bar) return;
    
    const dot = document.createElement('div');
    dot.className = 'history-dot';
    dot.textContent = result.num;
    dot.style.background = result.color === 'red' ? '#8b1a1a' : 
                           result.color === 'black' ? '#1a1a1a' : '#0a6a3a';
    
    bar.prepend(dot);
    
    // Ограничиваем историю 20 элементами
    if (bar.children.length > 20) {
        bar.removeChild(bar.lastChild);
    }
    
    rouletteState.lastResults.unshift(result);
    if (rouletteState.lastResults.length > 20) {
        rouletteState.lastResults.pop();
    }
          }
