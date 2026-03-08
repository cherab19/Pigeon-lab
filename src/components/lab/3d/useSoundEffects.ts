import { useCallback, useRef, useState } from "react";

/** Lightweight sound effects using Web Audio API */
export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration = 0.15, type: OscillatorType = "sine", volume = 0.15) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported
    }
  }, [enabled, getCtx]);

  const playClick = useCallback(() => playTone(800, 0.05, "square", 0.08), [playTone]);
  const playSwing = useCallback(() => playTone(220, 0.3, "sine", 0.06), [playTone]);
  const playSuccess = useCallback(() => {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 120);
    setTimeout(() => playTone(784, 0.2, "sine", 0.12), 240);
  }, [playTone]);
  const playBubble = useCallback(() => playTone(600 + Math.random() * 400, 0.08, "sine", 0.05), [playTone]);
  const playHeat = useCallback(() => playTone(80, 0.5, "sawtooth", 0.03), [playTone]);
  const playPop = useCallback(() => playTone(1200, 0.04, "square", 0.1), [playTone]);

  return { enabled, setEnabled, toggleSound: () => setEnabled(p => !p), playClick, playSwing, playSuccess, playBubble, playHeat, playPop, playTone };
}
