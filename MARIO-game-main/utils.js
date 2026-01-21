// ===== UTILITÁRIOS =====

/**
 * Sistema de Colisão
 */
class CollisionSystem {
    /**
     * Verifica se dois elementos estão colidindo
     */
    static checkCollision(element1, element2, offset = {}) {
        const rect1 = this.getRect(element1);
        const rect2 = this.getRect(element2);
        
        const offsetLeft = offset.left || 0;
        const offsetRight = offset.right || 0;
        const offsetTop = offset.top || 0;
        const offsetBottom = offset.bottom || 0;
        
        return (
            rect1.right - offsetRight > rect2.left + offsetLeft &&
            rect1.left + offsetLeft < rect2.right - offsetRight &&
            rect1.top + offsetTop < rect2.bottom - offsetBottom &&
            rect1.bottom - offsetBottom > rect2.top + offsetTop
        );
    }
    
    /**
     * Obtém as dimensões e posição de um elemento
     */
    static getRect(element) {
        const left = element.offsetLeft;
        const bottom = parseFloat(window.getComputedStyle(element).bottom) || 0;
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        
        return {
            left: left,
            right: left + width,
            top: bottom + height,
            bottom: bottom,
            width: width,
            height: height
        };
    }
    
    /**
     * Verifica se Mario está pisando em um inimigo
     */
    static isStomping(mario, enemy) {
        const marioRect = this.getRect(mario);
        const enemyRect = this.getRect(enemy);
        const enemyHeight = enemyRect.height;
        
        // Mario está caindo e próximo do topo do inimigo
        return (
            marioRect.bottom >= enemyHeight - 25 && 
            marioRect.bottom <= enemyHeight + 15 &&
            mario.classList.contains('jump')
        );
    }
}

/**
 * Gerenciador de Entidades do Jogo
 */
class EntityManager {
    constructor() {
        this.obstacles = [];
        this.coins = [];
        this.blocks = [];
        this.powerups = [];
    }
    
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }
    
    addCoin(coin) {
        this.coins.push(coin);
    }
    
    addBlock(block) {
        this.blocks.push(block);
    }
    
    addPowerup(powerup) {
        this.powerups.push(powerup);
    }
    
    removeObstacle(obstacle) {
        this.obstacles = this.obstacles.filter(o => o !== obstacle);
        if (obstacle.parentNode) obstacle.remove();
    }
    
    removeCoin(coin) {
        this.coins = this.coins.filter(c => c !== coin);
        if (coin.parentNode) coin.remove();
    }
    
    removeBlock(block) {
        this.blocks = this.blocks.filter(b => b !== block);
        if (block.parentNode) block.remove();
    }
    
    removePowerup(powerup) {
        this.powerups = this.powerups.filter(p => p !== powerup);
        if (powerup.parentNode) powerup.remove();
    }
    
    clearAll() {
        [...this.obstacles, ...this.coins, ...this.blocks, ...this.powerups].forEach(el => {
            if (el.parentNode) el.remove();
        });
        
        this.obstacles = [];
        this.coins = [];
        this.blocks = [];
        this.powerups = [];
    }
    
    pauseAll() {
        const elements = [...this.obstacles, ...this.coins, ...this.blocks, ...this.powerups];
        elements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }
    
    resumeAll() {
        const elements = [...this.obstacles, ...this.coins, ...this.blocks, ...this.powerups];
        elements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
    
    freezeAll() {
        const elements = [...this.obstacles, ...this.coins, ...this.blocks, ...this.powerups];
        elements.forEach(el => {
            el.style.animation = 'none';
            el.style.left = `${el.offsetLeft}px`;
        });
    }
    
    getAllEntities() {
        return {
            obstacles: this.obstacles,
            coins: this.coins,
            blocks: this.blocks,
            powerups: this.powerups
        };
    }
}

/**
 * Gerenciador de Intervalos
 */
class IntervalManager {
    constructor() {
        this.intervals = new Map();
    }
    
    set(name, callback, delay) {
        this.clear(name);
        const id = setInterval(callback, delay);
        this.intervals.set(name, id);
        return id;
    }
    
    clear(name) {
        if (this.intervals.has(name)) {
            clearInterval(this.intervals.get(name));
            this.intervals.delete(name);
        }
    }
    
    clearAll() {
        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();
    }
    
    has(name) {
        return this.intervals.has(name);
    }
}

/**
 * Gerenciador de UI
 */
class UIManager {
    static showScorePopup(gameBoard, x, y, points, color = '#fbd000') {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = typeof points === 'number' ? `+${points}` : points;
        popup.style.left = x + 'px';
        popup.style.bottom = y + 'px';
        popup.style.color = color;
        gameBoard.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }
    
