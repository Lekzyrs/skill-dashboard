/// <reference types="vite/client" />

import type {
  SetCourseStatusArgs,
  SetLevelArgs,
  ToggleMilestoneArgs,
  VaultState
} from '../../shared/types'

// Тип того, что preload кладёт в window через contextBridge.
declare global {
  interface Window {
    api: {
      getState: () => Promise<VaultState>
      chooseVault: () => Promise<VaultState>
      setLevel: (args: SetLevelArgs) => Promise<VaultState>
      openExternal: (url: string) => Promise<void>
      setCourseStatus: (args: SetCourseStatusArgs) => Promise<VaultState>
      toggleMilestone: (args: ToggleMilestoneArgs) => Promise<VaultState>
      onVaultChanged: (cb: (state: VaultState) => void) => () => void
    }
  }
}

export {}
