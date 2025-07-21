import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { AuthCookieKey, ProgressData } from '../../types'
import { validateAuthToken } from '../../utils/validateAuthToken'
import { convertErrorToResponse } from '../../utils/convertErrorToResponse'

export type Params = {
  params: Promise<{ userId: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params
  const url = new URL(request.url)
  const sinceUpdateParam = url.searchParams.get('sinceUpdate')
  const sinceUpdate = sinceUpdateParam ? new Date(sinceUpdateParam) : null
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AuthCookieKey)?.value
  if (!authCookie) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }
  if (sinceUpdate && isNaN(sinceUpdate.getTime())) {
    return new Response(JSON.stringify({ message: 'Invalid sinceUpdate date' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  const where = sinceUpdate ? { where: { updatedAt: { gte: sinceUpdate } } } : {}
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      progress: {
        select: {
          id: true,
          type: true,
          progress: true,
          updatedAt: true,
        },
        ...where,
      },
      authData: {
        select: {
          accessToken: true,
          expiresAt: true,
        },
      },
    },
  })

  if (!user) {
    return new Response(JSON.stringify({ message: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    })
  }

  if (user.tier === 'free') {
    return new Response(JSON.stringify({ message: 'User is on free tier' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403,
    })
  }

  try {
    await validateAuthToken(authCookie, user.authData)
  } catch (error) {
    return convertErrorToResponse(error, 'GET /api/progress/[userId]')
  }

  const progressData: ProgressData['progressData'] = user.progress.map(item => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }))

  return new Response(JSON.stringify({ progressData }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

export const POST = async (request: Request, { params }: Params) => {
  const { userId } = await params

  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AuthCookieKey)?.value
  if (!authCookie) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  const url = new URL(request.url)
  const sinceUpdateParam = url.searchParams.get('sinceUpdate')

  const sinceUpdate = sinceUpdateParam ? new Date(sinceUpdateParam) : null

  const body = await request.json()
  console.log('Progress POST called with: ', JSON.stringify({ userId, sinceUpdateParam, body }, null, 2))
  if (!isProgressData(body)) {
    return new Response(JSON.stringify({ message: 'Invalid progress data format' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
  const { progressData } = body

  const progressIds = progressData.map(item => item.id)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      progress: {
        select: {
          id: true,
          type: true,
          progress: true,
          updatedAt: true,
        },
        where: {
          OR: [{ id: { in: progressIds } }, { updatedAt: sinceUpdate ? { gte: sinceUpdate } : undefined }],
        },
      },
      authData: {
        select: {
          accessToken: true,
          expiresAt: true,
        },
      },
    },
  })

  if (!user) {
    return new Response(JSON.stringify({ message: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    })
  }

  try {
    await validateAuthToken(authCookie, user.authData)
  } catch (error) {
    return convertErrorToResponse(error, 'POST /api/progress/[userId]')
  }

  if (user.tier === 'free') {
    return new Response(JSON.stringify({ message: 'User is on free tier' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403,
    })
  }

  await prisma.$transaction(
    progressData.map(item =>
      prisma.readingProgress.upsert({
        where: { userId: userId, id: item.id },
        update: {
          progress: item.progress,
          updatedAt: item.updatedAt,
        },
        create: {
          userId,
          type: item.type,
          id: item.id,
          progress: item.progress,
          updatedAt: item.updatedAt,
        },
      }),
    ),
  )

  const updatedIds = progressData.map(item => item.id)
  const updatedSince = user.progress.filter(item => !updatedIds.includes(item.id))

  return new Response(JSON.stringify({ progressData: updatedSince }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

const isProgressData = (data: unknown): data is ProgressData => {
  if (!(typeof data === 'object' && data !== null)) {
    console.error('Invalid progress data format:', data)
    return false
  }
  if (!('progressData' in data && Array.isArray(data.progressData))) {
    console.error('Invalid progress data format:', data)
    return false
  }

  return data.progressData.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) {
      console.error('Invalid progress item format:', item)
      return false
    }
    if (!('id' in item)) {
      console.error('Missing id in progress item format:', item)
      return false
    }
    if (!('progress' in item)) {
      console.error('Missing progress in progress item format:', item)
      return false
    }
    if (!('type' in item)) {
      console.error('Missing type in progress item format:', item)
      return false
    }
    if (!('updatedAt' in item)) {
      console.error('Missing updatedAt in progress item format:', item)
      return false
    }
    if (typeof item.id !== 'string' || typeof item.type !== 'string' || typeof item.updatedAt !== 'string') {
      console.error('Invalid string field in progress item format:', item)
      return false
    }
    if (typeof item.progress !== 'number') {
      console.error('Invalid progress field type in progress item format:', item)
      return false
    }
    // Ensure updatedAt is a valid date string
    const date = new Date(item.updatedAt)
    if (isNaN(date.getTime())) {
      console.error('Invalid updatedAt field type in progress item format:', item)
      return false
    }
    return (
      'id' in item &&
      'progress' in item &&
      'type' in item &&
      'updatedAt' in item &&
      typeof item.id === 'string' &&
      typeof item.progress === 'number' &&
      typeof item.type === 'string' &&
      typeof item.updatedAt === 'string'
    )
  })
}
