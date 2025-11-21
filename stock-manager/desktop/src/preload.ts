import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

type StatusPayload = {
  status: string;
  message?: string;
  percent?: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
};

type StatusCallback = (payload: StatusPayload) => void;

const apiBaseUrl = process.env.STOCK_MANAGER_API_URL ?? 'http://localhost:4000';

contextBridge.exposeInMainWorld('stockManager', {
  apiBaseUrl,
});

contextBridge.exposeInMainWorld('appUpdater', {
  checkForUpdates: () => ipcRenderer.invoke('autoUpdater:check'),
  onStatus: (callback: StatusCallback) => {
    const listener = (_event: IpcRendererEvent, data: StatusPayload) => {
      if (typeof callback === 'function') {
        callback(data);
      }
    };

    ipcRenderer.on('autoUpdater:status', listener);

    return () => {
      ipcRenderer.removeListener('autoUpdater:status', listener);
    };
  },
});
