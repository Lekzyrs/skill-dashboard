import { dialog, ipcMain } from 'electron'
import { getVaultPath, setVaultPath } from './config'
import { readVault } from './vault/read'
import { writeSkillLevel } from './vault/write'
import { buildTree } from './vault/parse'
import type { SetLevelArgs, VaultState } from '../shared/types'

// Читает текущее состояние: путь из конфига + собранное дерево.
async function loadState(): Promise<VaultState> {
  const path = await getVaultPath()
  if (!path) return { path: null, tree: [] }
  try {
    const topics = await readVault(path)
    return { path, tree: buildTree(topics) }
  } catch (err) {
    console.error('[vault] не удалось прочитать базу знаний:', path, err)
    return { path, tree: [] }
  }
}

export function registerVaultIpc(): void {
  ipcMain.handle('vault:getState', () => loadState())

  ipcMain.handle('vault:choose', async () => {
    const res = await dialog.showOpenDialog({
      title: 'Выберите папку базы знаний (10-knowledge)',
      properties: ['openDirectory']
    })
    if (res.canceled || res.filePaths.length === 0) return loadState()
    await setVaultPath(res.filePaths[0])
    return loadState()
  })

  ipcMain.handle('vault:setLevel', async (_e, args: SetLevelArgs) => {
    const path = await getVaultPath()
    if (!path) return loadState()
    try {
      await writeSkillLevel(path, args.relativePath, args.skillName, args.level)
    } catch (err) {
      console.error('[vault] не удалось записать уровень:', args, err)
    }
    return loadState()
  })
}
