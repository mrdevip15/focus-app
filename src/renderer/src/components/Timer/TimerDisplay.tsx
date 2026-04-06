import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeLeft: number;
  isRunning?: boolean;
}

export const TimerDisplay = ({ timeLeft, isRunning }: TimerDisplayProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const format = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-500 ${isRunning ? 'py-0' : 'py-12'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`font-bold tracking-tighter mono leading-none select-none text-white transition-all duration-500 ${isRunning ? 'text-[1.1rem]' : 'text-[12rem]'}`}
      >
        <span>{format(minutes)}</span>
        <span className={`${isRunning ? 'text-zinc-600 px-[1px]' : 'text-zinc-700'}`}>:</span>
        <span>{format(seconds)}</span>
      </motion.div>
    </div>
  );
};
