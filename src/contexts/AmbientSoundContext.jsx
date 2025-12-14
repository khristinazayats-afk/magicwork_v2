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
  /** @type {BiquadFilterNode | null} */
  let lowpass = null;

  /** @type {number | null} */
  let timerId = null;
  let mode = 'menu'; // 'menu' | 'practice'
  let isMuted = true;

  let padNodes = null;
  let padRoot = 110; // Hz (will drift)

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const ensure = () => {
    if (ctx && master && bus && lowpass && padBus && strikeBus) return;

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
    strikeBus.gain.value = 0.2;
    strikeBus.connect(bus);

    lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    // Slightly brighter so it's audible on small phone speakers
    lowpass.frequency.value = 2400;
    lowpass.Q.value = 0.7;

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
      for (const v of padNodes.voices || []) {
        try {
          v?.gain?.gain?.cancelScheduledValues?.(now);
          v?.gain?.gain?.setValueAtTime?.(0.0001, now);
        } catch {
          // ignore
        }
        try { v?.osc1?.stop?.(now + 0.02); } catch { /* ignore */ }
        try { v?.osc2?.stop?.(now + 0.02); } catch { /* ignore */ }
      }
      try { padNodes?.lfo?.stop?.(now + 0.02); } catch { /* ignore */ }
    } finally {
      padNodes = null;
    }
  };

  const ensurePad = () => {
    if (!ctx || !padBus || padNodes) return;

    // Root drifts subtly over time for a "session" feel.
    padRoot = rand(98, 122);
    const freqs = [padRoot, padRoot * 1.5, padRoot * 2.0]; // root, fifth, octave
    const targets = mode === 'practice'
      ? [0.10, 0.07, 0.05]
      : [0.08, 0.055, 0.04];

    const createVoice = (freq, target) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq, ctx.currentTime);
      osc1.detune.setValueAtTime(rand(-6, 6), ctx.currentTime);
      osc2.detune.setValueAtTime(rand(-9, 9), ctx.currentTime);

      g.gain.setValueAtTime(0.0001, ctx.currentTime);

      osc1.connect(g);
      osc2.connect(g);
      g.connect(padBus);

      osc1.start();
      osc2.start();

      return { osc1, osc2, gain: g, target, freq };
    };

    const voices = freqs.map((f, i) => createVoice(f, targets[i]));

    // Gentle movement (breathing) via a slow LFO applied to voice gains + filter.
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(mode === 'practice' ? 0.045 : 0.03, ctx.currentTime);

    const lfoToGains = ctx.createGain();
    lfoToGains.gain.setValueAtTime(mode === 'practice' ? 0.010 : 0.008, ctx.currentTime);
    lfo.connect(lfoToGains);
    for (const v of voices) {
      try {
        lfoToGains.connect(v.gain.gain);
      } catch {
        // ignore
      }
    }

    const lfoToFilter = ctx.createGain();
    lfoToFilter.gain.setValueAtTime(mode === 'practice' ? 380 : 280, ctx.currentTime);
    lfo.connect(lfoToFilter);
    try {
      lfoToFilter.connect(lowpass.frequency);
    } catch {
      // ignore
    }

    lfo.start();

    padNodes = { voices, lfo, lfoToGains, lfoToFilter };
  };

  const retunePad = () => {
    if (!ctx || !padNodes) return;
    const now = ctx.currentTime;

    // Small drift step (keeps it "session-like" and not repetitive)
    padRoot = clamp(padRoot * rand(0.94, 1.06), 90, 135);
    const freqs = [padRoot, padRoot * 1.5, padRoot * 2.0];

    for (let i = 0; i < padNodes.voices.length; i += 1) {
      const v = padNodes.voices[i];
      const f = freqs[i] || freqs[freqs.length - 1];
      try {
        v.osc1.frequency.cancelScheduledValues(now);
        v.osc2.frequency.cancelScheduledValues(now);

        v.osc1.frequency.setValueAtTime(v.osc1.frequency.value, now);
        v.osc2.frequency.setValueAtTime(v.osc2.frequency.value, now);

        v.osc1.frequency.linearRampToValueAtTime(f, now + 7.0);
        v.osc2.frequency.linearRampToValueAtTime(f, now + 7.0);
      } catch {
        // ignore
      }
    }
  };

  const strike = (when) => {
    if (!ctx || !strikeBus) return;

    // A soft, bowl-like inharmonic stack
    const base = rand(180, 320);
    const partials = [1.0, 2.01, 2.99, 4.23];
    // Keep accents subtle; the continuous pad is the main experience.
    const baseAmp = mode === 'practice' ? 0.075 : 0.035;
    const decay = mode === 'practice' ? rand(4.2, 6.8) : rand(3.6, 6.0);

    for (let i = 0; i < partials.length; i += 1) {
      const ratio = partials[i];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * ratio, when);
      osc.detune.setValueAtTime(rand(-7, 7), when);

      const peak = baseAmp / (i + 1);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + decay);

      osc.connect(g);
      g.connect(strikeBus);

      osc.start(when);
      osc.stop(when + decay + 0.2);
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

    // Continuous session bed: slightly lower master gain than strike-only mode
    const targetGain = mode === 'practice' ? 0.085 : 0.07;
    // Faster fade-in so users hear it immediately after first tap.
    setMasterGain(targetGain, 0.15);

    // Ensure continuous pad exists and fade its voices in gently.
    ensurePad();
    if (padNodes && ctx) {
      const now = ctx.currentTime;
      for (const v of padNodes.voices) {
        try {
          v.gain.gain.cancelScheduledValues(now);
          v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value || 0.0001), now);
          v.gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, v.target), now + 1.2);
        } catch {
          // ignore
        }
      }
    }

    scheduleNext();
  };

  const pause = () => {
    if (!ctx) return;
    isMuted = true;
    if (timerId) window.clearTimeout(timerId);
    timerId = null;
    setMasterGain(0.0001, 0.2);
    destroyPad();
  };

  const setMode = (nextMode) => {
    mode = nextMode === 'practice' ? 'practice' : 'menu';
    if (!ctx || isMuted) return;
    const targetGain = mode === 'practice' ? 0.085 : 0.07;
    setMasterGain(targetGain);
    // Recreate pad with the new mode profile (targets/LFO)
    destroyPad();
    ensurePad();
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


