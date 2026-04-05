'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, 
  SpotifyLogo, List, X, ArrowsClockwise, 
  DeviceMobile, Heart, MusicNotes
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components for Isolate Micro-animations ---

const StatusIndicator = ({ isActive, error }: { isActive: boolean; error: string | null }) => {
  if (error) return <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
  if (isActive) return (
    <div className="relative flex items-center justify-center w-2 h-2">
      <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
      <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </div>
  );
  return <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />;
};

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          animate={isPlaying ? { height: [4, 12, 6, 10, 4] } : { height: 4 }}
          transition={{
            repeat: Infinity,
            duration: 0.6 + i * 0.1,
            ease: "easeInOut",
          }}
          className="w-[2px] bg-emerald-500/80 rounded-full"
        />
      ))}
    </div>
  );
};

export function SpotifyPlayer() {
  const [tokens, setTokens] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleState, setShuffleState] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // --- API Logic ---

  useEffect(() => {
    if (window.api?.onSpotifyTokens) {
      window.api.onSpotifyTokens((newTokens) => setTokens(newTokens));
    }
  }, []);

  const spotifyFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!tokens) return null;
    setError(null);
    try {
      const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status === 204) return { success: true };
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.message === 'No active device found') setError('Connect Device');
        else if (res.status === 403) setError('Premium Required');
        else setError(data.error?.message || 'Error');
        return null;
      }
      return data;
    } catch (err) {
      setError('Connection Error');
      return null;
    }
  }, [tokens]);

  const fetchStatus = useCallback(async () => {
    const data = await spotifyFetch('me/player');
    if (data && !data.error) {
      setTrack(data.item);
      setIsPlaying(data.is_playing);
      setShuffleState(data.shuffle_state);
      setActiveDeviceId(data.device?.id);
    }
  }, [spotifyFetch]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [profileData, playlistsData] = await Promise.all([
      spotifyFetch('me'),
      spotifyFetch('me/playlists?limit=30')
    ]);
    if (profileData) setUserProfile(profileData);
    if (playlistsData) setPlaylists(playlistsData.items);
    setIsLoading(false);
  }, [spotifyFetch]);

  useEffect(() => {
    if (!tokens) return;
    fetchStatus();
    fetchData();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [tokens, fetchStatus, fetchData]);

  // --- Handlers ---

  const handleLogin = async () => {
    try {
      if (window.api?.loginSpotify) {
        const newTokens = await window.api.loginSpotify();
        setTokens(newTokens);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    setTokens(null);
    setTrack(null);
    setIsPlaying(false);
    setError(null);
    setPlaylists([]);
    setUserProfile(null);
  };

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

  const playCollection = async (uri: string) => {
    const result = await spotifyFetch('me/player/play', {
      method: 'PUT',
      body: JSON.stringify({ context_uri: uri })
    });
    if (result) {
      setShowPlaylists(false);
      setTimeout(fetchStatus, 1000);
    }
  };

  if (!tokens) {
    return (
      <div className="group relative bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl transition-all hover:border-emerald-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center shadow-inner">
            <SpotifyLogo size={40} weight="fill" className="text-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Connect Library</h3>
            <p className="text-sm text-zinc-500 max-w-[200px] leading-relaxed">
              Sync your Liked Songs and playlists for deep work.
            </p>
          </div>
          <button 
            onClick={handleLogin}
            className="group/btn relative px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/10"
          >
            Connect Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
      {/* Liquid Glass Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {showPlaylists ? (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative z-20 min-h-[400px] flex flex-col p-8 bg-zinc-950/40"
          >
            <div className="flex items-center justify-between mb-8 sticky top-0 py-2 z-30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800/50 rounded-xl">
                  <List size={18} className="text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest">Library</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchData} 
                  className="p-2.5 text-zinc-500 hover:text-white transition-all bg-zinc-800/30 rounded-xl hover:bg-zinc-800/60"
                >
                  <ArrowsClockwise size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={() => setShowPlaylists(false)} 
                  className="p-2.5 text-zinc-500 hover:text-white transition-all bg-zinc-800/30 rounded-xl hover:bg-zinc-800/60"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6">
              {/* Liked Songs Special Card */}
              {userProfile && (
                <button
                  onClick={() => playCollection(`spotify:user:${userProfile.id}:collection`)}
                  className="group/item flex items-center gap-4 p-3 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-left w-full shadow-lg"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg group-hover/item:scale-105 transition-transform duration-500">
                    <Heart size={28} weight="fill" className="text-white drop-shadow-md" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">Liked Songs</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest opacity-80">Collection</p>
                  </div>
                </button>
              )}

              <div className="grid grid-cols-2 gap-4">
                {playlists.map((pl: any) => (
                  <button
                    key={pl.id}
                    onClick={() => playCollection(pl.uri)}
                    className="group/pl flex flex-col gap-3 text-left"
                  >
                    <div className="aspect-square w-full bg-zinc-800/50 rounded-2xl overflow-hidden relative shadow-lg group-hover/pl:shadow-emerald-500/10">
                      {pl.images?.[0]?.url ? (
                        <img 
                          src={pl.images[0].url} 
                          alt={pl.name} 
                          className="w-full h-full object-cover group-hover/pl:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800/50">
                          <MusicNotes size={32} className="text-zinc-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pl:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center scale-90 group-hover/pl:scale-100 transition-transform">
                          <Play size={24} weight="fill" className="text-zinc-950 translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] px-1 text-zinc-400 font-medium truncate group-hover/pl:text-white transition-colors">{pl.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-10 flex flex-col gap-10"
          >
            {/* Header / Info Section */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIndicator isActive={!!activeDeviceId && isPlaying} error={error} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                    {error ? error : activeDeviceId ? 'Live Control' : 'Ready'}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {track ? (
                    <>
                      <h2 className="text-xl font-bold tracking-tight text-white truncate pr-2">
                        {track.name}
                      </h2>
                      <p className="text-sm font-medium text-zinc-400 truncate pr-2">
                        {track.artists?.map((a: any) => a.name).join(', ')}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold tracking-tight text-zinc-600">
                        Nothing playing
                      </h2>
                      <p className="text-sm font-medium text-zinc-500">
                        Connect to get started
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="p-3 bg-zinc-800/30 rounded-2xl border border-white/5 shadow-inner group-hover:border-emerald-500/20 transition-colors">
                  <SpotifyLogo size={24} weight="fill" className={isPlaying ? "text-emerald-500 animate-pulse" : "text-zinc-500"} />
                </div>
                {isPlaying && <Visualizer isPlaying={isPlaying} />}
              </div>
            </div>

            {/* Main Controls Section */}
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <button 
                  onClick={toggleShuffle} 
                  className={`p-2 transition-all hover:scale-110 active:scale-90 ${shuffleState ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <Shuffle size={20} weight={shuffleState ? "bold" : "regular"} />
                </button>

                <div className="flex items-center gap-8">
                  <button onClick={skipPrevious} className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-90">
                    <SkipBack size={28} weight="fill" />
                  </button>
                  
                  <button 
                    onClick={togglePlay} 
                    className="relative group/play flex items-center justify-center w-20 h-20 bg-zinc-100 hover:bg-white rounded-[2rem] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/10"
                  >
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] blur-xl opacity-0 group-hover/play:opacity-100 transition-opacity" />
                    {isPlaying ? (
                      <Pause size={36} weight="fill" className="text-zinc-950 relative z-10" />
                    ) : (
                      <Play size={36} weight="fill" className="text-zinc-950 relative z-10 translate-x-1" />
                    )}
                  </button>

                  <button onClick={skipNext} className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-90">
                    <SkipForward size={28} weight="fill" />
                  </button>
                </div>

                <div className="relative group/utils">
                  <button 
                    onClick={() => setShowPlaylists(true)}
                    className="p-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all border border-white/5"
                  >
                    <List size={20} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Footer Utilities */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  {!activeDeviceId && !error && (
                    <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest animate-pulse">
                      <DeviceMobile size={12} weight="bold" />
                      <span>Idle Device</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
                >
                  <X size={12} weight="bold" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
