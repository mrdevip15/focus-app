import { app, shell, BrowserWindow, ipcMain, screen } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { setupSpotifyAuth } from './spotify';

app.setAsDefaultProtocolClient('focusapp');

let mainWindow: BrowserWindow | null = null;
const ORIGINAL_WIDTH = 900;
const ORIGINAL_HEIGHT = 670;
const PIP_WIDTH = 100;
const PIP_HEIGHT = 40;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    minWidth: 310,
    minHeight: 400,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    resizable: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  setupSpotifyAuth(mainWindow);
}

ipcMain.on('toggle-pip', (event, isPip) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  if (isPip) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;
    
    win.setMinimumSize(PIP_WIDTH, PIP_HEIGHT);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setSize(PIP_WIDTH, PIP_HEIGHT, true);
    win.setPosition(width - PIP_WIDTH - 20, 40, true);
    win.setOpacity(0.85);
    win.setResizable(false);
  } else {
    win.setMinimumSize(310, 400);
    win.setAlwaysOnTop(false);
    win.setSize(ORIGINAL_WIDTH, ORIGINAL_HEIGHT, true);
    win.center();
    win.setOpacity(1.0);
    win.setResizable(true);
  }
});

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
