import { describe, expect, it } from 'vitest'
import {
  getProDictionary,
  hasProDictionary,
  registerProDictionary,
  unregisterProDictionary
} from '../pro-dictionary-registry'
import {
  proFieldEnumToOptions,
  resolveProDictionaryName,
  resolveProFieldValueEnum
} from '../pro-field-utils'

describe('pro dictionary registry', () => {
  it('registers, restores and removes dictionaries', () => {
    const first = { a: 'A' }
    const second = { a: 'Alpha' }
    const restoreFirst = registerProDictionary('test-dict', first)
    const restoreSecond = registerProDictionary('test-dict', second)

    expect(getProDictionary('test-dict')).toBe(second)
    restoreSecond()
    expect(getProDictionary('test-dict')).toBe(first)
    restoreFirst()
    expect(hasProDictionary('test-dict')).toBe(false)

    registerProDictionary('test-dict', first)
    expect(unregisterProDictionary('test-dict')).toBe(true)
    expect(hasProDictionary('test-dict')).toBe(false)
  })
})

describe('resolveProFieldValueEnum', () => {
  it('returns inline Record/Map enums unchanged', () => {
    const inline = { a: 'A', b: 'B' }
    expect(resolveProFieldValueEnum(inline)).toBe(inline)
    expect(resolveProFieldValueEnum(undefined)).toBeUndefined()
  })

  it('resolves a bare dictionary name against the global registry', () => {
    const restore = registerProDictionary('gender', {
      M: { text: '男', type: 'primary' },
      F: '女'
    })
    try {
      const resolved = resolveProFieldValueEnum('gender')
      expect(resolved).toEqual({ M: { text: '男', type: 'primary' }, F: '女' })
      expect(proFieldEnumToOptions(resolved)).toEqual([
        { label: '男', value: 'M', disabled: undefined },
        { label: '女', value: 'F', disabled: undefined }
      ])
    } finally {
      restore()
    }
  })

  it('strips the dict: prefix when resolving', () => {
    const restore = registerProDictionary('status', { active: '启用' })
    try {
      expect(resolveProFieldValueEnum('dict:status')).toEqual({ active: '启用' })
    } finally {
      restore()
    }
  })

  it('prefers provider dictionaries over the global registry', () => {
    const restore = registerProDictionary('scope', { global: '全局' })
    try {
      const resolved = resolveProFieldValueEnum('scope', { scope: { local: '局部' } })
      expect(resolved).toEqual({ local: '局部' })
    } finally {
      restore()
    }
  })

  it('returns undefined for an unknown dictionary name', () => {
    expect(resolveProFieldValueEnum('no-such-dict')).toBeUndefined()
    expect(resolveProFieldValueEnum('no-such-dict', {})).toBeUndefined()
  })
})

describe('resolveProDictionaryName', () => {
  it('extracts names from string references and ignores inline enums', () => {
    expect(resolveProDictionaryName('gender')).toBe('gender')
    expect(resolveProDictionaryName('dict:gender')).toBe('gender')
    expect(resolveProDictionaryName({ a: 'A' })).toBeUndefined()
    expect(resolveProDictionaryName(undefined)).toBeUndefined()
  })
})
