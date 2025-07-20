import { PatreonAuthData } from '../../types'

export const isResultAuthData = (data: unknown): data is PatreonAuthData => {
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
