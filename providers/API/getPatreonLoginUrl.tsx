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
