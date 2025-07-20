import { cookies } from 'next/headers'
import { AuthCookieKey } from '../../../types'
import { isResultAuthData } from '../isResultAuthData'
import prisma from '../../../../../lib/prisma'

export const refreshToken = async (): Promise<void> => {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AuthCookieKey)?.value
  const authData = authCookie
    ? await prisma.authData.findUnique({
        where: { accessToken: authCookie },
      })
    : null

  if (!authCookie || !authData) {
    throw { message: 'Unauthorized', statusCode: 401 }
  }

  const url = new URL('https://www.patreon.com/api/oauth2/token')
  url.searchParams.set('refresh_token', authData.refreshToken)
  url.searchParams.set('grant_type', 'refresh_token')
  url.searchParams.set('client_id', process.env.NEXT_PUBLIC_PATREON_CLIENT_ID || '')
  url.searchParams.set('client_secret', process.env.PATREON_CLIENT_SECRET || '')

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw { message: errorData.message || 'Failed to fetch token', error: errorData, statusCode: response.status }
  }
  const patreonAuthData = await response.json()

  if (!isResultAuthData(authData)) {
    throw { message: patreonAuthData.message || 'Invalid auth data received', error: authData, statusCode: 500 }
  }

  await prisma.$transaction([
    prisma.authData.delete({ where: { accessToken: authData.accessToken } }),
    prisma.authData.create({
      data: {
        accessToken: patreonAuthData.access_token,
        refreshToken: patreonAuthData.refresh_token,
        expiresAt: new Date(Date.now() + patreonAuthData.expires_in * 1000),
        userId: authData.userId,
      },
    }),
  ])

  cookieStore.set(AuthCookieKey, patreonAuthData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}
