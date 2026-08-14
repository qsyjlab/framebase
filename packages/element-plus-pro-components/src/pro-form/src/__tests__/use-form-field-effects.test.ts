// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, reactive, ref, type Ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { getProPathValue, setProPathValue, unsetProPathValue } from '../../../shared/pro-path'
import { createFormContext } from '../provider'
import { useFormField } from '../use-form-field'
import type { FormModel, FormSchema } from '../types/form'

interface TestModel extends FormModel {
  country: string
  city: string
  type: string
  tags: string[]
}

function mountFormField(model: TestModel, schema: FormSchema<TestModel>) {
  let api: ReturnType<typeof useFormField<TestModel>> | undefined
  const formModel = reactive({ ...model }) as TestModel

  // `provide` must live in a parent component; `inject` (via useFormField)
  // runs in a child. Using the same component for both does not work because
  // `provide` only exposes values to descendants.
  const Child = defineComponent({
    setup() {
      api = useFormField<TestModel>(() => schema)
      return () => h('div')
    }
  })

  const Host = defineComponent({
    setup() {
      createFormContext({
        formModel: ref(formModel) as Ref<TestModel>,
        submit: vi.fn(async () => true),
        reset: vi.fn(),
        toggleCollapse: vi.fn(),
        getFieldValue: name => getProPathValue(formModel, name),
        setFieldValue: (name, value) => setProPathValue(formModel, name, value),
        setFieldValueRaw: (name, value) => setProPathValue(formModel, name, value),
        clearFieldValue: name => unsetProPathValue(formModel, name),
        setFieldVisibility: vi.fn(),
        removeFieldVisibility: vi.fn(),
        getFieldError: () => '',
        validateField: vi.fn(async () => true),
        clearFieldErrors: vi.fn()
      })
      return () => h(Child)
    }
  })

  const app = createApp(Host)
  const el = document.createElement('div')
  app.mount(el)

  return {
    api: api!,
    formModel,
    unmount: () => app.unmount()
  }
}

describe('pro form field effects', () => {
  it('does not trigger effects on mount by default', async () => {
    const effect = vi.fn()
    const { unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effects: effect
      }
    )

    await nextTick()
    expect(effect).not.toHaveBeenCalled()
    unmount()
  })

  it('triggers effects when declared dependencies change', async () => {
    const effect = vi.fn()
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effects: ctx => {
          effect({
            value: ctx.value,
            dependencyValues: ctx.dependencyValues,
            previousDependencyValues: ctx.previousDependencyValues
          })
        }
      }
    )

    formModel.country = 'US'
    await nextTick()

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenLastCalledWith({
      value: 'Beijing',
      dependencyValues: ['US'],
      previousDependencyValues: ['CN']
    })
    unmount()
  })

  it('runs effects on mount when effectsImmediate is true', async () => {
    const effect = vi.fn()
    const { unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effectsImmediate: true,
        effects: ctx => {
          effect({
            value: ctx.value,
            previousValue: ctx.previousValue,
            dependencyValues: ctx.dependencyValues,
            previousDependencyValues: ctx.previousDependencyValues
          })
        }
      }
    )

    await nextTick()
    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenLastCalledWith({
      value: 'Beijing',
      previousValue: undefined,
      dependencyValues: ['CN'],
      previousDependencyValues: undefined
    })
    unmount()
  })

  it('tracks previousValue across multiple effect runs', async () => {
    const effect = vi.fn()
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effects: ctx => {
          effect({
            value: ctx.value,
            previousValue: ctx.previousValue
          })
        }
      }
    )

    formModel.country = 'US'
    await nextTick()
    // First triggered run: previousValue is the initial field value
    expect(effect).toHaveBeenLastCalledWith({
      value: 'Beijing',
      previousValue: 'Beijing'
    })

    // Mutate the field's own value, then trigger again by changing the dependency
    formModel.city = 'New York'
    formModel.country = 'UK'
    await nextTick()
    // Second run: previousValue is the value from the previous run
    expect(effect).toHaveBeenLastCalledWith({
      value: 'New York',
      previousValue: 'Beijing'
    })
    unmount()
  })

  it('exposes setFieldValue that writes literal values', async () => {
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effects: ctx => {
          if (ctx.dependencyValues[0] === 'US') {
            ctx.setFieldValue('city', 'New York')
          }
        }
      }
    )

    formModel.country = 'US'
    await nextTick()
    expect(formModel.city).toBe('New York')
    unmount()
  })

  it('clears field values via clearFieldValue', async () => {
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: 'capital', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effects: ctx => {
          ctx.clearFieldValue('city')
          ctx.clearFieldValue('type')
        }
      }
    )

    formModel.country = 'US'
    await nextTick()
    expect(formModel.city).toBeUndefined()
    expect(formModel.type).toBeUndefined()
    unmount()
  })

  it('triggers effects when shouldUpdate returns true', async () => {
    const effect = vi.fn()
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        shouldUpdate: (prev, current) => prev.country !== current.country,
        effects: ctx => {
          effect(ctx.dependencyValues)
        }
      }
    )

    // A change that doesn't satisfy shouldUpdate should not trigger
    formModel.city = 'Shanghai'
    await nextTick()
    expect(effect).not.toHaveBeenCalled()

    // A change that satisfies shouldUpdate should trigger
    formModel.country = 'US'
    await nextTick()
    expect(effect).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('does not trigger effects when neither dependencies nor shouldUpdate is declared', async () => {
    const effect = vi.fn()
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: 'Beijing', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        effects: effect
      }
    )

    formModel.country = 'US'
    formModel.city = 'New York'
    await nextTick()
    expect(effect).not.toHaveBeenCalled()
    unmount()
  })

  it('guards against synchronous re-entrance when effect sets its own dependency', async () => {
    const effect = vi.fn(
      (ctx: {
        setFieldValue: (n: string, v: unknown) => void
        dependencyValues: readonly unknown[]
      }) => {
        // Synchronously set the dependency to a sentinel to stop the chain
        if (ctx.dependencyValues[0] !== 'done') {
          ctx.setFieldValue('country', 'done')
        }
      }
    )
    const { formModel, unmount } = mountFormField(
      { country: 'CN', city: '', type: '', tags: [] },
      {
        key: 'city',
        name: 'city',
        dependencies: ['country'],
        effects: effect
      }
    )

    formModel.country = 'US'
    await nextTick()
    // First run for 'US' (sets country to 'done'), second run for 'done' (no-op)
    expect(effect).toHaveBeenCalledTimes(2)
    expect(formModel.country).toBe('done')
    unmount()
  })
})
