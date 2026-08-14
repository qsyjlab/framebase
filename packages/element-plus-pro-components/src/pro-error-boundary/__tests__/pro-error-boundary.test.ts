// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'

// Stub ProException so the default fallback renders without pulling
// element-plus CSS (vitest's node loader can't resolve .css). The factory
// is async and imports vue internally because vi.mock factories are hoisted
// above the test's own imports, so top-level `defineComponent`/`h` are not
// yet in scope when the factory runs.
vi.mock('../../pro-exception', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    ProException: defineComponent({
      name: 'ProException',
      props: {
        status: { type: String, default: '500' },
        showBack: { type: Boolean, default: true },
        showHome: { type: Boolean, default: true },
        showReload: { type: Boolean, default: false },
        reloadText: { type: String, default: '' }
      },
      setup(props: { status: string }) {
        return () => h('div', { class: `pro-exception is-${props.status}` })
      }
    })
  }
})

const ProErrorBoundary = (await import('../pro-error-boundary.vue')).default

function mountApp(vnode: ReturnType<typeof h>): {
  container: HTMLElement
  unmount: () => void
} {
  const container = document.createElement('div')
  const app = createApp({ render: () => vnode })
  app.mount(container)
  return { container, unmount: () => app.unmount() }
}

const Boom = defineComponent({
  name: 'Boom',
  setup() {
    throw new Error('boom')
  },
  render() {
    return null
  }
})

// Silence Vue's console noise from the intentionally throwing Boom component.
const originalError = console.error
console.error = (...args: unknown[]) => {
  const first = args[0]
  if (typeof first === 'string' && (first.includes('Uncaught error') || first.includes('boom'))) {
    return
  }
  if (first instanceof Error && first.message === 'boom') return
  originalError(...args)
}

describe('ProErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { container, unmount } = mountApp(
      h(ProErrorBoundary, null, () => h('div', { class: 'ok' }, 'content'))
    )
    expect(container.querySelector('.ok')?.textContent).toBe('content')
    unmount()
  })

  it('renders a custom fallback slot when a child throws', async () => {
    const { container, unmount } = mountApp(
      h(ProErrorBoundary, null, {
        default: () => h(Boom),
        fallback: () => h('div', { class: 'fallback' }, 'fallback-content')
      })
    )
    await nextTick()
    expect(container.querySelector('.fallback')?.textContent).toBe('fallback-content')
    unmount()
  })

  it('passes error and reset to the fallback slot scope', async () => {
    const { container, unmount } = mountApp(
      h(ProErrorBoundary, null, {
        default: () => h(Boom),
        fallback: ({ error, reset }: { error: unknown; reset: () => void }) =>
          h('button', { class: 'recover', onClick: reset }, (error as Error)?.message ?? 'error')
      })
    )
    await nextTick()
    const button = container.querySelector('.recover') as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('boom')
    // Reset re-renders the default slot, which throws again → fallback returns.
    button.click()
    await nextTick()
    expect(container.querySelector('.recover')).toBeTruthy()
    unmount()
  })

  it('renders a static fallback prop', async () => {
    const { container, unmount } = mountApp(
      h(ProErrorBoundary, { fallback: h('div', { class: 'static' }, 'static') }, () => h(Boom))
    )
    await nextTick()
    expect(container.querySelector('.static')?.textContent).toBe('static')
    unmount()
  })

  it('invokes onError when a child throws', async () => {
    const onError = vi.fn()
    const { unmount } = mountApp(
      h(
        ProErrorBoundary,
        { onError, stopPropagation: true },
        {
          default: () => h(Boom),
          fallback: () => h('div', { class: 'fallback' })
        }
      )
    )
    await nextTick()
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect((onError.mock.calls[0][0] as Error).message).toBe('boom')
    expect(typeof onError.mock.calls[0][1]).toBe('string')
    unmount()
  })

  it('exposes reset, hasError and error via defineExpose', async () => {
    interface BoundaryExpose {
      // defineExpose refs are unwrapped when accessed via template ref.
      hasError: boolean
      error: unknown
      reset: () => void
    }
    const boundaryRef = ref<BoundaryExpose>()
    const container = document.createElement('div')
    const app = createApp({
      render: () =>
        h(
          ProErrorBoundary,
          { ref: boundaryRef },
          {
            default: () => h(Boom),
            fallback: () => h('div', { class: 'fallback' })
          }
        )
    })
    app.mount(container)
    await nextTick()
    expect(boundaryRef.value).toBeTruthy()
    expect(boundaryRef.value!.hasError).toBe(true)
    expect(boundaryRef.value!.error).toBeInstanceOf(Error)
    boundaryRef.value!.reset()
    expect(boundaryRef.value!.hasError).toBe(false)
    app.unmount()
  })
})
