import {
  computed,
  onMounted,
  onScopeDispose,
  ref,
  toRaw,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type WatchStopHandle
} from 'vue'
import { cloneDeep } from 'lodash-es'
import { useFormContext } from './provider'
import type {
  FormDynamicValue,
  FormFieldDependencyContext,
  FormFieldEffectContext,
  FormModel,
  FormSchema
} from './types/form'
import { getFormDependencyKey, resolveFormDynamicValue } from './form-dependency'

export function useFormField<TModel extends FormModel>(
  schemaSource: MaybeRefOrGetter<FormSchema<TModel>>
) {
  const formContext = useFormContext<TModel>()
  const modelSnapshot = ref<TModel>(cloneDeep(toRaw(formContext.formModel.value)))

  const schema = computed(() => toValue(schemaSource))
  const fieldName = computed(() => schema.value.name ?? String(schema.value.key))
  const dependencyPaths = computed(() => schema.value.dependencies || [])
  const dependencyValues = computed(() =>
    dependencyPaths.value.map(path => formContext.getFieldValue(path))
  )
  const dependencies = computed(() =>
    dependencyPaths.value.reduce<Record<string, unknown>>((result, path, index) => {
      result[getFormDependencyKey(path)] = dependencyValues.value[index]
      return result
    }, {})
  )

  let stopModelWatch: WatchStopHandle | undefined
  const stopShouldUpdateWatch = watch(
    () => schema.value.shouldUpdate,
    shouldUpdate => {
      stopModelWatch?.()
      stopModelWatch = undefined
      if (!shouldUpdate) return

      modelSnapshot.value = cloneDeep(toRaw(formContext.formModel.value))
      stopModelWatch = watch(
        () => cloneDeep(formContext.formModel.value),
        (current, previous) => {
          if (shouldUpdate(previous, current)) modelSnapshot.value = current
        },
        { deep: true }
      )
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    stopShouldUpdateWatch()
    stopModelWatch?.()
  })

  const context = computed<FormFieldDependencyContext<TModel>>(() => ({
    name: fieldName.value,
    value: formContext.getFieldValue(fieldName.value),
    values: schema.value.shouldUpdate ? modelSnapshot.value : formContext.formModel.value,
    dependencies: dependencies.value,
    dependencyValues: dependencyValues.value,
    getFieldValue: formContext.getFieldValue
  }))

  function resolve<TValue>(
    value: FormDynamicValue<TModel, TValue> | undefined,
    fallback: TValue
  ): TValue {
    const preferContext = Boolean(schema.value.dependencies?.length || schema.value.shouldUpdate)
    return resolveFormDynamicValue(value, context.value, preferContext, fallback)
  }

  // --- Field-level effects ---
  // Triggered when declared `dependencies` change or `shouldUpdate` reports a
  // change. Bypasses `normalize` via `setFieldValueRaw` so programmatic
  // mutations are not re-shaped by input rules.
  const effectHandler = computed(() => schema.value.effects)
  // Seed previous values with the initial state so the first triggered run
  // can report what changed from. The immediate run (effectsImmediate) still
  // reports `undefined` since there is no prior change to compare against.
  let effectPreviousValue: unknown = formContext.getFieldValue(fieldName.value)
  let effectPreviousDependencyValues: readonly unknown[] = [...dependencyValues.value]
  let isRunningEffect = false

  function buildEffectContext(isImmediate: boolean): FormFieldEffectContext<TModel> {
    return {
      ...context.value,
      previousValue: isImmediate ? undefined : effectPreviousValue,
      previousDependencyValues: isImmediate ? undefined : effectPreviousDependencyValues,
      setFieldValue: formContext.setFieldValueRaw,
      clearFieldValue: formContext.clearFieldValue,
      validateField: formContext.validateField,
      clearFieldError: formContext.clearFieldErrors
    }
  }

  function runEffect(isImmediate = false) {
    const handler = effectHandler.value
    if (typeof handler !== 'function') return
    // Guard against synchronous re-entrance: an effect that sets one of its
    // own dependencies would otherwise recurse immediately.
    if (isRunningEffect) return
    isRunningEffect = true
    try {
      handler(buildEffectContext(isImmediate))
    } finally {
      effectPreviousValue = context.value.value
      effectPreviousDependencyValues = [...context.value.dependencyValues]
      isRunningEffect = false
    }
  }

  const stopEffectsDepsWatch = watch(
    dependencyValues,
    () => {
      if (effectHandler.value) runEffect()
    },
    { deep: true }
  )

  // `modelSnapshot` only changes when `shouldUpdate` returns true, so this
  // watch fires exactly for shouldUpdate-driven effect triggers.
  const stopEffectsModelWatch = watch(modelSnapshot, () => {
    if (effectHandler.value && schema.value.shouldUpdate) runEffect()
  })

  if (schema.value.effectsImmediate) {
    onMounted(() => runEffect(true))
  }

  onScopeDispose(() => {
    stopEffectsDepsWatch()
    stopEffectsModelWatch()
  })

  return {
    context,
    dependencies,
    dependencyValues,
    fieldName,
    resolve
  }
}