    static showPhaseTransition(gameBoard, phaseName) {
        const phaseText = document.createElement('div');
        phaseText.className = 'phase-transition';
        phaseText.textContent = phaseName;
        gameBoard.appendChild(phaseText);
        setTimeout(() => phaseText.remove(), 2000);
    }
    
    static showNewRecord(gameBoard) {
        const newRecordDiv = document.createElement('div');
        newRecordDiv.className = 'new-record';
        newRecordDiv.textContent = '🏆 NOVO RECORDE! 🏆';
        gameBoard.appendChild(newRecordDiv);
    }
    
    static updateLives(livesDisplay, lives) {
        const maxLives = GAME_CONFIG.LIVES.MAX;
        livesDisplay.textContent = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, maxLives - lives));
    }
    
    static clearTransients(gameBoard) {
        gameBoard.querySelectorAll('.new-record, .phase-transition, .score-popup').forEach(el => {
            el.remove();
        });
    }
}

/**
 * Helpers gerais
 */
class GameHelpers {
    /**
     * Calcula a fase atual baseado na pontuação
     */
    static calculatePhase(score) {
        return Math.min(5, Math.floor(score / GAME_CONFIG.DIFFICULTY.SCORE_PER_PHASE) + 1);
    }
    
    /**
     * Obtém configuração de velocidade baseada na fase
     */
    static getGameSpeed(phase) {
        return Math.max(
            GAME_CONFIG.DIFFICULTY.MIN_SPEED,
            GAME_CONFIG.DIFFICULTY.INITIAL_SPEED - ((phase - 1) * 0.25)
        );
    }
    
    /**
     * Obtém tempo de spawn baseado na fase
     */
    static getSpawnTime(phase) {
        return Math.max(
            GAME_CONFIG.DIFFICULTY.MIN_SPAWN_TIME,
            GAME_CONFIG.DIFFICULTY.INITIAL_SPAWN_TIME - ((phase - 1) * 180)
        );
    }
    
    /**
     * Escolhe um inimigo aleatório para a fase atual
     */
    static getRandomEnemy(phase) {
        const enemies = PHASE_DATA[phase]?.enemies || PHASE_DATA[1].enemies;
        return enemies[Math.floor(Math.random() * enemies.length)];
    }
    
    /**
     * Obtém a altura especial de spawn para certos inimigos
     */
    static getEnemySpawnHeight(enemyType) {
        const special = ENEMY_TYPES.SPECIAL_HEIGHTS[enemyType];
        if (special) {
            return special.min + Math.random() * (special.max - special.min);
        }
        return 0; // Altura padrão (chão)
    }
    
    /**
     * Verifica se um inimigo pode ser pisado
     */
    static canBeStomped(enemyType) {
        return ENEMY_TYPES.STOMPABLE.includes(enemyType);
    }
    
    /**
     * Verifica se um inimigo é perigoso (não pode ser pisado)
     */
    static isDangerous(enemyType) {
        return ENEMY_TYPES.DANGEROUS.includes(enemyType);
    }
    
    /**
     * Obtém pontuação para um tipo de inimigo
     */
    static getEnemyScore(enemyType) {
        // Converte nome do inimigo para camelCase
        const scoreKey = enemyType.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
            .replace(/^./, (s) => s.toUpperCase());
        return GAME_CONFIG.SCORES[scoreKey] || 100;
    }
    
    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

/**
 * Sistema de Storage
 */
class StorageManager {
    static KEYS = {
        HIGH_SCORE: 'marioGameHighScore',
        SOUND_ENABLED: 'marioGameSoundEnabled',
        MUSIC_ENABLED: 'marioGameMusicEnabled'
    };
    
    static getHighScore() {
        return parseInt(localStorage.getItem(this.KEYS.HIGH_SCORE)) || 0;
    }
    
    static setHighScore(score) {
        localStorage.setItem(this.KEYS.HIGH_SCORE, score.toString());
    }
    
    static getSoundEnabled() {
        const stored = localStorage.getItem(this.KEYS.SOUND_ENABLED);
        return stored === null ? true : stored === 'true';
    }
    
    static setSoundEnabled(enabled) {
        localStorage.setItem(this.KEYS.SOUND_ENABLED, enabled.toString());
    }
    
    static getMusicEnabled() {
        const stored = localStorage.getItem(this.KEYS.MUSIC_ENABLED);
        return stored === null ? true : stored === 'true';
    }
    
    static setMusicEnabled(enabled) {
        localStorage.setItem(this.KEYS.MUSIC_ENABLED, enabled.toString());
    }
}
