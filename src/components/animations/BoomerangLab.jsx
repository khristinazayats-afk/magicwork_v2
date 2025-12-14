import { useEffect, useRef, useState, useMemo } from 'react';

// Lightweight canvas-based lab to preview and export boomerang-style loops
// for schematic practices (physiological sigh-like and particles).
export default function BoomerangLab() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [space, setSpace] = useState('Breathe to Relax');
  const [mode, setMode] = useState('sigh'); // sigh | particles
  const [durationMs, setDurationMs] = useState(4000); // forward pass duration
  const [fps, setFps] = useState(24);
  const [particleCount, setParticleCount] = useState(120);
  const [frames, setFrames] = useState([]); // ImageData frames
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Presets per space
  const presets = useMemo(() => ({
    'Gentle De-Stress': { mode: 'particles', particleCount: 90, durationMs: 5000 },
    'Slow Morning': { mode: 'particles', particleCount: 120, durationMs: 4500 },
    'Breathe to Relax': { mode: 'sigh', particleCount: 110, durationMs: 4000 },
    'Get in the Flow State': { mode: 'particles', particleCount: 160, durationMs: 3500 },
    'Drift into Sleep': { mode: 'particles', particleCount: 80, durationMs: 6000 },
  }), []);

  useEffect(() => {
    const p = presets[space];
    if (p) {
      setMode(p.mode);
      setParticleCount(p.particleCount);
      setDurationMs(p.durationMs);
    }
  }, [space, presets]);

  // Render a single frame at t in [0, 1] for forward pass
  const renderFrame = (ctx, t, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    if (mode === 'sigh') {
      // Three-phase curve (inhale1 -> inhale2 -> exhale)
      const inhale1 = 0.5; // fraction
      const inhale2 = 0.25;
      const exhale = 0.25;

      let phase = 'exhale';
      let phaseT = 0;
      if (t < inhale1) {
        phase = 'inhale1';
        phaseT = t / inhale1;
      } else if (t < inhale1 + inhale2) {
        phase = 'inhale2';
        phaseT = (t - inhale1) / inhale2;
      } else {
        phase = 'exhale';
        phaseT = (t - inhale1 - inhale2) / exhale;
      }

      // Base radius animates with phase
      const baseScale =
        phase === 'inhale1' ? 0.6 + 0.15 * phaseT :
        phase === 'inhale2' ? 0.75 + 0.05 * phaseT :
        0.8 - 0.5 * phaseT; // exhale down to 0.3

      const particleN = particleCount;
      const golden = Math.PI * (3 - Math.sqrt(5));
      ctx.fillStyle = '#1e2d2e';
      for (let i = 0; i < particleN; i++) {
        const ang = i * golden;
        const r = Math.sqrt(i) * 4.5;
        const x = cx + Math.cos(ang) * r * baseScale;
        const y = cy + Math.sin(ang) * r * baseScale;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ripple at end of inhale2
      if (phase === 'inhale2') {
        const ripple = 20 + phaseT * 80;
        ctx.strokeStyle = '#1e2d2e';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35 * (1 - phaseT);
        ctx.beginPath();
        ctx.arc(cx, cy, ripple, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Diffusion during exhale
      if (phase === 'exhale') {
        const diff = 40 + phaseT * 160;
        const grd = ctx.createRadialGradient(cx, cy, Math.max(5, 80 - diff * 0.3), cx, cy, diff);
        grd.addColorStop(0, 'rgba(148, 209, 196, 0.12)');
        grd.addColorStop(1, 'rgba(148, 209, 196, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, diff, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Particles flow field
      const particleN = particleCount;
      ctx.fillStyle = '#1e2d2e';
      for (let i = 0; i < particleN; i++) {
        const a = i * 12.9898;
        const r = 40 + (i % 40);
        const ang = a * 0.015 + Math.sin(t * Math.PI * 2 + i * 0.05) * 0.8;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const capture = async () => {
    if (isCapturing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    setIsCapturing(true);
    const totalFrames = Math.max(4, Math.round((durationMs / 1000) * fps));
    const forwardFrames = [];
    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1); // 0..1
      renderFrame(ctx, t, width, height);
      forwardFrames.push(ctx.getImageData(0, 0, width, height));
      // Small delay to allow UI thread breathe on very fast machines
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 0));
    }

    // Build boomerang: forward + reverse (dedup ends)
    const reverseFrames = forwardFrames.slice(1, -1).reverse();
    const all = [...forwardFrames, ...reverseFrames];
    setFrames(all);
    setIsCapturing(false);
  };

  // Preview loop using requestAnimationFrame
  useEffect(() => {
    if (!frames.length) return;
    const canvas = previewRef.current;
    const ctx = canvas.getContext('2d');
    let idx = 0;
    let raf;
    let last = performance.now();
    const frameInterval = 1000 / fps;

    const tick = (now) => {
      const elapsed = now - last;
      if (elapsed >= frameInterval) {
        const frame = frames[idx];
        ctx.putImageData(frame, 0, 0);
        idx = (idx + 1) % frames.length;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };

    setIsPlaying(true);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setIsPlaying(false);
    };
  }, [frames, fps]);

  const exportWebM = async () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const stream = canvas.captureStream(fps);
    recordedChunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boomerang-${mode}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    // Play frames for a few loops while recording
    const loopsToRecord = 3;
    const msPerFrame = 1000 / fps;
    const totalMs = frames.length * msPerFrame * loopsToRecord;
    mr.start();
    setTimeout(() => mr.stop(), totalMs);
  };

  // Initial base render so canvas is not blank
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    renderFrame(ctx, 0, canvas.width, canvas.height);
  }, [mode, particleCount]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center gap-6 p-4">
      <h2 className="text-lg font-semibold">Boomerang Lab</h2>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Space</label>
          <select className="border rounded px-2 py-1" value={space} onChange={e => setSpace(e.target.value)}>
            {Object.keys(presets).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Mode</label>
          <select className="border rounded px-2 py-1" value={mode} onChange={e => setMode(e.target.value)}>
            <option value="sigh">Physiological Sigh (schematic)</option>
            <option value="particles">Particles Flow</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Duration (ms, forward)</label>
          <input className="border rounded px-2 py-1 w-32" type="number" value={durationMs} onChange={e => setDurationMs(parseInt(e.target.value || '0', 10))} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">FPS</label>
          <input className="border rounded px-2 py-1 w-20" type="number" value={fps} onChange={e => setFps(parseInt(e.target.value || '0', 10))} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Particles</label>
          <input className="border rounded px-2 py-1 w-24" type="number" value={particleCount} onChange={e => setParticleCount(parseInt(e.target.value || '0', 10))} />
        </div>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={capture} disabled={isCapturing}>
          {isCapturing ? 'Capturing…' : 'Capture Frames'}
        </button>
        <button className="px-3 py-2 rounded border" onClick={exportWebM} disabled={!frames.length}>
          Export WebM
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm">Source (live render)</div>
          <canvas ref={canvasRef} width={512} height={512} className="border rounded" />
          <div className="text-xs text-gray-500">Adjust parameters and click Capture to sample frames</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm">Boomerang Preview</div>
          <canvas ref={previewRef} width={512} height={512} className="border rounded" />
          <div className="text-xs text-gray-500">{frames.length ? `${frames.length} frames @ ${fps}fps` : 'No frames yet'}</div>
        </div>
      </div>
    </div>
  );
}


