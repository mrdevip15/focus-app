import { CloudRain, Waves, Coffee, Bird, SpeakerHigh, SpeakerX } from '@phosphor-icons/react';

import type { SoundType } from '../../hooks/useSound';

interface SoundSwitcherProps {
  currentSound: SoundType | null;
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (val: number) => void;
  onToggleSound: (type: SoundType) => void;
}

const soundOptions: { id: SoundType; icon: any; label: string }[] = [
  { id: 'rain', icon: CloudRain, label: 'Rain' },
  { id: 'white_noise', icon: Waves, label: 'Static' },
  { id: 'cafe', icon: Coffee, label: 'Cafe' },
  { id: 'forest', icon: Bird, label: 'Forest' },
];

export const SoundSwitcher = ({ 
  currentSound, 
  isPlaying, 
  volume, 
  onVolumeChange, 
  onToggleSound 
}: SoundSwitcherProps) => {
  return (
    <div className="flex flex-col gap-8 p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-xl">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Ambient</h3>
        <div className="grid grid-cols-2 gap-3">
          {soundOptions.map((sound) => (
            <button
              key={sound.id}
              onClick={() => onToggleSound(sound.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${
                currentSound === sound.id && isPlaying
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              <sound.icon size={20} weight={currentSound === sound.id && isPlaying ? 'fill' : 'bold'} />
              <span className="text-xs font-semibold">{sound.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Volume</h3>
          <span className="text-[10px] mono text-zinc-600">{Math.round(volume * 100)}%</span>
        </div>
        <div className="flex items-center gap-4">
          <SpeakerX size={16} className="text-zinc-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 accent-white"
          />
          <SpeakerHigh size={16} className="text-zinc-600" />
        </div>
      </div>
    </div>
  );
};
