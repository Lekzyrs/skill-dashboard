import type { Domain } from '../../../shared/types'
import { weakestSkills, WEAK_THRESHOLD } from '../../../shared/derive'
import styles from './Overview.module.css'

const DOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface Props {
  tree: Domain[]
  path: string
  onOpenDomain: (name: string) => void
  onChoose: () => void
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function Overview({ tree, path, onOpenDomain, onChoose }: Props) {
  const overall = tree.length ? round1(tree.reduce((s, d) => s + d.level, 0) / tree.length) : 0
  const weak = weakestSkills(tree, 5)

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

      <p className={styles.footer}>
        {totalSkills} навыков · {weakCount} слабее тройки
      </p>
    </div>
  )
}
