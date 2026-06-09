import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  SetCourseStatusArgs,
  SetLevelArgs,
  ToggleMilestoneArgs,
  VaultState
} from '../shared/types'

// Единственная точка, через которую renderer общается с main.
const api = {
  /** Прочитать текущее состояние: путь к базе знаний + дерево навыков. */
  getState: (): Promise<VaultState> => ipcRenderer.invoke('vault:getState'),
  /** Открыть диалог выбора папки базы знаний, вернуть обновлённое состояние. */
  chooseVault: (): Promise<VaultState> => ipcRenderer.invoke('vault:choose'),
  /** Записать уровень навыка обратно в заметку, вернуть обновлённое состояние. */
  setLevel: (args: SetLevelArgs): Promise<VaultState> => ipcRenderer.invoke('vault:setLevel', args),
  /** Открыть ссылку курса во внешнем браузере. */
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open:external', url),
  /** Записать статус прохождения курса, вернуть обновлённое состояние. */
  setCourseStatus: (args: SetCourseStatusArgs): Promise<VaultState> =>
    ipcRenderer.invoke('courses:setStatus', args),
  /** Переключить веху курса, вернуть обновлённое состояние. */
  toggleMilestone: (args: ToggleMilestoneArgs): Promise<VaultState> =>
    ipcRenderer.invoke('courses:toggleMilestone', args),
  /** Подписаться на внешние изменения базы знаний. Возвращает функцию отписки. */
  onVaultChanged: (cb: (state: VaultState) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, state: VaultState): void => cb(state)
    ipcRenderer.on('vault:changed', listener)
    return () => ipcRenderer.removeListener('vault:changed', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
