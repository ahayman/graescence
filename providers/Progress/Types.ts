import { ContentType } from '../../staticGenerator/types'

export type State = {
  lastUpdated?: Date
  currentChapter?: ProgressItem
  progress: { [id: string]: ProgressItem | undefined }
}

export type ProgressItem = {
  id: string
  progress: number
  type: ContentType
  updatedAt: Date
}

export type Actions = {
  updateProgress: (id: string, type: ContentType, progress?: number) => void
}

export type Context = {
  state: State
  actions: Actions
}
