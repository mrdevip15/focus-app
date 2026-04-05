import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  isRunning: boolean;
  toggle: () => void;
  reset: () => void;
}

export const TimerControls = ({ isRunning, toggle, reset }: TimerControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-8 mt-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className="p-4 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white border border-white/5"
      >
        <ArrowClockwise size={24} weight="bold" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        className="px-10 py-5 rounded-3xl bg-white text-zinc-950 flex items-center gap-3 font-semibold text-lg"
      >
        {isRunning ? (
          <>
            <Pause size={24} weight="fill" />
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
