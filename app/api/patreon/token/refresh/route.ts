import { refreshToken } from './refreshToken'
import { convertErrorToResponse } from '../../../utils/convertErrorToResponse'

export const GET = async () => {
  try {
    await refreshToken()
    return new Response('Success', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return convertErrorToResponse(error)
  }
}
