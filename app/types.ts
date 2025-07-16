import { AuthWithExpiration, UserData } from '../api/patreon/types'

type CachedData = { auth: AuthWithExpiration; user: UserData }

export type BroadCastMessage =
  | {
      type: 'update-patreon-data'
      data: CachedData
    }
  | {
      type: 'return-patreon-data'
      data: CachedData
    }
  | {
      type: 'get-patreon-data'
    }
