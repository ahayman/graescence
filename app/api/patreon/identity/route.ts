import { getIdentityUser } from './getIdentity'
import { convertErrorToResponse } from '../../utils/convertErrorToResponse'

export const GET = async () => {
  try {
    const user = await getIdentityUser()

    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return convertErrorToResponse(error)
  }
}
