// ===== SISTEMA DE ÁUDIO =====

/**
 * Gerenciador de Áudio do Jogo
 */
class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.soundEnabled = StorageManager.getSoundEnabled();
        this.musicEnabled = StorageManager.getMusicEnabled();
        this.currentMelody = MELODIES.MARIO;
        this.melodyIndex = 0;
        this.melodyTimeout = null;
        this.isSonicMode = false;
    }
    
    /**
     * Ativa/desativa som
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        StorageManager.setSoundEnabled(this.soundEnabled);
        return this.soundEnabled;
    }
    
    /**
     * Ativa/desativa música
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        StorageManager.setMusicEnabled(this.musicEnabled);
        
        if (!this.musicEnabled) {
            this.stopMusic();
        }
        
        return this.musicEnabled;
    }
    
    /**
     * Toca um efeito sonoro
     */
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const sound = SOUND_EFFECTS[type];
        if (!sound) {
            console.warn(`Sound effect "${type}" not found`);
            return;
        }
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.freq[0], this.context.currentTime);
        
        // Aplica múltiplas frequências se houver
        if (sound.freq.length > 1) {
            sound.freq.forEach((freq, index) => {
                if (index > 0) {
                    const time = this.context.currentTime + (sound.dur / sound.freq.length) * index;
                    oscillator.frequency.setValueAtTime(freq, time);
                }
            });
        }
        
        gainNode.gain.setValueAtTime(sound.vol, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.dur);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + sound.dur);
    }
    
    /**
     * Inicia a música de fundo
     */
    startMusic() {
        if (this.melodyTimeout) {
            clearTimeout(this.melodyTimeout);
        }
        this.melodyIndex = 0;
        this.playMelodyNote();
    }
    
    /**
     * Para a música de fundo
     */
    stopMusic() {
        if (this.melodyTimeout) {
            clearTimeout(this.melodyTimeout);
            this.melodyTimeout = null;
        }
    }
    
    /**
     * Toca uma nota da melodia
     */
    playMelodyNote() {
        if (!this.musicEnabled) {
            this.melodyTimeout = setTimeout(() => this.playMelodyNote(), 100);
            return;
        }
        
        const noteData = this.currentMelody[this.melodyIndex];
        
        if (noteData.note > 0) {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.type = this.isSonicMode ? 'sawtooth' : 'square';
            oscillator.frequency.setValueAtTime(noteData.note, this.context.currentTime);
            
            const volume = this.isSonicMode ? 
                GAME_CONFIG.AUDIO.VOLUME.SONIC_MUSIC : 
                GAME_CONFIG.AUDIO.VOLUME.MUSIC;
            
            gainNode.gain.setValueAtTime(volume, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01, 
                this.context.currentTime + noteData.duration / 1000
            );
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + noteData.duration / 1000);
        }
        
        this.melodyIndex = (this.melodyIndex + 1) % this.currentMelody.length;
        
        const speed = this.isSonicMode ? 
            noteData.duration * GAME_CONFIG.AUDIO.MELODY_SPEED_MULTIPLIER : 
            noteData.duration;
        
        this.melodyTimeout = setTimeout(() => this.playMelodyNote(), speed);
    }
    
    /**
     * Troca para música do Sonic
     */
    switchToSonicMusic() {
        this.currentMelody = MELODIES.SONIC;
        this.melodyIndex = 0;
        this.isSonicMode = true;
    }
    
    /**
     * Volta para música do Mario
     */
    switchToMarioMusic() {
        this.currentMelody = MELODIES.MARIO;
        this.melodyIndex = 0;
        this.isSonicMode = false;
    }
    
    /**
     * Limpa todos os recursos de áudio
     */
    cleanup() {
        this.stopMusic();
    }
}
