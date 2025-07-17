import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { AuthCookieKey, AuthData, AuthWithExpiration } from '../../types'

export const GET = async (request: Request) => {
  const requestUrl = new URL(request.url)
  const params = new URLSearchParams(requestUrl.searchParams)
  const code = params.get('code')
  const installId = params.get('installId')
  if (!code) {
    return new Response(JSON.stringify({ message: 'Code parameter is missing' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  const url = new URL('https://www.patreon.com/api/oauth2/token')
  url.searchParams.set('code', code)
  url.searchParams.set('grant_type', 'authorization_code')
  url.searchParams.set('client_id', process.env.NEXT_PUBLIC_PATREON_CLIENT_ID || '')
  url.searchParams.set('client_secret', process.env.PATREON_CLIENT_SECRET || '')
  url.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_PATREON_REDIRECT_URL || '')

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

  if (installId) {
    await prisma.installation.upsert({
      where: { id: installId },
      update: { authData: JSON.stringify(authData) },
      create: {
        id: installId,
        authData: JSON.stringify(authData),
      },
    })
  }

  const now = Date.now()
  const expireDateTime = now + authData.expires_in * 1000
  const auth: AuthWithExpiration = {
    ...authData,
    expireDateTime,
    updatedAtTime: now,
  }

  const cookieStore = await cookies()
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
