'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { fetchAuthSignIn, fetchIdentity } from './Api'
import { AuthCookieKey, AuthWithExpiration, SHARED_DATA_ENDPOINT, UserData } from '../../app/api/patreon/types'
import { getCookie, setCookie } from 'cookies-next/client'
import { BroadCastMessage, SW_BroadcastChannel } from '../../app/types'
import { usePathname } from 'next/navigation'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn },
})

type Props = PropsWithChildren

const channel = new BroadcastChannel(SW_BroadcastChannel)

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})
  const path = usePathname()

  useEffect(() => {
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) setState({ user: JSON.parse(storedUser) })
    channel.onmessage = (event: MessageEvent<BroadCastMessage>) => {
      console.log(`Provider Message Received: `, event.data)
      if (event.data.type === 'return-patreon-data') {
        const data = event.data.data
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
      }
    }
    channel.postMessage({ type: 'get-patreon-data' })
    return () => {
      channel.close()
    }
  }, [])

  useEffect(() => {
    channel.postMessage({ type: 'get-patreon-data' })
  }, [path])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

  const signIn = useCallback(async (code: string) => {
    try {
      const auth = await fetchAuthSignIn(code)
      const user = await fetchIdentity()
      setState({ user })

      channel.postMessage({ type: 'update-patreon-data', data: { auth, user } })
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
    }
  }, [])

  return <PatreonContext.Provider value={{ state, actions: { logout, signIn } }}>{children}</PatreonContext.Provider>
}
