import { createContext, ReactNode, useCallback, useReducer } from 'react'
import Reducer from './Reducer'
import { Context, PopoverContent } from './Types'
import { Storage } from '../../lib/globals'

export type Props = {
  children: ReactNode
}

export const DisplayContext = createContext<Context>({} as any)

const DisplayProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(
    Reducer,
    typeof window === 'undefined'
      ? { historySortDirection: 'descending', fullScreen: false }
      : {
          historySortDirection: 'descending',
          fullScreen: Storage.get('--full-screen') === 'true',
        },
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

  const toggleFullScreen = useCallback(() => {
    dispatch({ type: 'toggleFullScreen' })
  }, [dispatch])

  return (
    <DisplayContext.Provider
      value={{
        state,
        actions: {
          openPopover,
          closePopover,
          toggleFullScreen,
        },
      }}>
      {children}
    </DisplayContext.Provider>
  )
}
export default DisplayProvider
