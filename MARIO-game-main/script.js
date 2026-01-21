// ===== ELEMENTOS DOM =====
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameBoard = document.getElementById('game-board');
const mario = document.querySelector('.mario');
const gameover = document.querySelector('.game-over-message');
const restartButton = document.querySelector('.restart-button');
const menuButton = document.querySelector('.menu-button');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const menuHighScoreElement = document.getElementById('menu-high-score');
const finalScoreElement = document.getElementById('final-score');
const finalCoinsElement = document.getElementById('final-coins');
const finalHighScoreElement = document.getElementById('final-high-score');
const gameOverScores = document.querySelector('.game-over-scores');
const soundToggle = document.getElementById('sound-toggle');
const pauseButton = document.getElementById('pause-button');
const startButton = document.getElementById('start-button');
const resumeButton = document.getElementById('resume-button');
const quitButton = document.getElementById('quit-button');
const livesDisplay = document.getElementById('lives-display');
const coinsDisplay = document.getElementById('coins');
const phaseDisplay = document.getElementById('phase');

// ===== VARIÁVEIS DO JOGO =====
let loop;
let spawnInterval;
let coinSpawnInterval;
let blockSpawnInterval;
let powerupSpawnInterval;
let scoreInterval;
let difficultyInterval;
let obstacles = [];
let coins = [];
let blocks = [];
let powerups = [];
let score = 0;
let coinCount = 0;
let lives = 3;
let currentPhase = 1;
let highScore = localStorage.getItem('marioGameHighScore') || 0;
let isJumping = false;
let isPaused = false;
let isGameRunning = false;
let isInvincible = false;
let invincibleTimer = null;
let isSonicMode = false;
let sonicTimer = null;
let originalMarioSrc = './imagens/mario.gif';
let soundEnabled = true;
let musicEnabled = true;
let gameSpeed = 2.5;
let minSpawnTime = 2000;

// Posição do Mario
let marioX = 50;
const marioSpeed = 6;
let movingLeft = false;
let movingRight = false;

// Atualizar high score nos menus
highScoreElement.textContent = highScore;
menuHighScoreElement.textContent = highScore;

// ===== SISTEMA DE ÁUDIO =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Música tema COMPLETA do Super Mario Bros
const marioMelody = [
    { note: 659, duration: 125 }, { note: 659, duration: 125 }, { note: 0, duration: 125 },
    { note: 659, duration: 125 }, { note: 0, duration: 125 }, { note: 523, duration: 125 },
    { note: 659, duration: 125 }, { note: 0, duration: 125 }, { note: 784, duration: 250 },
    { note: 0, duration: 250 }, { note: 392, duration: 250 }, { note: 0, duration: 250 },
    { note: 523, duration: 187 }, { note: 0, duration: 62 }, { note: 392, duration: 187 },
    { note: 0, duration: 62 }, { note: 330, duration: 187 }, { note: 0, duration: 62 },
    { note: 440, duration: 125 }, { note: 0, duration: 62 }, { note: 494, duration: 125 },
    { note: 0, duration: 62 }, { note: 466, duration: 125 }, { note: 440, duration: 125 },
    { note: 0, duration: 62 }, { note: 392, duration: 125 }, { note: 659, duration: 125 },
    { note: 784, duration: 125 }, { note: 880, duration: 125 }, { note: 0, duration: 62 },
    { note: 698, duration: 125 }, { note: 784, duration: 125 }, { note: 0, duration: 62 },
    { note: 659, duration: 125 }, { note: 0, duration: 62 }, { note: 523, duration: 125 },
    { note: 587, duration: 125 }, { note: 494, duration: 125 }, { note: 0, duration: 187 },
    { note: 784, duration: 125 }, { note: 740, duration: 125 }, { note: 698, duration: 125 },
    { note: 622, duration: 125 }, { note: 0, duration: 62 }, { note: 659, duration: 125 },
    { note: 0, duration: 62 }, { note: 415, duration: 125 }, { note: 440, duration: 125 },
    { note: 523, duration: 125 }, { note: 0, duration: 62 }, { note: 440, duration: 125 },
    { note: 523, duration: 125 }, { note: 587, duration: 125 }, { note: 0, duration: 187 },
    { note: 784, duration: 125 }, { note: 740, duration: 125 }, { note: 698, duration: 125 },
    { note: 622, duration: 125 }, { note: 0, duration: 62 }, { note: 659, duration: 125 },
    { note: 0, duration: 62 }, { note: 1047, duration: 125 }, { note: 0, duration: 62 },
    { note: 1047, duration: 125 }, { note: 1047, duration: 125 }, { note: 0, duration: 375 },
];

