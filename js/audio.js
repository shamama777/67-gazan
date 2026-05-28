/**
 * Vapor Sound Synthesizer System using Web Audio API
 * Provides zero-dependency procedural retro sound effects and background chiptune.
 */

class AudioSynth {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.currentBgm = null;
    }

    // Lazy initialization of AudioContext on user action (browser requirement)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            if (this.ctx && this.ctx.state === 'running') {
                this.ctx.suspend();
            }
        } else {
            this.init();
        }
        return this.muted;
    }

    playTone(frequency, type, duration, volume = 0.1, slideTo = 0) {
        if (this.muted) return;
        this.init();

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            
            if (slideTo > 0) {
                osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            // Smooth release to prevent clicks
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio Synth failed:", e);
        }
    }

    // --- Interface Sounds ---

    playClick() {
        // High frequency transient tick
        this.playTone(800, 'sine', 0.05, 0.05, 1200);
    }

    playCash() {
        // Sound of retro register: double chime
        const now = () => {
            this.playTone(1500, 'triangle', 0.1, 0.08);
            setTimeout(() => {
                this.playTone(1800, 'triangle', 0.25, 0.08);
            }, 80);
        };
        now();
    }

    playSuccess() {
        // Upbeat victory sound
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.15, 0.06);
            }, idx * 100);
        });
    }

    playError() {
        // Low buzzing buzzer
        this.playTone(150, 'sawtooth', 0.35, 0.1);
    }

    // --- Space Defender Game Sounds ---

    playLaser() {
        // Rapid pitch sweep down
        this.playTone(880, 'sawtooth', 0.12, 0.04, 110);
    }

    playExplosion() {
        if (this.muted) return;
        this.init();
        
        try {
            // White noise simulation using a short buffer
            const bufferSize = this.ctx.sampleRate * 0.3; // 0.3s
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;

            // Lowpass filter to make it sound beefier
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noiseNode.start();
        } catch (e) {
            // Fallback to sine pitch sweep if buffer creation fails
            this.playTone(220, 'triangle', 0.25, 0.1, 40);
        }
    }

    // --- Snake Game Sounds ---

    playSnakeEat() {
        // Short high-pitched retro coin sound
        this.playTone(987.77, 'sine', 0.08, 0.05, 1318.51); // B5 to E6
    }

    playSnakeDie() {
        // Downturn descending pitch
        this.playTone(300, 'sawtooth', 0.5, 0.08, 60);
    }

    // --- Maze Runner Sounds ---

    playMazeKey() {
        // Rising chime
        this.playTone(587.33, 'sine', 0.08, 0.06, 880); // D5 to A5
        setTimeout(() => {
            this.playTone(1174.66, 'sine', 0.15, 0.06); // D6
        }, 80);
    }

    playMazeWin() {
        // Majestic scale
        const scale = [523, 587, 659, 698, 783, 880, 987, 1046];
        scale.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.1, 0.05);
            }, i * 60);
        });
    }
}

export const audio = new AudioSynth();
