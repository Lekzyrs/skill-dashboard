import matter from 'gray-matter'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { COURSES } from '../../shared/courses'
import type { CourseMilestones, CourseProgress, CourseStatus } from '../../shared/types'

// Файл прогресса курсов в корне базы знаний. readVault его пропускает (не в домене).
// Формат — нативный Obsidian markdown: секция на курс, вехи галочками, 3-state словом статуса.
// Так прогресс читаем и редактируем прямо в Obsidian, а дашборд парсит обратно.
export const PROGRESS_FILE = '_courses-progress.md'

interface ProgressFile {
  status: CourseProgress
  milestones: CourseMilestones
}

const STATUS_WORD: Record<'in-progress' | 'done', string> = {
  'in-progress': 'в процессе',
  done: 'пройден'
}
const WORD_STATUS: Record<string, CourseStatus> = {
  'не начат': 'not-started',
  'в процессе': 'in-progress',
  пройден: 'done'
}

// id курса спрятан в заголовке как Obsidian-комментарий %%id%% (скрыт в режиме чтения).
const ID_RE = /%%\s*([a-z0-9-]+)\s*%%/i
const CHECKBOX_RE = /^\s*-\s*\[([ xX])\]/

function parseMarkdown(content: string): ProgressFile {
  const status: CourseProgress = {}
  const milestones: CourseMilestones = {}
  let id: string | null = null
  let idx = 0
  let done: number[] = []

  const flush = (): void => {
    if (id && done.length) milestones[id] = [...done]
    done = []
    idx = 0
  }

  for (const line of content.split(/\r?\n/)) {
    const heading = /^##\s+(.*)$/.exec(line)
    if (heading) {
      flush()
      const m = ID_RE.exec(heading[1])
      id = m ? m[1] : null
      continue
    }
    if (!id) continue
    const cb = CHECKBOX_RE.exec(line)
    if (cb) {
      if (cb[1].toLowerCase() === 'x') done.push(idx)
      idx++
      continue
    }
    const word = WORD_STATUS[line.trim().toLowerCase()]
    if (word && word !== 'not-started') status[id] = word
  }
  flush()
  return { status, milestones }
}

// Старый формат — карты во frontmatter. Читаем как резерв, чтобы прошлые клики мигрировали.
function parseFrontmatter(content: string): ProgressFile {
  const status: CourseProgress = {}
  const milestones: CourseMilestones = {}
  let data: Record<string, unknown> = {}
  try {
    data = matter(content).data
  } catch {
    return { status, milestones }
  }
  if (data.progress && typeof data.progress === 'object') {
    for (const [k, v] of Object.entries(data.progress as Record<string, unknown>)) {
      if (v === 'in-progress' || v === 'done') status[k] = v
    }
  }
  if (data.milestones && typeof data.milestones === 'object') {
    for (const [k, v] of Object.entries(data.milestones as Record<string, unknown>)) {
      if (!Array.isArray(v)) continue
      const nums = v.filter((n): n is number => Number.isInteger(n) && (n as number) >= 0)
      if (nums.length) milestones[k] = [...new Set(nums)].sort((a, b) => a - b)
    }
  }
  return { status, milestones }
}

function parseFile(content: string): ProgressFile {
  const md = parseMarkdown(content)
  if (Object.keys(md.status).length || Object.keys(md.milestones).length) return md
  // markdown пуст — пробуем старый frontmatter (миграция)
  return parseFrontmatter(content)
}

// Рендер — читаемый markdown. Секции в порядке каталога (стабильный дифф). Только курсы с прогрессом.
function renderFile(f: ProgressFile): string {
  const out = [
    '# Прогресс курсов',
    '',
    'Файл ведёт дашборд навыков. Галочки можно ставить и здесь, дашборд подхватит.',
    ''
  ]
  let any = false
  for (const c of COURSES) {
    const doneSet = new Set(f.milestones[c.id] ?? [])
    const st = f.status[c.id]
    if (c.milestones?.length && doneSet.size > 0) {
      any = true
      out.push(`## ${c.title} %%${c.id}%%`)
      c.milestones.forEach((label, i) => out.push(`- [${doneSet.has(i) ? 'x' : ' '}] ${label}`))
      out.push('')
    } else if (st === 'in-progress' || st === 'done') {
      any = true
      out.push(`## ${c.title} %%${c.id}%%`)
      out.push(STATUS_WORD[st], '')
    }
  }
  if (!any) out.push('_Пока пусто, отмечай прогресс в дашборде._', '')
  return out.join('\n')
}

/** Карта статусов 3-state курсов. */
export function parseProgress(content: string): CourseProgress {
  return parseFile(content).status
}

/** Карта пройденных вех по курсам. */
export function parseMilestones(content: string): CourseMilestones {
  return parseFile(content).milestones
}

/** Рендер файла прогресса в читаемый markdown (экспортируется для тестов/предпросмотра). */
export function renderProgressContent(f: ProgressFile): string {
  return renderFile(f)
}

/** Контент файла с обновлённым статусом курса. Вехи сохраняются. */
export function setCourseStatusInContent(
  content: string,
  courseId: string,
  status: CourseStatus
): string {
  const f = parseFile(content)
  if (status === 'not-started') delete f.status[courseId]
  else f.status[courseId] = status
  return renderFile(f)
}

/** Контент файла с переключённой вехой курса. Статусы сохраняются; пустой ключ убирается. */
export function toggleMilestoneInContent(content: string, courseId: string, index: number): string {
  const f = parseFile(content)
  const set = new Set(f.milestones[courseId] ?? [])
  if (set.has(index)) set.delete(index)
  else set.add(index)
  const sorted = [...set].sort((a, b) => a - b)
  if (sorted.length) f.milestones[courseId] = sorted
  else delete f.milestones[courseId]
  return renderFile(f)
}

/** Читает прогресс курсов из базы знаний. Файла нет → пустые карты. */
export async function readProgress(knowledgeRoot: string): Promise<ProgressFile> {
  try {
    return parseFile(await readFile(join(knowledgeRoot, PROGRESS_FILE), 'utf8'))
  } catch {
    return { status: {}, milestones: {} }
  }
}

async function updateFile(
  knowledgeRoot: string,
  transform: (content: string) => string
): Promise<void> {
  const file = join(knowledgeRoot, PROGRESS_FILE)
  let content = ''
  try {
    content = await readFile(file, 'utf8')
  } catch {
    content = ''
  }
  await writeFile(file, transform(content), 'utf8')
}

/** Пишет статус 3-state курса в файл прогресса. */
export function writeCourseStatus(
  knowledgeRoot: string,
  courseId: string,
  status: CourseStatus
): Promise<void> {
  return updateFile(knowledgeRoot, (c) => setCourseStatusInContent(c, courseId, status))
}

/** Переключает веху курса в файле прогресса. */
export function toggleMilestone(
  knowledgeRoot: string,
  courseId: string,
  index: number
): Promise<void> {
  return updateFile(knowledgeRoot, (c) => toggleMilestoneInContent(c, courseId, index))
}