// Música tema do Sonic - Green Hill Zone
const sonicMelody = [
    { note: 659, duration: 100 }, { note: 659, duration: 100 }, { note: 659, duration: 100 },
    { note: 523, duration: 100 }, { note: 659, duration: 200 }, { note: 784, duration: 200 },
    { note: 0, duration: 100 }, { note: 659, duration: 100 }, { note: 784, duration: 100 },
    { note: 880, duration: 200 }, { note: 784, duration: 100 }, { note: 659, duration: 100 },
    { note: 523, duration: 200 }, { note: 587, duration: 100 }, { note: 659, duration: 200 },
    { note: 0, duration: 100 }, { note: 880, duration: 100 }, { note: 988, duration: 100 },
    { note: 1047, duration: 200 }, { note: 988, duration: 100 }, { note: 880, duration: 100 },
    { note: 784, duration: 200 }, { note: 659, duration: 100 }, { note: 784, duration: 100 },
    { note: 880, duration: 200 }, { note: 0, duration: 100 }, { note: 659, duration: 100 },
    { note: 784, duration: 100 }, { note: 880, duration: 100 }, { note: 1047, duration: 200 },
    { note: 988, duration: 100 }, { note: 880, duration: 100 }, { note: 784, duration: 200 },
    { note: 659, duration: 200 }, { note: 0, duration: 200 },
];

let melodyIndex = 0;
let melodyTimeout = null;
let currentMelody = marioMelody;

function playMelodyNote() {
    if (!musicEnabled || !isGameRunning || isPaused) {
        melodyTimeout = setTimeout(playMelodyNote, 100);
        return;
    }
    const noteData = currentMelody[melodyIndex];
    if (noteData.note > 0) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = isSonicMode ? 'sawtooth' : 'square';
        oscillator.frequency.setValueAtTime(noteData.note, audioContext.currentTime);
        gainNode.gain.setValueAtTime(isSonicMode ? 0.08 : 0.06, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteData.duration / 1000);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + noteData.duration / 1000);
    }
    melodyIndex = (melodyIndex + 1) % currentMelody.length;
    const speed = isSonicMode ? noteData.duration * 0.7 : noteData.duration;
    melodyTimeout = setTimeout(playMelodyNote, speed);
}

function startMusic() {
    if (melodyTimeout) clearTimeout(melodyTimeout);
    melodyIndex = 0;
    playMelodyNote();
}

function stopMusic() {
    if (melodyTimeout) { clearTimeout(melodyTimeout); melodyTimeout = null; }
}

function switchToSonicMusic() {
    currentMelody = sonicMelody;
    melodyIndex = 0;
}

function switchToMarioMusic() {
    currentMelody = marioMelody;
    melodyIndex = 0;
}

function playSound(type) {
    if (!soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds = {
        jump: { freq: [400, 800], dur: 0.15, type: 'square', vol: 0.12 },
        stomp: { freq: [200, 400], dur: 0.1, type: 'square', vol: 0.15 },
        coin: { freq: [988, 1319], dur: 0.15, type: 'square', vol: 0.12 },
        powerup: { freq: [523, 659, 784, 1047], dur: 0.4, type: 'square', vol: 0.12 },
        'life-lost': { freq: [400, 100], dur: 0.3, type: 'triangle', vol: 0.15 },
        gameover: { freq: [300, 100], dur: 0.5, type: 'sawtooth', vol: 0.15 },
        block: { freq: [600, 800], dur: 0.1, type: 'square', vol: 0.1 },
        '1up': { freq: [523, 659, 784, 1047, 1319], dur: 0.5, type: 'square', vol: 0.12 },
        phase: { freq: [523, 659, 784, 1047], dur: 0.6, type: 'square', vol: 0.15 },
        sonic: { freq: [784, 988, 1175, 1397, 1568], dur: 0.4, type: 'square', vol: 0.15 },
    };

    const s = sounds[type];
    if (!s) return;

    oscillator.type = s.type;
    oscillator.frequency.setValueAtTime(s.freq[0], audioContext.currentTime);
    if (s.freq.length > 1) {
        s.freq.forEach((f, i) => {
            if (i > 0) oscillator.frequency.setValueAtTime(f, audioContext.currentTime + (s.dur / s.freq.length) * i);
        });
    }
    gainNode.gain.setValueAtTime(s.vol, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + s.dur);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + s.dur);
}

// ===== CONTROLES DE ÁUDIO =====
soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    musicEnabled = !musicEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
});

// ===== NOMES DAS FASES =====
const phaseNames = {
    1: '🌳 MUNDO VERDE',
    2: '🪨 CAVERNA',
    3: '🏰 CASTELO',
    4: '🌊 OCEANO',
    5: '☁️ CÉU'
};

// ===== SISTEMA DE FASES =====
function updatePhase() {
    const newPhase = Math.floor(score / 400) + 1;
    if (newPhase !== currentPhase && newPhase <= 5) {
        currentPhase = newPhase;
        phaseDisplay.textContent = currentPhase;
        gameBoard.className = `game-board phase-${currentPhase}`;

        // Mostrar transição de fase
        const phaseText = document.createElement('div');
        phaseText.className = 'phase-transition';
        phaseText.textContent = phaseNames[currentPhase] || `FASE ${currentPhase}`;
        gameBoard.appendChild(phaseText);
        setTimeout(() => phaseText.remove(), 2000);

        playSound('phase');

        // Aumentar dificuldade por fase
        gameSpeed = Math.max(1.2, 2.5 - (currentPhase * 0.25));
        minSpawnTime = Math.max(1000, 2000 - (currentPhase * 180));
    }
}

