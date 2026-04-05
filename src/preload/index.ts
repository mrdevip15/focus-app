import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  loginSpotify: () => ipcRenderer.invoke('spotify-login'),
  onSpotifyTokens: (callback: (tokens: any) => void) => {
    ipcRenderer.on('spotify-tokens', (_event, tokens) => callback(tokens));
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
