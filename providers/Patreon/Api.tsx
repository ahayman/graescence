export const clientID = 'o1E-8WNlsQW2HCPxXlsNtQl_IkHwoX3BpXc5gvq_e0L-0ihs0SQdhWSTlt0zge0e'
export const clientSecret = 'qxjMD75ooFVMwW6TOPPuffPYbO3m_udYzL4hmPgZtEL3tUUkVhcRjgqP0xxGvgiN'
export const redirectUrl = 'https://graescence.com/patreon/auth/redirect'
const creatorAccessToken = '8OHit6xWIQQ6wFB-88S4Oehl3VM9bd6Hhzh9E9LVS6Q'
const creatorRefreshToken = '312Ttm1tXFw49eqkDwAyFAaFBewO3Mn5C1xUohnuUHI'

export type AuthData = {
  access_token: string
  refresh_token: string
  expires_in: string
  scope: string
  token_type: 'Bearer'
}
