/// <reference types="vite/client" />

import type { VaultState } from '../../shared/types'

// Тип того, что preload кладёт в window через contextBridge.
declare global {
  interface Window {
    api: {
      getState: () => Promise<VaultState>
      chooseVault: () => Promise<VaultState>
    }
  }
}

export {}
