import { cookies } from 'next/headers'
import { AuthWithExpiration, AuthCookieKey } from '../../../types'
import { isResultAuthData } from '../isResultAuthData'

export const GET = async (request: Request) => {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AuthCookieKey)
  if (!authCookie) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  const authCookieData: AuthWithExpiration = JSON.parse(authCookie.value)
  if (!authCookieData.refresh_token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  const url = new URL('https://www.patreon.com/api/oauth2/token')
  url.searchParams.set('refresh_token', authCookieData.refresh_token)
  url.searchParams.set('grant_type', 'refresh_token')
  url.searchParams.set('client_id', process.env.NEXT_PUBLIC_PATREON_CLIENT_ID || '')
  url.searchParams.set('client_secret', process.env.PATREON_CLIENT_SECRET || '')

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return new Response(JSON.stringify({ message: 'Failed to fetch token', error: errorData }), {
      headers: { 'Content-Type': 'application/json' },
      status: response.status,
    })
  }

  const authData = await response.json()
  if (!isResultAuthData(authData)) {
    return new Response(JSON.stringify({ message: 'Invalid auth data received', error: authData }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const now = Date.now()
  const expireDateTime = now + authData.expires_in * 1000
  const auth: AuthWithExpiration = {
    ...authData,
    expireDateTime,
    updatedAtTime: now,
  }

  cookieStore.set(AuthCookieKey, JSON.stringify(auth), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  return new Response(JSON.stringify(auth), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
