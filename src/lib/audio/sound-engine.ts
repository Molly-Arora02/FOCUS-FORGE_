/**
 * Focus Forge Web Audio Procedural Sound Engine
 * Zero external audio dependencies - synthesizes ambient noises & notification chimes via Web Audio API.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentAmbientNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientType: string | null = null;

  public initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a crisp high-fidelity chime for session start, pause, or completion.
   */
  public playChime(type: "start" | "pause" | "complete" | "click" | "reward" | "alert" | "penalty" | "beep", vol = 0.3) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === "start") {
      // Ascending major chord (C5 -> E5 -> G5)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(vol * 0.5, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.45);
      });
    } else if (type === "pause") {
      // Soft descending dual tone
      [659.25, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(vol * 0.4, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } else if (type === "complete" || type === "reward") {
      // Glorious celebratory chime (C5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(vol * 0.6, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.1 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.85);
      });
    } else if (type === "alert" || type === "penalty") {
      // High friction alert tone
      [440, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(vol * 0.4, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } else if (type === "beep") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(vol * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(vol * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  }

  /**
   * Synthesize procedural ambient noise (Binaural 40Hz Gamma / 10Hz Alpha, Rain, White/Brown noise)
   */
  public startAmbient(type: "binaural-gamma" | "binaural-alpha" | "brown-noise" | "rain" | "white-noise", volume = 0.3) {
    this.stopAmbient();
    const ctx = this.initContext();
    if (!ctx) return;

    this.ambientType = type;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;

    if (type === "binaural-gamma" || type === "binaural-alpha") {
      const diff = type === "binaural-gamma" ? 40 : 10;
      const baseFreq = 216;

      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = "sine";
      oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscL.connect(merger, 0, 0);

      const oscR = ctx.createOscillator();
      oscR.type = "sine";
      oscR.frequency.setValueAtTime(baseFreq + diff, ctx.currentTime);
      oscR.connect(merger, 0, 1);

      merger.connect(masterGain);
      oscL.start();
      oscR.start();

      this.currentAmbientNode = merger;
    } else {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "brown-noise" || type === "rain") {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          output[i] = white * 0.3;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === "rain") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else if (type === "brown-noise") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, ctx.currentTime);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      this.currentAmbientNode = filter;
    }
  }

  public setAmbientVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    if (this.currentAmbientNode) {
      try {
        this.currentAmbientNode.disconnect();
      } catch (e) {}
      this.currentAmbientNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {}
      this.gainNode = null;
    }
    this.ambientType = null;
  }

  public getActiveAmbient() {
    return this.ambientType;
  }
}

export const soundEngine = new SoundEngine();

// Convenience exports for backwards & cross-component compatibility
export function playRealBellChime(volume = 0.8) {
  soundEngine.playChime("complete", volume);
}

export function playTabSwitchWarningAlert(volume = 0.6) {
  soundEngine.playChime("alert", volume);
}

export function playMilestoneUnlockChime(volume = 0.7) {
  soundEngine.playChime("reward", volume);
}

export function playPenaltyBuzzer(volume = 0.8) {
  soundEngine.playChime("penalty", volume);
}

export function playAttentionDepartureBeep(volume = 0.5) {
  soundEngine.playChime("beep", volume);
}

export function speakCoachAlert(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }
}
