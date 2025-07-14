export const clientID = 'o1E-8WNlsQW2HCPxXlsNtQl_IkHwoX3BpXc5gvq_e0L-0ihs0SQdhWSTlt0zge0e'
export const clientSecret = 'qxjMD75ooFVMwW6TOPPuffPYbO3m_udYzL4hmPgZtEL3tUUkVhcRjgqP0xxGvgiN'
export const redirectUrl = 'https://graescence.vercel.app/patreon/auth/redirect'
const creatorAccessToken = '8OHit6xWIQQ6wFB-88S4Oehl3VM9bd6Hhzh9E9LVS6Q'
const creatorRefreshToken = '312Ttm1tXFw49eqkDwAyFAaFBewO3Mn5C1xUohnuUHI'

export type AuthData = {
  access_token: string
  refresh_token: string
  expires_in: string
  scope: string
  token_type: 'Bearer'
}

export type UserData = {
  id: string
  patreonTier: 'free' | 'story' | 'world'
}

export const fetchAuthAndIdentity = async (code: string): Promise<{ authData: AuthData; userData: UserData }> => {
  const authUrl = constructAuthUrl(code)
  console.log({ code, authUrl })
  const result = await fetch(constructAuthUrl(code), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  const authData = await result.json()
  console.log({ authData })
  if (!isResultAuthData(authData)) throw authData
  const userData = await getUserIdentity(authData)
  console.log({ authData, userData })
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
  url.searchParams.set('fields[user]', 'full_name,email')
  url.searchParams.set(
    'fields[member]',
    'currently_entitled_amount_cents,lifetime_support_cents,campaign_lifetime_support_cents,last_charge_status,patron_status,last_charge_date,pledge_relationship_start,pledge_cadence',
  )
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

const getUserIdentity = async (auth: AuthData) => {
  const userResult = await fetch(identityURL(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return await userResult.json()
}
