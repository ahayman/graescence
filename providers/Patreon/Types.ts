import { AuthData, UserData } from './Api'

export type State = {
  user?: UserData
  error?: { message: string }
}

export type Actions = {
  logout: () => void
  handleAuth: (auth: AuthData, user: UserData) => void
}

export type Context = {
  state: State
  actions: Actions
}
