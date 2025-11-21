import { BrowserWindow, dialog, ipcMain } from 'electron';
import log from 'electron-log';
import {
  autoUpdater,
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater';

log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

interface StatusPayload {
  status: string;
  message?: string;
  percent?: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
}

let currentWindow: BrowserWindow | null = null;
let listenersRegistered = false;
let ipcRegistered = false;

export function initAutoUpdater(window: BrowserWindow | null) {
  currentWindow = window;

  if (listenersRegistered) {
    return;
  }
  listenersRegistered = true;

  autoUpdater.on('checking-for-update', () => {
    sendStatus('checking-for-update', 'Buscando actualizaciones...');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    sendStatus(
      'update-available',
      `Nueva versión disponible: ${info.version}`,
    );

    const win = getSafeWindow();

    const selection = win
      ? dialog.showMessageBoxSync(win, {
          type: 'question',
          buttons: ['Descargar ahora', 'Más tarde'],
          defaultId: 0,
          cancelId: 1,
          title: 'Actualización disponible',
          message: `Se encontró la versión ${info.version}. ¿Deseas descargarla ahora?`,
        })
      : dialog.showMessageBoxSync({
          type: 'question',
          buttons: ['Descargar ahora', 'Más tarde'],
          defaultId: 0,
          cancelId: 1,
          title: 'Actualización disponible',
          message: `Se encontró la versión ${info.version}. ¿Deseas descargarla ahora?`,
        });

    if (selection === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-not-available', () => {
    sendStatus(
      'update-not-available',
      'No hay nuevas actualizaciones disponibles.',
    );
  });

  autoUpdater.on('error', (error: Error) => {
    const message = `Error en el proceso de actualización: ${error.message}`;
    log.error(message);
    sendStatus('error', message);
  });

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    const percent = Math.round(progress.percent ?? 0);

    sendStatus(
      'download-progress',
      `Descargando actualización... ${percent}%`,
      {
        percent,
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred,
      },
    );
  });

  autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
    sendStatus(
      'update-downloaded',
      `Actualización ${info.version} descargada.`,
    );

    const win = getSafeWindow();

    const choice = win
      ? dialog.showMessageBoxSync(win, {
          type: 'question',
          buttons: ['Instalar y reiniciar', 'Más tarde'],
          defaultId: 0,
          cancelId: 1,
          title: 'Actualización lista',
          message:
            'La actualización se ha descargado. ¿Deseas instalarla ahora?',
        })
      : dialog.showMessageBoxSync({
          type: 'question',
          buttons: ['Instalar y reiniciar', 'Más tarde'],
          defaultId: 0,
          cancelId: 1,
          title: 'Actualización lista',
          message:
            'La actualización se ha descargado. ¿Deseas instalarla ahora?',
        });

    if (choice === 0) {
      autoUpdater.quitAndInstall();
    }
  });
}

export function registerAutoUpdaterIPC(window: BrowserWindow | null) {
  currentWindow = window;

  if (ipcRegistered) {
    return;
  }
  ipcRegistered = true;

  ipcMain.handle('autoUpdater:check', async () => {
    sendStatus('manual-check', 'Verificando actualizaciones bajo demanda...');
    autoUpdater.checkForUpdates();
    return true;
  });
}

function sendStatus(
  status: string,
  message?: string,
  extra: Omit<StatusPayload, 'status' | 'message'> = {},
) {
  const targetWindow = getSafeWindow();
  if (!targetWindow) {
    return;
  }

  targetWindow.webContents.send('autoUpdater:status', {
    status,
    message,
    ...extra,
  });
}

function getSafeWindow(): BrowserWindow | null {
  if (!currentWindow || currentWindow.isDestroyed()) {
    return null;
  }

  return currentWindow;
}
