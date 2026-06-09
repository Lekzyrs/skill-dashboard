import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { registerVaultIpc, loadState } from './ipc'
import { setVaultChangeHandler, startWatching, stopWatching } from './vault/watcher'
import { getVaultPath } from './config'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    show: false,
    // В тон --bg (oklch(0.205 0.016 295)) — холодный фиолетовый сумрак, не нейтральный near-black,
    // чтобы при ресайзе/старте не мелькал фон не в тон теме.
    backgroundColor: '#18161e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  mainWindow = win
  win.on('ready-to-show', () => win.show())

  // В dev electron-vite поднимает renderer на URL, в проде грузим собранный html.
  const devUrl = process.env.ELECTRON_RENDERER_URL
  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  registerVaultIpc()

  // Внешнее изменение базы знаний → перечитать состояние и протолкнуть в renderer.
  setVaultChangeHandler(async () => {
    const state = await loadState()
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:changed', state)
    }
  })

  createWindow()

  const path = await getVaultPath()
  if (path) startWatching(path)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopWatching()
  if (process.platform !== 'darwin') app.quit()
})
