import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import { Storage } from '../../lib/globals'
import { Context, State } from './Types'

export const ProgressContext = createContext<Context>({} as any)

export type Props = {
  children: ReactNode
}

const ProgressProvider = ({ children }: Props) => {
  const [state, setState] = useState<State>({ currentChapterId: undefined })

  const updateCurrentChapter = useCallback((currentChapterId?: string) => {
    Storage.set('--current-chapter-id', currentChapterId)
    setState({ currentChapterId })
  }, [])

  useEffect(() => {
    setState({ currentChapterId: Storage.get('--current-chapter-id') })
  }, [])

  return (
    <ProgressContext.Provider
      value={{
        state,
        actions: { updateCurrentChapter },
      }}>
      {children}
    </ProgressContext.Provider>
  )
}
export default ProgressProvider
