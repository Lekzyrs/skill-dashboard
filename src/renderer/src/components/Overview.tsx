import { useState } from 'react'
import type { CourseMilestones, CourseProgress, CourseStatus, Domain } from '../../../shared/types'
import { weakestSkills, WEAK_THRESHOLD } from '../../../shared/derive'
import { AREAS, coursesForArea } from '../../../shared/courses'
import { CourseList } from './CourseList'
import styles from './Overview.module.css'

const DOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface Props {
  tree: Domain[]
  path: string
  busy: boolean
  courseProgress: CourseProgress
  courseMilestones: CourseMilestones
  onOpenDomain: (name: string) => void
  onChoose: () => void
  onOpenCourse: (url: string) => void
  onSetCourseStatus: (courseId: string, status: CourseStatus) => void
  onToggleMilestone: (courseId: string, index: number) => void
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function Overview({
  tree,
  path,
  busy,
  courseProgress,
  courseMilestones,
  onOpenDomain,
  onChoose,
  onOpenCourse,
  onSetCourseStatus,
  onToggleMilestone
}: Props) {
  const overall = tree.length ? round1(tree.reduce((s, d) => s + d.level, 0) / tree.length) : 0
  const weak = weakestSkills(tree, 5)
  const [openArea, setOpenArea] = useState<string | null>(null)

  let totalSkills = 0
  let weakCount = 0
  for (const d of tree) {
    for (const t of d.topics) {
      for (const s of t.skills) {
        totalSkills++
        if (s.level <= WEAK_THRESHOLD) weakCount++
      }
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Навыки</h1>
          <span className={`num ${styles.overall}`}>{overall}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.path} title={path}>
            {path}
          </span>
          <button type="button" className={styles.ghost} onClick={onChoose}>
            Сменить папку
          </button>
        </div>
      </header>

      {weak.length > 0 && (
        <section className={styles.weak} aria-label="Слабее всего">
          <h2 className={styles.weakHead}>Слабее всего</h2>
          <ul className={styles.weakList}>
            {weak.map((w, idx) => {
              const where = `${w.domain} · ${w.topicTitle}`
              const prev = weak[idx - 1]
              const sameAsPrev = prev && `${prev.domain} · ${prev.topicTitle}` === where
              return (
                <li key={`${w.relativePath}:${w.name}`}>
                  <button
                    type="button"
                    className={styles.weakRow}
                    onClick={() => onOpenDomain(w.domain)}
                  >
                    <span
                      className={`${styles.weakDot} ${w.level <= WEAK_THRESHOLD ? styles.low : ''}`}
                      aria-hidden="true"
                    />
                    <span className={styles.weakName}>{w.name}</span>
                    <span className={styles.weakWhere}>{sameAsPrev ? '' : where}</span>
                    <span className={`num ${styles.weakLevel}`}>{w.level}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className={styles.domains} aria-label="Домены">
        <h2 className={styles.sectionHead}>Домены</h2>
        {tree.map((d) => (
          <div key={d.name} className={styles.domainGroup}>
            <button
              type="button"
              className={styles.domainRow}
              onClick={() => onOpenDomain(d.name)}
            >
              <span className={styles.domainName}>{d.name}</span>
              <span className={styles.dots} aria-hidden="true">
                {DOTS.map((i) => (
                  <span
                    key={i}
                    className={`${styles.dot} ${i <= Math.round(d.level) ? styles.on : ''}`}
                  />
                ))}
              </span>
              <span className={`num ${styles.domainLevel}`}>{d.level}</span>
            </button>
            {d.topics.length > 1 && (
              <ul className={styles.topicList}>
                {d.topics.map((t) => (
                  <li key={t.relativePath} className={styles.topicRow}>
                    <span className={styles.topicName}>{t.title}</span>
                    <span className={`num ${styles.topicLevel}`}>{t.level}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className={styles.areas} aria-label="Пригодится фронтендеру">
        <h2 className={styles.sectionHead}>Пригодится фронтендеру</h2>
        {AREAS.map((area) => {
          const courses = coursesForArea(area.id)
          const open = openArea === area.id
          return (
            <div key={area.id} className={styles.areaGroup}>
              <button
                type="button"
                className={styles.areaRow}
                aria-expanded={open}
                onClick={() => setOpenArea(open ? null : area.id)}
              >
                <span className={styles.areaText}>
                  <span className={styles.areaName}>{area.label}</span>
                  <span className={styles.areaNote}>{area.note}</span>
                </span>
                <span className={`num ${styles.areaCount}`}>{courses.length}</span>
                <span
                  className={`${styles.caret} ${open ? styles.caretOpen : ''}`}
                  aria-hidden="true"
                >
                  ›
                </span>
              </button>
              {open && (
                <div className={styles.areaCourses}>
                  <CourseList
                    courses={courses}
                    progress={courseProgress}
                    milestones={courseMilestones}
                    busy={busy}
                    onOpen={onOpenCourse}
                    onSetStatus={onSetCourseStatus}
                    onToggleMilestone={onToggleMilestone}
                  />
                </div>
              )}
            </div>
          )
        })}
      </section>

      <p className={styles.footer}>
        {totalSkills} навыков · {weakCount} слабее тройки
      </p>
    </div>
  )
}
