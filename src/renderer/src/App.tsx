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
  const { playChime, currentSound, isPlaying, volume, setVolume, toggleSound } = useSound();
  const { timeLeft, isRunning, mode, toggle, reset, changeMode, progress } = useTimer('focus', playChime);

  return (
    <div className="bg-zinc-950 text-white min-h-[100dvh]">
      <main className="container max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-24 items-start">
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

            <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
              {/* Progress Bar */}
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-white/20"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ ease: "linear" }}
              />
              
              <TimerDisplay timeLeft={timeLeft} />
              <TimerControls isRunning={isRunning} toggle={toggle} reset={reset} />
            </div>
          </section>

          {/* Right Column: Utilities */}
          <aside className="flex flex-col gap-8 lg:mt-32 w-full">
            <SpotifyPlayer />
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

        <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-600 gap-6">
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
