import { describe, it, expect } from 'vitest'
import { setSkills, setSkillLevel } from './frontmatter'
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

describe('setSkillLevel', () => {
  const note = [
    '---',
    'title: Замыкания',
    'status: solid',
    'skills:',
    '  - name: closures',
    '    level: 4',
    '  - name: scope chain',
    '    level: 6',
    '---',
    '',
    'тело заметки'
  ].join('\n')

  it('меняет уровень одного навыка, не трогая остальные и тело', () => {
    const result = setSkillLevel(note, 'closures', 8)

    expect(parseNote(result, 'javascript/Замыкания.md').skills).toEqual([
      { name: 'closures', level: 8 },
      { name: 'scope chain', level: 6 }
    ])
    expect(result).toContain('status: solid')
    expect(result).toContain('тело заметки')
  })

  it('зажимает уровень в диапазон 0-10 перед записью в vault', () => {
    const tooHigh = setSkillLevel(note, 'closures', 15)
    expect(tooHigh).toContain('level: 10')
    expect(tooHigh).not.toContain('level: 15')

    const tooLow = setSkillLevel(note, 'scope chain', -3)
    expect(tooLow).toContain('level: 0')
    expect(tooLow).not.toContain('level: -3')
  })

  it('оставляет контент без изменений, если навыка с таким именем нет', () => {
    expect(setSkillLevel(note, 'нет такого навыка', 5)).toBe(note)
  })
})
