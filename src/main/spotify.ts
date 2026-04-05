import { BrowserWindow, ipcMain } from 'electron';
import crypto from 'crypto';

const REDIRECT_URI = 'focusapp://callback';
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
];
const SPOTIFY_CLIENT_ID = process.env.MAIN_VITE_SPOTIFY_CLIENT_ID || 'dfeac2a2c9de40768242b991f7a4e967';

let authWindow: BrowserWindow | null = null;
let codeVerifier = '';

export function setupSpotifyAuth(mainWindow: BrowserWindow) {
  ipcMain.handle('spotify-login', async () => {
    return new Promise((resolve, reject) => {
      authWindow = new BrowserWindow({
        width: 800,
        height: 900,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      authWindow.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('scope', SCOPES.join(' '));

      const checkUrl = (url: string) => {
        if (url.startsWith(REDIRECT_URI)) {
          const urlObj = new URL(url.replace('focusapp://callback', 'http://localhost'));
          const code = urlObj.searchParams.get('code');
          const error = urlObj.searchParams.get('error');

          if (code) {
            exchangeCodeForToken(code, SPOTIFY_CLIENT_ID)
              .then(tokens => {
                mainWindow.webContents.send('spotify-tokens', tokens);
                resolve(tokens);
              })
              .catch(reject)
              .finally(() => {
                if (authWindow) authWindow.close();
              });
          } else if (error) {
            reject(new Error(`Spotify Auth Error: ${error}`));
            if (authWindow) authWindow.close();
          } else {
            return false;
          }
          return true;
        }
        return false;
      };

      authWindow.webContents.on('will-navigate', (event, url) => {
        if (checkUrl(url)) event.preventDefault();
      });

      authWindow.webContents.on('will-redirect', (event, url) => {
        if (checkUrl(url)) event.preventDefault();
      });

      authWindow.loadURL(authUrl.toString());
      authWindow.show();

      authWindow.on('closed', () => {
        authWindow = null;
      });
    });
  });

  ipcMain.handle('spotify-refresh-token', async (_, refreshToken: string) => {
    return refreshSpotifyToken(refreshToken, SPOTIFY_CLIENT_ID);
  });
}

async function exchangeCodeForToken(code: string, clientId: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Token exchange failed: ${JSON.stringify(errData)}`);
  }

  return response.json();
}

async function refreshSpotifyToken(refreshToken: string, clientId: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Token refresh failed: ${JSON.stringify(errData)}`);
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
