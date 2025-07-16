'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { fetchAuthSignIn, fetchIdentity } from './Api'
import { AuthCookieKey, AuthWithExpiration, SHARED_DATA_ENDPOINT, UserData } from '../../api/patreon/types'
import { getCookie, setCookie } from 'cookies-next/client'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn },
})

type Props = PropsWithChildren
type CachedData = { auth: AuthWithExpiration; user: UserData }

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})

  useEffect(() => {
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) setState({ user: JSON.parse(storedUser) })
    fetch(SHARED_DATA_ENDPOINT)
      .then(r => r.json())
      .then((data: CachedData | {}) => {
        if ('user' in data && (!storedUser || JSON.parse(storedUser).updatedTime < data.user.updatedTime)) {
          setState({ user: data.user })
        }
        if ('auth' in data) {
          const authCookie = getCookie(AuthCookieKey)
          if (authCookie) {
            const authData = JSON.parse(authCookie)
            if (authData.updatedAtTime < data.auth.updatedAtTime) {
              setCookie(AuthCookieKey, JSON.stringify(data.auth))
            }
          } else {
            setCookie(AuthCookieKey, JSON.stringify(data.auth))
          }
        }
      })
  }, [])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

  const signIn = useCallback(async (code: string) => {
    try {
      const auth = await fetchAuthSignIn(code)
      const user = await fetchIdentity()
      setState({ user })

      await fetch(SHARED_DATA_ENDPOINT, { method: 'POST', body: JSON.stringify({ auth, user }) })
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
    }
  }, [])

  return <PatreonContext.Provider value={{ state, actions: { logout, signIn } }}>{children}</PatreonContext.Provider>
}
