"use client";

/**
 * Focus Forge Acoustic Sound Engine
 * Uses Web Audio API to synthesize realistic acoustic bell chimes,
 * harmonic Tibetan singing bowls, crisp session start gongs, and
 * tab-switch / gaze distraction warning alarms without external file dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch((e) => console.warn("AudioContext resume failed:", e));
  }
  return audioCtx;
}

/**
 * Synthesizes an authentic acoustic temple bell / singing chime with rich harmonic overtones.
 * Harmonics: Fundamental (528 Hz Solfeggio / Love frequency) + Overtones (1056 Hz, 1457 Hz, 2149 Hz, 2867 Hz)
 * with natural acoustic exponential decay and stereo spatial reverb spread.
 */
export function playRealBellChime(volume: number = 0.6): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    // Harmonic partial frequencies for real bronze / crystal bell acoustics
    const harmonics = [
      { freq: 528, gain: 0.6, decay: 3.8 },    // Fundamental tone (warm bell body)
      { freq: 1056, gain: 0.35, decay: 2.9 },  // First octave
      { freq: 1457, gain: 0.22, decay: 2.2 },  // Minor third harmonic
      { freq: 2149, gain: 0.15, decay: 1.6 },  // High crystalline shimmer
      { freq: 2867, gain: 0.08, decay: 1.1 },  // Metallic strike transient
      { freq: 3840, gain: 0.04, decay: 0.7 },  // Upper rim sparkle
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Sine wave with subtle frequency modulation for natural bell vibration shimmer
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Micro-vibrato (pitch wobble like a physical resonating bell)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + decay);

      // Instant acoustic strike attack, smooth exponential decay
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + 0.008); // 8ms sharp attack transient
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  } catch (err) {
    console.warn("Real bell chime audio error:", err);
  }
}

/**
 * Plays an urgent tab-switch distraction warning alert tone.
 * Dissonant dual-tone pulse to immediately notify user they navigated away.
 */
export function playTabSwitchWarningAlert(volume: number = 0.5): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    // Two fast dissonant pulses (tritone interval 440Hz & 622Hz)
    [0, 0.14].forEach((offset) => {
      const startTime = now + offset;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(587.33, startTime); // D5
      osc2.frequency.setValueAtTime(830.61, startTime); // G#5 (dissonant tritone)

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);

      // Filter to soften sawtooth harshness
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, startTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + 0.12);
      osc2.stop(startTime + 0.12);
    });
  } catch (err) {
    console.warn("Tab switch warning audio error:", err);
  }
}

/**
 * Plays a gentle attention recalibration beep when gaze drift / looking away is detected.
 */
export function playAttentionDepartureBeep(volume: number = 0.4): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.22); // Falling tone

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.warn("Attention departure beep error:", err);
  }
}

/**
 * Plays a triumphant crystal arpeggio when a milestone or reward is achieved.
 */
export function playMilestoneUnlockChime(volume: number = 0.5): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const startTime = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, startTime + 0.7);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  } catch (err) {
    console.warn("Milestone unlock chime error:", err);
  }
}

/**
 * Plays a descending low penalty buzzer for early session abandonment.
 */
export function playPenaltyBuzzer(volume: number = 0.6): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {
    console.warn("Penalty buzzer error:", err);
  }
}

/**
 * Text-to-Speech prompt helper for AI Voice Interventions
 */
export function speakCoachAlert(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.08;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