// ===== MOVIMENTO DO MARIO =====
const updateMarioPosition = () => {
    if (!isGameRunning || isPaused) return;
    const currentSpeed = window.sonicSpeed || marioSpeed;
    if (movingLeft && marioX > 10) {
        marioX -= currentSpeed;
        mario.style.transform = 'scaleX(-1)';
    }
    if (movingRight && marioX < gameBoard.offsetWidth - 60) {
        marioX += currentSpeed;
        mario.style.transform = 'scaleX(1)';
    }
    mario.style.left = marioX + 'px';
}
setInterval(updateMarioPosition, 16);

// ===== FUNÇÃO DE PULO =====
const jump = () => {
    if (isJumping || !isGameRunning || isPaused) return;
    isJumping = true;
    mario.classList.add('jump');
    playSound('jump');
    setTimeout(() => { mario.classList.remove('jump'); isJumping = false; }, 500);
}

// ===== MOSTRAR POPUP DE PONTOS =====
function showScorePopup(x, y, points, color = '#fbd000') {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points}`;
    popup.style.left = x + 'px';
    popup.style.bottom = y + 'px';
    popup.style.color = color;
    gameBoard.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

// ===== SPRITES DOS INIMIGOS =====
const enemySprites = {
    // Inimigos básicos (todas as fases)
    goomba: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="12" rx="7" ry="4" fill="%23d89050"/><ellipse cx="8" cy="6" rx="6" ry="5" fill="%23a05000"/><circle cx="5" cy="5" r="2" fill="white"/><circle cx="11" cy="5" r="2" fill="white"/><circle cx="5" cy="5" r="1" fill="black"/><circle cx="11" cy="5" r="1" fill="black"/><ellipse cx="5" cy="8" rx="1.5" ry="1" fill="%23603000"/><ellipse cx="11" cy="8" rx="1.5" ry="1" fill="%23603000"/><rect x="3" y="14" width="4" height="2" fill="%23000"/><rect x="9" y="14" width="4" height="2" fill="%23000"/></svg>')`,
    koopa: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><ellipse cx="8" cy="14" rx="6" ry="5" fill="%2300a800"/><ellipse cx="8" cy="13" rx="5" ry="4" fill="%2300c800"/><circle cx="8" cy="6" r="4" fill="%23f8d878"/><circle cx="6" cy="5" r="1.5" fill="white"/><circle cx="10" cy="5" r="1.5" fill="white"/><circle cx="6" cy="5" r="0.7" fill="black"/><circle cx="10" cy="5" r="0.7" fill="black"/><ellipse cx="8" cy="8" rx="2" ry="1" fill="%23e8a800"/><rect x="5" y="17" width="2" height="3" fill="%23f8d878"/><rect x="9" y="17" width="2" height="3" fill="%23f8d878"/></svg>')`,
    pipe: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"><rect x="0" y="0" width="16" height="6" fill="%2300a800"/><rect x="1" y="0" width="2" height="6" fill="%2300e800"/><rect x="2" y="6" width="12" height="18" fill="%2300a800"/><rect x="3" y="6" width="2" height="18" fill="%2300e800"/><rect x="13" y="0" width="2" height="6" fill="%23006800"/><rect x="12" y="6" width="2" height="18" fill="%23006800"/></svg>')`,
    piranha: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"><rect x="2" y="14" width="12" height="10" fill="%2300a800"/><rect x="0" y="12" width="16" height="4" fill="%2300c800"/><circle cx="8" cy="6" r="5" fill="%23e52521"/><circle cx="8" cy="6" r="3" fill="%23ff6b6b"/><ellipse cx="5" cy="4" rx="2" ry="1" fill="white"/><ellipse cx="11" cy="4" rx="2" ry="1" fill="white"/><rect x="6" y="8" width="1" height="3" fill="white"/><rect x="9" y="8" width="1" height="3" fill="white"/><rect x="7" y="10" width="2" height="4" fill="%2300a800"/></svg>')`,

    // Fase 2 - Caverna
    bat: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16"><ellipse cx="10" cy="10" rx="4" ry="3" fill="%23333"/><circle cx="10" cy="8" r="3" fill="%23444"/><polygon points="2,6 6,10 6,14 2,10" fill="%23333"/><polygon points="18,6 14,10 14,14 18,10" fill="%23333"/><circle cx="8" cy="7" r="1" fill="%23ff0000"/><circle cx="12" cy="7" r="1" fill="%23ff0000"/><polygon points="9,10 10,12 11,10" fill="white"/></svg>')`,
    boo: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="7" ry="7" fill="white"/><ellipse cx="8" cy="9" rx="6" ry="5" fill="%23f8f8f8"/><circle cx="5" cy="6" r="2.5" fill="black"/><circle cx="11" cy="6" r="2.5" fill="black"/><circle cx="5" cy="5.5" r="1" fill="white"/><circle cx="11" cy="5.5" r="1" fill="white"/><ellipse cx="8" cy="11" rx="3" ry="2" fill="%23333"/><polygon points="1,12 4,8 4,14" fill="white"/><polygon points="15,12 12,8 12,14" fill="white"/></svg>')`,

    // Fase 3 - Castelo
    dryBones: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><ellipse cx="8" cy="14" rx="5" ry="4" fill="%23e8e8e8"/><rect x="6" y="10" width="4" height="6" fill="%23d0d0d0"/><circle cx="8" cy="6" r="4" fill="%23f0f0f0"/><circle cx="6" cy="5" r="1.5" fill="black"/><circle cx="10" cy="5" r="1.5" fill="black"/><rect x="5" y="8" width="6" height="1" fill="%23333"/><rect x="4" y="17" width="3" height="3" fill="%23e8e8e8"/><rect x="9" y="17" width="3" height="3" fill="%23e8e8e8"/></svg>')`,
    fireball: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%23ff4500"/><circle cx="8" cy="8" r="4" fill="%23ff6600"/><circle cx="8" cy="8" r="2" fill="%23ffff00"/><ellipse cx="4" cy="8" rx="3" ry="2" fill="%23ff4500"/><ellipse cx="3" cy="6" rx="2" ry="1.5" fill="%23ff6600"/></svg>')`,
    bulletBill: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12"><ellipse cx="5" cy="6" rx="5" ry="6" fill="%23222"/><rect x="5" y="0" width="12" height="12" fill="%23333"/><rect x="15" y="1" width="3" height="10" fill="%23555"/><circle cx="6" cy="5" r="2" fill="white"/><circle cx="6" cy="5" r="1" fill="black"/><rect x="5" y="10" width="8" height="2" fill="%23111"/></svg>')`,

    // Fase 4 - Oceano
    cheepCheep: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16"><ellipse cx="10" cy="8" rx="8" ry="6" fill="%23ff6b6b"/><ellipse cx="10" cy="8" rx="6" ry="4" fill="%23ff8787"/><circle cx="6" cy="6" r="2" fill="white"/><circle cx="6" cy="6" r="1" fill="black"/><polygon points="18,8 22,4 22,12" fill="%23ff6b6b"/><polygon points="10,2 12,5 8,5" fill="%23ff4444"/><ellipse cx="14" cy="8" rx="1" ry="2" fill="%23ffaaaa"/></svg>')`,
    blooper: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><ellipse cx="8" cy="6" rx="6" ry="5" fill="white"/><circle cx="5" cy="5" r="2" fill="black"/><circle cx="11" cy="5" r="2" fill="black"/><rect x="3" y="10" width="2" height="8" fill="white"/><rect x="6" y="10" width="2" height="10" fill="white"/><rect x="9" y="10" width="2" height="8" fill="white"/><rect x="12" y="10" width="2" height="6" fill="white"/></svg>')`,
    urchin: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="%23333"/><line x1="8" y1="1" x2="8" y2="4" stroke="%23555" stroke-width="2"/><line x1="8" y1="12" x2="8" y2="15" stroke="%23555" stroke-width="2"/><line x1="1" y1="8" x2="4" y2="8" stroke="%23555" stroke-width="2"/><line x1="12" y1="8" x2="15" y2="8" stroke="%23555" stroke-width="2"/><line x1="3" y1="3" x2="5" y2="5" stroke="%23555" stroke-width="2"/><line x1="11" y1="11" x2="13" y2="13" stroke="%23555" stroke-width="2"/><line x1="3" y1="13" x2="5" y2="11" stroke="%23555" stroke-width="2"/><line x1="11" y1="5" x2="13" y2="3" stroke="%23555" stroke-width="2"/><circle cx="6" cy="7" r="1" fill="white"/><circle cx="10" cy="7" r="1" fill="white"/></svg>')`,

    // Fase 5 - Céu
    lakitu: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><ellipse cx="10" cy="16" rx="8" ry="4" fill="white"/><ellipse cx="6" cy="14" rx="4" ry="3" fill="%23f0f0f0"/><ellipse cx="14" cy="14" rx="4" ry="3" fill="%23f0f0f0"/><circle cx="10" cy="8" r="5" fill="%2300a800"/><circle cx="10" cy="7" r="4" fill="%2300c800"/><circle cx="8" cy="6" r="1.5" fill="white"/><circle cx="12" cy="6" r="1.5" fill="white"/><circle cx="8" cy="6" r="0.7" fill="black"/><circle cx="12" cy="6" r="0.7" fill="black"/><ellipse cx="10" cy="3" rx="3" ry="2" fill="%2300a800"/></svg>')`,
    spiny: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="10" rx="6" ry="5" fill="%23e52521"/><polygon points="3,8 5,3 7,8" fill="%23ff0000"/><polygon points="6,7 8,2 10,7" fill="%23ff0000"/><polygon points="9,8 11,3 13,8" fill="%23ff0000"/><circle cx="5" cy="10" r="1.5" fill="white"/><circle cx="11" cy="10" r="1.5" fill="white"/><circle cx="5" cy="10" r="0.7" fill="black"/><circle cx="11" cy="10" r="0.7" fill="black"/><rect x="4" y="14" width="3" height="2" fill="%23f8d878"/><rect x="9" y="14" width="3" height="2" fill="%23f8d878"/></svg>')`,
    parakoopa: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><ellipse cx="10" cy="14" rx="6" ry="5" fill="%23e52521"/><ellipse cx="10" cy="13" rx="5" ry="4" fill="%23ff6b6b"/><circle cx="10" cy="8" r="4" fill="%23f8d878"/><circle cx="8" cy="7" r="1.5" fill="white"/><circle cx="12" cy="7" r="1.5" fill="white"/><circle cx="8" cy="7" r="0.7" fill="black"/><circle cx="12" cy="7" r="0.7" fill="black"/><ellipse cx="4" cy="10" rx="3" ry="5" fill="white"/><ellipse cx="16" cy="10" rx="3" ry="5" fill="white"/></svg>')`
};

