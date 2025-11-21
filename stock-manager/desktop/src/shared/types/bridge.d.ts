export type AutoUpdaterPayload = {
  status: string;
  message?: string;
  percent?: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
};

export type AppUpdaterAPI = {
  checkForUpdates: () => Promise<unknown>;
  onStatus: (callback: (data: AutoUpdaterPayload) => void) => (() => void) | void;
};

export type StockManagerBridge = {
  apiBaseUrl: string;
};

declare global {
  interface Window {
    appUpdater?: AppUpdaterAPI;
    stockManager?: StockManagerBridge;
  }
}

export {};
