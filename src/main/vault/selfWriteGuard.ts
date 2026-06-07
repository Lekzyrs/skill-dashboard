/**
 * Гасит эхо file-watcher'а от собственных записей дашборда.
 * Перед записью файла зовём mark(path); первое событие watcher'а по этому пути
 * consume() считает «своим» (true) и снимает метку, дальше путь снова внешний.
 */
export function createSelfWriteGuard() {
  const pending = new Set<string>()
  return {
    mark(path: string): void {
      pending.add(path)
    },
    /** true, если событие по пути — наша запись (метка при этом снимается). */
    consume(path: string): boolean {
      return pending.delete(path)
    },
    /** Снять метку без срабатывания (страховка по таймауту, если событие не пришло). */
    clear(path: string): void {
      pending.delete(path)
    }
  }
}
