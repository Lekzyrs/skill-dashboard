import { describe, it, expect } from 'vitest'
import { createSelfWriteGuard } from './selfWriteGuard'

describe('createSelfWriteGuard', () => {
  it('гасит ровно одно следующее событие по помеченному пути', () => {
    const guard = createSelfWriteGuard()
    guard.mark('/vault/a.md')
    expect(guard.consume('/vault/a.md')).toBe(true) // это наша запись — игнорируем
    expect(guard.consume('/vault/a.md')).toBe(false) // следующее по тому же пути — уже внешнее
  })

  it('не трогает события по другим путям', () => {
    const guard = createSelfWriteGuard()
    guard.mark('/vault/a.md')
    expect(guard.consume('/vault/b.md')).toBe(false)
  })

  it('clear снимает метку, не считая её сработавшей', () => {
    const guard = createSelfWriteGuard()
    guard.mark('/vault/a.md')
    guard.clear('/vault/a.md')
    expect(guard.consume('/vault/a.md')).toBe(false)
  })
})
