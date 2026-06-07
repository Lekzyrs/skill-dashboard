import { describe, it, expect } from 'vitest'
import { weakestSkills } from './derive'
import type { Domain } from './types'

const tree: Domain[] = [
  {
    name: 'javascript',
    level: 5,
    topics: [
      {
        title: 'Замыкания',
        domain: 'javascript',
        relativePath: 'javascript/Замыкания.md',
        skills: [
          { name: 'Суть', level: 6 },
          { name: 'Ловушка var', level: 2 }
        ],
        level: 4
      }
    ]
  },
  {
    name: 'react',
    level: 3,
    topics: [
      {
        title: 'Хуки',
        domain: 'react',
        relativePath: 'react/Хуки.md',
        skills: [
          { name: 'useEffect', level: 3 },
          { name: 'useMemo', level: 1 }
        ],
        level: 2
      }
    ]
  }
]

describe('weakestSkills', () => {
  it('возвращает limit самых низких навыков по всему дереву, по возрастанию уровня', () => {
    const weak = weakestSkills(tree, 3)
    expect(weak.map((w) => w.level)).toEqual([1, 2, 3])
    expect(weak[0].name).toBe('useMemo')
  })

  it('несёт домен, тему и путь для перехода', () => {
    const [lowest] = weakestSkills(tree, 1)
    expect(lowest).toEqual({
      name: 'useMemo',
      level: 1,
      domain: 'react',
      topicTitle: 'Хуки',
      relativePath: 'react/Хуки.md'
    })
  })

  it('пустое дерево → []', () => {
    expect(weakestSkills([], 5)).toEqual([])
  })

  it('limit больше числа навыков → возвращает все', () => {
    expect(weakestSkills(tree, 99)).toHaveLength(4)
  })
})
