/// <reference types="vite/client" />

// Тип того, что preload кладёт в window через contextBridge.
declare global {
  interface Window {
    api: {
      ping: () => Promise<string>
    }
  }
}

export {}
