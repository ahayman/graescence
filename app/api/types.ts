export type PatreonAuthData = {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: 'Bearer'
}

export type ServerError = {
  message: string
  statusCode: number
  error?: Record<string, unknown>
}

export const isServerError = (data: unknown): data is ServerError => {
  if (!(typeof data === 'object' && data !== null)) return false
  if (!('message' in data && typeof data.message === 'string')) return false
  if ('error' in data && !(typeof data.error === 'object' && data.error !== null)) return false
  if (!('statusCode' in data && typeof data.statusCode === 'number')) return false
  return true
}

export const isError = (data: unknown): data is Error => {
  if (!(typeof data === 'object' && data !== null)) return false
  if (!('message' in data && typeof data.message === 'string')) return false
  return true
}

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

export type Member = PatreonResource<
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

export type PatreonIdentity = {
  data: User
  included?: (Member | Campaign | Tier)[]
}

export type AccessTier = 'free' | 'story' | 'world'

export type UserData = {
  id: string
  email?: string | null
  fullName: string
  tier: AccessTier
  updatedAt: string
}

export type ProgressDataItem = {
  id: string
  progress: number
  type: string
  updatedAt: string
}

export type ProgressData = {
  progressData: ProgressDataItem[]
}

export const AuthCookieKey = '--patreon-auth-token'

export const SHARED_DATA_ENDPOINT = '/shared-data'
