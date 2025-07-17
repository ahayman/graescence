'use client'
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { fetchAuthSignIn, fetchIdentity } from './Api'
import { usePathname } from 'next/navigation'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn },
})

type Props = PropsWithChildren

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})
  const path = usePathname()

  useEffect(() => {
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) setState({ user: JSON.parse(storedUser) })
  }, [])

  useEffect(() => {
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) setState(state => ({ user: state.user || JSON.parse(storedUser) }))
  }, [path])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

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

  return <PatreonContext.Provider value={{ state, actions: { logout, signIn } }}>{children}</PatreonContext.Provider>
}
