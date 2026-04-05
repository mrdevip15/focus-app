import { useState, useEffect, useCallback, useRef } from 'react';

export type FocusMode = 'focus' | 'deep' | 'ultra';

export const MODE_TIMES: Record<FocusMode, number> = {
  focus: 25 * 60,
  deep: 50 * 60,
  ultra: 90 * 60,
};

export const useTimer = (initialMode: FocusMode = 'focus', onComplete?: () => void) => {
  const [mode, setMode] = useState<FocusMode>(initialMode);
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES[initialMode]);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  }, [mode]);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const changeMode = useCallback((newMode: FocusMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[newMode]);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (onComplete) onComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, onComplete]);

  return {
    timeLeft,
    isRunning,
    mode,
    toggle,
    reset,
    changeMode,
    progress: (MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode],
  };
};
