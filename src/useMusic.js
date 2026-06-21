import { useState, useRef, useEffect, useCallback } from "react";

export const MUSIC_TRACKS = [
  "Baby's breath", "Buttercup", "Chamomile", "Daffodil", "Dandelion",
  "Forget-Me-Not", "Hyacinth", "Jasmine", "Lily of the valley",
  "Magnolia", "Primrose", "Snowdrop",
];

export function useMusicPlayer() {
  const [trackIndex, setTrackIndex] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (trackIndex === null) return;
    const audio = new Audio(`/music/${encodeURIComponent(MUSIC_TRACKS[trackIndex])}.mp3`);
    audio.loop = true;
    audio.volume = 0.45;
    audio.play().catch(() => { setTrackIndex(null); });
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, [trackIndex]);

  const selectTrack = useCallback((idx) => setTrackIndex(idx), []);
  const stop = useCallback(() => setTrackIndex(null), []);

  return {
    trackIndex,
    trackName: trackIndex !== null ? MUSIC_TRACKS[trackIndex] : null,
    tracks: MUSIC_TRACKS,
    selectTrack,
    stop,
  };
}