// ===== INIMIGOS POR FASE =====
const phaseEnemies = {
    1: ['goomba', 'koopa', 'pipe', 'piranha'],
    2: ['goomba', 'bat', 'boo', 'pipe'],
    3: ['dryBones', 'fireball', 'bulletBill', 'piranha'],
    4: ['cheepCheep', 'blooper', 'urchin', 'pipe'],
    5: ['lakitu', 'spiny', 'parakoopa', 'bulletBill']
};

// ===== CRIAR OBSTÁCULO =====
const createObstacle = () => {
    if (isPaused) return;
    const obstacle = document.createElement('div');

    // Selecionar inimigo baseado na fase atual
    const enemies = phaseEnemies[currentPhase] || phaseEnemies[1];
    const enemyType = enemies[Math.floor(Math.random() * enemies.length)];

    obstacle.className = `obstacle ${enemyType}`;
    obstacle.style.background = enemySprites[enemyType];
    obstacle.style.backgroundSize = 'cover';

    // Configurações especiais por tipo de inimigo
    switch(enemyType) {
        case 'bat':
        case 'boo':
            obstacle.style.bottom = (60 + Math.random() * 120) + 'px';
            break;
        case 'bulletBill':
        case 'fireball':
            obstacle.style.bottom = (80 + Math.random() * 100) + 'px';
            break;
        case 'cheepCheep':
        case 'blooper':
            obstacle.style.bottom = (40 + Math.random() * 140) + 'px';
            break;
        case 'lakitu':
            obstacle.style.bottom = (150 + Math.random() * 80) + 'px';
            break;
        case 'parakoopa':
            obstacle.style.bottom = (100 + Math.random() * 100) + 'px';
            break;
    }

    obstacle.style.animation = `obstacle-animation ${gameSpeed}s linear`;
    gameBoard.appendChild(obstacle);
    obstacles.push(obstacle);

    setTimeout(() => {
        if (obstacle.parentNode) { obstacle.remove(); obstacles = obstacles.filter(o => o !== obstacle); }
    }, gameSpeed * 1000);
}

