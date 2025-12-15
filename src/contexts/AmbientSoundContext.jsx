import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Production-safe logging (only errors in prod)
const isDev = import.meta.env.DEV;
const devWarn = isDev ? console.warn.bind(console) : () => {};
const devError = console.error.bind(console);

const AmbientSoundContext = createContext(null);

function createBowlsEngine() {
  /** @type {AudioContext | null} */
  let ctx = null;
  /** @type {GainNode | null} */
  let master = null;
  /** @type {GainNode | null} */
  let bus = null; // master mix bus
  /** @type {GainNode | null} */
  let padBus = null; // continuous bowls bed
  /** @type {GainNode | null} */
  let strikeBus = null; // occasional accents (kept subtle)
  /** @type {GainNode | null} */
  let rainBus = null; // gentle rain texture layer
  /** @type {BiquadFilterNode | null} */
  let lowpass = null;
  /** @type {AudioBufferSourceNode | null} */
  let rainNoise = null;

  /** @type {number | null} */
  let timerId = null;
  let mode = 'menu'; // 'menu' | 'practice'
  let isMuted = true;

  let padNodes = null;
  let padRoot = 110; // Hz (will drift)

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const ensure = () => {
    if (ctx && master && bus && lowpass && padBus && strikeBus && rainBus) return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      throw new Error('WebAudio not supported in this browser');
    }

    ctx = new Ctx();

    bus = ctx.createGain();
    bus.gain.value = 0.9;

    padBus = ctx.createGain();
    padBus.gain.value = 1.0;
    padBus.connect(bus);

    strikeBus = ctx.createGain();
    strikeBus.gain.value = 0.5; // Higher gain for strikes to be clearly audible
    strikeBus.connect(bus);

    // Rain texture bus - gentle filtered noise for rain-like texture
    rainBus = ctx.createGain();
    rainBus.gain.value = 0.15; // Subtle rain layer
    rainBus.connect(bus);

    lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    // Brighter to let harmonics through for rich singing bowl sound
    lowpass.frequency.value = 3200;
    lowpass.Q.value = 0.8;

    master = ctx.createGain();
    master.gain.value = 0.0001;

    // Routing: oscillators -> bus -> lowpass -> master -> speakers
    bus.connect(lowpass);
    lowpass.connect(master);
    master.connect(ctx.destination);
  };

  const setMasterGain = (nextGain, rampSeconds = 0.6) => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const current = Math.max(0.0001, Number(master.gain.value) || 0.0001);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(current, now);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, nextGain), now + Math.max(0.01, rampSeconds));
  };

  const destroyPad = () => {
    if (!padNodes) return;
    try {
      const now = ctx ? ctx.currentTime : 0;
      for (const bowl of padNodes.bowlVoices || []) {
        try {
          // Fade out master gain
          bowl?.masterGain?.gain?.cancelScheduledValues?.(now);
          bowl?.masterGain?.gain?.setValueAtTime?.(0.0001, now);
        } catch {
          // ignore
        }
        // Stop all harmonic oscillators for this bowl
        for (const voice of bowl?.voices || []) {
          try { voice?.osc?.stop?.(now + 0.02); } catch { /* ignore */ }
        }
      }
      try { padNodes?.lfo?.stop?.(now + 0.02); } catch { /* ignore */ }
    } finally {
      padNodes = null;
    }
  };

  const ensurePad = () => {
    if (!ctx || !padBus || padNodes) return;

    // Root drifts subtly over time for a "session" feel.
    // Use authentic singing bowl frequencies (typical range: 110-220 Hz for fundamental)
    // Slightly higher for that "singing" quality when running mallet around rim
    padRoot = rand(120, 160);
    // Create multiple bowls with authentic harmonic relationships
    // Real singing bowls have rich overtones: fundamental, 2nd harmonic, 3rd, 4th, etc.
    const bowl1 = padRoot; // Primary bowl
    const bowl2 = padRoot * 1.618; // Golden ratio (common in singing bowls)
    const bowl3 = padRoot * 2.0; // Octave
    const bowls = [bowl1, bowl2, bowl3];
    
    // Much more subtle - gentle hum, not prominent
    const targets = mode === 'practice'
      ? [0.06, 0.045, 0.035]
      : [0.05, 0.038, 0.03];

    // Create a realistic singing bowl voice with rich harmonics
    const createBowlVoice = (fundamental, target) => {
      const now = ctx.currentTime;
      const voices = [];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.connect(padBus);

      // Real singing bowls when running a mallet around the rim create:
      // - Rich, continuous harmonics
      // - Slight inharmonicity (detuning) for that warm, "singing" quality
      // - Gentle amplitude modulation (the LFO creates this)
      const harmonics = [
        { ratio: 1.0, amp: 1.0, detune: 0 },        // Fundamental - strongest
        { ratio: 2.0, amp: 0.65, detune: 0.3 },     // Octave - clear
        { ratio: 3.0, amp: 0.4, detune: 0.6 },      // Fifth - rich
        { ratio: 4.0, amp: 0.25, detune: 0.9 },     // Double octave
        { ratio: 5.0, amp: 0.15, detune: 1.2 },     // Major third
        { ratio: 6.0, amp: 0.1, detune: 1.5 }       // Fifth
      ];

      for (const { ratio, amp, detune } of harmonics) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Use sine for pure tones, slight detune for that warm, natural "singing" quality
        // This mimics the slight variations when running a mallet around the rim
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * ratio, now);
        osc.detune.setValueAtTime(detune + rand(-0.5, 0.5), now); // Slight detune = warmer, more natural
        
        // Each harmonic contributes to the rich, continuous bowl "singing" sound
        gain.gain.setValueAtTime(0.0001, now);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start();
        voices.push({ osc, gain, ratio, amp });
      }

      return { voices, masterGain, target, fundamental };
    };

    const bowlVoices = bowls.map((f, i) => createBowlVoice(f, targets[i]));

    // Gentle movement (breathing) via a slow LFO applied to voice gains + filter.
    // This mimics the natural variation when running a mallet around the rim
    // Creates that meditative "singing" quality - the sound ebbs and flows naturally
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(mode === 'practice' ? 0.035 : 0.025, ctx.currentTime); // Slightly slower for more meditative feel

    const lfoToGains = ctx.createGain();
    lfoToGains.gain.setValueAtTime(mode === 'practice' ? 0.012 : 0.009, ctx.currentTime);
    lfo.connect(lfoToGains);
    for (const bowl of bowlVoices) {
      try {
        // Apply LFO to the master gain of each bowl for gentle breathing effect
        lfoToGains.connect(bowl.masterGain.gain);
      } catch {
        // ignore
      }
    }

    // Subtle filter movement adds to the meditative quality
    const lfoToFilter = ctx.createGain();
    lfoToFilter.gain.setValueAtTime(mode === 'practice' ? 420 : 320, ctx.currentTime);
    lfo.connect(lfoToFilter);
    try {
      lfoToFilter.connect(lowpass.frequency);
    } catch {
      // ignore
    }

    lfo.start();

    padNodes = { bowlVoices, lfo, lfoToGains, lfoToFilter };
  };

  // Create gentle rain texture using filtered noise
  const ensureRain = () => {
    if (!ctx || !rainBus || rainNoise) return;

    // Create a buffer of white noise
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate pink noise (more natural than white noise)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // Normalize
      b6 = white * 0.115926;
    }

    // Create a looped buffer source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to sound like gentle rain (lowpass around 2000-3000 Hz)
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 2500;
    rainFilter.Q.value = 0.5;

    // Gain for subtle rain texture
    // Start silent - will be controlled by start() function for proper timing with strike
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.0001, ctx.currentTime);

    // Connect: source -> filter -> gain -> rainBus
    source.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(rainBus);

    source.start(0);
    rainNoise = { source, filter: rainFilter, gain: rainGain };
  };

  const destroyRain = () => {
    if (!rainNoise || !ctx) return;
    try {
      const now = ctx.currentTime;
      if (rainNoise.gain) {
        rainNoise.gain.gain.cancelScheduledValues(now);
        rainNoise.gain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      }
      if (rainNoise.source) {
        rainNoise.source.stop(now + 0.3);
      }
    } catch {
      // ignore
    } finally {
      rainNoise = null;
    }
  };

  const retunePad = () => {
    if (!ctx || !padNodes) return;
    const now = ctx.currentTime;

    // Small drift step (keeps it "session-like" and not repetitive)
    padRoot = clamp(padRoot * rand(0.94, 1.06), 110, 140);
    const bowl1 = padRoot;
    const bowl2 = padRoot * 1.618; // Golden ratio
    const bowl3 = padRoot * 2.0; // Octave
    const newFundamentals = [bowl1, bowl2, bowl3];

    for (let i = 0; i < padNodes.bowlVoices.length; i += 1) {
      const bowl = padNodes.bowlVoices[i];
      const newFundamental = newFundamentals[i] || newFundamentals[newFundamentals.length - 1];
      
      // Retune all harmonics of this bowl
      const harmonics = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
      for (let j = 0; j < bowl.voices.length && j < harmonics.length; j += 1) {
        const voice = bowl.voices[j];
        const ratio = harmonics[j];
        const newFreq = newFundamental * ratio;
        try {
          voice.osc.frequency.cancelScheduledValues(now);
          voice.osc.frequency.setValueAtTime(voice.osc.frequency.value, now);
          voice.osc.frequency.linearRampToValueAtTime(newFreq, now + 7.0);
        } catch {
          // ignore
        }
      }
    }
  };

  const strike = (when) => {
    if (!ctx || !strikeBus) return;

    // Authentic singing bowl strike with rich harmonics
    // Real bowls have a fundamental around 110-220 Hz with rich overtones
    const base = rand(120, 200);
    // Real singing bowl harmonics (inharmonic partials create that characteristic "singing" quality)
    const partials = [
      { ratio: 1.0, amp: 1.0 },      // Fundamental
      { ratio: 2.0, amp: 0.7 },      // Octave
      { ratio: 3.0, amp: 0.5 },      // Fifth above octave
      { ratio: 4.0, amp: 0.3 },      // Double octave
      { ratio: 5.0, amp: 0.2 },      // Major third
      { ratio: 6.0, amp: 0.15 }      // Fifth
    ];
    
    // Keep accents subtle; the continuous pad is the main experience.
    const baseAmp = mode === 'practice' ? 0.08 : 0.04;
    // Longer decay for that meditative ring-out
    const decay = mode === 'practice' ? rand(5.5, 8.5) : rand(4.5, 7.0);

    for (let i = 0; i < partials.length; i += 1) {
      const { ratio, amp } = partials[i];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * ratio, when);
      // Slight detune for natural variation
      osc.detune.setValueAtTime(rand(-3, 3), when);

      const peak = baseAmp * amp;
      // Quick attack, long natural decay
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), when + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, when + decay);

      osc.connect(g);
      g.connect(strikeBus);

      osc.start(when);
      osc.stop(when + decay + 0.3);
    }
  };

  const scheduleNext = () => {
    if (timerId) window.clearTimeout(timerId);
    timerId = null;

    if (!ctx || isMuted) return;

    // Slow, session-like evolution
    const delayMs = mode === 'practice' ? rand(14000, 22000) : rand(18000, 30000);
    timerId = window.setTimeout(() => {
      if (!ctx || isMuted) return;
      const now = ctx.currentTime;

      // Retune the continuous bed very slowly.
      retunePad();

      // Optional very quiet accent, rare, only in practice mode.
      if (mode === 'practice' && Math.random() < 0.22) {
        strike(now + rand(0.0, 0.2));
      }

      scheduleNext();
    }, delayMs);
  };

  const start = async (nextMode = 'menu') => {
    ensure();
    mode = nextMode;
    isMuted = false;

    // If the context is suspended (common until first interaction), resume it
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // TIBETAN SINGING BOWL STRIKE: Muted bell sound (like a soft, warm bell)
    // This strike opens the door to the peaceful environment
    if (strikeBus && ctx) {
      const welcomeStrike = now + 0.02; // Immediate response to button click
      // Muted bells are lower and softer - use lower frequency range
      const base = rand(100, 140); // Lower = more muted, bell-like (not horn-like)
      
      // Muted bells have fewer high harmonics - focus on fundamental and lower overtones
      // This creates that soft, muted bell quality (not sharp like a horn)
      const partials = [
        { ratio: 1.0, amp: 1.0, detune: 0 },        // Fundamental - strongest
        { ratio: 2.0, amp: 0.5, detune: 0.3 },      // Octave - reduced for muted quality
        { ratio: 3.0, amp: 0.25, detune: 0.6 },     // Fifth - much quieter
        { ratio: 4.0, amp: 0.12, detune: 0.9 }      // Double octave - very quiet (muted)
        // Removed higher harmonics - muted bells don't have strong high frequencies
      ];
      
      // Muted = softer, quieter strike
      const baseAmp = 0.22; // Quieter for muted bell sound (not loud like a horn)
      const decay = rand(10.0, 14.0); // Longer, softer decay for muted bell

      for (let i = 0; i < partials.length; i += 1) {
        const { ratio, amp, detune } = partials[i];
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        
        // Add a lowpass filter to each partial for that muted quality
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000; // Cut high frequencies - muted bells are darker
        filter.Q.value = 0.5;

        // Use sine for pure tones, slight detune for warmth
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base * ratio, welcomeStrike);
        osc.detune.setValueAtTime(detune, welcomeStrike);

        const peak = baseAmp * amp;
        // Much slower, softer attack for muted bell (not sharp like a horn)
        g.gain.setValueAtTime(0.0001, welcomeStrike);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), welcomeStrike + 0.04); // Slower attack = softer, muted
        g.gain.exponentialRampToValueAtTime(0.0001, welcomeStrike + decay);

        // Route: osc -> filter -> gain -> strikeBus
        osc.connect(filter);
        filter.connect(g);
        g.connect(strikeBus);

        osc.start(welcomeStrike);
        osc.stop(welcomeStrike + decay + 0.3);
      }
    }

    // Continuous session bed with rich harmonics
    // Gentle, subtle gain - like a background hum with rain
    const targetGain = mode === 'practice' ? 0.08 : 0.065;
    // Start very quiet, then fade in after the strike
    setMasterGain(0.0001, 0.01); // Start silent

    // Ensure continuous pad exists - but wait for strike to ring first
    ensurePad();
    if (padNodes && ctx) {
      const enterTime = now + 0.3; // Start entering the peaceful space 0.3s after strike
      for (const bowl of padNodes.bowlVoices) {
        try {
          // Start silent, then fade in gently after the strike
          bowl.masterGain.gain.cancelScheduledValues(now);
          bowl.masterGain.gain.setValueAtTime(0.0001, now);
          // Gentle fade-in starting after strike - like walking into the space
          bowl.masterGain.gain.linearRampToValueAtTime(0.0001, enterTime);
          bowl.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, bowl.target), enterTime + 1.2);
        } catch {
          // ignore
        }
      }
    }

    // Start gentle rain texture - also after the strike, like entering the environment
    ensureRain();
    if (rainNoise && rainNoise.gain && ctx) {
      const enterTime = now + 0.3; // Rain starts with the hum
      const currentGain = rainNoise.gain.gain.value || 0.0001;
      rainNoise.gain.gain.cancelScheduledValues(now);
      rainNoise.gain.gain.setValueAtTime(0.0001, now);
      rainNoise.gain.gain.linearRampToValueAtTime(0.0001, enterTime);
      rainNoise.gain.gain.linearRampToValueAtTime(mode === 'practice' ? 0.08 : 0.06, enterTime + 1.2);
    }

    // Fade in master gain after strike - like the door opening
    const enterTime = now + 0.3;
    setMasterGain(0.0001, 0.01);
    setTimeout(() => {
      if (!isMuted && ctx) {
        setMasterGain(targetGain, 0.1);
      }
    }, 300); // Start fade-in 300ms after strike

    scheduleNext();
  };

  const pause = () => {
    if (!ctx) return;
    isMuted = true;
    if (timerId) window.clearTimeout(timerId);
    timerId = null;
    setMasterGain(0.0001, 0.2);
    destroyPad();
    destroyRain();
  };

  const setMode = (nextMode) => {
    mode = nextMode === 'practice' ? 'practice' : 'menu';
    if (!ctx || isMuted) return;
    const targetGain = mode === 'practice' ? 0.08 : 0.065;
    setMasterGain(targetGain);
    // Recreate pad with the new mode profile (targets/LFO)
    destroyPad();
    destroyRain();
    ensurePad();
    ensureRain();
    scheduleNext();
  };

  const stop = async () => {
    try {
      pause();
      if (ctx) {
        await ctx.close();
      }
    } catch (e) {
      // ignore
    } finally {
      ctx = null;
      master = null;
      bus = null;
      lowpass = null;
    }
  };

  return { start, pause, stop, setMode };
}

