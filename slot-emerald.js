/* ========== CIAN GIFT — СЛОТ «ИЗУМРУДНЫЙ ЗАЛ» ========== */

// Конфигурация слота
const SLOT_CONFIG = {
    reels: 5,
    rows: 3,
    symbols: SLOT_SYMBOLS,
    paylines: [
        [0,0,0,0,0], // центр
        [1,1,1,1,1], // верх
        [2,2,2,2,2], // низ
        [0,1,2,1,0], // V-образная
        [2,1,0,1,2], // перевёрнутая V
        [0,0,1,2,2], // диагональ вниз
        [2,2,1,0,0], // диагональ вверх
        [1,0,0,0,1], // внешние верхние
        [1,2,2,2,1], // внешние нижние
    ],
};

// Состояние слота
let slotState = {
    isSpinning: false,
    betAmount: 100,
    reels: [], // текущие символы на каждом барабане
    reelElements: [],
    freeSpins: 0,
    bonusActive: false,
};

// Инициализация слота
function initSlots() {
    const container = document.getElementById('slots-container');
    if (!container || container.children.length > 0) return;
    
    container.innerHTML = `
        <div id="slot-game">
            <!-- Заголовок -->
            <div id="slot-title">Изумрудный зал</div>
            
            <!-- Барабаны -->
            <div id="slot-machine">
                <div id="slot-frame">
                    <div id="slot-reels">
                        <div class="reel" id="reel-0"></div>
                        <div class="reel" id="reel-1"></div>
                        <div class="reel" id="reel-2"></div>
                        <div class="reel" id="reel-3"></div>
                        <div class="reel" id="reel-4"></div>
                    </div>
                    <!-- Подсветка линий -->
                    <div id="payline-overlay"></div>
                </div>
            </div>
            
            <!-- Информация -->
            <div id="slot-info">
                <span id="slot-freespins"></span>
                <span id="slot-lastwin"></span>
            </div>
            
            <!-- Управление -->
            <div id="slot-controls">
                <div class="bet-chips" id="slot-chips">
                    <div class="chip chip-10" data-value="10">10</div>
                    <div class="chip chip-50" data-value="50">50</div>
                    <div class="chip chip-100 selected" data-value="100">100</div>
                    <div class="chip chip-500" data-value="500">500</div>
                    <div class="chip chip-1000" data-value="1000">1K</div>
                </div>
                <button id="btn-spin-slot" class="btn-gold">🎰 КРУТИТЬ</button>
            </div>
            
            <!-- Таблица выплат -->
            <div id="paytable">
                <div id="paytable-toggle">📋 Таблица выплат</div>
                <div id="paytable-content" style="display:none;"></div>
            </div>
        </div>
    `;
    
    addSlotStyles();
    buildPaytable();
    initSlotReels();
    
    // Чипы
    document.querySelectorAll('#slot-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#slot-chips .chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            slotState.betAmount = parseInt(chip.dataset.value);
            AudioEngine.chip();
        });
    });
    
    // Кнопка спина
    document.getElementById('btn-spin-slot').addEventListener('click', spinSlots);
    
    // Таблица выплат
    document.getElementById('paytable-toggle').addEventListener('click', () => {
        const content = document.getElementById('paytable-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
}

// Стили слота
function addSlotStyles() {
    if (document.getElementById('slot-styles')) return;
    const style = document.createElement('style');
    style.id = 'slot-styles';
    style.textContent = `
        #slot-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 70px 10px 20px;
            min-height: 100%;
            gap: 12px;
        }
        #slot-title {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            color: #0d5c3b;
            text-shadow: 0 0 15px rgba(13,92,59,0.5);
            letter-spacing: 2px;
        }
        #slot-machine {
            position: relative;
            width: 100%;
            max-width: 340px;
        }
        #slot-frame {
            background: linear-gradient(180deg, #1a1005 0%, #2a1f0a 50%, #1a1005 100%);
            border: 4px solid #8b6914;
            border-radius: 16px;
            padding: 12px;
            box-shadow: 
                0 0 30px rgba(201,169,110,0.2),
                inset 0 0 60px rgba(0,0,0,0.5);
            position: relative;
        }
        /* Декоративные винты на рамке */
        #slot-frame::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid #5a3a0a;
            border-radius: 18px;
            pointer-events: none;
        }
        #slot-reels {
            display: flex;
            gap: 6px;
            justify-content: center;
            background: #050505;
            border-radius: 8px;
            padding: 8px;
            position: relative;
            overflow: hidden;
        }
        .reel {
            width: 58px;
            height: 174px;
            background: #0a0a0a;
            border-radius: 6px;
            overflow: hidden;
            position: relative;
            border: 1px solid #1a1a1a;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
        }
        .reel-strip {
            position: absolute;
            width: 100%;
            transition: transform 0.1s ease;
        }
        .reel-symbol {
            width: 100%;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            background: #0a0a0a;
            border-bottom: 1px solid #111;
        }
        .reel-symbol.highlight {
            background: rgba(201,169,110,0.15);
            box-shadow: inset 0 0 15px rgba(201,169,110,0.2);
        }
        .reel-symbol.wild-symbol {
            background: rgba(255,215,0,0.1);
        }
        #payline-overlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }
        #slot-info {
            display: flex;
            gap: 20px;
            font-size: 13px;
            color: #9a9484;
        }
        #slot-lastwin {
            color: #c9a96e;
        }
        #slot-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        #btn-spin-slot:disabled {
            opacity: 0.5;
        }
        #paytable {
            width: 100%;
            max-width: 340px;
        }
        #paytable-toggle {
            text-align: center;
            color: #9a9484;
            font-size: 13px;
            cursor: pointer;
            padding: 8px;
            border-top: 1px solid #ffffff08;
        }
        #paytable-content {
            padding: 10px;
            font-size: 12px;
        }
        .paytable-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
            border-bottom: 1px solid #ffffff05;
        }
        .paytable-symbol {
            font-size: 20px;
            width: 30px;
        }
        .paytable-values {
            color: #9a9484;
        }
        /* Мигание при фриспинах */
        #slot-freespins.active {
            color: #ffd700;
            animation: blink 0.5s infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

// Построение таблицы выплат
function buildPaytable() {
    const content = document.getElementById('paytable-content');
    if (!content) return;
    
    content.innerHTML = SLOT_CONFIG.symbols
        .filter(s => !s.isBonus && !s.isWild)
        .map(s => `
            <div class="paytable-row">
                <span class="paytable-symbol">${s.emoji}</span>
                <span>${s.name}</span>
                <span class="paytable-values">
                    ×3: ${s.value[2]} ×4: ${s.value[3]} ×5: ${s.value[4]}
                </span>
            </div>
        `).join('') + `
        <div class="paytable-row">
            <span class="paytable-symbol">🌟</span>
            <span>Wild</span>
            <span class="paytable-values">Заменяет всё кроме бонуса</span>
        </div>
        <div class="paytable-row">
            <span class="paytable-symbol">🎁</span>
            <span>Бонус</span>
            <span class="paytable-values">3+ = фриспины</span>
        </div>
    `;
}

// Инициализация барабанов
function initSlotReels() {
    slotState.reels = [];
    slotState.reelElements = [];
    
    for (let r = 0; r < SLOT_CONFIG.reels; r++) {
        // Случайный набор символов для барабана (20 символов для прокрутки)
        const strip = [];
        for (let i = 0; i < 20; i++) {
            const symbol = SLOT_CONFIG.symbols[Math.floor(Math.random() * SLOT_CONFIG.symbols.length)];
            strip.push(symbol);
        }
        slotState.reels.push(strip);
        
        // Создаём DOM-элемент
        const reelEl = document.getElementById(`reel-${r}`);
        if (!reelEl) continue;
        
        const stripEl = document.createElement('div');
        stripEl.className = 'reel-strip';
        
        strip.forEach(symbol => {
            const symbolEl = document.createElement('div');
            symbolEl.className = 'reel-symbol';
            if (symbol.isWild) symbolEl.classList.add('wild-symbol');
            symbolEl.textContent = symbol.emoji;
            stripEl.appendChild(symbolEl);
        });
        
        reelEl.appendChild(stripEl);
        slotState.reelElements.push({
            element: stripEl,
            position: 0,
            targetPosition: 0,
        });
    }
}

// Спин слотов
function spinSlots() {
    if (slotState.isSpinning) return;
    if (PlayerState.balance < slotState.betAmount && slotState.freeSpins <= 0) {
        showWinToast(0);
        return;
    }
    
    slotState.isSpinning = true;
    const btn = document.getElementById('btn-spin-slot');
    btn.disabled = true;
    btn.textContent = '🎰 ВРАЩАЕТСЯ...';
    
    // Списываем ставку (если не фриспины)
    if (slotState.freeSpins <= 0) {
        updateBalance(-slotState.betAmount);
    } else {
        slotState.freeSpins--;
        updateFreeSpinsDisplay();
    }
    
    AudioEngine.spin();
    
    // Генерируем результат
    const result = generateSlotResult();
    
    // Анимация каждого барабана с задержкой
    const reelDelays = [0, 150, 300, 450, 600]; // каскадная остановка
    const spinDuration = 800; // длительность вращения одного барабана
    
    slotState.reelElements.forEach((reelObj, index) => {
        const delay = reelDelays[index];
        
        // Смещаем барабан на случайное расстояние + целевой результат
        const extraSpins = 3 + Math.floor(Math.random() * 3); // 3-5 полных оборотов
        const totalOffset = extraSpins * 20 + result.positions[index];
        
        reelObj.targetPosition = reelObj.position + totalOffset;
        
        setTimeout(() => {
            animateReel(reelObj, spinDuration, () => {
                if (index === SLOT_CONFIG.reels - 1) {
                    // Последний барабан остановился
                    onAllReelsStopped(result);
                }
            });
        }, delay);
    });
}

// Генерация результата
function generateSlotResult() {
    const positions = [];
    const finalSymbols = [];
    
    for (let r = 0; r < SLOT_CONFIG.reels; r++) {
        const pos = Math.floor(Math.random() * 20);
        positions.push(pos);
        
        // Символы в видимой области (3 строки)
        const visible = [];
        for (let row = 0; row < SLOT_CONFIG.rows; row++) {
            const idx = (pos + row) % 20;
            visible.push(slotState.reels[r][idx]);
        }
        finalSymbols.push(visible);
    }
    
    return { positions, finalSymbols };
}

// Анимация одного барабана
function animateReel(reelObj, duration, callback) {
    const startPos = reelObj.position;
    const targetPos = reelObj.targetPosition;
    const startTime = performance.now();
    
    function step(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: быстрое вращение, резкое замедление в конце
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentPos = startPos + (targetPos - startPos) * eased;
        
        reelObj.element.style.transform = `translateY(-${(currentPos % 20) * 58}px)`;
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            reelObj.position = targetPos;
            reelObj.element.style.transform = `translateY(-${(targetPos % 20) * 58}px)`;
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(step);
}

// Все барабаны остановлены
function onAllReelsStopped(result) {
    slotState.isSpinning = false;
    const btn = document.getElementById('btn-spin-slot');
    btn.disabled = false;
    btn.textContent = slotState.freeSpins > 0 ? '🎁 ФРИСПИН' : '🎰 КРУТИТЬ';
    
    // Подсчёт выигрыша
    const winResult = calculateSlotWin(result.finalSymbols);
    
    if (winResult.totalWin > 0) {
        updateBalance(winResult.totalWin);
        showWinToast(winResult.totalWin);
        
        if (winResult.totalWin >= slotState.betAmount * 10) {
            AudioEngine.bigWin();
        } else {
            AudioEngine.win();
        }
        
        // Подсветка выигрышных символов
        highlightWinningSymbols(winResult.winningPositions);
        
        // Частицы
        const machineEl = document.getElementById('slot-machine');
        if (machineEl) {
            const rect = machineEl.getBoundingClientRect();
            spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
        }
        
        // Обновление последнего выигрыша
        document.getElementById('slot-lastwin').textContent = `Выигрыш: ${winResult.totalWin.toLocaleString()} 🪙`;
    } else {
        AudioEngine.lose();
        document.getElementById('slot-lastwin').textContent = '';
        clearHighlights();
    }
    
    // Проверка бонуса (scatter)
    const bonusCount = countBonusSymbols(result.finalSymbols);
    if (bonusCount >= 3) {
        slotState.freeSpins += bonusCount * 5; // 3 бонуса = 15 фриспинов
        updateFreeSpinsDisplay();
        showWinToast(0);
        document.getElementById('slot-lastwin').textContent = `+${bonusCount * 5} фриспинов! 🎁`;
        AudioEngine.bigWin();
    }
}

// Подсчёт выигрыша
function calculateSlotWin(symbols) {
    let totalWin = 0;
    const winningPositions = new Set();
    
    SLOT_CONFIG.paylines.forEach((payline, lineIndex) => {
        const firstSymbol = symbols[0][payline[0]];
        if (!firstSymbol || firstSymbol.isBonus) return;
        
        let matchCount = 1;
        let hasWild = firstSymbol.isWild;
        
        for (let r = 1; r < SLOT_CONFIG.reels; r++) {
            const currentSymbol = symbols[r][payline[r]];
            if (!currentSymbol) break;
            
            if (currentSymbol.id === firstSymbol.id || currentSymbol.isWild) {
                matchCount++;
                if (currentSymbol.isWild) hasWild = true;
            } else if (firstSymbol.isWild && !currentSymbol.isBonus) {
                // Wild в начале: ищем совпадение с первым не-wild символом
                matchCount++;
            } else {
                break;
            }
        }
        
        if (matchCount >= 3) {
            const effectiveSymbol = firstSymbol.isWild ? 
                (symbols[1]?.[payline[1]]?.isBonus ? firstSymbol : symbols[1]?.[payline[1]] || firstSymbol) : 
                firstSymbol;
            
            const winAmount = effectiveSymbol.value[matchCount - 1] * slotState.betAmount / 10;
            totalWin += winAmount;
            
            // Запоминаем выигрышные позиции
            for (let r = 0; r < matchCount; r++) {
                winningPositions.add(`${r},${payline[r]}`);
            }
        }
    });
    
    return { totalWin, winningPositions };
}

// Подсветка выигрышных символов
function highlightWinningSymbols(winningPositions) {
    clearHighlights();
    
    winningPositions.forEach(pos => {
        const [reel, row] = pos.split(',').map(Number);
        const reelEl = document.getElementById(`reel-${reel}`);
        if (!reelEl) return;
        
        const symbols = reelEl.querySelectorAll('.reel-symbol');
        const symbolEl = symbols[slotState.reelElements[reel].position % 20 + row];
        if (symbolEl) {
            symbolEl.classList.add('highlight');
        }
    });
    
    setTimeout(clearHighlights, 2000);
}

// Сброс подсветки
function clearHighlights() {
    document.querySelectorAll('.reel-symbol.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
}

// Подсчёт бонусных символов
function countBonusSymbols(symbols) {
    let count = 0;
    for (let r = 0; r < SLOT_CONFIG.reels; r++) {
        for (let row = 0; row < SLOT_CONFIG.rows; row++) {
            if (symbols[r][row]?.isBonus) count++;
        }
    }
    return count;
}

// Обновление отображения фриспинов
function updateFreeSpinsDisplay() {
    const el = document.getElementById('slot-freespins');
    if (!el) return;
    
    if (slotState.freeSpins > 0) {
        el.textContent = `🎁 Фриспины: ${slotState.freeSpins}`;
        el.classList.add('active');
    } else {
        el.textContent = '';
        el.classList.remove('active');
    }
}
