import { app, BrowserWindow, shell } from 'electron';
import { join } from 'node:path';

const isDev = process.env.NODE_ENV === 'development';
const rendererDevUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
const preloadFile = join(__dirname, 'preload.cjs');
const rendererHtml = join(__dirname, '../dist/index.html');

const createWindow = async () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 720,
    title: 'Stock Manager',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: preloadFile,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    await window.loadURL(rendererDevUrl);
    window.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  await window.loadFile(rendererHtml);
};

app.whenReady().then(() => {
  createWindow().catch((error) => {
    console.error('[electron] Failed to create window', error);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
