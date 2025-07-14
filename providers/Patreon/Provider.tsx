'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { AuthData, clientID, clientSecret, redirectUrl } from './Api'
import { Global, Storage } from '../../lib/globals'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { login: emptyFn, logout: emptyFn, handleRedirectCode: emptyFn },
})

type Props = PropsWithChildren

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [auth, setAuth] = useState<AuthData>()
  const [state, setState] = useState<State>({})

  useEffect(() => {}, [])

  useEffect(() => {
    if (auth) {
      Storage.set('--patreon-auth-data', JSON.stringify(auth))
    }
  }, [auth])

  const login = useCallback(() => {}, [])

  const logout = useCallback(() => {}, [])

  const handleRedirectCode = useCallback(async (code: string) => {}, [])

  return (
    <PatreonContext.Provider value={{ state, actions: { login, logout, handleRedirectCode } }}>
      {children}
    </PatreonContext.Provider>
  )
}
