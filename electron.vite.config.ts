import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

// Дефолтные точки входа: src/main/index.ts, src/preload/index.ts, src/renderer/index.html.
// В electron-vite 5 node-зависимости main/preload выносятся наружу автоматически
// (build.externalizeDeps включён по умолчанию), отдельный плагин не нужен.
export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react()]
  }
})
