import { createContext, ReactNode, useCallback, useReducer } from 'react'
import Reducer from './Reducer'
import { Context, PopoverContent } from './Types'

export type Props = {
  children: ReactNode
}

export const DisplayContext = createContext<Context>({} as any)

const DisplayProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(Reducer, { historySortDirection: 'descending' })

  const setChapterTag = useCallback(
    (tag?: string | 'All') => {
      dispatch({ type: 'setChapterTag', tag })
    },
    [dispatch],
  )

  const setChapterFilter = useCallback(
    (filter?: string) => {
      dispatch({ type: 'setChapterFilter', filter })
    },
    [dispatch],
  )

  const setLoreCategory = useCallback(
    (category?: string | 'All') => {
      dispatch({ type: 'setLoreCategory', category })
    },
    [dispatch],
  )

  const setLoreFilter = useCallback(
    (filter?: string) => {
      dispatch({ type: 'setLoreFilter', filter })
    },
    [dispatch],
  )

  const setHistoryCategory = useCallback(
    (category?: string | 'All') => {
      dispatch({ type: 'setHistoryCategory', category })
    },
    [dispatch],
  )

  const setHistoryFilter = useCallback(
    (filter?: string) => {
      dispatch({ type: 'setHistoryFilter', filter })
    },
    [dispatch],
  )

  const setHistorySortDirection = useCallback(
    (sortDirection: 'ascending' | 'descending') => {
      dispatch({ type: 'setHistorySort', sortDirection })
    },
    [dispatch],
  )

  const openPopover = useCallback(
    (content: PopoverContent) => {
      dispatch({ type: 'setPopover', content })
    },
    [dispatch],
  )

  const closePopover = useCallback(() => {
    dispatch({ type: 'setPopover' })
  }, [dispatch])

  return (
    <DisplayContext.Provider
      value={{
        state,
        actions: {
          setChapterTag,
          setChapterFilter,
          setLoreCategory,
          setLoreFilter,
          openPopover,
          closePopover,
          setHistoryFilter,
          setHistoryCategory,
          setHistorySortDirection,
        },
      }}>
      {children}
    </DisplayContext.Provider>
  )
}
export default DisplayProvider
