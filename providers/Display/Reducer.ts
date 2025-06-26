import { ReducerAction } from '../../lib/types'
import { PopoverContent, State } from './Types'

type Action =
  | ReducerAction<'setChapterTag', { tag?: string | 'All' }>
  | ReducerAction<'setChapterFilter', { filter?: string }>
  | ReducerAction<'setLoreCategory', { category?: string | 'All' }>
  | ReducerAction<'setLoreFilter', { filter?: string }>
  | ReducerAction<'setHistoryCategory', { category?: string | 'All' }>
  | ReducerAction<'setHistoryFilter', { filter?: string }>
  | ReducerAction<'setHistorySort', { sortDirection: 'ascending' | 'descending' }>
  | ReducerAction<'setPopover', { content?: PopoverContent }>

const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setChapterFilter':
      return { ...state, chapterFilter: action.filter }
    case 'setChapterTag':
      return { ...state, chapterTag: action.tag }
    case 'setLoreCategory':
      return { ...state, loreCategory: action.category }
    case 'setLoreFilter':
      return { ...state, loreFilter: action.filter }
    case 'setPopover':
      return { ...state, popover: action.content }
    case 'setHistoryCategory':
      return { ...state, historyCategory: action.category }
    case 'setHistoryFilter':
      return { ...state, historyFilter: action.filter }
    case 'setHistorySort':
      return { ...state, historySortDirection: action.sortDirection }
  }
}
export default Reducer
