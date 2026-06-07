import type { Skill } from '../../shared/types'

// Разбивает контент на frontmatter (первый блок ---...---) и тело.
// Закрывающий --- ищется нежадно, поэтому --- внутри тела не путается с фронтматтером.
function splitFrontmatter(content: string): { fm: string; body: string; hasFm: boolean } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content)
  if (!match) return { fm: '', body: content, hasFm: false }
  return { fm: match[1], body: content.slice(match[0].length), hasFm: true }
}

// Убирает существующий блок skills: (саму строку и вложенные под неё строки), остальное не трогает.
function removeSkillsBlock(fm: string): string {
  const lines = fm.split('\n')
  const out: string[] = []
  let skipping = false
  for (const line of lines) {
    if (skipping) {
      if (/^\s+\S/.test(line)) continue // вложенная строка блока skills
      skipping = false
    }
    if (/^skills\s*:/.test(line)) {
      skipping = true
      continue
    }
    out.push(line)
  }
  return out.join('\n')
}

// Рендер блока skills вручную: имена в двойных кавычках (валидный YAML-скаляр),
// поэтому запятые/скобки/кириллица в названиях безопасны.
function renderSkills(skills: Skill[]): string {
  const lines = ['skills:']
  for (const s of skills) {
    lines.push(`  - name: ${JSON.stringify(s.name)}`)
    lines.push(`    level: ${s.level}`)
  }
  return lines.join('\n')
}

/**
 * Возвращает контент заметки с заданным блоком skills во frontmatter.
 * Существующие поля frontmatter и тело сохраняются как есть. Если skills уже был — заменяется.
 */
export function setSkills(content: string, skills: Skill[]): string {
  const { fm, body, hasFm } = splitFrontmatter(content)
  const fmClean = removeSkillsBlock(fm).trimEnd()
  const skillsYaml = renderSkills(skills)
  const newFm = fmClean.length > 0 ? `${fmClean}\n${skillsYaml}` : skillsYaml
  const realBody = hasFm ? body : content
  return `---\n${newFm}\n---\n${realBody}`
}
