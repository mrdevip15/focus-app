import { motion } from 'framer-motion';
import type { FocusMode } from '../../hooks/useTimer';

interface ModeSelectorProps {
  currentMode: FocusMode;
  onModeChange: (mode: FocusMode) => void;
}

const modes: { id: FocusMode; label: string; description: string }[] = [
  { id: 'focus', label: 'Focus', description: '25 min' },
  { id: 'deep', label: 'Deep Focus', description: '50 min' },
  { id: 'ultra', label: 'Ultra Focus', description: '90 min' },
];

export const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-4 mb-12">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className="relative px-6 py-3 rounded-2xl group transition-colors"
        >
          {currentMode === mode.id && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 bg-white/10 border border-white/20 rounded-2xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-start">
            <span className={`text-sm font-semibold ${currentMode === mode.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
              {mode.label}
            </span>
            <span className={`text-[10px] uppercase tracking-wider ${currentMode === mode.id ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {mode.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
