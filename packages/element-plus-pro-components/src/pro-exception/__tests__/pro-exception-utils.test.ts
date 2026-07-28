import { describe, expect, it } from 'vitest'
import { getProExceptionDefaultContent } from '../pro-exception-utils'

describe('pro-exception-utils', () => {
  it.each([
    ['403', '403', '抱歉，你无权访问此页面'],
    ['404', '404', '抱歉，你访问的页面不存在'],
    ['500', '500', '抱歉，服务器出错了，请稍后重试']
  ] as const)('resolves default content for %s', (status, title, subTitle) => {
    expect(getProExceptionDefaultContent(status)).toEqual({ title, subTitle })
  })
})
