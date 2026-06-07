/// <reference types="vite/client" />

import type { SetLevelArgs, VaultState } from '../../shared/types'

// Тип того, что preload кладёт в window через contextBridge.
declare global {
  interface Window {
    api: {
      getState: () => Promise<VaultState>
      chooseVault: () => Promise<VaultState>
      setLevel: (args: SetLevelArgs) => Promise<VaultState>
      onVaultChanged: (cb: (state: VaultState) => void) => () => void
    }
  }
}

export {}
