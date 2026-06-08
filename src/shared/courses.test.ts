import { describe, it, expect } from 'vitest'
import { coursesForTopic, coursesForArea, COURSES, AREAS } from './courses'

describe('coursesForTopic', () => {
  it('возвращает курсы, у которых тема есть в topics', () => {
    const react = coursesForTopic('react/React - что знаю и что прокачать.md')
    expect(react.length).toBeGreaterThan(0)
    expect(react.every((c) => c.topics.includes('react/React - что знаю и что прокачать.md'))).toBe(
      true
    )
  })

  it('один широкий курс попадает в несколько тем (many-to-many)', () => {
    const closures = coursesForTopic('javascript/Замыкания.md')
    const promise = coursesForTopic('javascript/Promise и async-await.md')
    const jonasInBoth =
      closures.some((c) => c.id === 'jonas-complete-js') &&
      promise.some((c) => c.id === 'jonas-complete-js')
    expect(jonasInBoth).toBe(true)
  })

  it('тема без курсов → []', () => {
    expect(coursesForTopic('javascript/Несуществующая.md')).toEqual([])
  })
})

describe('coursesForArea', () => {
  it('возвращает курсы по области вне vault (CSS)', () => {
    const css = coursesForArea('css')
    expect(css.length).toBeGreaterThan(0)
    expect(css.every((c) => c.areas?.includes('css'))).toBe(true)
  })

  it('область без курсов → []', () => {
    expect(coursesForArea('нет-такой-области')).toEqual([])
  })
})

describe('каталог', () => {
  it('каждый курс тегирован хотя бы одной темой или областью', () => {
    expect(COURSES.every((c) => c.topics.length > 0 || (c.areas?.length ?? 0) > 0)).toBe(true)
  })

  it('id курсов уникальны (ключ прогресса во frontmatter)', () => {
    const ids = COURSES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('каждая область из AREAS имеет хотя бы один курс', () => {
    expect(AREAS.every((a) => coursesForArea(a.id).length > 0)).toBe(true)
  })
})
