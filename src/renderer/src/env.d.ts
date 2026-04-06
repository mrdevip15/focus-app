/// <reference types="vite/client" />

interface Window {
  api: {
    loginSpotify: () => Promise<any>;
    refreshSpotifyToken: (refreshToken: string) => Promise<any>;
    togglePip: (isPip: boolean) => void;
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    onSpotifyTokens: (callback: (tokens: any) => void) => void;
  };
}
