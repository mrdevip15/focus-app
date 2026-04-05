import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimerDisplay } from './components/Timer/TimerDisplay';
import { TimerControls } from './components/Timer/TimerControls';
import { ModeSelector } from './components/Modes/ModeSelector';
import { SoundSwitcher } from './components/Soundscape/SoundSwitcher';
import { SpotifyPlayer } from './components/SpotifyPlayer';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import './styles/global.css';

function App() {
  const { playChime, currentSound, isPlaying, volume, setVolume, toggleSound, stopSound } = useSound();
  const [shouldStopSpotify, setShouldStopSpotify] = useState(false);

  const handleTimerComplete = useCallback(() => {
    playChime();
    stopSound();
    setShouldStopSpotify(true);
  }, [playChime, stopSound]);

  const { timeLeft, isRunning, mode, toggle, reset, changeMode, progress } = useTimer('focus', handleTimerComplete);

  useEffect(() => {
    if (isRunning) {
      setShouldStopSpotify(false);
    }
  }, [isRunning]);

  useEffect(() => {
    if (window.api?.togglePip) {
      window.api.togglePip(isRunning);
    }
  }, [isRunning]);

  return (
    <div className={`bg-zinc-950 text-white min-h-[100dvh] transition-all duration-500 ${isRunning ? 'p-4 overflow-hidden' : ''}`}>
      {/* Draggable Title Bar */}
      <div className="h-8 w-full draggable fixed top-0 left-0 z-[100] flex items-center px-4">
        <div className="w-2 h-2 rounded-full bg-zinc-800" />
      </div>

      <main className={`container mx-auto px-6 transition-all duration-700 ${isRunning ? 'max-w-md py-4' : 'max-w-7xl py-12 md:py-24'}`}>
        <div className={`grid gap-12 lg:gap-24 items-start ${isRunning ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1.5fr_1fr]'}`}>
          {/* Left Column: Timer & Controls */}
          <section className="flex flex-col items-start w-full nodrag">
            {!isRunning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
              >
                <h1 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.3em] mb-3">Focus Session</h1>
                <p className="text-zinc-400 text-base">Deep work, simplified.</p>
              </motion.div>
            )}

            {!isRunning && <ModeSelector currentMode={mode} onModeChange={changeMode} />}

            <div className={`w-full bg-zinc-900/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all duration-500 ${isRunning ? 'p-6 no-blur' : 'p-8 md:p-16 backdrop-blur-xl'}`}>
              {/* Progress Bar */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
              
              <TimerDisplay timeLeft={timeLeft} />
              <div className="nodrag">
                <TimerControls isRunning={isRunning} toggle={toggle} reset={reset} />
              </div>
            </div>
          </section>

          {/* Right Column: Utilities */}
          {!isRunning && (
            <aside className="flex flex-col gap-8 lg:mt-32 w-full nodrag">
              <SpotifyPlayer shouldStop={shouldStopSpotify} />
              <SoundSwitcher 
                currentSound={currentSound}
                isPlaying={isPlaying}
                volume={volume}
                onVolumeChange={setVolume}
                onToggleSound={toggleSound}
              />

              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6">Philosophy</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
                </p>
              </div>
            </aside>
          )}
        </div>

        {!isRunning && (
          <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-600 gap-6 nodrag">
            <span>Focus App &copy; 2026</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

export default App;
