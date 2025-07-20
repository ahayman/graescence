import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { AuthCookieKey, isServerError } from '../../types'
import { isResultAuthData } from './isResultAuthData'
import { convertErrorToResponse } from '../../utils/convertErrorToResponse'
import { getIdentityUser } from '../identity/getIdentity'

export const GET = async (request: Request) => {
  const requestUrl = new URL(request.url)
  const params = new URLSearchParams(requestUrl.searchParams)
  const code = params.get('code')
  console.log('Patreon token route called with code:', code)
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
    return new Response(JSON.stringify({ message: errorData.message || 'Failed to fetch token', error: errorData }), {
      headers: { 'Content-Type': 'application/json' },
      status: response.status,
    })
  }

  const authData = await response.json()
  if (!isResultAuthData(authData)) {
    return new Response(
      JSON.stringify({ message: authData.message || 'Invalid auth data received', error: authData }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }

  console.log({ authData })

  try {
    const user = await getIdentityUser(authData.access_token)
    const auth = user.authData.find(d => d.accessToken === authData.access_token)

    const cookieStore = await cookies()
    cookieStore.set(AuthCookieKey, authData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    await prisma.authData.upsert({
      where: { accessToken: auth?.accessToken },
      update: {
        accessToken: authData.access_token,
        refreshToken: authData.refresh_token,
        expiresAt: new Date(Date.now() + authData.expires_in * 1000),
      },
      create: {
        accessToken: authData.access_token,
        refreshToken: authData.refresh_token,
        expiresAt: new Date(Date.now() + authData.expires_in * 1000),
        userId: user.id,
      },
    })

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return convertErrorToResponse(error)
  }
}
