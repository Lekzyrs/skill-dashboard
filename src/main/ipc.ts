import { dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { getVaultPath, setVaultPath } from './config'
import { readVault } from './vault/read'
import { writeSkillLevel } from './vault/write'
import { buildTree } from './vault/parse'
import { readProgress, writeCourseStatus, toggleMilestone, PROGRESS_FILE } from './vault/coursesProgress'
import { markSelfWrite, startWatching } from './vault/watcher'
import type {
  SetCourseStatusArgs,
  SetLevelArgs,
  ToggleMilestoneArgs,
  VaultState
} from '../shared/types'

// Читает текущее состояние: путь из конфига + собранное дерево + прогресс курсов.
export async function loadState(): Promise<VaultState> {
  const path = await getVaultPath()
  if (!path) return { path: null, tree: [], courseProgress: {}, courseMilestones: {} }
  try {
    const [topics, progress] = await Promise.all([readVault(path), readProgress(path)])
    return {
      path,
      tree: buildTree(topics),
      courseProgress: progress.status,
      courseMilestones: progress.milestones
    }
  } catch (err) {
    console.error('[vault] не удалось прочитать базу знаний:', path, err)
    return { path, tree: [], courseProgress: {}, courseMilestones: {} }
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
    startWatching(res.filePaths[0])
    return loadState()
  })

  ipcMain.handle('vault:setLevel', async (_e, args: SetLevelArgs) => {
    const path = await getVaultPath()
    if (!path) return loadState()
    try {
      markSelfWrite(join(path, args.relativePath))
      await writeSkillLevel(path, args.relativePath, args.skillName, args.level)
    } catch (err) {
      console.error('[vault] не удалось записать уровень:', args, err)
    }
    return loadState()
  })

  // Открыть ссылку курса во внешнем браузере. Только http(s) — каталог наш, но не пускаем
  // произвольные схемы (file:, javascript: и пр.) в shell.
  ipcMain.handle('open:external', (_e, url: string) => {
    if (/^https?:\/\//i.test(url)) return shell.openExternal(url)
  })

  ipcMain.handle('courses:setStatus', async (_e, args: SetCourseStatusArgs) => {
    const path = await getVaultPath()
    if (!path) return loadState()
    try {
      markSelfWrite(join(path, PROGRESS_FILE))
      await writeCourseStatus(path, args.courseId, args.status)
    } catch (err) {
      console.error('[vault] не удалось записать статус курса:', args, err)
    }
    return loadState()
  })

  ipcMain.handle('courses:toggleMilestone', async (_e, args: ToggleMilestoneArgs) => {
    const path = await getVaultPath()
    if (!path) return loadState()
    try {
      markSelfWrite(join(path, PROGRESS_FILE))
      await toggleMilestone(path, args.courseId, args.index)
    } catch (err) {
      console.error('[vault] не удалось переключить веху курса:', args, err)
    }
    return loadState()
  })
}
