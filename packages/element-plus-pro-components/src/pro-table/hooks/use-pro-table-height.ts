import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch,
  type Ref
} from 'vue'
import type { TableInstance } from 'element-plus'

interface UseProTableHeightOptions {
  enabled: () => boolean
  height: () => string | number | undefined
  tableRef: Ref<TableInstance | undefined>
  wrapperRef: Ref<HTMLDivElement | undefined>
  occupiedRefs: Array<Ref<HTMLDivElement | undefined>>
  dependencies: () => unknown[]
}

const ACTIVATION_MEASURE_ATTEMPTS = 4

export function useProTableHeight(options: UseProTableHeightOptions) {
  const measuredHeight = ref<number>()
  let resizeObserver: ResizeObserver | undefined
  let animationFrame: number | undefined
  let scheduleVersion = 0
  let mounted = false
  let active = true
  let wasDeactivated = false
  const tableHeight = computed(() => options.height() ?? measuredHeight.value)

  watch(
    () => [options.enabled(), options.height(), ...options.dependencies()],
    () => {
      if (!mounted || !active) return
      connectResizeObserver()
      scheduleTableHeight()
    },
    { deep: true }
  )

  onMounted(() => {
    mounted = true
    connectResizeObserver()
    scheduleTableHeight(ACTIVATION_MEASURE_ATTEMPTS)
  })

  onActivated(() => {
    active = true
    // KeepAlive 首次挂载也可能触发 activated，mounted 已负责首次测量。
    if (!wasDeactivated) return
    wasDeactivated = false
    connectResizeObserver()
    scheduleTableHeight(ACTIVATION_MEASURE_ATTEMPTS)
  })

  onDeactivated(() => {
    active = false
    wasDeactivated = true
    resizeObserver?.disconnect()
    cancelScheduledHeight()
  })

  onBeforeUnmount(() => {
    mounted = false
    active = false
    resizeObserver?.disconnect()
    cancelScheduledHeight()
  })

  function connectResizeObserver() {
    resizeObserver?.disconnect()
    if (!shouldMeasure() || !mounted || !active || typeof ResizeObserver === 'undefined') return
    resizeObserver ??= new ResizeObserver(() => scheduleTableHeight())
    ;[options.wrapperRef, ...options.occupiedRefs].forEach(element => {
      if (element.value) resizeObserver?.observe(element.value)
    })
  }

  function cancelScheduledHeight() {
    scheduleVersion++
    cancelAnimationFrameIfNeeded()
  }

  function cancelAnimationFrameIfNeeded() {
    if (animationFrame !== undefined && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(animationFrame)
    }
    animationFrame = undefined
  }

  function scheduleTableHeight(maxAttempts = 1) {
    cancelAnimationFrameIfNeeded()
    const version = ++scheduleVersion
    void nextTick(() => {
      if (!canRun(version)) return
      if (typeof requestAnimationFrame !== 'function') {
        measureTableHeight()
        return
      }
      requestMeasureFrame(version, maxAttempts)
    })
  }

  function requestMeasureFrame(version: number, attemptsRemaining: number) {
    if (!canRun(version)) return
    animationFrame = requestAnimationFrame(() => {
      animationFrame = undefined
      if (!canRun(version)) return
      const measured = tryMeasureTableHeight()
      if (!measured && attemptsRemaining > 1) {
        requestMeasureFrame(version, attemptsRemaining - 1)
      }
    })
  }

  function canRun(version: number) {
    return version === scheduleVersion && mounted && active && shouldMeasure()
  }

  function shouldMeasure() {
    return options.enabled() && options.height() == null
  }

  function tryMeasureTableHeight() {
    if (!shouldMeasure() || !options.wrapperRef.value) return false
    const wrapperHeight = options.wrapperRef.value.clientHeight
    // KeepAlive 将缓存节点移出可视容器时会短暂得到 0；不要用隐藏态高度覆盖
    // 最后一次有效结果，重新 activated 后会再次测量。
    if (wrapperHeight <= 0) return false
    const occupiedHeight = options.occupiedRefs.reduce(
      (height, element) => height + (element.value?.offsetHeight ?? 0),
      0
    )
    measuredHeight.value = Math.max(0, wrapperHeight - occupiedHeight)
    options.tableRef.value?.doLayout()
    return true
  }

  function measureTableHeight() {
    tryMeasureTableHeight()
  }

  return { tableHeight, measureTableHeight }
}