// ===== CRIAR MOEDA =====
const createCoin = () => {
    if (isPaused) return;
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.bottom = (Math.random() > 0.5 ? 120 : 40) + 'px';
    coin.style.animation = `coin-animation ${gameSpeed}s linear`;
    gameBoard.appendChild(coin);
    coins.push(coin);
    setTimeout(() => {
        if (coin.parentNode) { coin.remove(); coins = coins.filter(c => c !== coin); }
    }, gameSpeed * 1000);
}

// ===== CRIAR BLOCO DE INTERROGAÇÃO =====
const createBlock = () => {
    if (isPaused) return;
    const block = document.createElement('div');
    block.className = 'question-block';
    block.style.bottom = '150px';
    block.style.animation = `block-animation ${gameSpeed + 0.5}s linear`;
    block.dataset.used = 'false';
    gameBoard.appendChild(block);
    blocks.push(block);
    setTimeout(() => {
        if (block.parentNode) { block.remove(); blocks = blocks.filter(b => b !== block); }
    }, (gameSpeed + 0.5) * 1000);
}

// ===== CRIAR POWER-UP =====
const createPowerup = (x, y, type) => {
    const powerup = document.createElement('div');
    powerup.className = `powerup ${type}`;
    powerup.style.left = x + 'px';
    powerup.style.bottom = y + 'px';
    powerup.style.animation = `powerup-animation ${gameSpeed + 0.5}s linear`;
    powerup.dataset.type = type;
    gameBoard.appendChild(powerup);
    powerups.push(powerup);
    setTimeout(() => {
        if (powerup.parentNode) { powerup.remove(); powerups = powerups.filter(p => p !== powerup); }
    }, (gameSpeed + 0.5) * 1000);
}

// ===== ATUALIZAR VIDAS =====
const updateLivesDisplay = () => {
    livesDisplay.textContent = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));
}

// ===== ATIVAR INVENCIBILIDADE =====
const activateInvincibility = () => {
    isInvincible = true;
    mario.classList.add('invincible');
    if (invincibleTimer) clearTimeout(invincibleTimer);
    invincibleTimer = setTimeout(() => {
        isInvincible = false;
        mario.classList.remove('invincible');
    }, 8000);
}

