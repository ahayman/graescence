export type State = {
  chapterTag?: string | 'All'
  chapterFilter?: string
  loreCategory?: string | 'All'
  loreFilter?: string
}

export type Actions = {
  setChapterTag: (tag?: string | 'All') => void
  setChapterFilter: (filter?: string) => void
  setLoreCategory: (category?: string | 'All') => void
  setLoreFilter: (filter?: string) => void
}

export type Context = {
  state: State
  actions: Actions
}
