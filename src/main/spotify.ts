import { BrowserWindow, ipcMain } from 'electron';
import crypto from 'crypto';

// In a real app, you'd prompt the user for this or use a proxy server to hide it.
const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID || '8e4f1a23c31c4f6faef49edc5614949b'; // Dummy ID to prevent crash
const REDIRECT_URI = 'focusapp://callback';
const SCOPES = ['user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing'];

let authWindow: BrowserWindow | null = null;
let codeVerifier = '';

export function setupSpotifyAuth(mainWindow: BrowserWindow) {
  ipcMain.handle('spotify-login', async () => {
    return new Promise((resolve, reject) => {
      authWindow = new BrowserWindow({
        width: 600,
        height: 800,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('scope', SCOPES.join(' '));

      authWindow.loadURL(authUrl.toString());
      authWindow.show();

      authWindow.webContents.on('will-redirect', async (event, url) => {
        if (url.startsWith(REDIRECT_URI)) {
          event.preventDefault();
          const parsedUrl = new URL(url);
          const code = parsedUrl.searchParams.get('code');
          if (code) {
            try {
              const tokens = await exchangeCodeForToken(code);
              mainWindow.webContents.send('spotify-tokens', tokens);
              resolve(tokens);
            } catch (err) {
              reject(err);
            }
          }
          if (authWindow) {
            authWindow.close();
            authWindow = null;
          }
        }
      });

      authWindow.on('closed', () => {
        authWindow = null;
      });
    });
  });
}

async function exchangeCodeForToken(code: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange token');
  }

  return response.json();
}

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('hex');
}

function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
