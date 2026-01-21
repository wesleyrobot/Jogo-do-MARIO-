// ===== MARIO JUMP GAME - SCRIPT PRINCIPAL REFATORADO =====

/**
 * Classe principal do jogo
 */
class MarioGame {
    constructor() {
        this.initializeElements();
        this.initializeManagers();
        this.initializeState();
        this.setupEventListeners();
        this.loadSavedData();
    }
    
    // ===== INICIALIZAÇÃO =====
    
    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameBoard = document.getElementById('game-board');
        
        // Mario
        this.mario = document.querySelector('.mario');
        this.originalMarioSrc = './imagens/mario.gif';
        
        // UI Elements
        this.gameover = document.querySelector('.game-over-message');
        this.restartButton = document.querySelector('.restart-button');
        this.menuButton = document.querySelector('.menu-button');
        this.soundToggle = document.getElementById('sound-toggle');
        this.pauseButton = document.getElementById('pause-button');
        this.startButton = document.getElementById('start-button');
        this.resumeButton = document.getElementById('resume-button');
        this.quitButton = document.getElementById('quit-button');
        this.gameOverScores = document.querySelector('.game-over-scores');
        
        // Score displays
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.menuHighScoreElement = document.getElementById('menu-high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalCoinsElement = document.getElementById('final-coins');
        this.finalHighScoreElement = document.getElementById('final-high-score');
        this.livesDisplay = document.getElementById('lives-display');
        this.coinsDisplay = document.getElementById('coins');
        this.phaseDisplay = document.getElementById('phase');
    }
    
    initializeManagers() {
        this.entityManager = new EntityManager();
        this.intervalManager = new IntervalManager();
        this.audioManager = new AudioManager();
    }
    
    initializeState() {
        // Game state
        this.score = 0;
        this.coinCount = 0;
        this.lives = GAME_CONFIG.LIVES.INITIAL;
        this.currentPhase = 1;
        this.highScore = 0;
        this.isJumping = false;
        this.isPaused = false;
        this.isGameRunning = false;
        
        // Power-ups
        this.isInvincible = false;
        this.invincibleTimer = null;
        this.isSonicMode = false;
        this.sonicTimer = null;
        
        // Movement
        this.marioX = GAME_CONFIG.MARIO.INITIAL_X;
        this.movingLeft = false;
        this.movingRight = false;
        
        // Difficulty
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.minSpawnTime = GAME_CONFIG.DIFFICULTY.INITIAL_SPAWN_TIME;
        
        // Animation frame
        this.lastFrameTime = 0;
        this.animationFrameId = null;
    }
    
    loadSavedData() {
        this.highScore = StorageManager.getHighScore();
        this.highScoreElement.textContent = this.highScore;
        this.menuHighScoreElement.textContent = this.highScore;
        
        const soundEnabled = this.audioManager.soundEnabled && this.audioManager.musicEnabled;
        this.soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    }
    
    // ===== EVENT LISTENERS =====
    
