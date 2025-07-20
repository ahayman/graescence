import { createContext, FunctionComponent, PropsWithChildren, useCallback, useState } from 'react'
import { Context, State } from './Types'
import { isServerError, ProgressData, ProgressDataItem, UserData } from '../../app/api/types'

const emptyUser: UserData = {
  id: '',
  fullName: '',
  tier: 'free',
  updatedAt: '',
}

export const ApiContext = createContext<Context>({
  state: {},
  actions: {
    fetchAuthSignIn: async () => emptyUser,
    refreshToken: async () => {},
    fetchIdentity: async () => emptyUser,
    fetchProgress: async () => ({ progressData: [] }),
    postProgress: async () => ({ progressData: [] }),
  },
})

export const APIProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<State>({})

  const clearError = useCallback(() => setState(s => ({ ...s, error: undefined })), [])

  const handleError = useCallback((error: any) => {
    if (isServerError(error)) {
      setState(s => ({ ...s, error: { message: error.message, statusCode: error.statusCode } }))
    }
    throw error
  }, [])

  const fetchAuthSignIn = useCallback(
    async (code: string): Promise<UserData> => {
      clearError()
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/patreon/token`)
      url.searchParams.set('code', code)
      const result = await fetch(url.toString())
      if (!result.ok) handleError(await result.json())

      return await result.json()
    },
    [clearError, handleError],
  )

  const refreshToken = useCallback(async (): Promise<void> => {
    clearError()
    const result = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/patreon/token/refresh`)
    if (!result.ok) handleError(await result.json())

    return
  }, [clearError, handleError])

  const fetchIdentity = useCallback(async (): Promise<UserData> => {
    clearError()
    const result = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/patreon/identity`)
    if (!result.ok) handleError(await result.json())
    return await result.json()
  }, [clearError, handleError])

  const fetchProgress = useCallback(
    async (userId: string, sinceUpdate?: Date): Promise<ProgressData> => {
      clearError()
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/progress/${userId}`)
      if (sinceUpdate) url.searchParams.set('sinceUpdate', sinceUpdate.toISOString())
      const result = await fetch(url.toString())
      if (!result.ok) handleError(await result.json())
      return await result.json()
    },
    [clearError, handleError],
  )

  const postProgress = useCallback(
    async (userId: string, progress: ProgressDataItem[], sinceUpdate?: Date): Promise<ProgressData> => {
      clearError()
      const progressData: ProgressData = {
        progressData: progress,
      }
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/progress/${userId}`)
      if (sinceUpdate) url.searchParams.set('sinceUpdate', sinceUpdate.toISOString())

      const result = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
        method: 'POST',
      })
      if (!result.ok) handleError(await result.json())
      return await result.json()
    },
    [clearError, handleError],
  )

  return (
    <ApiContext.Provider
      value={{
        state,
        actions: {
          fetchAuthSignIn,
          fetchIdentity,
          refreshToken,
          fetchProgress,
          postProgress,
        },
      }}>
      {children}
    </ApiContext.Provider>
  )
}
