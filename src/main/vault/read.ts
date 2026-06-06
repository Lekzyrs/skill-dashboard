import { readFile, readdir } from 'node:fs/promises'
import { join, sep } from 'node:path'
import { parseNote } from './parse'
import type { Topic } from '../../shared/types'

/**
 * Читает все заметки .md из доменных папок базы знаний и парсит их в темы.
 * Файлы в корне (например 00-INDEX.md) пропускаются — домен определяется папкой.
 */
export async function readVault(knowledgeRoot: string): Promise<Topic[]> {
  const entries = await readdir(knowledgeRoot, { recursive: true })

  const relPaths = entries
    .map((e) => e.split(sep).join('/')) // нормализуем разделитель к '/'
    .filter((rel) => rel.endsWith('.md') && rel.includes('/')) // только файлы внутри домена

  return Promise.all(
    relPaths.map(async (rel) => {
      const content = await readFile(join(knowledgeRoot, rel), 'utf8')
      return parseNote(content, rel)
    })
  )
}
