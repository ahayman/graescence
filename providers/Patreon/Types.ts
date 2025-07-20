import { UserData } from '../../app/api/types'

export type State = {
  user?: UserData | null
  error?: { message: string; isUnauthorized?: boolean }
}

export type Actions = {
  logout: () => void
  signIn: (code: string, installId?: string) => Promise<void>
}

export type Context = {
  state: State
  actions: Actions
}
