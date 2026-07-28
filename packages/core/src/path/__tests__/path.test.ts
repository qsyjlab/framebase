import { describe, expect, it } from 'vitest'
import {
  getPathValue,
  normalizePath,
  setPathValue,
  unsetPathValue,
  getProPathValue,
  normalizeProPath,
  setProPathValue,
  unsetProPathValue
} from '../index'

describe('path', () => {
  it('normalizes dot and array paths', () => {
    expect(normalizePath('user.profile.name')).toEqual(['user', 'profile', 'name'])
    expect(normalizePath(['items', 0, 'name'])).toEqual(['items', 0, 'name'])
  })

  it('normalizes bracket notation via lodash toPath', () => {
    expect(normalizePath('a[0].b')).toEqual(['a', 0, 'b'])
    expect(normalizePath("a['name']")).toEqual(['a', 'name'])
    expect(normalizePath('a["name"]')).toEqual(['a', 'name'])
    expect(normalizePath('a[0][1]')).toEqual(['a', 0, 1])
  })

  it('reads nested object and array values', () => {
    const source = {
      user: { profile: { name: 'Ada' } },
      items: [{ id: 7 }]
    }

    expect(getPathValue(source, 'user.profile.name')).toBe('Ada')
    expect(getPathValue(source, ['items', 0, 'id'])).toBe(7)
    expect(getPathValue(source, 'user.missing.name')).toBeUndefined()
  })

  it('reads values via bracket notation', () => {
    const source = {
      items: [{ id: 7 }, { id: 8 }],
      user: { 'first name': 'Ada' }
    }

    expect(getPathValue(source, 'items[0].id')).toBe(7)
    expect(getPathValue(source, 'items[1].id')).toBe(8)
    expect(getPathValue(source, "user['first name']")).toBe('Ada')
    expect(getPathValue(source, 'items[0][id]')).toBe(7)
  })

  it('writes nested values and creates missing containers', () => {
    const target: Record<string, unknown> = {}

    setPathValue(target, 'user.profile.name', 'Ada')
    setPathValue(target, ['items', 0, 'id'], 7)

    expect(target).toEqual({
      user: { profile: { name: 'Ada' } },
      items: [{ id: 7 }]
    })
  })

  it('writes values via bracket notation', () => {
    const target: Record<string, unknown> = {}

    setPathValue(target, 'items[0].id', 7)
    setPathValue(target, 'items[1].id', 8)
    setPathValue(target, "user['first name']", 'Ada')

    expect(target).toEqual({
      items: [{ id: 7 }, { id: 8 }],
      user: { 'first name': 'Ada' }
    })
  })

  it('deletes leaf values and leaves siblings intact', () => {
    const target: Record<string, unknown> = {
      user: { profile: { name: 'Ada', age: 30 } },
      items: [{ id: 7 }]
    }

    unsetPathValue(target, 'user.profile.name')
    unsetPathValue(target, ['items', 0, 'id'])

    expect(target).toEqual({
      user: { profile: { age: 30 } },
      items: [{}]
    })
  })

  it('deletes values via bracket notation', () => {
    const target: Record<string, unknown> = {
      items: [{ id: 7 }, { id: 8 }]
    }

    unsetPathValue(target, 'items[0].id')

    expect(target).toEqual({
      items: [{}, { id: 8 }]
    })
  })

  it('is a no-op when intermediate segments are missing', () => {
    const target: Record<string, unknown> = { user: { profile: { name: 'Ada' } } }

    unsetPathValue(target, 'user.missing.name')
    unsetPathValue(target, 'ghost.path')

    expect(target).toEqual({ user: { profile: { name: 'Ada' } } })
  })
})

describe('pro-prefixed aliases', () => {
  it('aliases match the canonical helpers', () => {
    expect(normalizeProPath('a.b')).toEqual(['a', 'b'])
    expect(getProPathValue({ a: { b: 1 } }, 'a.b')).toBe(1)

    const target: Record<string, unknown> = {}
    setProPathValue(target, 'a.b', 2)
    expect(target).toEqual({ a: { b: 2 } })

    unsetProPathValue(target, 'a.b')
    expect(target).toEqual({ a: {} })
  })

  it('aliases support bracket notation', () => {
    expect(normalizeProPath('a[0].b')).toEqual(['a', 0, 'b'])
    expect(getProPathValue({ items: [{ id: 7 }] }, 'items[0].id')).toBe(7)

    const target: Record<string, unknown> = {}
    setProPathValue(target, 'items[0].id', 9)
    expect(target).toEqual({ items: [{ id: 9 }] })

    unsetProPathValue(target, 'items[0].id')
    expect(target).toEqual({ items: [{}] })
  })
})
