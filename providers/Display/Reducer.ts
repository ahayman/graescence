import { ReducerAction } from '../../lib/types'
import { State } from './Types'

type Action =
  | ReducerAction<'setChapterTag', { tag?: string | 'All' }>
  | ReducerAction<'setChapterFilter', { filter?: string }>
  | ReducerAction<'setLoreCategory', { category?: string | 'All' }>
  | ReducerAction<'setLoreFilter', { filter?: string }>

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
  }
}
export default Reducer
