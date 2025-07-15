'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { AuthData, clientID, clientSecret, redirectUrl, UserData } from './Api'
import { Global, Storage } from '../../lib/globals'
import { json } from 'stream/consumers'
import { setupFsCheck } from 'next/dist/server/lib/router-utils/filesystem'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, handleAuth: emptyFn },
})

type Props = PropsWithChildren

type CalculatedAuth = AuthData & {
  expireDate: number
}

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [auth, setAuth] = useState<CalculatedAuth>()
  const [state, setState] = useState<State>({})

  useEffect(() => {}, [])

  useEffect(() => {
    const auth = Storage.get('--patreon-auth-data')
    if (auth) setAuth(JSON.parse(auth))

    const user = Storage.get('--patreon-user-data')
    if (user) setState({ user: JSON.parse(user) })
  }, [])

  const logout = useCallback(() => {
    setAuth(undefined)
    setState({})
    Storage.set('--patreon-auth-data')
    Storage.set('--patreon-user-data')
  }, [])

  const handleAuth = useCallback((auth: AuthData, user: UserData) => {
    const now = new Date()
    const expireDate = now.getTime() + auth.expires_in * 1000
    const authData = { ...auth, expireDate }
    setAuth(authData)
    setState({ user })
    Storage.set('--patreon-auth-data', JSON.stringify(authData))
    Storage.set('--patreon-user-data', JSON.stringify(user))
  }, [])

  return (
    <PatreonContext.Provider value={{ state, actions: { logout, handleAuth } }}>{children}</PatreonContext.Provider>
  )
}
