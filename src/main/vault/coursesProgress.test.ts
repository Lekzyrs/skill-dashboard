import { describe, it, expect } from 'vitest'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  parseProgress,
  parseMilestones,
  renderProgressContent,
  setCourseStatusInContent,
  toggleMilestoneInContent,
  readProgress,
  writeCourseStatus,
  toggleMilestone,
  PROGRESS_FILE
} from './coursesProgress'

// jonas-html-css есть в каталоге с вехами; simpson-deep-js — 3-state (без вех).

describe('parse: markdown с %%id%% и чекбоксами', () => {
  const md = [
    '# Прогресс курсов',
    '',
    '## React %%max-react-complete-guide%%',
    '- [x] 1-5 · Основы',
    '- [ ] 6-9 · Стили',
    '- [x] 10-14 · Состояние',
    '',
    '## Deep JS %%simpson-deep-js%%',
    'в процессе',
    ''
  ].join('\n')

  it('вехи по позиции чекбоксов, статус по слову, id из %%...%%', () => {
    expect(parseMilestones(md)).toEqual({ 'max-react-complete-guide': [0, 2] })
    expect(parseProgress(md)).toEqual({ 'simpson-deep-js': 'in-progress' })
  })

  it('без секций → пусто', () => {
    expect(parseMilestones('# Прогресс\n')).toEqual({})
    expect(parseProgress('# Прогресс\n')).toEqual({})
  })

  it('читает старый frontmatter-формат (миграция)', () => {
    const old = '---\nprogress:\n  simpson-deep-js: done\nmilestones:\n  jonas-html-css:\n    - 0\n---\n'
    expect(parseProgress(old)).toEqual({ 'simpson-deep-js': 'done' })
    expect(parseMilestones(old)).toEqual({ 'jonas-html-css': [0] })
  })
})

describe('render → parse round-trip', () => {
  it('вехи и статусы переживают рендер', () => {
    const md = renderProgressContent({
      status: { 'simpson-deep-js': 'done' },
      milestones: { 'jonas-html-css': [0, 1] }
    })
    expect(parseMilestones(md)).toEqual({ 'jonas-html-css': [0, 1] })
    expect(parseProgress(md)).toEqual({ 'simpson-deep-js': 'done' })
  })

  it('рендер читаем в Obsidian: галочки, скрытый id, заголовок курса', () => {
    const md = renderProgressContent({ status: {}, milestones: { 'jonas-html-css': [0] } })
    expect(md).toContain('- [x]')
    expect(md).toContain('%%jonas-html-css%%')
    expect(md).toMatch(/^##\s+\S/m)
  })
})

describe('updates', () => {
  it('setCourseStatusInContent держит вехи', () => {
    const start = renderProgressContent({ status: {}, milestones: { 'jonas-html-css': [0, 1] } })
    const out = setCourseStatusInContent(start, 'simpson-deep-js', 'done')
    expect(parseProgress(out)['simpson-deep-js']).toBe('done')
    expect(parseMilestones(out)).toEqual({ 'jonas-html-css': [0, 1] })
  })

  it('toggleMilestoneInContent добавляет и снимает; последняя снятая убирает ключ', () => {
    let out = toggleMilestoneInContent('', 'jonas-html-css', 2)
    expect(parseMilestones(out)['jonas-html-css']).toEqual([2])
    out = toggleMilestoneInContent(out, 'jonas-html-css', 2)
    expect(parseMilestones(out)['jonas-html-css']).toBeUndefined()
  })
})

describe('fs', () => {
  it('пишет и читает в одном файле; нет файла → пусто', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vault-cp-'))
    try {
      expect(await readProgress(root)).toEqual({ status: {}, milestones: {} })

      await writeCourseStatus(root, 'simpson-deep-js', 'done')
      await toggleMilestone(root, 'jonas-html-css', 0)
      await toggleMilestone(root, 'jonas-html-css', 1)

      expect(await readProgress(root)).toEqual({
        status: { 'simpson-deep-js': 'done' },
        milestones: { 'jonas-html-css': [0, 1] }
      })
      const raw = await readFile(join(root, PROGRESS_FILE), 'utf8')
      expect(raw).toContain('- [x]')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('обновление статуса не сносит вехи (markdown-файл)', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vault-cp-'))
    try {
      await writeFile(
        join(root, PROGRESS_FILE),
        renderProgressContent({ status: {}, milestones: { 'jonas-html-css': [0, 1, 2] } })
      )
      await writeCourseStatus(root, 'simpson-deep-js', 'in-progress')
      const after = await readProgress(root)
      expect(after.status['simpson-deep-js']).toBe('in-progress')
      expect(after.milestones['jonas-html-css']).toEqual([0, 1, 2])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
