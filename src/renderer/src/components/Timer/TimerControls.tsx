import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  isRunning: boolean;
  toggle: () => void;
  reset: () => void;
}

export const TimerControls = ({ isRunning, toggle, reset }: TimerControlsProps) => {
  return (
    <div className={`flex items-center justify-center transition-all duration-500 ${isRunning ? 'gap-4 mt-2' : 'gap-8 mt-4'}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className={`rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/5 transition-all ${isRunning ? 'p-2' : 'p-4'}`}
      >
        <ArrowClockwise size={isRunning ? 16 : 24} weight="bold" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        className={`rounded-3xl bg-white text-zinc-950 flex items-center transition-all font-semibold ${isRunning ? 'px-6 py-2 gap-2 text-sm' : 'px-10 py-5 gap-3 text-lg'}`}
      >
        {isRunning ? (
          <>
            <Pause size={16} weight="fill" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play size={24} weight="fill" />
            <span>Start</span>
          </>
        )}
      </motion.button>
    </div>
  );
};
