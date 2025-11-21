"use strict";

// electron/main/index.ts
var import_electron = require("electron");
var import_node_path = require("path");
var isDev = true;
var rendererDevUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
var preloadFile = (0, import_node_path.join)(__dirname, "preload.cjs");
var rendererHtml = (0, import_node_path.join)(__dirname, "../dist/index.html");
var createWindow = async () => {
  const window = new import_electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 720,
    title: "Stock Manager",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: preloadFile,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    import_electron.shell.openExternal(url);
    return { action: "deny" };
  });
  if (isDev) {
    await window.loadURL(rendererDevUrl);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }
  await window.loadFile(rendererHtml);
};
import_electron.app.whenReady().then(() => {
  createWindow().catch((error) => {
    console.error("[electron] Failed to create window", error);
  });
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
//# sourceMappingURL=main.cjs.map