import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SpotifyLogo } from '@phosphor-icons/react';

export function SpotifyPlayer() {
  const [tokens, setTokens] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (window.api?.onSpotifyTokens) {
      window.api.onSpotifyTokens((newTokens) => {
        setTokens(newTokens);
      });
    }
  }, []);

  useEffect(() => {
    if (!tokens) return;
    
    const fetchCurrentTrack = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (res.status === 200) {
          const data = await res.json();
          setTrack(data.item);
          setIsPlaying(data.is_playing);
        } else if (res.status === 204) {
           // No content
           setTrack(null);
           setIsPlaying(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 5000);
    return () => clearInterval(interval);
  }, [tokens]);

  const handleLogin = async () => {
    try {
      if (window.api?.loginSpotify) {
        const newTokens = await window.api.loginSpotify();
        setTokens(newTokens);
      } else {
        console.warn("Electron API not available");
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const togglePlay = async () => {
    if (!tokens) return;
    const endpoint = isPlaying ? 'pause' : 'play';
    try {
      await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error(err);
    }
  };

  const skipNext = async () => {
    if (!tokens) return;
    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      // State will update on next poll
    } catch (err) {
      console.error(err);
    }
  };

  if (!tokens) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex flex-col items-center gap-4">
        <SpotifyLogo size={32} weight="fill" className="text-[#1DB954]" />
        <p className="text-sm text-zinc-400 text-center">Connect Spotify to control playback during your focus session.</p>
        <button 
          onClick={handleLogin}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-2 px-6 rounded-full transition-colors text-sm"
        >
          Connect Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3 w-full">
        <SpotifyLogo size={24} weight="fill" className="text-[#1DB954]" />
        <div className="flex-1 overflow-hidden">
          {track ? (
            <>
              <p className="text-sm text-white font-medium truncate">{track.name}</p>
              <p className="text-xs text-zinc-400 truncate">{track.artists?.map((a: any) => a.name).join(', ')}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">No track playing</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6 mt-2">
        <button onClick={togglePlay} className="text-white hover:text-[#1DB954] transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10">
          {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
        </button>
        <button onClick={skipNext} className="text-white hover:text-[#1DB954] transition-colors p-2">
          <SkipForward size={24} weight="fill" />
        </button>
      </div>
    </div>
  );
}
