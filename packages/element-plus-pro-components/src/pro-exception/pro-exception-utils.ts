import type { ProExceptionStatus } from './pro-exception'

export interface ProExceptionDefaultContent {
  title: string
  subTitle: string
}

const defaultContent: Record<ProExceptionStatus, ProExceptionDefaultContent> = {
  '403': { title: '403', subTitle: '抱歉，你无权访问此页面' },
  '404': { title: '404', subTitle: '抱歉，你访问的页面不存在' },
  '500': { title: '500', subTitle: '抱歉，服务器出错了，请稍后重试' }
}

export function getProExceptionDefaultContent(
  status: ProExceptionStatus
): ProExceptionDefaultContent {
  return defaultContent[status]
}