export function AmbientSoundProvider({ children }) {
  const engineRef = useRef(null);
  const startInFlightRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const ensureEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = createBowlsEngine();
    }
    return engineRef.current;
  }, []);

  const startAmbient = useCallback(
    async (nextMode = 'menu') => {
      try {
        // Deduplicate overlapping start calls (pointerdown + onClick, etc.)
        if (startInFlightRef.current) {
          return await startInFlightRef.current;
        }

        const engine = ensureEngine();
        setHasStarted(true);

        startInFlightRef.current = (async () => {
          await engine.start(nextMode);
          setIsPlaying(true);
          return true;
        })();

        const result = await startInFlightRef.current;
        startInFlightRef.current = null;
        return result;
      } catch (e) {
        devWarn('[AmbientSound] Failed to start bowls audio:', e);
        startInFlightRef.current = null;
        setIsPlaying(false);
        return false;
      }
    },
    [ensureEngine]
  );

  const pauseAmbient = useCallback(() => {
    try {
      engineRef.current?.pause?.();
    } catch (e) {
      devError('[AmbientSound] Pause error:', e);
    } finally {
      setIsPlaying(false);
    }
  }, []);

  const setAmbientMode = useCallback(
    (mode) => {
      try {
        ensureEngine().setMode(mode);
      } catch (e) {
        devWarn('[AmbientSound] setMode failed:', e);
      }
    },
    [ensureEngine]
  );

  useEffect(() => {
    return () => {
      // best-effort cleanup
      engineRef.current?.stop?.().catch?.(() => {});
      engineRef.current = null;
    };
  }, []);

  // Autoplay policies differ across browsers. This guarantees bowls start on the first
  // user gesture anywhere (even if they bypass the splash flow or refresh mid-app).
  useEffect(() => {
    if (hasStarted) return;

    let cancelled = false;
    const unlock = () => {
      if (cancelled) return;
      // Best-effort: start menu bowls on first interaction
      startAmbient('menu');
    };

    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('touchend', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [hasStarted, startAmbient]);

  const value = useMemo(
    () => ({
      startAmbient,
      pauseAmbient,
      setAmbientMode,
      isAmbientPlaying: isPlaying,
      hasStarted
    }),
    [startAmbient, pauseAmbient, setAmbientMode, isPlaying, hasStarted]
  );

  return <AmbientSoundContext.Provider value={value}>{children}</AmbientSoundContext.Provider>;
}

export function useAmbientSound() {
  const ctx = useContext(AmbientSoundContext);
  if (!ctx) {
    throw new Error('useAmbientSound must be used inside <AmbientSoundProvider>');
  }
  return ctx;
}


