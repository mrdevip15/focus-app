import { useState, useRef, useEffect, useCallback } from 'react';

// Import local music files
import rainSound from '../music/rain.mp3';
import whiteNoiseSound from '../music/white-noise.mp3';
import cafeSound from '../music/cafe.mp3';
import forestSound from '../music/forest.mp3';

export const SOUNDS = {
  rain: rainSound,
  white_noise: whiteNoiseSound,
  cafe: cafeSound,
  forest: forestSound,
} as const;

export type SoundType = keyof typeof SOUNDS;

export const useSound = () => {
  const [currentSound, setCurrentSound] = useState<SoundType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize chime - using a CDN for now as there's no chime in src/music
    chimeRef.current = new Audio('https://raw.githubusercontent.com/thesephist/sounds/master/static/mp3/chime.mp3');
  }, []);

  const playChime = useCallback(() => {
    if (chimeRef.current) {
      chimeRef.current.volume = 0.7;
      chimeRef.current.play().catch((err) => console.error("Error playing chime:", err));
    }
  }, []);

  const toggleSound = useCallback((type: SoundType) => {
    if (currentSound === type && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(SOUNDS[type]);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch((err) => console.error(`Error playing ${type}:`, err));
    
    audioRef.current = audio;
    setCurrentSound(type);
    setIsPlaying(true);
  }, [currentSound, isPlaying, volume]);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentSound(null);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    currentSound,
    isPlaying,
    volume,
    setVolume,
    toggleSound,
    stopSound,
    playChime,
  };
};
