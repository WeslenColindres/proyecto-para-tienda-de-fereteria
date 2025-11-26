import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  app: {
    platform: process.platform,
    versions: process.versions
  }
});

// API de notificaciones
contextBridge.exposeInMainWorld('notifications', {
  show: (options: { title: string; body: string; urgency?: 'low' | 'normal' | 'critical' }) => {
    return ipcRenderer.invoke('notification:show', options);
  },
  checkPermission: () => {
    return ipcRenderer.invoke('notification:checkPermission');
  },
});
