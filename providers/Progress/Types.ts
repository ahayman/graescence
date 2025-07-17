export type State = {
  lastUpdated?: Date
  currentChapter?: ProgressItem
  progress: { [id: string]: ProgressItem }
}

export type ProgressType = 'chapter' | 'lore' | 'blog' | 'history'

export type ProgressItem = {
  id: string
  progress: number
  type: ProgressType
  updatedAt: Date
}

export type Actions = {
  updateProgress: (id: string, type: ProgressType, progress?: number) => void
}

export type Context = {
  state: State
  actions: Actions
}