    setupEventListeners() {
        // Buttons
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.restartGame();
        });
        this.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.goToMenu();
        });
        this.pauseButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePause();
        });
        this.resumeButton.addEventListener('click', () => this.togglePause());
        this.quitButton.addEventListener('click', () => this.goToMenu());
        
        this.soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const soundEnabled = this.audioManager.toggleSound();
            this.audioManager.toggleMusic();
            this.soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse/Touch
        this.gameBoard.addEventListener('click', (e) => {
            if (e.target === this.gameBoard || e.target.classList.contains('parallax-bg')) {
                this.jump();
            }
        });
        
        this.gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.gameBoard.addEventListener('touchend', () => this.handleTouchEnd());
    }
    
    handleKeyDown(e) {
        if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
            e.preventDefault();
            if (this.startScreen.style.display !== 'none') {
                this.startGame();
            } else {
                this.jump();
            }
        }
        
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            e.preventDefault();
            this.movingLeft = true;
        }
        
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            e.preventDefault();
            this.movingRight = true;
        }
        
        if ((e.code === 'Escape' || e.code === 'KeyP') && this.isGameRunning) {
            this.togglePause();
        }
    }
    
    handleKeyUp(e) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            this.movingLeft = false;
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            this.movingRight = false;
        }
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.gameBoard.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const width = rect.width;
        
        e.preventDefault();
        
        if (x < width * 0.3) {
            this.movingLeft = true;
        } else if (x > width * 0.7) {
            this.movingRight = true;
        } else {
            this.jump();
        }
    }
    
    handleTouchEnd() {
        this.movingLeft = false;
        this.movingRight = false;
    }
    
    // ===== GAME LOOP =====
    
    gameLoop(timestamp) {
        if (!this.isGameRunning) return;
        
        // Calcular delta time
        const deltaTime = timestamp - this.lastFrameTime;
        
        // Limitar a 60 FPS
        if (deltaTime >= GAME_CONFIG.FRAME_TIME) {
            this.lastFrameTime = timestamp;
            
            if (!this.isPaused) {
                this.updateMarioPosition();
                this.checkCollisions();
            }
        }
        
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    // ===== MARIO CONTROLS =====
    
    updateMarioPosition() {
        const currentSpeed = this.isSonicMode ? 
            GAME_CONFIG.MARIO.SONIC_SPEED : 
            GAME_CONFIG.MARIO.SPEED;
        
        if (this.movingLeft && this.marioX > 10) {
            this.marioX -= currentSpeed;
            this.mario.style.transform = 'scaleX(-1)';
        }
        
        if (this.movingRight && this.marioX < this.gameBoard.offsetWidth - 60) {
            this.marioX += currentSpeed;
            this.mario.style.transform = 'scaleX(1)';
        }
        
        this.mario.style.left = this.marioX + 'px';
    }
    
    jump() {
        if (this.isJumping || !this.isGameRunning || this.isPaused) return;
        
        this.isJumping = true;
        this.mario.classList.add('jump');
        this.audioManager.playSound('jump');
        
        setTimeout(() => {
            this.mario.classList.remove('jump');
            this.isJumping = false;
        }, GAME_CONFIG.MARIO.JUMP_DURATION);
    }
    
    // ===== COLLISION DETECTION =====
    
    checkCollisions() {
        this.checkCoinCollisions();
        this.checkBlockCollisions();
        this.checkPowerupCollisions();
        this.checkObstacleCollisions();
    }
    
    checkCoinCollisions() {
        const entities = this.entityManager.getAllEntities();
        
        entities.coins.forEach(coin => {
            if (CollisionSystem.checkCollision(this.mario, coin)) {
                this.coinCount++;
                this.coinsDisplay.textContent = this.coinCount;
                
                const coinRect = CollisionSystem.getRect(coin);
                UIManager.showScorePopup(
                    this.gameBoard,
                    coinRect.left,
                    coinRect.bottom + 50,
                    GAME_CONFIG.SCORES.COIN
                );
                
                this.audioManager.playSound('coin');
                this.entityManager.removeCoin(coin);
            }
        });
    }
    
    checkBlockCollisions() {
        const entities = this.entityManager.getAllEntities();
        const marioRect = CollisionSystem.getRect(this.mario);
        
        entities.blocks.forEach(block => {
            if (block.dataset.used === 'true') return;
            
            const blockRect = CollisionSystem.getRect(block);
            
            // Verificar se Mario bateu de baixo no bloco
            if (
                marioRect.right > blockRect.left &&
                marioRect.left < blockRect.right &&
                marioRect.top >= blockRect.bottom &&
                marioRect.top <= blockRect.bottom + 30 &&
                marioRect.bottom < blockRect.bottom
            ) {
                this.activateBlock(block, blockRect);
            }
        });
    }
    
    activateBlock(block, blockRect) {
        block.dataset.used = 'true';
        block.classList.add('used');
        this.audioManager.playSound('block');
        
        const rand = Math.random();
        
        if (rand < GAME_CONFIG.POWERUPS.MUSHROOM_SPAWN_CHANCE) {
            this.createPowerup(blockRect.left, blockRect.bottom + 60, 'mushroom');
        } else if (rand < GAME_CONFIG.POWERUPS.STAR_SPAWN_CHANCE) {
            this.createPowerup(blockRect.left, blockRect.bottom + 60, 'star');
        } else if (rand < GAME_CONFIG.POWERUPS.SONIC_SPAWN_CHANCE) {
            this.createPowerup(blockRect.left, blockRect.bottom + 60, 'sonic');
        } else {
            // Moedas
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    UIManager.showScorePopup(
                        this.gameBoard,
                        blockRect.left + i * 20,
                        blockRect.bottom + 80,
                        GAME_CONFIG.SCORES.COIN
                    );
                }, i * 100);
            }
            this.coinCount += 3;
            this.coinsDisplay.textContent = this.coinCount;
        }
    }
    
    checkPowerupCollisions() {
        const entities = this.entityManager.getAllEntities();
        
        entities.powerups.forEach(powerup => {
            if (CollisionSystem.checkCollision(this.mario, powerup)) {
                const type = powerup.dataset.type;
                const powerupRect = CollisionSystem.getRect(powerup);
                
                if (type === 'mushroom') {
                    if (this.lives < GAME_CONFIG.POWERUPS.MAX_LIVES) {
                        this.lives++;
                        UIManager.updateLives(this.livesDisplay, this.lives);
                    }
                    UIManager.showScorePopup(
                        this.gameBoard,
                        powerupRect.left,
                        powerupRect.bottom + 50,
                        '1UP',
                        '#00ff00'
                    );
                    this.audioManager.playSound('1up');
                } else if (type === 'star') {
                    this.activateInvincibility();
                    UIManager.showScorePopup(
                        this.gameBoard,
                        powerupRect.left,
                        powerupRect.bottom + 50,
                        '⭐',
                        '#fbd000'
                    );
                    this.audioManager.playSound('powerup');
                } else if (type === 'sonic') {
                    this.activateSonicMode();
                    UIManager.showScorePopup(
                        this.gameBoard,
                        powerupRect.left,
                        powerupRect.bottom + 50,
                        '⚡SONIC!',
                        '#00aaff'
                    );
                    this.audioManager.playSound('sonic');
                }
                
                this.entityManager.removePowerup(powerup);
            }
        });
    }
    
    checkObstacleCollisions() {
        const entities = this.entityManager.getAllEntities();
        const marioRect = CollisionSystem.getRect(this.mario);
        
        entities.obstacles.forEach(obstacle => {
            if (obstacle.classList.contains('dead')) return;
            
            const obstacleRect = CollisionSystem.getRect(obstacle);
            const enemyType = this.getEnemyType(obstacle);
            
            if (!this.checkHorizontalCollision(marioRect, obstacleRect)) return;
            
            this.handleObstacleCollision(obstacle, obstacleRect, enemyType);
        });
    }
    
    checkHorizontalCollision(marioRect, obstacleRect) {
        const offset = GAME_CONFIG.MARIO.COLLISION_OFFSET;
        return (
            marioRect.right - offset.RIGHT > obstacleRect.left + offset.LEFT &&
            marioRect.left + offset.LEFT < obstacleRect.right - offset.RIGHT
        );
    }
    
    getEnemyType(obstacle) {
        const classList = Array.from(obstacle.classList);
        return classList.find(c => c !== 'obstacle' && c !== 'dead');
    }
    
    handleObstacleCollision(obstacle, obstacleRect, enemyType) {
        // Casos especiais: bullet bill e inimigos voadores
        if (this.handleSpecialEnemyCollision(obstacle, obstacleRect, enemyType)) {
            return;
        }
        
        const canStomp = GameHelpers.canBeStomped(enemyType);
        const dangerous = GameHelpers.isDangerous(enemyType);
        const enemyHeight = ENEMY_TYPES.HEIGHTS[enemyType] || 80;
        
        const marioRect = CollisionSystem.getRect(this.mario);
        
        // Verificar se pode pisar
        if (canStomp && CollisionSystem.isStomping(this.mario, obstacle)) {
            this.stompEnemy(obstacle, obstacleRect, enemyType);
        } else if (dangerous && this.checkVerticalCollision(marioRect, obstacleRect)) {
            // Inimigos perigosos sempre causam dano
            if (this.isSonicMode) {
                this.destroyEnemy(obstacle, obstacleRect, GAME_CONFIG.SCORES.DANGEROUS_KILL, '#00aaff');
            } else {
                this.takeDamage();
                this.entityManager.removeObstacle(obstacle);
            }
        } else if (marioRect.bottom < enemyHeight - 15) {
            // Colisão lateral
            if (this.isSonicMode && enemyType !== 'pipe') {
                this.destroyEnemy(obstacle, obstacleRect, GAME_CONFIG.SCORES.SONIC_KILL, '#00aaff');
            } else {
                this.takeDamage();
                this.entityManager.removeObstacle(obstacle);
            }
        }
    }
    
    handleSpecialEnemyCollision(obstacle, obstacleRect, enemyType) {
        if (enemyType === 'bulletBill') {
            const marioRect = CollisionSystem.getRect(this.mario);
            const bulletTop = obstacleRect.top;
            const bulletBottom = obstacleRect.bottom;
            
            if (marioRect.bottom < bulletTop && marioRect.top > bulletBottom) {
                if (this.isSonicMode) {
                    this.destroyEnemy(obstacle, obstacleRect, GAME_CONFIG.SCORES.DANGEROUS_KILL, '#00aaff');
                } else {
                    this.takeDamage();
                    this.entityManager.removeObstacle(obstacle);
                }
                return true;
            }
        }
        return false;
    }
    
    checkVerticalCollision(marioRect, obstacleRect) {
        return marioRect.bottom < obstacleRect.top && marioRect.top > obstacleRect.bottom;
    }
    
    stompEnemy(obstacle, obstacleRect, enemyType) {
        obstacle.classList.add('dead');
        const points = GameHelpers.getEnemyScore(enemyType);
        
        this.score += points;
        this.scoreElement.textContent = this.score;
        
        UIManager.showScorePopup(
            this.gameBoard,
            obstacleRect.left,
            obstacleRect.bottom + 30,
            points
        );
        
        this.audioManager.playSound('stomp');
        
        // Mini pulo
        this.mario.classList.remove('jump');
        setTimeout(() => {
            this.mario.classList.add('jump');
            this.isJumping = true;
        }, 10);
        setTimeout(() => {
            this.mario.classList.remove('jump');
            this.isJumping = false;
        }, 300);
        
        setTimeout(() => {
            this.entityManager.removeObstacle(obstacle);
        }, 500);
    }
    
    destroyEnemy(obstacle, obstacleRect, points, color) {
        obstacle.classList.add('dead');
        this.score += points;
        this.scoreElement.textContent = this.score;
        
        UIManager.showScorePopup(
            this.gameBoard,
            obstacleRect.left,
            obstacleRect.bottom + 30,
            points,
            color
        );
        
        this.audioManager.playSound('stomp');
        
        setTimeout(() => {
            this.entityManager.removeObstacle(obstacle);
        }, 200);
    }
    
    // ===== POWER-UPS =====
    
    activateInvincibility() {
        this.isInvincible = true;
        this.mario.classList.add('invincible');
        
        if (this.invincibleTimer) clearTimeout(this.invincibleTimer);
        
        this.invincibleTimer = setTimeout(() => {
            this.isInvincible = false;
            this.mario.classList.remove('invincible');
        }, GAME_CONFIG.POWERUPS.INVINCIBILITY_DURATION);
    }
    
    activateSonicMode() {
        this.isSonicMode = true;
        this.isInvincible = true;
        this.mario.src = './imagens/sonic.gif';
        this.mario.classList.add('sonic-mode');
        this.mario.classList.remove('invincible');
        
        this.audioManager.switchToSonicMusic();
        
        if (this.sonicTimer) clearTimeout(this.sonicTimer);
        
        this.sonicTimer = setTimeout(() => {
            this.isSonicMode = false;
            this.isInvincible = false;
            this.mario.src = this.originalMarioSrc;
            this.mario.classList.remove('sonic-mode');
            this.audioManager.switchToMarioMusic();
        }, GAME_CONFIG.POWERUPS.SONIC_DURATION);
    }
    
    takeDamage() {
        if (this.isInvincible) return;
        
        this.lives--;
        UIManager.updateLives(this.livesDisplay, this.lives);
        this.audioManager.playSound('life-lost');
        
        this.mario.classList.add('hit');
        setTimeout(() => this.mario.classList.remove('hit'), 200);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    // ===== ENTITY CREATION =====
    
    createObstacle() {
        if (this.isPaused) return;
        
        const obstacle = document.createElement('div');
        const enemyType = GameHelpers.getRandomEnemy(this.currentPhase);
        
        obstacle.className = `obstacle ${enemyType}`;
        obstacle.style.background = this.getEnemySprite(enemyType);
        obstacle.style.backgroundSize = 'cover';
        
        const spawnHeight = GameHelpers.getEnemySpawnHeight(enemyType);
        if (spawnHeight > 0) {
            obstacle.style.bottom = spawnHeight + 'px';
        }
        
        obstacle.style.animation = `obstacle-animation ${this.gameSpeed}s linear`;
        this.gameBoard.appendChild(obstacle);
        this.entityManager.addObstacle(obstacle);
        
        setTimeout(() => {
            this.entityManager.removeObstacle(obstacle);
        }, this.gameSpeed * 1000);
    }
    
    createCoin() {
        if (this.isPaused) return;
        
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.style.bottom = (Math.random() > 0.5 ? 120 : 40) + 'px';
        coin.style.animation = `coin-animation ${this.gameSpeed}s linear`;
        
        this.gameBoard.appendChild(coin);
        this.entityManager.addCoin(coin);
        
        setTimeout(() => {
            this.entityManager.removeCoin(coin);
        }, this.gameSpeed * 1000);
    }
    
    createBlock() {
        if (this.isPaused) return;
        
        const block = document.createElement('div');
        block.className = 'question-block';
        block.style.bottom = '150px';
        block.style.animation = `block-animation ${this.gameSpeed + 0.5}s linear`;
        block.dataset.used = 'false';
        
        this.gameBoard.appendChild(block);
        this.entityManager.addBlock(block);
        
        setTimeout(() => {
            this.entityManager.removeBlock(block);
        }, (this.gameSpeed + 0.5) * 1000);
    }
    
    createPowerup(x, y, type) {
        const powerup = document.createElement('div');
        powerup.className = `powerup ${type}`;
        powerup.style.left = x + 'px';
        powerup.style.bottom = y + 'px';
        powerup.style.animation = `powerup-animation ${this.gameSpeed + 0.5}s linear`;
        powerup.dataset.type = type;
        
        this.gameBoard.appendChild(powerup);
        this.entityManager.addPowerup(powerup);
        
        setTimeout(() => {
            this.entityManager.removePowerup(powerup);
        }, (this.gameSpeed + 0.5) * 1000);
    }
    
    getEnemySprite(enemyType) {
        // Import dos sprites (mantém o código original)
        const enemySprites = {
            goomba: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="12" rx="7" ry="4" fill="%23d89050"/><ellipse cx="8" cy="6" rx="6" ry="5" fill="%23a05000"/><circle cx="5" cy="5" r="2" fill="white"/><circle cx="11" cy="5" r="2" fill="white"/><circle cx="5" cy="5" r="1" fill="black"/><circle cx="11" cy="5" r="1" fill="black"/><ellipse cx="5" cy="8" rx="1.5" ry="1" fill="%23603000"/><ellipse cx="11" cy="8" rx="1.5" ry="1" fill="%23603000"/><rect x="3" y="14" width="4" height="2" fill="%23000"/><rect x="9" y="14" width="4" height="2" fill="%23000"/></svg>')`,
            koopa: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><ellipse cx="8" cy="14" rx="6" ry="5" fill="%2300a800"/><ellipse cx="8" cy="13" rx="5" ry="4" fill="%2300c800"/><circle cx="8" cy="6" r="4" fill="%23f8d878"/><circle cx="6" cy="5" r="1.5" fill="white"/><circle cx="10" cy="5" r="1.5" fill="white"/><circle cx="6" cy="5" r="0.7" fill="black"/><circle cx="10" cy="5" r="0.7" fill="black"/><ellipse cx="8" cy="8" rx="2" ry="1" fill="%23e8a800"/><rect x="5" y="17" width="2" height="3" fill="%23f8d878"/><rect x="9" y="17" width="2" height="3" fill="%23f8d878"/></svg>')`,
            pipe: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"><rect x="0" y="0" width="16" height="6" fill="%2300a800"/><rect x="1" y="0" width="2" height="6" fill="%2300e800"/><rect x="2" y="6" width="12" height="18" fill="%2300a800"/><rect x="3" y="6" width="2" height="18" fill="%2300e800"/><rect x="13" y="0" width="2" height="6" fill="%23006800"/><rect x="12" y="6" width="2" height="18" fill="%23006800"/></svg>')`,
            piranha: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"><rect x="2" y="14" width="12" height="10" fill="%2300a800"/><rect x="0" y="12" width="16" height="4" fill="%2300c800"/><circle cx="8" cy="6" r="5" fill="%23e52521"/><circle cx="8" cy="6" r="3" fill="%23ff6b6b"/><ellipse cx="5" cy="4" rx="2" ry="1" fill="white"/><ellipse cx="11" cy="4" rx="2" ry="1" fill="white"/><rect x="6" y="8" width="1" height="3" fill="white"/><rect x="9" y="8" width="1" height="3" fill="white"/><rect x="7" y="10" width="2" height="4" fill="%2300a800"/></svg>')`,
            bat: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16"><ellipse cx="10" cy="10" rx="4" ry="3" fill="%23333"/><circle cx="10" cy="8" r="3" fill="%23444"/><polygon points="2,6 6,10 6,14 2,10" fill="%23333"/><polygon points="18,6 14,10 14,14 18,10" fill="%23333"/><circle cx="8" cy="7" r="1" fill="%23ff0000"/><circle cx="12" cy="7" r="1" fill="%23ff0000"/><polygon points="9,10 10,12 11,10" fill="white"/></svg>')`,
            boo: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="7" ry="7" fill="white"/><ellipse cx="8" cy="9" rx="6" ry="5" fill="%23f8f8f8"/><circle cx="5" cy="6" r="2.5" fill="black"/><circle cx="11" cy="6" r="2.5" fill="black"/><circle cx="5" cy="5.5" r="1" fill="white"/><circle cx="11" cy="5.5" r="1" fill="white"/><ellipse cx="8" cy="11" rx="3" ry="2" fill="%23333"/><polygon points="1,12 4,8 4,14" fill="white"/><polygon points="15,12 12,8 12,14" fill="white"/></svg>')`,
            dryBones: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><ellipse cx="8" cy="14" rx="5" ry="4" fill="%23e8e8e8"/><rect x="6" y="10" width="4" height="6" fill="%23d0d0d0"/><circle cx="8" cy="6" r="4" fill="%23f0f0f0"/><circle cx="6" cy="5" r="1.5" fill="black"/><circle cx="10" cy="5" r="1.5" fill="black"/><rect x="5" y="8" width="6" height="1" fill="%23333"/><rect x="4" y="17" width="3" height="3" fill="%23e8e8e8"/><rect x="9" y="17" width="3" height="3" fill="%23e8e8e8"/></svg>')`,
            fireball: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%23ff4500"/><circle cx="8" cy="8" r="4" fill="%23ff6600"/><circle cx="8" cy="8" r="2" fill="%23ffff00"/><ellipse cx="4" cy="8" rx="3" ry="2" fill="%23ff4500"/><ellipse cx="3" cy="6" rx="2" ry="1.5" fill="%23ff6600"/></svg>')`,
            bulletBill: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12"><ellipse cx="5" cy="6" rx="5" ry="6" fill="%23222"/><rect x="5" y="0" width="12" height="12" fill="%23333"/><rect x="15" y="1" width="3" height="10" fill="%23555"/><circle cx="6" cy="5" r="2" fill="white"/><circle cx="6" cy="5" r="1" fill="black"/><rect x="5" y="10" width="8" height="2" fill="%23111"/></svg>')`,
            cheepCheep: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16"><ellipse cx="10" cy="8" rx="8" ry="6" fill="%23ff6b6b"/><ellipse cx="10" cy="8" rx="6" ry="4" fill="%23ff8787"/><circle cx="6" cy="6" r="2" fill="white"/><circle cx="6" cy="6" r="1" fill="black"/><polygon points="18,8 22,4 22,12" fill="%23ff6b6b"/><polygon points="10,2 12,5 8,5" fill="%23ff4444"/><ellipse cx="14" cy="8" rx="1" ry="2" fill="%23ffaaaa"/></svg>')`,
            blooper: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><ellipse cx="8" cy="6" rx="6" ry="5" fill="white"/><circle cx="5" cy="5" r="2" fill="black"/><circle cx="11" cy="5" r="2" fill="black"/><rect x="3" y="10" width="2" height="8" fill="white"/><rect x="6" y="10" width="2" height="10" fill="white"/><rect x="9" y="10" width="2" height="8" fill="white"/><rect x="12" y="10" width="2" height="6" fill="white"/></svg>')`,
            urchin: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="%23333"/><line x1="8" y1="1" x2="8" y2="4" stroke="%23555" stroke-width="2"/><line x1="8" y1="12" x2="8" y2="15" stroke="%23555" stroke-width="2"/><line x1="1" y1="8" x2="4" y2="8" stroke="%23555" stroke-width="2"/><line x1="12" y1="8" x2="15" y2="8" stroke="%23555" stroke-width="2"/><line x1="3" y1="3" x2="5" y2="5" stroke="%23555" stroke-width="2"/><line x1="11" y1="11" x2="13" y2="13" stroke="%23555" stroke-width="2"/><line x1="3" y1="13" x2="5" y2="11" stroke="%23555" stroke-width="2"/><line x1="11" y1="5" x2="13" y2="3" stroke="%23555" stroke-width="2"/><circle cx="6" cy="7" r="1" fill="white"/><circle cx="10" cy="7" r="1" fill="white"/></svg>')`,
            lakitu: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><ellipse cx="10" cy="16" rx="8" ry="4" fill="white"/><ellipse cx="6" cy="14" rx="4" ry="3" fill="%23f0f0f0"/><ellipse cx="14" cy="14" rx="4" ry="3" fill="%23f0f0f0"/><circle cx="10" cy="8" r="5" fill="%2300a800"/><circle cx="10" cy="7" r="4" fill="%2300c800"/><circle cx="8" cy="6" r="1.5" fill="white"/><circle cx="12" cy="6" r="1.5" fill="white"/><circle cx="8" cy="6" r="0.7" fill="black"/><circle cx="12" cy="6" r="0.7" fill="black"/><ellipse cx="10" cy="3" rx="3" ry="2" fill="%2300a800"/></svg>')`,
            spiny: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="10" rx="6" ry="5" fill="%23e52521"/><polygon points="3,8 5,3 7,8" fill="%23ff0000"/><polygon points="6,7 8,2 10,7" fill="%23ff0000"/><polygon points="9,8 11,3 13,8" fill="%23ff0000"/><circle cx="5" cy="10" r="1.5" fill="white"/><circle cx="11" cy="10" r="1.5" fill="white"/><circle cx="5" cy="10" r="0.7" fill="black"/><circle cx="11" cy="10" r="0.7" fill="black"/><rect x="4" y="14" width="3" height="2" fill="%23f8d878"/><rect x="9" y="14" width="3" height="2" fill="%23f8d878"/></svg>')`,
            parakoopa: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><ellipse cx="10" cy="14" rx="6" ry="5" fill="%23e52521"/><ellipse cx="10" cy="13" rx="5" ry="4" fill="%23ff6b6b"/><circle cx="10" cy="8" r="4" fill="%23f8d878"/><circle cx="8" cy="7" r="1.5" fill="white"/><circle cx="12" cy="7" r="1.5" fill="white"/><circle cx="8" cy="7" r="0.7" fill="black"/><circle cx="12" cy="7" r="0.7" fill="black"/><ellipse cx="4" cy="10" rx="3" ry="5" fill="white"/><ellipse cx="16" cy="10" rx="3" ry="5" fill="white"/></svg>')`
        };
        
        return enemySprites[enemyType] || enemySprites.goomba;
    }
    
    // ===== PHASE SYSTEM =====
    
    updatePhase() {
        const newPhase = GameHelpers.calculatePhase(this.score);
        
        if (newPhase !== this.currentPhase && newPhase <= 5) {
            this.currentPhase = newPhase;
            this.phaseDisplay.textContent = this.currentPhase;
            this.gameBoard.className = `game-board phase-${this.currentPhase}`;
            
            const phaseName = PHASE_DATA[this.currentPhase]?.name || `FASE ${this.currentPhase}`;
            UIManager.showPhaseTransition(this.gameBoard, phaseName);
            
            this.audioManager.playSound('phase');
            
            // Atualizar dificuldade
            this.gameSpeed = GameHelpers.getGameSpeed(this.currentPhase);
            this.minSpawnTime = GameHelpers.getSpawnTime(this.currentPhase);
            
            // Reiniciar spawns com nova dificuldade
            this.setupObstacleSpawning();
        }
    }
    
    increaseDifficulty() {
        if (this.gameSpeed > GAME_CONFIG.DIFFICULTY.MIN_SPEED) {
            this.gameSpeed -= GAME_CONFIG.DIFFICULTY.SPEED_DECREASE;
        }
        
        if (this.minSpawnTime > GAME_CONFIG.DIFFICULTY.MIN_SPAWN_TIME) {
            this.minSpawnTime -= GAME_CONFIG.DIFFICULTY.SPAWN_TIME_DECREASE;
        }
        
        this.setupObstacleSpawning();
    }
    
    // ===== SPAWNING =====
    
    setupObstacleSpawning() {
        this.intervalManager.clear('obstacleSpawn');
        this.intervalManager.set(
            'obstacleSpawn',
            () => this.createObstacle(),
            this.minSpawnTime + Math.random() * GAME_CONFIG.SPAWN.OBSTACLE_RANDOM
        );
    }
    
    // ===== GAME STATE CONTROL =====
    
    startGame() {
        this.startScreen.style.display = 'none';
        this.gameBoard.style.display = 'block';
        this.gameBoard.className = 'game-board phase-1';
        this.isGameRunning = true;
        this.restartGame();
    }
    
    restartGame() {
        // Limpar UI temporária
        UIManager.clearTransients(this.gameBoard);
        
        // Reset Mario
        this.mario.src = this.originalMarioSrc;
        this.mario.style.rotate = '';
        this.mario.style.bottom = '0px';
        this.mario.style.transform = 'scaleX(1)';
        this.mario.classList.remove('invincible', 'sonic-mode');
        this.marioX = GAME_CONFIG.MARIO.INITIAL_X;
        this.mario.style.left = this.marioX + 'px';
        
        // Reset state
        this.isJumping = false;
        this.isPaused = false;
        this.isGameRunning = true;
        this.isInvincible = false;
        this.isSonicMode = false;
        this.movingLeft = false;
        this.movingRight = false;
        
        // Clear timers
        if (this.sonicTimer) {
            clearTimeout(this.sonicTimer);
            this.sonicTimer = null;
        }
        if (this.invincibleTimer) {
            clearTimeout(this.invincibleTimer);
            this.invincibleTimer = null;
        }
        
        // Reset game values
        this.score = 0;
        this.coinCount = 0;
        this.lives = GAME_CONFIG.LIVES.INITIAL;
        this.currentPhase = 1;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.minSpawnTime = GAME_CONFIG.DIFFICULTY.INITIAL_SPAWN_TIME;
        
        // Update UI
        this.scoreElement.textContent = this.score;
        this.coinsDisplay.textContent = this.coinCount;
        this.phaseDisplay.textContent = this.currentPhase;
        this.gameBoard.className = 'game-board phase-1';
        UIManager.updateLives(this.livesDisplay, this.lives);
        
        // Clear all entities
        this.entityManager.clearAll();
        
        // Hide game over UI
        this.gameover.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.menuButton.style.display = 'none';
        this.gameOverScores.style.display = 'none';
        
        // Setup intervals
        this.setupIntervals();
        
        // Start music and game loop
        this.audioManager.startMusic();
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    setupIntervals() {
        this.intervalManager.clearAll();
        
        // Score update
        this.intervalManager.set('scoreUpdate', () => {
            if (!this.isPaused) {
                this.score++;
                this.scoreElement.textContent = this.score;
                this.updatePhase();
            }
        }, GAME_CONFIG.INTERVALS.SCORE_UPDATE);
        
        // Difficulty increase
        this.intervalManager.set('difficultyIncrease', () => {
            if (!this.isPaused) {
                this.increaseDifficulty();
            }
        }, GAME_CONFIG.DIFFICULTY.INCREASE_INTERVAL);
        
        // Spawning
        this.setupObstacleSpawning();
        
        this.intervalManager.set('coinSpawn', () => this.createCoin(),
            GAME_CONFIG.SPAWN.COIN_BASE + Math.random() * GAME_CONFIG.SPAWN.COIN_RANDOM
        );
        
        this.intervalManager.set('blockSpawn', () => this.createBlock(),
            GAME_CONFIG.SPAWN.BLOCK_BASE + Math.random() * GAME_CONFIG.SPAWN.BLOCK_RANDOM
        );
    }
    
    togglePause() {
        if (!this.isGameRunning) return;
        
        this.isPaused = !this.isPaused;
        this.pauseScreen.style.display = this.isPaused ? 'block' : 'none';
        
        if (this.isPaused) {
            this.entityManager.pauseAll();
            document.querySelectorAll('.parallax-bg').forEach(bg => {
                bg.style.animationPlayState = 'paused';
            });
        } else {
            this.entityManager.resumeAll();
            document.querySelectorAll('.parallax-bg').forEach(bg => {
                bg.style.animationPlayState = 'running';
            });
        }
    }
    
    gameOver() {
        this.isGameRunning = false;
        this.audioManager.stopMusic();
        
        // Congelar todas as entidades
        this.entityManager.freezeAll();
        
        // Calcular score final
        const finalScore = this.score + (this.coinCount * GAME_CONFIG.SCORES.COIN);
        
        // Verificar e salvar high score
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            StorageManager.setHighScore(this.highScore);
            this.highScoreElement.textContent = this.highScore;
            this.menuHighScoreElement.textContent = this.highScore;
            UIManager.showNewRecord(this.gameBoard);
        }
        
        // Mostrar UI de game over
        this.gameover.src = './imagens/gameoverfundo.png';
        this.gameover.style.display = 'block';
        this.restartButton.style.display = 'block';
        this.menuButton.style.display = 'block';
        this.finalScoreElement.textContent = finalScore;
        this.finalCoinsElement.textContent = this.coinCount;
        this.finalHighScoreElement.textContent = this.highScore;
        this.gameOverScores.style.display = 'block';
        this.mario.style.rotate = "-25deg";
        
        this.audioManager.playSound('gameover');
        
        // Parar todos os intervals
        this.intervalManager.clearAll();
        
        // Cancelar animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    goToMenu() {
        this.isGameRunning = false;
        this.isPaused = false;
        this.audioManager.stopMusic();
        
        // Limpar tudo
        this.intervalManager.clearAll();
        this.entityManager.clearAll();
        UIManager.clearTransients(this.gameBoard);
        
        // Cancelar animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Esconder game UI
        this.gameBoard.style.display = 'none';
        this.pauseScreen.style.display = 'none';
        this.gameover.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.menuButton.style.display = 'none';
        this.gameOverScores.style.display = 'none';
        
        // Mostrar menu
        this.startScreen.style.display = 'block';
        this.menuHighScoreElement.textContent = this.highScore;
    }
}

// ===== INICIAR O JOGO =====
let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new MarioGame();
});
