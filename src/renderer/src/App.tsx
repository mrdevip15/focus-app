import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, CornersOut } from '@phosphor-icons/react';
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

  const handleMinimize = () => window.api?.minimize?.();
  const handleMaximize = () => window.api?.maximize?.();
  const handleClose = () => window.api?.close?.();

  if (isRunning) {
    return (
      <div className="h-[40px] w-[100px] bg-zinc-950/90 border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden draggable group select-none">
        {/* Progress Bar Background */}
        <div 
          className="absolute bottom-0 left-0 h-full bg-white/10 transition-all duration-300 pointer-events-none"
          style={{ width: `${progress * 100}%` }}
        />
        
        {/* Clickable Area */}
        <button 
          onClick={toggle}
          className="relative z-10 nodrag cursor-pointer flex items-center justify-center w-full h-full outline-none focus:outline-none"
        >
          <div className="pointer-events-none">
            <TimerDisplay timeLeft={timeLeft} isRunning={true} />
          </div>
        </button>

        {/* Play/Pause Overlay on Hover */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
            Pause
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-[100dvh] transition-all duration-500">
      {/* Custom Title Bar with Window Controls */}
      <div className="h-10 w-full draggable fixed top-0 left-0 z-[100] flex items-center justify-between px-4">
        <div className="flex items-center gap-2 nodrag">
          <button 
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center group"
          >
            <X size={8} className="text-red-950 opacity-0 group-hover:opacity-100" weight="bold" />
          </button>
          <button 
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 flex items-center justify-center group"
          >
            <Minus size={8} className="text-yellow-950 opacity-0 group-hover:opacity-100" weight="bold" />
          </button>
          <button 
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 flex items-center justify-center group"
          >
            <CornersOut size={8} className="text-green-950 opacity-0 group-hover:opacity-100" weight="bold" />
          </button>
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-medium select-none">Focus App</div>
        <div className="w-20" /> {/* Spacer to center the title */}
      </div>

      <main className="container mx-auto px-6 py-12 md:py-24 max-w-7xl">
        <div className="grid items-start grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-24">
          {/* Left Column: Timer & Controls */}
          <section className="flex flex-col items-start w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <h1 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.3em] mb-3">Focus Session</h1>
              <p className="text-zinc-400 text-base">Deep work, simplified.</p>
            </motion.div>

            <ModeSelector currentMode={mode} onModeChange={changeMode} />

            <div className="w-full relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl">
              {/* Progress Bar */}
              <motion.div 
                className="absolute left-0 right-0 bg-white/20 origin-left z-10 bottom-0 h-1"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
              
              <div className="flex flex-col items-center justify-center">
                <TimerDisplay timeLeft={timeLeft} isRunning={false} />
                <div className="nodrag">
                  <TimerControls isRunning={false} toggle={toggle} reset={reset} />
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Utilities */}
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
        </div>

        <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-600 gap-6 nodrag">
          <span>Focus App &copy; 2026</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
