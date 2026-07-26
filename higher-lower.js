/* ========== CIAN GIFT — БОЛЬШЕ-МЕНЬШЕ ========== */

// Колода карт
const DECK = [
    { rank: 2, name: '2', suit: 'hearts' },
    { rank: 3, name: '3', suit: 'hearts' },
    { rank: 4, name: '4', suit: 'hearts' },
    { rank: 5, name: '5', suit: 'hearts' },
    { rank: 6, name: '6', suit: 'hearts' },
    { rank: 7, name: '7', suit: 'hearts' },
    { rank: 8, name: '8', suit: 'hearts' },
    { rank: 9, name: '9', suit: 'hearts' },
    { rank: 10, name: '10', suit: 'hearts' },
    { rank: 11, name: 'J', suit: 'hearts' },
    { rank: 12, name: 'Q', suit: 'hearts' },
    { rank: 13, name: 'K', suit: 'hearts' },
    { rank: 14, name: 'A', suit: 'hearts' },
];

// Масти с цветами
const SUITS = [
    { id: 'hearts', symbol: '♥', color: '#cc2222' },
    { id: 'diamonds', symbol: '♦', color: '#cc2222' },
    { id: 'clubs', symbol: '♣', color: '#222222' },
    { id: 'spades', symbol: '♠', color: '#222222' },
];

// Состояние игры
let hlState = {
    currentCard: null,
    nextCard: null,
    streak: 0,
    betAmount: 100,
    isPlaying: false,
    deck: [],
    canCashout: false,
    potentialWin: 0,
};

// Инициализация
function initHigherLower() {
    const container = document.getElementById('higherlower-container');
    if (!container || container.children.length > 0) return;
    
    container.innerHTML = `
        <div id="hl-game">
            <!-- Карты -->
            <div id="hl-table">
                <div id="hl-felt">
                    <div id="hl-current-card" class="hl-card">
                        <div class="card-back">🂠</div>
                    </div>
                    <div id="hl-vs">?</div>
                    <div id="hl-next-card" class="hl-card">
                        <div class="card-back">🂠</div>
                    </div>
                </div>
                <div id="hl-streak"></div>
                <div id="hl-cards-remaining"></div>
            </div>
            
            <!-- Кнопки выбора -->
            <div id="hl-choices">
                <button id="hl-higher" class="hl-choice-btn">▲ БОЛЬШЕ</button>
                <button id="hl-lower" class="hl-choice-btn">▼ МЕНЬШЕ</button>
            </div>
            
            <!-- Управление -->
            <div id="hl-bet-panel">
                <label>Сумма ставки</label>
                <div class="bet-chips" id="hl-chips">
                    <div class="chip chip-10" data-value="10">10</div>
                    <div class="chip chip-50" data-value="50">50</div>
                    <div class="chip chip-100 selected" data-value="100">100</div>
                    <div class="chip chip-500" data-value="500">500</div>
                    <div class="chip chip-1000" data-value="1000">1K</div>
                </div>
                <div id="hl-actions">
                    <button id="hl-new-game" class="btn-gold">🃏 НОВАЯ ИГРА</button>
                    <button id="hl-cashout" class="btn-gold" style="display:none;">💰 ЗАБРАТЬ</button>
                </div>
                <div id="hl-potential">Потенциальный выигрыш: — 🪙</div>
            </div>
        </div>
    `;
    
    addHigherLowerStyles();
    
    // Чипы
    document.querySelectorAll('#hl-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#hl-chips .chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            hlState.betAmount = parseInt(chip.dataset.value);
            AudioEngine.chip();
            updateHLPotential();
        });
    });
    
    // Кнопки
    document.getElementById('hl-new-game').addEventListener('click', startHLGame);
    document.getElementById('hl-cashout').addEventListener('click', cashoutHL);
    document.getElementById('hl-higher').addEventListener('click', () => guessHL('higher'));
    document.getElementById('hl-lower').addEventListener('click', () => guessHL('lower'));
    
    // Сбрасываем игру
    resetHLGame();
}

