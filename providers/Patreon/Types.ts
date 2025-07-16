import { UserData } from '../../api/patreon/types'

export type State = {
  user?: UserData
  error?: { message: string }
}

export type Actions = {
  logout: () => void
  signIn: (code: string) => Promise<void>
}

export type Context = {
  state: State
  actions: Actions
}
