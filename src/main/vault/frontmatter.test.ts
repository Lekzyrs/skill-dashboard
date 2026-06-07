import { describe, it, expect } from 'vitest'
import { setSkills } from './frontmatter'
import { parseNote } from './parse'

describe('setSkills', () => {
  it('добавляет skills в frontmatter, сохраняя другие поля и тело', () => {
    const content = [
      '---',
      'title: Promise',
      'tags: [javascript, async, core]',
      'status: solid',
      '---',
      '',
      '# Promise',
      '',
      'тело заметки'
    ].join('\n')

    const result = setSkills(content, [
      { name: 'async/await', level: 6 },
      { name: 'Обработка ошибок (throw vs return)', level: 6 }
    ])

    expect(result).toContain('title: Promise')
    expect(result).toContain('tags: [javascript, async, core]')
    expect(result).toContain('status: solid')
    expect(result).toContain('# Promise')
    expect(result).toContain('тело заметки')

    const topic = parseNote(result, 'javascript/Promise.md')
    expect(topic.skills).toEqual([
      { name: 'async/await', level: 6 },
      { name: 'Обработка ошибок (throw vs return)', level: 6 }
    ])
  })

  it('заменяет существующий блок skills, не дублируя его', () => {
    const content = [
      '---',
      'title: x',
      'skills:',
      '  - name: старый',
      '    level: 1',
      'status: solid',
      '---',
      '',
      'тело'
    ].join('\n')

    const once = setSkills(content, [{ name: 'новый', level: 7 }])
    const twice = setSkills(once, [{ name: 'новый2', level: 8 }])

    expect(parseNote(twice, 'js/x.md').skills).toEqual([{ name: 'новый2', level: 8 }])
    expect(twice).not.toContain('старый')
    expect(twice).toContain('status: solid')
  })

  it('создаёт frontmatter, если его нет, и не путает --- внутри тела', () => {
    const content = ['# Заметка', '', 'часть 1', '', '---', '', 'часть 2'].join('\n')

    const result = setSkills(content, [{ name: 'a', level: 3 }])

    expect(parseNote(result, 'js/x.md').skills).toEqual([{ name: 'a', level: 3 }])
    expect(result).toContain('часть 1')
    expect(result).toContain('часть 2')
  })
})
