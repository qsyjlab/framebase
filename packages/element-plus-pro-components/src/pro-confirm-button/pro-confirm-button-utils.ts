import type { ProConfirmConfig } from './pro-confirm-button'

export function normalizeProConfirmConfig(
  confirm: string | ProConfirmConfig
): Required<Omit<ProConfirmConfig, 'description'>> & Pick<ProConfirmConfig, 'description'> {
  const config = typeof confirm === 'string' ? { title: confirm } : confirm
  return {
    title: config.title,
    description: config.description,
    mode: config.mode ?? 'popconfirm',
    type: config.type ?? 'default',
    confirmText: config.confirmText ?? '确定',
    cancelText: config.cancelText ?? '取消'
  }
}

export function resolveProConfirmAccess(access: boolean, deniedBehavior: 'hide' | 'disable') {
  return {
    visible: access || deniedBehavior !== 'hide',
    disabled: !access && deniedBehavior === 'disable'
  }
}
