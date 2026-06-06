import { contextBridge, ipcRenderer } from 'electron'

// Единственная точка, через которую renderer общается с main.
// Реальные методы (читать дерево, писать уровень) добавим на следующих фазах.
const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping')
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
