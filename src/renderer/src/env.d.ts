/// <reference types="vite/client" />

interface Window {
  api: {
    loginSpotify: () => Promise<any>;
    onSpotifyTokens: (callback: (tokens: any) => void) => void;
  };
}
