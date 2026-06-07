// Одноразовый сидинг: вписывает массивы skills: в frontmatter заметок базы знаний.
// Переиспользует протестированный setSkills. Путь к базе знаний берётся из env:
//   KNOWLEDGE_ROOT=/путь/к/10-knowledge npm run seed
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setSkills } from '../src/main/vault/frontmatter'
import type { Skill } from '../src/shared/types'

const KNOWLEDGE_ROOT = process.env.KNOWLEDGE_ROOT ?? ''

// Пример наполнения: ключ - путь заметки относительно базы знаний, значение - под-навыки.
// Замените на свои темы и навыки.
const SEED: Record<string, Skill[]> = {
  'javascript/Замыкания.md': [
    { name: 'Суть замыкания', level: 5 },
    { name: 'Применение (debounce, memoize, фабрики)', level: 4 }
  ]
}

async function main() {
  if (!KNOWLEDGE_ROOT) {
    throw new Error('Укажите путь к базе знаний: KNOWLEDGE_ROOT=/путь/к/10-knowledge npm run seed')
  }
  for (const [rel, skills] of Object.entries(SEED)) {
    const path = join(KNOWLEDGE_ROOT, rel)
    const content = await readFile(path, 'utf8')
    await writeFile(path, setSkills(content, skills), 'utf8')
    console.log(`seeded: ${rel} (${skills.length} навыков)`)
  }
  console.log('готово')
}

main()
