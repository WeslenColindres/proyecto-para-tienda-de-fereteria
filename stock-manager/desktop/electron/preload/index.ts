import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  app: {
    platform: process.platform,
    versions: process.versions
  }
});
