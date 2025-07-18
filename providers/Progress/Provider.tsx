import { createContext, ReactNode, use, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Storage } from '../../lib/globals'
import { Actions, Context, ProgressItem, State } from './Types'
import { useStateDebouncer } from '../../hooks/useStateDebouncer'
import { PatreonContext } from '../Patreon/Provider'
import { fetchProgress, postProgress } from '../Patreon/Api'
import { ContentType } from '../../staticGenerator/types'
import { isNotEmpty } from '../../lib/utils'

export const ProgressContext = createContext<Context>({} as any)

export type Props = {
  children: ReactNode
}

type StoreProgressItem = {
  id: string
  progress: number
  type: ContentType
  updatedAt: string
}
type StoredState = {
  lastUpdated?: Date
  currentChapter?: StoreProgressItem
  progress: { [id: string]: StoreProgressItem }
}

const hydrateState = (state: StoredState): State => ({
  currentChapter: state.currentChapter ? hydratedProgressItem(state.currentChapter) : undefined,
  progress: Object.fromEntries(Object.entries(state.progress).map(([key, item]) => [key, hydratedProgressItem(item)])),
})

const hydratedProgressItem = (item: StoreProgressItem): ProgressItem => ({
  ...item,
  updatedAt: new Date(item.updatedAt),
})

const dehydrateState = (state: State): StoredState => ({
  currentChapter: state.currentChapter ? dehydratedProgressItem(state.currentChapter) : undefined,
  progress: Object.fromEntries(
    Object.entries(state.progress)
      .map(([key, item]) => (item ? [key, dehydratedProgressItem(item)] : undefined))
      .filter(isNotEmpty),
  ),
})

const dehydratedProgressItem = (item: ProgressItem): StoreProgressItem => ({
  ...item,
  updatedAt: item.updatedAt.toISOString(),
})

const getStoredProgressData = (): State => {
  const readingDataString = Storage.get('--reading-progress')
  if (!readingDataString) return { progress: {} }
  const data: StoredState = JSON.parse(readingDataString)
  return hydrateState(data)
}

const ProgressProvider = ({ children }: Props) => {
  const {
    state: { user },
  } = useContext(PatreonContext)
  const [updates, _, setUpdates] = useStateDebouncer<{ [id: string]: StoreProgressItem }>({}, 1000)
  const [state, setState] = useState<State>(typeof window === 'undefined' ? { progress: {} } : getStoredProgressData())
  const initialUser = useRef(user)
  const lastUpdatedRef = useRef(state.lastUpdated)
  lastUpdatedRef.current = state.lastUpdated

  const updateProgress: Actions['updateProgress'] = useCallback(
    (id, type, progress) => {
      setState(current => {
        const progressItem: ProgressItem = {
          id,
          type,
          progress: progress ?? current.progress[id]?.progress ?? 0,
          updatedAt: new Date(),
        }
        const state: State = { ...current, progress: { ...current.progress, [id]: progressItem } }

        if (progressItem.type === 'chapter') {
          state.currentChapter = progressItem
        }
        setUpdates(updates => ({ ...updates, [id]: dehydratedProgressItem(progressItem) }))
        return state
      })
    },
    [setUpdates],
  )

  useEffect(() => {
    Storage.set('--reading-progress', JSON.stringify(dehydrateState(state)))
  }, [state])

  const updateStateWithProgress = useCallback((progress: State['progress']) => {
    setState(s => ({
      ...s,
      lastUpdated: new Date(),
      currentChapter:
        Object.values({ ...s.progress, ...progress })
          .filter(isNotEmpty)
          .filter(i => i?.type === 'chapter')
          .reduce((max, c) => (c.updatedAt > max.updatedAt ? c : max)) ?? s.currentChapter,
      progress: {
        ...s.progress,
        ...progress,
      },
    }))
  }, [])

  useEffect(() => {
    if (!user || user.tier === 'free') return

    const syncData = async () => {
      if (initialUser.current && initialUser.current.tier !== 'free') return
      const updates = await fetchProgress(user.id, lastUpdatedRef.current)
      const localEntries = getStoredProgressData().progress
      const validatedUpdates = updates.progressData
        .map(u => hydratedProgressItem(u as StoreProgressItem))
        .filter(update => {
          const localEntry = localEntries[update.id]
          if (localEntry && localEntry.updatedAt > update.updatedAt) return false
          return true
        })
      const mergedEntries = {
        ...localEntries,
        ...Object.fromEntries(validatedUpdates.map(u => [u.id, u])),
      }
      updateStateWithProgress(mergedEntries)
    }

    syncData()
  }, [updateStateWithProgress, user])

  useEffect(() => {
    if (!user || user.tier === 'free') return
    const updatedItems = Object.values(updates)
    if (updatedItems.length <= 0) return
    postProgress(user.id, updatedItems, lastUpdatedRef.current)
      .then(updates => {
        setUpdates({}, true)
        const progress = Object.fromEntries(
          updates.progressData.map(p => [p.id, hydratedProgressItem(p as StoreProgressItem)]),
        )
        updateStateWithProgress(progress)
      })
      .catch(e => console.log(`Error posting updates: `, e))
  }, [setUpdates, updateStateWithProgress, updates, user])

  return (
    <ProgressContext.Provider
      value={{
        state,
        actions: { updateProgress },
      }}>
      {children}
    </ProgressContext.Provider>
  )
}
export default ProgressProvider
