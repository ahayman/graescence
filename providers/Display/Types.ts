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
  historyCategory?: string | 'All'
  historyFilter?: string
  historySortDirection: 'ascending' | 'descending'
  popover?: PopoverContent
  fullScreen: boolean
}

export type Actions = {
  setChapterTag: (tag?: string | 'All') => void
  setChapterFilter: (filter?: string) => void
  setLoreCategory: (category?: string | 'All') => void
  setLoreFilter: (filter?: string) => void
  setHistoryCategory: (category?: string | 'All') => void
  setHistoryFilter: (filter?: string) => void
  setHistorySortDirection: (sortDirection: 'ascending' | 'descending') => void
  openPopover: (content: PopoverContent) => void
  closePopover: () => void
  toggleFullScreen: () => void
}

export type Context = {
  state: State
  actions: Actions
}
