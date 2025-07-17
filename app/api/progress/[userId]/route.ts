import prisma from '../../../../lib/prisma'
import { ProgressData, ProgressDataItem } from '../../types'

export type Params = {
  params: Promise<{ userId: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params
  const url = new URL(request.url)
  const sinceUpdateParam = url.searchParams.get('sinceUpdate')
  const sinceUpdate = sinceUpdateParam ? new Date(sinceUpdateParam) : null
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

  const url = new URL(request.url)
  const sinceUpdateParam = url.searchParams.get('sinceUpdate')

  const sinceUpdate = sinceUpdateParam ? new Date(sinceUpdateParam) : null

  const body = await request.json()
  console.log('Progress POST called with', { userId, sinceUpdateParam, body })
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

  const existingProgressIds = user.progress.map(item => item.id)

  const updates: ProgressDataItem[] = []
  const newItems: ProgressDataItem[] = []

  for (const item of progressData) {
    if (existingProgressIds.includes(item.id)) {
      updates.push(item)
    } else {
      newItems.push(item)
    }
  }

  await prisma.$transaction([
    prisma.readingProgress.updateMany({
      where: {
        userId,
        id: { in: updates.map(item => item.id) },
      },
      data: updates.map(item => ({
        progress: item.progress,
        updatedAt: item.updatedAt,
      })),
    }),
    prisma.readingProgress.createMany({
      data: newItems.map(item => ({
        userId,
        type: item.type,
        id: item.id,
        progress: item.progress,
        updatedAt: item.updatedAt,
      })),
    }),
  ])

  const updatedIds = [...updates, ...newItems].map(item => item.id)

  const updatedSince = user.progress.filter(item => !updatedIds.includes(item.id))

  return new Response(JSON.stringify({ progressData: updatedSince }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

const isProgressData = (data: unknown): data is ProgressData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'progressData' in data &&
    Array.isArray(data.progressData) &&
    data.progressData.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'progress' in item &&
        'type' in item &&
        'updatedAt' in item &&
        typeof item.id === 'string' &&
        typeof item.progress === 'number' &&
        typeof item.type === 'string' &&
        typeof item.updatedAt === 'string',
    )
  )
}
