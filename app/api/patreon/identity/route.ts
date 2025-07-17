import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { AccessTier, AuthCookieKey, Member, PatreonIdentity, UserData } from '../../types'
import { Prisma } from '../../../../lib/generated/prisma'

export const GET = async () => {
  const url = new URL('https://www.patreon.com/api/oauth2/v2/identity')
  url.searchParams.set('include', 'memberships.currently_entitled_tiers,memberships.campaign')
  url.searchParams.set('fields[campaign]', 'summary,is_monthly,creation_name,url')
  url.searchParams.set('fields[user]', 'full_name,email,image_url,thumb_url,about')
  url.searchParams.set(
    'fields[member]',
    'last_charge_status,patron_status,last_charge_date,pledge_relationship_start,pledge_cadence',
  )
  url.searchParams.set('fields[tier]', 'description,published,title,url,amount_cents')

  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AuthCookieKey)
  if (!authCookie) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  const authData = JSON.parse(authCookie.value)
  if (!authData.access_token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return new Response(JSON.stringify({ message: 'Failed to fetch identity', error: errorData }), {
      headers: { 'Content-Type': 'application/json' },
      status: response.status,
    })
  }

  const data = await response.json()
  if (!isResultIdentity(data)) throw data

  const userData: Prisma.UserCreateInput = {
    id: data.data.id,
    email: data.data.attributes.email,
    fullName: data.data.attributes.full_name,
    tier: getSubscriptionsTier(data.included),
    updatedAt: new Date(),
  }

  const user = await prisma.user.upsert({
    where: { id: userData.id },
    update: userData,
    create: userData,
  })

  return new Response(JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

const campaignId = '2708199'
const worldTier = '3580309'
const storyTier = '10126695'

const isResultIdentity = (data: unknown): data is PatreonIdentity => {
  if (!(typeof data === 'object' && data !== null)) return false
  if (!('data' in data && typeof data.data === 'object' && data.data !== null && 'included' in data)) return false
  if (!('type' in data.data && data.data.type === 'user')) return false
  if (!('included' in data && data.included instanceof Array)) return false
  return true
}

const getSubscriptionsTier = (data: PatreonIdentity['included']): AccessTier => {
  const membership = data.find(d => d.type === 'member' && d.relationships.campaign.data.id === campaignId) as
    | Member
    | undefined
  if (!membership) return 'free'

  const tiers = membership.relationships.currently_entitled_tiers.data.map(d => d.id)
  if (tiers.includes(worldTier)) return 'world'
  if (tiers.includes(storyTier)) return 'story'

  return 'free'
}
