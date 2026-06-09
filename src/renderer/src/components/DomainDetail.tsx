import type { CourseMilestones, CourseProgress, CourseStatus, Domain } from '../../../shared/types'
import { WEAK_THRESHOLD } from '../../../shared/derive'
import { coursesForTopics } from '../../../shared/courses'
import { SkillScale } from './SkillScale'
import { CourseList } from './CourseList'
import styles from './DomainDetail.module.css'

interface Props {
  domain: Domain
  busy: boolean
  courseProgress: CourseProgress
  courseMilestones: CourseMilestones
  onBack: () => void
  onSetLevel: (relativePath: string, skillName: string, level: number) => void
  onOpenCourse: (url: string) => void
  onSetCourseStatus: (courseId: string, status: CourseStatus) => void
  onToggleMilestone: (courseId: string, index: number) => void
}

export function DomainDetail({
  domain,
  busy,
  courseProgress,
  courseMilestones,
  onBack,
  onSetLevel,
  onOpenCourse,
  onSetCourseStatus,
  onToggleMilestone
}: Props) {
  // Почти все домены = 1 заметка: тогда название заметки идёт подзаголовком в шапку,
  // а не вторым заголовком уровнем ниже (он дублировал бы домен и его уровень).
  const single = domain.topics.length === 1
  // Курсы — на уровне домена: курс часто покрывает несколько тем (в js один курс на 5),
  // поэтому объединяем по темам и дедупим, иначе он повторился бы под каждой темой.
  const courses = coursesForTopics(domain.topics.map((t) => t.relativePath))

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Навыки
        </button>
        <div className={styles.heading}>
          <h1 className={styles.title}>{domain.name}</h1>
          <span className={`num ${styles.level}`}>{domain.level}</span>
        </div>
        {single && <p className={styles.subtitle}>{domain.topics[0].title}</p>}
      </header>

      {domain.topics.map((topic) => (
        <section key={topic.relativePath} className={styles.topic}>
          {!single && (
            <div className={styles.topicHead}>
              <h2 className={styles.topicTitle}>{topic.title}</h2>
              <span className={`num ${styles.topicLevel}`}>{topic.level}</span>
            </div>
          )}

          {topic.skills.length === 0 ? (
            <p className={styles.empty}>В этой заметке пока нет под-навыков.</p>
          ) : (
            <ul className={styles.skills}>
              {topic.skills.map((skill) => (
                <li key={skill.name} className={styles.skill}>
                  <span className={styles.skillMain}>
                    <span
                      className={`${styles.marker} ${
                        skill.level <= WEAK_THRESHOLD ? styles.low : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span className={styles.skillName}>{skill.name}</span>
                  </span>
                  <SkillScale
                    label={skill.name}
                    level={skill.level}
                    busy={busy}
                    onSet={(level) => onSetLevel(topic.relativePath, skill.name, level)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {courses.length > 0 && (
        <section className={styles.courses}>
          <h2 className={styles.coursesHead}>Курсы</h2>
          <CourseList
            courses={courses}
            progress={courseProgress}
            milestones={courseMilestones}
            busy={busy}
            onOpen={onOpenCourse}
            onSetStatus={onSetCourseStatus}
            onToggleMilestone={onToggleMilestone}
          />
        </section>
      )}
    </div>
  )
}
