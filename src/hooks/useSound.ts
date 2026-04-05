import { useState, useRef, useEffect, useCallback } from 'react';

export const SOUNDS = {
  rain: 'https://raw.githubusercontent.com/Muges/ambientsounds/master/sounds/rain.ogg',
  white_noise: 'https://raw.githubusercontent.com/Muges/ambientsounds/master/sounds/white_noise.ogg',
  cafe: 'https://raw.githubusercontent.com/Muges/ambientsounds/master/sounds/coffee_shop.ogg',
  forest: 'https://raw.githubusercontent.com/Muges/ambientsounds/master/sounds/birds.ogg',
} as const;

export type SoundType = keyof typeof SOUNDS;

export const useSound = () => {
  const [currentSound, setCurrentSound] = useState<SoundType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize chime
    chimeRef.current = new Audio('https://raw.githubusercontent.com/thesephist/sounds/master/static/mp3/chime.mp3');
  }, []);

  const playChime = useCallback(() => {
    if (chimeRef.current) {
      chimeRef.current.volume = 0.7;
      chimeRef.current.play().catch(() => {});
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
    audio.play().catch(() => {});
    
    audioRef.current = audio;
    setCurrentSound(type);
    setIsPlaying(true);
  }, [currentSound, isPlaying, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return {
    currentSound,
    isPlaying,
    volume,
    setVolume,
    toggleSound,
    playChime,
  };
};
