export const clientID = 'o1E-8WNlsQW2HCPxXlsNtQl_IkHwoX3BpXc5gvq_e0L-0ihs0SQdhWSTlt0zge0e'
export const clientSecret = 'qxjMD75ooFVMwW6TOPPuffPYbO3m_udYzL4hmPgZtEL3tUUkVhcRjgqP0xxGvgiN'
export const redirectUrl = 'https://graescence.vercel.app/patreon/auth/redirect'
const creatorAccessToken = '8OHit6xWIQQ6wFB-88S4Oehl3VM9bd6Hhzh9E9LVS6Q'
const creatorRefreshToken = '312Ttm1tXFw49eqkDwAyFAaFBewO3Mn5C1xUohnuUHI'

const graescenceCampaignId = '2708199'
const worldTier = '3580309'
const storyTier = '10126695'

type PatreonResource<Type extends string, Data, Relationships = {}> = {
  id: string
  type: Type
  attributes: Data
  relationships: Relationships
}

type Tier = PatreonResource<
  'tier',
  {
    amount_cents: number
    description: string
    url: string
    title: string
    published: boolean
  }
>

type Campaign = PatreonResource<
  'campaign',
  {
    summary: string | null
    is_monthly: boolean
    creation_name: string
    url: string
  }
>

type Member = PatreonResource<
  'member',
  {
    patron_status: 'active_patron' | 'former_patron'
    pledge_relationship_start: string
    last_charge_date: string
    last_charge_status: 'Paid' | 'UnPaid'
    pledge_cadence: number
  },
  {
    campaign: {
      data: {
        id: string
      }
    }
    currently_entitled_tiers: {
      data: [{ id: string }]
    }
  }
>

type User = PatreonResource<
  'user',
  {
    email?: string
    full_name: string
    about: string | null
    image_url: string | null
    thumb_url: string | null
  }
>

type PatreonIdentity = {
  data: User
  included: (Member | Campaign | Tier)[]
}

export type AuthData = {
  access_token: string
  refresh_token: string
  expires_in: string
  scope: string
  token_type: 'Bearer'
}

export type UserData = {
  id: string
  email?: string
  fullName: string
  patreonTier: 'free' | 'story' | 'world'
}

export const fetchAuthAndIdentity = async (code: string): Promise<{ authData: AuthData; userData: UserData }> => {
  const authUrl = constructAuthUrl(code)
  console.log({ code, authUrl })
  const result = await fetch(constructAuthUrl(code), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  const authData = await result.json()
  console.log({ authData })
  if (!isResultAuthData(authData)) throw authData
  const userData = await getUserIdentity(authData)

  return { authData, userData }
}

/** === Support Functions === */

const constructAuthUrl = (code: string) => {
  const url = new URL('https://www.patreon.com/api/oauth2/token')
  url.searchParams.set('code', code)
  url.searchParams.set('grant_type', 'authorization_code')
  url.searchParams.set('client_id', clientID)
  url.searchParams.set('client_secret', clientSecret)
  url.searchParams.set('redirect_uri', redirectUrl)
  return url.toString()
}

const identityURL = () => {
  const url = new URL('https://www.patreon.com/api/oauth2/v2/identity')
  url.searchParams.set('include', 'memberships.currently_entitled_tiers,memberships.campaign')
  url.searchParams.set('fields[campaign]', 'summary,is_monthly,creation_name,url')
  url.searchParams.set('fields[user]', 'full_name,email,image_url,thumb_url,about')
  url.searchParams.set(
    'fields[member]',
    'last_charge_status,patron_status,last_charge_date,pledge_relationship_start,pledge_cadence',
  )
  url.searchParams.set('fields[tier]', 'description,published,title,url,amount_cents')
  return url.toString()
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

const isResultIdentity = (data: unknown): data is PatreonIdentity => {
  if (typeof data !== 'object' || data === null) return false
  if (!('data' in data && 'included' in data)) return false
  if (!('type' in data && data.type === 'user')) return false
  if (!('included' in data && data.included instanceof Array)) return false
  return true
}

const getUserIdentity = async (auth: AuthData): Promise<UserData> => {
  const userResult = await fetch(identityURL(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  const data = await userResult.json()
  if (!isResultIdentity(data)) throw data

  return {
    id: data.data.id,
    email: data.data.attributes.email,
    fullName: data.data.attributes.full_name,
    patreonTier: getSubscriptionsTier(data.included),
  }
}

type StructuredData = {
  membershipByCampaign: {
    [campaignId: string]: Member
  }
}
const getSubscriptionsTier = (data: PatreonIdentity['included']): UserData['patreonTier'] => {
  const membership = data.find(
    d => d.type === 'member' && d.relationships.campaign.data.id === graescenceCampaignId,
  ) as Member | undefined
  if (!membership) return 'free'

  const tiers = membership.relationships.currently_entitled_tiers.data.map(d => d.id)
  if (tiers.includes(worldTier)) return 'world'
  if (tiers.includes(storyTier)) return 'story'

  return 'free'
}
