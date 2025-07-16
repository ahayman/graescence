import { AuthWithExpiration, UserData } from '../../api/patreon/types'

export const getPatreonLoginUrl = (path: string) => `https://www.patreon.com/oauth2/authorize?
response_type=code
&client_id=${process.env.NEXT_PUBLIC_PATREON_CLIENT_ID}
&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_PATREON_REDIRECT_URL ?? '')}
&state=${encodeURIComponent(path)}`

export const fetchAuthSignIn = async (code: string): Promise<AuthWithExpiration> => {
  const url = new URL('https://graescence.com/api/patreon/token')
  url.searchParams.set('code', code)
  const authUrl = url.toString()

  const result = await fetch(authUrl)
  if (!result.ok) throw new Error(await result.text())

  return await result.json()
}

export const fetchIdentity = async (): Promise<UserData> => {
  const result = await fetch('https://graescence.com/api/patreon/identity')
  if (!result.ok) throw new Error(await result.text())
  return await result.json()
}
