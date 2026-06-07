import { watch, type FSWatcher } from 'chokidar'
import { createSelfWriteGuard } from './selfWriteGuard'

// Одно окно, один vault — модульный синглтон оправдан.
const guard = createSelfWriteGuard()
let watcher: FSWatcher | null = null
let onChange: (() => void) | null = null
let debounce: ReturnType<typeof setTimeout> | null = null

/** Что делать при внешнем изменении базы знаний. Ставится один раз из main. */
export function setVaultChangeHandler(cb: () => void): void {
  onChange = cb
}

/**
 * Помечает абсолютный путь как нашу запись — следующее событие watcher'а по нему
 * не считается внешним. Страховка: если событие не придёт, метка снимется через 3с.
 */
export function markSelfWrite(absPath: string): void {
  guard.mark(absPath)
  setTimeout(() => guard.clear(absPath), 3000)
}

/**
 * Начинает следить за базой знаний (рекурсивно). На изменение .md-файла, не являющегося
 * нашей записью, зовёт onChange с дебаунсом 200мс. Повторный вызов перенаводит на новый root.
 */
export function startWatching(root: string): void {
  stopWatching()
  watcher = watch(root, { ignoreInitial: true })
  const handle = (filePath: string): void => {
    if (!filePath.endsWith('.md')) return
    if (guard.consume(filePath)) return // наша запись — игнорируем эхо
    if (debounce) clearTimeout(debounce)
    debounce = setTimeout(() => onChange?.(), 200)
  }
  watcher.on('add', handle).on('change', handle).on('unlink', handle)
}

export function stopWatching(): void {
  if (debounce) {
    clearTimeout(debounce)
    debounce = null
  }
  if (watcher) {
    void watcher.close()
    watcher = null
  }
}
