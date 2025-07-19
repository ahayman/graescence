'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { fetchAuthSignIn, fetchIdentity, refreshToken } from './Api'
import { usePathname } from 'next/navigation'
import { AuthCookieKey, AuthWithExpiration, UserData } from '../../app/api/types'
import { getCookie } from 'cookies-next/client'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn },
})

type Props = PropsWithChildren

const refreshTimeout = 1000 * 60 * 60 * 24 * 7 // 1 Week

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})
  const fetchingUser = useRef(false)
  const fetchingAuth = useRef(false)
  const path = usePathname()
  const userRef = useRef(state.user)
  const usedCodes = useRef<string[]>([])
  userRef.current = state.user

  const updateUser = useCallback(async () => {
    if (fetchingUser.current || fetchingAuth.current) return
    fetchingUser.current = true
    try {
      const user = await fetchIdentity()
      Storage.set('--patreon-user-data', JSON.stringify(user))
      setState({ user })
    } finally {
      fetchingUser.current = false
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    if (fetchingAuth.current) return
    fetchingAuth.current = true
    try {
      await refreshToken()
      const user = await fetchIdentity()
      Storage.set('--patreon-user-data', JSON.stringify(user))
      setState({ user })
    } catch (error: any) {
      console.log({ error })
      setState(s => ({ ...s, error }))
    } finally {
      fetchingAuth.current = false
    }
  }, [])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

  const signIn = useCallback(async (code: string) => {
    if (fetchingAuth.current || usedCodes.current.includes(code)) return
    fetchingAuth.current = true
    usedCodes.current.push(code)
    try {
      await fetchAuthSignIn(code)
      const user = await fetchIdentity()
      Storage.set('--patreon-user-data', JSON.stringify(user))
      setState({ user })
    } catch (error: any) {
      console.log({ error })
      setState(s => ({ ...s, error }))
    } finally {
      fetchingAuth.current = false
    }
  }, [])

  useEffect(() => {
    setState(s => (s.error ? { ...s, error: undefined } : s))
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) {
      const user: UserData = userRef.current || JSON.parse(storedUser)
      setState({ user })

      const authCookie = getCookie(AuthCookieKey)
      const authData = authCookie ? (JSON.parse(authCookie) as AuthWithExpiration) : undefined
      const authExpiration = authData ? authData.expireDateTime : undefined

      const now = Date.now()
      const updatedAt = new Date(user.updatedAt).getTime()
      if (authExpiration && authExpiration - now > refreshTimeout) {
        refreshAuth()
      } else if (now - updatedAt > refreshTimeout) {
        updateUser()
      }
    }
  }, [path, refreshAuth, updateUser])

  return <PatreonContext.Provider value={{ state, actions: { logout, signIn } }}>{children}</PatreonContext.Provider>
}
