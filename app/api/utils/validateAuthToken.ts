import { refreshToken } from '../patreon/token/refresh/refreshToken'

export const validateAuthToken = async (
  authToken: string,
  authData: { accessToken: string; expiresAt: Date }[],
): Promise<void> => {
  const data = authData.find(d => d.accessToken === authToken)
  if (!data) {
    throw { message: 'Unauthorized', statusCode: 401 }
  }

  if (data.expiresAt < new Date()) {
    await refreshToken()
  }
}
