import { nextTick, shallowRef, unref, type Ref } from 'vue'
import { cloneDeep, isEqual, omitBy } from 'lodash-es'
import type {
  FormFieldProp,
  FormMethodsType,
  FormModel,
  FormValidationCallback
} from './types/form'

export type ProFormRef<TModel extends FormModel> = Readonly<Ref<FormMethodsType<TModel> | null>>

function isEmptyParamsValue(value: unknown): boolean {
  return (
    value === '' ||
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0)
  )
}

export interface UseProFormOptions<TModel extends FormModel> {
  /** 初始查询参数，默认 `{}`。 */
  initialValues?: Partial<TModel>
  /**
   * 提交/重置值写入 `params` 前的最后加工（如改写 key、补充派生参数），
   * 返回值整体替换 `params`。
   */
  transform?: (values: TModel) => TModel
  /**
   * 是否移除空值（`''` / `null` / `undefined` / `[]`）后再写入 `params`，默认 false。
   * 避免把空字符串当作查询条件发给后端。
   */
  removeEmpty?: boolean
}

/** Typed form commands backed by a Vue 3.5 template ref. */
export function useProForm<TModel extends FormModel = FormModel>(
  templateRef: ProFormRef<TModel>,
  options: UseProFormOptions<TModel> = {}
) {
  const formInstance = templateRef

  async function getForm() {
    await nextTick()
    const form = unref(formInstance)

    if (!form) throw Error('The form template ref is not available')
    return form
  }

  // --- 查询参数：把提交/重置的表单值收拢为 params ---

  const transform = options.transform ?? ((values: TModel) => values)
  const removeEmpty = options.removeEmpty ?? false

  function resolveValues(values: TModel): TModel {
    let next = cloneDeep(values)
    if (removeEmpty) next = omitBy(next, isEmptyParamsValue) as TModel
    return transform(next)
  }

  const params = shallowRef<TModel>(
    resolveValues((options.initialValues ?? {}) as TModel)
  ) as Ref<TModel>

  function applyParams(values: TModel): boolean {
    const next = resolveValues(values)
    // 值未变化时跳过更新，避免重复触发表格请求
    if (isEqual(next, params.value)) return false
    params.value = next
    return true
  }

  /**
   * 查询。两种用法：
   * - 作为 `@submit` 事件处理器：`<pro-form @submit="search">`，
   *   事件携带的表单值直接写入 `params`（提交前表单已完成校验）；
   * - 程序化调用 `search()`：校验通过后读取表单值写入 `params`。
   * 返回是否发生更新（值未变化时为 false）。
   */
  async function search(values?: TModel) {
    if (values !== undefined) return applyParams(values)
    const instance = await getForm()
    const valid = await instance.validate()
    if (!valid) return false
    return applyParams(await instance.getFieldsValue())
  }

  // --- 表单命令 ---

  async function forceUpdateModel(model?: Partial<TModel>) {
    const instance = await getForm()
    instance.forceUpdateModel(model)
  }

  async function submit() {
    const instance = await getForm()
    const ok = await instance.submit()
    if (ok) applyParams(await instance.getFieldsValue())
    return ok
  }

  /**
   * 重置。两种用法：
   * - 作为 `@reset` 事件处理器：`<pro-form @reset="reset">`，事件携带的重置值直接写入
   *   `params`（表单已自行重置，不会二次 reset 造成事件循环）；
   * - 程序化调用 `reset()`：重置表单后把重置值写入 `params`。
   * 返回是否发生更新（值未变化时为 false）。
   */
  async function reset(values?: TModel) {
    if (values !== undefined) return applyParams(values)
    const instance = await getForm()
    instance.reset()
    return applyParams(await instance.getFieldsValue())
  }

  async function resetFields() {
    const instance = await getForm()
    instance.resetFields()
  }

  async function clearValidate(props?: FormFieldProp | FormFieldProp[]) {
    const instance = await getForm()
    instance.clearValidate(props)
  }

  async function validate(handle?: (model: TModel) => void) {
    const instance = await getForm()
    return instance.validate(handle)
  }

  async function validateField(
    props?: FormFieldProp | FormFieldProp[],
    callback?: FormValidationCallback
  ) {
    const instance = await getForm()
    return instance.validateField(props, callback)
  }

  async function scrollToField(prop: FormFieldProp) {
    const instance = await getForm()
    instance.scrollToField(prop)
  }

  async function setFieldValue<TValue = unknown>(
    name: Parameters<FormMethodsType<TModel>['setFieldValue']>[0],
    value: TValue
  ) {
    const instance = await getForm()
    instance.setFieldValue(name, value)
  }

  async function getFieldValue<TValue = unknown>(
    name: Parameters<FormMethodsType<TModel>['getFieldValue']>[0]
  ) {
    const instance = await getForm()
    return instance.getFieldValue<TValue>(name)
  }

  async function getFieldsValue(
    options?: Parameters<FormMethodsType<TModel>['getFieldsValue']>[0]
  ) {
    const instance = await getForm()
    return instance.getFieldsValue(options)
  }

  async function setFieldErrors(errors: Parameters<FormMethodsType<TModel>['setFieldErrors']>[0]) {
    const instance = await getForm()
    instance.setFieldErrors(errors)
  }

  async function clearFieldErrors(
    names?: Parameters<FormMethodsType<TModel>['clearFieldErrors']>[0]
  ) {
    const instance = await getForm()
    instance.clearFieldErrors(names)
  }

  async function getCollapsed() {
    return (await getForm()).getCollapsed()
  }

  async function setCollapsed(collapsed: boolean) {
    ;(await getForm()).setCollapsed(collapsed)
  }

  async function toggleCollapse() {
    ;(await getForm()).toggleCollapse()
  }

  async function load() {
    return (await getForm()).load()
  }

  async function getLoading() {
    return (await getForm()).getLoading()
  }

  async function getRequestLifecycle() {
    return (await getForm()).getRequestLifecycle()
  }

  async function getError() {
    return (await getForm()).getError()
  }

  async function retryRequest() {
    return (await getForm()).retryRequest()
  }

  async function cancelRequest(reason?: unknown) {
    ;(await getForm()).cancelRequest(reason)
  }

  async function getSubmitting() {
    return (await getForm()).getSubmitting()
  }

  async function isDirty() {
    return (await getForm()).isDirty()
  }

  async function markClean() {
    ;(await getForm()).markClean()
  }

  return {
    formInstance,
    getForm,
    submit,
    reset,
    validate,
    scrollToField,
    resetFields,
    clearValidate,
    validateField,
    forceUpdateModel,
    setFieldValue,
    getFieldValue,
    getFieldsValue,
    setFieldErrors,
    clearFieldErrors,
    getCollapsed,
    setCollapsed,
    toggleCollapse,
    load,
    getLoading,
    getRequestLifecycle,
    getError,
    retryRequest,
    cancelRequest,
    getSubmitting,
    isDirty,
    markClean,
    // --- 查询参数 ---
    params,
    search
  }
}
