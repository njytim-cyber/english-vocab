// Web Audio API Sound Synthesizer
// Generates retro arcade sounds programmatically to avoid external asset dependencies.

class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Master volume
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }

    playTone(freq, type, duration, startTime = 0) {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playClick() {
        // High pitched blip
        this.playTone(800, 'sine', 0.1);
    }

    playPop() {
        // Bubble pop sound
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playCorrect() {
        // Major arpeggio (C5, E5, G5, C6)
        this.playTone(523.25, 'sine', 0.1, 0);
        this.playTone(659.25, 'sine', 0.1, 0.1);
        this.playTone(783.99, 'sine', 0.1, 0.2);
        this.playTone(1046.50, 'sine', 0.2, 0.3);
    }

    playWrong() {
        // Low buzzing saw wave
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playWin() {
        // Fanfare
        const now = 0;
        this.playTone(523.25, 'square', 0.1, now);       // C5
        this.playTone(523.25, 'square', 0.1, now + 0.1); // C5
        this.playTone(523.25, 'square', 0.1, now + 0.2); // C5
        this.playTone(659.25, 'square', 0.4, now + 0.3); // E5
        this.playTone(783.99, 'square', 0.4, now + 0.7); // G5
        this.playTone(1046.50, 'square', 0.8, now + 1.1); // C6
    }
}

export const sfx = new SoundSynthesizer();
