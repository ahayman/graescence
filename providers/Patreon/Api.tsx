import { AuthWithExpiration, ProgressData, ProgressDataItem, UserData } from '../../app/api/types'

export type PatreonLoginState = {
  redirectUrl: string
  installId?: string
}

export const getPatreonLoginUrl = (path: string) => {
  return `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${
    process.env.NEXT_PUBLIC_PATREON_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_PATREON_REDIRECT_URL ?? '')}&state=${encodeURIComponent(
    path,
  )}`
}

export const fetchAuthSignIn = async (code: string, installId?: string): Promise<AuthWithExpiration> => {
  const url = new URL('https://graescence.com/api/patreon/token')
  url.searchParams.set('code', code)
  if (installId) url.searchParams.set('installId', installId)
  const result = await fetch(url.toString())
  if (!result.ok) throw await result.json()

  return await result.json()
}

export const refreshToken = async (): Promise<AuthWithExpiration> => {
  const result = await fetch('https://graescence.com/api/patreon/token/refresh')
  if (!result.ok) throw await result.json()

  return await result.json()
}

export const fetchIdentity = async (): Promise<UserData> => {
  const result = await fetch('https://graescence.com/api/patreon/identity')
  if (!result.ok) throw await result.json()
  return await result.json()
}

export const fetchInstallData = async (installId: string): Promise<boolean> => {
  return (await fetch(`https://graescence.com/api/install/${installId}`)).ok
}

export const fetchProgress = async (userId: string, sinceUpdate?: Date): Promise<ProgressData> => {
  const url = new URL(`https://graescence.com/api/progress/${userId}`)
  if (sinceUpdate) url.searchParams.set('sinceUpdate', sinceUpdate.toISOString())
  const result = await fetch(url.toString())
  if (!result.ok) throw await result.json()
  return await result.json()
}

export const postProgress = async (
  userId: string,
  progress: ProgressDataItem[],
  sinceUpdate?: Date,
): Promise<ProgressData> => {
  const progressData: ProgressData = {
    progressData: progress,
  }
  const url = new URL(`https://graescence.com/api/progress/${userId}`)
  if (sinceUpdate) url.searchParams.set('sinceUpdate', sinceUpdate.toISOString())

  const result = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progressData),
    method: 'POST',
  })
  if (!result.ok) throw await result.json()
  return await result.json()
}
