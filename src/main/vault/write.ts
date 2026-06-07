import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setSkillLevel } from './frontmatter'

/**
 * Читает заметку по relativePath внутри базы знаний, меняет уровень одного навыка
 * и пишет обратно. Тонкий fs-слой над чистой setSkillLevel.
 */
export async function writeSkillLevel(
  knowledgeRoot: string,
  relativePath: string,
  skillName: string,
  level: number
): Promise<void> {
  const file = join(knowledgeRoot, relativePath)
  const content = await readFile(file, 'utf8')
  const updated = setSkillLevel(content, skillName, level)
  await writeFile(file, updated, 'utf8')
}
