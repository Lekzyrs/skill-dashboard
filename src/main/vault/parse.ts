import matter from 'gray-matter'
import { basename, dirname } from 'node:path'
import type { Domain, Skill, Topic } from '../../shared/types'

/** Парсит одну заметку .md в тему. Чистая функция: на вход строка, без обращения к fs. */
export function parseNote(content: string, relativePath: string): Topic {
  const { data } = matter(content)

  const rawSkills = Array.isArray(data.skills)
    ? (data.skills as Array<{ name: string; level: number }>)
    : []
  const skills: Skill[] = rawSkills.map((s) => ({ name: s.name, level: normalizeLevel(s.level) }))

  const title =
    typeof data.title === 'string' && data.title.trim().length > 0
      ? data.title
      : basename(relativePath, '.md')

  return {
    title,
    domain: basename(dirname(relativePath)),
    relativePath,
    status: typeof data.status === 'string' ? data.status : undefined,
    skills,
    level: averageLevel(skills)
  }
}

/** Группирует темы по доменам (папкам), считает уровень домена как среднее по темам. */
export function buildTree(topics: Topic[]): Domain[] {
  const byDomain = new Map<string, Topic[]>()
  for (const t of topics) {
    const list = byDomain.get(t.domain)
    if (list) list.push(t)
    else byDomain.set(t.domain, [t])
  }

  return [...byDomain.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const domainTopics = byDomain.get(name)!
      return { name, topics: domainTopics, level: roundedAverage(domainTopics.map((t) => t.level)) }
    })
}

/** Приводит уровень к числу 0-10: не число → 0, вне диапазона → зажимает. */
function normalizeLevel(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return 0
  return Math.min(10, Math.max(0, n))
}

/** Среднее уровней навыков (0-10). 0, если навыков нет. */
function averageLevel(skills: Skill[]): number {
  return roundedAverage(skills.map((s) => s.level))
}

/** Среднее чисел, округлённое до 1 знака. 0 для пустого списка. */
function roundedAverage(nums: number[]): number {
  if (nums.length === 0) return 0
  const sum = nums.reduce((acc, n) => acc + n, 0)
  return Math.round((sum / nums.length) * 10) / 10
}
