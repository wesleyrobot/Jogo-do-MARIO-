// ===== CONFIGURAÇÕES DO JOGO =====
const GAME_CONFIG = {
    // Performance
    FPS: 60,
    FRAME_TIME: 1000 / 60, // ~16.67ms
    
    // Mario
    MARIO: {
        WIDTH: 100,
        HEIGHT: 100,
        INITIAL_X: 50,
        SPEED: 6,
        SONIC_SPEED: 12,
        JUMP_HEIGHT: 220,
        JUMP_DURATION: 500,
        COLLISION_OFFSET: {
            LEFT: 15,
            RIGHT: 30,
            TOP: 0,
            BOTTOM: 0
        }
    },
    
    // Pontuação
    SCORES: {
        GOOMBA: 100,
        KOOPA: 150,
        BAT: 120,
        BOO: 130,
        DRY_BONES: 140,
        FIREBALL: 160,
        BULLET_BILL: 200,
        CHEEP_CHEEP: 110,
        BLOOPER: 140,
        URCHIN: 150,
        LAKITU: 180,
        SPINY: 160,
        PARAKOOPA: 170,
        COIN: 10,
        BLOCK_COINS: 30,
        SONIC_KILL: 150,
        DANGEROUS_KILL: 200
    },
    
    // Power-ups
    POWERUPS: {
        INVINCIBILITY_DURATION: 8000, // 8 segundos
        SONIC_DURATION: 10000, // 10 segundos
        MAX_LIVES: 5,
        MUSHROOM_SPAWN_CHANCE: 0.2,
        STAR_SPAWN_CHANCE: 0.35,
        SONIC_SPAWN_CHANCE: 0.5
    },
    
    // Dificuldade
    DIFFICULTY: {
        INITIAL_SPEED: 2.5,
        MIN_SPEED: 1.2,
        SPEED_DECREASE: 0.05,
        INITIAL_SPAWN_TIME: 2000,
        MIN_SPAWN_TIME: 1000,
        SPAWN_TIME_DECREASE: 30,
        INCREASE_INTERVAL: 8000, // 8 segundos
        SCORE_PER_PHASE: 400
    },
    
    // Spawn timing
    SPAWN: {
        OBSTACLE_BASE: 2000,
        OBSTACLE_RANDOM: 500,
        COIN_BASE: 2000,
        COIN_RANDOM: 1000,
        BLOCK_BASE: 4000,
        BLOCK_RANDOM: 2000
    },
    
    // Intervalos
    INTERVALS: {
        SCORE_UPDATE: 100,
        MARIO_POSITION: 16,
        COLLISION_CHECK: 10
    },
    
    // Vidas
    LIVES: {
        INITIAL: 3,
        MAX: 5
    },
    
    // Sizes dos elementos
    SIZES: {
        COIN: 45,
        BLOCK: 60,
        POWERUP: 50,
        GOOMBA: { width: 80, height: 80 },
        KOOPA: { width: 70, height: 90 },
        PIPE: { width: 80, height: 120 },
        PIRANHA: { width: 80, height: 120 },
        SPINY: { width: 70, height: 70 },
        BULLET_BILL: { width: 90, height: 60 }
    },
    
    // Áudio
    AUDIO: {
        VOLUME: {
            MUSIC: 0.06,
            SONIC_MUSIC: 0.08,
            EFFECTS: 0.12
        },
        MELODY_SPEED_MULTIPLIER: 0.7
    }
};

// ===== DADOS DAS FASES =====
const PHASE_DATA = {
    1: {
        name: '🌳 MUNDO VERDE',
        enemies: ['goomba', 'koopa', 'pipe', 'piranha']
    },
    2: {
        name: '🪨 CAVERNA',
        enemies: ['goomba', 'bat', 'boo', 'pipe']
    },
    3: {
        name: '🏰 CASTELO',
        enemies: ['dryBones', 'fireball', 'bulletBill', 'piranha']
    },
    4: {
        name: '🌊 OCEANO',
        enemies: ['cheepCheep', 'blooper', 'urchin', 'pipe']
    },
    5: {
        name: '☁️ CÉU',
        enemies: ['lakitu', 'spiny', 'parakoopa', 'bulletBill']
    }
};

// ===== TIPOS DE INIMIGOS =====
const ENEMY_TYPES = {
    // Inimigos que podem ser pisados
    STOMPABLE: ['goomba', 'koopa'],
    
    // Inimigos perigosos (não podem ser pisados)
    DANGEROUS: ['spiny', 'piranha'],
    
    // Configurações especiais de altura
    SPECIAL_HEIGHTS: {
        bat: { min: 60, max: 180 },
        boo: { min: 60, max: 180 },
        bulletBill: { min: 80, max: 180 },
        fireball: { min: 80, max: 180 },
        cheepCheep: { min: 40, max: 180 },
        blooper: { min: 40, max: 180 },
        lakitu: { min: 150, max: 230 },
        parakoopa: { min: 100, max: 200 }
    },
    
    // Alturas dos inimigos para colisão
    HEIGHTS: {
        goomba: 80,
        koopa: 90,
        pipe: 120,
        piranha: 120,
        bat: 70,
        boo: 70,
        dryBones: 80,
        fireball: 60,
        bulletBill: 60,
        cheepCheep: 70,
        blooper: 80,
        urchin: 70,
        lakitu: 80,
        spiny: 70,
        parakoopa: 90
    }
};

// ===== MELODIES =====
const MELODIES = {
    MARIO: [
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
    ],
    
    SONIC: [
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
    ]
};

// ===== SOUND DEFINITIONS =====
const SOUND_EFFECTS = {
    jump: { freq: [400, 800], dur: 0.15, type: 'square', vol: 0.12 },
    stomp: { freq: [200, 400], dur: 0.1, type: 'square', vol: 0.15 },
    coin: { freq: [988, 1319], dur: 0.15, type: 'square', vol: 0.12 },
    powerup: { freq: [523, 659, 784, 1047], dur: 0.4, type: 'square', vol: 0.12 },
    'life-lost': { freq: [400, 100], dur: 0.3, type: 'triangle', vol: 0.15 },
    gameover: { freq: [300, 100], dur: 0.5, type: 'sawtooth', vol: 0.15 },
    block: { freq: [600, 800], dur: 0.1, type: 'square', vol: 0.1 },
    '1up': { freq: [523, 659, 784, 1047, 1319], dur: 0.5, type: 'square', vol: 0.12 },
    phase: { freq: [523, 659, 784, 1047], dur: 0.6, type: 'square', vol: 0.15 },
    sonic: { freq: [784, 988, 1175, 1397, 1568], dur: 0.4, type: 'square', vol: 0.15 }
};
