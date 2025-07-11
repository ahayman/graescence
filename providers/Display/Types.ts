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
  openPopover: (content: PopoverContent) => void
  closePopover: () => void
  toggleFullScreen: () => void
}

export type Context = {
  state: State
  actions: Actions
}