// Стили
function addHigherLowerStyles() {
    if (document.getElementById('hl-styles')) return;
    const style = document.createElement('style');
    style.id = 'hl-styles';
    style.textContent = `
        #hl-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 70px 10px 20px;
            min-height: 100%;
            gap: 15px;
        }
        #hl-table {
            width: 100%;
            max-width: 360px;
        }
        #hl-felt {
            background: radial-gradient(ellipse, #1a5a2a 0%, #0d3d18 100%);
            border-radius: 20px;
            padding: 25px 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            border: 4px solid #3a1a0a;
            box-shadow: 
                0 10px 30px rgba(0,0,0,0.5),
                inset 0 2px 0 rgba(255,255,255,0.05);
            position: relative;
        }
        /* Текстура сукна */
        #hl-felt::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 16px;
            background: repeating-linear-gradient(
                0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px
            );
            pointer-events: none;
        }
        .hl-card {
            width: 100px;
            height: 140px;
            background: #fff;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            transition: transform 0.3s ease;
            position: relative;
            z-index: 1;
        }
        .hl-card.revealed {
            transform: rotateY(0);
            animation: card-reveal 0.5s ease;
        }
        @keyframes card-reveal {
            0% { transform: rotateY(90deg) scale(0.8); }
            100% { transform: rotateY(0) scale(1); }
        }
        .card-back {
            font-size: 60px;
            color: #1a3a8a;
        }
        .card-front {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }
        .card-rank {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
        }
        .card-suit {
            font-size: 28px;
        }
        .card-suit-small {
            font-size: 16px;
        }
        #hl-vs {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #c9a96e;
            text-shadow: 0 0 10px rgba(201,169,110,0.5);
            z-index: 0;
        }
        #hl-streak {
            text-align: center;
            font-size: 14px;
            color: #c9a96e;
            margin-top: 8px;
            min-height: 20px;
        }
        #hl-cards-remaining {
            text-align: center;
            font-size: 11px;
            color: #9a9484;
        }
        #hl-choices {
            display: flex;
            gap: 10px;
        }
        .hl-choice-btn {
            width: 120px;
            padding: 14px;
            border-radius: 12px;
            border: 2px solid #444;
            background: rgba(255,255,255,0.03);
            color: #ddd;
            cursor: pointer;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s;
        }
        .hl-choice-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
        .hl-choice-btn:active:not(:disabled) {
            transform: scale(0.95);
        }
        #hl-higher { border-color: #2a6a3a; color: #4acf5a; }
        #hl-higher:active:not(:disabled) { background: rgba(42,106,58,0.3); }
        #hl-lower { border-color: #8b1a1a; color: #cf4a4a; }
        #hl-lower:active:not(:disabled) { background: rgba(139,26,26,0.3); }
        #hl-bet-panel {
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            padding: 15px;
            border: 1px solid #c9a96e22;
            width: 100%;
            max-width: 360px;
        }
        #hl-bet-panel label {
            font-size: 12px;
            color: #9a9484;
            display: block;
            margin-bottom: 6px;
        }
        #hl-actions {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        #hl-actions .btn-gold {
            flex: 1;
            padding: 12px;
        }
        #hl-cashout {
            background: #2a6a3a !important;
        }
        #hl-potential {
            text-align: center;
            font-size: 13px;
            color: #9a9484;
            margin-top: 8px;
        }
    `;
    document.head.appendChild(style);
}

// Сброс игры
function resetHLGame() {
    hlState.currentCard = null;
    hlState.nextCard = null;
    hlState.streak = 0;
    hlState.isPlaying = false;
    hlState.canCashout = false;
    hlState.potentialWin = 0;
    hlState.deck = [];
    
    document.getElementById('hl-current-card').innerHTML = '<div class="card-back">🂠</div>';
    document.getElementById('hl-next-card').innerHTML = '<div class="card-back">🂠</div>';
    document.getElementById('hl-streak').textContent = '';
    document.getElementById('hl-cards-remaining').textContent = '';
    document.getElementById('hl-higher').disabled = true;
    document.getElementById('hl-lower').disabled = true;
    document.getElementById('hl-new-game').style.display = 'block';
    document.getElementById('hl-cashout').style.display = 'none';
    document.getElementById('hl-potential').textContent = 'Потенциальный выигрыш: — 🪙';
}

// Начало игры
function startHLGame() {
    if (PlayerState.balance < hlState.betAmount) {
        showWinToast(0);
        return;
    }
    
    // Списываем ставку
    updateBalance(-hlState.betAmount);
    
    // Создаём и тасуем колоду
    hlState.deck = [];
    SUITS.forEach(suit => {
        DECK.forEach(card => {
            hlState.deck.push({ ...card, suit: suit.id });
        });
    });
    shuffleArray(hlState.deck);
    
    // Берём первую карту
    hlState.currentCard = hlState.deck.pop();
    hlState.nextCard = hlState.deck.pop();
    hlState.streak = 1;
    hlState.isPlaying = true;
    hlState.canCashout = false;
    hlState.potentialWin = hlState.betAmount * 2;
    
    // Отображаем
    showHLCard('hl-current-card', hlState.currentCard, true);
    document.getElementById('hl-next-card').innerHTML = '<div class="card-back">🂠</div>';
    document.getElementById('hl-streak').textContent = `Серия: ${hlState.streak}`;
    document.getElementById('hl-cards-remaining').textContent = `Карт в колоде: ${hlState.deck.length}`;
    document.getElementById('hl-higher').disabled = false;
    document.getElementById('hl-lower').disabled = false;
    document.getElementById('hl-new-game').style.display = 'none';
    document.getElementById('hl-cashout').style.display = 'none';
    
    updateHLPotential();
    AudioEngine.card();
}

