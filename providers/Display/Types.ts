import { ReactNode } from 'react'

export type PopoverContent = {
  content: ReactNode
  top: number
  right: number
  name: string
}

export type State = {
  chapterTag?: string | 'All'
  chapterFilter?: string
  loreCategory?: string | 'All'
  loreFilter?: string
  popover?: PopoverContent
}

export type Actions = {
  setChapterTag: (tag?: string | 'All') => void
  setChapterFilter: (filter?: string) => void
  setLoreCategory: (category?: string | 'All') => void
  setLoreFilter: (filter?: string) => void
  openPopover: (content: PopoverContent) => void
  closePopover: () => void
}

export type Context = {
  state: State
  actions: Actions
}
