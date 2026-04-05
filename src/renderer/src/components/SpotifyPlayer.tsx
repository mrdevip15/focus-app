'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, 
  SpotifyLogo, X, DeviceMobile, Heart, ListBullets, MusicNotes, ArrowsClockwise
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={isPlaying ? { height: [4, 16, 8, 14, 4] } : { height: 4 }}
          transition={{
            repeat: Infinity,
            duration: 0.5 + i * 0.15,
            ease: "easeInOut",
          }}
          className="w-[3px] bg-emerald-500/90 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        />
      ))}
    </div>
  );
};

export function SpotifyPlayer({ shouldStop }: { shouldStop?: boolean }) {
  const [tokens, setTokens] = useState<any>(null);
  const tokensRef = useRef<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleState, setShuffleState] = useState(false);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateTokens = useCallback((newTokens: any) => {
    setTokens(newTokens);
    tokensRef.current = newTokens;
    if (newTokens) {
      localStorage.setItem('spotify_tokens', JSON.stringify(newTokens));
    } else {
      localStorage.removeItem('spotify_tokens');
    }
  }, []);

  useEffect(() => {
    if (shouldStop && isPlaying && tokens) {
      spotifyFetch('me/player/pause', { method: 'PUT' });
      setIsPlaying(false);
    }
  }, [shouldStop, isPlaying, tokens, spotifyFetch]);

  useEffect(() => {
    const savedTokens = localStorage.getItem('spotify_tokens');
    if (savedTokens) {
      try {
        const parsed = JSON.parse(savedTokens);
        setTokens(parsed);
        tokensRef.current = parsed;
      } catch (e) {
        localStorage.removeItem('spotify_tokens');
      }
    }

    if (window.api?.onSpotifyTokens) {
      window.api.onSpotifyTokens((newTokens) => updateTokens(newTokens));
    }
  }, [updateTokens]);

  const spotifyFetch = useCallback(async (endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> => {
    const currentTokens = tokensRef.current;
    if (!currentTokens) return null;
    setError(null);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${currentTokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 204) return { success: true };

      // Handle Rate Limiting (429)
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1');
        if (retryCount < 3) {
          await sleep(retryAfter * 1000);
          return spotifyFetch(endpoint, options, retryCount + 1);
        }
        setError('Rate limit exceeded');
        return null;
      }

      // Handle Token Expiration (401)
      if (res.status === 401 && currentTokens.refresh_token && retryCount === 0) {
        try {
          const newTokens = await window.api.refreshSpotifyToken(currentTokens.refresh_token);
          const updatedTokens = { ...currentTokens, ...newTokens };
          updateTokens(updatedTokens);
          
          // Retry original request with new tokens
          return spotifyFetch(endpoint, options, 1);
        } catch (refreshErr) {
          handleLogout();
          setError('Session expired');
          return null;
        }
      }

      const data = await res.json();
      if (!res.ok) {
        if (data.error?.message === 'No active device found') setError('Connect Device');
        else if (res.status === 403) setError('Premium Required');
        else setError(data.error?.message || 'API Error');
        return null;
      }
      return data;
    } catch (err) {
      if (retryCount < 2) {
        const backoff = Math.pow(2, retryCount) * 1000;
        await sleep(backoff);
        return spotifyFetch(endpoint, options, retryCount + 1);
      }
      setError('Connection Error');
      return null;
    }
  }, [updateTokens]);

  const fetchStatus = useCallback(async () => {
    const data = await spotifyFetch('me/player');
    if (data && !data.error) {
      setTrack(data.item);
      setIsPlaying(data.is_playing);
      setShuffleState(data.shuffle_state);
      setActiveDeviceId(data.device?.id);
    }
  }, [spotifyFetch]);

  useEffect(() => {
    if (!tokens) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [tokens, fetchStatus]);

  const handleLogin = async () => {
    try {
      if (window.api?.loginSpotify) {
        const newTokens = await window.api.loginSpotify();
        updateTokens(newTokens);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = useCallback(() => {
    updateTokens(null);
    setTrack(null);
    setIsPlaying(false);
    setError(null);
    setLikedSongs([]);
    setPlaylists([]);
  }, [updateTokens]);

  const togglePlay = async () => {
    const endpoint = isPlaying ? 'me/player/pause' : 'me/player/play';
    await spotifyFetch(endpoint, { method: 'PUT' });
    setIsPlaying(!isPlaying);
  };

  const skipNext = async () => {
    await spotifyFetch('me/player/next', { method: 'POST' });
    setTimeout(fetchStatus, 500);
  };

  const skipPrevious = async () => {
    await spotifyFetch('me/player/previous', { method: 'POST' });
    setTimeout(fetchStatus, 500);
  };

  const toggleShuffle = async () => {
    await spotifyFetch(`me/player/shuffle?state=${!shuffleState}`, { method: 'PUT' });
    setShuffleState(!shuffleState);
  };

  if (!tokens) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl transition-all hover:border-emerald-500/20 group">
        <div className="flex flex-col items-center gap-6 text-center relative z-10">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
            <SpotifyLogo size={40} weight="fill" className="text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold tracking-tight text-white">Spotify Control</h3>
            <p className="text-sm text-zinc-500 max-w-[200px] leading-relaxed">
              Control your playback directly from your focus space.
            </p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-500/10"
          >
            Connect Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Mini Player */}
      <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
        
        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{isPlaying ? 'Playing' : 'Paused'}</span>
              </div>
              <h2 className="text-lg font-bold text-white truncate leading-tight">
                {track?.name || 'No Track Selected'}
              </h2>
              <p className="text-sm text-zinc-400 truncate mt-0.5">
                {track?.artists?.map((a: any) => a.name).join(', ') || 'Waiting for active player...'}
              </p>
            </div>
            {isPlaying && <Visualizer isPlaying={isPlaying} />}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={toggleShuffle} 
              className={`p-2 transition-all hover:scale-110 active:scale-90 ${shuffleState ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Shuffle size={20} weight={shuffleState ? "bold" : "regular"} />
            </button>

            <div className="flex items-center gap-6">
              <button onClick={skipPrevious} className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-90">
                <SkipBack size={26} weight="fill" />
              </button>
              <button 
                onClick={togglePlay} 
                className="w-16 h-16 bg-white text-zinc-950 rounded-3xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/10 group/play"
              >
                <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover/play:opacity-100 transition-opacity" />
                {isPlaying ? <Pause size={32} weight="fill" className="relative z-10" /> : <Play size={32} weight="fill" className="relative z-10 translate-x-1" />}
              </button>
              <button onClick={skipNext} className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-90">
                <SkipForward size={26} weight="fill" />
              </button>
            </div>

            <button onClick={handleLogout} className="p-2 text-zinc-600 hover:text-red-500 transition-all hover:rotate-90">
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Device Status & Error */}
      <div className="px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DeviceMobile size={14} className={activeDeviceId ? 'text-emerald-500' : 'text-zinc-600'} />
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest truncate max-w-[200px]">
            {activeDeviceId ? 'Linked to Device' : 'No Device Active'}
          </span>
        </div>
        
        {error ? (
          <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest leading-none">
            {error}
          </p>
        ) : (
          <button onClick={fetchStatus} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowsClockwise size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