// Показать карту
function showHLCard(elementId, card, animated = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const suitInfo = SUITS.find(s => s.id === card.suit);
    
    el.innerHTML = `
        <div class="card-front">
            <div class="card-rank" style="color: ${suitInfo.color}">${card.name}</div>
            <div class="card-suit" style="color: ${suitInfo.color}">${suitInfo.symbol}</div>
            <div class="card-suit-small" style="color: ${suitInfo.color}">${suitInfo.symbol}</div>
        </div>
    `;
    
    if (animated) {
        el.classList.add('revealed');
        setTimeout(() => el.classList.remove('revealed'), 500);
    }
}

// Угадывание
function guessHL(choice) {
    if (!hlState.isPlaying) return;
    
    const currentRank = hlState.currentCard.rank;
    const nextRank = hlState.nextCard.rank;
    
    let win = false;
    if (choice === 'higher') {
        win = nextRank > currentRank;
    } else {
        win = nextRank < currentRank;
    }
    
    // Показываем следующую карту
    showHLCard('hl-next-card', hlState.nextCard, true);
    
    if (win) {
        // Угадал
        hlState.streak++;
        hlState.potentialWin = hlState.betAmount * Math.pow(2, hlState.streak - 1);
        hlState.canCashout = true;
        
        document.getElementById('hl-streak').textContent = `Серия: ${hlState.streak} ✅`;
        document.getElementById('hl-cashout').style.display = 'block';
        
        AudioEngine.win();
        
        // Частицы на текущей карте
        const cardEl = document.getElementById('hl-current-card');
        if (cardEl) {
            const rect = cardEl.getBoundingClientRect();
            spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
        }
        
        // Готовим следующую карту
        hlState.currentCard = hlState.nextCard;
        hlState.nextCard = hlState.deck.length > 0 ? hlState.deck.pop() : null;
        
        // Обновляем отображение
        showHLCard('hl-current-card', hlState.currentCard, false);
        document.getElementById('hl-next-card').innerHTML = '<div class="card-back">🂠</div>';
        document.getElementById('hl-cards-remaining').textContent = `Карт в колоде: ${hlState.deck.length}`;
        
        updateHLPotential();
        
        // Если кончилась колода
        if (!hlState.nextCard) {
            endHLGame(true);
        }
    } else {
        // Не угадал
        document.getElementById('hl-streak').textContent = `Проигрыш! Серия: ${hlState.streak} ❌`;
        AudioEngine.lose();
        endHLGame(false);
    }
}

// Обновление потенциального выигрыша
function updateHLPotential() {
    const el = document.getElementById('hl-potential');
    if (!el) return;
    
    if (hlState.isPlaying && hlState.canCashout) {
        el.textContent = `Забрать: ${hlState.potentialWin.toLocaleString()} 🪙`;
        el.style.color = '#c9a96e';
    } else if (hlState.isPlaying) {
        el.textContent = 'Угадайте, чтобы получить выигрыш';
        el.style.color = '#9a9484';
    } else {
        el.textContent = 'Потенциальный выигрыш: — 🪙';
        el.style.color = '#9a9484';
    }
}

// Забрать выигрыш
function cashoutHL() {
    if (!hlState.canCashout) return;
    
    updateBalance(hlState.potentialWin);
    showWinToast(hlState.potentialWin);
    AudioEngine.bigWin();
    
    const btn = document.getElementById('hl-cashout');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        spawnParticles(rect.left + rect.width / 2, rect.top, 25);
    }
    
    resetHLGame();
}

// Конец игры
function endHLGame(won) {
    hlState.isPlaying = false;
    
    document.getElementById('hl-higher').disabled = true;
    document.getElementById('hl-lower').disabled = true;
    document.getElementById('hl-cashout').style.display = 'none';
    document.getElementById('hl-new-game').style.display = 'block';
    document.getElementById('hl-potential').textContent = won ? 'Выигрыш доступен для сбора!' : 'Не повезло!';
    
    if (won) {
        // Автоматически забираем выигрыш
        cashoutHL();
    }
}

// Перемешивание массива (Fisher-Yates)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
