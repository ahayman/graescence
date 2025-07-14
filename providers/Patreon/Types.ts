import { UserData } from './Api'

export type State = {
  user?: UserData
  error?: { message: string }
}

export type Actions = {
  login: () => void
  logout: () => void
  handleRedirectCode: (code: string) => Promise<void>
}

export type Context = {
  state: State
  actions: Actions
}
