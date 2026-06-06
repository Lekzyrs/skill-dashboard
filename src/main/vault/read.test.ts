import { describe, it, expect } from 'vitest'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readVault } from './read'

describe('readVault', () => {
  it('читает .md из доменных папок в темы, пропуская файлы в корне', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vault-'))
    try {
      await mkdir(join(root, 'react'), { recursive: true })
      await writeFile(
        join(root, 'react', 'React.md'),
        '---\ntitle: React\nskills:\n  - name: useEffect\n    level: 6\n---\n'
      )
      // Файл в корне базы знаний (как 00-INDEX.md) — не домен, должен быть пропущен.
      await writeFile(join(root, '00-INDEX.md'), '---\ntitle: Индекс\n---\n')

      const topics = await readVault(root)

      expect(topics).toHaveLength(1)
      expect(topics[0].domain).toBe('react')
      expect(topics[0].title).toBe('React')
      expect(topics[0].skills).toEqual([{ name: 'useEffect', level: 6 }])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
