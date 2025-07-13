export type State = {
  user?: {
    loginState: 'loggingIn' | 'needsLogin' | boolean
    patreonTier?: 'free' | 'story' | 'world'
  }
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
