'use client'
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Context, State } from './Types'
import { Storage } from '../../lib/globals'
import { usePathname } from 'next/navigation'
import { UserData } from '../../app/api/types'
import { ApiContext } from '../API/Provider'

const emptyFn = async () => undefined
export const PatreonContext = createContext<Context>({
  state: {},
  actions: { logout: emptyFn, signIn: emptyFn },
})

type Props = PropsWithChildren

const refreshTimeout = 1000 * 60 * 60 * 24 * 7 // 1 Week

export const PatreonProvider: FunctionComponent<Props> = ({ children }) => {
  const [state, setState] = useState<State>({})
  const {
    state: { error: apiError },
    actions: { fetchIdentity, fetchAuthSignIn },
  } = useContext(ApiContext)
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
  }, [fetchIdentity])

  const logout = useCallback(() => {
    setState({})
    Storage.set('--patreon-user-data')
  }, [])

  const signIn = useCallback(
    async (code: string) => {
      if (fetchingAuth.current || usedCodes.current.includes(code)) return
      fetchingAuth.current = true
      usedCodes.current.push(code)
      try {
        const user = await fetchAuthSignIn(code)
        Storage.set('--patreon-user-data', JSON.stringify(user))
        setState({ user })
      } catch (error: any) {
        console.log({ error })
        setState(s => ({ ...s, error }))
      } finally {
        fetchingAuth.current = false
      }
    },
    [fetchAuthSignIn],
  )

  useEffect(() => {
    setState(s => (s.error && (!s.error.isUnauthorized || path === '/patreon/') ? { ...s, error: undefined } : s))
    const storedUser = Storage.get('--patreon-user-data')
    if (storedUser) {
      const user: UserData = userRef.current || JSON.parse(storedUser)
      setState(s => ({ ...s, user }))

      const now = Date.now()
      const updatedAt = new Date(user.updatedAt).getTime()
      if (now - updatedAt > refreshTimeout) {
        updateUser()
      }
    }
  }, [path, updateUser])

  useEffect(
    function checkForUnauthorized() {
      if (apiError?.statusCode === 401) {
        Storage.set('--patreon-user-data')
        setState({ error: { message: 'Authentication has expired.', isUnauthorized: true } })
      }
    },
    [apiError],
  )

  return <PatreonContext.Provider value={{ state, actions: { logout, signIn } }}>{children}</PatreonContext.Provider>
}
