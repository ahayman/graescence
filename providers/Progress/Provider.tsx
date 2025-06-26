import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import { Storage } from '../../lib/globals'
import { Context, State } from './Types'

export const ProgressContext = createContext<Context>({} as any)

export type Props = {
  children: ReactNode
}

const ProgressProvider = ({ children }: Props) => {
  const [state, setState] = useState<State>({
    currentChapterId: undefined,
    chapterProgress: {},
  })

  const updateCurrentChapter = useCallback((currentChapterId?: string, progress?: number) => {
    Storage.set('--current-chapter-id', currentChapterId)
    setState(current => {
      const state = { ...current }
      state.currentChapterId = currentChapterId
      if (progress !== undefined && currentChapterId !== undefined) {
        state.chapterProgress[currentChapterId] = progress
        Storage.set('--chapter-progress', JSON.stringify(state.chapterProgress))
      }
      return state
    })
  }, [])

  useEffect(() => {
    const currentChapterId = Storage.get('--current-chapter-id')
    const chapterProgressJson = Storage.get('--chapter-progress')
    const chapterProgress = chapterProgressJson ? JSON.parse(chapterProgressJson) : {}
    setState({ currentChapterId, chapterProgress })
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
