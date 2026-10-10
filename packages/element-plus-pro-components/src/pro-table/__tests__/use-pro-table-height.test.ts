// @vitest-environment jsdom
import {
  computed,
  createApp,
  defineComponent,
  h,
  KeepAlive,
  nextTick,
  onActivated,
  onMounted,
  ref
} from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TableInstance } from 'element-plus'
import { useProTableHeight } from '../hooks/use-pro-table-height'

describe('use-pro-table-height', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preserves the last visible height and remeasures after KeepAlive activation', async () => {
    const frames: FrameRequestCallback[] = []
    let resizeObserverCount = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor() {
          resizeObserverCount++
        }
        observe() {
          return undefined
        }
        disconnect() {
          return undefined
        }
        unobserve() {
          return undefined
        }
      }
    )

    let wrapperHeight = 400
    const doLayout = vi.fn()
    let tableHeight = computed(() => 0)
    let measureTableHeight: () => void = () => undefined
    let activationCount = 0

    const TableHost = defineComponent({
      name: 'TableHeightTestHost',
      setup() {
        const wrapperRef = ref<HTMLDivElement>()
        const toolbarRef = ref<HTMLDivElement>()
        const tableRef = ref({ doLayout } as unknown as TableInstance)
        const state = useProTableHeight({
          enabled: () => true,
          height: () => undefined,
          tableRef,
          wrapperRef,
          occupiedRefs: [toolbarRef],
          dependencies: () => []
        })
        tableHeight = computed(() => Number(state.tableHeight.value ?? 0))
        measureTableHeight = state.measureTableHeight
        onActivated(() => activationCount++)

        onMounted(() => {
          Object.defineProperty(wrapperRef.value, 'clientHeight', {
            configurable: true,
            get: () => wrapperHeight
          })
          Object.defineProperty(toolbarRef.value, 'offsetHeight', {
            configurable: true,
            get: () => 48
          })
        })

        return () => h('div', { ref: wrapperRef }, [h('div', { ref: toolbarRef })])
      }
    })
    const EmptyHost = defineComponent({ render: () => h('div') })
    const active = ref(true)
    const Root = defineComponent({
      setup: () => () =>
        h(KeepAlive, null, {
          default: () => (active.value ? h(TableHost, { key: 'table' }) : h(EmptyHost))
        })
    })
    const container = document.createElement('div')
    const app = createApp(Root)
    app.mount(container)

    await flushAnimationFrames(frames)
    expect(tableHeight.value).toBe(352)
    expect(doLayout).toHaveBeenCalledTimes(1)

    wrapperHeight = 0
    measureTableHeight()
    expect(tableHeight.value).toBe(352)

    active.value = false
    await nextTick()
    wrapperHeight = 520
    active.value = true
    await nextTick()
    expect(activationCount).toBeGreaterThan(1)
    await flushAnimationFrames(frames)

    expect(tableHeight.value).toBe(472)
    expect(doLayout).toHaveBeenCalledTimes(2)
    expect(resizeObserverCount).toBe(1)
    app.unmount()
  })
})

async function flushAnimationFrames(frames: FrameRequestCallback[]) {
  await nextTick()
  while (frames.length) frames.shift()?.(performance.now())
  await nextTick()
}
