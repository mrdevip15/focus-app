import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeLeft: number;
}

export const TimerDisplay = ({ timeLeft }: TimerDisplayProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const format = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[12rem] font-bold tracking-tighter mono leading-none select-none text-white"
      >
        <span>{format(minutes)}</span>
        <span className="text-zinc-700">:</span>
        <span>{format(seconds)}</span>
      </motion.div>
    </div>
  );
};
