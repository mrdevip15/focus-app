import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  loginSpotify: () => ipcRenderer.invoke('spotify-login'),
  refreshSpotifyToken: (refreshToken: string) => ipcRenderer.invoke('spotify-refresh-token', refreshToken),
  togglePip: (isPip: boolean) => ipcRenderer.send('toggle-pip', isPip),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
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
