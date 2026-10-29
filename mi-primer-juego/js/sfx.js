// Efectos de sonido sintetizados con Web Audio (sin archivos externos)
const Sfx = {
    ctx: null,
    ensure() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },
    tone(f, d, type = 'square', vol = 0.15, f2 = null, delay = 0) {
        const ctx = this.ensure();
        if (!ctx) return;
        const t = ctx.currentTime + delay;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + d + 0.02);
    },
    play(name) {
        if (!GameSettings.sound) return;
        try {
            switch (name) {
                case 'click':  this.tone(520, 0.05, 'square', 0.05); break;
                case 'slide':  this.tone(180, 0.12, 'triangle', 0.08, 90); break;
                case 'thud':   this.tone(90, 0.15, 'sine', 0.25, 40); break;
                case 'bump':   this.tone(120, 0.08, 'sine', 0.12, 80); break;
                case 'honk':   this.tone(330, 0.11, 'square', 0.1); this.tone(440, 0.14, 'square', 0.1, null, 0.12); break;
                case 'kill':   this.tone(600, 0.35, 'sawtooth', 0.1, 80, 0.05); break;
                case 'appear': this.tone(220, 0.6, 'sine', 0.15, 660); break;
                case 'hit':    this.tone(880, 0.12, 'square', 0.08, 1320); break;
                case 'miss':   this.tone(140, 0.35, 'sawtooth', 0.14, 70); break;
                case 'undo':   this.tone(400, 0.08, 'triangle', 0.1, 300); break;
                case 'win':    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'square', 0.08, null, i * 0.12)); break;
                case 'lose':   this.tone(300, 0.5, 'triangle', 0.12, 150); break;
            }
        } catch (e) { /* audio no disponible */ }
    }
};
