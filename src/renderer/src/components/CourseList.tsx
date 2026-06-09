import { useState } from 'react'
import type { Course } from '../../../shared/courses'
import type { CourseMilestones, CourseProgress, CourseStatus } from '../../../shared/types'
import styles from './CourseList.module.css'

const ACCESS_LABEL: Record<Course['access'], string> = {
  paid: 'платно',
  subscription: 'подписка',
  'free-tier': 'есть бесплатно',
  free: 'бесплатно'
}

// Клик по статусу прокручивает вперёд по кругу (курсы без разделов).
const NEXT_STATUS: Record<CourseStatus, CourseStatus> = {
  'not-started': 'in-progress',
  'in-progress': 'done',
  done: 'not-started'
}
const STATUS_LABEL: Record<CourseStatus, string> = {
  'not-started': 'не начат',
  'in-progress': 'в процессе',
  done: 'пройден'
}
const STATUS_GLYPH: Record<CourseStatus, string> = {
  'not-started': '○',
  'in-progress': '◐',
  done: '✓'
}

interface Props {
  courses: Course[]
  progress: CourseProgress
  milestones: CourseMilestones
  busy: boolean
  onOpen: (url: string) => void
  onSetStatus: (courseId: string, status: CourseStatus) => void
  onToggleMilestone: (courseId: string, index: number) => void
}

/** Курс пройден: все вехи отмечены (курс с разделами) или статус done (3-state). */
function isDone(c: Course, progress: CourseProgress, milestones: CourseMilestones): boolean {
  if (c.milestones?.length) return (milestones[c.id]?.length ?? 0) >= c.milestones.length
  return progress[c.id] === 'done'
}

export function CourseList({
  courses,
  progress,
  milestones,
  busy,
  onOpen,
  onSetStatus,
  onToggleMilestone
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const done = courses.filter((c) => isDone(c, progress, milestones)).length

  function toggleExpand(id: string): void {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      {courses.length >= 2 && (
        <div className={styles.summary}>
          <span className={styles.summaryText}>
            {done} из {courses.length} пройдено
          </span>
          <span className={styles.bar} aria-hidden="true">
            <span className={styles.barFill} style={{ width: `${(done / courses.length) * 100}%` }} />
          </span>
        </div>
      )}

      <ul className={styles.list}>
        {courses.map((c) => {
          const steps = c.milestones ?? []
          const hasMilestones = steps.length > 0
          const doneSet = new Set(milestones[c.id] ?? [])
          const pct = hasMilestones ? Math.round((doneSet.size / steps.length) * 100) : 0
          const open = expanded.has(c.id)
          const status: CourseStatus = progress[c.id] ?? 'not-started'

          return (
            <li key={c.id} className={styles.course}>
              <div className={styles.head}>
                <button type="button" className={styles.title} onClick={() => onOpen(c.url)}>
                  <span className={styles.titleText}>{c.title}</span>
                  <span className={styles.ext} aria-hidden="true">
                    ↗
                  </span>
                </button>

                {hasMilestones ? (
                  <button
                    type="button"
                    className={styles.progressToggle}
                    aria-expanded={open}
                    onClick={() => toggleExpand(c.id)}
                  >
                    {doneSet.size}/{steps.length} · {pct}%
                    <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`} aria-hidden="true">
                      ›
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${styles.status} ${styles[status] ?? ''}`}
                    disabled={busy}
                    aria-label={`Статус: ${STATUS_LABEL[status]}. Нажмите, чтобы сменить.`}
                    onClick={() => onSetStatus(c.id, NEXT_STATUS[status])}
                  >
                    <span className={styles.statusGlyph} aria-hidden="true">
                      {STATUS_GLYPH[status]}
                    </span>
                    {STATUS_LABEL[status]}
                  </button>
                )}
              </div>

              {hasMilestones && (
                <>
                  <span className={styles.progressBar} aria-hidden="true">
                    <span className={styles.barFill} style={{ width: `${pct}%` }} />
                  </span>
                  {open && (
                    <ul className={styles.checklist}>
                      {steps.map((label, i) => (
                        <li key={i}>
                          <label className={styles.check}>
                            <input
                              type="checkbox"
                              checked={doneSet.has(i)}
                              disabled={busy}
                              onChange={() => onToggleMilestone(c.id, i)}
                            />
                            {label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              <div className={styles.meta}>
                {c.author} · {c.platform}
                {c.hours ? ` · ${c.hours} ч` : ''} · {c.level} · {ACCESS_LABEL[c.access]}
              </div>
              <p className={styles.why}>{c.why}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
