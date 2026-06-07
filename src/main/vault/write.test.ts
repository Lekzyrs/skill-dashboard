import { describe, it, expect } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSkillLevel } from './write'
import { parseNote } from './parse'

describe('writeSkillLevel', () => {
  it('переписывает уровень навыка в файле заметки, сохраняя тело', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vault-write-'))
    try {
      await mkdir(join(root, 'javascript'), { recursive: true })
      const rel = 'javascript/Замыкания.md'
      await writeFile(
        join(root, rel),
        '---\ntitle: Замыкания\nskills:\n  - name: closures\n    level: 4\n---\n\nтело заметки\n'
      )

      await writeSkillLevel(root, rel, 'closures', 9)

      const after = await readFile(join(root, rel), 'utf8')
      expect(parseNote(after, rel).skills).toEqual([{ name: 'closures', level: 9 }])
      expect(after).toContain('тело заметки')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
