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

const constructAuthUrl = (code: string) => {
  const url = new URL('https://www.patreon.com/api/oauth2/token')
  url.searchParams.set('code', code)
  url.searchParams.set('grant_type', 'authorization_code')
  url.searchParams.set('client_id', clientID)
  url.searchParams.set('client_secret', clientSecret)
  url.searchParams.set('redirect_uri', redirectUrl)
  return url.toString()
}

const identityURL = () => {
  const url = new URL('https://www.patreon.com/api/oauth2/v2/identity')
  return url.toString()
}

const isResultAuthData = (data: unknown): data is AuthData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'access_token' in data &&
    'refresh_token' in data &&
    'expires_in' in data &&
    'token_type' in data &&
    'scope' in data
  )
}

const getUserIdentity = async (auth: AuthData) => {
  const userResult = await fetch(identityURL(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return await userResult.json()
}

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

  const handleRedirectCode = useCallback(async (code: string) => {
    try {
      const result = await fetch(constructAuthUrl(code), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      const authData = await result.json()
      if (!isResultAuthData(authData)) throw new Error(`Improper auth data object: ${authData}`)
      setAuth(authData)
      const user = await getUserIdentity(authData)
      setState({ user })
      console.log({ user })
    } catch (error: any) {
      console.log({ error })
      setState({ error })
    }
  }, [])

  return (
    <PatreonContext.Provider value={{ state, actions: { login, logout, handleRedirectCode } }}>
      {children}
    </PatreonContext.Provider>
  )
}
