export interface DesktopBridge {
  app: {
    platform: NodeJS.Platform;
    versions: NodeJS.Process['versions'];
  };
}

declare global {
  interface Window {
    desktop: DesktopBridge;
  }
}

export {};
