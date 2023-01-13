import { createContext, ReactNode, useCallback, useReducer } from 'react'
import Reducer from './Reducer'
import { Context } from './Types'

export type Props = {
  children: ReactNode
}

export const DisplayContext = createContext<Context>({} as any)

const DisplayProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(Reducer, {})

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

  return (
    <DisplayContext.Provider
      value={{
        state,
        actions: { setChapterTag, setChapterFilter, setLoreCategory, setLoreFilter },
      }}>
      {children}
    </DisplayContext.Provider>
  )
}
export default DisplayProvider
