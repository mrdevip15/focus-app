/// <reference types="vite/client" />

interface Window {
  api: {
    loginSpotify: () => Promise<any>;
    refreshSpotifyToken: (refreshToken: string) => Promise<any>;
    togglePip: (isPip: boolean) => void;
    onSpotifyTokens: (callback: (tokens: any) => void) => void;
  };
}
