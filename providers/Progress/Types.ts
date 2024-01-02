export type State = {
  currentChapterId?: string
  chapterProgress: { [chapterId: string]: number | undefined }
}

export type Actions = {
  updateCurrentChapter: (id?: string, progress?: number) => void
}

export type Context = {
  state: State
  actions: Actions
}
