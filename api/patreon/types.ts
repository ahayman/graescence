export type AuthData = {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: 'Bearer'
}

export type AuthWithExpiration = AuthData & {
  expireDate: number
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
  included: (Member | Campaign | Tier)[]
}

export type AccessTier = 'free' | 'story' | 'world'

export type UserData = {
  id: string
  email?: string
  fullName: string
  patreonTier: AccessTier
  updatedAt: string
}
