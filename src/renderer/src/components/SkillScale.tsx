import { useState } from 'react'
import styles from './SkillScale.module.css'

const DOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface Props {
  label: string
  level: number
  busy: boolean
  onSet: (level: number) => void
}

export function SkillScale({ label, level, busy, onSet }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? level

  return (
    <span className={styles.scale} role="group" aria-label={`${label}: уровень ${level} из 10`}>
      <button
        type="button"
        className={styles.step}
        aria-label={`Понизить: ${label}`}
        disabled={busy || level <= 0}
        onClick={() => onSet(level - 1)}
      >
        −
      </button>

      <span className={styles.dots} onMouseLeave={() => setHover(null)}>
        {DOTS.map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`${styles.dot} ${i <= shown ? styles.on : ''}`}
            onMouseEnter={() => !busy && setHover(i)}
            onClick={() => !busy && onSet(level === i ? i - 1 : i)}
          />
        ))}
      </span>

      <button
        type="button"
        className={styles.step}
        aria-label={`Повысить: ${label}`}
        disabled={busy || level >= 10}
        onClick={() => onSet(level + 1)}
      >
        +
      </button>

      <span className={`num ${styles.value}`}>{level}</span>
    </span>
  )
}
