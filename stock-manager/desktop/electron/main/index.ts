import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron';
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

// IPC Handlers para notificaciones
ipcMain.handle('notification:show', async (_event, { title, body, urgency }) => {
  try {
    if (!Notification.isSupported()) {
      console.warn('[electron] Notifications not supported on this system');
      return { success: false, error: 'Notifications not supported' };
    }

    const notification = new Notification({
      title,
      body,
      urgency: urgency || 'normal',
      timeoutType: 'default',
    });

    notification.show();

    return { success: true };
  } catch (error) {
    console.error('[electron] Failed to show notification', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('notification:checkPermission', async () => {
  return {
    supported: Notification.isSupported(),
    permission: 'granted', // En Electron las notificaciones están siempre permitidas si están soportadas
  };
});

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
