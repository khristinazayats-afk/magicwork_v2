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
  let bus = null;
  /** @type {BiquadFilterNode | null} */
  let lowpass = null;

  /** @type {number | null} */
  let timerId = null;
  let mode = 'menu'; // 'menu' | 'practice'
  let isMuted = true;

  const rand = (min, max) => min + Math.random() * (max - min);

  const ensure = () => {
    if (ctx && master && bus && lowpass) return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      throw new Error('WebAudio not supported in this browser');
    }

    ctx = new Ctx();

    bus = ctx.createGain();
    bus.gain.value = 0.9;

    lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1100;
    lowpass.Q.value = 0.7;

    master = ctx.createGain();
    master.gain.value = 0.0001;

    // Routing: oscillators -> bus -> lowpass -> master -> speakers
    bus.connect(lowpass);
    lowpass.connect(master);
    master.connect(ctx.destination);
  };

  const setMasterGain = (nextGain) => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const current = Math.max(0.0001, Number(master.gain.value) || 0.0001);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(current, now);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, nextGain), now + 0.6);
  };

  const strike = (when) => {
    if (!ctx || !bus) return;

    // A soft, bowl-like inharmonic stack
    const base = rand(180, 320);
    const partials = [1.0, 2.01, 2.99, 4.23];
    const baseAmp = mode === 'practice' ? 0.36 : 0.26;
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
      g.connect(bus);

      osc.start(when);
      osc.stop(when + decay + 0.2);
    }
  };

  const scheduleNext = () => {
    if (timerId) window.clearTimeout(timerId);
    timerId = null;

    if (!ctx || isMuted) return;

    const delayMs = mode === 'practice' ? rand(5000, 9000) : rand(9000, 16000);
    timerId = window.setTimeout(() => {
      if (!ctx || isMuted) return;
      const now = ctx.currentTime;

      strike(now);
      // Occasional second strike for a gentle "repeat" feel in practice
      if (mode === 'practice' && Math.random() < 0.45) {
        strike(now + rand(0.7, 1.6));
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

    const targetGain = mode === 'practice' ? 0.085 : 0.055;
    setMasterGain(targetGain);

    // Play an immediate gentle strike so it feels "on" right away (no long initial silence).
    if (ctx) {
      const now = ctx.currentTime;
      strike(now + 0.05);
      if (mode === 'practice') {
        strike(now + 1.0);
      }
    }

    scheduleNext();
  };

  const pause = () => {
    if (!ctx) return;
    isMuted = true;
    if (timerId) window.clearTimeout(timerId);
    timerId = null;
    setMasterGain(0.0001);
  };

  const setMode = (nextMode) => {
    mode = nextMode === 'practice' ? 'practice' : 'menu';
    if (!ctx || isMuted) return;
    const targetGain = mode === 'practice' ? 0.085 : 0.055;
    setMasterGain(targetGain);
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
        const engine = ensureEngine();
        setHasStarted(true);
        await engine.start(nextMode);
        setIsPlaying(true);
        return true;
      } catch (e) {
        devWarn('[AmbientSound] Failed to start bowls audio:', e);
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


