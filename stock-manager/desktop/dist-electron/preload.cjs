"use strict";

// electron/preload/index.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("desktop", {
  app: {
    platform: process.platform,
    versions: process.versions
  }
});
import_electron.contextBridge.exposeInMainWorld("notifications", {
  show: (options) => {
    return import_electron.ipcRenderer.invoke("notification:show", options);
  },
  checkPermission: () => {
    return import_electron.ipcRenderer.invoke("notification:checkPermission");
  }
});
//# sourceMappingURL=preload.cjs.map