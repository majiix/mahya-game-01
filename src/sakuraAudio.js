class SakuraAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureCtx() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq, duration = 0.14, type = 'sine', volume = 0.12, slideTo = null) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(620, 0.07, 'triangle', 0.09, 780);
  }

  playJump() {
    this.playTone(260, 0.16, 'sine', 0.11, 560);
  }

  playJetpack() {
    this.playTone(135, 0.11, 'sawtooth', 0.04, 175);
  }

  playKick() {
    this.playTone(180, 0.12, 'square', 0.12, 68);
  }

  playCoin() {
    this.playTone(880, 0.1, 'sine', 0.1, 1320);
    setTimeout(() => this.playTone(1320, 0.16, 'sine', 0.1, 1760), 75);
  }

  playHug() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.34, 'triangle', 0.1), i * 80);
    });
  }

  playVehicle() {
    this.playTone(140, 0.22, 'sawtooth', 0.08, 280);
  }

  playSpawn() {
    this.playTone(440, 0.12, 'triangle', 0.11, 880);
  }

  playHeal() {
    this.playTone(587.33, 0.14, 'sine', 0.11, 880);
    setTimeout(() => this.playTone(880, 0.22, 'sine', 0.11, 1174.66), 90);
  }

  playBlockBreak() {
    this.playTone(170, 0.08, 'square', 0.11, 75);
    setTimeout(() => this.playTone(115, 0.07, 'triangle', 0.09, 60), 35);
  }

  playBlockPlace() {
    this.playTone(320, 0.07, 'triangle', 0.11, 480);
  }

  playDoorOpen() {
    this.playTone(210, 0.11, 'triangle', 0.1, 340);
    setTimeout(() => this.playTone(340, 0.09, 'sine', 0.07, 420), 55);
  }

  playDoorClose() {
    this.playTone(290, 0.09, 'triangle', 0.11, 145);
    setTimeout(() => this.playTone(120, 0.08, 'square', 0.08, 70), 50);
  }
}

export const sakuraAudio = new SakuraAudioEngine();
