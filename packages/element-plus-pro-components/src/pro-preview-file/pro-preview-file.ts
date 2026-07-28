import type { Ref } from 'vue'

/**
 * Registry interface for preview file kinds. Extensible via declaration
 * merging so applications can register custom kinds (e.g. `video`, `audio`).
 */
export interface ProPreviewFileKinds {
  image: true
  pdf: true
  xlsx: true
  docx: true
  unsupported: true
}

export type ProPreviewFileKind = keyof ProPreviewFileKinds
export type ProPreviewFileValue = string | Blob | File

export interface ProPreviewFileSource {
  name: string
  url?: string
  raw?: File
  type?: string
}

export interface ProPreviewFileProps<TFile extends ProPreviewFileSource = ProPreviewFileSource> {
  file?: TFile | null
  title?: string
  height?: string
  download?: boolean
}

export interface ProPreviewFileExpose<TFile extends ProPreviewFileSource = ProPreviewFileSource> {
  visible: Ref<boolean>
  file: Readonly<Ref<TFile | null>>
  kind: Readonly<Ref<ProPreviewFileKind>>
  show: (file: TFile) => void
  close: () => void
  download: () => void
}

export type ProPreviewFileInstance<TFile extends ProPreviewFileSource = ProPreviewFileSource> =
  ProPreviewFileExpose<TFile>
