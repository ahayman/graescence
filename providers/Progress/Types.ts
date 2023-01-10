export type State = {
  currentChapterId?: string
}

export type Actions = {
  updateCurrentChapter: (id?: string) => void
}

export type Context = {
  state: State
  actions: Actions
}
