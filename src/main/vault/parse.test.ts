import { describe, it, expect } from 'vitest'
import { parseNote, buildTree } from './parse'
import type { Topic } from '../../shared/types'

describe('parseNote', () => {
  it('читает массив skills из frontmatter в навыки темы', () => {
    const md = [
      '---',
      'title: React',
      'skills:',
      '  - name: useEffect глубоко',
      '    level: 6',
      '  - name: useReducer',
      '    level: 0',
      '---',
      '',
      '# React'
    ].join('\n')

    const topic = parseNote(md, 'react/React.md')

    expect(topic.skills).toEqual([
      { name: 'useEffect глубоко', level: 6 },
      { name: 'useReducer', level: 0 }
    ])
  })

  it('считает level темы как среднее уровней навыков, округляя до 1 знака', () => {
    const md = [
      '---',
      'skills:',
      '  - name: a',
      '    level: 7',
      '  - name: b',
      '    level: 8',
      '  - name: c',
      '    level: 2',
      '---'
    ].join('\n')

    const topic = parseNote(md, 'react/x.md')

    expect(topic.level).toBe(5.7) // 17 / 3 = 5.666... → 5.7
  })

  it('тема без skills даёт пустой список и level 0', () => {
    const md = ['---', 'title: Замыкания', 'status: solid', '---', '', '# Замыкания'].join('\n')

    const topic = parseNote(md, 'javascript/Замыкания.md')

    expect(topic.skills).toEqual([])
    expect(topic.level).toBe(0)
  })

  it('берёт domain из папки и title из frontmatter', () => {
    const md = ['---', 'title: React и хуки', '---'].join('\n')

    const topic = parseNote(md, 'react/React.md')

    expect(topic.domain).toBe('react')
    expect(topic.title).toBe('React и хуки')
  })

  it('если title нет, берёт имя файла без расширения', () => {
    const md = ['---', 'status: solid', '---'].join('\n')

    const topic = parseNote(md, 'javascript/Event Loop.md')

    expect(topic.title).toBe('Event Loop')
  })

  it('пробрасывает status как есть', () => {
    const md = ['---', 'title: x', 'status: learning', '---'].join('\n')

    const topic = parseNote(md, 'react/x.md')

    expect(topic.status).toBe('learning')
  })

  it('чинит битые уровни навыков: не число → 0, вне диапазона → зажимает', () => {
    const md = [
      '---',
      'skills:',
      '  - name: a',
      '    level: 15',
      '  - name: b',
      '    level: -3',
      '  - name: c',
      '  - name: d',
      '    level: abc',
      '---'
    ].join('\n')

    const topic = parseNote(md, 'react/x.md')

    expect(topic.skills).toEqual([
      { name: 'a', level: 10 },
      { name: 'b', level: 0 },
      { name: 'c', level: 0 },
      { name: 'd', level: 0 }
    ])
  })
})

function topic(domain: string, title: string, level: number): Topic {
  return { title, domain, relativePath: `${domain}/${title}.md`, skills: [], level }
}

describe('buildTree', () => {
  it('группирует темы по доменам и считает level домена как среднее по темам', () => {
    const t1 = topic('javascript', 'this', 8)
    const t2 = topic('javascript', 'Event Loop', 6)
    const t3 = topic('react', 'React', 4)

    const tree = buildTree([t1, t2, t3])

    expect(tree).toEqual([
      { name: 'javascript', topics: [t1, t2], level: 7 },
      { name: 'react', topics: [t3], level: 4 }
    ])
  })

  it('пустой список тем даёт пустое дерево', () => {
    expect(buildTree([])).toEqual([])
  })
})
