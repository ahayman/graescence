'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { fetchAuthSignIn, fetchIdentity } from './Api'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn },
})

type Props = PropsWithChildren

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})

  useEffect(() => {}, [])

  useEffect(() => {
    const user = Storage.get('--patreon-user-data')
    if (user) setState({ user: JSON.parse(user) })
  }, [])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

  const signIn = useCallback(async (code: string) => {
    try {
      await fetchAuthSignIn(code)
      const user = await fetchIdentity()
      setState({ user })
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
    }
  }, [])

  return <PatreonContext.Provider value={{ state, actions: { logout, signIn } }}>{children}</PatreonContext.Provider>
}
