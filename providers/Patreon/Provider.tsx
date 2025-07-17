'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { fetchAuthSignIn, fetchIdentity, fetchInstallData } from './Api'
import { usePathname } from 'next/navigation'
import { useInstallId } from '../../hooks/useInstallId'
import { AuthCookieKey } from '../../app/api/types'
import { getCookie } from 'cookies-next/client'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn, needsInstallAuth: emptyFn },
})

type Props = PropsWithChildren

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})
  const [_needsInstallAuth, setNeedsInstallAuth] = useState(false)
  const installId = useInstallId()
  const path = usePathname()

  const checkInstallAuth = useCallback(() => {
    const authCookie = getCookie(AuthCookieKey)
    if (authCookie) setNeedsInstallAuth(false)
    else
      fetchInstallData(installId).then(auth => {
        if (auth) setNeedsInstallAuth(false)
      })
  }, [installId])

  useEffect(() => {
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) setState({ user: JSON.parse(storedUser) })
  }, [])

  useEffect(() => {
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) setState(state => ({ user: state.user || JSON.parse(storedUser) }))
    if (_needsInstallAuth) checkInstallAuth()
  }, [_needsInstallAuth, checkInstallAuth, path])

  useEffect(() => {
    if (_needsInstallAuth) {
      document.addEventListener('visibilitychange', checkInstallAuth)
      return () => {
        document.removeEventListener('visibilitychange', checkInstallAuth)
      }
    }
  }, [_needsInstallAuth, checkInstallAuth])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

  const needsInstallAuth = useCallback(() => setNeedsInstallAuth(true), [])

  const signIn = useCallback(async (code: string) => {
    try {
      await fetchAuthSignIn(code)
      const user = await fetchIdentity()
      Storage.set('--patreon-user-data', JSON.stringify(user))
      setState({ user })
    } catch (error: any) {
      console.log({ error })
      setState(s => ({ ...s, error: error.message }))
    }
  }, [])

  return (
    <PatreonContext.Provider value={{ state, actions: { logout, signIn, needsInstallAuth } }}>
      {children}
    </PatreonContext.Provider>
  )
}