// ===== ATIVAR MODO SONIC =====
const activateSonicMode = () => {
    isSonicMode = true;
    isInvincible = true;
    mario.src = './imagens/sonic.gif';
    mario.classList.add('sonic-mode');
    mario.classList.remove('invincible');

    // Trocar para música do Sonic
    switchToSonicMusic();

    // Sonic é mais rápido!
    window.sonicSpeed = 12;

    if (sonicTimer) clearTimeout(sonicTimer);
    sonicTimer = setTimeout(() => {
        isSonicMode = false;
        isInvincible = false;
        mario.src = originalMarioSrc;
        mario.classList.remove('sonic-mode');
        window.sonicSpeed = null;
        // Voltar para música do Mario
        switchToMarioMusic();
    }, 10000); // 10 segundos de Sonic
}

// ===== TOMAR DANO =====
const takeDamage = () => {
    if (isInvincible) return;
    lives--;
    updateLivesDisplay();
    playSound('life-lost');
    mario.classList.add('hit');
    setTimeout(() => mario.classList.remove('hit'), 200);
    if (lives <= 0) gameOver();
}

// ===== AUMENTAR DIFICULDADE =====
const increaseDifficulty = () => {
    if (gameSpeed > 1.2) gameSpeed -= 0.05;
    if (minSpawnTime > 1000) minSpawnTime -= 30;
    clearInterval(spawnInterval);
    spawnInterval = setInterval(createObstacle, minSpawnTime + Math.random() * 500);
}

// ===== GAME OVER =====
const gameOver = () => {
    isGameRunning = false;
    stopMusic();

    [...obstacles, ...coins, ...blocks, ...powerups].forEach(el => {
        el.style.animation = 'none';
        el.style.left = `${el.offsetLeft}px`;
    });

    const finalScore = score + (coinCount * 10);
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('marioGameHighScore', highScore);
        highScoreElement.textContent = highScore;
        menuHighScoreElement.textContent = highScore;
        const newRecordDiv = document.createElement('div');
        newRecordDiv.className = 'new-record';
        newRecordDiv.textContent = '🏆 NOVO RECORDE! 🏆';
        gameBoard.appendChild(newRecordDiv);
    }

    gameover.src = './imagens/gameoverfundo.png';
    gameover.style.display = 'block';
    restartButton.style.display = 'block';
    menuButton.style.display = 'block';
    finalScoreElement.textContent = finalScore;
    finalCoinsElement.textContent = coinCount;
    finalHighScoreElement.textContent = highScore;
    gameOverScores.style.display = 'block';
    mario.style.rotate = "-25deg";
    playSound('gameover');

    [loop, spawnInterval, coinSpawnInterval, blockSpawnInterval, powerupSpawnInterval, scoreInterval, difficultyInterval]
        .forEach(i => clearInterval(i));
}

// ===== INICIAR JOGO =====
const startGame = () => {
    startScreen.style.display = 'none';
    gameBoard.style.display = 'block';
    gameBoard.className = 'game-board phase-1';
    isGameRunning = true;
    restartGame();
    startMusic();
}

