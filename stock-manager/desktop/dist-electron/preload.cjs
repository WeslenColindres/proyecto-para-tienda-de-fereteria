"use strict";

// electron/preload/index.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("desktop", {
  app: {
    platform: process.platform,
    versions: process.versions
  }
});
//# sourceMappingURL=preload.cjs.map