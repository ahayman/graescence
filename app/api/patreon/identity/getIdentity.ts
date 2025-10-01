import { AccessTier, AuthCookieKey, Member, PatreonIdentity } from '../../types'
import prisma from '../../../../lib/prisma'
import { Prisma, User, AuthData } from '../../../../lib/generated/prisma/client'
import { cookies } from 'next/headers'

type UserResponse = User & {
  authData: AuthData[]
}

export const getIdentityUser = async (accessToken?: string): Promise<UserResponse> => {
  if (!accessToken) {
    const cookieStore = await cookies()
    accessToken = cookieStore.get(AuthCookieKey)?.value
  }
  if (!accessToken) {
    throw { message: 'Unauthorized', statusCode: 401 }
  }

  const url = new URL('https://www.patreon.com/api/oauth2/v2/identity')
  url.searchParams.set('include', 'memberships.currently_entitled_tiers,memberships.campaign')
  url.searchParams.set('fields[campaign]', 'summary,is_monthly,creation_name,url')
  url.searchParams.set('fields[user]', 'full_name,email,image_url,thumb_url,about')
  url.searchParams.set(
    'fields[member]',
    'last_charge_status,patron_status,last_charge_date,pledge_relationship_start,pledge_cadence',
  )
  url.searchParams.set('fields[tier]', 'description,published,title,url,amount_cents')

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw { message: 'Failed to fetch identity', error: errorData, status: response.status }
  }

  const data = await response.json()
  if (!isResultIdentity(data)) throw { message: 'Invalid identity response', data, statusCode: 500 }

  const userData: Prisma.UserCreateInput = {
    id: data.data.id,
    email: data.data.attributes.email,
    fullName: data.data.attributes.full_name,
    tier: getSubscriptionsTier(data),
    updatedAt: new Date(),
  }

  try {
    return await prisma.user.upsert({
      where: { id: userData.id },
      update: userData,
      create: userData,
      include: { authData: true },
    })
  } catch (error: any) {
    throw { message: 'Failed to upsert user', error, statusCode: 500 }
  }
}

const freeUserEmails = ['apoetsanon@gmail.com', 'switz2001@gmail.com']
const campaignId = '6296047' // https://www.patreon.com/6296047/join
const worldTier = '24500193' // https://www.patreon.com/checkout/apoetsanon?rid=24500193&vanity=6296047
const storyTier = '6799500' // https://www.patreon.com/checkout/apoetsanon?rid=6799500&vanity=6296047
const niceTier = '24500193' //https://www.patreon.com/checkout/apoetsanon?rid=24500193&vanity=6296047
const insaneTier = '24500294' // https://www.patreon.com/checkout/apoetsanon?rid=24500294&vanity=6296047

const isResultIdentity = (data: unknown): data is PatreonIdentity => {
  if (!(typeof data === 'object' && data !== null)) return false
  if (!('data' in data && typeof data.data === 'object' && data.data !== null && 'included' in data)) return false
  if (!('type' in data.data && data.data.type === 'user')) return false
  if (!('included' in data && data.included instanceof Array)) return false
  return true
}

const getSubscriptionsTier = (user: PatreonIdentity): AccessTier => {
  if (user.data.attributes.email && freeUserEmails.includes(user.data.attributes.email)) return 'world'
  const membership = user.included.find(d => d.type === 'member' && d.relationships.campaign.data.id === campaignId) as
    | Member
    | undefined
  if (!membership) return 'free'

  const tiers = membership.relationships.currently_entitled_tiers.data.map(d => d.id)
  if (tiers.includes(worldTier)) return 'world'
  if (tiers.includes(niceTier)) return 'world'
  if (tiers.includes(insaneTier)) return 'world'
  if (tiers.includes(storyTier)) return 'story'

  return 'free'
}
