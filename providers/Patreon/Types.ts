import { UserData } from '../../app/api/types'

export type State = {
  user?: UserData
  error?: { message: string }
}

export type Actions = {
  logout: () => void
  signIn: (code: string, installId?: string) => Promise<void>
}

export type Context = {
  state: State
  actions: Actions
}
