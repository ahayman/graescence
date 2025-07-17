import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { AuthCookieKey } from '../../types'

export type Params = {
  params: Promise<{ installId: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { installId } = await params
  const auth = await prisma.installation.findUnique({
    where: { id: installId },
    select: { authData: true },
  })

  if (!auth?.authData) {
    return new Response(JSON.stringify({ message: 'Installation not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    })
  }

  if (auth) {
    await prisma.installation.delete({
      where: { id: installId },
    })
  }

  const cookieStore = await cookies()
  cookieStore.set(AuthCookieKey, JSON.stringify(auth), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
}