// ===== REINICIAR JOGO =====
const restartGame = () => {
    document.querySelectorAll('.new-record, .phase-transition, .score-popup').forEach(el => el.remove());

    mario.src = './imagens/mario.gif';
    mario.style.rotate = '';
    mario.style.bottom = '0px';
    mario.style.transform = 'scaleX(1)';
    mario.classList.remove('invincible');
    mario.classList.remove('sonic-mode');
    isSonicMode = false;
    window.sonicSpeed = null;
    if (sonicTimer) { clearTimeout(sonicTimer); sonicTimer = null; }
    marioX = 50;
    mario.style.left = marioX + 'px';
    isJumping = false;
    isPaused = false;
    isGameRunning = true;
    isInvincible = false;
    movingLeft = false;
    movingRight = false;

    score = 0;
    coinCount = 0;
    lives = 3;
    currentPhase = 1;
    gameSpeed = 2.5;
    minSpawnTime = 2000;
    scoreElement.textContent = score;
    coinsDisplay.textContent = coinCount;
    phaseDisplay.textContent = currentPhase;
    gameBoard.className = 'game-board phase-1';
    updateLivesDisplay();

    [...obstacles, ...coins, ...blocks, ...powerups].forEach(el => el.remove());
    obstacles = []; coins = []; blocks = []; powerups = [];

    gameover.style.display = 'none';
    restartButton.style.display = 'none';
    menuButton.style.display = 'none';
    gameOverScores.style.display = 'none';

    scoreInterval = setInterval(() => {
        if (!isPaused) {
            score++;
            scoreElement.textContent = score;
            updatePhase();
        }
    }, 100);

    difficultyInterval = setInterval(() => { if (!isPaused) increaseDifficulty(); }, 8000);

    // Loop principal
    loop = setInterval(() => {
        if (isPaused) return;

        const marioBottom = +window.getComputedStyle(mario).bottom.replace('px', '');
        const marioLeft = mario.offsetLeft + 15;
        const marioRight = marioLeft + mario.offsetWidth - 30;
        const marioTop = marioBottom + mario.offsetHeight;

        // Colisão com moedas
        coins.forEach(coin => {
            const coinLeft = coin.offsetLeft;
            const coinRight = coinLeft + coin.offsetWidth;
            const coinBottom = +window.getComputedStyle(coin).bottom.replace('px', '');
            const coinTop = coinBottom + coin.offsetHeight;

            if (marioRight > coinLeft && marioLeft < coinRight && marioBottom < coinTop && marioTop > coinBottom) {
                coinCount++;
                coinsDisplay.textContent = coinCount;
                showScorePopup(coinLeft, coinBottom + 50, 10);
                playSound('coin');
                coin.remove();
                coins = coins.filter(c => c !== coin);
            }
        });

        // Colisão com blocos (bater de baixo)
        blocks.forEach(block => {
            if (block.dataset.used === 'true') return;
            const blockLeft = block.offsetLeft;
            const blockRight = blockLeft + block.offsetWidth;
            const blockBottom = +window.getComputedStyle(block).bottom.replace('px', '');

            if (marioRight > blockLeft && marioLeft < blockRight && marioTop >= blockBottom && marioTop <= blockBottom + 30 && marioBottom < blockBottom) {
                block.dataset.used = 'true';
                block.classList.add('used');
                playSound('block');

                // Spawn power-up ou moedas
                const rand = Math.random();
                if (rand < 0.2) {
                    createPowerup(blockLeft, blockBottom + 60, 'mushroom');
                } else if (rand < 0.35) {
                    createPowerup(blockLeft, blockBottom + 60, 'star');
                } else if (rand < 0.5) {
                    createPowerup(blockLeft, blockBottom + 60, 'sonic');
                } else {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => showScorePopup(blockLeft + i*20, blockBottom + 80, 10), i * 100);
                    }
                    coinCount += 3;
                    coinsDisplay.textContent = coinCount;
                }
            }
        });

        // Colisão com power-ups
        powerups.forEach(powerup => {
            const pLeft = powerup.offsetLeft;
            const pRight = pLeft + powerup.offsetWidth;
            const pBottom = +window.getComputedStyle(powerup).bottom.replace('px', '');
            const pTop = pBottom + powerup.offsetHeight;

            if (marioRight > pLeft && marioLeft < pRight && marioBottom < pTop && marioTop > pBottom) {
                const type = powerup.dataset.type;
                if (type === 'mushroom') {
                    if (lives < 5) { lives++; updateLivesDisplay(); }
                    showScorePopup(pLeft, pBottom + 50, '1UP', '#00ff00');
                    playSound('1up');
                } else if (type === 'star') {
                    activateInvincibility();
                    showScorePopup(pLeft, pBottom + 50, '⭐', '#fbd000');
                    playSound('powerup');
                } else if (type === 'sonic') {
                    activateSonicMode();
                    showScorePopup(pLeft, pBottom + 50, '⚡SONIC!', '#00aaff');
                    playSound('sonic');
                }
                powerup.remove();
                powerups = powerups.filter(p => p !== powerup);
            }
        });

        // Colisão com obstáculos
        obstacles.forEach(obstacle => {
            if (obstacle.classList.contains('dead')) return;

            const obsLeft = obstacle.offsetLeft + 10;
            const obsRight = obsLeft + obstacle.offsetWidth - 20;

            // Altura varia por tipo de obstáculo
            let obsHeight = 80;
            let obsBottom = 0;
            if (obstacle.classList.contains('pipe')) obsHeight = 120;
            if (obstacle.classList.contains('piranha')) obsHeight = 120;
            if (obstacle.classList.contains('bullet-bill')) {
                obsBottom = +window.getComputedStyle(obstacle).bottom.replace('px', '');
                obsHeight = 60;
            }

            // Verificar se pode ser pisado
            const canStomp = obstacle.classList.contains('goomba') ||
                           obstacle.classList.contains('koopa');

            // Inimigos que não podem ser pisados (causam dano sempre)
            const dangerous = obstacle.classList.contains('spiny') ||
                            obstacle.classList.contains('piranha');

            if (marioRight > obsLeft && marioLeft < obsRight) {
                // Para bullet bill, verificar colisão na altura certa
                if (obstacle.classList.contains('bullet-bill')) {
                    const bulletTop = obsBottom + obsHeight;
                    if (marioBottom < bulletTop && marioTop > obsBottom) {
                        if (isSonicMode) {
                            // Sonic destrói o bullet bill
                            obstacle.classList.add('dead');
                            score += 200;
                            scoreElement.textContent = score;
                            showScorePopup(obsLeft, obsBottom + 50, 200, '#00aaff');
                            playSound('stomp');
                            setTimeout(() => {
                                obstacle.remove();
                                obstacles = obstacles.filter(o => o !== obstacle);
                            }, 200);
                        } else {
                            takeDamage();
                            obstacle.remove();
                            obstacles = obstacles.filter(o => o !== obstacle);
                        }
                    }
                    return;
                }

                // Verificar se está caindo em cima de inimigo que pode ser pisado
                if (canStomp && marioBottom >= obsHeight - 25 && marioBottom <= obsHeight + 15 && isJumping) {
                    obstacle.classList.add('dead');
                    const points = obstacle.classList.contains('koopa') ? 150 : 100;
                    score += points;
                    scoreElement.textContent = score;
                    showScorePopup(obsLeft, obsHeight + 30, points);
                    playSound('stomp');

                    // Dar um pequeno pulo
                    mario.classList.remove('jump');
                    setTimeout(() => { mario.classList.add('jump'); isJumping = true; }, 10);
                    setTimeout(() => { mario.classList.remove('jump'); isJumping = false; }, 300);

                    setTimeout(() => {
                        obstacle.remove();
                        obstacles = obstacles.filter(o => o !== obstacle);
                    }, 500);
                } else if (dangerous && marioBottom < obsHeight && marioTop > 0) {
                    // Spiny e Piranha sempre causam dano (não podem ser pisados)
                    if (isSonicMode) {
                        // Sonic destrói tudo!
                        obstacle.classList.add('dead');
                        score += 200;
                        scoreElement.textContent = score;
                        showScorePopup(obsLeft, obsHeight + 30, 200, '#00aaff');
                        playSound('stomp');
                        setTimeout(() => {
                            obstacle.remove();
                            obstacles = obstacles.filter(o => o !== obstacle);
                        }, 200);
                    } else {
                        takeDamage();
                        obstacle.remove();
                        obstacles = obstacles.filter(o => o !== obstacle);
                    }
                } else if (marioBottom < obsHeight - 15) {
                    // Colisão lateral normal
                    if (isSonicMode && !obstacle.classList.contains('pipe')) {
                        // Sonic destrói inimigos ao encostar
                        obstacle.classList.add('dead');
                        score += 150;
                        scoreElement.textContent = score;
                        showScorePopup(obsLeft, obsHeight + 30, 150, '#00aaff');
                        playSound('stomp');
                        setTimeout(() => {
                            obstacle.remove();
                            obstacles = obstacles.filter(o => o !== obstacle);
                        }, 200);
                    } else {
                        takeDamage();
                        obstacle.remove();
                        obstacles = obstacles.filter(o => o !== obstacle);
                    }
                }
            }
        });
    }, 10);

    spawnInterval = setInterval(createObstacle, minSpawnTime + Math.random() * 500);
    coinSpawnInterval = setInterval(createCoin, 2000 + Math.random() * 1000);
    blockSpawnInterval = setInterval(createBlock, 4000 + Math.random() * 2000);

    startMusic();
}

