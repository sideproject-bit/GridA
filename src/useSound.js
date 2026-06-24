import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { useViewport } from "./hooks/useViewport";

export function useSound(soundOn) {
  const synth = useRef(null);

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle4" },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.25 },
      volume: -10,
    }).toDestination();

    // Unlock AudioContext on first user gesture.
    // Must be synchronous within the event handler — no await.
    const unlock = () => Tone.start();
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      synth.current?.dispose();
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return useCallback((note = "C5", dur = "32n") => {
    if (!soundOn) return;
    // Skip silently if AudioContext isn't running yet — prevents burst on first click
    if (Tone.getContext().state !== "running") return;
    synth.current?.triggerAttackRelease(note, dur);
  }, [soundOn]);
}

// Backward-compatible alias — true when viewport is mobile-width (≤640px).
// Prefer useViewport() directly for new code.
export function useCompactDetect() {
  return useViewport().isMobile;
}
