import { contextBridge, ipcRenderer } from 'electron'
import type { SetLevelArgs, VaultState } from '../shared/types'

// Единственная точка, через которую renderer общается с main.
const api = {
  /** Прочитать текущее состояние: путь к базе знаний + дерево навыков. */
  getState: (): Promise<VaultState> => ipcRenderer.invoke('vault:getState'),
  /** Открыть диалог выбора папки базы знаний, вернуть обновлённое состояние. */
  chooseVault: (): Promise<VaultState> => ipcRenderer.invoke('vault:choose'),
  /** Записать уровень навыка обратно в заметку, вернуть обновлённое состояние. */
  setLevel: (args: SetLevelArgs): Promise<VaultState> => ipcRenderer.invoke('vault:setLevel', args)
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
