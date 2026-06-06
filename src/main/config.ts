import { app } from 'electron'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

// Путь к базе знаний храним в userData приложения — переживает перезапуск.
function configFile(): string {
  return join(app.getPath('userData'), 'config.json')
}

export async function getVaultPath(): Promise<string | null> {
  try {
    const raw = await readFile(configFile(), 'utf8')
    const data = JSON.parse(raw) as { vaultPath?: unknown }
    return typeof data.vaultPath === 'string' ? data.vaultPath : null
  } catch {
    return null
  }
}

export async function setVaultPath(path: string): Promise<void> {
  await writeFile(configFile(), JSON.stringify({ vaultPath: path }, null, 2), 'utf8')
}