// ===== PAUSE =====
const togglePause = () => {
    if (!isGameRunning) return;
    isPaused = !isPaused;
    pauseScreen.style.display = isPaused ? 'block' : 'none';

    const elements = [...obstacles, ...coins, ...blocks, ...powerups];
    const state = isPaused ? 'paused' : 'running';
    elements.forEach(el => el.style.animationPlayState = state);
    document.querySelectorAll('.parallax-bg').forEach(bg => bg.style.animationPlayState = state);
}

// ===== MENU =====
const goToMenu = () => {
    isGameRunning = false;
    isPaused = false;
    stopMusic();

    [loop, spawnInterval, coinSpawnInterval, blockSpawnInterval, powerupSpawnInterval, scoreInterval, difficultyInterval]
        .forEach(i => clearInterval(i));

    [...obstacles, ...coins, ...blocks, ...powerups].forEach(el => el.remove());
    obstacles = []; coins = []; blocks = []; powerups = [];

    document.querySelectorAll('.new-record, .phase-transition, .score-popup').forEach(el => el.remove());

    gameBoard.style.display = 'none';
    pauseScreen.style.display = 'none';
    gameover.style.display = 'none';
    restartButton.style.display = 'none';
    menuButton.style.display = 'none';
    gameOverScores.style.display = 'none';

    startScreen.style.display = 'block';
    menuHighScoreElement.textContent = highScore;
}

// ===== EVENT LISTENERS =====
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', (e) => { e.stopPropagation(); restartGame(); });
menuButton.addEventListener('click', (e) => { e.stopPropagation(); goToMenu(); });
pauseButton.addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
resumeButton.addEventListener('click', togglePause);
quitButton.addEventListener('click', goToMenu);

document.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        startScreen.style.display !== 'none' ? null : jump();
        if (startScreen.style.display !== 'none') startGame();
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); movingLeft = true; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); movingRight = true; }
    if (e.code === 'Escape' || e.code === 'KeyP') if (isGameRunning) togglePause();
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') movingLeft = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') movingRight = false;
});

gameBoard.addEventListener('click', (e) => {
    if (e.target === gameBoard || e.target.classList.contains('parallax-bg')) jump();
});

gameBoard.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = gameBoard.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    e.preventDefault();
    if (x < width * 0.3) movingLeft = true;
    else if (x > width * 0.7) movingRight = true;
    else jump();
});

gameBoard.addEventListener('touchend', () => { movingLeft = false; movingRight = false; });
