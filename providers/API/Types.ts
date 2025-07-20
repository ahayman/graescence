import { ProgressData, UserData } from '../../app/api/types'

export type State = {
  error?: { message: string; statusCode: number }
}

export type Actions = {
  refreshToken: () => Promise<void>
  fetchAuthSignIn: (code: string) => Promise<UserData>
  fetchIdentity: () => Promise<UserData>
  fetchProgress: (userId: string, sinceUpdate?: Date) => Promise<ProgressData>
  postProgress: (userId: string, progress: ProgressData['progressData'], sinceUpdate?: Date) => Promise<ProgressData>
}

export type Context = {
  state: State
  actions: Actions
}
