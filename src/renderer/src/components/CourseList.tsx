import type { Course } from '../../../shared/courses'
import styles from './CourseList.module.css'

const ACCESS_LABEL: Record<Course['access'], string> = {
  paid: 'платно',
  subscription: 'подписка',
  'free-tier': 'есть бесплатно',
  free: 'бесплатно'
}

interface Props {
  courses: Course[]
  onOpen: (url: string) => void
}

/** Тихий список курсов: заголовок-ссылка (внешний браузер) + мета + причина выбора. */
export function CourseList({ courses, onOpen }: Props) {
  return (
    <ul className={styles.list}>
      {courses.map((c) => (
        <li key={c.id} className={styles.course}>
          <button type="button" className={styles.title} onClick={() => onOpen(c.url)}>
            <span className={styles.titleText}>{c.title}</span>
            <span className={styles.ext} aria-hidden="true">
              ↗
            </span>
          </button>
          <div className={styles.meta}>
            {c.author} · {c.platform}
            {c.hours ? ` · ${c.hours} ч` : ''} · {c.level} · {ACCESS_LABEL[c.access]}
          </div>
          <p className={styles.why}>{c.why}</p>
        </li>
      ))}
    </ul>
  )
}
