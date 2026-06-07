import type { Domain } from './types'

/** Навык + откуда он, для блока «слабее всего» и перехода в домен. */
export interface WeakSkill {
  name: string
  level: number
  domain: string
  topicTitle: string
  relativePath: string
}

/** Уровень, ниже-равно которого навык считается слабым местом. */
export const WEAK_THRESHOLD = 3

/** Самые низкие limit навыков по всему дереву, по возрастанию уровня. */
export function weakestSkills(tree: Domain[], limit: number): WeakSkill[] {
  const all: WeakSkill[] = []
  for (const domain of tree) {
    for (const topic of domain.topics) {
      for (const skill of topic.skills) {
        all.push({
          name: skill.name,
          level: skill.level,
          domain: domain.name,
          topicTitle: topic.title,
          relativePath: topic.relativePath
        })
      }
    }
  }
  return all.sort((a, b) => a.level - b.level).slice(0, limit)
}
