import { shallowRef } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { FormMethodsType } from '../types/form'
import { useProForm } from '../use-pro-form'

interface TestFormModel extends Record<string, any> {
  scopeName?: string
  status?: string
  ids?: number[]
}

function createForm(
  overrides: Partial<FormMethodsType<TestFormModel>> = {}
): FormMethodsType<TestFormModel> {
  return {
    submit: vi.fn(async () => true),
    reset: vi.fn(),
    validate: vi.fn(async () => true),
    resetFields: vi.fn(),
    clearValidate: vi.fn(),
    validateField: vi.fn(async () => true),
    scrollToField: vi.fn(),
    forceUpdateModel: vi.fn(),
    setFieldValue: vi.fn(),
    getFieldValue: vi.fn(),
    clearFieldValue: vi.fn(),
    getFieldsValue: vi.fn(() => ({}) as TestFormModel),
    setFieldErrors: vi.fn(),
    clearFieldErrors: vi.fn(),
    getCollapsed: vi.fn(() => false),
    setCollapsed: vi.fn(),
    toggleCollapse: vi.fn(),
    load: vi.fn(async () => ({}) as TestFormModel),
    getLoading: vi.fn(() => false),
    getRequestLifecycle: vi.fn(() => ({
      phase: 'idle' as const,
      loading: false,
      initialLoading: false,
      refreshing: false
    })),
    getError: vi.fn(),
    retryRequest: vi.fn(async () => ({}) as TestFormModel),
    cancelRequest: vi.fn(),
    getSubmitting: vi.fn(() => false),
    isDirty: vi.fn(() => false),
    markClean: vi.fn(),
    ...overrides
  } as FormMethodsType<TestFormModel>
}

function createFormHook(
  options: Parameters<typeof useProForm<TestFormModel>>[1] = {},
  form: FormMethodsType<TestFormModel> = createForm()
) {
  const formRef = shallowRef<FormMethodsType<TestFormModel> | null>(form)
  const hook = useProForm<TestFormModel>(formRef, options)

  return { hook, form, formRef }
}

describe('use pro form params', () => {
  it('initializes params from transformed initialValues', () => {
    const { hook } = createFormHook({
      initialValues: { scopeName: 'initial' },
      transform: values => ({ ...values, fixed: 'extra' })
    })

    expect(hook.params.value).toEqual({ scopeName: 'initial', fixed: 'extra' })
  })

  it('defaults params to an empty object', () => {
    const { hook } = createFormHook()

    expect(hook.params.value).toEqual({})
  })

  it('replaces params on submit instead of merging', () => {
    const { hook } = createFormHook({ initialValues: { scopeName: 'initial' } })

    // 作为 @submit 事件处理器：事件携带的值直接写入 params
    void hook.search({ status: 'enabled' })

    expect(hook.params.value).toEqual({ status: 'enabled' })
  })

  it('search with event values skips validation', async () => {
    const { hook, form } = createFormHook(
      {},
      createForm({
        validate: vi.fn(async () => false),
        getFieldsValue: vi.fn(() => ({ scopeName: 'foo' }) as TestFormModel)
      })
    )

    // @submit 事件在表单内部已完成校验，事件处理器路径不应重复校验
    await expect(hook.search({ scopeName: 'foo' })).resolves.toBe(true)

    expect(form.validate).not.toHaveBeenCalled()
    expect(hook.params.value).toEqual({ scopeName: 'foo' })
  })

  it('search without values validates before applying', async () => {
    const failing = createForm({
      validate: vi.fn(async () => false),
      getFieldsValue: vi.fn(() => ({ scopeName: 'blocked' }) as TestFormModel)
    })
    const formRef = shallowRef<FormMethodsType<TestFormModel> | null>(failing)
    const hook = useProForm<TestFormModel>(formRef)

    await expect(hook.search()).resolves.toBe(false)

    expect(hook.params.value).toEqual({})
    expect(failing.getFieldsValue).not.toHaveBeenCalled()
  })

  it('search without values writes validated form values into params', async () => {
    const { hook, form } = createFormHook(
      {},
      createForm({
        getFieldsValue: vi.fn(() => ({ scopeName: 'foo', status: '' }) as TestFormModel)
      })
    )

    await expect(hook.search()).resolves.toBe(true)

    expect(form.validate).toHaveBeenCalled()
    expect(hook.params.value).toEqual({ scopeName: 'foo', status: '' })
  })

  it('submit updates params after a successful form submit', async () => {
    const { hook, form } = createFormHook(
      {},
      createForm({
        submit: vi.fn(async () => true),
        getFieldsValue: vi.fn(() => ({ scopeName: 'foo' }) as TestFormModel)
      })
    )

    await expect(hook.submit()).resolves.toBe(true)

    expect(form.submit).toHaveBeenCalled()
    expect(hook.params.value).toEqual({ scopeName: 'foo' })
  })

  it('submit skips params update when the form rejects submission', async () => {
    const { hook } = createFormHook(
      {},
      createForm({
        submit: vi.fn(async () => false),
        getFieldsValue: vi.fn(() => ({ scopeName: 'foo' }) as TestFormModel)
      })
    )

    await expect(hook.submit()).resolves.toBe(false)
    expect(hook.params.value).toEqual({})
  })

  it('reset with event values applies them without touching the form', async () => {
    const { hook, form } = createFormHook(
      {},
      createForm({
        getFieldsValue: vi.fn(() => ({ scopeName: 'stale' }) as TestFormModel)
      })
    )

    // @reset 事件在表单内部已完成重置，事件处理器路径不应二次 reset
    await expect(hook.reset({ scopeName: undefined })).resolves.toBe(true)

    expect(form.reset).not.toHaveBeenCalled()
    expect(form.getFieldsValue).not.toHaveBeenCalled()
    expect(hook.params.value).toEqual({ scopeName: undefined })
  })

  it('reset without values resets the form and applies reset values', async () => {
    const { hook, form } = createFormHook(
      {},
      createForm({
        getFieldsValue: vi.fn(() => ({ scopeName: undefined }) as TestFormModel)
      })
    )

    void hook.search({ scopeName: 'foo' })
    await expect(hook.reset()).resolves.toBe(true)

    expect(form.reset).toHaveBeenCalled()
    expect(hook.params.value).toEqual({ scopeName: undefined })
  })

  it('removeEmpty strips empty values before writing params', async () => {
    const { hook } = createFormHook(
      { removeEmpty: true },
      createForm({
        getFieldsValue: vi.fn(
          () => ({ scopeName: 'foo', status: '', ids: [], missing: null }) as TestFormModel
        )
      })
    )

    await hook.search()

    expect(hook.params.value).toEqual({ scopeName: 'foo' })
  })

  it('applies removeEmpty before transform', async () => {
    const transform = vi.fn((values: TestFormModel) => ({ ...values, extra: true }))
    const { hook } = createFormHook(
      { removeEmpty: true, transform },
      createForm({
        getFieldsValue: vi.fn(() => ({ scopeName: 'foo', status: '' }) as TestFormModel)
      })
    )

    await hook.search()

    expect(transform).toHaveBeenCalledWith({ scopeName: 'foo' })
    expect(hook.params.value).toEqual({ scopeName: 'foo', extra: true })
  })

  it('skips updates when values are unchanged', async () => {
    const { hook } = createFormHook(
      {},
      createForm({
        getFieldsValue: vi.fn(() => ({ scopeName: 'foo' }) as TestFormModel)
      })
    )

    await hook.search()
    const previous = hook.params.value
    await hook.search()

    expect(hook.params.value).toBe(previous)
  })
})
